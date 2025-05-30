// app/account/layout.tsx
import Navbar, { type NavLinkItem } from "@/components/Navbar"; // Import Navbar และ NavLinkItem
import HeaderAuth from "@/components/header-auth";
import { createClient } from "@/utils/supabase/server";
import React from 'react';
import { UserCircle, Edit3, Lock, Settings } from 'lucide-react'; // (Optional) Icons for account nav

const accountNavLinks: NavLinkItem[] = [ // กำหนด Links สำหรับ Account Section
  { href: "/account", label: "แดชบอร์ดบัญชี", icon: <UserCircle size={20}/> }, // หน้าหลักของ Account
  { href: "/account/profile-edit", label: "แก้ไขข้อมูลส่วนตัว", icon: <Edit3 size={20}/> }, // สมมติว่าคุณจะสร้างหน้านี้
  { href: "/account/change-password", label: "เปลี่ยนรหัสผ่าน", icon: <Lock size={20}/> }, // สมมติว่าคุณจะสร้างหน้านี้
  // เพิ่มลิงก์อื่นๆ เช่น "ประวัติการสั่งซื้อ", "ตั้งค่าการแจ้งเตือน"
];

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient(); // ยึดตาม server.ts ของคุณ
  const { data: { user } } = await supabase.auth.getUser();
  
  // ใน AccountLayout อาจจะไม่จำเป็นต้องเช็ค isAdmin สำหรับการแสดงลิงก์ "Admin Panel" ใน Navbar
  // เพราะ Navbar หลัก (จาก MainLayout หรือ RootLayout) ควรจะจัดการเรื่องนั้นไปแล้ว
  // แต่ถ้า AccountLayout เป็น top-level และต้องการ Admin Link ก็ต้องดึง isAdmin มาด้วย
  let isAdminForGlobalNav = false; // สมมติว่า user คนนี้อาจจะเป็น admin ด้วย
   if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile && profile.role === 'admin') {
      isAdminForGlobalNav = true;
    }
  }

  const authButtonServerComponent = <HeaderAuth />;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        isAdmin={isAdminForGlobalNav} // ส่ง isAdmin เผื่อ Navbar มี logic แสดง "Admin Panel" link
        authButtonSlot={authButtonServerComponent}
        navLinks={accountNavLinks}      // <--- ส่ง accountNavLinks
        brandName="บัญชีของฉัน"          // <--- ส่งชื่อแบรนด์สำหรับส่วนนี้
        brandLink="/account"             // <--- ส่งลิงก์แบรนด์สำหรับส่วนนี้
      />
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {children}
      </main>
    </div>
  );
}