// app/admin/articles/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  if (!title?.trim()) return `article-${Date.now().toString().slice(-6)}`;
  let slug = title.toLowerCase().trim().replace(/[\u0E00-\u0E7F]+/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  if (!slug) { return `article-${Date.now().toString().slice(-6)}`; }
  return slug;
}

export async function addArticleAction(formData: FormData) {
  // ... (โค้ด addArticleAction ของคุณที่ปรับปรุงแล้ว ถือว่าค่อนข้างดีแล้ว) ...
  // (ตรวจสอบว่าทุก error case มีการ redirect พร้อม message ที่ encodeURIComponent แล้ว)
  const title = formData.get('title') as string;
  let slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const imageUrl = formData.get('image_url') as string | null;
  const categoryIdString = formData.get('category_id') as string | null;
  const category_id = categoryIdString && categoryIdString !== "" && !isNaN(parseInt(categoryIdString, 10)) 
                      ? parseInt(categoryIdString, 10) 
                      : null;

  if (!title || !content) {
    const message = 'หัวข้อและเนื้อหาเป็นฟิลด์ที่จำเป็น';
    return redirect(`/admin/articles/new?error=validation_failed&message=${encodeURIComponent(message)}`);
  }

  if (!slug) {
    slug = generateSlug(title);
    if (slug.startsWith('article-') && title.trim() !== "") { 
      // This means title was likely all Thai or special chars, resulting in fallback slug.
      // No need to error if title itself was valid.
    } else if (!slug && !title.trim()) { // Both title and slug are effectively empty
        const message = 'ไม่สามารถสร้าง slug จากหัวข้อได้ กรุณาใส่หัวข้อหรือ slug เอง';
        return redirect(`/admin/articles/new?error=slug_generation_failed&message=${encodeURIComponent(message)}`);
    }
  } else {
    slug = generateSlug(slug);
  }
  // Check slug again after generation/cleaning
  if (!slug) {
    const message = 'Slug ไม่ถูกต้องหลังจากพยายามสร้างหรือ clean ค่าที่กรอกมา';
    return redirect(`/admin/articles/new?error=slug_invalid&message=${encodeURIComponent(message)}`);
  }


  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from('articles')
    .insert([{ title: title.trim(), slug, excerpt: excerpt?.trim() || null, content: content.trim(), image_url: imageUrl?.trim() || null, category_id }])
    .select('slug')
    .single();

  if (dbError) {
    let userErrorMessage = `เกิดข้อผิดพลาดในการสร้างบทความ: ${dbError.message}`;
    if (dbError.code === '23505') { userErrorMessage = `เกิดข้อผิดพลาด: Slug "${slug}" นี้มีอยู่ในระบบแล้ว กรุณาใช้ Slug อื่น`; }
    return redirect(`/admin/articles/new?error=db_error&message=${encodeURIComponent(userErrorMessage)}`);
  }

  revalidatePath('/admin/articles');
  revalidatePath('/articles');
  revalidatePath('/'); 
  if (data?.slug) { revalidatePath(`/articles/${data.slug}`); }
  // (Optional) Revalidate category page
  if (category_id) {
    const {data: cat} = await supabase.from('categories').select('slug').eq('id', category_id).single();
    if (cat?.slug) revalidatePath(`/articles/category/${cat.slug}`);
  }
  const successMessage = 'สร้างบทความเรียบร้อยแล้ว!';
  redirect(`/admin/articles?message=${encodeURIComponent(successMessage)}`);
}


