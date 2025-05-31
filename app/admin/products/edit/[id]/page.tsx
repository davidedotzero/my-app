// app/admin/products/edit/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation'; // redirect ถูกใช้ใน action ไม่ใช่ใน page component โดยตรง
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
// ปรับ Path การ import นี้ให้ถูกต้องตามตำแหน่งไฟล์ actions.ts ของคุณ
// ถ้า actions.ts อยู่ใน app/admin/products/actions.ts ให้ใช้ import { updateProductAction } from '../actions';
// ถ้า actions.ts อยู่ใน app/admin/actions.ts ให้ใช้ import { updateProductAction } from '../../actions';
import { updateProductAction } from '../../actions'; 

// Helper function สำหรับสร้าง slug (ควรจะอยู่ในไฟล์ utils หรือ actions.ts เพื่อใช้ร่วมกัน)
// function generateSlug(title: string): string {
//   if (!title?.trim()) return `product-${Date.now().toString().slice(-6)}`;
//   let slug = title
//     .toLowerCase()
//     .trim()
//     .replace(/[\u0E00-\u0E7F]+/g, '') // ลบอักขระภาษาไทย
//     .replace(/\s+/g, '-')
//     .replace(/[^\w-]+/g, '')
//     .replace(/--+/g, '-')
//     .replace(/^-+/, '')
//     .replace(/-+$/, '');
//   if (!slug) {
//     return `product-${Date.now().toString().slice(-7)}`;
//   }
//   return slug;
// }
// หมายเหตุ: ถ้า generateSlug อยู่ใน actions.ts แล้ว ไม่ต้องประกาศซ้ำที่นี่

type EditProductPageProps = {
  params: {
    id: string; 
  };
  searchParams?: {
    error?: string;
    message?: string;
    field?: string;
    success?: string; 
  };
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null;
  product_type: string | null;
  category_id: number | null; 
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
};

