import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
};

export default async function LatestArticlesSection() {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, image_url')
    .order('created_at', { ascending: false })
    .limit(6)
    .returns<Article[]>();

  if (error) {
    console.error('Error fetching articles:', error.message);
    return (
      <section className="py-12 md:py-16 bg-red-100 dark:bg-red-900/50">
        <div className="container mx-auto px-6">
          <p className="text-red-700 dark:text-red-300 text-center">
            เกิดข้อผิดพลาดในการโหลดบทความ โปรดลองอีกครั้งภายหลัง
          </p>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-primary dark:bg-slate-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-green-800 dark:text-green-300 mb-8 md:mb-12">
            บทความล่าสุด
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400">ยังไม่มีบทความในขณะนี้</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-black mb-8 md:mb-12">
          บทความล่าสุด
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="bg-white p-6 border-2 rounded-lg hover:shadow-md transition-shadow duration-300 flex flex-col">
              {article.image_url && (
                <div className="mb-4 h-40 w-full overflow-hidden rounded-md">
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-xl font-semibold text-primary mb-3">{article.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed flex-grow">{article.excerpt || ''}</p>
              <Link
                href={`/articles/${article.slug}`}
                className="inline-block self-start mt-auto text-primary hover:text-primary-foreground font-medium transition-colors duration-300"
              >
                อ่านต่อ &rarr;
              </Link>
            </div>
          ))}
        </div>
        <div className="text-end mt-10 md:mt-14">
          <Link
            href="/articles"
            className="bg-primary dark:bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-foreground dark:hover:bg-primary-foreground hover:text-primary transition-colors duration-300 text-lg"
          >
            ดูบทความทั้งหมด
          </Link>
        </div>
      </div>
    </section>
  );
}