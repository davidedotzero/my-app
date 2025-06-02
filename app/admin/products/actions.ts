// app/admin/products/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'; // ยังคงใช้ redirect สำหรับ success case หลัก
import { v4 as uuidv4 } from 'uuid'; // ถ้ายังใช้ในการสร้างชื่อไฟล์ใน Media Library Action
import Papa from 'papaparse';

const BUCKET_NAME = 'productimages';

// Type สำหรับ Action Response (สามารถย้ายไปไฟล์ types กลางได้)
export type ProductActionResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  field?: string; // สำหรับระบุ field ที่มีปัญหา validation
  productId?: number; // (Optional) ID ของ product ที่เพิ่งสร้าง/แก้ไข
};

// ฟังก์ชัน generateSlug (ควรจะมาจาก utils กลาง ถ้าใช้หลายที่)
function generateSlug(text: string): string {
  if (!text?.trim()) return `product-${Date.now().toString().slice(-6)}`;
  let slug = text.toLowerCase().trim().replace(/[\u0E00-\u0E7F]+/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  if (!slug) { return `product-${Date.now().toString().slice(-7)}`; }
  return slug;
}

// Type สำหรับผลลัพธ์ของ CSV Import Action
export type CsvImportResponse = {
  successMessage?: string;
  error?: string;
  message?: string;
  totalProcessed?: number;
  successCount?: number;
  errorCount?: number;
  errorDetails?: { row: number; error: string; data?: any }[];
};
// Type สำหรับข้อมูล Product จาก CSV (ควรจะตรงกับ Header ใน CSV ของคุณ)
type CsvProductRow = {
  name: string;
  slug?: string;
  description?: string;
  price: string; // รับเป็น string ก่อน แล้วค่อยแปลง
  product_type?: string;
  image_url?: string;
  images_json?: string; // JSON string ของ array URL
  stock_quantity?: string; // รับเป็น string ก่อน
  // เพิ่มฟิลด์อื่นๆ ตาม CSV template ของคุณ
};

//import-csv
export async function importProductsFromCsvAction(formData: FormData): Promise<CsvImportResponse> {
  const supabase = await createClient();

  // --- ตรวจสอบสิทธิ์ Admin ---
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Authentication Required', message: 'กรุณาเข้าสู่ระบบ' };
  const { data: adminProfile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileError || adminProfile?.role !== 'admin') return { error: 'Unauthorized', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' };
  // --- สิ้นสุดการตรวจสอบสิทธิ์ ---

  const file = formData.get('csvFile') as File | null;

  if (!file || file.size === 0) {
    return { error: 'กรุณาเลือกไฟล์ CSV ที่ต้องการอัปโหลด' };
  }

  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
     return { error: 'ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์ .csv เท่านั้น' };
  }

  const fileContent = await file.text();
  let parsedData: CsvProductRow[] = [];

  try {
    const results = Papa.parse<CsvProductRow>(fileContent, {
      header: true,        // ให้บรรทัดแรกเป็น Header
      skipEmptyLines: true, // ข้ามบรรทัดที่ว่าง
      dynamicTyping: false, // รับทุกอย่างเป็น string ก่อน แล้วค่อยแปลง type เอง
    });
    if (results.errors.length > 0) {
      console.error("CSV Parsing errors:", results.errors);
      return { error: `เกิดข้อผิดพลาดในการอ่านไฟล์ CSV: ${results.errors[0].message}` };
    }
    parsedData = results.data;
  } catch (e: any) {
    console.error("Error parsing CSV:", e);
    return { error: `เกิดข้อผิดพลาดในการประมวลผลไฟล์ CSV: ${e.message}` };
  }

  if (parsedData.length === 0) {
    return { error: 'ไฟล์ CSV ว่างเปล่า หรือไม่มีข้อมูลที่สามารถประมวลผลได้' };
  }

  const productsToInsert = [];
  const errorDetails: { row: number; error: string; data?: any }[] = [];
  let successCount = 0;

  for (let i = 0; i < parsedData.length; i++) {
    const row = parsedData[i];
    const rowIndex = i + 2; // +2 เพราะ header คือแถว 1, ข้อมูลเริ่มแถว 2

    // --- Validate และ Transform ข้อมูลแต่ละแถว ---
    if (!row.name || !row.price) {
      errorDetails.push({ row: rowIndex, error: 'ชื่อสินค้า (name) และ ราคา (price) เป็นฟิลด์ที่จำเป็น', data: row });
      continue;
    }
    
    const price = parseFloat(row.price);
    if (isNaN(price) || price < 0) {
      errorDetails.push({ row: rowIndex, error: `ราคาไม่ถูกต้อง: "${row.price}"`, data: row });
      continue;
    }

    let slug = row.slug?.trim();
    if (!slug) slug = generateSlug(row.name); else slug = generateSlug(slug);
    if (!slug) {
        errorDetails.push({ row: rowIndex, error: `ไม่สามารถสร้าง Slug จากชื่อสินค้า "${row.name}" ได้`, data: row });
        continue;
    }

    let imagesArray: string[] | null = null;
    if (row.images_json && row.images_json.trim() !== "") {
      try {
        const parsedImages = JSON.parse(row.images_json);
        if (Array.isArray(parsedImages) && parsedImages.every(item => typeof item === 'string')) {
          imagesArray = parsedImages;
        } else { imagesArray = [row.images_json]; /* ถ้าไม่ใช่ array ก็เก็บเป็น array ที่มี string นั้น */ }
      } catch (e) { imagesArray = [row.images_json]; /* ถ้า parse ไม่ได้ ก็เก็บเป็น string เดี่ยวๆ ใน array */ }
    }
    
    const stock_quantity = row.stock_quantity ? parseInt(row.stock_quantity, 10) : 0;



    productsToInsert.push({
      name: row.name.trim(),
      slug: slug,
      description: row.description?.trim() || null,
      price: price,
      product_type: row.product_type?.trim() || null,
      image_url: row.image_url?.trim() || null,
      images: imagesArray,
      stock_quantity: isNaN(stock_quantity) ? 0 : stock_quantity,
    });
  }

  if (productsToInsert.length > 0) {
    const { error: insertError, data: insertedData } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select(); // เพื่อให้รู้ว่า insert ไปกี่รายการ

    if (insertError) {
      console.error("Supabase Insert Error (CSV Import):", insertError);
      errorDetails.push({ row: 0, error: `เกิดข้อผิดพลาดตอนบันทึกข้อมูลลง Database: ${insertError.message}` });
    } else {
      successCount = insertedData?.length || 0;
    }
  }

  revalidatePath('/admin/products');
  revalidatePath('/creations');
  // (Optional) revalidate paths อื่นๆ ที่เกี่ยวข้อง

  if (errorDetails.length > 0) {
    return {
      error: 'มีบางรายการในไฟล์ CSV ไม่สามารถนำเข้าได้',
      successMessage: successCount > 0 ? `นำเข้าข้อมูลสำเร็จ ${successCount} รายการ` : undefined,
      totalProcessed: parsedData.length,
      successCount: successCount,
      errorCount: errorDetails.length,
      errorDetails: errorDetails,
    };
  }

  return {
    successMessage: `นำเข้าข้อมูลสินค้า ${successCount} รายการจากไฟล์ CSV สำเร็จ!`,
    totalProcessed: parsedData.length,
    successCount: successCount,
    errorCount: 0,
  };
}

// --- เพิ่มสินค้า ---
export async function addProductAction(formData: FormData): Promise<ProductActionResponse> {
  const supabase = await createClient();

  // --- ตรวจสอบสิทธิ์ Admin ---
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Authentication Required', message: 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ' };
  }
  const { data: adminProfile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileError || adminProfile?.role !== 'admin') {
    return { error: 'Unauthorized', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' };
  }
  // --- สิ้นสุดการตรวจสอบสิทธิ์ Admin ---

  const name = formData.get('name') as string;
  let slug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;
  const priceString = formData.get('price') as string;
  const productType = formData.get('product_type') as string | null;
  const stockQuantityString = formData.get('stock_quantity') as string | null;

  // รับ image_url โดยตรงจากฟอร์ม (ซึ่ง Client Component ควรจะ set ค่านี้หลังจากเลือกจาก Media Library)
  const imageUrlFromForm = formData.get('image_url') as string | null;
  const imagesJsonString = formData.get('images_json') as string | null;
  let imagesArray: string[] | null = null;

  if (!name || !priceString) {
    return { error: 'Validation Failed', message: 'ชื่อสินค้า และราคา เป็นฟิลด์ที่จำเป็น', field: !name ? 'name' : 'price' };
  }
  const price = parseFloat(priceString);
  if (isNaN(price) || price < 0) {
    return { error: 'Invalid Price', message: 'ราคาไม่ถูกต้อง', field: 'price' };
  }

  if (!slug) {
    slug = generateSlug(name);
  } else {
    slug = generateSlug(slug);
  }
  if (!slug) {
    return { error: 'Invalid Slug', message: 'ไม่สามารถสร้าง Slug ได้ กรุณาตรวจสอบชื่อสินค้า หรือกรอก Slug เอง (ภาษาอังกฤษ)', field: 'slug' };
  }

  const stock_quantity = stockQuantityString ? parseInt(stockQuantityString, 10) : 0;

  if (imagesJsonString) {
    try {
      const parsed = JSON.parse(imagesJsonString);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        imagesArray = parsed;
      } else {
        console.warn("[AddProductAction] Invalid format for images_json, expected array of strings.");
      }
    } catch (e) {
      console.error("[AddProductAction] Error parsing images_json:", e);
    }
  }
  // ไม่มีการอัปโหลดไฟล์โดยตรงใน Action นี้แล้ว
  // image_url จะมาจาก Media Library ที่ Client Component จัดการ
  const { data: newProduct, error: dbError } = await supabase
    .from('products')
    .insert([{
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      price,
      image_url: imageUrlFromForm?.trim() || null, // ใช้ URL จากฟอร์ม
      product_type: productType?.trim() || null,
      stock_quantity: isNaN(stock_quantity) ? 0 : stock_quantity,
      images: imagesArray, // ถ้าจะจัดการ gallery images array
    }])
    .select('id, slug, product_type') // ดึง id กลับมาด้วย
    .single();

  if (dbError) {
    let userErrorMessage = `เกิดข้อผิดพลาดในการเพิ่มสินค้า: ${dbError.message}`;
    if (dbError.code === '23505') {
      userErrorMessage = `เกิดข้อผิดพลาด: ${dbError.message.includes('products_slug_key') ? `Slug "${slug}"` : `ชื่อสินค้า "${name}"`} นี้มีอยู่แล้ว`;
    }
    return { error: 'Database Error', message: userErrorMessage };
  }

  if (!newProduct) {
    return { error: 'Insert Failed', message: 'ไม่สามารถเพิ่มสินค้าได้ อาจมีปัญหาบางอย่าง' };
  }

  console.log('[AddProductAction] Product created successfully:', newProduct);

  revalidatePath('/admin/products');
  revalidatePath('/creations');
  if (newProduct.product_type) revalidatePath(`/creations/${newProduct.product_type}`);
  if (newProduct.slug && newProduct.product_type) revalidatePath(`/creations/${newProduct.product_type}/${newProduct.slug}`);
  revalidatePath('/');

  const successMessage = 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว!';
  // เราจะ redirect จาก client หลังจากได้รับ success message
  // หรือถ้าต้องการ redirect จาก server action เลย ก็ทำได้ แต่ client จะไม่ได้ success message โดยตรง
  // redirect(`/admin/products?message=${encodeURIComponent(successMessage)}`);
  return { success: true, message: successMessage, productId: newProduct.id };
}


