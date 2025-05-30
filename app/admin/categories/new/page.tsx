import type { Metadata } from 'next';
import Link from 'next/link';
import { addCategoryAction } from '@/app/admin/categories/actions'; // Import Server Action

export const metadata: Metadata = {
  title: 'เพิ่มหมวดหมู่ใหม่ | Admin Dashboard',
  description: 'สร้างหมวดหมู่ใหม่สำหรับบทความในเว็บไซต์บ้านไม้ดาวิ',
};

type AddNewCategoryPageProps = {
  searchParams?: {
    error?: string;
    message?: string;
    success?: string;
  };
};

export default async function AddNewCategoryPage({ searchParams }: AddNewCategoryPageProps) {
  // ใช้ await searchParams ตามที่คุณเคยทดลองแล้วได้ผล
  const awaitedSearchParams = searchParams ? await searchParams : {};
  const errorType = awaitedSearchParams.error;
  const message = awaitedSearchParams.message;
  const success = awaitedSearchParams.success;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          กลับไป Dashboard หลัก
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">เพิ่มหมวดหมู่ใหม่</h1>

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

      <form action={addCategoryAction} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/90 mb-1.5">
            ชื่อหมวดหมู่ (ภาษาไทยได้) <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="เช่น การดูแลบอนไซ, สวนหินเซน"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Slug (ภาษาอังกฤษ สำหรับ URL)
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="เช่น bonsai-care (ปล่อยว่างเพื่อสร้างอัตโนมัติ)"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            ใช้ตัวอักษรภาษาอังกฤษตัวเล็ก, ตัวเลข, และขีดกลาง (-). ถ้าปล่อยว่างจะสร้างจากชื่อหมวดหมู่ให้ (ถ้าชื่อเป็นภาษาอังกฤษ).
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground/90 mb-1.5">
            คำอธิบายสั้นๆ (ถ้ามี)
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="คำอธิบายสั้นๆ เกี่ยวกับหมวดหมู่นี้..."
          />
        </div>

        <div className="flex items-center gap-4 pt-3">
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            เพิ่มหมวดหมู่
          </button>
          <Link
            href="/admin/articles" // หรือ /admin/categories ถ้ามีหน้ารวมหมวดหมู่
            className="py-2.5 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}