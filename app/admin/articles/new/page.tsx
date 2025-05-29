// app/admin/articles/new/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { addArticleAction } from '../action';

// ... (ส่วน addArticleAction และ generateSlug ถ้ายังอยู่ในไฟล์นี้) ...

export const metadata: Metadata = {
  title: 'เพิ่มบทความใหม่ | Admin Dashboard',
  description: 'สร้างบทความใหม่สำหรับเว็บไซต์บ้านไม้ดาวิ',
};

type AddNewArticlePageProps = {
  searchParams?: {
    error?: string;
    message?: string;
  };
};

export default async function AddNewArticlePage({ searchParams }: AddNewArticlePageProps) {
  // ดึงค่าจาก searchParams มาเก็บในตัวแปรตั้งแต่ต้น
  const errorType = searchParams?.error;
  const message = searchParams?.message;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/articles" className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          กลับไปหน้ารายการบทความ
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">เพิ่มบทความใหม่</h1>

      {/* ใช้ตัวแปร errorType และ message ที่ดึงค่ามาแล้ว */}
      {errorType && message && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>{message}</p>
        </div>
      )}
      
      <form action={addArticleAction} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
        {/* ... (ส่วนฟอร์ม input ทั้งหมดเหมือนเดิม) ... */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground/90 mb-1.5">
            หัวข้อบทความ <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="ใส่หัวข้อบทความที่นี่..."
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Slug (สำหรับ URL)
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="เช่น an-example-article-slug (ปล่อยว่างเพื่อสร้างอัตโนมัติ)"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            ใช้ตัวอักษรภาษาอังกฤษตัวเล็ก, ตัวเลข, และเครื่องหมายขีดกลาง (-) (ถ้าปล่อยว่างจะสร้างจากหัวข้อให้)
          </p>
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-foreground/90 mb-1.5">
            เนื้อหาย่อ (Excerpt)
          </label>
          <textarea
            name="excerpt"
            id="excerpt"
            rows={3}
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="สรุปสั้นๆ เกี่ยวกับบทความนี้..."
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-foreground/90 mb-1.5">
            เนื้อหาบทความ <span className="text-destructive">*</span>
          </label>
          <textarea
            name="content"
            id="content"
            rows={18}
            required
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="เขียนเนื้อหาบทความของคุณที่นี่... (สามารถใช้ Markdown หรือ HTML ได้)"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            คุณสามารถใช้ Markdown หรือ HTML สำหรับการจัดรูปแบบเนื้อหา
          </p>
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-foreground/90 mb-1.5">
            URL รูปภาพปก (ถ้ามี)
          </label>
          <input
            type="url"
            name="image_url"
            id="image_url"
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="https://example.com/your-image.jpg"
          />
        </div>

        <div className="flex items-center gap-4 pt-3">
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            สร้างบทความ
          </button>
          <Link
            href="/admin/articles"
            className="py-2.5 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}