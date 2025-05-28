import NextLogo from "./next-logo";
import SupabaseLogo from "./supabase-logo";

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      {/* <div className="flex gap-8 justify-center items-center">
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          rel="noreferrer"
        >
          <SupabaseLogo />
        </a>
        <span className="border-l rotate-45 h-6" />
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          <NextLogo />
        </a>
      </div> */}
      {/* <h1 className="sr-only">Supabase and Next.js Starter Template</h1> */}
      <h1 className="text-3xl lg:text-4xl font-bold mx-auto max-w-xl text-center">
        บ้านไม้ดาวิ (ไดกิ บอนไซ)
      </h1>
      <div>
        <a href="/" className="bg-white text-green-700 font-semibold px-8 py-3 rounded-md hover:bg-green-50 transition-colors duration-300 text-lg mr-4">
          ชมผลงานของเรา
        </a>
        <a href="/" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-md hover:bg-white hover:text-green-700 transition-colors duration-300 text-lg">
          เรื่องราวของเรา
        </a>
      </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
