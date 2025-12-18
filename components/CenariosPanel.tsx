import React, { useState } from 'react';
import { Cenario, Scene } from '../types';

interface CenariosPanelProps {
  cenarios: Cenario[] | undefined;
  scenes: Scene[];
  uniqueLocations: string[];
  onUpdateCenarios: (cenarios: Cenario[]) => void;
}

const emptyCenario: Omit<Cenario, 'id'> = {
  nome: '',
  tipo: 'Interior',
  localizacao: '',
  epoca: 'Contemporâneo',
  atmosfera: '',
  elementos_principais: [],
  iluminacao: '',
  cenas_associadas: []
};

export const CenariosPanel: React.FC<CenariosPanelProps> = ({ 
  cenarios, 
  scenes, 
  uniqueLocations,
  onUpdateCenarios 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Cenario | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newElemento, setNewElemento] = useState('');

  // Gera cenários a partir das locações únicas se não existirem
  const currentCenarios: Cenario[] = cenarios || uniqueLocations.map((loc, idx) => ({
    id: `cenario_${idx}`,
    nome: loc,
    tipo: loc.toLowerCase().includes('ext') ? 'Exterior' : 'Interior',
    localizacao: '',
    epoca: 'Contemporâneo',
    atmosfera: '',
    elementos_principais: [],
    iluminacao: '',
    cenas_associadas: scenes.filter(s => s.location === loc).map(s => String(s.scene_number))
  }));

  const handleEdit = (cenario: Cenario) => {
    setEditingId(cenario.id);
    setEditForm({ ...cenario });
  };

  const handleSave = () => {
    if (!editForm) return;
    const updated = currentCenarios.map(c => c.id === editForm.id ? editForm : c);
    onUpdateCenarios(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
    setShowNewForm(false);
  };

  const handleAddNew = () => {
    const newCenario: Cenario = {
      ...emptyCenario,
      id: `cenario_${Date.now()}`
    };
    setEditForm(newCenario);
    setShowNewForm(true);
  };

  const handleSaveNew = () => {
    if (!editForm) return;
    onUpdateCenarios([...currentCenarios, editForm]);
    setShowNewForm(false);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover este cenário?')) {
      onUpdateCenarios(currentCenarios.filter(c => c.id !== id));
    }
  };

  const handleAddElemento = () => {
    if (!editForm || !newElemento.trim()) return;
    setEditForm({
      ...editForm,
      elementos_principais: [...editForm.elementos_principais, newElemento.trim()]
    });
    setNewElemento('');
  };

  const handleRemoveElemento = (index: number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      elementos_principais: editForm.elementos_principais.filter((_, i) => i !== index)
    });
  };

  const renderEditForm = (isNew = false) => {
    if (!editForm) return null;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">
          {isNew ? 'Novo Cenário' : `Editando: ${editForm.nome}`}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nome do Cenário</label>
            <input
              type="text"
              value={editForm.nome}
              onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
              className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="Ex: Igreja Matriz"
            />
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tipo</label>
            <select
              value={editForm.tipo}
              onChange={e => setEditForm({ ...editForm, tipo: e.target.value as Cenario['tipo'] })}
              className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Interior">Interior</option>
              <option value="Exterior">Exterior</option>
              <option value="Misto">Misto</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Localização Sugerida</label>
            <input
              type="text"
              value={editForm.localizacao}
              onChange={e => setEditForm({ ...editForm, localizacao: e.target.value })}
              className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="Ex: Igreja Matriz do Centro Histórico"
            />
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1">Época</label>
            <input
              type="text"
              value={editForm.epoca}
              onChange={e => setEditForm({ ...editForm, epoca: e.target.value })}
              className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="Ex: Contemporâneo, Anos 70"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Atmosfera</label>
          <textarea
            value={editForm.atmosfera}
            onChange={e => setEditForm({ ...editForm, atmosfera: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none h-20 resize-none"
            placeholder="Ex: Ambiente solene e tradicional, com ar de expectativa..."
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Iluminação</label>
          <input
            type="text"
            value={editForm.iluminacao}
            onChange={e => setEditForm({ ...editForm, iluminacao: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
            placeholder="Ex: Luz natural dos vitrais, complementada por velas"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Elementos Principais</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newElemento}
              onChange={e => setNewElemento(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddElemento()}
              className="flex-1 bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="Ex: Altar, Vitrais, Bancos de madeira"
            />
            <button
              onClick={handleAddElemento}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {editForm.elementos_principais.map((elem, idx) => (
              <span key={idx} className="bg-slate-700 text-white px-3 py-1 rounded flex items-center gap-2">
                {elem}
                <button onClick={() => handleRemoveElemento(idx)} className="text-red-400 hover:text-red-300">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Simbolismo / Significado Narrativo</label>
          <textarea
            value={editForm.simbolismo || ''}
            onChange={e => setEditForm({ ...editForm, simbolismo: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none h-20 resize-none"
            placeholder="Ex: A igreja representa a tradição e as expectativas sociais que sufocam a noiva..."
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Notas Técnicas</label>
          <textarea
            value={editForm.notas_tecnicas || ''}
            onChange={e => setEditForm({ ...editForm, notas_tecnicas: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none h-16 resize-none"
            placeholder="Ex: Verificar permissão para filmagem, necessário gerador..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <button onClick={handleCancel} className="px-4 py-2 text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button 
            onClick={isNew ? handleSaveNew : handleSave} 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Salvar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Cenários</h2>
          <p className="text-slate-400 text-sm mt-1">Ambientação detalhada de cada locação.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Cenário
        </button>
      </div>

      {showNewForm && renderEditForm(true)}

      <div className="space-y-4">
        {currentCenarios.map(cenario => (
          editingId === cenario.id ? (
            <div key={cenario.id}>{renderEditForm()}</div>
          ) : (
            <div key={cenario.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white text-lg">{cenario.nome}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      cenario.tipo === 'Interior' ? 'bg-blue-900/50 text-blue-300' :
                      cenario.tipo === 'Exterior' ? 'bg-green-900/50 text-green-300' :
                      'bg-purple-900/50 text-purple-300'
                    }`}>
                      {cenario.tipo}
                    </span>
                  </div>
                  
                  {cenario.atmosfera && (
                    <p className="text-slate-400 text-sm mb-3">{cenario.atmosfera}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {cenario.localizacao && (
                      <div>
                        <span className="text-slate-500">Localização:</span>
                        <span className="text-slate-300 ml-2">{cenario.localizacao}</span>
                      </div>
                    )}
                    {cenario.epoca && (
                      <div>
                        <span className="text-slate-500">Época:</span>
                        <span className="text-slate-300 ml-2">{cenario.epoca}</span>
                      </div>
                    )}
                    {cenario.iluminacao && (
                      <div>
                        <span className="text-slate-500">Iluminação:</span>
                        <span className="text-slate-300 ml-2">{cenario.iluminacao}</span>
                      </div>
                    )}
                  </div>

                  {cenario.elementos_principais.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cenario.elementos_principais.map((elem, i) => (
                        <span key={i} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          {elem}
                        </span>
                      ))}
                    </div>
                  )}

                  {cenario.simbolismo && (
                    <div className="mt-3 p-3 bg-slate-800/50 rounded border-l-2 border-indigo-500">
                      <span className="text-xs text-indigo-400 font-medium">Simbolismo:</span>
                      <p className="text-sm text-slate-300 mt-1">{cenario.simbolismo}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cenario)}
                    className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(cenario.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {currentCenarios.length === 0 && !showNewForm && (
        <div className="text-center py-12 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p>Nenhum cenário definido. Clique em "Novo Cenário" para começar.</p>
        </div>
      )}
    </div>
  );
};
