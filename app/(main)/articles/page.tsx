import { createClient } from '@/utils/supabase/server';
import ArticleCard from '@/components/articles/ArticleCard'; // Import ArticleCard component
import type { Metadata } from 'next';

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

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, image_url, created_at')
    .order('created_at', { ascending: false }) // เรียงจากใหม่สุดไปเก่าสุด
    .returns<Article[]>();

  if (error) {
    console.error('Error fetching articles for /articles page:', error.message);
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-semibold text-destructive mb-4">เกิดข้อผิดพลาด</h1>
        <p className="text-muted-foreground">
          ไม่สามารถโหลดบทความได้ในขณะนี้ โปรดลองอีกครั้งภายหลัง
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header className="mb-10 md:mb-12 text-center border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          บทความทั้งหมด
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          ค้นพบเรื่องราว เคล็ดลับ และแรงบันดาลใจมากมายที่เราได้รวบรวมไว้เพื่อคนรักต้นไม้และธรรมชาติ
        </p>
      </header>

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">ยังไม่มีบทความ</h2>
          <p className="text-muted-foreground">
            ยังไม่มีบทความในขณะนี้ โปรดกลับมาตรวจสอบใหม่ในภายหลัง
          </p>
        </div>
      )}

      {/* (อนาคต) ส่วน Pagination สามารถเพิ่มตรงนี้ได้ */}
      {/* <div className="mt-12 md:mt-16 flex justify-center">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
          โหลดเพิ่มเติม
        </button>
      </div>
      */}
    </div>
  );
}