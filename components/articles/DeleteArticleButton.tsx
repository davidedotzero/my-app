// components/admin/articles/DeleteArticleButton.tsx
"use client";

import { deleteArticleAction } from "@/app/admin/articles/action"; // ตรวจสอบ path ให้ถูกต้อง
import { Trash2 } from "lucide-react";
// import { useRouter } from "next/navigation"; // (Optional) ถ้าต้องการ refresh เอง

type DeleteArticleButtonProps = {
  articleId: number;
  articleTitle: string;
};

export default function DeleteArticleButton({ articleId, articleTitle }: DeleteArticleButtonProps) {
  // const router = useRouter();

  // ผูก articleId เข้ากับ Server Action โดยตรง
  // Server Action นี้ (deleteArticleAction) ตอนนี้ return Promise<void> ซึ่งเข้ากันได้กับ 'action' prop
  const boundDeleteAction = deleteArticleAction.bind(null, articleId);

  return (
    <form
      action={boundDeleteAction}
      className="inline-block"
      onSubmit={(e) => {
        // การ confirm จะเกิดขึ้นที่ onSubmit ของ form ฝั่ง client
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบทความ "${articleTitle}"? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
          e.preventDefault(); // ถ้าผู้ใช้กด Cancel ให้หยุดการ submit form
        }
        // ถ้าผู้ใช้กด OK, form จะถูก submit และเรียก boundDeleteAction
        // หลังจาก action ทำงานเสร็จ (และ revalidate paths), UI ควรจะ update
        // ถ้าต้องการ feedback เพิ่มเติม (เช่น toast "ลบสำเร็จแล้ว") อาจจะต้องใช้ state ใน component นี้
        // หรือพิจารณาใช้ useFormState สำหรับ form ที่ซับซ้อนขึ้น
      }}
    >
      <button
        type="submit"
        className="text-destructive hover:text-destructive/80 p-1.5 rounded hover:bg-destructive/10 disabled:opacity-50"
        title="ลบ"
        // aria-disabled={pending} // ถ้าใช้ useFormStatus สามารถเพิ่มได้
      >
        <Trash2 size={16} />
        {/* {pending ? "กำลังลบ..." : <Trash2 size={16} />} */}
      </button>
    </form>
  );
}