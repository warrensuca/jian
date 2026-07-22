import Link from "next/link";

import Image from 'next/image';
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex h-[3.5625rem] w-full items-center justify-between border-b border-[#c9c1b5]/80 bg-[#f4f1eb]/88 px-5 backdrop-blur-xl sm:px-8 lg:px-[max(2rem,calc((100vw-1180px)/2))]">
      <Link href="/" aria-label="Jian home">
      
          <Image 
            src="/icon2.svg" 
            alt="home" 
            width={100} 
            height={100} 
            className="h-auto w-[4.75rem] transition-opacity hover:opacity-65"
          />
      </Link>

      <div className="flex items-center gap-3 whitespace-nowrap text-muted-foreground sm:gap-7">
        <Link href="/macro-matcher">
          <p className="text-[0.68rem] transition-colors hover:text-foreground sm:text-xs">Macro <span className="hidden sm:inline">Matcher</span></p>
        </Link>

        <Link href="/recipe-search">
          <p className="text-[0.68rem] transition-colors hover:text-foreground sm:text-xs">Search</p>
        </Link>

        <Link href="/cluster-explorer">
          <p className="text-[0.68rem] transition-colors hover:text-foreground sm:text-xs">Clusters</p>
        </Link>
      </div>
    </nav>
  );
}
export default Navbar;
