import type { Metadata } from 'next';
import Image from 'next/image'; // สำหรับแสดงรูปภาพ (ถ้ามี)

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา | บ้านไม้ดาวิ (ไดกิ บอนไซ)',
  description: 'เรื่องราวความเป็นมา ปรัชญา วิสัยทัศน์ และผู้ก่อตั้ง บ้านไม้ดาวิ (ไดกิ บอนไซ) - ศิลปะแห่งการย่อส่วนธรรมชาติและความสงบสู่ชีวิตคุณ',
};

export default async function AboutPage() {
  // --- เนื้อหาตัวอย่าง - คุณสามารถแก้ไขได้ตามต้องการ ---
  const brandStory = {
    title: "เรื่องราวของบ้านไม้ดาวิ (ไดกิ บอนไซ)",
    paragraphs: [
      "ณ ใจกลางความวุ่นวายของชีวิตสมัยใหม่ 'บ้านไม้ดาวิ' ได้ถือกำเนิดขึ้นจากความปรารถนาอันเรียบง่าย คือการนำความสงบและความงามของธรรมชาติที่ถูกย่อส่วนเข้ามาเป็นส่วนหนึ่งของชีวิตประจำวัน เราเชื่อว่าพลังของต้นไม้ใบเขียว โดยเฉพาะอย่างยิ่งศิลปะอันละเอียดอ่อนของบอนไซ สามารถสร้างแรงบันดาลใจและความผ่อนคลายได้อย่างน่าอัศจรรย์",
      "ชื่อ 'ไดกิ บอนไซ' (ダイキ盆栽) ผสมผสานคำว่า 'ได' (大) ที่สื่อถึงความยิ่งใหญ่ และ 'คิ' (樹) ที่แปลว่าต้นไม้ สะท้อนถึงความมหัศจรรย์ของธรรมชาติที่สามารถย่อส่วนลงในกระถางเล็กๆ ได้อย่างสง่างาม พร้อมกับความมุ่งมั่นของเราที่จะสร้างสรรค์ 'ต้นไม้ที่มีชีวิต' และเปี่ยมด้วยจิตวิญญาณ ไม่ใช่เพียงวัตถุตกแต่ง",
      "จากความหลงใหลส่วนตัวในศิลปะการปลูกเลี้ยงบอนไซ สู่การแบ่งปันความรู้และประสบการณ์ในการสร้างสรรค์สวนหินเซน และโลกใบเล็กในสวนขวดแก้ว (Terrarium) เราหวังว่า 'บ้านไม้ดาวิ' จะเป็นมากกว่าร้านค้า แต่เป็นชุมชนของผู้ที่มีใจรักในสิ่งเดียวกัน"
    ],
    // (Optional) ใส่ URL รูปภาพที่สื่อถึงแบรนด์ของคุณ
    imageUrl: "", 
    imageAlt: "บรรยากาศอันร่มรื่นของบ้านไม้ดาวิ"
  };

  const philosophyVision = {
    title: "ปรัชญาและวิสัยทัศน์",
    philosophy: {
      subtitle: "ปรัชญาของเรา: ความสงบในทุกอณูของธรรมชาติ",
      points: [
        "ศิลปะบอนไซคือการฝึกฝนสติ ความอดทน และการเห็นคุณค่าในความไม่สมบูรณ์แบบอันเป็นธรรมชาติ (Wabi-Sabi)",
        "เรามุ่งมั่นสร้างสรรค์ผลงานทุกชิ้นด้วยความใส่ใจในรายละเอียด เพื่อให้เป็นมากกว่าต้นไม้ แต่เป็นงานศิลปะที่มีชีวิตชีวาและสื่อความหมาย",
        "เชื่อในพลังของพื้นที่สีเขียวขนาดเล็กที่สามารถสร้างความสุขและแรงบันดาลใจอันยิ่งใหญ่ได้"
      ]
    },
    vision: {
      subtitle: "วิสัยทัศน์ของเรา: เชื่อมโยงผู้คนกับความงามของธรรมชาติ",
      points: [
        "เป็นแหล่งรวมความรู้และแรงบันดาลใจสำหรับผู้รักบอนไซ สวนเซน และสวนขวดแก้วทุกระดับ",
        "นำเสนอผลิตภัณฑ์และบริการที่เปี่ยมด้วยคุณภาพและความคิดสร้างสรรค์ เพื่อช่วยให้ทุกคนสามารถนำธรรมชาติเข้ามาเป็นส่วนหนึ่งของชีวิตได้ง่ายขึ้น",
        "สร้างชุมชนที่แข็งแรงและแบ่งปัน เพื่อส่งเสริมความรักและความเข้าใจในคุณค่าของธรรมชาติอย่างยั่งยืน"
      ]
    }
  };

  const founder = {
    title: "ผู้ก่อตั้งและแรงบันดาลใจเบื้องหลัง",
    name: "คุณดาวิกา รักษ์ธรรมชาติ (ชื่อสมมติ)",
    bio: [
      "ด้วยใจรักในความสงบและความละเอียดอ่อนของศิลปะตะวันออก ผนวกกับความผูกพันกับต้นไม้ใบเขียวมาตั้งแต่เยาว์วัย คุณดาวิกาได้ค้นพบว่าการดูแลบอนไซไม่ได้เป็นเพียงงานอดิเรก แต่เป็นการฝึกฝนจิตใจและค้นพบความสุขที่แท้จริง เธอจึงก่อตั้ง 'บ้านไม้ดาวิ' ขึ้นด้วยความหวังที่จะแบ่งปันประสบการณ์อันมีค่านี้ให้กับผู้อื่น",
      "\"ทุกครั้งที่ได้สัมผัสดิน ตัดแต่งกิ่ง หรือเพียงแค่นั่งมองดูบอนไซเติบโตอย่างช้าๆ มันคือช่วงเวลาแห่งสมาธิและความสงบ ฉันอยากให้ทุกคนได้ลองสัมผัสความรู้สึกนี้ค่ะ\" - ดาวิกา"
    ],
    // (Optional) ใส่ URL รูปภาพของผู้ก่อตั้ง
    imageUrl: "", 
    imageAlt: "ภาพคุณดาวิกา ผู้ก่อตั้งบ้านไม้ดาวิ"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 lg:space-y-20 py-10 md:py-16">
      {/* --- ส่วนเรื่องราวของแบรนด์ --- */}
      <section id="brand-story" aria-labelledby="brand-story-title">
        <div className="text-center mb-10">
          <h2 id="brand-story-title" className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {brandStory.title}
          </h2>
        </div>
        {brandStory.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-xl aspect-[16/7] md:aspect-[16/6]">
            <Image
              src={brandStory.imageUrl}
              alt={brandStory.imageAlt}
              width={1200}
              height={500} // ปรับ height ให้สอดคล้องกับ aspect ratio ที่ต้องการ
              className="w-full h-full object-cover"
              priority // ถ้าเป็นรูปภาพสำคัญใน LCP (Largest Contentful Paint)
            />
          </div>
        )}
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-5">
          {brandStory.paragraphs.map((p, index) => (
            <p key={index}>{p}</p>
          ))}
        </div>
      </section>

      {/* --- ส่วนปรัชญาและวิสัยทัศน์ --- */}
      <section id="philosophy-vision" aria-labelledby="philosophy-vision-title" className="border-t border-border pt-12 mt-12">
        <div className="text-center mb-10">
          <h2 id="philosophy-vision-title" className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {philosophyVision.title}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10 md:gap-12">
          <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
            <h3 className="text-2xl font-semibold text-primary mb-4">{philosophyVision.philosophy.subtitle}</h3>
            <ul className="list-disc list-outside space-y-2 pl-5 text-muted-foreground marker:text-primary/80">
              {philosophyVision.philosophy.points.map((point, index) => (
                <li key={index} className="leading-normal">{point}</li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
            <h3 className="text-2xl font-semibold text-primary mb-4">{philosophyVision.vision.subtitle}</h3>
            <ul className="list-disc list-outside space-y-2 pl-5 text-muted-foreground marker:text-primary/80">
              {philosophyVision.vision.points.map((point, index) => (
                <li key={index} className="leading-normal">{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- ส่วนแนะนำผู้ก่อตั้ง --- */}
      <section id="founder" aria-labelledby="founder-title" className="border-t border-border pt-12 mt-12">
        <div className="text-center mb-10">
          <h2 id="founder-title" className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {founder.title}
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border/50">
          {founder.imageUrl && (
            <div className="w-40 h-40 md:w-52 md:h-52 flex-shrink-0 rounded-full overflow-hidden shadow-md border-2 border-background">
              <Image
                src={founder.imageUrl}
                alt={founder.imageAlt}
                width={208} // 52 * 4 (สำหรับจอ Retina)
                height={208}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-semibold text-primary mb-2">{founder.name}</h3>
            <div className="prose prose-base prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-3">
              {founder.bio.map((p, index) => (
                <p key={index}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}