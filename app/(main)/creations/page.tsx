import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image'; // สำหรับ Optimize รูปภาพ

export const metadata: Metadata = {
  title: 'ผลงานของเรา | บ้านไม้ดาวิ (ไดกิ บอนไซ)',
  description: 'เลือกชมผลงานศิลปะจากธรรมชาติ ทั้งบอนไซ สวนหินเซน และสวนในขวดแก้ว ที่สร้างสรรค์ด้วยใจโดย บ้านไม้ดาวิ (ไดกิ บอนไซ)',
};

// กำหนดข้อมูลหมวดหมู่ของผลงาน
// คุณสามารถเปลี่ยนรูปภาพ (imageUrl) และคำอธิบายได้ตามต้องการ
const creationCategories = [
  {
    name: "ไดกิ บอนไซ",
    subname: "Daiki Bonsai",
    description: "ศิลปะการย่อส่วนต้นไม้ใหญ่ลงในกระถาง สะท้อนความงามอันสงบและปรัชญาแห่งธรรมชาติ",
    imageUrl: "", // Placeholder - ควรเปลี่ยนเป็นรูปจริง
    imageAlt: "คอลเลคชั่นบอนไซหลากหลายสายพันธุ์",
    link: "/creations/bonsai",
  },
  {
    name: "ไดกิ เซนสเคป",
    subname: "Daiki Zenscapes",
    description: "จำลองทัศนียภาพอันเรียบง่ายของสวนหินเซน สร้างพื้นที่แห่งความสงบและสมาธิภายในบ้านคุณ",
    imageUrl: "", // Placeholder
    imageAlt: "สวนหินเซนจำลองอันงดงาม",
    link: "/creations/zen-gardens",
  },
  {
    name: "ไดกิ กรีนเวิร์ล",
    subname: "Daiki Greenworlds",
    description: "โลกสีเขียวใบเล็กในโหลแก้วสวยงาม จำลองระบบนิเวศน์ขนาดเล็กที่ดูแลรักษาง่ายและมีชีวิตชีวา",
    imageUrl: "", // Placeholder
    imageAlt: "สวนในขวดแก้ว (Terrarium) หลากหลายรูปแบบ",
    link: "/creations/terrariums",
  },
];

export default async function CreationsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Page Header */}
      <header className="mb-12 md:mb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
          ผลงานสร้างสรรค์จากธรรมชาติ
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          บ้านไม้ดาวิภูมิใจนำเสนอผลงานศิลปะจากธรรมชาติที่สร้างสรรค์ด้วยความรักและความใส่ใจในทุกรายละเอียด ไม่ว่าจะเป็นบอนไซ, สวนหินเซน, หรือสวนในขวดแก้ว เพื่อเติมเต็มความสุขและความสงบให้กับพื้นที่ของคุณ
        </p>
      </header>

      {/* Categories Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {creationCategories.map((category) => (
          <Link 
            href={category.link} 
            key={category.name} 
            className="group block bg-card rounded-xl shadow-lg hover:shadow-2xl border border-border/70 overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="relative w-full aspect-w-4 aspect-h-3 overflow-hidden"> {/* กำหนด aspect ratio ของรูปภาพ */}
              <Image
                src={category.imageUrl}
                alt={category.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // ช่วย Next.js เลือกขนาดรูปที่เหมาะสม
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold text-primary group-hover:text-primary/80 mb-1 transition-colors">
                {category.name}
              </h2>
              <p className="text-sm font-light text-muted-foreground mb-3">
                {category.subname}
              </p>
              <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-3">
                {category.description}
              </p>
              <div className="mt-4">
                <span className="inline-block text-sm font-medium text-primary group-hover:underline transition-all">
                  เลือกชมผลงานหมวดนี้ &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* (Optional) Call to Action เพิ่มเติม */}
      {/* <div className="mt-16 text-center">
        <Link 
          href="/contact" // หรือลิงก์ไปยังหน้า Contact หรือ Custom Order
          className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors text-lg shadow-md hover:shadow-lg"
        >
          สอบถามสั่งทำพิเศษ
        </Link>
      </div> */}
    </div>
  );
}