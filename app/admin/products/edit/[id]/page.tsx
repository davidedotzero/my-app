import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { updateProductAction } from '../../actions'; // Import Server Action

type EditProductPageProps = {
  params: {
    id: string; 
  };
  searchParams?: {
    error?: string;
    message?: string;
    field?: string;
  };
};

// Type สำหรับ Product (ควรจะมาจากไฟล์ types กลาง)
type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null;
  product_type: string | null;
  stock_quantity: number | null;
  // เพิ่มฟิลด์อื่นๆ ตาม schema ของคุณ
};

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  // ใช้ await params ถ้าจำเป็นสำหรับ environment ของคุณ
  const awaitedParams = params ? await params : { id: '' };
  const productId = parseInt(awaitedParams.id, 10);

  if (isNaN(productId)) {
    return { title: 'ID สินค้าไม่ถูกต้อง | Admin' };
  }
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('name').eq('id', productId).single();
  return {
    title: product ? `แก้ไขสินค้า: ${product.name} | Admin` : 'แก้ไขสินค้า | Admin',
  };
}

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const awaitedParams = params ? await params : { id: '' };
  const resolvedSearchParams = searchParams ? await searchParams : {};
  
  const productId = parseInt(awaitedParams.id, 10);
  const errorType = resolvedSearchParams.error;
  const message = resolvedSearchParams.message;
  const fieldError = resolvedSearchParams.field;


  if (isNaN(productId)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single<Product>();

  if (fetchError || !product) {
    console.error(`Error fetching product (ID: ${productId}) for edit:`, fetchError);
    notFound();
  }

  // ผูก productId และ product.slug (slug ปัจจุบัน) เข้ากับ server action
  const updateActionWithParams = updateProductAction.bind(null, product.id, product.slug);

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

      {errorType && message && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>{decodeURIComponent(message)}</p>
        </div>
      )}

      <form action={updateActionWithParams} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
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
          <input type="number" name="price" id="price" required step="0.01" min="0" defaultValue={product.price} className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-primary bg-background text-foreground text-sm transition-colors ${fieldError === 'price' ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'}`} />
          {fieldError === 'price' && message && <p className="mt-1 text-xs text-destructive">{decodeURIComponent(message)}</p>}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground/90 mb-1.5">
            คำอธิบายสินค้า
          </label>
          <textarea name="description" id="description" rows={5} defaultValue={product.description || ''} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"></textarea>
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-foreground/90 mb-1.5">
            URL รูปภาพหลัก
          </label>
          <input type="url" name="image_url" id="image_url" defaultValue={product.image_url || ''} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" />
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
          <input type="number" name="stock_quantity" id="stock_quantity" min="0" step="1" defaultValue={product.stock_quantity ?? 0} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"/>
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