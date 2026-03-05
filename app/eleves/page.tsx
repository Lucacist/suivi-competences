'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { ExportAllBilans } from '@/components/ExportAllBilans';

export default function ElevesPage() {
  const { data } = useData();
  const allStudents = data.students;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tous les Élèves ({allStudents.length})</h1>
        <ExportAllBilans />
      </div>
      
      {allStudents.length === 0 && (
        <p className="text-gray-500 text-center mt-12">Aucun élève importé. Importez un fichier CSV depuis la page d&apos;accueil.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allStudents.map((student) => (
          <Link 
            key={student.id} 
            href={`/eleves/${student.id}`}
            className="block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{student.firstName} {student.lastName}</h2>
                <p className="text-gray-500 text-sm">Cliquez pour voir le profil</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}