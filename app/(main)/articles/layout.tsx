// app/(main)/articles/layout.tsx
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import React from 'react'; // Recommended for React.ReactNode

// Type Category (ควรจะมาจากไฟล์ types กลาง)
type Category = {
  id: number;
  name: string;
  slug: string;
};

export default async function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient(); // ใช้ await ถ้า createClient ของคุณเป็น async
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })
    .returns<Category[]>();

  if (categoriesError) {
    console.error('Error fetching categories for ArticlesLayout sidebar:', categoriesError.message);
  }

  return (
    // Container นี้จะถูก render ภายใน <main> ของ MainLayout (ถ้า MainLayout มี <main>)
    // หรือภายใน div ที่ครอบ children ของ MainLayout
    <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12 items-start w-full">
      {/* Sidebar สำหรับ Categories */}
      <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-28">
        {/* top-28 ควรปรับให้สอดคล้องกับความสูง Navbar (h-16 หรือ h-20) + padding ด้านบนของ content container ใน MainLayout */}
        <div className="bg-card text-card-foreground p-5 md:p-6 rounded-xl shadow-lg border border-border h-full">
          <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-border">
            หมวดหมู่บทความ
          </h2>
          {categoriesError && (
            <p className="text-xs text-destructive">ไม่สามารถโหลดหมวดหมู่ได้</p>
          )}
          {categories && categories.length > 0 ? (
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/articles"
                  className="block py-2 px-2.5 text-sm font-medium text-primary hover:bg-muted dark:hover:bg-slate-700/50 rounded-md transition-colors"
                >
                  บทความทั้งหมด
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/articles/category/${category.slug}`}
                    className="block py-2 px-2.5 text-sm text-muted-foreground hover:text-primary dark:hover:text-primary-foreground/80 hover:bg-muted dark:hover:bg-slate-700/50 rounded-md transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            !categoriesError && <p className="text-xs text-muted-foreground">ยังไม่มีหมวดหมู่</p>
          )}
        </div>
      </aside>

      {/* Main Content Area (จะเป็น page.tsx ของ /articles, /articles/[slug], etc.) */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}