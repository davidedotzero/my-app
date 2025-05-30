import { createClient } from '@/utils/supabase/server';
import ArticleCard from '@/components/articles/ArticleCard';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Edit3, FilePlus2 } from 'lucide-react';

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  image_url?: string | null;
  created_at: string;
};

export const metadata: Metadata = {
  title: 'บทความทั้งหมด | บ้านไม้ดาวิ (ไดกิ บอนไซ)',
  description: 'สำรวจบทความ เคล็ดลับ และแรงบันดาลใจทั้งหมดเกี่ยวกับบอนไซ สวนเซน และการดูแลต้นไม้จาก บ้านไม้ดาวิ (ไดกิ บอนไซ)',
};

export default async function ArticlesPage() {
  const supabase = await createClient();

  // --- 1. ดึงข้อมูล User ปัจจุบันและตรวจสอบว่าเป็น Admin หรือไม่ ---
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile && profile.role === 'admin') {
      isAdmin = true;
    }
  }
  // --- สิ้นสุดการตรวจสอบ Admin ---

  // 1. ดึงข้อมูลบทความทั้งหมด (อาจจะเพิ่ม Pagination ทีหลัง)
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, image_url, created_at')
    .order('created_at', { ascending: false })
    .returns<Article[]>();

  if (articlesError) {
    console.error('Error fetching data for /articles page:', { articlesError});
    // แสดง UI error ที่เหมาะสม
  }



  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* ปุ่ม "เพิ่มบทความใหม่" สำหรับ Admin (ย้ายมาไว้ด้านบนสุดของ container) */}
      {isAdmin && (
        <div className="mb-8 pb-6 text-right border-b border-border">
          <Link
            href={`/admin/articles/new`}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all text-sm"
          >
            <FilePlus2 size={16} />
            เพิ่มบทความใหม่
          </Link>
        </div>
      )}

      {/* Page Header */}
      <header className="mb-10 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          บทความทั้งหมด
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          ค้นพบเรื่องราว เคล็ดลับ และแรงบันดาลใจมากมายที่เราได้รวบรวมไว้เพื่อคนรักต้นไม้และธรรมชาติ
        </p>
      </header>

      {/* Container หลักสำหรับ Sidebar และ Content */}
      <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12 items-start"> 
        {/* Main Content Area สำหรับแสดงรายการบทความ */}
        <main className="w-full lg:flex-1">
          {articlesError && (
            <div className="text-center py-10 bg-card rounded-lg shadow border border-border">
              <h2 className="text-2xl font-semibold text-destructive mb-4">เกิดข้อผิดพลาด</h2>
              <p className="text-muted-foreground">ไม่สามารถโหลดรายการบทความได้</p>
            </div>
          )}
          {articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8"> 
              {/* ปรับ lg:grid-cols-2 ถ้าพื้นที่จำกัด หรือ lg:grid-cols-3 ถ้าการ์ดไม่กว้างมาก */}
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            !articlesError && (
              <div className="text-center py-10 bg-card rounded-lg shadow border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">ยังไม่มีบทความ</h2>
                <p className="text-muted-foreground">
                  ยังไม่มีบทความในขณะนี้ โปรดกลับมาตรวจสอบใหม่ในภายหลัง
                </p>
              </div>
            )
          )}
          {/* (อนาคต) Pagination สามารถเพิ่มตรงนี้ได้ */}
        </main>
      </div>
    </div>
  );
}