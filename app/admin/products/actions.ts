// app/admin/products/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// ฟังก์ชัน generateSlug (ควรจะมาจาก utils กลาง)
function generateSlug(text: string): string {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/[\u0E00-\u0E7F]+/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}


//เพิ่มสินค้า
export async function addProductAction(formData: FormData) {
  const name = formData.get('name') as string;
  let slug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;
  const priceString = formData.get('price') as string;
  const imageUrl = formData.get('image_url') as string | null;
  const productType = formData.get('product_type') as string | null;
  const stockQuantityString = formData.get('stock_quantity') as string | null;
  const imagesString = formData.get('images') as string | null; // สำหรับ multiple images (comma-separated URLs)

  // --- ตรวจสอบสิทธิ์ Admin ---
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?error=auth_required');
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return redirect('/admin?error=unauthorized');
  // --- สิ้นสุดการตรวจสอบสิทธิ์ ---

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
    if (!slug && name) { 
      const message = 'ไม่สามารถสร้าง Slug จากชื่อสินค้าได้ (อาจเป็นเพราะมีแต่ภาษาไทย) กรุณากรอก Slug (ภาษาอังกฤษ) เอง';
      return redirect(`/admin/products/new?error=slug_generation&message=${encodeURIComponent(message)}`);
    } else if (!slug && !name) {
      const message = 'กรุณากรอกชื่อสินค้าเพื่อสร้าง Slug หรือกรอก Slug เอง';
      return redirect(`/admin/products/new?error=slug_generation&message=${encodeURIComponent(message)}`);
    }
  } else {
    slug = generateSlug(slug);
  }
  if(!slug) {
    const message = 'Slug ไม่ถูกต้อง';
    return redirect(`/admin/products/new?error=slug_invalid&message=${encodeURIComponent(message)}`);
  }
  
  const stock_quantity = stockQuantityString ? parseInt(stockQuantityString, 10) : 0;
  const imagesArray = imagesString ? imagesString.split(',').map(url => url.trim()).filter(url => url) : null;


  const { data: newProduct, error: dbError } = await supabase
    .from('products')
    .insert([{
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      price,
      image_url: imageUrl?.trim() || null,
      images: imagesArray,
      product_type: productType?.trim() || null,
      stock_quantity: isNaN(stock_quantity) ? 0 : stock_quantity,
    }])
    .select()
    .single();

  if (dbError) {
    console.error('[AddProductAction] Supabase Error:', dbError);
    let userErrorMessage = `เกิดข้อผิดพลาดในการเพิ่มสินค้า: ${dbError.message}`;
    if (dbError.code === '23505') { // Unique constraint violation
      userErrorMessage = `เกิดข้อผิดพลาด: ชื่อสินค้าหรือ Slug "${name}" / "${slug}" นี้มีอยู่แล้ว`;
    }
    return redirect(`/admin/products/new?error=db_error&message=${encodeURIComponent(userErrorMessage)}`);
  }

  console.log('[AddProductAction] Product created successfully:', newProduct);

  revalidatePath('/admin/products'); // หน้ารวมสินค้า Admin
  revalidatePath('/creations');      // หน้ารวมผลงาน/Shop สาธารณะ
  if (newProduct?.slug) {
    revalidatePath(`/creations/${newProduct.product_type}/${newProduct.slug}`); // หน้าสินค้านั้นๆ (ถ้ามี path แบบนี้)
  }
  // Revalidate หน้า category ของ product type นั้นๆ ด้วย (ถ้ามี)
  // if (newProduct?.product_type) {
  //   revalidatePath(`/creations/${newProduct.product_type}`);
  // }

  const successMessage = 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว!';
  redirect(`/admin/products?message=${encodeURIComponent(successMessage)}`); // Redirect ไปหน้ารวมสินค้า
}

