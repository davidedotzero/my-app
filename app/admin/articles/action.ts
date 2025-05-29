'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function addArticleAction(formData: FormData) {
  'use server';

  const title = formData.get('title') as string;
  let slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const imageUrl = formData.get('image_url') as string | null;

  if (!title || !content) {
    console.error('[Add Action] Validation Error: Title and content are required.');
    const message = 'หัวข้อและเนื้อหาเป็นฟิลด์ที่จำเป็น';
    return redirect(`/admin/articles/new?error=validation_failed&message=${encodeURIComponent(message)}`); // <--- ใช้ encodeURIComponent
  }

  if (!slug) {
    slug = generateSlug(title); // สมมติว่าคุณมีฟังก์ชัน generateSlug
    if (!slug) {
        console.error('[Add Action] Validation Error: Cannot generate slug from empty title.');
        const message = 'ไม่สามารถสร้าง slug จากหัวข้อได้ กรุณาใส่หัวข้อหรือ slug เอง';
        return redirect(`/admin/articles/new?error=slug_generation_failed&message=${encodeURIComponent(message)}`); // <--- ใช้ encodeURIComponent
    }
  } else {
    slug = generateSlug(slug);
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from('articles')
    .insert([
      {
        title: title.trim(),
        slug: slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        image_url: imageUrl?.trim() || null,
      },
    ])
    .select()
    .single();

  if (dbError) {
    console.error('[Add Action] Supabase Error creating article:', dbError);
    let userErrorMessage = `เกิดข้อผิดพลาดในการสร้างบทความ: ${dbError.message}`;
    if (dbError.code === '23505') { 
      userErrorMessage = `เกิดข้อผิดพลาด: Slug "${slug}" นี้มีอยู่ในระบบแล้ว กรุณาใช้ Slug อื่น`;
    }
    return redirect(`/admin/articles/new?error=db_error&message=${encodeURIComponent(userErrorMessage)}`); // <--- ใช้ encodeURIComponent
  }

  console.log('[Add Action] Article created successfully:', data);

  revalidatePath('/admin/articles');
  revalidatePath('/articles');
  revalidatePath('/'); 
  if (data?.slug) {
    revalidatePath(`/articles/${data.slug}`);
  }
  const successMessage = 'สร้างบทความเรียบร้อยแล้ว!';
  redirect(`/admin/articles?message=${encodeURIComponent(successMessage)}`); // <--- ใช้ encodeURIComponent สำหรับ success message ด้วย
}

export async function updateArticleAction(articleId: number, formData: FormData) {
  if (isNaN(articleId) || articleId <= 0) {
    console.error('[Update Action] Invalid Article ID.');
    return;
  }

  const title = formData.get('title') as string;
  let slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const imageUrl = formData.get('image_url') as string | null;

  if (!title || !content) {
    console.error('[Update Action] Validation Error: Title and content are required.');
    return;
  }

  if (!slug) {
    slug = generateSlug(title);
     if (!slug) {
        console.error('[Update Action] Validation Error: Cannot generate slug from empty title.');
        return;
    }
  } else {
    slug = generateSlug(slug); // Clean a user-provided slug
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('articles')
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      image_url: imageUrl || null,
      // updated_at จะถูกจัดการโดย DB trigger ที่เราสร้างไว้
    })
    .eq('id', articleId)
    .select()
    .single();

  if (error) {
    console.error(`[Update Action] Supabase Error updating article (ID: ${articleId}):`, error.message);
     if (error.code === '23505') { 
      console.error(`[Update Action] Error: The slug "${slug}" already exists for another article.`);
    }
    return;
  }

  if (!data) {
    console.error(`[Update Action] Error: Article with ID ${articleId} not found or update failed to return data.`);
    return;
  }
  
  console.log('[Update Action] Article updated successfully:', data);

  revalidatePath('/admin/articles');
  revalidatePath('/articles');
  revalidatePath('/');
  if (data?.slug) {
    revalidatePath(`/articles/${data.slug}`);
  }
  // ถ้า slug เดิมมีการเปลี่ยนแปลง อาจจะต้อง revalidate path ของ slug เก่าด้วย (ซับซ้อนขึ้นเล็กน้อย)

  redirect('/admin/articles');
}

export async function deleteArticleAction(articleId: number): Promise<{ success?: string; error?: string }> {
  if (isNaN(articleId) || articleId <= 0) {
    console.error('[Delete Action] Invalid Article ID.');
    return { error: 'ID บทความไม่ถูกต้อง' };
  }

  const supabase = await createClient();
  const { data: articleToDelete, error: fetchError } = await supabase
    .from('articles')
    .select('slug') // ดึง slug มาเพื่อ revalidate path ของบทความนั้นๆ
    .eq('id', articleId)
    .single();

  // ไม่จำเป็นต้องหยุดถ้า fetchError เพราะเป้าหมายหลักคือการลบ
  // แต่การ log error ไว้ก็ดี

  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId);

  if (deleteError) {
    console.error(`[Delete Action] Supabase Error deleting article (ID: ${articleId}):`, deleteError);
    return { error: `ไม่สามารถลบบทความได้: ${deleteError.message}` };
  }

  console.log('[Delete Action] Article deleted successfully, ID:', articleId);

  revalidatePath('/admin/articles'); // Revalidate หน้ารายการ Admin
  revalidatePath('/articles');       // Revalidate หน้ารวมบทความสาธารณะ (ถ้ามี)
  revalidatePath('/');               // Revalidate หน้าแรก (ถ้าแสดงบทความล่าสุด)
  if (articleToDelete?.slug) {
    revalidatePath(`/articles/${articleToDelete.slug}`); // Revalidate หน้าสาธารณะของบทความที่ถูกลบ
  }
  
  return { success: 'ลบบทความเรียบร้อยแล้ว!' };
}