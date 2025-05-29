import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard | บ้านไม้ดาวิ (ไดกิ บอนไซ)',
  description: 'ส่วนจัดการเนื้อหาเว็บไซต์บ้านไม้ดาวิ',
};

export default async function AdminDashboardPage() {
  // คุณสามารถดึงข้อมูลสถิติเบื้องต้นมาแสดงที่นี่ได้ในอนาคต
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        ยินดีต้อนรับเข้าสู่ส่วนผู้ดูแลระบบ เลือกเมนูทางซ้ายเพื่อเริ่มจัดการเนื้อหา
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-card-foreground mb-2">จัดการบทความ</h2>
          <p className="text-sm text-muted-foreground mb-4">เพิ่ม ลบ แก้ไข บทความทั้งหมดในเว็บไซต์</p>
          <Link href="/admin/articles" className="text-sm font-medium text-primary hover:text-primary/80">
            ไปที่หน้าจัดการบทความ &rarr;
          </Link>
        </div>
        {/* เพิ่มการ์ดสำหรับส่วนจัดการอื่นๆ ที่นี่ */}
      </div>
    </div>
  );
}