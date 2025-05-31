import type { Metadata } from 'next';
import Link from 'next/link';
import { addProductAction } from '@/app/admin/products/actions'; // Import Server Action

export const metadata: Metadata = {
  title: 'เพิ่มสินค้าใหม่ | Admin Dashboard',
  description: 'สร้างรายการสินค้าใหม่สำหรับ บ้านไม้ดาวิ (ไดกิ บอนไซ)',
};

type AddNewProductPageProps = {
  searchParams?: {
    error?: string;
    message?: string;
    field?: string;
    success?: string;
  };
};

export default async function AddNewProductPage({ searchParams }: AddNewProductPageProps) {
  const awaitedSearchParams = searchParams ? await searchParams : {};
  const errorType = awaitedSearchParams.error;
  const message = awaitedSearchParams.message;
  const fieldError = awaitedSearchParams.field;
  const success = awaitedSearchParams.success;

  // (Optional) ดึง Product Types มาสำหรับ Dropdown ถ้าต้องการ
  // const productTypes = ["bonsai", "zen-garden", "terrarium"]; // หรือดึงจาก DB ถ้ามีตารางแยก

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          กลับไปหน้ารายการสินค้า
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">เพิ่มสินค้าใหม่</h1>

      {success && message && (
        <div className="mb-6 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
          <p>{decodeURIComponent(message)}</p>
        </div>
      )}
      {errorType && message && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>{decodeURIComponent(message)}</p>
        </div>
      )}

      <form action={addProductAction} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
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
            {/* (Optional) ดึงมาจากตาราง product_categories ถ้ามี */}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-foreground/90 mb-1.5">
            ราคา (บาท) <span className="text-destructive">*</span>
          </label>
          <input type="number" name="price" id="price" required step="0.01" min="0" className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="เช่น 1500.00" />
          {fieldError === 'price' && message && <p className="mt-1 text-xs text-destructive">{decodeURIComponent(message)}</p>}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground/90 mb-1.5">
            คำอธิบายสินค้า
          </label>
          <textarea name="description" id="description" rows={5} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="รายละเอียดเกี่ยวกับสินค้าชิ้นนี้..."></textarea>
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-foreground/90 mb-1.5">
            URL รูปภาพหลัก
          </label>
          <input type="url" name="image_url" id="image_url" className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="https://example.com/main-product-image.jpg" />
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-foreground/90 mb-1.5">
            URL รูปภาพเพิ่มเติม (แกลเลอรี, คั่นด้วยลูกน้ำ ,)
          </label>
          <textarea name="images" id="images" rows={3} className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"></textarea>
        </div>
        
        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-foreground/90 mb-1.5">
            จำนวนในสต็อก (ถ้ามี)
          </label>
          <input type="number" name="stock_quantity" id="stock_quantity" min="0" step="1" className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors" placeholder="0" />
        </div>

        <div className="flex items-center gap-4 pt-3">
          <button type="submit" className="bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm">
            เพิ่มสินค้า
          </button>
          <Link href="/admin/products" className="py-2.5 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}