// components/articles/CategorySidebar.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react'; // ไอคอนสำหรับปุ่ม

// Type Category (ควรจะมาจากไฟล์ types กลาง หรือ import จากที่เดียวกับ ArticlesLayout)
type Category = { id: number; name: string; slug: string; };

type CategorySidebarProps = {
  categories: Category[];
  error: string | null;
};

export default function CategorySidebar({ categories, error }: CategorySidebarProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // (Optional) ปิด Sidebar เมื่อขนาดหน้าจอเปลี่ยนเป็น Desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint ของ Tailwind
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  const renderCategoryList = () => (
    <>
      {error && (
        <div className="p-3 my-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md flex items-center gap-2">
          <Filter size={18} /> {/* หรือ AlertTriangle */}
          <span>ไม่สามารถโหลดหมวดหมู่ได้</span>
        </div>
      )}
      {categories && categories.length > 0 && !error && (
        <ul className="space-y-1.5">
          <li>
            <Link
              href="/articles"
              onClick={() => setIsMobileSidebarOpen(false)} // ปิดเมื่อคลิก (สำหรับ mobile)
              className="block py-2 px-2.5 text-sm font-medium text-primary hover:bg-muted dark:hover:bg-slate-700/50 rounded-md transition-colors"
            >
              บทความทั้งหมด
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/articles/category/${category.slug}`}
                onClick={() => setIsMobileSidebarOpen(false)} // ปิดเมื่อคลิก (สำหรับ mobile)
                className="block py-2 px-2.5 text-sm text-muted-foreground hover:text-primary dark:hover:text-primary-foreground/80 hover:bg-muted dark:hover:bg-slate-700/50 rounded-md transition-colors"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!error && (!categories || categories.length === 0) && (
        <p className="text-xs text-muted-foreground">ยังไม่มีหมวดหมู่</p>
      )}
    </>
  );

  return (
    <>
      {/* --- Mobile Sidebar Toggle Button --- */}
      <div className="lg:hidden mb-4">
        <button
          onClick={toggleMobileSidebar}
          className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <Filter size={16} />
            {isMobileSidebarOpen ? 'ซ่อนหมวดหมู่' : 'แสดงหมวดหมู่'}
          </span>
          <ChevronDown size={20} className={`transition-transform duration-200 ${isMobileSidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* --- Mobile Sidebar (Dropdown/Overlay) --- */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden mb-8">
          <div className="bg-card text-card-foreground p-5 rounded-xl shadow-lg border border-border">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-card-foreground">หมวดหมู่บทความ</h2>
              <button onClick={toggleMobileSidebar} className="p-1 text-muted-foreground hover:text-foreground">
                 <X size={20}/>
              </button>
            </div>
            {renderCategoryList()}
          </div>
        </div>
      )}

      {/* --- Desktop Sidebar (Sticky) --- */}
      <aside className="hidden lg:block w-full lg:w-64 xl:w-72 flex-shrink-0 lg:sticky lg:top-28">
        <div className="bg-card text-card-foreground p-5 md:p-6 rounded-xl shadow-lg border border-border h-full">
          <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-border text-foreground">
            หมวดหมู่บทความ
          </h2>
          {renderCategoryList()}
        </div>
      </aside>
    </>
  );
}