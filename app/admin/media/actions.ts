// app/admin/media/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation'; // อาจจะไม่จำเป็นต้องใช้ redirect จากทุก action โดยตรง
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'productimages'; // ชื่อ Bucket ของคุณ

// Type สำหรับ Action Response (ควรจะมาจากไฟล์ types กลาง)
export type MediaActionResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  uploadedFiles?: { name: string; url: string; path: string }[];
};

export type MediaItem = {
  id: string; // UUID
  storage_bucket_id: string;
  storage_object_path: string;
  alt_text: string | null;
  title: string | null;
  caption: string | null;
  original_filename: string | null;
  mime_type: string | null;
  size_kb: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  publicUrl?: string; // เพิ่มตอน fetch
};

// generateSlug ไม่ได้ใช้ใน media actions โดยตรง แต่ถ้ามีก็ไม่เป็นไร
// function generateSlug(text: string): string { /* ... */ }

export async function uploadImagesAction(formData: FormData): Promise<MediaActionResponse> {
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { error: 'Authentication required', message: 'กรุณาเข้าสู่ระบบเพื่ออัปโหลดรูปภาพ' };
  }
  const { data: adminProfile, error: profileErr } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileErr || adminProfile?.role !== 'admin') {
    return { error: 'Unauthorized action', message: 'คุณไม่มีสิทธิ์อัปโหลดรูปภาพ' };
  }

  const files = formData.getAll('imageFiles') as File[];
  const uploadedFilesResult: { name: string; url: string; path: string }[] = [];
  let hasErrors = false;
  let errorMessageAccumulator = '';

  if (!files || files.length === 0 || (files.length === 1 && files[0].size === 0) ) {
    return { error: 'กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์เพื่ออัปโหลด', message: 'กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์เพื่ออัปโหลด' };
  }

  for (const imageFile of files) {
    if (imageFile && imageFile.size > 0) {
      const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const storageFilePath = `public/${uniqueFileName}`; 

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storageFilePath, imageFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error(`[UploadImagesAction] Storage Error for ${imageFile.name}:`, uploadError);
        hasErrors = true;
        errorMessageAccumulator += `ไฟล์ ${imageFile.name}: ${uploadError.message}\n`;
        continue; 
      }

      if (uploadData) {
        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storageFilePath);
        const publicUrl = publicUrlData?.publicUrl;

        const { error: metaError } = await supabase
          .from('media') // <--- *** แก้ไขชื่อตารางเป็น 'media' ***
          .insert({
            storage_bucket_id: BUCKET_NAME,
            storage_object_path: storageFilePath,
            alt_text: imageFile.name, 
            title: imageFile.name,    
            original_filename: imageFile.name,
            mime_type: imageFile.type,
            size_kb: Math.round(imageFile.size / 1024),
            uploaded_by: user.id,
          });
        
        if (metaError) {
          console.error(`[UploadImagesAction] DB Error inserting metadata for ${imageFile.name}:`, metaError);
          hasErrors = true;
          errorMessageAccumulator += `ไฟล์ ${imageFile.name}: บันทึก metadata ล้มเหลว (${metaError.message})\n`;
          // (Optional) ลบไฟล์ออกจาก Storage ถ้าบันทึก metadata ไม่สำเร็จ
          // await supabase.storage.from(BUCKET_NAME).remove([storageFilePath]);
        } else if (publicUrl) {
          uploadedFilesResult.push({ name: imageFile.name, url: publicUrl, path: storageFilePath });
        }
      }
    }
  }

  if (uploadedFilesResult.length > 0) {
    revalidatePath('/admin/media');
  }

  if (hasErrors) {
    const finalErrorMessage = errorMessageAccumulator.trim();
    return { error: finalErrorMessage, message: finalErrorMessage, uploadedFiles: uploadedFilesResult.length > 0 ? uploadedFilesResult : undefined };
  }
  
  const successMsg = `${uploadedFilesResult.length} ไฟล์ถูกอัปโหลดและบันทึก metadata เรียบร้อยแล้ว`;
  return { success: true, message: successMsg, uploadedFiles: uploadedFilesResult };
}

