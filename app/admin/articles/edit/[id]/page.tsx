import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

// Helper function สำหรับสร้าง slug (ควรจะอยู่ในไฟล์ utils หรือ actions.ts เพื่อใช้ร่วมกัน)
function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function updateArticleAction(articleId: number, currentSlugFromDb: string, formData: FormData) {
  'use server';

  const title = formData.get('title') as string;
  let newSlug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const imageUrl = formData.get('image_url') as string | null;

  const redirectOnError = (errorCode: string, errorMessage: string) => {
    return redirect(`/admin/articles/edit/${articleId}?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`);
  };

  if (!title || !content) {
    console.error('[Update Action] Validation Error: Title and content are required.');
    return redirectOnError('validation_failed', 'หัวข้อและเนื้อหาเป็นฟิลด์ที่จำเป็น');
  }

  if (!newSlug) {
    newSlug = generateSlug(title);
    if (!newSlug && title) { // ถ้า title มีค่า แต่ newSlug ยังว่าง (เช่น title มีแต่อักขระพิเศษ)
        console.error('[Update Action] Validation Error: Cannot generate slug from title. Please provide a valid slug.');
        return redirectOnError('slug_generation_failed', 'ไม่สามารถสร้าง slug จากหัวข้อที่ระบุได้ กรุณากรอก Slug เอง');
    } else if (!newSlug && !title) { // ถ้า title ว่างด้วย
        console.error('[Update Action] Validation Error: Cannot generate slug from empty title.');
        return redirectOnError('slug_generation_failed', 'ไม่สามารถสร้าง slug จากหัวข้อได้ กรุณาใส่หัวข้อหรือ slug เอง');
    }
  } else {
    newSlug = generateSlug(newSlug); // Clean slug ที่ผู้ใช้กรอก
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
    })
    .eq('id', articleId)
    .select('slug')
    .single();

  if (dbError) {
    console.error(`[Update Action] Supabase Error updating article (ID: ${articleId}):`, dbError);
    let userErrorMessage = `เกิดข้อผิดพลาดในการอัปเดตบทความ: ${dbError.message}`;
    if (dbError.code === '23505') {
      userErrorMessage = `เกิดข้อผิดพลาด: Slug "${newSlug}" นี้มีอยู่แล้วสำหรับบทความอื่น กรุณาใช้ Slug อื่น`;
    }
    return redirectOnError('db_error', userErrorMessage);
  }

  if (!updatedArticleData) {
    console.error(`[Update Action] Error: Article with ID ${articleId} not found after update or update failed.`);
    return redirectOnError('update_failed', 'ไม่พบข้อมูลบทความหลังจากการอัปเดต หรือการอัปเดตล้มเหลว');
  }
  
  console.log('[Update Action] Article updated successfully. New slug:', updatedArticleData.slug);

  revalidatePath('/admin/articles');
  revalidatePath('/articles');
  revalidatePath('/');

  if (currentSlugFromDb !== updatedArticleData.slug) {
    revalidatePath(`/articles/${currentSlugFromDb}`);
  }
  revalidatePath(`/articles/${updatedArticleData.slug}`);

  const successMessage = 'อัปเดตบทความเรียบร้อยแล้ว!';
  redirect(`/admin/articles?message=${encodeURIComponent(successMessage)}`);
}

type EditArticlePageProps = {
  params: {
    id: string; 
  };
  searchParams?: {
    error?: string;
    message?: string;
  };
};

export async function generateMetadata({ params }: EditArticlePageProps): Promise<Metadata> {
  const awaitedParams = await params; // <--- เพิ่ม await params
  const articleId = parseInt(awaitedParams.id, 10);

  if (isNaN(articleId)) {
    return { title: 'ID บทความไม่ถูกต้อง | Admin Dashboard' };
  }

  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('title')
    .eq('id', articleId)
    .single();

  return {
    title: article ? `แก้ไขบทความ: ${article.title} | Admin Dashboard` : 'แก้ไขบทความ | Admin Dashboard',
  };
}

export default async function EditArticlePage({ params, searchParams }: EditArticlePageProps) {
  const awaitedParams = await params; // <--- เพิ่ม await params
  const resolvedSearchParams = searchParams ? await searchParams : { error: undefined, message: undefined }; // <--- เพิ่ม await searchParams

  const articleId = parseInt(awaitedParams.id, 10);
  const errorType = resolvedSearchParams.error;
  const message = resolvedSearchParams.message;

  if (isNaN(articleId)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: article, error: fetchError } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (fetchError || !article) {
    console.error(`Error fetching article (ID: ${articleId}) for edit:`, fetchError);
    notFound();
  }

  const updateActionWithParams = updateArticleAction.bind(null, article.id, article.slug);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/articles" className="text-sm text-primary hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          กลับไปหน้ารายการบทความ
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
        แก้ไขบทความ: <span className="text-primary/90">{article.title}</span>
      </h1>

      {errorType && message && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>{message}</p>
        </div>
      )}

      <form action={updateActionWithParams} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground/90 mb-1.5">
            หัวข้อบทความ <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            defaultValue={article.title}
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground/90 mb-1.5">
            Slug (สำหรับ URL)
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            defaultValue={article.slug}
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
            placeholder="ปล่อยว่างเพื่อสร้างจากหัวข้อ หรือกรอกเอง"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            ถ้ามีการเปลี่ยนแปลง จะส่งผลต่อ URL ของบทความนี้ (ใช้ตัวอักษรภาษาอังกฤษตัวเล็ก, ตัวเลข, และขีดกลาง)
          </p>
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-foreground/90 mb-1.5">
            เนื้อหาย่อ (Excerpt)
          </label>
          <textarea
            name="excerpt"
            id="excerpt"
            rows={3}
            defaultValue={article.excerpt || ''}
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-foreground/90 mb-1.5">
            เนื้อหาบทความ <span className="text-destructive">*</span>
          </label>
          <textarea
            name="content"
            id="content"
            rows={18}
            required
            defaultValue={article.content}
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
          />
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-foreground/90 mb-1.5">
            URL รูปภาพปก (ถ้ามี)
          </label>
          <input
            type="url"
            name="image_url"
            id="image_url"
            defaultValue={article.image_url || ''}
            className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 pt-3">
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            อัปเดตบทความ
          </button>
          <Link
            href="/admin/articles"
            className="py-2.5 px-6 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}