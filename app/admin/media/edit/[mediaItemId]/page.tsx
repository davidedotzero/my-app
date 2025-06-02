// app/admin/media/edit/[mediaItemId]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation'; // redirect อาจจะไม่จำเป็นถ้า action return state
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import EditMediaItemForm from '@/components/admin/media/EditMediaItemForm'; // Component นี้เราสร้างไว้แล้ว
import type { MediaItem } from '@/app/admin/media/page'; // Import MediaItem type จากหน้ารวม

type EditMediaItemPageProps = {
  params: {
    mediaItemId: string; 
  };
  searchParams?: { // สำหรับรับ success/error message จาก form submission
    error?: string;
    message?: string;
    success?: string;
  };
};

export async function generateMetadata({ params }: EditMediaItemPageProps): Promise<Metadata> {
  const awaitedParams = params ? await params : { mediaItemId: '' }; // ใช้ await params ถ้าจำเป็น
  const { mediaItemId } = awaitedParams;
  if (!mediaItemId || mediaItemId.length !== 36) { // Basic UUID check
     return { title: 'ID รูปภาพไม่ถูกต้อง | Admin' };
  }

  const supabase = await createClient();
  const { data: mediaItem } = await supabase
    .from('media') // ชื่อตาราง metadata
    .select('title, original_filename')
    .eq('id', mediaItemId)
    .single();
  
  const itemTitle = mediaItem?.title || mediaItem?.original_filename || 'Media Item';
  return {
    title: `แก้ไข Metadata: ${itemTitle} | Admin Dashboard`,
  };
}

export default async function EditMediaItemMetadataPage({ params, searchParams }: EditMediaItemPageProps) {
  const awaitedParams = params ? await params : { mediaItemId: '' }; // ใช้ await params
  const { mediaItemId } = awaitedParams;
  
  const resolvedSearchParams = searchParams ? await searchParams : {}; 
  const queryError = resolvedSearchParams.error;
  const queryMessage = resolvedSearchParams.message;
  const querySuccess = resolvedSearchParams.success === 'true'; // แปลงเป็น boolean

  if (!mediaItemId || mediaItemId.length !== 36) { // Basic UUID check
    notFound();
  }

  const supabase = await createClient();
  const { data: item, error: fetchError } = await supabase
    .from('media') // ชื่อตาราง metadata
    .select('*')
    .eq('id', mediaItemId)
    .single<MediaItem>();

  if (fetchError || !item) {
    console.error(`Error fetching media item (ID: ${mediaItemId}):`, fetchError);
    notFound();
  }
  
  // สร้าง publicUrl ถ้ายังไม่มีใน item (เผื่อ type MediaItem ไม่ได้รวมไว้ตอน select)
  if (!item.publicUrl && item.storage_bucket_id && item.storage_object_path) {
    item.publicUrl = supabase.storage.from(item.storage_bucket_id).getPublicUrl(item.storage_object_path).data.publicUrl;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/media" className="text-sm text-primary hover:underline flex items-center gap-1">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          กลับไปคลังมีเดีย
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
        แก้ไขข้อมูลรูปภาพ (Metadata)
      </h1>
      <p className="text-sm text-muted-foreground mb-6 truncate" title={item.original_filename || item.storage_object_path}>
        ไฟล์: {item.original_filename || item.storage_object_path}
      </p>

      {/* แสดง Success/Error message จาก Server Action (ถ้า action redirect กลับมาที่หน้านี้) */}
      {querySuccess && queryMessage && (
        <div className="mb-6 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
          <p>{decodeURIComponent(queryMessage)}</p>
        </div>
      )}
      {queryError && queryMessage && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>{decodeURIComponent(queryMessage)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
        <div className="md:col-span-1">
          {item.publicUrl && (
            <a href={item.publicUrl} target="_blank" rel="noopener noreferrer" title="คลิกเพื่อดูรูปภาพขนาดเต็ม">
              <Image
                src={item.publicUrl}
                alt={item.alt_text || item.original_filename || "Image preview"}
                width={300} // ขนาดที่ต้องการสำหรับ preview
                height={300}
                className="w-full h-auto object-contain rounded-lg border border-border shadow-sm"
              />
            </a>
          )}
        </div>
        <div className="md:col-span-2">
          {/* EditMediaItemForm จะรับ item และจัดการการ submit ไปยัง updateMediaItemMetadataAction */}
          <EditMediaItemForm item={item} />
        </div>
      </div>
    </div>
  );
}