import React, { useState } from 'react';
import { Character } from '../types';

interface CharacterBoardProps {
  characters: Character[];
  onUpdateCharacters: (newCharacters: Character[]) => void;
  onSyncChanges: () => void;
  isSyncing: boolean;
}

export const CharacterBoard: React.FC<CharacterBoardProps> = ({ characters, onUpdateCharacters, onSyncChanges, isSyncing }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Temporary state for the character being edited
  const [editForm, setEditForm] = useState<Character | null>(null);

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...characters[index] });
  };

  const handleSave = () => {
    if (editForm && editingIndex !== null) {
      const updated = [...characters];
      updated[editingIndex] = editForm;
      onUpdateCharacters(updated);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleAddNew = () => {
    const newChar: Character = {
      name: 'Novo Personagem',
      role: 'Elenco de Apoio',
      costume_suggestion: 'Descreva a aparência física e roupas...',
      color_palette_hex: '#808080'
    };
    onUpdateCharacters([...characters, newChar]);
    // Automatically start editing the new character
    setEditingIndex(characters.length);
    setEditForm(newChar);
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Remover este personagem?")) {
      const updated = characters.filter((_, i) => i !== index);
      onUpdateCharacters(updated);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-xs uppercase font-bold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          Departamento de Arte & Elenco
        </h3>
        
        <div className="flex gap-2">
          <button 
            onClick={onSyncChanges}
            disabled={isSyncing || characters.length === 0}
            className={`text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors border font-bold
              ${isSyncing 
                ? 'bg-slate-700 border-slate-600 text-slate-400 cursor-wait' 
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-lg hover:shadow-emerald-500/20'}`}
          >
            {isSyncing ? (
               <>
                 <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Sincronizando...
               </>
            ) : (
               <>
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 Aplicar Mudanças ao Roteiro
               </>
            )}
          </button>

          <button 
            onClick={handleAddNew}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
          >
            + Adicionar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((char, idx) => {
          const isEditing = editingIndex === idx;
          const displayChar = isEditing && editForm ? editForm : char;

          return (
            <div key={idx} className={`bg-slate-800 rounded-lg border ${isEditing ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-700'} p-4 flex flex-col relative overflow-hidden group transition-all`}>
              
              {/* Color Strip */}
              <div 
                className="absolute top-0 left-0 w-1.5 h-full transition-colors" 
                style={{ backgroundColor: displayChar.color_palette_hex || '#ccc' }}
              ></div>
              
              <div className="pl-3 w-full">
                {/* Header: Name & Role */}
                <div className="flex justify-between items-start mb-2 gap-2">
                  {isEditing ? (
                    <div className="w-full space-y-2">
                      <input 
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white font-bold text-sm w-full outline-none focus:border-indigo-500"
                        value={displayChar.name}
                        onChange={(e) => setEditForm({...displayChar, name: e.target.value})}
                        placeholder="Nome do Personagem"
                      />
                      <input 
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-emerald-400 font-medium text-xs w-full outline-none focus:border-indigo-500"
                        value={displayChar.actor_name || ''}
                        onChange={(e) => setEditForm({...displayChar, actor_name: e.target.value})}
                        placeholder="Ator/Atriz Sugerido"
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-white text-lg truncate leading-tight">{displayChar.name}</h4>
                      {displayChar.actor_name && (
                        <p className="text-emerald-400 text-xs font-medium truncate">{displayChar.actor_name}</p>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <select
                      className="bg-slate-900 border border-slate-600 rounded text-[10px] text-slate-300 uppercase outline-none"
                      value={displayChar.role}
                      onChange={(e) => setEditForm({...displayChar, role: e.target.value as any})}
                    >
                      <option value="Protagonista">Protagonista</option>
                      <option value="Elenco de Apoio">Apoio</option>
                      <option value="Figuração">Figuração</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-medium border whitespace-nowrap
                      ${char.role === 'Protagonista' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 
                        char.role === 'Elenco de Apoio' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {char.role}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                <div className="mb-3">
                  <h5 className="text-[10px] uppercase text-slate-500 font-bold mb-1">Aparência & Figurino</h5>
                  {isEditing ? (
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-300 outline-none focus:border-indigo-500 h-24 resize-none"
                      value={displayChar.costume_suggestion}
                      onChange={(e) => setEditForm({...displayChar, costume_suggestion: e.target.value})}
                      placeholder="Ex: Negra, 23 anos, magra, vestido branco..."
                    />
                  ) : (
                    <p className="text-sm text-slate-300 leading-snug line-clamp-4">{char.costume_suggestion}</p>
                  )}
                </div>

                {/* Contract Status (New) */}
                {isEditing ? (
                   <div className="mb-3">
                     <h5 className="text-[10px] uppercase text-slate-500 font-bold mb-1">Status Contratual</h5>
                     <input 
                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 outline-none"
                        value={displayChar.contract_status || ''}
                        onChange={(e) => setEditForm({...displayChar, contract_status: e.target.value})}
                        placeholder="Ex: Em negociação, Assinado..."
                      />
                   </div>
                ) : (
                  char.contract_status && (
                    <div className="mb-3 flex items-center gap-2 bg-slate-900/50 p-1.5 rounded border border-slate-700/50">
                       <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       <span className="text-xs text-slate-400 italic">{char.contract_status}</span>
                    </div>
                  )
                )}

                {/* Footer: Palette & Actions */}
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-700/50">
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <input 
                        type="color" 
                        value={displayChar.color_palette_hex}
                        onChange={(e) => setEditForm({...displayChar, color_palette_hex: e.target.value})}
                        className="w-6 h-6 rounded bg-transparent cursor-pointer border-none"
                      />
                    ) : (
                      <div 
                        className="w-6 h-6 rounded-full border border-slate-500 shadow-sm"
                        style={{ backgroundColor: char.color_palette_hex || '#000' }}
                      ></div>
                    )}
                    
                    {!isEditing && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-500 font-bold">Paleta</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => setEditingIndex(null)} className="text-xs text-slate-400 hover:text-white px-2">Cancelar</button>
                        <button onClick={handleSave} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded font-bold hover:bg-indigo-500">Salvar</button>
                      </>
                    ) : (
                      <>
                         <button 
                           onClick={() => handleDelete(idx)}
                           className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                           title="Excluir"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                         <button 
                           onClick={() => startEditing(idx)}
                           className="text-indigo-400 hover:text-white text-xs font-medium bg-slate-900/50 hover:bg-indigo-600/20 px-3 py-1 rounded border border-indigo-500/30 transition-all"
                         >
                           Editar
                         </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};