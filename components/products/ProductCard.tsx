// components/products/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';

type Product = {
  id: number; // หรือ string ถ้าคุณใช้ UUID
  name: string;
  slug: string; // Slug ของสินค้า
  price: number;
  image_url?: string | null;
  product_type: string | null; // ประเภทสินค้า (ใช้สร้าง link)
  // เพิ่มฟิลด์อื่นๆ ที่คุณต้องการแสดงบนการ์ด เช่น excerpt สั้นๆ
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  // สร้าง Link ไปยังหน้ารายละเอียดสินค้า (ซึ่งเราจะสร้างทีหลัง)
  // โครงสร้าง URL อาจจะเป็น /creations/[product_type]/[product_slug]
  const productDetailLink = `/creations/${product.product_type || 'item'}/${product.slug}`;

  return (
    <Link 
      href={productDetailLink} 
      className="group block bg-card text-card-foreground rounded-xl shadow-lg hover:shadow-2xl border border-border/60 overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden"> {/* หรือ aspect-square ถ้าสินค้าส่วนใหญ่เป็นสี่เหลี่ยมจตุรัส */}
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // ปรับ sizes ตาม layout ของคุณ
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-sm text-muted-foreground">ไม่มีรูปภาพ</span>
          </div>
        )}
      </div>
      <div className="p-4 md:p-5">
        <h3 className="text-md md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1 truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="text-lg font-bold text-primary mb-2">
          ฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {/* คุณสามารถเพิ่มรายละเอียดสั้นๆ หรือ excerpt ได้ที่นี่ */}
        {/* <p className="text-xs text-muted-foreground uppercase">{product.product_type}</p> */}
        <div className="mt-3">
          <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline">
            ดูรายละเอียด &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}