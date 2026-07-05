import Link from "next/link";
import { space_grotesk, space_mono, roboto_mono } from "@/lib/fonts";
import Image from 'next/image';
function Navbar() {
  return (
    <nav className="flex justify-between items-center  w-full px-[15rem] h-14.25  bg-background border border-l-0 border-r-0  border-t-0 border-solid">
      <Link href="/">
      
          <Image 
            src="/icon2.svg" 
            alt="home" 
            width={100} 
            height={100} 
            className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] hover:opacity-80"
          />
      </Link>

      <div className="flex justify-between w-93 h-5.5 text-muted-foreground whitespace-nowrap gap-8">
        <Link href="/macro-matcher">
          <p className="text-sm hover:text-foreground transition-colors">Macro Matcher</p>
        </Link>

        <Link href="/recipe-search">
          <p className="text-sm hover:text-foreground transition-colors">Recipe Search</p>
        </Link>

        <Link href="/cluster-explorer">
          <p className="text-sm hover:text-foreground transition-colors">Cluster Explorer</p>
        </Link>
      </div>
    </nav>
  );
}
export default Navbar;
