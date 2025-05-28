import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

const LatestArticlesSection = () => {
  // ในอนาคต: ดึงข้อมูลบทความล่าสุดจาก Supabase
  const articles = [
    { id: 1, title: 'ศิลปะแห่งการจัดบอนไซ: ความรู้เบื้องต้น', slug: 'bonsai-basics', excerpt: 'เรียนรู้พื้นฐานและปรัชญาเบื้องหลังการสร้างสรรค์บอนไซที่สวยงาม...' },
    { id: 2, title: 'เนรมิตสวนหินเซนในบ้านคุณ', slug: 'zen-garden-diy', excerpt: 'ค้นพบความสงบกับสวนหินเซนขนาดเล็กที่คุณสามารถสร้างเองได้ง่ายๆ...' },
    { id: 3, title: 'การดูแลต้นไม้ในสวนขวดแก้ว (Terrarium)', slug: 'terrarium-care', excerpt: 'เคล็ดลับการดูแลรักษา Terrarium ให้เขียวชอุ่มและมีชีวิตชีวา...' },
  ];

  return (
    <section className="py-12 md:py-16 bg-green-50/50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center text-green-800 mb-8 md:mb-12">
          บทความน่ารู้จากบ้านไม้ดาวิ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 3. `articles.map` ถูกเรียกใช้ที่นี่ ซึ่ง `articles` อยู่ใน scope เดียวกัน */}
          {articles.map((article) => (
            <div key={article.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-green-700 mb-3">{article.title}</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{article.excerpt}</p>
              <a href={`/articles/${article.slug}`} className="inline-block text-green-600 hover:text-green-800 font-medium transition-colors duration-300">
                อ่านต่อ &rarr;
              </a>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 md:mt-14">
          <a href="/articles" className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors duration-300 text-lg">
            ดูบทความทั้งหมด
          </a>
        </div>
      </div>
    </section>
  );
};



export default async function Home() {
  return (
    <>
      <Hero />
      {/* <div className="w-full bg-gradient-to-r from-green-600 to-teal-500 text-white py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            บ้านไม้ดาวิ (ไดกิ บอนไซ)
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto">
            ศิลปะแห่งความสงบ สัมผัสความงามของธรรมชาติผ่านบอนไซ สวนหินเซน และสวนในขวดแก้ว
          </p>
          <div>
            <a href="/" className="bg-white text-green-700 font-semibold px-8 py-3 rounded-md hover:bg-green-50 transition-colors duration-300 text-lg mr-4">
              ชมผลงานของเรา
            </a>
            <a href="/" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-md hover:bg-white hover:text-green-700 transition-colors duration-300 text-lg">
              เรื่องราวของเรา
            </a>
          </div>
        </div>
      </div> */}

      {/* 4. เรียกใช้ Component <LatestArticlesSection /> ที่นี่ */}
      {/* ทำให้ส่วนของ `articles.map` ถูกเรียกใช้ภายใน scope ที่ถูกต้อง */}
      <LatestArticlesSection />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Getting started</h2>

        {/* <h2 className="font-medium text-xl mb-4">Next steps</h2>
        {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />} */}
      </main>
    </>
  );
}
