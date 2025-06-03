import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
// import Image from 'next/image';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import type { Metadata } from 'next';
// (Optional) ถ้าจะใช้ Markdown สำหรับ product.description
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

// Type สำหรับ Product (ควรจะมาจากไฟล์ types กลาง)
type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null; // Array of image URLs for gallery
  product_type: string | null;
  stock_quantity?: number | null;
  created_at: string;
  // เพิ่มฟิลด์อื่นๆ ตาม schema ของคุณ
};

type ProductDetailPageProps = {
  params: {
    category_slug: string; // อาจจะใช้สำหรับ Breadcrumbs หรือ validation
    product_slug: string;
  };
};

// ฟังก์ชันช่วยแปลง slug เป็นชื่อที่แสดงผล (เหมือนกับที่ใช้ในหน้า category)
function getCategoryDisplayName(slug: string | null): string {
  if (!slug) return "ผลงาน";
  switch (slug) {
    case 'bonsai':
      return 'บอนไซ';
    case 'zen-gardens':
      return 'สวนหินเซน';
    case 'terrariums':
      return 'สวนในขวดแก้ว';
    default:
      return slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  // ใช้ await params ถ้าจำเป็นสำหรับ environment ของคุณ
  const awaitedParams = params ? await params : { product_slug: '', category_slug: '' };
  const product_slug = awaitedParams.product_slug;

  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('slug', product_slug)
    .single<Pick<Product, 'name' | 'description' | 'image_url'>>();

  if (!product) {
    return {
      title: 'ไม่พบสินค้า',
    };
  }

   const ogImageUrl = product.image_url?.trim();

  return {
    title: `${product.name} | บ้านไม้ดาวิ (ไดกิ บอนไซ)`,
    description: product.description?.substring(0, 155) || `รายละเอียดสินค้า ${product.name}`, // ใช้ description หรือ fallback
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : [],
      type: 'article', // ระบุ type เป็น product สำหรับ Open Graph
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // ใช้ await params ถ้าจำเป็นสำหรับ environment ของคุณ
  const awaitedParams = params ? await params : { product_slug: '', category_slug: '' };
  const { product_slug, category_slug } = awaitedParams;

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*') // ดึงข้อมูลทั้งหมดของสินค้า
    .eq('slug', product_slug) // ค้นหาสินค้าด้วย product_slug
    // (Optional) .eq('product_type', category_slug) // อาจจะเพิ่มเงื่อนไขนี้เพื่อความถูกต้องของ URL
    .single<Product>();

  if (productError || !product) {
    console.error(`Error fetching product (slug: ${product_slug}):`, productError);
    notFound(); // ถ้าไม่พบสินค้า หรือมี error ให้แสดงหน้า 404
  }

  // (Optional) ตรวจสอบว่า product_type ของสินค้าตรงกับ category_slug ใน URL หรือไม่
  if (product.product_type && product.product_type !== category_slug) {
    console.warn(`Product slug "${product_slug}" found, but its type "${product.product_type}" does not match category_slug "${category_slug}" in URL.`);
    // คุณอาจจะ redirect ไป URL ที่ถูกต้อง หรือแสดงผลต่อไปก็ได้
    // สำหรับตอนนี้จะแสดงผลต่อไปก่อน
  }

  const categoryName = getCategoryDisplayName(product.product_type); // ใช้ product_type จากสินค้าที่ดึงได้

  // const mainImageUrl = product.image_url?.trim();
  // const galleryImages = product.images?.map(url => url?.trim()).filter(Boolean) as string[] | undefined;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link></li>
          <li><span className="mx-1">/</span></li>
          <li><Link href="/creations" className="hover:text-primary transition-colors">ผลงานของเรา</Link></li>
          {product.product_type && ( // แสดงหมวดหมู่ถ้ามี
            <>
              <li><span className="mx-1">/</span></li>
              <li><Link href={`/creations/${product.product_type}`} className="hover:text-primary transition-colors">{categoryName}</Link></li>
            </>
          )}
          <li><span className="mx-1">/</span></li>
          <li className="font-medium text-foreground truncate max-w-xs" title={product.name}>{product.name}</li>
        </ol>
      </nav>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="lg:sticky lg:top-28"> {/* ปรับ top ตามความสูง Navbar + ระยะห่าง */}
          <ProductImageGallery 
            mainImageUrl={product.image_url}
            galleryImageUrls={product.images}
            altText={product.name}
          />
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {product.name}
          </h1>
          
          <p className="text-3xl font-semibold text-primary">
            ฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          {product.product_type && (
            <div className="text-sm">
              <span className="text-muted-foreground">ประเภท: </span>
              <Link href={`/creations/${product.product_type}`} className="font-medium text-primary hover:underline">
                {categoryName}
              </Link>
            </div>
          )}

          {/* (Optional) Stock Information */}
          {typeof product.stock_quantity === 'number' && (
            <p className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-destructive'}`}>
              {product.stock_quantity > 0 ? `มีสินค้า (${product.stock_quantity} ชิ้น)` : 'สินค้าหมด'}
            </p>
          )}
          
          {/* (Future) Add to Cart Button */}
          {/* <button 
            disabled={!(product.stock_quantity && product.stock_quantity > 0)}
            className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock_quantity && product.stock_quantity > 0 ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด'}
          </button> */}

          {/* Product Description */}
          {product.description && (
            <div className="pt-4 border-t border-border">
              <h2 className="text-xl font-semibold text-foreground mb-3">รายละเอียดสินค้า</h2>
              {/* ถ้า description เป็น HTML ที่ปลอดภัย: */}
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
              {/* หรือถ้าเป็น Markdown: */}
              {/* <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm ...">{product.description}</ReactMarkdown> */}
            </div>
          )}
        </div>
      </div>

      {/* (อนาคต) ส่วนสินค้าที่เกี่ยวข้อง (Related Products) */}
      {/* <RelatedProducts currentProductId={product.id} categoryType={product.product_type} /> */}
    </div>
  );
}