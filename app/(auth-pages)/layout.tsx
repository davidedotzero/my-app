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
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <h1 className="text-4xl font-bold text-green-700 tracking-tight">
              Banmaih Davih
            </h1>
            <p className="text-sm text-green-600">Daiki Bonsai</p>
          </Link>
        </div>
        <div className="bg-white p-8 shadow-2xl rounded-xl">
          {children}
        </div>
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