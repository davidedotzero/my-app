// app/(main)/articles/layout.tsx
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import React from 'react';

type Category = { id: number; name: string; slug: string; };

export default async function ArticlesLayout({ children }: { children: React.ReactNode; }) {
  const supabase = await createClient(); // ยึดตาม server.ts ของคุณ
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })
    .returns<Category[]>();

  if (categoriesError) {
    console.error('Error fetching categories for ArticlesLayout sidebar:', categoriesError.message);
  }

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12 items-start w-full">
      <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-28">
        <div className="bg-card text-card-foreground p-5 md:p-6 rounded-xl shadow-lg border border-border h-full">
          <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-border">
            หมวดหมู่บทความ
          </h2>
          {/* ... Category list JSX ... */}
          {categoriesError && (<p className="text-xs text-destructive">ไม่สามารถโหลดหมวดหมู่ได้</p>)}
          {categories && categories.length > 0 ? (
             <ul className="space-y-1.5">
               <li><Link href="/articles" className="block py-2 px-2.5 text-sm font-medium text-primary hover:bg-muted dark:hover:bg-slate-700/50 rounded-md transition-colors">บทความทั้งหมด</Link></li>
               {categories.map((category) => (
                 <li key={category.id}><Link href={`/articles/category/${category.slug}`} className="block py-2 px-2.5 text-sm text-muted-foreground hover:text-primary dark:hover:text-primary-foreground/80 hover:bg-muted dark:hover:bg-slate-700/50 rounded-md transition-colors">{category.name}</Link></li>
               ))}
             </ul>
           ) : ( !categoriesError && <p className="text-xs text-muted-foreground">ยังไม่มีหมวดหมู่</p> )}
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}