// app/admin/products/new/page.tsx
"use client"; // ระบุว่าเป็น Client Component

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { addProductAction, type ProductActionResponse } from '@/app/admin/products/actions'; //ไปยัง actions.tstype MediaActionResponse
import MediaSelectorModal from '@/components/admin/media/MediaSelectorModal'; // ตรวจสอบ Path
import { ImageIcon, PlusCircle, XCircle } from 'lucide-react';

// Metadata ไม่สามารถ export จาก Client Component โดยตรง
// คุณจะต้องตั้งค่า Metadata ผ่าน parent Server Component (เช่น layout.tsx เฉพาะสำหรับหน้านี้)
// หรือตั้งค่าแบบ static ใน RootLayout หรือ app/admin/layout.tsx ถ้าเหมาะสม

// ไม่จำเป็นต้องรับ searchParams เป็น prop ถ้าจะใช้ useSearchParams() hook
// type AddNewProductPageProps = {
//   searchParams?: { /* ... */ };
// };

export default function AddNewProductPage(/* { searchParams: initialSearchParams } */) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedGalleryImageUrls, setSelectedGalleryImageUrls] = useState<string[]>([]);


  const [formMessage, setFormMessage] = useState<{ text?: string; type?: 'error' | 'success'; field?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);




  useEffect(() => {
    const error = searchParamsHook.get('error');
    const message = searchParamsHook.get('message');
    const success = searchParamsHook.get('success');
    const field = searchParamsHook.get('field');

    if (success && message) {
      setFormMessage({ text: decodeURIComponent(message), type: 'success' });
      // (Optional) Clear query params after displaying message
      // router.replace('/admin/products/new', { scroll: false }); 
    } else if (error && message) {
      setFormMessage({ text: decodeURIComponent(message), type: 'error', field: field || undefined });
      // (Optional) Clear query params
      // router.replace('/admin/products/new', { scroll: false });
    }
  }, [searchParamsHook, router]);

  const handleImageSelectFromMediaLibrary = (imageUrl: string, altText?: string) => {
    setSelectedImageUrl(imageUrl);
    setIsModalOpen(false);
  };

  const handleGalleryImagesSelect = (imageUrls: string[]) => {
    setSelectedGalleryImageUrls(prevUrls => {
      const newUrls = imageUrls.filter(url => !prevUrls.includes(url));
      return [...prevUrls, ...newUrls];
    });
    setIsGalleryModalOpen(false);
  };

  const removeGalleryImage = (urlToRemove: string) => {
    setSelectedGalleryImageUrls(prevUrls => prevUrls.filter(url => url !== urlToRemove));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    const formData = new FormData(event.currentTarget);
    
    if (selectedImageUrl) {
      formData.set('image_url', selectedImageUrl); // Server Action จะรับ 'image_url'
    } else {
      // ถ้าไม่มีการเลือกรูปภาพจากคลัง และฟอร์มไม่มี input 'image_url' อื่น
      // อาจจะต้อง set เป็นค่าว่าง หรือ null ตามที่ Server Action คาดหวัง
      formData.delete('image_url'); // หรือ formData.set('image_url', '');
    }

    if (selectedGalleryImageUrls.length > 0) {
      formData.set('images_json', JSON.stringify(selectedGalleryImageUrls));
    } else {
      formData.delete('images_json');
    }
    formData.delete('image_file'); 
    // ถ้าคุณไม่มี input type="file" name="image_file" ในฟอร์มนี้แล้ว ก็ไม่จำเป็นต้อง delete
    // formData.delete('image_file'); 

    // เรียก Server Action และคาดหวังผลลัพธ์ตาม MediaActionResponse
    const result: ProductActionResponse = await addProductAction(formData); 

    setIsSubmitting(false);

    if (result?.error) {
      setFormMessage({ text: result.message || result.error, type: 'error' });
    } else if (result?.success) {
      setFormMessage({ text: result.message || 'เพิ่มสินค้าสำเร็จ!', type: 'success' });
      formRef.current?.reset();
      setSelectedImageUrl('');
      // ถ้า Server Action ไม่ redirect เอง คุณสามารถ redirect จาก client ได้
      // หรือจะแสดง success message แล้วให้ user คลิกไปเอง
      // ตัวอย่าง: setTimeout(() => router.push('/admin/products'), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          กลับไปหน้ารายการสินค้า
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">เพิ่มสินค้าใหม่</h1>

      {formMessage?.text && (
        <div className={`mb-6 p-3 rounded-md text-sm ${formMessage.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/30'}`}>
          <p className={formMessage.type === 'error' ? 'font-semibold' : ''}>{formMessage.type === 'error' ? 'เกิดข้อผิดพลาด:' : 'สำเร็จ:'}</p>
          <p>{formMessage.text}</p>
          {formMessage.type === 'error' && formMessage.field && <p className="mt-1 text-xs">กรุณาตรวจสอบฟิลด์: {formMessage.field}</p>}
        </div>
      )}
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/90 mb-1.5">
            ชื่อสินค้า <span className="text-destructive">*</span>
          </label>
          <input type="text" name="name" id="name" required className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="เช่น บอนไซเพรมน่าดัด" />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Slug (สำหรับ URL)
          </label>
          <input type="text" name="slug" id="slug" className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="เช่น premna-bonsai (ปล่อยว่างเพื่อสร้างอัตโนมัติ)" />
          <p className="mt-1.5 text-xs text-muted-foreground">ภาษาอังกฤษตัวเล็ก, ตัวเลข, และขีดกลาง (-). ถ้าปล่อยว่างจะสร้างจากชื่อสินค้า.</p>
        </div>

        <div>
          <label htmlFor="product_type" className="block text-sm font-medium text-foreground/90 mb-1.5">
            ประเภทสินค้า
          </label>
          <select name="product_type" id="product_type" className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors">
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
          <input type="number" name="price" id="price" required step="0.01" min="0" className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-primary bg-background text-foreground text-sm transition-colors ${(formMessage?.type === 'error' && formMessage?.field === 'price') ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'}`} placeholder="เช่น 1500.00" />
          {/* แสดง error เฉพาะ field ถ้ามี */}
          {(formMessage?.type === 'error' && formMessage?.field === 'price' && formMessage?.text) && <p className="mt-1 text-xs text-destructive">{formMessage.text}</p>}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground/90 mb-1.5">
            คำอธิบายสินค้า
          </label>
          <textarea name="description" id="description" rows={5} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="รายละเอียดเกี่ยวกับสินค้าชิ้นนี้..."></textarea>
        </div>

        {/* ส่วนสำหรับ Media Library */}
        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1.5">
            รูปภาพหลัก
          </label>
          <div className="mt-1 flex items-center flex-wrap gap-4 p-3 border border-input rounded-lg bg-background">
            <div className="w-24 h-24 bg-muted rounded flex items-center justify-center overflow-hidden border border-dashed">
              {selectedImageUrl ? (
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
          
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-1.5">รูปภาพเพิ่มเติม (แกลเลอรี)</label>
          <div className="mt-1 p-3 border border-input rounded-lg bg-background space-y-3">
            {selectedGalleryImageUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {selectedGalleryImageUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image src={url} alt={`Gallery image ${index + 1}`} fill className="object-cover rounded-md border" />
                    <button 
                      type="button" 
                      onClick={() => removeGalleryImage(url)}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="ลบรูปนี้ออกจากแกลเลอรี"
                      disabled={isSubmitting}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsGalleryModalOpen(true)}
              className="inline-flex items-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80"
              disabled={isSubmitting}
            >
              <PlusCircle size={16} /> เพิ่มรูปภาพเข้าแกลเลอรี
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-foreground/90 mb-1.5">
            จำนวนในสต็อก (ถ้ามี)
          </label>
          <input type="number" name="stock_quantity" id="stock_quantity" min="0" step="1" defaultValue="0" className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="0" />
        </div>

        <div className="flex items-center gap-4 pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-70"
          >
            {isSubmitting ? 'กำลังเพิ่มสินค้า...' : 'เพิ่มสินค้า'}
          </button>
          <Link
            href="/admin/products"
            className="py-2.5 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </form>

      <MediaSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImageSelect={handleImageSelectFromMediaLibrary}
        currentImageUrl={selectedImageUrl}
      />

      {/* <MediaSelectorModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onImagesSelect={handleGalleryImagesSelect}
        multiSelect={true}
      />เดี๋ยวมาทำ */} 
    </div>
  );
}