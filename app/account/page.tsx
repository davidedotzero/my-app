import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { updateUserProfileAction } from './actions';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ข้อมูลบัญชี | บ้านไม้ดาวิ (ไดกิ บอนไซ)',
  description: 'จัดการข้อมูลบัญชีและโปรไฟล์ส่วนตัวของคุณ',
};

type ProfileData = {
  id: string;
  username: string | null;
  full_name: string | null;
  website: string | null;
  avatar_url: string | null;
  // email ไม่ได้อยู่ใน profiles โดยตรง แต่มาจาก auth.users
  // role ก็ไม่ได้ให้ user แก้ไขเอง
};

type AccountPageProps = {
  searchParams?: {
    error?: string;
    field?: string; 
    message?: string;
    success?: string; // สำหรับ success message
  };
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  // ใช้ "await searchParams" ตามที่คุณเคยทดลองแล้วได้ผลกับ error ก่อนหน้า
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login'); // หรือ path หน้า login/sign-in ของคุณ
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, website, avatar_url') // เลือกเฉพาะฟิลด์ที่ user แก้ไขได้หรือแสดงผล
    .eq('id', user.id)
    .single<ProfileData>();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 คือ "โจทก์ร้องขอออบเจ็กต์ JSON แถวหลายแถว (หรือไม่มี) ถูกส่งคืน"
    // ถ้าไม่ใช่ error 'PGRST116' (no rows) ให้ถือว่าเป็น error จริงจัง
    console.error('Error fetching profile for user:', user.id, profileError);
    // อาจจะแสดงหน้า error กลาง
  }
  
  // ถ้า !profile อาจจะหมายถึง user เก่าที่ยังไม่มี record ใน profiles
  // หรือ trigger handle_new_user อาจจะยังไม่ได้ทำงานสำหรับ user นี้
  // คุณอาจจะต้องการให้ user สร้าง profile ครั้งแรกถ้ายังไม่มี
  if (!profile) { // ถ้า data (profile) เป็น null (ซึ่งจะเกิดขึ้นถ้า query ไม่เจอ หรือเจอแต่ error PGRST116)
    console.warn('[AccountPage] Profile not found for user:', user.id, 'Error (if any):', profileError);
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
            <h1 className="text-2xl font-semibold mb-4 text-destructive">ไม่พบข้อมูลโปรไฟล์</h1>
            <p className="text-muted-foreground">ดูเหมือนว่าคุณยังไม่มีข้อมูลโปรไฟล์ในระบบ อาจจะลองติดต่อผู้ดูแลหากปัญหายังคงอยู่</p>
            <Link href="/" className="mt-6 inline-block text-primary hover:underline">กลับหน้าแรก</Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-foreground">ข้อมูลบัญชีของคุณ</h1>

      {resolvedSearchParams?.success && resolvedSearchParams.message && (
        <div className="mb-6 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
          <p>{decodeURIComponent(resolvedSearchParams.message)}</p>
        </div>
      )}
      {resolvedSearchParams?.error && resolvedSearchParams.message && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p className="font-semibold">เกิดข้อผิดพลาด:</p>
          <p>{decodeURIComponent(resolvedSearchParams.message)}</p>
        </div>
      )}

      <form action={updateUserProfileAction} className="space-y-6 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/90 mb-1.5">
            อีเมล
          </label>
          <input
            type="email"
            id="email"
            value={user.email || ''} // ดึง email จาก user object ของ Supabase Auth
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
            ชื่อ-นามสกุล (Full Name)
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
            เว็บไซต์ (Website URL)
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
            URL รูปโปรไฟล์ (Avatar URL)
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
            (ในอนาคตส่วนนี้สามารถทำเป็นระบบอัปโหลดรูปภาพได้)
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
    </div>
  );
}