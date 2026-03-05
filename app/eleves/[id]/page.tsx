'use client';

import { useParams } from 'next/navigation';
import { useData } from '@/lib/DataContext';
import { StudentRadarChart } from '@/components/StudentRadarChart';
import { StudentBarChart } from '@/components/StudentBarChart';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = parseInt(params.id as string);
  const { getStudent, getStudentResults } = useData();

  if (isNaN(studentId)) {
    return <div className="container mx-auto p-6 text-center text-gray-500">Élève introuvable.</div>;
  }

  const student = getStudent(studentId);

  if (!student) {
    return <div className="container mx-auto p-6 text-center text-gray-500">Élève introuvable.</div>;
  }

  const studentResults = getStudentResults(studentId);

  // --- CALCUL 1 : Données pour le RADAR (Par Pôle) ---
  const statsByPole: Record<string, { total: number; count: number }> = {};

  studentResults.forEach((res) => {
    const poleName = res.criteriaPole || 'Divers'; 
    const val = res.value || 0;

    if (!statsByPole[poleName]) {
      statsByPole[poleName] = { total: 0, count: 0 };
    }
    statsByPole[poleName].total += val;
    statsByPole[poleName].count += 1;
  });

  const radarData = Object.keys(statsByPole).map((pole) => ({
    subject: pole,
    score: Math.round((statsByPole[pole].total / statsByPole[pole].count) * 10) / 10,
  }));

  // --- CALCUL 2 : Données pour les BÂTONS (Par Bloc de Tâche ET Session) ---
  const groupedData: Record<string, Record<string, { total: number; count: number; pole: string; sessionLabel: string }>> = {};

  studentResults.forEach((res) => {
    const blockName = res.criteriaTaskBlock || 'Autre';
    const sessionKey = `${res.sessionLabel} (#${res.sessionId})`;
    const poleName = res.criteriaPole || 'Divers';
    const val = res.value || 0;

    if (!groupedData[blockName]) {
      groupedData[blockName] = {};
    }
    
    if (!groupedData[blockName][sessionKey]) {
      groupedData[blockName][sessionKey] = { total: 0, count: 0, pole: poleName, sessionLabel: res.sessionLabel || 'Session inconnue' };
    }
    
    groupedData[blockName][sessionKey].total += val;
    groupedData[blockName][sessionKey].count += 1;
  });

  // Récupérer toutes les sessions uniques
  const allSessions = new Set<string>();
  for (const blockName in groupedData) {
    for (const sessionName in groupedData[blockName]) {
      allSessions.add(sessionName);
    }
  }
  const sessionsList = Array.from(allSessions);

  // Transformer en format "wide"
  const barDataBySession: { name: string; pole: string; [key: string]: string | number }[] = [];
  for (const blockName in groupedData) {
    const blockData: { name: string; pole: string; [key: string]: string | number } = { 
      name: blockName,
      pole: '',
    };
    
    for (const sessionName in groupedData[blockName]) {
      const stats = groupedData[blockName][sessionName];
      blockData[sessionName] = Math.round((stats.total / stats.count) * 10) / 10;
      if (!blockData.pole) blockData.pole = stats.pole;
    }
    
    barDataBySession.push(blockData);
  }

  // --- AFFICHAGE ---
  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-xl min-h-screen">
      <Link href="/eleves" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Retour à la liste
      </Link>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{student.firstName} {student.lastName}</h1>
        <p className="text-gray-500 mt-1">ID Élève: {student.id} • {studentResults.length} résultats enregistrés</p>
      </div>

      {/* SECTION GRAPHIQUES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        
        {/* Radar Chart (Pôles) */}
        <div className="flex flex-col">
          <StudentRadarChart data={radarData} />
           <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-2">Synthèse globale</h3>
            <p className="text-sm text-gray-600">
              L&apos;élève a été évalué sur <strong>{Object.keys(statsByPole).length}</strong> pôles de compétences.
            </p>
          </div>
        </div>

        {/* Bar Chart (Task Blocks) */}
        <div className="flex flex-col h-full">
           <StudentBarChart data={barDataBySession} sessions={sessionsList} />
        </div>
      </div>

      {/* SECTION TABLEAU */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800">Détail des résultats</h2>
          <span className="text-sm text-gray-500">Classé par récence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
              <tr>
                <th className="p-4">Tâche / Compétence</th>
                <th className="p-4">Session</th>
                <th className="p-4 text-right">Résultat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {studentResults.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{res.criteriaTaskBlock || 'Général'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{res.criteriaCompetence} - {res.criteriaLabel}</div>
                  </td>
                  <td className="p-4 text-gray-600">{res.sessionLabel}</td>
                  <td className="p-4 text-right font-bold">
                    <span className={`${(res.value || 0) < 50 ? 'text-orange-500' : 'text-green-600'}`}>
                      {res.value}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}