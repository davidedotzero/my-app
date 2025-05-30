// app/admin/categories/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// ฟังก์ชัน generateSlug (ควรจะย้ายไป utils ถ้าใช้หลายที่)
function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u0E00-\u0E7F]+/g, '') // ลบอักขระภาษาไทยสำหรับ slug
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function addCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  let slug = formData.get('slug') as string;
  const description = formData.get('description') as string | null;

  // --- ตรวจสอบสิทธิ์ Admin ---
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login?error=auth_required&message=Please log in');
  }
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') {
    return redirect('/admin?error=unauthorized&message=You are not authorized for this action');
  }
  // --- สิ้นสุดการตรวจสอบสิทธิ์ Admin ---

  if (!name) {
    const message = 'ชื่อหมวดหมู่ (Name) เป็นฟิลด์ที่จำเป็น';
    return redirect(`/admin/categories/new?error=validation&message=${encodeURIComponent(message)}`);
  }

  if (!slug) {
    slug = generateSlug(name);
    if (!slug) {
      const message = 'ไม่สามารถสร้าง Slug จากชื่อหมวดหมู่ได้ (อาจเป็นเพราะมีแต่ภาษาไทยหรืออักขระพิเศษ) กรุณากรอก Slug เป็นภาษาอังกฤษเอง';
      return redirect(`/admin/categories/new?error=slug_generation&message=${encodeURIComponent(message)}`);
    }
  } else {
    slug = generateSlug(slug); // Clean slug ที่ผู้ใช้กรอก
  }
  if(!slug) { // ตรวจสอบอีกครั้งหลัง clean ถ้า slug ยังคงว่าง
    const message = 'Slug ไม่ถูกต้อง กรุณากรอก Slug เป็นภาษาอังกฤษ';
    return redirect(`/admin/categories/new?error=slug_invalid&message=${encodeURIComponent(message)}`);
  }

  const { data: newCategory, error: dbError } = await supabase
    .from('categories')
    .insert([{
      name: name.trim(),
      slug: slug,
      description: description?.trim() || null,
    }])
    .select()
    .single();

  if (dbError) {
    console.error('[AddCategoryAction] Supabase Error:', dbError);
    let userErrorMessage = `เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่: ${dbError.message}`;
    if (dbError.code === '23505') { // Unique constraint violation
      if (dbError.message.includes('categories_name_key')) {
        userErrorMessage = `เกิดข้อผิดพลาด: ชื่อหมวดหมู่ "${name}" นี้มีอยู่แล้ว`;
      } else if (dbError.message.includes('categories_slug_key')) {
        userErrorMessage = `เกิดข้อผิดพลาด: Slug "${slug}" นี้มีอยู่แล้ว`;
      }
    }
    return redirect(`/admin/categories/new?error=db_error&message=${encodeURIComponent(userErrorMessage)}`);
  }

  console.log('[AddCategoryAction] Category created successfully:', newCategory);

  // Revalidate path ที่เกี่ยวข้องเพื่อให้แสดงข้อมูลล่าสุด
  revalidatePath('/admin/categories/new');      // หน้าฟอร์มเพิ่มบทความ (อาจจะมี dropdown ที่ update)
  revalidatePath('/admin/articles/new');       // หน้าฟอร์มเพิ่มบทความ
  revalidatePath('/admin/articles/edit');      // หน้าฟอร์มแก้ไขบทความ (revalidate แบบกว้างๆ)
  revalidatePath('/articles');                 // หน้ารวมบทความสาธารณะ (sidebar อาจจะ update)
  // ถ้ามีหน้ารวม category ใน admin ก็ revalidate ด้วย: revalidatePath('/admin/categories');

  const successMessage = 'เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว!';
  // Redirect ไปหน้าเพิ่มบทความใหม่ (เพื่อให้ Admin เพิ่ม Category ต่อได้) หรือไปหน้ารวม Category (ถ้ามี)
  redirect(`/admin/categories/new?success=true&message=${encodeURIComponent(successMessage)}`);
}