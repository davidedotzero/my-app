import Link from 'next/link';
import Image from 'next/image'; // ใช้ Image component ของ Next.js เพื่อ optimize รูปภาพ

type ArticleCardProps = {
  article: {
    id: number; // หรือ string ถ้าคุณใช้ UUID
    title: string;
    slug: string;
    excerpt?: string | null;
    image_url?: string | null;
    created_at?: string; // (Optional) ถ้าต้องการแสดงวันที่บนการ์ด
  };
};

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-card text-card-foreground rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden border border-border">
      {article.image_url && (
        <Link href={`/articles/${article.slug}`} className="block aspect-video overflow-hidden">
          <Image
            src={article.image_url}
            alt={article.title}
            width={400} // กำหนด width และ height เพื่อ performance ที่ดี
            height={225}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
      )}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 leading-tight">
          <Link href={`/articles/${article.slug}`} className="hover:text-primary transition-colors">
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-grow">
            {article.excerpt}
          </p>
        )}
        <div className="mt-auto pt-2">
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors"
          >
            อ่านเพิ่มเติม
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}