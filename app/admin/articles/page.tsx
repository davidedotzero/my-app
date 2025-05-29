import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import { deleteArticleAction } from './action'; // Import delete action
import { FilePlus2, Eye, Edit3} from 'lucide-react'; // Icons
import DeleteArticleButton from '@/components/articles/DeleteArticleButton';

type Article = {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
  // เพิ่มฟิลด์อื่นๆ ที่ต้องการแสดงในตาราง เช่น status
};

export const metadata: Metadata = {
  title: 'จัดการบทความ | Admin Dashboard',
  description: 'ดู, เพิ่ม, แก้ไข, และลบบทความ',
};

export default async function ManageArticlesPage() {
  const supabase = await createClient();
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, created_at, updated_at') // เลือกฟิลด์ที่ต้องการ
    .order('created_at', { ascending: false }) // เรียงจากใหม่ไปเก่า
    .returns<Article[]>();

  if (error) {
    console.error('Error fetching articles for admin:', error.message);
    return <div className="bg-destructive/10 text-destructive p-4 rounded-md">Error loading articles: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">จัดการบทความ</h1>
        <Link
          href="/admin/articles/new" // Link ไปหน้าสร้างบทความใหม่ (จะสร้างทีหลัง)
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <FilePlus2 size={18} />
          เพิ่มบทความใหม่
        </Link>
      </div>

      {articles && articles.length > 0 ? (
        <div className="bg-card shadow-md rounded-lg overflow-x-auto">
          <table className="w-full min-w-max text-sm text-left text-muted-foreground">
            <thead className="text-xs text-foreground/80 uppercase bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">#</th>
                <th scope="col" className="px-6 py-3 font-medium">หัวข้อ</th>
                <th scope="col" className="px-6 py-3 font-medium">Slug</th>
                <th scope="col" className="px-6 py-3 font-medium">สร้างเมื่อ</th>
                <th scope="col" className="px-6 py-3 font-medium">แก้ไขล่าสุด</th>
                <th scope="col" className="px-6 py-3 font-medium text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article, index) => (
                <tr key={article.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap max-w-xs truncate" title={article.title}>{article.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate" title={article.slug}>{article.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(article.created_at).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(article.updated_at).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' })}</td>
                   <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                    <Link href={`/articles/${article.slug}`} target="_blank" className="inline-block text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-500/10" title="ดูหน้าเว็บจริง">
                      <Eye size={16} />
                    </Link>
                    <Link href={`/admin/articles/edit/${article.id}`} className="inline-block text-amber-600 hover:text-amber-800 p-1.5 rounded hover:bg-amber-500/10" title="แก้ไข">
                      <Edit3 size={16} />
                    </Link>
                    <form 
                      action={async () => { // ใช้ async wrapper สำหรับ Server Action ที่ return ค่า
                        'use server'; // ระบุอีกครั้งถ้า action ถูก define ในไฟล์อื่นและเรียกแบบ inline
                        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบทความ "${article.title}"? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
                          return;
                        }
                        const result = await deleteArticleAction(article.id);
                        if (result.error) {
                          alert(`เกิดข้อผิดพลาด: ${result.error}`); // แสดง alert แบบง่าย
                        } else if (result.success) {
                          alert(result.success); // แสดง alert แบบง่าย
                          // ไม่ต้อง redirect ที่นี่ เพราะ revalidatePath ควรจะ refresh list แล้ว
                        }
                      }} 
                      className="inline-block"
                    >
                      <button 
                        type="submit"
                        className="text-destructive hover:text-destructive/80 p-1.5 rounded hover:bg-destructive/10" 
                        title="ลบ"
                      >
                        <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-card rounded-lg shadow">
          <p className="text-muted-foreground mb-4">ยังไม่มีบทความในระบบ</p>
          <Link href="/admin/articles/new" className="text-sm font-medium text-primary hover:text-primary/80">
            คลิกที่นี่เพื่อเริ่มสร้างบทความแรกของคุณ!
          </Link>
        </div>
      )}
    </div>
  );
}