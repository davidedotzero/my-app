// app/(auth-pages)/layout.tsx
import Link from 'next/link';
import React from 'react';
// (Optional) ถ้าคุณมี Logo เป็น Component หรือ SVG โดยตรง
// import YourBrandLogo from '@/components/YourBrandLogo';

export default async function AuthPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      {/* ^ ปรับปรุงพื้นหลังให้ใช้สีจาก Theme แบบอ่อนๆ หรือสีพื้นหลังหลัก */}
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link href="/" className="group inline-block mb-4 sm:mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md">
            {/* ถ้ามี Logo Component: <YourBrandLogo className="h-12 w-auto mx-auto text-primary" /> */}
            <h1 className="text-3xl sm:text-4xl font-bold text-primary group-hover:opacity-80 transition-opacity tracking-tight">
              บ้านไม้ดาวิ
            </h1>
            <p className="text-sm text-muted-foreground group-hover:opacity-80 transition-opacity">
              (ไดกิ บอนไซ)
            </p>
          </Link>
        </div>

        {/* Card UI สำหรับฟอร์ม */}
        <div className="bg-card p-6 sm:p-8 shadow-xl rounded-xl border border-border/50">
          {children}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            หากพบปัญหาในการเข้าสู่ระบบ?{' '}
            <Link href="/contact" className="font-medium text-primary hover:underline hover:text-primary/80">
              ติดต่อเรา
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}