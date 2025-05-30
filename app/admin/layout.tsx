import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, FileText, Settings, Users } from 'lucide-react'; // ตัวอย่าง Icons

function AdminSidebar() {
  return (
    <aside className="w-60 bg-slate-800 text-slate-200 p-5 space-y-4 h-screen sticky top-0 shadow-lg">
      <div className="mb-8">
        <Link href="/admin" className="text-2xl font-semibold text-white hover:text-green-400 transition-colors">
          Admin Panel
        </Link>
        <p className="text-xs text-slate-400">Baan Mai Davi</p>
      </div>
      <nav className="space-y-2">
        <Link href="/admin" className="flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-slate-700 transition-colors text-sm">
          <Home size={18} />
          Dashboard
        </Link>
        <Link href="/admin/articles" className="flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-slate-700 transition-colors text-sm">
          <FileText size={18} />
          Manage Articles
        </Link>
        <Link href="/" className="flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-slate-700 transition-colors text-sm">
          <FileText size={18} />
          Go to Site
        </Link>
        {/* เพิ่ม Links สำหรับส่วน Admin อื่นๆ ที่นี่ */}
        <Link href="/admin/users" className="flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-slate-700 transition-colors text-sm">
          <Users size={18} />
          Manage Users
        </Link>
        {/* <Link href="/admin/settings" className="flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-slate-700 transition-colors text-sm">
          <Settings size={18} />
          Settings
        </Link> */}
      </nav>
    </aside>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log('User not authenticated for admin area, redirecting to login.');
    return redirect('/sign-in'); // หรือ path หน้า login ของคุณ เช่น '/sign-in'
  }

  
  const { data: profile, error: profileError } = await supabase
    .from('profiles') // ชื่อตาราง profiles ของคุณ
    .select('role')   // เลือกเฉพาะคอลัมน์ role
    .eq('id', user.id) // เงื่อนไขคือ id ของ profile ต้องตรงกับ id ของ user ที่ล็อกอิน
    .single();         // คาดหวังว่าจะได้ profile เดียว

  if (profileError) {
    console.error('Error fetching user profile for admin check:', profileError);
    // อาจจะ redirect ไปหน้า error หรือหน้าหลัก
    return redirect('/?error=profile_fetch_failed'); 
  }

  if (!profile || profile.role !== 'admin') {
    console.warn(`User ${user.email} (ID: ${user.id}) with role '${profile?.role || 'unknown'}' attempted to access admin area. Access denied.`);
    // ถ้าไม่มี profile หรือ role ไม่ใช่ 'admin' ให้ redirect ไปหน้าหลัก (หรือหน้า Access Denied)
    return redirect('/?error=access_denied&message=You do not have permission to access this area.');
  }

  // ถ้าผ่านมาถึงตรงนี้ แสดงว่า user ล็อกอินแล้ว และมี role เป็น 'admin'
  console.log(`User ${user.email} (Role: ${profile.role}) accessed admin area.`);

  // *** สำคัญมาก: การตรวจสอบสิทธิ์ Admin ***
  // ในการใช้งานจริง คุณต้องมีระบบตรวจสอบว่า user ที่ login เข้ามาเป็น Admin หรือไม่
  // เช่น อาจจะเช็คจาก custom claims ใน JWT, ตาราง user_roles, หรือ email ที่กำหนดไว้
  // ตัวอย่าง (สมมติว่าคุณมี custom claim 'user_role'):
  // const userRole = user.user_metadata?.role; // หรือจากตารางอื่น
  // if (userRole !== 'admin') {
  //   console.log('User is not admin, redirecting.');
  //   return redirect('/'); // หรือแสดงหน้า "Access Denied"
  // }
  // สำหรับตอนนี้ เราจะอนุญาตให้ผู้ใช้ที่ login แล้วทุกคนเข้าได้ก่อน เพื่อให้ง่ายต่อการพัฒนา

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}