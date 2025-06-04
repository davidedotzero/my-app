// app/layout.tsx (Root Layout)
import { Bai_Jamjuree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";
import "./globals.css";

const bai_jamjuree = Bai_Jamjuree({ // ใช้ชื่อที่ import มา
  display: "swap",
  subsets: ["latin", "thai"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "บ้านไม้ดาวิ (ไดกิ บอนไซ) - Next.js & Supabase", // ปรับ title ของคุณ
  description: "สร้างสรรค์พื้นที่สีเขียวกับบอนไซ สวนหินเซน และสวนในขวดแก้ว", // ปรับ description
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={bai_jamjuree.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          // enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}