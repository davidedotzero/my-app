import Link from 'next/link';

export default function Header() {
  const siteName = "Baan Maih Davi"; // คงการสะกดตามที่คุณให้มา
  const subBrandName = "ダイキ盆栽";
  const slogan = "Art of Serenity: Discover Nature's Beauty in Bonsai.";
  const primaryButtonText = "View Our Works";
  const secondaryButtonText = "Our Story";

  return (
    <section className="w-full bg-white text-primary-foreground py-20 md:py-28 px-4">
      <div className="container mx-auto text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary">
          {siteName}
        </h1>
        <p className="text-2xl sm:text-3xl md:text-4xl text-primary font-light mt-2 mb-6">
          {subBrandName}
        </p>
        <p className="text-lg md:text-xl text-primary hover:text-primary max-w-2xl mx-auto mb-10 md:mb-12">
          {slogan}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <Link
            href="/creations"
            className="inline-block px-10 py-3 text-lg font-semibold text-center text-white bg-primary rounded-lg shadow-md hover:text-primary hover:bg-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {primaryButtonText}
          </Link>
          <Link
            href="/about"
            className="inline-block px-10 py-3 text-lg font-semibold text-center text-primary bg-transparent border-2 border-primary-foreground rounded-lg shadow-sm hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {secondaryButtonText}
          </Link>
        </div>
      </div>
    </section>
  );
}