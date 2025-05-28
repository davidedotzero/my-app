// app/layout.tsx (Root Layout)
import { Geist } from "next/font/google"; // เปลี่ยนชื่อ import ให้ชัดเจน
import { ThemeProvider } from "next-themes";
import { ThemeSwitcher } from "@/components/theme-switcher"; // ถ้า footer นี้ global จริงๆ
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "บ้านไม้ดาวิ (ไดกิ บอนไซ) - Next.js & Supabase", // ปรับ title ของคุณ
  description: "สร้างสรรค์พื้นที่สีเขียวกับบอนไซ สวนหินเซน และสวนในขวดแก้ว", // ปรับ description
};

const geistSans = Geist({ // ใช้ชื่อที่ import มา
  display: "swap",
  subsets: ["latin"],
  variable: '--font-geist-sans', // แนะนำให้ใช้ CSS variable สำหรับ font
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navbar หลักของทั้งเว็บ (ถ้ามี และใช้เหมือนกันทุกส่วนจริงๆ) อาจจะอยู่นอก main ก็ได้ */}
          {/* <GlobalNavbar /> */}

          <main className="min-h-screen flex flex-col"> {/* อาจจะไม่ต้อง items-center ที่นี่ ถ้าแต่ละ layout ย่อยจัดการเอง */}
            {children}
          </main>

          {/* Footer หลักของทั้งเว็บ (ถ้ามี และใช้เหมือนกันทุกส่วนจริงๆ) */}
          <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-8">
            <p>
              พัฒนาโดย บ้านไม้ดาวิ (ไดกิ บอนไซ) {/* ปรับข้อความ */}
              {/* หรือจะคง Powered by Supabase ไว้ก็ได้ถ้าต้องการให้เครดิต */}
            </p>
            <ThemeSwitcher />
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}