// app/admin/media/page.tsx
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ImageUploadForm from '@/components/admin/media/ImageUploadForm';
import DeleteMediaItemButton from '@/components/admin/media/DeleteMediaItemButton'; // ถ้ายังต้องการปุ่มลบตรงนี้
import { Search, ExternalLink, Edit3 } from 'lucide-react'; // เพิ่มไอคอน

export const metadata: Metadata = {
  title: 'คลังมีเดีย | Admin Dashboard', // เปลี่ยน Title
  description: 'จัดการรูปภาพและแก้ไขข้อมูลเพื่อ SEO',
};

// Type MediaItem (ควรจะมาจากไฟล์ types กลาง ถ้าใช้หลายที่)
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
  publicUrl?: string; // จะถูกสร้างตอนดึงข้อมูล
};

const BUCKET_NAME = 'productimages'; 
const IMAGE_FOLDER_PATH = 'public/'; // ถ้าคุณเก็บใน subfolder นี้

export default async function ManageMediaPage({
  searchParams, // รับ searchParams สำหรับการค้นหา
}: {
  searchParams?: { q?: string };
}) {
  const supabase = await createClient();
  // ใช้ await searchParams ถ้าจำเป็นสำหรับ environment ของคุณ
  const awaitedSearchParams = searchParams ? await searchParams : { q: undefined };
  const searchTerm = awaitedSearchParams.q || '';

  let query = supabase
    .from('media') // ชื่อตาราง metadata รูปภาพของคุณ
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (searchTerm) {
    // เพิ่มเงื่อนไขการค้นหา (ตัวอย่าง: ค้นหาจาก title หรือ original_filename)
    // ใช้ ilike สำหรับ case-insensitive search
    query = query.or(`title.ilike.%${searchTerm}%,original_filename.ilike.%${searchTerm}%,alt_text.ilike.%${searchTerm}%`);
  }

  // (Optional) เพิ่ม Pagination
  const limit = 24; // จำนวนรูปต่อหน้า
  // const page = parseInt(awaitedSearchParams.page || '1', 10);
  // const offset = (page - 1) * limit;
  // query = query.range(offset, offset + limit - 1);
  query = query.limit(limit); // สำหรับตอนนี้ดึงแค่ limit ชุดแรกก่อน

  const { data: mediaItemsData, error: listError, count: totalCount } = await query.returns<Omit<MediaItem, 'publicUrl'>[]>();

  const mediaItems: MediaItem[] = mediaItemsData?.map(item => ({
    ...item,
    publicUrl: supabase.storage.from(item.storage_bucket_id).getPublicUrl(item.storage_object_path).data.publicUrl,
  })) || [];

  if (listError) {
    console.error("Error listing media items:", listError);
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">คลังมีเดียและรูปภาพ</h1>
      
      <ImageUploadForm /> {/* ส่วนอัปโหลดรูปภาพ */}

      <div className="mt-10">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border pb-6">
          <h2 className="text-xl font-semibold text-foreground">
            รูปภาพทั้งหมด ({totalCount || 0} รูป)
          </h2>
          <form method="GET" action="/admin/media" className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="search"
                name="q" // query parameter ชื่อ 'q'
                defaultValue={searchTerm}
                placeholder="ค้นหาด้วยชื่อ, title, alt text..."
                className="w-full sm:w-64 md:w-80 p-2.5 pl-10 text-sm border border-input rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-muted-foreground" />
              </div>
            </div>
            {searchTerm && (
                <Link href="/admin/media" className="text-xs text-primary hover:underline ml-2">Clear search</Link>
            )}
          </form>
        </div>

        {listError && <p className="text-destructive">ไม่สามารถโหลดรายการรูปภาพได้: {listError.message}</p>}
        
        {mediaItems && mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {mediaItems.map((item) => (
              <div key={item.id} className="group bg-card rounded-lg shadow border border-border hover:shadow-xl transition-shadow flex flex-col overflow-hidden">
                <Link 
                  href={`/admin/media/edit/${item.id}`} 
                  className="block aspect-square relative w-full overflow-hidden bg-muted"
                  title={`แก้ไข: ${item.title || item.original_filename}`}
                >
                  {item.publicUrl ? (
                    <Image 
                      src={item.publicUrl} 
                      alt={item.alt_text || item.original_filename || 'Uploaded image'} 
                      fill 
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-1">No Preview</div>
                  )}
                </Link>
                <div className="p-2.5 text-xs border-t border-border">
                  <p className="font-medium text-foreground truncate" title={item.title || item.original_filename || item.id}>
                    {item.title || item.original_filename || 'Untitled'}
                  </p>
                  <div className="mt-1.5 flex items-center justify-end gap-1.5">
                    {item.publicUrl && (
                      <a href={item.publicUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary p-1" title="ดูรูปภาพจริง">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <Link href={`/admin/media/edit/${item.id}`} className="text-primary hover:underline p-1" title="แก้ไข Metadata">
                      <Edit3 size={14} />
                    </Link>
                    <DeleteMediaItemButton 
                      mediaItemId={item.id} 
                      storageObjectPath={item.storage_object_path}
                      bucketId={item.storage_bucket_id}
                      fileName={item.original_filename || item.storage_object_path}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !listError && (
            <p className="text-muted-foreground mt-8 text-center">
              {searchTerm ? `ไม่พบรูปภาพที่ตรงกับคำค้นหา "${searchTerm}"` : 'ยังไม่มีรูปภาพในคลังมีเดีย'}
            </p>
          )
        )}
        {/* (Optional) Pagination controls */}
      </div>
    </div>
  );
}