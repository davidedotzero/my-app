// app/(main)/articles/layout.tsx
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import React from 'react';
import CategorySidebar from '@/components/articles/CategorySidebar';


type Category = { id: number; name: string; slug: string; };

export default async function ArticlesLayout({ children }: { children: React.ReactNode; }) {
  const supabase = await createClient();
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })
    .returns<Category[]>();

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12 items-start w-full">
      <CategorySidebar categories={categories || []} error={categoriesError?.message || null} />
      <main className="flex-grow w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}