'use client'; // Toujours au début pour utiliser usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 1. Petit composant réutilisable pour tes liens
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        relative font-medium transition-colors duration-200
        ${isActive ? 'text-black' : 'text-zinc-500 hover:text-black'}
        
        /* Le soulignement conditionnel */
        ${isActive ? "before:content-[''] before:absolute before:rounded-full before:-bottom-1 before:left-0 before:w-full before:h-[2px] before:bg-black" : ""}
      `}
    >
      {children}
    </Link>
  );
};

// 2. Ton composant principal Navbar
export function Navbar() {
    return (
    <nav className="border-b p-4 mb-6 flex items-center justify-between bg-white shadow-sm h-[61px]">
      
      {/* Logo */}
      <div className="font-bold text-xl">
        Mon École
      </div>

      {/* Liens de navigation */}
      <div className="space-x-6 flex items-center">
        <NavLink href="/">Importer</NavLink>
        <NavLink href="/eleves">Élèves</NavLink>
        {/* Tu peux ajouter d'autres liens ici facilement */}
      </div>

    </nav>
  );
}