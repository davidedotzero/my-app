// app/admin/products/edit/[id]/page.tsx
"use client"; // <<< --- ระบุว่าเป็น Client Component ---

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, notFound, useParams } // useParams สำหรับ Client Component
  from 'next/navigation'; 
import Link from 'next/link';
import Image from 'next/image';
// ตรวจสอบ Path การ import updateProductAction และ ProductActionResponse ให้ถูกต้อง
import { updateProductAction, type ProductActionResponse } from '../../actions'; 
import MediaSelectorModal from '@/components/admin/media/MediaSelectorModal';
import { ImageIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client'; // <<< --- ใช้ Client-side Supabase Client ---

// Type Product และ Category (ควรจะมาจากไฟล์ types กลาง)
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
  created_at: string; // อาจจะไม่จำเป็นต้องใช้ในฟอร์ม แต่มีไว้ถ้า select *
  updated_at: string; // อาจจะไม่จำเป็นต้องใช้ในฟอร์ม
};

type Category = {
  id: number;
  name: string;
};

// Metadata ไม่สามารถ export จาก Client Component โดยตรง
// คุณจะต้องจัดการ Metadata ผ่าน parent Server Component (layout.tsx เฉพาะ)
// หรือใช้ document.title ใน useEffect (ไม่ดีต่อ SEO เท่า)