// --- แก้ไขสินค้า ---
export async function updateProductAction(
  productId: number,
  currentProductSlug: string,
  currentProductType: string | null,
  formData: FormData
): Promise<ProductActionResponse> {
  'use server';
  const supabase = await createClient();

  // --- Admin Auth Check --- (เหมือนใน addProductAction)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Authentication Required', message: 'กรุณาเข้าสู่ระบบ' };
  const { data: adminProfile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileError || adminProfile?.role !== 'admin') return { error: 'Unauthorized', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' };
  // --- End Admin Auth Check ---

  if (isNaN(productId) || productId <= 0) {
    return { error: 'Invalid ID', message: 'ID สินค้าไม่ถูกต้อง' };
  }

  const name = formData.get('name') as string;
  let newSlug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;
  const priceString = formData.get('price') as string;
  const productType = formData.get('product_type') as string | null;
  const stockQuantityString = formData.get('stock_quantity') as string | null;

  // รับ image_url โดยตรง (ที่ถูก set โดย client หลังจากเลือกจาก media library หรือเป็น URL เดิม)
  const imageUrlFromForm = formData.get('image_url') as string | null;
  const imagesJsonString = formData.get('images_json') as string | null;
  console.log('[UpdateProductAction] Received images_json string from form:', imagesJsonString); // <--- DEBUG

  let imagesArray: string[] | null = null;

  if (!name || !priceString) {
    return { error: 'Validation Failed', message: 'ชื่อสินค้า และราคา เป็นฟิลด์ที่จำเป็น', field: !name ? 'name' : 'price' };
  }
  const price = parseFloat(priceString);
  if (isNaN(price) || price < 0) {
    return { error: 'Invalid Price', message: 'ราคาไม่ถูกต้อง', field: 'price' };
  }

  if (!newSlug) newSlug = generateSlug(name); else newSlug = generateSlug(newSlug);
  if (!newSlug) return { error: 'Invalid Slug', message: 'ไม่สามารถสร้าง Slug ได้', field: 'slug' };

  if (imagesJsonString && imagesJsonString.trim() !== "") {
    try {
      const parsed = JSON.parse(imagesJsonString);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        imagesArray = parsed.length > 0 ? parsed : null;
      } else {
        console.warn("[UpdateProductAction] Invalid format for images_json, expected array of strings. Received:", parsed);
        imagesArray = null;
      }
    } catch (e) {
      console.error("[UpdateProductAction] Error parsing images_json:", e);
      imagesArray = null;
    }
  } else if (imagesJsonString === null || imagesJsonString.trim() === "") {
    imagesArray = null;
    console.log("[UpdateProductAction] images_json was empty or null, setting imagesArray to null/empty.");
  }
  console.log("[UpdateProductAction] Parsed imagesArray:", imagesArray);

  const stock_quantity = stockQuantityString ? parseInt(stockQuantityString, 10) : 0;

  const updatePayload = {
    name: name.trim(),
    slug: newSlug,
    description: description?.trim() || null,
    price: parseFloat(priceString),
    image_url: imageUrlFromForm?.trim() || null, // ใช้ URL จากฟอร์ม
    product_type: productType?.trim() || null,
    stock_quantity: isNaN(stock_quantity) ? 0 : stock_quantity,
    images: imagesArray,
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
    return { error: 'Database Error', message: userErrorMessage };
  }
  if (!updatedProductData) {
    return { error: 'Update Failed', message: 'ไม่พบข้อมูลสินค้าหลังจากการอัปเดต หรือการอัปเดตล้มเหลว' };
  }

  revalidatePath('/admin/products');
  revalidatePath('/creations');
  revalidatePath('/');
  if (currentProductSlug !== updatedProductData.slug || currentProductType !== updatedProductData.product_type) {
    if (currentProductType && currentProductSlug) revalidatePath(`/creations/${currentProductType}/${currentProductSlug}`);
  }
  if (updatedProductData.product_type && updatedProductData.slug) revalidatePath(`/creations/${updatedProductData.product_type}/${updatedProductData.slug}`);
  if (updatedProductData.product_type) revalidatePath(`/creations/${updatedProductData.product_type}`);

  const successMessage = 'อัปเดตสินค้าเรียบร้อยแล้ว!';
  // redirect(`/admin/products?message=${encodeURIComponent(successMessage)}`);
  return { success: true, message: successMessage };

}


