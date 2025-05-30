// app/(main)/layout.tsx
import Link from "next/link";
import DeployButton from "@/components/deploy-button"; // สมมติว่ามี component เหล่านี้
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars"; // สมมติว่ามี util นี้
import { createClient } from "@/utils/supabase/server";

// ไม่ต้องมี <html>, <body>, ThemeProvider, metadata ซ้ำซ้อนที่นี่
// ไม่ต้อง import globals.css หรือ font ซ้ำที่นี่

// ตั้งชื่อ Component ให้สื่อความหมาย
export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdminUser = false; // ตั้งค่าเริ่มต้น
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[MainLayout] Error fetching profile for isAdmin check:', profileError.message);
    }
    if (profile && profile.role === 'admin') {
      isAdminUser = true;
    }
  }
  return (
    <> {/* ใช้ Fragment หรือ div ถ้าจำเป็น */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="w-full max-w-8xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link className="text-primary font-bold" href={"/"}>Baanmaih Davi</Link> {/* ปรับชื่อเว็บ */}
            {/* เพิ่ม Links อื่นๆ สำหรับส่วน main เช่น บทความ, ผลงาน, เกี่ยวกับเรา */}
            <Link href={"/articles"}>บทความ</Link>
            <Link href={"/creations"}>ผลงานของเรา</Link>
            <Link href={"/about"}>เกี่ยวกับเรา</Link>
            <Link href={"/contact"}>ติดต่อเรา</Link>
          </div>
          {/* ส่วน DeployButton และ HeaderAuth อาจจะย้ายไปอยู่ในส่วน header ของ RootLayout ถ้าต้องการให้แสดงทุกหน้า */}
          <div className="flex items-center gap-2">
            <Link className="text-primary font-bold" href={"/account"}>โปรไฟล์</Link>
            {/* {hasEnvVars && <DeployButton />} */}
            {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
          </div>
        </div>
      </nav>
      

      {/* เนื้อหาของแต่ละหน้าในส่วน (main) จะถูก render ที่นี่ */}
      <div className="flex-1 w-full flex flex-col items-center py-8 md:py-12">
        <div className="w-full max-w-5xl p-5 flex flex-col gap-12 md:gap-16">
          {children}
        </div>
      </div>

      {/* Footer สำหรับส่วน (main) ถ้าต้องการแยกจาก RootLayout Footer */}
      {/* ถ้า Footer เหมือนกันทั้งเว็บ ก็เอาออกจากที่นี่ แล้วไปใช้ของ RootLayout */}
    </>
  );
}