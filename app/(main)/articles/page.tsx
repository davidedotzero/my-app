import { createClient } from '@/utils/supabase/server';
import ArticleCard from '@/components/articles/ArticleCard';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Edit3 , FilePlus2 } from 'lucide-react';

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  image_url?: string | null;
  created_at: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
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

  // 2. ดึงข้อมูลหมวดหมู่ทั้งหมดสำหรับ Sidebar
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })
    .returns<Category[]>();

  if (articlesError || categoriesError) {
    console.error('Error fetching data for /articles page:', { articlesError, categoriesError });
    // แสดง UI error ที่เหมาะสม
  }



  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {isAdmin && (
        <div className="mb-6 pb-6 border-b border-border text-right">
          <Link
            href={`/admin/articles/new`}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:shadow-md transition-all text-sm"
          >
            <FilePlus2 size={16} />
            เพิ่มบทความใหม่ (Admin)
          </Link>
        </div>
      )}
      <header className="mb-10 md:mb-12 text-center border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          บทความทั้งหมด
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          ค้นพบเรื่องราว เคล็ดลับ และแรงบันดาลใจมากมายที่เราได้รวบรวมไว้เพื่อคนรักต้นไม้และธรรมชาติ
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Sidebar สำหรับ Categories */}
        <aside className="w-full lg:w-1/4 lg:sticky lg:top-24 (h-20 navbar + py-4)  p-1"> {/* top-24 (h-20 navbar + py-4) หรือปรับตามความสูง Navbar + padding */}
          <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">หมวดหมู่บทความ</h2>
            {categories && categories.length > 0 ? (
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/articles" 
                    className="block py-2 px-3 text-sm font-medium text-primary hover:bg-muted rounded-md transition-colors"
                  >
                    บทความทั้งหมด
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/articles/category/${category.slug}`}
                      className="block py-2 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีหมวดหมู่</p>
            )}
          </div>
        </aside>

        {/* Main Content Area สำหรับแสดงรายการบทความ */}
        <main className="w-full lg:w-3/4">
          {articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"> {/* อาจจะปรับจำนวนคอลัมน์ตามพื้นที่ที่เหลือ */}
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-lg shadow border border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">ยังไม่มีบทความ</h2>
              <p className="text-muted-foreground">
                ยังไม่มีบทความในขณะนี้ โปรดกลับมาตรวจสอบใหม่ในภายหลัง
              </p>
            </div>
          )}
          {/* (อนาคต) Pagination สำหรับบทความทั้งหมด */}
        </main>
      </div>
    </div>
  );
}