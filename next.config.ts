// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // หรือการตั้งค่าอื่นๆ ที่คุณมี
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '', // โดยทั่วไปไม่ต้องใส่ถ้าเป็น https (port 443)
        pathname: '/**', // อนุญาตทุก path ภายใต้ hostname นี้ (คุณสามารถจำกัด path ได้ถ้าต้องการ)
      },
      // (สำคัญ) ถ้าในอนาคตคุณจะใช้รูปภาพจาก Supabase Storage ให้เพิ่ม Supabase hostname ของคุณที่นี่ด้วย
      // เช่น:
      // {
      //   protocol: 'https',
      //   hostname: 'xxxxxxxxx.supabase.co', // แทน xxxxxxxxx ด้วย Project ID ของคุณ
      //   port: '',
      //   pathname: '/storage/v1/object/public/**',
      // },
    ],
  },
  // การตั้งค่าอื่นๆ ของ Next.js (ถ้ามี)
};

export default nextConfig;