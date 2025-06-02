// app/admin/products/import-csv/page.tsx
"use client"; // หน้านี้จะเป็น Client Component เพื่อจัดการ Form State และ Feedback

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation'; // สำหรับอ่าน query params
import { importProductsFromCsvAction, type CsvImportResponse } from '../actions'; // สมมติว่า Action อยู่ใน ../actions
import { UploadCloud, AlertCircle, CheckCircle, Download } from 'lucide-react';

// Metadata ไม่สามารถ export จาก Client Component โดยตรง
// เราสามารถตั้ง Title ผ่าน document.title ใน useEffect หรือตั้งใน layout ที่ครอบหน้านี้

export default function ImportCsvPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<CsvImportResponse | null>(null);

  // อ่าน message จาก query params ตอนโหลดหน้า (ถ้ามีการ redirect กลับมา)
  useEffect(() => {
    const error = searchParamsHook.get('error');
    const message = searchParamsHook.get('message');
    const successCount = searchParamsHook.get('successCount');
    const errorCount = searchParamsHook.get('errorCount');
    const errorDetails = searchParamsHook.get('errorDetails');

    if (message) {
      setFormMessage({
        error: error ? decodeURIComponent(message) : undefined,
        successMessage: !error ? decodeURIComponent(message) : undefined,
        totalProcessed: 0, // อาจจะต้องส่งค่านี้กลับมาด้วยถ้าต้องการ
        successCount: successCount ? parseInt(successCount) : 0,
        errorCount: errorCount ? parseInt(errorCount) : 0,
        errorDetails: errorDetails ? JSON.parse(decodeURIComponent(errorDetails)) : undefined,
      });
      // (Optional) Clear query params
      // router.replace('/admin/products/import-csv', { scroll: false });
    }
  }, [searchParamsHook, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    const formData = new FormData(event.currentTarget);
    const result = await importProductsFromCsvAction(formData); // เรียก Server Action

    setIsSubmitting(false);
    setFormMessage(result);

    if (result?.successMessage && formRef.current) {
      formRef.current.reset(); // Reset file input
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          กลับไปหน้ารายการสินค้า
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">อัปโหลดข้อมูลสินค้าจาก CSV</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        ใช้สำหรับเพิ่มสินค้าหลายรายการพร้อมกัน โปรดใช้ไฟล์ CSV ที่มี Format ที่ถูกต้อง
        คุณสามารถดาวน์โหลด Template ได้ <a href="/product_import_template.csv" download className="text-primary hover:underline font-medium">ที่นี่</a>
      </p>

      {/* แสดง Success/Error message จาก Server Action */}
      {formMessage?.successMessage && (
        <div className="mb-6 p-4 rounded-md bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
          <p className="font-semibold flex items-center gap-2"><CheckCircle size={18}/>ดำเนินการสำเร็จ!</p>
          <p>{formMessage.successMessage}</p>
          {typeof formMessage.successCount === 'number' && <p>จำนวนสินค้าที่เพิ่มสำเร็จ: {formMessage.successCount} รายการ</p>}
          {typeof formMessage.errorCount === 'number' && formMessage.errorCount > 0 && <p>จำนวนสินค้าที่เกิดข้อผิดพลาด: {formMessage.errorCount} รายการ</p>}
        </div>
      )}
      {formMessage?.error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold flex items-center gap-2"><AlertCircle size={18}/>เกิดข้อผิดพลาด:</p>
          <p className="whitespace-pre-wrap">{formMessage.error}</p>
        </div>
      )}
      {formMessage?.errorDetails && formMessage.errorDetails.length > 0 && (
         <div className="mb-6 p-4 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
             <p className="font-semibold">รายละเอียดข้อผิดพลาดรายแถว:</p>
             <ul className="list-disc list-inside mt-1 text-xs">
                 {formMessage.errorDetails.map((detail, index) => (
                     <li key={index}>แถวที่ {detail.row}: {detail.error}</li>
                 ))}
             </ul>
         </div>
      )}


      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
        <div>
          <label htmlFor="csvFile" className="block text-sm font-medium text-foreground/90 mb-1.5">
            เลือกไฟล์ CSV <span className="text-destructive">*</span>
          </label>
          <input
            type="file"
            name="csvFile" // ชื่อนี้ Server Action จะใช้ formData.get('csvFile')
            id="csvFile"
            required
            accept=".csv, text/csv"
            className="w-full text-sm text-slate-500 dark:text-slate-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary/10 file:text-primary dark:file:bg-primary/20 dark:file:text-primary
                       hover:file:bg-primary/20 dark:hover:file:bg-primary/30
                       cursor-pointer border border-input rounded-lg 
                       focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
            disabled={isSubmitting}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            รองรับไฟล์ .csv ที่เข้ารหัสแบบ UTF-8 เท่านั้น
          </p>
        </div>

        <div className="flex items-center gap-4 pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                กำลังประมวลผล...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                อัปโหลดและนำเข้าข้อมูล
              </>
            )}
          </button>
          <Link
            href="/admin/products"
            className="py-2.5 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}