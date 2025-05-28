// app/(auth-pages)/layout.tsx
import Link from 'next/link';
import Image from 'next/image'; // ถ้าคุณจะใช้โลโก้เป็นรูปภาพ

export default async function AuthPagesLayout({ // เปลี่ยนชื่อเพื่อความชัดเจน (แต่ใช้ Layout ก็ได้)
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Container หลัก: 
        - min-h-screen: ให้เต็มความสูงของหน้าจอ
        - flex, items-center, justify-center: จัดให้อยู่กึ่งกลางทั้งแนวตั้งและแนวนอน
        - bg-gradient...: เพิ่มพื้นหลังสีเขียวอ่อนๆ แบบไล่เฉด
        - py-12, px-4: เพิ่ม padding รอบๆ
      */}
      <div className="w-full max-w-md space-y-8">
        {/* Container สำหรับกล่องฟอร์ม:
          - max-w-md: กำหนดความกว้างสูงสุดของกล่องฟอร์ม
          - space-y-8: เพิ่มระยะห่างระหว่าง child elements (โลโก้, ฟอร์ม)
        */}
        
        {/* ส่วนโลโก้หรือชื่อแบรนด์ */}
        <div className="text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            {/* ถ้ามีไฟล์โลโก้ใน public/ โฟลเดอร์:
              <Image 
                src="/logo-daiki-bonsai.png" // แก้เป็น path โลโก้ของคุณ
                alt="บ้านไม้ดาวิ (ไดกิ บอนไซ) Logo"
                width={120} // กำหนดขนาดตามความเหมาะสม
                height={120}
                className="mx-auto"
              /> 
            */}
            {/* หรือถ้าใช้เป็น Text */}
            <h1 className="text-4xl font-bold text-green-700 tracking-tight">
              บ้านไม้ดาวิ
            </h1>
            <p className="text-sm text-green-600">ไดกิ บอนไซ</p>
          </Link>
        </div>

        {/* กล่องสำหรับเนื้อหาฟอร์ม (children) */}
        <div className="bg-black p-8 shadow-2xl rounded-xl">
          {children} {/* เนื้อหาจาก page.tsx ของ login, signup จะแสดงตรงนี้ */}
        </div>

        {/* (Optional) ส่วน Link เพิ่มเติมด้านล่าง */}
        <div className="text-center text-sm text-gray-600">
          <p>
            มีปัญหาในการเข้าใช้งาน?{' '}
            <Link href="/contact" className="font-medium text-green-600 hover:text-green-700 hover:underline">
              ติดต่อเรา
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}