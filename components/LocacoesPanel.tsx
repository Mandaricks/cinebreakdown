import React from 'react';
import { Locacao } from '../types';

interface LocacoesPanelProps {
  locacoes: Locacao[] | undefined;
  uniqueLocations: string[];
}

export const LocacoesPanel: React.FC<LocacoesPanelProps> = ({ locacoes, uniqueLocations }) => {
  // Se não tiver locações detalhadas, usa as únicas do resultado básico
  const locations = locacoes || uniqueLocations.map((loc, idx) => ({
    nome: loc,
    tipo_espaco: loc.toLowerCase().includes('ext') ? 'Exterior' : 'Interior' as const,
    caracteristicas: '',
    cenas_associadas: []
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Locações</h2>
          <p className="text-slate-400 text-sm mt-1">Locais de filmagem identificados no roteiro.</p>
        </div>
        <span className="text-sm font-mono bg-slate-800 px-3 py-1 rounded text-slate-300 border border-slate-700">
          {locations.length} Locações
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-white text-lg">{typeof loc === 'string' ? loc : loc.nome}</h3>
              {typeof loc !== 'string' && loc.tipo_espaco && (
                <span className={`text-xs px-2 py-1 rounded ${
                  loc.tipo_espaco === 'Interior' 
                    ? 'bg-blue-900/50 text-blue-300' 
                    : 'bg-green-900/50 text-green-300'
                }`}>
                  {loc.tipo_espaco}
                </span>
              )}
            </div>
            {typeof loc !== 'string' && loc.caracteristicas && (
              <p className="text-slate-400 text-sm">{loc.caracteristicas}</p>
            )}
            {typeof loc !== 'string' && loc.cenas_associadas && loc.cenas_associadas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {loc.cenas_associadas.map((cena, i) => (
                  <span key={i} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    Cena {cena}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Nenhuma locação identificada.</p>
        </div>
      )}
    </div>
  );
};
