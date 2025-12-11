'use client';

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

interface DataPoint {
  subject: string; // Ce sera le "Pôle"
  score: number;
}

export function StudentRadarChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) return <div className="p-4 text-center text-gray-500">Pas assez de données pour le graphique.</div>;

  return (
    <div className="h-[350px] w-full border rounded-lg p-4 bg-white shadow-sm flex flex-col">
      <h3 className="text-center font-semibold mb-2 text-gray-700">Moyenne par Pôle de compétence</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            {/* Adaptation de l'échelle à 100% */}
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Moyenne"
              dataKey="score"
              stroke="#2563eb"
              fill="#3b82f6"
              fillOpacity={0.5}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}