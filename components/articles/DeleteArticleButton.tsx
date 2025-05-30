// components/admin/articles/DeleteArticleButton.tsx
"use client";

import { deleteArticleAction } from "@/app/admin/articles/action"; // ตรวจสอบ path ให้ถูกต้อง
import { Trash2 } from "lucide-react";

type DeleteArticleButtonProps = {
  articleId: number;
  articleTitle: string;
};

export default function DeleteArticleButton({ articleId, articleTitle }: DeleteArticleButtonProps) {
  const boundDeleteAction = deleteArticleAction.bind(null, articleId);

  return (
    <form
      action={boundDeleteAction}
      className="inline-block" // สำคัญ: ทำให้ form ไม่กินพื้นที่ block ทั้งหมด
      onSubmit={(e) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบทความ "${articleTitle}"? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
          e.preventDefault(); 
        }
      }}
    >
      <button
        type="submit"
        className="text-destructive hover:text-destructive/80 p-1.5 rounded hover:bg-destructive/10"
        title="ลบ"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}