export async function updateArticleAction(articleId: number, currentSlugFromDb: string, formData: FormData) {
  'use server'; // ต้องมี 'use server' ในทุก action ที่ export จากไฟล์นี้

  if (isNaN(articleId) || articleId <= 0) {
    console.error('[Update Action] Invalid Article ID.');
    // ไม่สามารถ redirect กลับไปหน้า edit ได้ถ้า articleId ไม่ถูกต้อง
    // อาจจะต้อง redirect ไปหน้ารวม หรือแสดง error กลาง
    return redirect(`/admin/articles?error=invalid_id&message=${encodeURIComponent('ID บทความไม่ถูกต้อง')}`);
  }

  const title = formData.get('title') as string;
  let newSlug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const imageUrl = formData.get('image_url') as string | null;
  const categoryIdString = formData.get('category_id') as string | null;
  const category_id = categoryIdString && categoryIdString !== "" && !isNaN(parseInt(categoryIdString, 10)) 
                      ? parseInt(categoryIdString, 10) 
                      : null;

  const redirectOnError = (errorCode: string, errorMessage: string) => {
    return redirect(`/admin/articles/edit/${articleId}?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`);
  };

  if (!title || !content) {
    return redirectOnError('validation_failed', 'หัวข้อและเนื้อหาเป็นฟิลด์ที่จำเป็น');
  }

  if (!newSlug) {
    newSlug = generateSlug(title);
    if (newSlug.startsWith('article-') && title.trim() !== "") {
      // Fallback slug generated from a valid title (e.g. all Thai)
    } else if (!newSlug && !title.trim()) {
        return redirectOnError('slug_generation_failed', 'ไม่สามารถสร้าง slug จากหัวข้อได้ กรุณาใส่หัวข้อหรือ slug เอง');
    }
  } else {
    newSlug = generateSlug(newSlug);
  }
  // Check newSlug again after generation/cleaning
  if (!newSlug) {
    return redirectOnError('slug_invalid', 'Slug ไม่ถูกต้องหลังจากพยายามสร้างหรือ clean ค่าที่กรอกมา');
  }

  const supabase = await createClient();
  const { data: updatedArticleData, error: dbError } = await supabase
    .from('articles')
    .update({
      title: title.trim(),
      slug: newSlug,
      excerpt: excerpt?.trim() || null,
      content: content.trim(),
      image_url: imageUrl?.trim() || null,
      category_id: category_id,
    })
    .eq('id', articleId)
    .select('slug') // ดึง slug ที่อัปเดตแล้วกลับมา
    .single();

  if (dbError) {
    let userErrorMessage = `เกิดข้อผิดพลาดในการอัปเดตบทความ: ${dbError.message}`;
    if (dbError.code === '23505') { 
      userErrorMessage = `เกิดข้อผิดพลาด: Slug "${newSlug}" นี้มีอยู่แล้วสำหรับบทความอื่น กรุณาใช้ Slug อื่น`;
    }
    return redirectOnError('db_error', userErrorMessage);
  }

  if (!updatedArticleData) {
    return redirectOnError('update_failed', 'ไม่พบบทความหลังจากการอัปเดต หรือการอัปเดตล้มเหลว');
  }
  
  revalidatePath('/admin/articles');
  revalidatePath('/articles');
  revalidatePath('/');
  if (currentSlugFromDb !== updatedArticleData.slug) {
    revalidatePath(`/articles/${currentSlugFromDb}`); // Revalidate path ของ slug เก่า
  }
  revalidatePath(`/articles/${updatedArticleData.slug}`); // Revalidate path ของ slug ใหม่
  // (Optional) Revalidate category pages
  if (category_id) {
    const {data: cat} = await supabase.from('categories').select('slug').eq('id', category_id).single();
    if (cat?.slug) revalidatePath(`/articles/category/${cat.slug}`);
  }

  const successMessage = 'อัปเดตบทความเรียบร้อยแล้ว!';
  redirect(`/admin/articles?message=${encodeURIComponent(successMessage)}`);
}

// deleteArticleAction (เหมือนเดิมที่ return Promise<void>)
export async function deleteArticleAction(articleId: number): Promise<void> {
  // ... (โค้ด deleteArticleAction ที่สมบูรณ์แล้ว)
  if (isNaN(articleId) || articleId <= 0) {
    console.error('[Delete Action] Invalid Article ID:', articleId);
    return; 
  }
  const supabase = await createClient();
  const { data: articleToDelete, error: fetchError } = await supabase
    .from('articles')
    .select('slug')
    .eq('id', articleId)
    .single();
  if (fetchError) {
    console.warn(`[Delete Action] Could not fetch article slug (ID: ${articleId}) before delete, proceeding. Error: ${fetchError.message}`);
  }
  const { error: deleteError } = await supabase.from('articles').delete().eq('id', articleId);
  if (deleteError) {
    console.error(`[Delete Action] Supabase Error deleting article (ID: ${articleId}):`, deleteError.message);
    return; 
  }
  console.log('[Delete Action] Article deleted successfully, ID:', articleId);
  revalidatePath('/admin/articles');
  revalidatePath('/articles');
  revalidatePath('/');
  if (articleToDelete?.slug) {
    revalidatePath(`/articles/${articleToDelete.slug}`);
  }
}