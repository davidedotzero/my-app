// app/admin/products/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'productimages'; // <--- กำหนดชื่อ Bucket เป็นตัวแปร

function generateSlug(text: string): string {
  if (!text?.trim()) return `product-${Date.now().toString().slice(-6)}`; // ปรับ fallback เล็กน้อย
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[\u0E00-\u0E7F]+/g, '') // ลบอักขระภาษาไทยสำหรับ slug
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  if (!slug) {
    return `product-${Date.now().toString().slice(-7)}`; // Fallback ถ้า slug ว่างหลัง clean
  }
  return slug;
}

export async function addProductAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?error=auth_required&message=Authentication required');
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return redirect('/admin?error=unauthorized&message=You are not authorized');

  const name = formData.get('name') as string;
  let slug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;
  const priceString = formData.get('price') as string;
  const productType = formData.get('product_type') as string | null;
  const stockQuantityString = formData.get('stock_quantity') as string | null;
  const imageFile = formData.get('image_file') as File | null; // <--- แก้ไขชื่อ field จาก productsimages เป็น image_file (ตามที่คุณใช้ในฟอร์มก่อนหน้า)

  if (!name || !priceString) {
    const message = 'ชื่อสินค้า และราคา เป็นฟิลด์ที่จำเป็น';
    return redirect(`/admin/products/new?error=validation&message=${encodeURIComponent(message)}`);
  }
  const price = parseFloat(priceString);
  if (isNaN(price) || price < 0) {
    const message = 'ราคาไม่ถูกต้อง';
    return redirect(`/admin/products/new?error=validation&field=price&message=${encodeURIComponent(message)}`);
  }

  if (!slug) {
    slug = generateSlug(name);
  } else {
    slug = generateSlug(slug);
  }
  if (!slug) { // ถ้ายังไม่ได้ slug (เช่น ชื่อเป็นอักขระพิเศษล้วน)
    const message = 'ไม่สามารถสร้าง Slug ได้ กรุณาตรวจสอบชื่อสินค้า หรือกรอก Slug เอง (ภาษาอังกฤษ)';
    return redirect(`/admin/products/new?error=slug_generation&message=${encodeURIComponent(message)}`);
  }

  const stock_quantity = stockQuantityString ? parseInt(stockQuantityString, 10) : 0;
  let publicImageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `public/${fileName}`; // แนะนำให้มี subfolder เช่น public/ หรือ products/

    console.log(`[AddProductAction] Uploading to bucket '${BUCKET_NAME}', path: '${filePath}'`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME) // <--- ใช้ตัวแปร BUCKET_NAME
      .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });

    console.log('[AddProductAction] Storage Upload Data:', JSON.stringify(uploadData, null, 2));
    console.log('[AddProductAction] Storage Upload Error:', JSON.stringify(uploadError, null, 2));

    if (uploadError) {
      const message = `ไม่สามารถอัปโหลดรูปภาพได้: ${uploadError.message}`;
      return redirect(`/admin/products/new?error=upload_failed&message=${encodeURIComponent(message)}`);
    }
    publicImageUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
    console.log('[AddProductAction] Image uploaded, Public URL:', publicImageUrl);
  }

  const { data: newProduct, error: dbError } = await supabase
    .from('products')
    .insert([{
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      price,
      image_url: publicImageUrl,
      product_type: productType?.trim() || null,
      stock_quantity: isNaN(stock_quantity) ? 0 : stock_quantity,
      // images: imagesArray, // ถ้าจะใช้ multiple images
    }])
    .select('slug, product_type') // เลือก slug และ product_type กลับมา
    .single();

  if (dbError) {
    let userErrorMessage = `เกิดข้อผิดพลาดในการเพิ่มสินค้า: ${dbError.message}`;
    if (dbError.code === '23505') { userErrorMessage = `เกิดข้อผิดพลาด: ชื่อสินค้าหรือ Slug "${name}" / "${slug}" นี้มีอยู่แล้ว`; }
    return redirect(`/admin/products/new?error=db_error&message=${encodeURIComponent(userErrorMessage)}`);
  }

  revalidatePath('/admin/products');
  revalidatePath('/creations');
  if (newProduct?.product_type) revalidatePath(`/creations/${newProduct.product_type}`);
  if (newProduct?.slug && newProduct?.product_type) revalidatePath(`/creations/${newProduct.product_type}/${newProduct.slug}`);
  revalidatePath('/');

  const successMessage = 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว!';
  redirect(`/admin/products?message=${encodeURIComponent(successMessage)}`);
}

