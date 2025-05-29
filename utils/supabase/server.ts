// utils/supabase/server.ts (แก้ไขให้ถูกต้องจริงๆ ครับ)

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ทำให้ createClient เป็น synchronous function (ไม่ใช่ async)
// โดยการลบคำว่า async ออกจากนิยามฟังก์ชัน
export const createClient = async () => {// <--- *** ลบ async ออกไป ***
  const cookieStore = await cookies(); // ถูกต้องแล้วที่ไม่มี await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}