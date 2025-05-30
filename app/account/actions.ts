'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// (Optional) คุณสามารถสร้าง Type สำหรับ Form State เพื่อการจัดการ Error ที่ละเอียดขึ้นได้
// export type ProfileFormState = { ... };

export async function updateUserProfileAction(
  // prevState: ProfileFormState, // สำหรับใช้กับ useFormState
  formData: FormData
): Promise<void> { // เปลี่ยนเป็น Promise<void> เพื่อให้เข้ากับ form action แบบง่าย
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[UpdateProfile] Error: User not authenticated.');
    // โดยทั่วไป Server Action นี้ควรจะถูกเรียกโดยผู้ใช้ที่ล็อกอินแล้วเท่านั้น
    // การ redirect นี้เป็น fallback
    return redirect('/login?error=auth_required&message=Please login to update your profile.');
  }

  const username = formData.get('username') as string | null;
  const fullName = formData.get('full_name') as string | null;
  const website = formData.get('website') as string | null;
  const avatarUrl = formData.get('avatar_url') as string | null;

  // --- Validation พื้นฐาน ---
  if (!username || username.trim() === '') {
    const message = 'Username เป็นฟิลด์ที่จำเป็น';
    console.error(`[UpdateProfile] Validation: ${message}`);
    return redirect(`/account?error=validation&field=username&message=${encodeURIComponent(message)}`);
  }
  // คุณสามารถเพิ่ม Validation อื่นๆ ได้ตามต้องการ เช่น รูปแบบ URL, ความยาวข้อความ

  const profileUpdateData = {
    username: username.trim(),
    full_name: fullName?.trim() || null,
    website: website?.trim() || null,
    avatar_url: avatarUrl?.trim() || null,
    updated_at: new Date().toISOString(), // DB trigger ของคุณน่าจะจัดการ updated_at ให้อยู่แล้ว แต่ใส่ไว้ก็ไม่เสียหาย
  };

  const { error: updateError } = await supabase
    .from('profiles')
    .update(profileUpdateData)
    .eq('id', user.id); // *** สำคัญมาก: อัปเดตเฉพาะโปรไฟล์ของ user ที่กำลังล็อกอินอยู่เท่านั้น ***

  if (updateError) {
    console.error('[UpdateProfile] Supabase error updating profile:', updateError);
    let userMessage = `เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์: ${updateError.message}`;
    if (updateError.code === '23505' && updateError.message.includes('profiles_username_key')) {
      userMessage = 'Username นี้มีผู้ใช้งานแล้ว กรุณาเลือก Username อื่น';
    }
    return redirect(`/account?error=db_error&message=${encodeURIComponent(userMessage)}`);
  }

  revalidatePath('/account'); // Revalidate หน้า account เพื่อให้แสดงข้อมูลใหม่
  // revalidatePath('/'); // ถ้าหน้าแรกแสดงข้อมูล user ที่อาจจะเปลี่ยนไป ก็ revalidate ด้วย

  const successMessage = 'อัปเดตโปรไฟล์เรียบร้อยแล้ว!';
  redirect(`/account?success=true&message=${encodeURIComponent(successMessage)}`);
}