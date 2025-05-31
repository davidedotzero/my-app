// components/admin/media/ImageUploadForm.tsx
"use client";

import { useState, useRef } from 'react';
import { uploadImagesAction, type MediaActionResponse } from '@/app/admin/media/actions'; // ตรวจสอบ Path
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

type UploadResult = {
  name: string;
  url: string;
};

export default function ImageUploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  // ใช้ MediaActionResponse สำหรับ uploadStatus state
  const [uploadStatus, setUploadStatus] = useState<MediaActionResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData(event.currentTarget);
    const result: MediaActionResponse = await uploadImagesAction(formData); // กำหนด Type ให้ result ด้วย

    setIsUploading(false);
    setUploadStatus(result);

    // result.success ควรจะเข้าถึงได้แล้วถ้า MediaActionResponse ถูกต้อง
    if (result.success && fileInputRef.current) { 
      fileInputRef.current.value = ""; 
    }
  };


  return (
    <div className="mb-8 p-6 bg-card rounded-xl shadow-lg border border-border">
      <h2 className="text-xl font-semibold text-card-foreground mb-4">อัปโหลดรูปภาพใหม่</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="imageFiles" className="block text-sm font-medium text-foreground/90 mb-1.5">
            เลือกไฟล์รูปภาพ (เลือกได้หลายไฟล์)
          </label>
          <input
            type="file"
            name="imageFiles" // ชื่อนี้ต้องตรงกับที่ Server Action ใช้ (formData.getAll('imageFiles'))
            id="imageFiles"
            multiple // อนุญาตให้เลือกหลายไฟล์
            accept="image/png, image/jpeg, image/webp, image/gif"
            ref={fileInputRef}
            required
            className="w-full text-sm text-slate-500 dark:text-slate-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary/10 file:text-primary dark:file:bg-primary/20 dark:file:text-primary
                       hover:file:bg-primary/20 dark:hover:file:bg-primary/30
                       cursor-pointer border border-input rounded-lg 
                       focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
            disabled={isUploading}
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-5 rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-70"
        >
          {isUploading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              กำลังอัปโหลด...
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              อัปโหลด
            </>
          )}
        </button>
      </form>

      {/* แสดงผลลัพธ์การอัปโหลด */}
      {uploadStatus && (
        <div className={`mt-4 p-3 rounded-md text-sm ${uploadStatus.error ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/30'}`}>
          {uploadStatus.error && <p className="font-semibold mb-1 flex items-center gap-2"><AlertCircle size={16}/>เกิดข้อผิดพลาด:</p>}
          {uploadStatus.success && <p className="font-semibold mb-1 flex items-center gap-2"><CheckCircle size={16}/>อัปโหลดสำเร็จ:</p>}
          <p className="whitespace-pre-wrap">{uploadStatus.message || uploadStatus.error}</p>
          {uploadStatus.uploadedFiles && uploadStatus.uploadedFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium">ไฟล์ที่อัปโหลด:</p>
              <ul className="list-disc list-inside text-xs">
                {uploadStatus.uploadedFiles.map(file => (
                  <li key={file.url}><a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{file.name}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}