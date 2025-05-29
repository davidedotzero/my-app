import Hero from "@/components/hero";
import LatestArticlesSection from '@/components/home/LatestArticlesSection';
// Assuming ConnectSupabaseSteps and SignUpUserSteps are not needed for this specific display
// import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
// import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
// import { hasEnvVars } from "@/utils/supabase/check-env-vars";

// async function LatestArticlesSection() {
//   const supabase = await createClient();

//   const { data: articles, error } = await supabase
//     .from('articles')
//     .select('id, title, slug, excerpt, image_url')
//     .order('created_at', { ascending: false })
//     .limit(3);

//   if (error) {
//     console.error('Error fetching articles:', error.message);
//     return (
//       <section className="py-12 md:py-16 bg-red-100 dark:bg-red-900/50">
//         <div className="container mx-auto px-6">
//           <p className="text-red-700 dark:text-red-300 text-center">
//             เกิดข้อผิดพลาดในการโหลดบทความ โปรดลองอีกครั้งภายหลัง
//           </p>
//         </div>
//       </section>
//     );
//   }

//   if (!articles || articles.length === 0) {
//     return (
//       <section className="py-12 md:py-16 bg-primary">
//         <div className="container mx-auto px-6">
//           <h2 className="text-3xl md:text-4xl font-semibold text-center text-green-800 dark:text-green-300 mb-8 md:mb-12">
//             บทความล่าสุด
//           </h2>
//           <p className="text-center text-gray-600 dark:text-gray-400">ยังไม่มีบทความในขณะนี้</p>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="py-12 md:py-16 bg-primary-foreground">
//       <div className="container mx-auto px-6">
//         <h2 className="text-3xl md:text-4xl font-semibold text-center text-green-800 dark:text-green-300 mb-8 md:mb-12">
//           Latest
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {articles.map((article) => (
//             <div key={article.id} className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
//               {article.image_url && (
//                 <div className="mb-4 h-40 w-full overflow-hidden rounded-md">
//                   <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
//                 </div>
//               )}
//               <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">{article.title}</h3>
//               <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed flex-grow">{article.excerpt || ''}</p>
//               <Link
//                 href={`/articles/${article.slug}`}
//                 className="inline-block self-start mt-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium transition-colors duration-300"
//               >
//                 อ่านต่อ &rarr;
//               </Link>
//             </div>
//           ))}
//         </div>
//         <div className="text-center mt-10 md:mt-14">
//           <Link
//             href="/articles"
//             className="bg-green-600 dark:bg-green-700 text-white px-8 py-3 rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300 text-lg"
//           >
//             ดูบทความทั้งหมด
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }

export default async function Home() {
  return (
    <>
      <Hero />
      <LatestArticlesSection />
    </>
  );
}