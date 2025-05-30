'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ฟังก์ชันสำหรับ Admin เพื่ออัปเดต Role ของ User
export async function updateUserRoleAction(userId: string, newRole: string): Promise<{ success?: string; error?: string }> {
  if (!userId || !newRole) {
    return { error: 'User ID และ Role ใหม่เป็นฟิลด์ที่จำเป็น' };
  }

  // (Optional) ตรวจสอบว่า newRole เป็นค่าที่ถูกต้อง (เช่น 'user', 'admin', 'editor')
  const validRoles = ['user', 'admin', 'editor']; // ตัวอย่าง
  if (!validRoles.includes(newRole)) {
    return { error: `Role "${newRole}" ไม่ถูกต้อง` };
  }

  const supabase = await createClient();

  // ก่อนอื่น ตรวจสอบว่าผู้ใช้ที่กำลังดำเนินการนี้เป็น Admin จริงหรือไม่
  // (ถึงแม้ AdminLayout จะป้องกันแล้ว แต่การเช็คใน Action เป็น good practice)
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) {
    return { error: 'ไม่ได้รับอนุญาต: ไม่พบข้อมูลผู้ใช้ปัจจุบัน' };
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminUser.id)
    .single();

  if (adminProfileError || !adminProfile || adminProfile.role !== 'admin') {
    return { error: 'ไม่ได้รับอนุญาต: คุณไม่ใช่ Admin' };
  }

  // ดำเนินการอัปเดต Role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() }) // อัปเดต role และ updated_at
    .eq('id', userId);

  if (updateError) {
    console.error(`[UpdateUserRole] Supabase Error updating role for user ${userId}:`, updateError);
    return { error: `ไม่สามารถอัปเดต Role ได้: ${updateError.message}` };
  }

  console.log(`[UpdateUserRole] Role for user ${userId} updated to ${newRole} successfully.`);
  revalidatePath('/admin/users'); // Revalidate หน้า User list

  return { success: `Role ของ User ID: ${userId} ถูกอัปเดตเป็น ${newRole} เรียบร้อยแล้ว` };
}