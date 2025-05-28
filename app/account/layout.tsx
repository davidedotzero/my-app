// app/account/layout.tsx
import Link from "next/link";
import HeaderAuth from "@/components/header-auth"; // อาจจะใช้ HeaderAuth ร่วมกัน

// ไม่ต้องมี <html>, <body>, ThemeProvider, metadata ซ้ำซ้อน

// ตั้งชื่อ Component ให้สื่อความหมาย
export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>กลับหน้าหลัก</Link>
            <Link href={"/account"}>โปรไฟล์ของฉัน</Link>
            {/* เพิ่ม Links อื่นๆ สำหรับส่วน Account เช่น ประวัติการสั่งซื้อ, ตั้งค่า */}
          </div>
          <HeaderAuth />
        </div>
      </nav>

      <div className="flex-1 w-full flex flex-col items-center py-8 md:py-12">
        <div className="w-full max-w-5xl p-5 flex flex-col gap-12 md:gap-16">
          {/* อาจจะมี Sidebar สำหรับ Account Section ด้านซ้าย และ {children} ด้านขวา */}
          {/* <div className="flex"> */}
          {/* <AccountSidebar /> */}
          {/* <div className="flex-1">{children}</div> */}
          {/* </div> */}
          {children}
        </div>
      </div>
    </>
  );
}