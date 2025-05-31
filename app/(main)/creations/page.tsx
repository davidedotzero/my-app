import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Droplets, Mountain } from 'lucide-react'; // (Optional) ตัวอย่างไอคอน

export const metadata: Metadata = {
  title: 'ผลงานสร้างสรรค์ | บ้านไม้ดาวิ (ไดกิ บอนไซ)',
  description: 'เลือกชมผลงานศิลปะจากธรรมชาติอันงดงาม ทั้งบอนไซ สวนหินเซน และสวนในขวดแก้ว ที่สร้างสรรค์ด้วยความรักและความใส่ใจจากบ้านไม้ดาวิ',
};

// กำหนดข้อมูลหมวดหมู่หลักของผลงาน/สินค้า
// *** คุณจะต้องเปลี่ยน imageUrl ให้เป็น URL รูปภาพจริงของคุณนะครับ ***
const creationCategories = [
  {
    name: "ไดกิ บอนไซ",
    tagline: "ศิลปะแห่งความอดทนและความงาม",
    description: "บอนไซแต่ละต้นคือเรื่องราวของกาลเวลาและความใส่ใจ คัดสรรและดูแลเพื่อเป็นผลงานชิ้นเอกในพื้นที่ของคุณ",
    imageUrl: "https://via.placeholder.com/600x400/a2d2a2/333333?text=Daiki+Bonsai", // << เปลี่ยนรูปภาพที่นี่
    imageAlt: "บอนไซสวยงามหลากหลาย_สไตล์",
    link: "/creations/bonsai", // <--- ลิงก์ไปยังหน้ารวมบอนไซ (จะสร้างทีหลัง)
    icon: <Leaf size={28} className="text-primary" />, // (Optional)
  },
  {
    name: "ไดกิ เซนสเคป",
    tagline: "ความสงบในสวนหินจำลอง",
    description: "จำลองความงามอันเรียบง่ายของสวนหินเซนในขนาดที่พอเหมาะ สร้างมุมแห่งสมาธิและความผ่อนคลาย",
    imageUrl: "https://via.placeholder.com/600x400/b2c2b2/333333?text=Daiki+Zenscapes", // << เปลี่ยนรูปภาพที่นี่
    imageAlt: "สวนหินเซนจำลอง",
    link: "/creations/zen-gardens", // <--- ลิงก์ไปยังหน้ารวมสวนหินเซน (จะสร้างทีหลัง)
    icon: <Mountain size={28} className="text-primary" />, // (Optional)
  },
  {
    name: "ไดกิ กรีนเวิร์ล",
    tagline: "โลกสีเขียวในขวดแก้ว",
    description: "ระบบนิเวศน์ขนาดเล็กในโหลแก้ว สวยงาม ดูแลง่าย เติมความสดชื่นให้ทุกมุมของบ้านและที่ทำงาน",
    imageUrl: "https://via.placeholder.com/600x400/c2d2c2/333333?text=Daiki+Greenworlds", // << เปลี่ยนรูปภาพที่นี่
    imageAlt: "สวนในขวดแก้ว (Terrarium) สวยงาม",
    link: "/creations/terrariums", // <--- ลิงก์ไปยังหน้ารวมสวนขวด (จะสร้างทีหลัง)
    icon: <Droplets size={28} className="text-primary" />, // (Optional)
  },
];

export default async function CreationsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <header className="mb-12 md:mb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
          ผลงานของเรา
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          บ้านไม้ดาวิภูมิใจนำเสนอผลงานศิลปะจากธรรมชาติที่รังสรรค์ด้วยความรักและความเชี่ยวชาญ เชิญเลือกชมความงามในแบบที่คุณสัมผัสได้
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {creationCategories.map((category) => (
          <Link 
            href={category.link} 
            key={category.name} 
            className="group flex flex-col bg-card rounded-xl shadow-lg hover:shadow-2xl border border-border/70 overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="relative w-full aspect-[16/10] overflow-hidden">
              <Image
                src={category.imageUrl}
                alt={category.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 md:p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-2">
                {category.icon}
                <h2 className="text-xl md:text-2xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                  {category.name}
                </h2>
              </div>
              <p className="text-sm font-light text-muted-foreground mb-3">
                {category.tagline}
              </p>
              <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-3 flex-grow">
                {category.description}
              </p>
              <div className="mt-5 pt-3 border-t border-border/50">
                <span className="inline-block text-sm font-medium text-primary group-hover:underline transition-all">
                  เลือกชม {category.name} ทั้งหมด &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}