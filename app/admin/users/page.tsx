// app/admin/users/page.tsx
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import RoleChanger from '@/components/admin/users/RoleChanger';

export const metadata: Metadata = {
  title: 'จัดการผู้ใช้งาน | Admin Dashboard',
  description: 'ดูและแก้ไข Role ของผู้ใช้งานในระบบ',
};

type UserProfile = {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  role: string;
  user_created_at: string | null; // เปลี่ยนจาก users(created_at) เป็น user_created_at โดยตรง
};

const AVAILABLE_ROLES = ['user', 'admin', 'editor'];

export default async function ManageUsersPage() {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, username, full_name, role, user_created_at') // <<-- ดึง user_created_at โดยตรง
    .order('role', { ascending: true })
    .order('user_created_at', { ascending: true }) // (Optional) เรียงตามวันที่สมัครด้วย
    .returns<UserProfile[]>();

  if (error) {
    console.error('Error fetching user profiles for admin:', error.message);
    return <div className="bg-destructive/10 text-destructive p-4 rounded-md">Error loading users: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">จัดการผู้ใช้งาน</h1>
      </div>

      {profiles && profiles.length > 0 ? (
        <div className="bg-card shadow-md rounded-lg overflow-x-auto">
          <table className="w-full min-w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs text-foreground/80 uppercase bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Email</th>
                <th scope="col" className="px-6 py-3 font-medium">Username</th>
                <th scope="col" className="px-6 py-3 font-medium">Full Name</th>
                <th scope="col" className="px-6 py-3 font-medium">Current Role</th>
                <th scope="col" className="px-6 py-3 font-medium">Joined At</th>
                <th scope="col" className="px-6 py-3 font-medium">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">{profile.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{profile.username || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{profile.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      profile.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300' :
                      profile.role === 'editor' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300' :
                      'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300'
                    }`}>
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"> {/* แสดง user_created_at */}
                    {profile.user_created_at ? new Date(profile.user_created_at).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <RoleChanger userId={profile.id} currentRole={profile.role} availableRoles={AVAILABLE_ROLES} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-card rounded-lg shadow">
          <p className="text-muted-foreground">ไม่พบข้อมูลผู้ใช้งานในระบบ</p>
        </div>
      )}
    </div>
  );
}