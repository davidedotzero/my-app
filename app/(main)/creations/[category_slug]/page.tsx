import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard'; // Import ProductCard
import type { Metadata } from 'next';

type ProductCategoryPageProps = {
  params: {
    category_slug: string; // slug ของหมวดหมู่จาก URL
  };
  // searchParams?: { [key: string]: string | string[] | undefined }; // ถ้าจะใช้ query params อื่นๆ
};

// Type สำหรับ Product (ควรจะตรงกับ ProductCard และ schema ใน DB)
type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image_url?: string | null;
  product_type: string | null;
  description?: string | null;
  created_at: string;
};

// ฟังก์ชันช่วยแปลง slug เป็นชื่อที่แสดงผล (ปรับปรุงได้ตามต้องการ)
function getCategoryDisplayName(slug: string): string {
  switch (slug) {
    case 'bonsai':
      return 'บอนไซ (Bonsai)';
    case 'zen-gardens':
      return 'สวนหินเซน (Zen Gardens)';
    case 'terrariums':
      return 'สวนในขวดแก้ว (Terrariums)';
    default:
      // แปลง slug เป็น Title Case แบบง่ายๆ ถ้าไม่ตรงกับ case ด้านบน
      return slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}

export async function generateMetadata({ params }: ProductCategoryPageProps): Promise<Metadata> {
  // ใช้ await params ถ้าจำเป็นสำหรับ environment ของคุณ
  const awaitedParams = params ? await params : { category_slug: 'all' }; 
  const category_slug = awaitedParams.category_slug;
  const categoryName = getCategoryDisplayName(category_slug);

  return {
    title: `${categoryName} | ผลงานของเรา - บ้านไม้ดาวิ`,
    description: `เลือกชม ${categoryName} คุณภาพดีหลากหลายรายการ จากบ้านไม้ดาวิ (ไดกิ บอนไซ)`,
  };
}

export default async function ProductCategoryPage({ params }: ProductCategoryPageProps) {
  // ใช้ await params ถ้าจำเป็นสำหรับ environment ของคุณ
  const awaitedParams = params ? await params : { category_slug: '' };
  const category_slug = awaitedParams.category_slug;

  const supabase = await createClient(); // ยึดตาม server.ts ของคุณ

  // ดึงข้อมูลสินค้าสำหรับหมวดหมู่นี้
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug, price, image_url, product_type, description, created_at')
    .eq('product_type', category_slug) // กรองสินค้าตาม product_type (ซึ่งก็คือ category_slug)
    .order('created_at', { ascending: false }) // หรือเรียงตามชื่อ, ราคา ฯลฯ
    .returns<Product[]>();

  const categoryName = getCategoryDisplayName(category_slug);

  // (Optional) ตรวจสอบว่า category_slug นี้ถูกต้องและมีอยู่จริงหรือไม่
  // ถ้าคุณมีตาราง product_categories แยกต่างหาก ควรจะ query ตารางนั้นก่อน
  // แต่ตอนนี้เราใช้ product_type ในตาราง products เป็นตัวกำหนด category โดยตรง
  // ถ้าไม่พบสินค้าในหมวดนี้ ก็จะแสดงข้อความ "ไม่พบสินค้า"
  
  if (productsError) {
    console.error(`Error fetching products for category "${category_slug}":`, productsError.message);
    // อาจจะแสดง UI สำหรับ Error ที่นี่
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header className="mb-10 md:mb-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/creations" className="hover:text-primary transition-colors">ผลงานของเรา</Link></li>
            <li><span className="mx-1">/</span></li>
            <li className="font-medium text-foreground">{categoryName}</li>
          </ol>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {categoryName}
        </h1>
        {/* (Optional) คุณสามารถเพิ่มคำอธิบายสำหรับหมวดหมู่นี้ได้ ถ้ามีข้อมูล */}
        {/* <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          คำอธิบายสั้นๆ เกี่ยวกับหมวดหมู่ {categoryName} ...
        </p> */}
      </header>

      {productsError && (
        <div className="text-center py-10 bg-card rounded-lg shadow border border-border">
          <h2 className="text-2xl font-semibold text-destructive mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-muted-foreground">ไม่สามารถโหลดรายการสินค้าในหมวดหมู่นี้ได้</p>
        </div>
      )}

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {/* ปรับจำนวนคอลัมน์ (md:grid-cols-3 lg:grid-cols-4) ตามความเหมาะสม */}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        !productsError && ( // แสดงข้อความนี้ต่อเมื่อไม่มี error แต่ไม่พบสินค้า
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-foreground mb-4">ยังไม่พบสินค้าในหมวดนี้</h2>
            <p className="text-muted-foreground mb-6">
              ขออภัย ขณะนี้ยังไม่มีสินค้าสำหรับ "{categoryName}" โปรดลองเลือกชมหมวดหมู่อื่น
            </p>
            <Link href="/creations" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              ดูผลงานทั้งหมด
            </Link>
          </div>
        )
      )}

      {/* (อนาคต) ส่วน Pagination สามารถเพิ่มตรงนี้ได้ถ้ามีสินค้าเยอะ */}
    </div>
  );
}