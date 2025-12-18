import React, { useState } from 'react';
import { BreakdownResult, Scene } from '../types';

interface ReportsPanelProps {
  data: BreakdownResult;
  onUpdateResult: (newData: BreakdownResult) => void;
}

type ReportTab = 'SCHEDULE' | 'CAST' | 'WARDROBE' | 'PROPS';

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ data, onUpdateResult }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('SCHEDULE');
  
  // Prop Replacement State
  const [findProp, setFindProp] = useState('');
  const [replaceProp, setReplaceProp] = useState('');

  // --- LOGIC: HELPER FUNCTIONS ---

  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const handleGlobalPropReplace = () => {
     if (!findProp || !replaceProp) return;
     const count = data.scenes.reduce((acc, scene) => 
        acc + scene.props.filter(p => p.toLowerCase() === findProp.toLowerCase()).length, 0
     );

     if (confirm(`Isso substituirá "${findProp}" por "${replaceProp}" em TODAS as cenas (${count} ocorrências). A consistência do roteiro será atualizada. Continuar?`)) {
       const newScenes = data.scenes.map(scene => ({
         ...scene,
         props: scene.props.map(p => p.toLowerCase() === findProp.toLowerCase() ? replaceProp : p)
       }));
       onUpdateResult({ ...data, scenes: newScenes });
       setFindProp('');
       setReplaceProp('');
     }
  };

  // --- LOGIC: DATA AGGREGATION ---

  // 1. SCHEDULE: Group by Location (Standard Stripboard logic)
  const scenesByLocation: Record<string, Scene[]> = {};
  data.scenes.forEach(scene => {
    const key = scene.location || "LOCAÇÃO DESCONHECIDA";
    if (!scenesByLocation[key]) scenesByLocation[key] = [];
    scenesByLocation[key].push(scene);
  });
  // Sort locations alphabetically
  const sortedLocations = Object.keys(scenesByLocation).sort();

  // 2. CAST: Calculate Scene Count per Character
  const castStats: Record<string, { count: number, scenes: string[] }> = {};
  data.characters_metadata.forEach(c => {
    castStats[c.name] = { count: 0, scenes: [] };
  });
  data.scenes.forEach(scene => {
    scene.characters.forEach(charName => {
      // Find closest match or add new if dynamic
      const key = Object.keys(castStats).find(k => k.toLowerCase() === charName.toLowerCase()) || charName;
      if (!castStats[key]) castStats[key] = { count: 0, scenes: [] };
      
      castStats[key].count++;
      castStats[key].scenes.push(String(scene.scene_number));
    });
  });

  // 3. PROPS: Aggregate all props
  const allProps: { name: string, scene: string, summary: string }[] = [];
  data.scenes.forEach(scene => {
    scene.props.forEach(prop => {
      allProps.push({ name: prop, scene: String(scene.scene_number), summary: scene.summary });
    });
  });

  // --- EXPORT HANDLERS ---

  const exportSchedule = () => {
    const rows: (string | number)[][] = [];
    sortedLocations.forEach(loc => {
      scenesByLocation[loc].forEach(scene => {
        rows.push([
          scene.scene_number,
          loc,
          scene.header,
          scene.time,
          scene.estimated_duration_mins,
          scene.characters.length,
          scene.characters.join(', ')
        ]);
      });
    });
    downloadCSV('cronograma_filmagem', ['Cena', 'Locação', 'Cabeçalho', 'Dia/Noite', 'Minutos Est.', 'Qtd Atores', 'Elenco'], rows);
  };

  const exportCast = () => {
    const rows = data.characters_metadata.map(c => [
      c.name,
      c.actor_name || 'TBD',
      c.role,
      castStats[c.name]?.count || 0,
      c.contract_status || 'Pendente',
      castStats[c.name]?.scenes.join('; ')
    ]);
    downloadCSV('relatorio_elenco_contratos', ['Personagem', 'Ator Sugerido', 'Papel', 'Total Cenas', 'Status Contrato', 'Lista de Cenas'], rows);
  };

  const exportWardrobe = () => {
    const rows = data.characters_metadata.map(c => [
      c.name,
      c.actor_name || '',
      c.role,
      c.costume_suggestion,
      c.color_palette_hex
    ]);
    downloadCSV('ficha_tecnica_figurino', ['Personagem', 'Ator', 'Papel', 'Descrição Figurino & Acessórios', 'Paleta (Hex)'], rows);
  };

  const exportProps = () => {
    const rows = allProps.map(p => [p.name, p.scene, p.summary]);
    downloadCSV('lista_objetos_arte', ['Objeto (Prop)', 'Cena', 'Contexto da Cena'], rows);
  };

  // --- RENDER ---

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 min-h-[500px]">
      {/* Sidebar / Tabs */}
      <div className="border-b border-slate-700 bg-slate-800/50 px-4 py-3 flex flex-wrap gap-2 rounded-t-lg">
        <button 
          onClick={() => setActiveTab('SCHEDULE')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'SCHEDULE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
        >
          Cronograma
        </button>
        <button 
          onClick={() => setActiveTab('CAST')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'CAST' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
        >
          Elenco & Contratos
        </button>
        <button 
          onClick={() => setActiveTab('WARDROBE')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'WARDROBE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
        >
          Figurino (Ficha)
        </button>
        <button 
          onClick={() => setActiveTab('PROPS')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'PROPS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
        >
          Arte & Objetos
        </button>
      </div>

      <div className="p-6">
        
        {/* VIEW: SCHEDULE */}
        {activeTab === 'SCHEDULE' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Plano de Filmagem</h3>
                <p className="text-sm text-slate-400">Agrupado por Locação para otimização de diárias.</p>
              </div>
              <button onClick={exportSchedule} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Exportar CSV
              </button>
            </div>

            <div className="space-y-6">
              {sortedLocations.map(loc => (
                <div key={loc} className="bg-slate-800 rounded border border-slate-700 overflow-hidden">
                  <div className="bg-slate-700/50 px-4 py-2 font-bold text-indigo-300 text-sm flex justify-between">
                    <span>{loc}</span>
                    <span className="text-slate-400 font-mono text-xs">{scenesByLocation[loc].length} Cenas</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="text-xs uppercase bg-slate-900/50 text-slate-500">
                        <tr>
                          <th className="px-4 py-2">Cena #</th>
                          <th className="px-4 py-2">D/N</th>
                          <th className="px-4 py-2 w-1/2">Resumo</th>
                          <th className="px-4 py-2">Elenco</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {scenesByLocation[loc].map((scene, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="px-4 py-2 font-mono text-center">{scene.scene_number}</td>
                            <td className="px-4 py-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                scene.time.toUpperCase().includes('NIGHT') || scene.time.toUpperCase().includes('NOITE') 
                                ? 'bg-indigo-900 text-indigo-200' 
                                : 'bg-amber-900 text-amber-200'
                              }`}>
                                {scene.time}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs opacity-80">{scene.summary}</td>
                            <td className="px-4 py-2 text-xs truncate max-w-[200px]">{scene.characters.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: CAST */}
        {activeTab === 'CAST' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Relatório de Elenco</h3>
                <p className="text-sm text-slate-400">Contratos, Atores Sugeridos e Volume de Trabalho.</p>
              </div>
              <button onClick={exportCast} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Exportar CSV
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.characters_metadata.map((char, idx) => (
                <div key={idx} className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-white text-lg">{char.name}</h4>
                       <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{char.role}</span>
                    </div>
                    <p className="text-emerald-400 font-medium text-sm mb-2">{char.actor_name || "Ator não definido"}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span>Contrato: <span className="text-white font-bold">{char.contract_status || "Pendente"}</span></span>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-slate-700/50">
                     <span className="text-[10px] text-slate-500 uppercase font-bold">Cenas ({castStats[char.name]?.count || 0}):</span>
                     <p className="text-xs text-slate-400 mt-1">{castStats[char.name]?.scenes.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: WARDROBE */}
        {activeTab === 'WARDROBE' && (
          <div>
             <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Ficha Técnica de Figurino</h3>
                <p className="text-sm text-slate-400">Detalhamento visual para o departamento de Arte.</p>
              </div>
              <button onClick={exportWardrobe} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Exportar Ficha (CSV)
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.characters_metadata.map((char, idx) => (
                <div key={idx} className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <h4 className="font-bold text-lg text-white mb-1">{char.name}</h4>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{char.role}</span>
                    {char.actor_name && <p className="text-xs text-emerald-400 mt-1">Ator: {char.actor_name}</p>}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded border border-slate-600 shadow-sm" style={{backgroundColor: char.color_palette_hex}}></div>
                      <span className="text-xs font-mono text-slate-500">{char.color_palette_hex}</span>
                    </div>
                  </div>
                  <div className="md:w-3/4 bg-slate-900/50 p-4 rounded border border-slate-800/50">
                    <h5 className="text-xs font-bold text-indigo-400 uppercase mb-2">Descrição Visual & Acessórios</h5>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{char.costume_suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: PROPS */}
        {activeTab === 'PROPS' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Departamento de Arte (Objetos)</h3>
                <p className="text-sm text-slate-400">Lista consolidada de Props.</p>
              </div>
              <button onClick={exportProps} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 self-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                CSV
              </button>
            </div>

            {/* Global Replace Tool */}
            <div className="bg-slate-800 border border-slate-600 rounded p-4 mb-6">
               <h4 className="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 Substituição Global de Objetos (Consistência)
               </h4>
               <div className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Localizar (Ex: Cadeira)</label>
                    <input 
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                      value={findProp}
                      onChange={(e) => setFindProp(e.target.value)}
                      placeholder="Objeto atual..."
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Substituir por (Ex: Banco de Igreja)</label>
                    <input 
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                      value={replaceProp}
                      onChange={(e) => setReplaceProp(e.target.value)}
                      placeholder="Novo nome do objeto..."
                    />
                  </div>
                  <button 
                    onClick={handleGlobalPropReplace}
                    disabled={!findProp || !replaceProp}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                  >
                    Substituir em Todas as Cenas
                  </button>
               </div>
               <p className="text-[10px] text-slate-500 mt-2">Isso atualizará todas as listas de objetos nas cenas automaticamente.</p>
            </div>

            <div className="bg-slate-800 rounded border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-900/50 text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Objeto (Prop)</th>
                      <th className="px-6 py-3">Cena</th>
                      <th className="px-6 py-3">Contexto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {allProps.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-500 italic">Nenhum objeto específico detectado.</td></tr>
                    ) : (
                      allProps.map((prop, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="px-6 py-3 font-medium text-white">{prop.name}</td>
                          <td className="px-6 py-3 font-mono text-indigo-300">Cena {prop.scene}</td>
                          <td className="px-6 py-3 text-xs text-slate-400">{prop.summary}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};