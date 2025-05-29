import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
// ถ้าคุณจะใช้ ReactMarkdown ให้ uncomment สองบรรทัดนี้ และติดตั้ง library:
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  image_url?: string | null;
  created_at: string;
};

export async function generateMetadata({ params }: ArticlePageProps) {
  const awaitedParams = await params; // สมมติว่านี่คือวิธีที่เวิร์คสำหรับคุณ
  const slug = awaitedParams.slug;

  const supabase = await createClient();
  
  const { data: article, error } = await supabase
    .from('articles')
    .select('title, excerpt, image_url')
    .eq('slug', slug)
    .single<Pick<Article, 'title' | 'excerpt' | 'image_url'>>();

  if (error || !article) {
    return {
      title: 'Article Not Found',
      description: 'The article you are looking for does not exist.',
    };
  }

  return {
    title: article.title,
    description: article.excerpt || `Read more about ${article.title}`,
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: article.image_url ? [{ url: article.image_url, alt: article.title }] : [],
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const awaitedParams = await params; // สมมติว่านี่คือวิธีที่เวิร์คสำหรับคุณ
  const slug = awaitedParams.slug;

  const supabase = await createClient();

  const { data: article, error: pageError } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single<Article>();

  if (pageError || !article) {
    notFound(); 
  }
  
  const formattedDate = new Date(article.created_at).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <article className="prose prose-slate dark:prose-invert lg:prose-xl max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/articles" className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors">
            &larr; กลับไปหน้ารวมบทความ
          </Link>
        </div>

        {article.image_url && (
          <div className="mb-8 aspect-video overflow-hidden rounded-lg shadow-lg">
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
          {article.title}
        </h1>
        
        <div className="text-sm text-muted-foreground mb-8">
          <span>เผยแพร่เมื่อ: {formattedDate}</span>
        </div>

        {/* เลือกวิธีแสดงผล content: */}
        {/* 1. ถ้า content เป็น HTML ที่ปลอดภัย: */}
        <div dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* 2. หรือถ้า content เป็น Markdown (แนะนำให้ติดตั้ง react-markdown และ remark-gfm): */}
        {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown> */}
      </article>
    </div>
  );
}