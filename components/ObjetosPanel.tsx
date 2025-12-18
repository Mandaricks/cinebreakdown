import React from 'react';
import { Scene } from '../types';

interface ObjetosPanelProps {
  scenes: Scene[];
}

export const ObjetosPanel: React.FC<ObjetosPanelProps> = ({ scenes }) => {
  // Extrai objetos únicos de todas as cenas
  const objetosMap = new Map<string, string[]>();
  
  scenes.forEach(scene => {
    scene.props.forEach(prop => {
      const existing = objetosMap.get(prop) || [];
      if (!existing.includes(String(scene.scene_number))) {
        existing.push(String(scene.scene_number));
      }
      objetosMap.set(prop, existing);
    });
  });

  const objetos = Array.from(objetosMap.entries()).map(([nome, cenas]) => ({
    nome,
    cenas_associadas: cenas
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Objetos de Cena</h2>
          <p className="text-slate-400 text-sm mt-1">Props e objetos necessários para a produção.</p>
        </div>
        <span className="text-sm font-mono bg-slate-800 px-3 py-1 rounded text-slate-300 border border-slate-700">
          {objetos.length} Objetos
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Objeto</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Cenas</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Qtd.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {objetos.map((obj, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{obj.nome}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {obj.cenas_associadas.map((cena, i) => (
                      <span key={i} className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded">
                        {cena}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-slate-400">{obj.cenas_associadas.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {objetos.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p>Nenhum objeto de cena identificado.</p>
        </div>
      )}
    </div>
  );
};
