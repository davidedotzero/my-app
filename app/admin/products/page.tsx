// app/admin/products/page.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FilePlus2, Eye, Edit3, Trash2 } from 'lucide-react'; // Icons

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  product_type: string | null;
  created_at: string;
};

export const metadata: Metadata = {
  title: 'จัดการสินค้า | Admin Dashboard',
  description: 'ดู, เพิ่ม, แก้ไข, และลบสินค้า',
};

type ManageProductsPageProps = {
  searchParams?: {
    message?: string; // For success messages from actions
  };
};

export default async function ManageProductsPage({ searchParams }: ManageProductsPageProps) {
  const supabase = await createClient();
  // ใช้ await searchParams ถ้าคุณเจอปัญหาเรื่อง dynamic API เหมือนเดิม
  const awaitedSearchParams = searchParams ? await searchParams : {};
  const successMessage = awaitedSearchParams.message;

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, price, product_type, created_at')
    .order('created_at', { ascending: false })
    .returns<Product[]>();

  if (error) {
    console.error('Error fetching products for admin:', error.message);
    return <div className="bg-destructive/10 text-destructive p-4 rounded-md">Error loading products: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">จัดการสินค้า</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <FilePlus2 size={18} />
          เพิ่มสินค้าใหม่
        </Link>
      </div>

      {successMessage && (
         <div className="mb-6 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
          <p>{decodeURIComponent(successMessage)}</p>
        </div>
      )}

      {products && products.length > 0 ? (
        <div className="bg-card shadow-md rounded-lg overflow-x-auto">
          <table className="w-full min-w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs text-foreground/80 uppercase bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">ชื่อสินค้า</th>
                <th scope="col" className="px-6 py-3 font-medium">ประเภท</th>
                <th scope="col" className="px-6 py-3 font-medium">ราคา</th>
                <th scope="col" className="px-6 py-3 font-medium">สร้างเมื่อ</th>
                <th scope="col" className="px-6 py-3 font-medium text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap max-w-xs truncate" title={product.name}>{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.product_type || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(product.created_at).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' })}</td>
                  <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                    <Link href={`/creations/${product.product_type || 'all'}/${product.slug}`} target="_blank" className="inline-block text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-500/10" title="ดูหน้าเว็บจริง">
                      <Eye size={16} />
                    </Link>
                    <Link href={`/admin/products/edit/${product.id}`} className="inline-block text-amber-600 hover:text-amber-800 p-1.5 rounded hover:bg-amber-500/10" title="แก้ไข">
                      <Edit3 size={16} />
                    </Link>
                    {/* <DeleteProductButton productId={product.id} productName={product.name} /> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-card rounded-lg shadow">
          <p className="text-muted-foreground mb-4">ยังไม่มีสินค้าในระบบ</p>
          <Link href="/admin/products/new" className="text-sm font-medium text-primary hover:text-primary/80">
            คลิกที่นี่เพื่อเริ่มเพิ่มสินค้าชิ้นแรก!
          </Link>
        </div>
      )}
    </div>
  );
}