//แก้ไขสินค้า
export async function updateProductAction(productId: number, currentProductSlug: string, formData: FormData) {
  const name = formData.get('name') as string;
  let newSlug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;
  const priceString = formData.get('price') as string;
  const imageUrl = formData.get('image_url') as string | null;
  const productType = formData.get('product_type') as string | null;
  const stockQuantityString = formData.get('stock_quantity') as string | null;
  const imagesString = formData.get('images') as string | null;

  const redirectOnError = (errorCode: string, errorMessage: string) => {
    return redirect(`/admin/products/edit/${productId}?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`);
  };

  // --- ตรวจสอบสิทธิ์ Admin (ควรจะมีในทุก Action ที่แก้ไขข้อมูล) ---
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?error=auth_required');
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return redirect('/admin?error=unauthorized');
  // --- สิ้นสุดการตรวจสอบสิทธิ์ Admin ---

  if (!name || !priceString) {
    return redirectOnError('validation_failed', 'ชื่อสินค้า และราคา เป็นฟิลด์ที่จำเป็น');
  }

  const price = parseFloat(priceString);
  if (isNaN(price) || price < 0) {
    return redirectOnError('validation_failed_price', 'ราคาไม่ถูกต้อง');
  }

  if (!newSlug) {
    newSlug = generateSlug(name);
    if (!newSlug && name) {
        return redirectOnError('slug_generation_failed', 'ไม่สามารถสร้าง Slug จากชื่อสินค้าได้ (อาจเป็นเพราะมีแต่ภาษาไทย) กรุณากรอก Slug (ภาษาอังกฤษ) เอง');
    } else if (!newSlug && !name) {
        return redirectOnError('slug_generation_failed_name', 'กรุณากรอกชื่อสินค้าเพื่อสร้าง Slug หรือกรอก Slug เอง');
    }
  } else {
    newSlug = generateSlug(newSlug);
  }
   if(!newSlug) {
    return redirectOnError('slug_invalid', 'Slug ไม่ถูกต้อง');
  }

  const stock_quantity = stockQuantityString ? parseInt(stockQuantityString, 10) : 0;
  const imagesArray = imagesString ? imagesString.split(',').map(url => url.trim()).filter(url => url) : null;

  const { data: updatedProductData, error: dbError } = await supabase
    .from('products')
    .update({
      name: name.trim(),
      slug: newSlug,
      description: description?.trim() || null,
      price,
      image_url: imageUrl?.trim() || null,
      images: imagesArray,
      product_type: productType?.trim() || null,
      stock_quantity: isNaN(stock_quantity) ? 0 : stock_quantity,
      // updated_at จะถูกอัปเดตโดย DB trigger
    })
    .eq('id', productId)
    .select('slug, product_type') // ดึง slug และ product_type ที่อัปเดตแล้วกลับมา
    .single();

  if (dbError) {
    console.error(`[UpdateProductAction] Supabase Error (ID: ${productId}):`, dbError);
    let userErrorMessage = `เกิดข้อผิดพลาดในการอัปเดตสินค้า: ${dbError.message}`;
    if (dbError.code === '23505') {
      userErrorMessage = `เกิดข้อผิดพลาด: ชื่อสินค้าหรือ Slug "${name}" / "${newSlug}" นี้มีอยู่แล้ว`;
    }
    return redirectOnError('db_error', userErrorMessage);
  }

  if (!updatedProductData) {
    return redirectOnError('update_failed', 'ไม่พบข้อมูลสินค้าหลังจากการอัปเดต');
  }

  console.log('[UpdateProductAction] Product updated successfully:', updatedProductData);

  revalidatePath('/admin/products');
  revalidatePath('/creations');
  if (currentProductSlug !== updatedProductData.slug || productType !== updatedProductData.product_type) {
    // ถ้า slug หรือ product_type เปลี่ยน ให้ revalidate path เก่าด้วย
    // (การ revalidate path เก่าของ product_type อาจจะซับซ้อนถ้าโครงสร้าง URL คือ /creations/[type]/[slug])
    // สำหรับตอนนี้ revalidate path เก่าของ slug ก่อน
    revalidatePath(`/creations/${productType || 'all'}/${currentProductSlug}`);
  }
  revalidatePath(`/creations/${updatedProductData.product_type || 'all'}/${updatedProductData.slug}`);
  if (updatedProductData.product_type) {
    revalidatePath(`/creations/${updatedProductData.product_type}`);
  }


  const successMessage = 'อัปเดตสินค้าเรียบร้อยแล้ว!';
  redirect(`/admin/products?message=${encodeURIComponent(successMessage)}`);
}

//ลบสินค้า
export async function deleteProductAction(productId: number): Promise<void> {
  if (isNaN(productId) || productId <= 0) {
    console.error('[DeleteProductAction] Invalid Product ID.');
    return;
  }

  const supabase = await createClient();
  // --- ตรวจสอบสิทธิ์ Admin ---
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return;
  // --- สิ้นสุดการตรวจสอบสิทธิ์ Admin ---

  const { data: productToDelete, error: fetchError } = await supabase
    .from('products')
    .select('slug, product_type') // ดึง slug และ type มาเพื่อ revalidate
    .eq('id', productId)
    .single();

  if (fetchError || !productToDelete) {
    console.warn(`[DeleteProductAction] Product not found (ID: ${productId}) or error fetching before delete:`, fetchError?.message);
    // อาจจะยังคงดำเนินการลบได้ถ้า ID ถูกต้อง แต่การ revalidate path ของ slug/type อาจจะไม่สมบูรณ์
  }

  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (deleteError) {
    console.error(`[DeleteProductAction] Supabase Error (ID: ${productId}):`, deleteError);
    return;
  }

  console.log('[DeleteProductAction] Product deleted successfully, ID:', productId);

  revalidatePath('/admin/products');
  revalidatePath('/creations');
  if (productToDelete?.slug && productToDelete?.product_type) {
    revalidatePath(`/creations/${productToDelete.product_type}/${productToDelete.slug}`);
    revalidatePath(`/creations/${productToDelete.product_type}`);
  }
}