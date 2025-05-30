import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/articles/ArticleCard';
import type { Metadata } from 'next';

type CategoryPageProps = {
  params: {
    category_slug: string;
  };
  // (Optional) ถ้าคุณต้องการรับ searchParams ในอนาคต
  // searchParams?: { [key: string]: string | string[] | undefined };
};

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
  description?: string | null;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const awaitedParams = await params; // <--- เพิ่ม await params
  const category_slug = awaitedParams.category_slug;

  const supabase = await createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', category_slug) // <--- ใช้ category_slug ที่ resolve แล้ว
    .single<Pick<Category, 'name' | 'description'>>();

  if (!category) {
    return {
      title: 'ไม่พบหมวดหมู่', // Category Not Found
    };
  }

  return {
    title: `${category.name} | บทความ บ้านไม้ดาวิ`,
    description: category.description || `บทความทั้งหมดในหมวดหมู่ ${category.name}`,
  };
}

export default async function ArticlesByCategoryPage({ params }: CategoryPageProps) {
  const awaitedParams = await params; // <--- เพิ่ม await params
  const category_slug = awaitedParams.category_slug;

  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('slug', category_slug) // <--- ใช้ category_slug ที่ resolve แล้ว
    .single<Category>();

  if (categoryError || !category) {
    console.error('Error fetching category or category not found:', category_slug, categoryError);
    notFound(); 
  }

  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, image_url, created_at')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })
    .returns<Article[]>();

  if (articlesError) {
    // ยังคงแสดงหน้าหมวดหมู่ แต่แจ้งว่ามีปัญหาในการโหลดบทความ
    console.error(`Error fetching articles for category ${category.name}:`, articlesError.message);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header className="mb-10 md:mb-12 border-b border-border pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          หมวดหมู่: <span className="text-primary">{category.name}</span>
        </h1>
        {category.description && (
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            {category.description}
          </p>
        )}
      </header>

      {articlesError && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>ไม่สามารถโหลดรายการบทความในหมวดหมู่นี้ได้ ({articlesError.message})</p>
        </div>
      )}

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        !articlesError && ( // แสดงข้อความนี้ต่อเมื่อไม่มี error ในการโหลดบทความ แต่ไม่พบบทความ
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">ไม่พบบทความ</h2>
            <p className="text-muted-foreground">
              ยังไม่มีบทความในหมวดหมู่ "{category.name}" นี้
            </p>
          </div>
        )
      )}
    </div>
  );
}