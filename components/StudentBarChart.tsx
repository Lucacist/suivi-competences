'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface DataPoint {
  name: string;
  score: number;
  pole?: string;
}

export function StudentBarChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) return <div className="p-4 text-center text-gray-500">Pas assez de données.</div>;

  // Fonction pour obtenir la couleur en fonction du pôle et du score
  const getColor = (pole: string | undefined, score: number): string => {
    // Déterminer la couleur de base selon le pôle
    let baseColors: { light: string; medium: string; dark: string };
    
    // Vérifier si pole existe
    const poleStr = pole || '';
    
    if (poleStr.includes('PÔLE 1') || poleStr.includes('Pôle 1')) {
      // Vert
      baseColors = { light: '#86efac', medium: '#22c55e', dark: '#15803d' };
    } else if (poleStr.includes('PÔLE 2') || poleStr.includes('Pôle 2')) {
      // Bleu
      baseColors = { light: '#93c5fd', medium: '#3b82f6', dark: '#1e40af' };
    } else if (poleStr.includes('PÔLE 3') || poleStr.includes('Pôle 3')) {
      // Orange
      baseColors = { light: '#fdba74', medium: '#f97316', dark: '#c2410c' };
    } else {
      // Gris par défaut
      baseColors = { light: '#d1d5db', medium: '#9ca3af', dark: '#4b5563' };
    }

    // Déterminer l'intensité selon le score
    if (score < 40) return baseColors.light;      // Score faible = couleur claire
    if (score < 70) return baseColors.medium;     // Score moyen = couleur moyenne
    return baseColors.dark;                       // Score élevé = couleur foncée
  };

  // 1. CALCUL DE LA HAUTEUR DYNAMIQUE
  // On compte 60px de hauteur par barre pour que ce soit aéré + 50px de marge
  const dynamicHeight = Math.max(data.length * 80, 400);

  return (
    <div className="w-full border rounded-lg bg-white shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-center font-semibold text-gray-700">Moyenne par Bloc de Tâches</h3>
      </div>
      
      {/* On applique la hauteur calculée ici */}
      <div style={{ height: `${dynamicHeight}px`, width: '100%' }} className="p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 10, right: 30, top: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            
            {/* 2. RÉGLAGE DES TEXTES (Labels) */}
            <YAxis 
              type="category" 
              dataKey="name" 
              width={350} // On donne 350px de large pour le texte (très large)
              interval={0} // On FORCE l'affichage de tous les textes sans en sauter
              tick={{ fontSize: 12, width: 340, fill: '#374151' }} // Style du texte
              style={{ fontWeight: 500 }}
            />
            
            <XAxis type="number" domain={[0, 100]} hide />

            <Tooltip 
              cursor={{fill: 'transparent'}}
              formatter={(value: number) => [`${value}%`, 'Moyenne']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />

            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.pole, entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}