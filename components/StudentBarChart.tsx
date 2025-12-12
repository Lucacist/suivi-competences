'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface DataPoint {
  name: string;
  pole?: string;
  [sessionName: string]: any; // Les sessions sont des propriétés dynamiques
}

export function StudentBarChart({ data, sessions = [] }: { data: DataPoint[]; sessions?: string[] }) {
  if (!data || data.length === 0) return <div className="p-4 text-center text-gray-500">Pas assez de données.</div>;
  if (!sessions || sessions.length === 0) return <div className="p-4 text-center text-gray-500">Aucune session disponible.</div>;

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

  // Fonction pour obtenir la couleur avec variation pour différencier les sessions
  const getColorForSession = (pole: string | undefined, score: number, sessionIndex: number): string => {
    const baseColor = getColor(pole, score);
    
    // Pour différencier les sessions, on ajoute une opacité
    // Session 0 = 100%, Session 1 = 85%, Session 2 = 70%, etc.
    const opacity = 1 - (sessionIndex * 0.15);
    
    return baseColor + Math.round(Math.max(opacity, 0.4) * 255).toString(16).padStart(2, '0');
  };

  // 1. CALCUL DE LA HAUTEUR DYNAMIQUE
  // Basé sur le nombre total de barres (bloc x session)
  const totalBars = data.length;
  const dynamicHeight = Math.max(totalBars * 50 + 100, 400);

  return (
    <div className="w-full border rounded-lg bg-white shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-center font-semibold text-gray-700">Évolution par Bloc de Tâches et Session</h3>
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
              width={350}
              interval={0}
              tick={{ fontSize: 11, width: 340, fill: '#374151' }}
              style={{ fontWeight: 500 }}
            />
            
            <XAxis type="number" domain={[0, 100]} hide />

            <Tooltip 
              cursor={{fill: 'transparent'}}
              formatter={(value: number) => [`${value}%`, 'Moyenne']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />

            {/* Une barre par session */}
            {sessions.map((sessionName, sessionIndex) => (
              <Bar 
                key={sessionName}
                dataKey={sessionName} 
                radius={[0, 4, 4, 0]} 
                barSize={20}
              >
                {data.map((entry, index) => {
                  const score = entry[sessionName];
                  return (
                    <Cell 
                      key={`cell-${sessionIndex}-${index}`} 
                      fill={score ? getColorForSession(entry.pole, score, sessionIndex) : 'transparent'} 
                    />
                  );
                })}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}