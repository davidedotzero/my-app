import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { updateUserProfileAction } from './actions'; // ตรวจสอบว่า path ไปยัง actions.ts ถูกต้อง
import Link from 'next/link'; // เพิ่ม Link ถ้ายังไม่มี

export const metadata: Metadata = {
  title: 'แดชบอร์ดส่วนตัว | บ้านไม้ดาวิ (ไดกิ บอนไซ)',
  description: 'จัดการข้อมูลบัญชี กิจกรรม และโปรไฟล์ส่วนตัวของคุณ',
};

// ProfileData type (ควรจะตรงกับข้อมูลที่คุณ select และใช้ในฟอร์ม)
type ProfileData = {
  id: string;
  username: string | null;
  full_name: string | null;
  website: string | null;
  avatar_url: string | null;
  // email จะมาจาก user object โดยตรง
  // role ไม่ได้ให้ user แก้ไขจากหน้านี้
};

type AccountPageProps = {
  searchParams?: {
    error?: string;
    field?: string; 
    message?: string;
    success?: string;
  };
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login'); // หรือ path หน้า login/sign-in ของคุณ
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, website, avatar_url')
    .eq('id', user.id)
    .single<ProfileData>();

  if (!profile) {
    console.warn(`[AccountPage] Profile not found for user: ${user.id}. Error (if any):`, profileError);
    // แสดง UI กรณีไม่พบ profile หรือ redirect ไปหน้าสร้าง profile
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-semibold mb-4 text-destructive">ไม่พบข้อมูลโปรไฟล์</h1>
            <p className="text-muted-foreground">
              ดูเหมือนว่าคุณยังไม่มีข้อมูลโปรไฟล์ในระบบ 
              {/* (ถ้ามีหน้าสร้าง profile แยก) <Link href="/account/create-profile" className="text-primary hover:underline">คลิกที่นี่เพื่อสร้างโปรไฟล์</Link> หรือ */}
              ติดต่อผู้ดูแลหากปัญหายังคงอยู่
            </p>
            <Link href="/" className="mt-6 inline-block text-primary hover:underline">กลับหน้าแรก</Link>
        </div>
    );
  }
  
  const userEmail = user.email;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header className="mb-10 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          แดชบอร์ดของคุณ, {profile.username || profile.full_name || userEmail}!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          จัดการข้อมูลส่วนตัว ดูภาพรวมกิจกรรม และตั้งค่าบัญชีของคุณ
        </p>
      </header>

      {/* ส่วนแสดง Success/Error Messages */}
      {resolvedSearchParams?.success && resolvedSearchParams.message && (
        <div className="mb-6 p-4 rounded-md bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
          <p>{decodeURIComponent(resolvedSearchParams.message)}</p>
        </div>
      )}
      {resolvedSearchParams?.error && resolvedSearchParams.message && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>{decodeURIComponent(resolvedSearchParams.message)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Column 1: ฟอร์มแก้ไขโปรไฟล์ */}
        <div className="lg:col-span-2">
          <section className="bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-card-foreground">แก้ไขข้อมูลโปรไฟล์</h2>
            <form action={updateUserProfileAction} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground/90 mb-1.5">
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  value={userEmail || ''}
                  disabled
                  readOnly
                  className="w-full p-3 border border-input rounded-lg bg-muted/50 text-muted-foreground text-sm cursor-not-allowed"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">อีเมลไม่สามารถแก้ไขได้จากหน้านี้</p>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground/90 mb-1.5">
                  Username <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  defaultValue={profile.username || ''}
                  required
                  className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:border-primary bg-background text-foreground text-sm transition-colors ${resolvedSearchParams?.field === 'username' && resolvedSearchParams?.error ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'}`}
                />
                {resolvedSearchParams?.field === 'username' && resolvedSearchParams?.error && (
                   <p className="mt-1 text-xs text-destructive">{decodeURIComponent(resolvedSearchParams.message || '')}</p>
                )}
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-foreground/90 mb-1.5">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  defaultValue={profile.full_name || ''}
                  className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-foreground/90 mb-1.5">
                  เว็บไซต์
                </label>
                <input
                  type="url"
                  name="website"
                  id="website"
                  defaultValue={profile.website || ''}
                  className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label htmlFor="avatar_url" className="block text-sm font-medium text-foreground/90 mb-1.5">
                  URL รูปโปรไฟล์
                </label>
                <input
                  type="url"
                  name="avatar_url"
                  id="avatar_url"
                  defaultValue={profile.avatar_url || ''}
                  className="w-full p-3 border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground text-sm transition-colors"
                  placeholder="https://example.com/avatar.png"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  (ในอนาคตสามารถทำเป็นระบบอัปโหลดรูปภาพได้)
                </p>
              </div>
              
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Column 2: Quick Actions / Sidebar-like content */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-card p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">ลิงก์ด่วน</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/protected/reset-password"
                  className="block text-primary hover:underline font-medium"
                >
                  เปลี่ยนรหัสผ่าน
                </Link>
              </li>
              {/* เพิ่มลิงก์อื่นๆ ที่เกี่ยวข้องกับ User เช่น: */}
              {/* <li>
                <Link href="/account/my-orders" className="block text-primary hover:underline font-medium">
                  ประวัติการสั่งซื้อ (ถ้ามีร้านค้า)
                </Link>
              </li>
              <li>
                <Link href="/account/my-articles" className="block text-primary hover:underline font-medium">
                  บทความของฉัน (ถ้า User เขียนบทความได้)
                </Link>
              </li> */}
            </ul>
          </section>

          <section className="bg-card p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">กิจกรรมล่าสุด</h2>
            <p className="text-sm text-muted-foreground">
              ยังไม่มีกิจกรรมล่าสุดที่จะแสดง
              {/* (ส่วนนี้จะแสดงข้อมูลเช่น บทความที่เพิ่งดู, comment ล่าสุด, etc. ในอนาคต) */}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}