export async function updateMediaItemMetadataAction(
  mediaItemId: string, 
  formData: FormData
): Promise<MediaActionResponse> { // <--- ใช้ MediaActionResponse
  const supabase = await createClient();
  
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'Authentication required', message: 'กรุณาเข้าสู่ระบบ'};
  const { data: adminProfile, error: profileErr } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileErr || adminProfile?.role !== 'admin') return { error: 'Unauthorized action', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้'};

  const alt_text = formData.get('alt_text') as string | null;
  const title = formData.get('title') as string | null;
  const caption = formData.get('caption') as string | null;

  const { error } = await supabase
    .from('media') // <--- ตรวจสอบว่าชื่อตารางคือ 'media'
    .update({
      alt_text: alt_text?.trim() || null,
      title: title?.trim() || null,
      caption: caption?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mediaItemId);

  if (error) {
    const errMsg = `ไม่สามารถอัปเดต metadata ได้: ${error.message}`;
    console.error(`[UpdateMediaMeta] Error for ${mediaItemId}:`, error);
    return { error: errMsg, message: errMsg };
  }
  revalidatePath('/admin/media');
  const successMsg = 'อัปเดต metadata รูปภาพเรียบร้อยแล้ว';
  return { success: true, message: successMsg };
}

export async function deleteMediaItemAction(
  mediaItemId: string, 
  storageObjectPath: string, 
  bucketId: string // ควรจะเป็น BUCKET_NAME ที่ส่งมาจาก client หรือใช้ BUCKET_NAME โดยตรง
): Promise<MediaActionResponse> { // <--- ใช้ MediaActionResponse
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'Authentication required', message: 'กรุณาเข้าสู่ระบบ'};
  const { data: adminProfile, error: profileErr } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileErr || adminProfile?.role !== 'admin') return { error: 'Unauthorized action', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้'};

  const { error: dbDeleteError } = await supabase
    .from('media') // <--- ตรวจสอบว่าชื่อตารางคือ 'media'
    .delete()
    .eq('id', mediaItemId);

  if (dbDeleteError) {
    const errMsg = `ไม่สามารถลบ metadata รูปภาพได้: ${dbDeleteError.message}`;
    return { error: errMsg, message: errMsg };
  }

  if (storageObjectPath && bucketId === BUCKET_NAME) { // ตรวจสอบ bucketId ด้วย
    const { error: storageDeleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storageObjectPath]);
    
    if (storageDeleteError) {
      const errMsg = `ลบ metadata สำเร็จ แต่ไม่สามารถลบไฟล์ออกจาก Storage ได้: ${storageDeleteError.message}`;
      return { error: errMsg, message: errMsg };
    }
  } else {
    const errMsg = 'ข้อมูล path หรือ bucket สำหรับลบไฟล์ใน storage ไม่ถูกต้อง หรือไม่ตรงกัน';
    // อาจจะไม่ควร return error ถ้า metadata ถูกลบไปแล้ว แต่แจ้งเตือน
    console.warn(`[DeleteMediaItemAction] Metadata deleted, but file not deleted from storage. Path: ${storageObjectPath}, Bucket: ${bucketId}`);
    // return { error: errMsg, message: errMsg}; 
  }
  
  revalidatePath('/admin/media');
  const successMsg = 'รูปภาพและ metadata ถูกลบเรียบร้อยแล้ว!';
  return { success: true, message: successMsg };
}



export async function getMediaItemsAction(
  page: number = 1, 
  limit: number = 12 // จำนวนรูปต่อหน้า
): Promise<{ items: MediaItem[]; count: number | null; error?: string }> {
  const supabase = await createClient();

  // (Optional) Admin auth check - ถ้าต้องการให้เฉพาะ Admin เรียกได้
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return { items: [], count: 0, error: 'Authentication required.' };
  // const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  // if (adminProfile?.role !== 'admin') return { items: [], count: 0, error: 'Unauthorized.' };

  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('media') // ชื่อตาราง metadata รูปภาพของคุณ
    .select('*', { count: 'exact' }) // ดึง count สำหรับ pagination
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
    .returns<Omit<MediaItem, 'publicUrl'>[]>(); // Omit publicUrl เพราะจะสร้างเอง

  if (error) {
    console.error('[GetMediaItemsAction] Error fetching media items:', error);
    return { items: [], count: 0, error: error.message };
  }

  if (!data) {
    return { items: [], count: 0 };
  }

  // สร้าง Public URL ให้แต่ละ item
  const itemsWithPublicUrl = data.map(item => ({
    ...item,
    publicUrl: supabase.storage.from(item.storage_bucket_id).getPublicUrl(item.storage_object_path).data.publicUrl,
  }));

  return { items: itemsWithPublicUrl, count };
}