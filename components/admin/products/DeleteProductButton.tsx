// components/admin/products/DeleteProductButton.tsx
"use client";

import { deleteProductAction } from "@/app/admin/products/actions"; // ตรวจสอบ Path
import { Trash2 } from "lucide-react";

type DeleteProductButtonProps = {
  productId: number;
  productName: string;
};

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const boundDeleteAction = deleteProductAction.bind(null, productId);

  return (
    <form
      action={boundDeleteAction}
      className="inline-block"
      onSubmit={(e) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${productName}"? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
          e.preventDefault();
        }
        // ถ้า confirm, form จะ submit และเรียก boundDeleteAction
        // ควรจะมีการ handle return value จาก action เพื่อแสดง feedback (เช่น alert)
        // หรือใช้ useFormState เพื่อ UX ที่ดีขึ้น
      }}
    >
      <button
        type="submit"
        className="text-destructive hover:text-destructive/80 p-1.5 rounded hover:bg-destructive/10"
        title="ลบสินค้า"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}