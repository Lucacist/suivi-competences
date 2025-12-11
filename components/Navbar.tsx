import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b p-4 mb-6 flex items-center justify-between bg-white shadow-sm">
      <div className="font-bold text-xl">🏫 Mon École</div>
      <div className="space-x-4">
        <Link href="/" className="hover:underline text-gray-600">Accueil</Link>
        <Link href="/eleves" className="hover:underline text-blue-600 font-medium">
          Liste des Élèves
        </Link>
      </div>
    </nav>
  );
}