export default function EditProductPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const routeParams = useParams(); // Hook สำหรับอ่าน route params ใน Client Component

  const productIdString = typeof routeParams.id === 'string' ? routeParams.id : '';
  const productId = parseInt(productIdString, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [formMessage, setFormMessage] = useState<{ text?: string; type?: 'error' | 'success'; field?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect สำหรับอ่าน searchParams (error/success messages)
  useEffect(() => {
    const error = searchParamsHook.get('error');
    const message = searchParamsHook.get('message');
    const field = searchParamsHook.get('field');
    const success = searchParamsHook.get('success');

    if (success && message) {
      setFormMessage({ text: decodeURIComponent(message), type: 'success' });
    } else if (error && message) {
      setFormMessage({ text: decodeURIComponent(message), type: 'error', field: field || undefined });
    }
  }, [searchParamsHook]);

  // useEffect สำหรับดึงข้อมูล Product และ Categories ตอน Component โหลด
  useEffect(() => {
    if (isNaN(productId)) {
      notFound(); // หรือ router.push('/404')
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);
      const supabase = createClient(); // Client-side client

      // 1. ดึงข้อมูล Product
      const { data: productData, error: productFetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single<Product>();

      if (productFetchError || !productData) {
        console.error(`Error fetching product (ID: ${productId}) for edit:`, productFetchError);
        setFetchError(productFetchError?.message || 'ไม่พบข้อมูลสินค้า');
        setLoading(false);
        // notFound(); // การเรียก notFound() ใน client component จะซับซ้อนกว่า อาจจะต้อง redirect หรือแสดง UI error
        return;
      }
      setProduct(productData);
      setSelectedImageUrl(productData.image_url || ''); // ตั้งค่ารูปที่เลือกไว้เริ่มต้น

      // 2. ดึง Categories
      const { data: categoriesData, error: categoriesFetchError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (categoriesFetchError) {
        console.error("Error fetching categories for edit form:", categoriesFetchError);
        setFetchError((prevError) => prevError ? `${prevError}\n ไม่สามารถโหลดหมวดหมู่ได้` : 'ไม่สามารถโหลดหมวดหมู่ได้');
      } else if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }
      setLoading(false);
    };

    fetchData();
  }, [productId]); // ทำงานเมื่อ productId เปลี่ยน

  const handleImageSelectFromMediaLibrary = (imageUrl: string, altText?: string) => {
    setSelectedImageUrl(imageUrl);
    setIsModalOpen(false);
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    const formData = new FormData(event.currentTarget);
    if (selectedImageUrl) {
      formData.set('image_url', selectedImageUrl);
    } else {
      formData.delete('image_url'); 
    }
    formData.delete('image_file'); // ถ้าไม่มี input image_file แล้ว ก็ไม่เป็นไร

    // Server Action updateProductAction ควรจะรับ (productId, currentSlug, currentProductType, formData)
    // currentSlug และ currentProductType ควรจะมาจาก product state ที่ fetch มา
    if (!product) {
        setFormMessage({text: "ไม่พบข้อมูลสินค้าที่จะอัปเดต", type: 'error'});
        setIsSubmitting(false);
        return;
    }

    const result: ProductActionResponse = await updateProductAction(
      product.id, 
      product.slug, // currentSlugFromDb
      product.product_type, // currentProductType
      formData
    );

    setIsSubmitting(false);

    if (result?.error) {
      setFormMessage({ text: result.message || result.error, type: 'error', field: result.field });
    } else if (result?.success) {
      setFormMessage({ text: result.message || 'อัปเดตสินค้าสำเร็จ!', type: 'success' });
      // ไม่จำเป็นต้อง reset form ที่นี่ เพราะ server action จะ redirect (ถ้าเราเขียนให้ redirect)
      // หรือถ้า server action ไม่ redirect หน้านี้จะ re-render จาก revalidatePath
      // และ useEffect ด้านบนจะอ่าน success message จาก searchParams ใหม่
      // หรือถ้า action return ID: router.push(`/admin/products/edit/${result.productId}?success=true&message=...`);
      // แต่ถ้า action redirect เองไปที่ /admin/products หน้านี้ก็จะ unmount
      alert(result.message); // แสดง alert แบบง่าย
      router.push(`/admin/products?message=${encodeURIComponent(result.message || 'อัปเดตสำเร็จ!')}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <p className="text-muted-foreground">กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <h1 className="text-2xl font-semibold mb-4 text-destructive">เกิดข้อผิดพลาด</h1>
        <p className="text-muted-foreground">{fetchError || 'ไม่พบข้อมูลสินค้าที่คุณต้องการแก้ไข'}</p>
        <Link href="/admin/products" className="mt-6 inline-block text-primary hover:underline">กลับไปหน้ารายการสินค้า</Link>
      </div>
    );
  }

  // ผูก Server Action กับ FormData
  // const updateActionWithParams = updateProductAction.bind(null, product.id, product.slug, product.product_type);
  // เราจะเรียก action โดยตรงใน handleSubmit แทนการ bind กับ form action prop เพราะเราจัดการ submit เอง

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

      {formMessage?.text && (
        <div className={`mb-6 p-3 rounded-md text-sm ${formMessage.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/30'}`}>
          <p className={formMessage.type === 'error' ? 'font-semibold' : ''}>{formMessage.type === 'error' ? 'เกิดข้อผิดพลาด:' : 'สำเร็จ:'}</p>
          <p>{formMessage.text}</p>
          {formMessage.type === 'error' && formMessage.field && <p className="mt-1 text-xs">กรุณาตรวจสอบฟิลด์: {formMessage.field}</p>}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
        {/* Hidden input for current_image_url ไม่จำเป็นถ้า Server Action ไม่ได้ใช้แล้ว */}
        {/* <input type="hidden" name="current_image_url" value={product.image_url || ''} /> */}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/90 mb-1.5">ชื่อสินค้า <span className="text-destructive">*</span></label>
          <input type="text" name="name" id="name" required defaultValue={product.name} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"/>
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground/90 mb-1.5">Slug (สำหรับ URL)</label>
          <input type="text" name="slug" id="slug" defaultValue={product.slug} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="ปล่อยว่างเพื่อสร้างจากชื่อสินค้า"/>
          <p className="mt-1.5 text-xs text-muted-foreground">ถ้ามีการเปลี่ยนแปลง จะส่งผลต่อ URL</p>
        </div>
        <div>
          <label htmlFor="product_type" className="block text-sm font-medium text-foreground/90 mb-1.5">ประเภทสินค้า</label>
          <select name="product_type" id="product_type" defaultValue={product.product_type || ""} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors">
            <option value="">-- เลือกประเภท --</option>
            <option value="bonsai">บอนไซ</option>
            <option value="zen-garden">สวนหินเซน</option>
            <option value="terrarium">สวนในขวดแก้ว</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-foreground/90 mb-1.5">ราคา (บาท) <span className="text-destructive">*</span></label>
          <input type="number" name="price" id="price" required step="0.01" min="0" defaultValue={product.price} className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-primary bg-background text-foreground text-sm transition-colors ${(formMessage?.type === 'error' && formMessage?.field === 'price') ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'}`} />
          {(formMessage?.type === 'error' && formMessage?.field === 'price' && formMessage?.text) && <p className="mt-1 text-xs text-destructive">{formMessage.text}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground/90 mb-1.5">คำอธิบายสินค้า</label>
          <textarea name="description" id="description" rows={5} defaultValue={product.description || ''} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"></textarea>
        </div>

        {/* ส่วนเลือกรูปภาพหลักจาก Media Library */}
        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1.5">รูปภาพหลัก</label>
          <div className="mt-1 flex items-center flex-wrap gap-4 p-3 border border-input rounded-lg bg-background">
            <div className="w-24 h-24 bg-muted rounded flex items-center justify-center overflow-hidden border border-dashed">
              {selectedImageUrl ? ( // ใช้ selectedImageUrl ที่มาจาก state
                <Image src={selectedImageUrl} alt="Preview รูปภาพที่เลือก" width={96} height={96} className="object-contain"/>
              ) : (
                <ImageIcon size={32} className="text-muted-foreground" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-4 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 whitespace-nowrap"
              disabled={isSubmitting}
            >
              เลือกจากคลังมีเดีย
            </button>
          </div>
           <p className="mt-1.5 text-xs text-muted-foreground">
            รูปภาพปัจจุบันจะถูกใช้ถ้าไม่ได้เลือกรูปใหม่จากคลังมีเดีย
          </p>
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-foreground/90 mb-1.5">URL รูปภาพเพิ่มเติม (คั่นด้วยลูกน้ำ ,)</label>
          <textarea name="images" id="images" rows={3} defaultValue={product.images?.join(', ') || ''} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"></textarea>
        </div>
        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-foreground/90 mb-1.5">จำนวนในสต็อก</label>
          <input type="number" name="stock_quantity" id="stock_quantity" min="0" step="1" defaultValue={product.stock_quantity ?? 0} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" />
        </div>
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-foreground/90 mb-1.5">หมวดหมู่บทความ (Category)</label>
          <select name="category_id" id="category_id" defaultValue={product.category_id?.toString() || ""} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors">
            <option value="">-- ไม่ระบุหมวดหมู่ --</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id.toString()}>{category.name}</option>
            ))}
          </select>
          {!categories && <p className="mt-1 text-xs text-destructive">ไม่สามารถโหลดรายการหมวดหมู่ได้</p>}
        </div>

        <div className="flex items-center gap-4 pt-3">
          <button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-70">
            {isSubmitting ? 'กำลังอัปเดต...' : 'อัปเดตสินค้า'}
          </button>
          <Link href="/admin/products" className="py-2.5 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            ยกเลิก
          </Link>
        </div>
      </form>

      <MediaSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImageSelect={handleImageSelectFromMediaLibrary}
        currentImageUrl={selectedImageUrl} // ส่ง URL ปัจจุบันไปให้ Modal (ถ้าต้องการ)
      />
    </div>
  );
}