export async function updateProductAction(productId: number, currentProductSlug: string, currentProductType: string | null, formData: FormData) {
  'use server';
  console.log(`[UpdateProductAction] ID: ${productId}, Current Slug: ${currentProductSlug}, Current Type: ${currentProductType}`);

  const supabase = await createClient();
  // ... (Admin auth check เหมือนใน addProductAction) ...
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?error=auth_required');
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return redirect('/admin?error=unauthorized');


  const name = formData.get('name') as string;
  let newSlug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;
  const priceString = formData.get('price') as string;
  const productType = formData.get('product_type') as string | null;
  const stockQuantityString = formData.get('stock_quantity') as string | null;
  const imageFile = formData.get('image_file') as File | null;
  const currentImageUrl = formData.get('current_image_url') as string | null;

  let finalImageUrl: string | null = currentImageUrl || null;

  const redirectOnError = (errorCode: string, errorMessage: string) => redirect(`/admin/products/edit/${productId}?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`);

  if (!name || !priceString) return redirectOnError('validation_failed', 'ชื่อสินค้า และราคา เป็นฟิลด์ที่จำเป็น');
  const price = parseFloat(priceString);
  if (isNaN(price) || price < 0) return redirectOnError('validation_failed_price', 'ราคาไม่ถูกต้อง');

  if (!newSlug) newSlug = generateSlug(name); else newSlug = generateSlug(newSlug);
  if (!newSlug) return redirectOnError('slug_invalid', 'Slug ไม่ถูกต้อง หรือสร้างจากชื่อไม่ได้');

  const stock_quantity = stockQuantityString ? parseInt(stockQuantityString, 10) : 0;

  if (imageFile && imageFile.size > 0) {
    console.log('[UpdateProductAction] New image file provided. Attempting upload.');
    const fileExtension = imageFile.name.split('.').pop();
    const newFileName = `${uuidv4()}.${fileExtension}`;
    const newFilePath = `public/${newFileName}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newFilePath, imageFile, { upsert: true });

    if (uploadError) {
      return redirectOnError('upload_failed', `ไม่สามารถอัปโหลดรูปภาพใหม่ได้: ${uploadError.message}`);
    }
    finalImageUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath).data.publicUrl;
    console.log('[UpdateProductAction] New image uploaded. Public URL:', finalImageUrl);

    if (currentImageUrl && currentImageUrl !== finalImageUrl) {
      try {
        const oldFileStoragePath = new URL(currentImageUrl).pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)[1];
        if (oldFileStoragePath) {
          console.log('[UpdateProductAction] Attempting to delete old image:', oldFileStoragePath);
          await supabase.storage.from(BUCKET_NAME).remove([oldFileStoragePath]);
        }
      } catch (e) { console.warn("[UpdateProductAction] Error parsing or deleting old image URL:", e); }
    }
  }

  const updatePayload = {
    name: name.trim(), slug: newSlug, description: description?.trim() || null, price,
    image_url: finalImageUrl, product_type: productType?.trim() || null,
    stock_quantity: isNaN(stock_quantity) ? 0 : stock_quantity,
  };
  console.log(`[UpdateProductAction - ID: ${productId}] Updating DB with payload:`, updatePayload);

  const { data: updatedProductData, error: dbError } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId)
    .select('slug, product_type')
    .single();

  if (dbError) {
    let userErrorMessage = `เกิดข้อผิดพลาดในการอัปเดตสินค้า: ${dbError.message}`;
    if (dbError.code === '23505') userErrorMessage = `เกิดข้อผิดพลาด: Slug "${newSlug}" นี้มีอยู่แล้ว`;
    return redirectOnError('db_error', userErrorMessage);
  }
  if (!updatedProductData) return redirectOnError('update_failed', 'ไม่พบสินค้าหลังอัปเดต');

  revalidatePath('/admin/products');
  revalidatePath('/creations');
  revalidatePath('/');
  if (currentProductSlug !== updatedProductData.slug || currentProductType !== updatedProductData.product_type) {
    if(currentProductType && currentProductSlug) revalidatePath(`/creations/${currentProductType}/${currentProductSlug}`);
  }
  if (updatedProductData.product_type && updatedProductData.slug) revalidatePath(`/creations/${updatedProductData.product_type}/${updatedProductData.slug}`);
  if (updatedProductData.product_type) revalidatePath(`/creations/${updatedProductData.product_type}`);


  const successMessage = 'อัปเดตสินค้าเรียบร้อยแล้ว!';
  redirect(`/admin/products?message=${encodeURIComponent(successMessage)}`);
}


export async function deleteProductAction(productId: number): Promise<void> {
  // ... (โค้ด deleteProductAction ที่ปรับปรุงแล้ว, เพิ่ม Admin check เหมือนด้านบน) ...
  if (isNaN(productId) || productId <= 0) { console.error('[DeleteProductAction] Invalid Product ID:', productId); return; }
  const supabase = await createClient();
  // Admin Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { console.error('[DeleteProductAction] Auth required.'); return; }
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') { console.error('[DeleteProductAction] Unauthorized.'); return; }

  const { data: productToDelete, error: fetchError } = await supabase.from('products').select('slug, product_type, image_url').eq('id', productId).single();

  if (fetchError) { console.warn(`[DeleteProductAction] Could not fetch product (ID: ${productId}) before delete. Error: ${fetchError.message}`); }
  
  // (Optional) Delete image from storage
  if (productToDelete?.image_url) {
    try {
      const imagePath = new URL(productToDelete.image_url).pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)[1];
      if (imagePath) {
        console.log('[DeleteProductAction] Deleting image from storage:', imagePath);
        await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
      }
    } catch (e) { console.warn('[DeleteProductAction] Could not delete image from storage:', e); }
  }

  const { error: deleteError } = await supabase.from('products').delete().eq('id', productId);
  if (deleteError) { console.error(`[DeleteProductAction] Supabase Error (ID: ${productId}):`, deleteError.message); return; }

  console.log('[DeleteProductAction] Product deleted successfully, ID:', productId);
  revalidatePath('/admin/products');
  revalidatePath('/creations');
  if (productToDelete?.product_type) revalidatePath(`/creations/${productToDelete.product_type}`);
  if (productToDelete?.slug && productToDelete?.product_type) revalidatePath(`/creations/${productToDelete.product_type}/${productToDelete.slug}`);
  revalidatePath('/');
}