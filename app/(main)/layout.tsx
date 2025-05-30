// app/(main)/layout.tsx
import Navbar, { type NavLinkItem } from "@/components/Navbar"; // Import NavLinkItem type ด้วย
import HeaderAuth from "@/components/header-auth";
import { createClient } from "@/utils/supabase/server";
import React from 'react';
import { BookOpenText, Home, Users, Phone, Palette, FileIcon } from "lucide-react"; // (Optional) Icons for main nav

const mainSiteNavLinks: NavLinkItem[] = [ // กำหนด Links สำหรับ Main Site
  { href: "/articles", label: "บทความ", icon: <BookOpenText size={20}/> },
  { href: "/creations", label: "ผลงานของเรา", icon: <Palette size={20}/> },
  { href: "/about", label: "เกี่ยวกับเรา", icon: <Users size={20}/> },
  { href: "/contact", label: "ติดต่อเรา", icon: <Phone size={20}/> },
  { href: "/account", label: "โปรไฟล์", icon: <FileIcon size={20}/> },
];

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient(); // ยึดตาม server.ts ของคุณ (async หรือ sync)
  const { data: { user } } = await supabase.auth.getUser();
  let isAdminUser = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile && profile.role === 'admin') {
      isAdminUser = true;
    }
  }

  const authButtonServerComponent = <HeaderAuth />; // Render HeaderAuth ที่นี่

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        isAdmin={isAdminUser} 
        authButtonSlot={authButtonServerComponent}
        navLinks={mainSiteNavLinks} // <--- ส่ง mainSiteNavLinks
        brandName="Baan Mai Davi"    // <--- ส่งชื่อแบรนด์
        brandLink="/"                // <--- ส่งลิงก์แบรนด์
      />
      <main className="flex-grow w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}