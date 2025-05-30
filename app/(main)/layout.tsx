// app/(main)/layout.tsx
import Navbar from "@/components/Navbar";
import HeaderAuth from "@/components/header-auth"; // Import HeaderAuth ที่นี่
import { createClient } from "@/utils/supabase/server";
import React from 'react';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient(); // <--- *** ต้อง await ถ้า createClient ใน server.ts ของคุณเป็น async ***
                                        // *** หรือ ไม่ต้อง await ถ้า createClient ใน server.ts เป็น sync ***
                                        // *** ให้ยึดตาม utils/supabase/server.ts ล่าสุดของคุณ ***
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

  // Render <HeaderAuth /> ที่นี่ (Server Component)
  const authButtonServerComponent = <HeaderAuth />;

  return (
    <>
      <Navbar 
        isAdmin={isAdminUser} 
        authButtonSlot={authButtonServerComponent} // <--- ส่ง Server Component เป็น prop
      />
      
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 md:pt-6 md:pb-12">
        {children}
      </div>
    </>
  );
}