// --- ลบสินค้า ---
export async function deleteProductAction(productId: number): Promise<ProductActionResponse> { // <--- ใช้ ProductActionResponse
  // ... (โค้ด Admin Auth Check เหมือนด้านบน) ...
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication Required', message: 'กรุณาเข้าสู่ระบบ' };
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return { error: 'Unauthorized', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' };


  if (isNaN(productId) || productId <= 0) {
    return { error: 'Invalid ID', message: 'ID สินค้าไม่ถูกต้อง' };
  }

  // (Optional) ดึงข้อมูลสินค้าที่จะลบ (เช่น image_url) เพื่อลบไฟล์ออกจาก Storage ด้วย
  const { data: productToDelete, error: fetchErr } = await supabase
    .from('products')
    .select('image_url, slug, product_type')
    .eq('id', productId)
    .single();

  if (fetchErr && fetchErr.code !== 'PGRST116') { // PGRST116 คือ no rows, ซึ่งก็โอเคถ้าจะลบ
    return { error: 'Fetch Error', message: `เกิดข้อผิดพลาดในการค้นหาสินค้าที่จะลบ: ${fetchErr.message}` };
  }

  // ลบรูปภาพออกจาก Storage (ถ้ามี)
  if (productToDelete?.image_url) {
    try {
      const imagePath = new URL(productToDelete.image_url).pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)[1];
      if (imagePath) {
        const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
        if (storageError) console.warn(`[DeleteProductAction] Could not delete image from storage: ${storageError.message}`);
      }
    } catch (e) { console.warn('[DeleteProductAction] Error parsing or deleting image from storage:', e); }
  }

  // ลบข้อมูลสินค้าออกจาก Database
  const { error: deleteError } = await supabase.from('products').delete().eq('id', productId);

  if (deleteError) {
    return { error: 'Database Error', message: `ไม่สามารถลบสินค้าได้: ${deleteError.message}` };
  }

  revalidatePath('/admin/products');
  revalidatePath('/creations');
  if (productToDelete?.product_type) revalidatePath(`/creations/${productToDelete.product_type}`);
  if (productToDelete?.slug && productToDelete?.product_type) revalidatePath(`/creations/${productToDelete.product_type}/${productToDelete.slug}`);
  revalidatePath('/');

  return { success: true, message: 'ลบสินค้าเรียบร้อยแล้ว!' };
}