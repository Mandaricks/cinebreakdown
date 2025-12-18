import React from 'react';
import { BreakdownResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  data: BreakdownResult;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Prep data for charts
  const locationCounts: Record<string, number> = {};
  data.scenes.forEach(scene => {
    const loc = scene.location || "UNKNOWN";
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const locationChartData = Object.entries(locationCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 locations

  const timeCounts: Record<string, number> = { DAY: 0, NIGHT: 0 };
  data.scenes.forEach(scene => {
    const t = scene.time.toUpperCase();
    if (t.includes('DAY') || t.includes('DIA')) timeCounts.DAY++;
    else if (t.includes('NIGHT') || t.includes('NOITE')) timeCounts.NIGHT++;
  });

  const timeChartData = [
    { name: 'Dia', value: timeCounts.DAY },
    { name: 'Noite', value: timeCounts.NIGHT },
  ];

  const COLORS = ['#fbbf24', '#4f46e5']; // Amber / Indigo

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Stat Cards */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
        <h3 className="text-slate-400 text-xs uppercase font-bold">Total Cenas</h3>
        <p className="text-3xl font-bold text-white mt-1">{data.total_scenes}</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
        <h3 className="text-slate-400 text-xs uppercase font-bold">Total Personagens</h3>
        <p className="text-3xl font-bold text-white mt-1">
          {data.characters_metadata ? data.characters_metadata.length : 0}
        </p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
        <h3 className="text-slate-400 text-xs uppercase font-bold">Total Locações</h3>
        <p className="text-3xl font-bold text-white mt-1">{data.unique_locations.length}</p>
      </div>

      {/* Charts - Using absolute robust containers */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm md:col-span-2 min-w-0 flex flex-col">
        <h3 className="text-slate-400 text-xs uppercase font-bold mb-4">Top Locações</h3>
        <div className="flex-1 w-full min-h-[250px] relative">
          <div className="absolute inset-0">
            {locationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{fill: '#94a3b8', fontSize: 10}} tickLine={false} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px'}} 
                    itemStyle={{color: '#fff'}}
                    cursor={{fill: '#334155', opacity: 0.4}}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">Sem dados suficientes</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm min-w-0 flex flex-col">
        <h3 className="text-slate-400 text-xs uppercase font-bold mb-4">Dia vs Noite</h3>
        <div className="flex-1 w-full min-h-[250px] relative">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeChartData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {timeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px'}}
                   itemStyle={{color: '#fff'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};