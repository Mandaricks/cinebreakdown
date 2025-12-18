import React, { useState } from 'react';
import { Figurino, Character } from '../types';

interface FigurinosPanelProps {
  figurinos: Figurino[] | undefined;
  characters: Character[];
  onUpdateFigurinos: (figurinos: Figurino[]) => void;
}

export const FigurinosPanel: React.FC<FigurinosPanelProps> = ({ 
  figurinos, 
  characters,
  onUpdateFigurinos 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Figurino | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPeca, setNewPeca] = useState('');
  const [newAcessorio, setNewAcessorio] = useState('');

  // Gera figurinos a partir dos personagens se não existirem
  const currentFigurinos: Figurino[] = figurinos || characters.map((char, idx) => ({
    id: `figurino_${idx}`,
    personagem: char.name,
    cenas: [],
    descricao: char.costume_suggestion || '',
    pecas: [],
    acessorios: [],
    paleta_cores: char.color_palette_hex ? [char.color_palette_hex] : [],
    estilo: ''
  }));

  const handleEdit = (figurino: Figurino) => {
    setEditingId(figurino.id);
    setEditForm({ ...figurino });
  };

  const handleSave = () => {
    if (!editForm) return;
    const updated = currentFigurinos.map(f => f.id === editForm.id ? editForm : f);
    onUpdateFigurinos(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
    setShowNewForm(false);
  };

  const handleAddNew = () => {
    const newFigurino: Figurino = {
      id: `figurino_${Date.now()}`,
      personagem: '',
      cenas: [],
      descricao: '',
      pecas: [],
      acessorios: [],
      paleta_cores: [],
      estilo: ''
    };
    setEditForm(newFigurino);
    setShowNewForm(true);
  };

  const handleSaveNew = () => {
    if (!editForm) return;
    onUpdateFigurinos([...currentFigurinos, editForm]);
    setShowNewForm(false);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover este figurino?')) {
      onUpdateFigurinos(currentFigurinos.filter(f => f.id !== id));
    }
  };

  const handleAddPeca = () => {
    if (!editForm || !newPeca.trim()) return;
    setEditForm({ ...editForm, pecas: [...editForm.pecas, newPeca.trim()] });
    setNewPeca('');
  };

  const handleAddAcessorio = () => {
    if (!editForm || !newAcessorio.trim()) return;
    setEditForm({ ...editForm, acessorios: [...editForm.acessorios, newAcessorio.trim()] });
    setNewAcessorio('');
  };

  const renderEditForm = (isNew = false) => {
    if (!editForm) return null;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">
          {isNew ? 'Novo Figurino' : `Editando: ${editForm.personagem}`}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Personagem</label>
            <select
              value={editForm.personagem}
              onChange={e => setEditForm({ ...editForm, personagem: e.target.value })}
              className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {characters.map(char => (
                <option key={char.name} value={char.name}>{char.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1">Estilo</label>
            <input
              type="text"
              value={editForm.estilo}
              onChange={e => setEditForm({ ...editForm, estilo: e.target.value })}
              className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="Ex: Clássico, Moderno, Vintage"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Descrição Geral</label>
          <textarea
            value={editForm.descricao}
            onChange={e => setEditForm({ ...editForm, descricao: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none h-24 resize-none"
            placeholder="Descrição completa do figurino, incluindo cores, tecidos, cortes..."
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Peças de Roupa</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newPeca}
              onChange={e => setNewPeca(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddPeca()}
              className="flex-1 bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="Ex: Vestido de noiva branco, Véu bordado..."
            />
            <button onClick={handleAddPeca} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {editForm.pecas.map((peca, idx) => (
              <span key={idx} className="bg-slate-700 text-white px-3 py-1 rounded flex items-center gap-2">
                {peca}
                <button onClick={() => setEditForm({ ...editForm, pecas: editForm.pecas.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-300">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Acessórios</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAcessorio}
              onChange={e => setNewAcessorio(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddAcessorio()}
              className="flex-1 bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="Ex: Brincos de pérola, Aliança de ouro..."
            />
            <button onClick={handleAddAcessorio} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {editForm.acessorios.map((acess, idx) => (
              <span key={idx} className="bg-slate-700 text-white px-3 py-1 rounded flex items-center gap-2">
                {acess}
                <button onClick={() => setEditForm({ ...editForm, acessorios: editForm.acessorios.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-300">×</button>
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
            placeholder="Ex: O branco do vestido contrasta com a alma atormentada da noiva..."
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Notas de Produção</label>
          <textarea
            value={editForm.notas_producao || ''}
            onChange={e => setEditForm({ ...editForm, notas_producao: e.target.value })}
            className="w-full bg-slate-900 text-white px-3 py-2 rounded border border-slate-600 focus:border-indigo-500 focus:outline-none h-16 resize-none"
            placeholder="Ex: Precisa de 2 cópias para cena da chuva..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <button onClick={handleCancel} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
          <button onClick={isNew ? handleSaveNew : handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">Salvar</button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Figurinos</h2>
          <p className="text-slate-400 text-sm mt-1">Roupas, acessórios e paleta de cores por personagem.</p>
        </div>
        <button onClick={handleAddNew} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Figurino
        </button>
      </div>

      {showNewForm && renderEditForm(true)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentFigurinos.map(figurino => (
          editingId === figurino.id ? (
            <div key={figurino.id} className="md:col-span-2">{renderEditForm()}</div>
          ) : (
            <div key={figurino.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{figurino.personagem || 'Sem personagem'}</h3>
                  {figurino.estilo && <span className="text-xs text-indigo-400">{figurino.estilo}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(figurino)} className="p-2 text-slate-400 hover:text-indigo-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(figurino.id)} className="p-2 text-slate-400 hover:text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {figurino.descricao && <p className="text-slate-400 text-sm mb-3">{figurino.descricao}</p>}

              {figurino.pecas.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-slate-500">Peças:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {figurino.pecas.map((peca, i) => (
                      <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{peca}</span>
                    ))}
                  </div>
                </div>
              )}

              {figurino.acessorios.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-slate-500">Acessórios:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {figurino.acessorios.map((acess, i) => (
                      <span key={i} className="text-xs bg-amber-900/30 text-amber-300 px-2 py-0.5 rounded">{acess}</span>
                    ))}
                  </div>
                </div>
              )}

              {figurino.simbolismo && (
                <div className="mt-3 p-2 bg-slate-800/50 rounded border-l-2 border-purple-500">
                  <p className="text-xs text-slate-300">{figurino.simbolismo}</p>
                </div>
              )}
            </div>
          )
        ))}
      </div>

      {currentFigurinos.length === 0 && !showNewForm && (
        <div className="text-center py-12 text-slate-500">
          <p>Nenhum figurino definido. Clique em "Novo Figurino" para começar.</p>
        </div>
      )}
    </div>
  );
};
