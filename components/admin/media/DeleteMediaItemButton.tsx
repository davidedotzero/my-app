// components/admin/media/DeleteMediaItemButton.tsx
"use client";

import { deleteMediaItemAction } from '@/app/admin/media/actions'; // ตรวจสอบ Path
import { Trash2 } from "lucide-react";

type Props = {
  mediaItemId: string;
  storageObjectPath: string;
  bucketId: string;
  fileName: string; // หรือ original_filename
};

export default function DeleteMediaItemButton({ mediaItemId, storageObjectPath, bucketId, fileName }: Props) {
  const handleSubmit = async () => {
    const result = await deleteMediaItemAction(mediaItemId, storageObjectPath, bucketId);
    if (result.error) {
      alert(`เกิดข้อผิดพลาด: ${result.error}`);
    } else if (result.success) {
      alert(result.message || 'ลบรูปภาพสำเร็จ');
      // revalidatePath จาก Server Action ควรจะ refresh list
    }
  };

  return (
    <form 
      action={handleSubmit}
      onSubmit={(e) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพ "${fileName}" ทั้งจากระบบและ Storage? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md"
        title={`ลบรูปภาพ ${fileName}`}
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}