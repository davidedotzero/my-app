// app/admin/media/page.tsx
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link'; // ไม่จำเป็นถ้าไม่มีลิงก์อื่น
import Image from 'next/image';
import ImageUploadForm from '@/components/admin/media/ImageUploadForm';
import EditMediaItemForm from '@/components/admin/media/EditMediaItemForm'; // <--- Component ใหม่
import DeleteMediaItemButton from '@/components/admin/media/DeleteMediaItemButton'; // <--- Component ใหม่


export const metadata: Metadata = {
  title: 'จัดการรูปภาพ (Media) | Admin Dashboard',
  description: 'อัปโหลด ดู และจัดการ metadata รูปภาพในระบบ',
};

// Type สำหรับ Media Item จากตาราง media_items
export type MediaItem = {
  id: string; // UUID
  storage_bucket_id: string;
  storage_object_path: string;
  alt_text: string | null;
  title: string | null;
  caption: string | null;
  original_filename: string | null;
  mime_type: string | null;
  size_kb: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  // (Optional) เพิ่ม publicUrl ที่สร้างขึ้นมา
  publicUrl?: string;
};

export default async function ManageMediaPage() {
  const supabase = await createClient();

  const { data: mediaItemsData, error: listError } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50) // (Optional) เพิ่ม Pagination ทีหลัง
    .returns<MediaItem[]>();

  const mediaItems = mediaItemsData?.map(item => ({
    ...item,
    publicUrl: supabase.storage.from(item.storage_bucket_id).getPublicUrl(item.storage_object_path).data.publicUrl
  })) || [];


  if (listError) {
    console.error("Error listing media items:", listError);
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">จัดการรูปภาพ (Media Library)</h1>
      <ImageUploadForm />

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-foreground mb-6">รายการรูปภาพ</h2>
        {listError && <p className="text-destructive">ไม่สามารถโหลดรายการรูปภาพได้: {listError.message}</p>}
        
        {mediaItems && mediaItems.length > 0 ? (
          <div className="space-y-6">
            {mediaItems.map((item) => (
              <div key={item.id} className="bg-card p-4 rounded-lg shadow border border-border flex flex-col md:flex-row gap-4">
                <div className="md:w-1/4 flex-shrink-0">
                  {item.publicUrl && (
                    <Image 
                      src={item.publicUrl} 
                      alt={item.alt_text || item.original_filename || 'Uploaded image'} 
                      width={200} 
                      height={200}
                      className="object-contain rounded-md w-full h-auto max-h-48 md:max-h-full" 
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <EditMediaItemForm item={item} /> {/* Component สำหรับฟอร์มแก้ไข */}
                </div>
                <div className="flex-shrink-0 pt-2 md:pt-0">
                   <DeleteMediaItemButton 
                    mediaItemId={item.id} 
                    storageObjectPath={item.storage_object_path}
                    bucketId={item.storage_bucket_id}
                    fileName={item.original_filename || item.storage_object_path}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          !listError && <p className="text-muted-foreground mt-4">ไม่พบรูปภาพในระบบ</p>
        )}
      </div>
    </div>
  );
}