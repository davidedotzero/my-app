import Hero from "@/components/hero";
import LatestArticlesSection from '@/components/home/LatestArticlesSection';

export default async function Home() {
  return (
    <>
      <Hero />
      <LatestArticlesSection />
    </>
  );
}