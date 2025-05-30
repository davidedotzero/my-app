// app/(main)/layout.tsx
import Link from "next/link";
// import DeployButton from "@/components/deploy-button"; // ถ้าจะใช้
// import { EnvVarWarning } from "@/components/env-var-warning"; // ถ้าจะใช้
import HeaderAuth from "@/components/header-auth";
// import { hasEnvVars } from "@/utils/supabase/check-env-vars"; // ถ้าจะใช้
import { createClient } from "@/utils/supabase/server";

// ควรจะย้าย typeเหล่านี้ไปไว้ในไฟล์ types.ts หรือไฟล์ที่เหมาะสมเพื่อใช้ร่วมกัน
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


export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  // การดึงข้อมูล user และ isAdminUser ยังคงเหมือนเดิม
  const { data: { user } } = await supabase.auth.getUser();
  let isAdminUser = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile && profile.role === 'admin') {
      isAdminUser = true;
    }
  }

  // *** คำแนะนำสำคัญ: การดึงข้อมูล Categories ที่นี่จะทำให้ Sidebar แสดงใน "ทุกหน้า" ที่ใช้ MainLayout นี้ ***
  // ถ้าคุณต้องการ Sidebar เฉพาะในหน้า /articles และ /articles/category/*
  // ควรย้าย Logic การดึง Categories และการ Render <aside> ไปไว้ใน app/(main)/articles/layout.tsx (สร้างใหม่)
  // หรือใน app/(main)/articles/page.tsx โดยตรงครับ
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })
    .returns<Category[]>();

  if (categoriesError) {
    console.error('Error fetching categories for MainLayout sidebar:', categoriesError.message);
  }

  return (
    <>
      <nav className="w-full flex justify-center border-b border-border/10 h-16 sticky top-0 bg-background/95 backdrop-blur-lg z-50">
        <div className="w-full max-w-8xl flex justify-between items-center p-3 px-4 sm:px-6 lg:px-8 text-sm">
          <div className="flex gap-3 sm:gap-5 items-center font-semibold">
            <Link className="text-primary font-bold text-lg hover:opacity-80 transition-opacity" href={"/"}>Baan Mai Davi</Link>
            <div className="hidden sm:flex gap-3 sm:gap-4"> {/* ซ่อนลิงก์ย่อยบนจอมือถือมากๆ */}
              <Link href={"/articles"} className="text-foreground/80 hover:text-primary transition-colors">บทความ</Link>
              <Link href={"/creations"} className="text-foreground/80 hover:text-primary transition-colors">ผลงานของเรา</Link>
              <Link href={"/about"} className="text-foreground/80 hover:text-primary transition-colors">เกี่ยวกับเรา</Link>
              <Link href={"/contact"} className="text-foreground/80 hover:text-primary transition-colors">ติดต่อเรา</Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* (Optional) แสดงลิงก์ Admin ใน Navbar ถ้าต้องการ */}
            {isAdminUser && (
              <Link href="/admin" className="text-sm font-medium text-amber-500 hover:text-amber-600 hidden lg:block">
                Admin Panel
              </Link>
            )}
            <Link className="text-primary font-medium hover:underline hidden sm:block" href={"/account"}>โปรไฟล์</Link>
            <HeaderAuth /> {/* HeaderAuth ควรจัดการปุ่ม Login/Logout/User Avatar */}
            {/* Mobile Menu button for navLinks (if needed) can be added here and Navbar component refactored */}
          </div>
        </div>
      </nav>
      
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12 items-start"> {/* <--- แก้ไข div นี้ */}
          
          {/* Sidebar สำหรับ Categories */}
          {/* พิจารณาเงื่อนไขการแสดง Sidebar นี้ เช่น อาจจะแสดงเฉพาะบาง Path */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-24"> 
            {/* top-24 คือ h-16 (navbar) + py-8 (padding ของ container ด้านบน) หรือปรับตามความเหมาะสม */}
            <div className="bg-card p-5 border-r">
              <h2 className="text-lg font-semibold text-card-foreground mb-4 pb-3 border-b border-border">
                หมวดหมู่บทความ
              </h2>
              {categoriesError && <p className="text-xs text-destructive">ไม่สามารถโหลดหมวดหมู่</p>}
              {categories && categories.length > 0 ? (
                <ul className="space-y-1">
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

          {/* เนื้อหาหลักของหน้า (Page Content) */}
          <main className="flex-1 min-w-0"> {/* min-w-0 ช่วยป้องกัน overflow ใน flex item */}
            {children}
          </main>

        </div>
      </div>
    </>
  );
}