type Category = {
  id: number;
  name: string;
};

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const awaitedParams = params ? await params : { id: '' }; // ใช้ await params ตามที่คุณทดลอง
  const productId = parseInt(awaitedParams.id, 10);

  if (isNaN(productId)) {
    return { title: 'ID สินค้าไม่ถูกต้อง | Admin Dashboard' };
  }

  const supabase = await createClient(); // ใช้ await ถ้า createClient เป็น async
  const { data: product } = await supabase
    .from('products')
    .select('name')
    .eq('id', productId)
    .single();

  return {
    title: product ? `แก้ไขสินค้า: ${product.name} | Admin Dashboard` : 'แก้ไขสินค้า | Admin Dashboard',
  };
}

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const awaitedParams = params ? await params : { id: '' }; // ใช้ await params
  const resolvedSearchParams = searchParams ? await searchParams : { 
    error: undefined, 
    message: undefined, 
    field: undefined,
    success: undefined
  }; // ใช้ await searchParams
  
  const productId = parseInt(awaitedParams.id, 10);
  const errorType = resolvedSearchParams.error;
  const queryMessage = resolvedSearchParams.message; // เปลี่ยนชื่อตัวแปรไม่ให้ซ้ำกับ message ใน scope อื่น
  const fieldError = resolvedSearchParams.field;
  const successMessage = resolvedSearchParams.success ? resolvedSearchParams.message : null;


  if (isNaN(productId)) {
    notFound();
  }

  const supabase = await createClient(); // ใช้ await ถ้า createClient เป็น async

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('*') 
    .eq('id', productId)
    .single<Product>();

  const { data: categories, error: categoriesError } = await supabase
    .from('categories') 
    .select('id, name')
    .order('name', { ascending: true });

  if (fetchError || !product) {
    console.error(`Error fetching product (ID: ${productId}) for edit:`, fetchError);
    notFound();
  }

  // Server Action updateProductAction ควรจะรับ (productId: number, currentSlugFromDb: string, currentProductType: string | null, formData: FormData)
  const updateActionWithParams = updateProductAction.bind(
    null, 
    product.id, 
    product.slug, // currentProductSlugFromDb
    product.product_type // currentProductType
  );
  
  // จุดนี้คือจุดสิ้นสุดของ Logic ใน JavaScript ก่อนเริ่มส่วน JSX ของ return
  // ตรวจสอบให้แน่ใจว่าไม่มี Syntax Error ใดๆ ก่อนบรรทัด return (...)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          กลับไปหน้ารายการสินค้า
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
        แก้ไขสินค้า: <span className="text-primary/90">{product.name}</span>
      </h1>

      {successMessage && (
        <div className="mb-6 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
          <p>{decodeURIComponent(successMessage)}</p>
        </div>
      )}
      {errorType && queryMessage && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>{decodeURIComponent(queryMessage)}</p>
        </div>
      )}

      <form action={updateActionWithParams} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
        <input type="hidden" name="current_image_url" value={product.image_url || ''} />
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/90 mb-1.5">
            ชื่อสินค้า <span className="text-destructive">*</span>
          </label>
          <input type="text" name="name" id="name" required defaultValue={product.name} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"/>
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Slug (สำหรับ URL)
          </label>
          <input type="text" name="slug" id="slug" defaultValue={product.slug} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="ปล่อยว่างเพื่อสร้างจากชื่อสินค้า"/>
          <p className="mt-1.5 text-xs text-muted-foreground">ถ้ามีการเปลี่ยนแปลง จะส่งผลต่อ URL (ภาษาอังกฤษตัวเล็ก, ตัวเลข, และขีดกลาง)</p>
        </div>

        <div>
          <label htmlFor="product_type" className="block text-sm font-medium text-foreground/90 mb-1.5">
            ประเภทสินค้า
          </label>
          <select name="product_type" id="product_type" defaultValue={product.product_type || ""} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors">
            <option value="">-- เลือกประเภท --</option>
            <option value="bonsai">บอนไซ (Bonsai)</option>
            <option value="zen-garden">สวนหินเซน (Zen Garden)</option>
            <option value="terrarium">สวนในขวดแก้ว (Terrarium)</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-foreground/90 mb-1.5">
            ราคา (บาท) <span className="text-destructive">*</span>
          </label>
          <input type="number" name="price" id="price" required step="0.01" min="0" defaultValue={product.price} className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-primary bg-background text-foreground text-sm transition-colors ${fieldError === 'price' && errorType ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'}`} />
          {fieldError === 'price' && errorType && queryMessage && <p className="mt-1 text-xs text-destructive">{decodeURIComponent(queryMessage)}</p>}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground/90 mb-1.5">
            คำอธิบายสินค้า
          </label>
          <textarea name="description" id="description" rows={5} defaultValue={product.description || ''} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"></textarea>
        </div>

        <div>
          <label htmlFor="image_file" className="block text-sm font-medium text-foreground/90 mb-1.5">
            รูปภาพหลัก (เลือกไฟล์ใหม่ถ้าต้องการเปลี่ยน)
          </label>
          <input type="file" name="image_file" id="image_file" accept="image/png, image/jpeg, image/webp, image/gif" className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary dark:file:bg-primary/20 dark:file:text-primary hover:file:bg-primary/20 dark:hover:file:bg-primary/30 cursor-pointer border border-input rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"/>
          {product.image_url && ( <div className="mt-3"><p className="text-xs text-muted-foreground mb-1">รูปภาพปัจจุบัน:</p><Image src={product.image_url} alt={`รูปภาพปัจจุบันของ ${product.name}`} width={100} height={100} className="object-cover rounded-md border border-border" /></div>)}
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-foreground/90 mb-1.5">
            URL รูปภาพเพิ่มเติม (คั่นด้วยลูกน้ำ ,)
          </label>
          <textarea name="images" id="images" rows={3} defaultValue={product.images?.join(', ') || ''} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"></textarea>
        </div>
        
        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-foreground/90 mb-1.5">
            จำนวนในสต็อก
          </label>
          <input type="number" name="stock_quantity" id="stock_quantity" min="0" step="1" defaultValue={product.stock_quantity ?? 0} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" />
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-foreground/90 mb-1.5">
            หมวดหมู่บทความ (Category) 
            {/* หมายเหตุ: นี่คือ "หมวดหมู่บทความ" ซึ่งอาจจะไม่ตรงกับ "ประเภทสินค้า" (product_type) 
                ถ้าคุณต้องการให้สินค้ามี category แยกจาก product_type คุณต้องมีคอลัมน์ category_id ในตาราง products
                และดึง categories มาแสดงใน dropdown นี้
                จากโค้ดเดิมของคุณ คุณใช้ product.category_id สำหรับ defaultValue ซึ่งถูกต้องถ้ามีคอลัมน์นี้
            */}
          </label>
          <select
            name="category_id" // Server Action จะรับค่านี้
            id="category_id"
            defaultValue={product.category_id?.toString() || ""} // ใช้ product.category_id (ถ้ามี)
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
          >
            <option value="">-- ไม่ระบุหมวดหมู่ --</option>
            {categories?.map((category) => ( // categories ที่ดึงมาจาก DB สำหรับ dropdown
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesError && <p className="mt-1 text-xs text-destructive">ไม่สามารถโหลดรายการหมวดหมู่ได้</p>}
        </div>

        <div className="flex items-center gap-4 pt-3">
          <button type="submit" className="bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm">
            อัปเดตสินค้า
          </button>
          <Link href="/admin/products" className="py-2.5 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}