import React, { useState } from 'react';
import { Resumos } from '../types';

interface ResumosPanelProps {
  resumos: Resumos | undefined;
  logline: string; // Fallback do campo existente
  onUpdateResumos: (resumos: Resumos) => void;
}

type ResumoTab = 'logline' | 'sinopse' | 'argumento' | 'resumo';

const tabInfo: Record<ResumoTab, { label: string; description: string; placeholder: string }> = {
  logline: {
    label: 'Logline',
    description: 'Uma frase que captura a essência do filme (max. 30 palavras)',
    placeholder: 'Ex: Um padre descobre que o noivo de um casamento morreu em acidente, revelando as verdadeiras faces dos convidados.'
  },
  sinopse: {
    label: 'Sinopse',
    description: 'Resumo curto para catálogos e apresentações (1-2 parágrafos)',
    placeholder: 'Descreva o conflito principal, os personagens centrais e o tom do filme...'
  },
  argumento: {
    label: 'Argumento',
    description: 'Narrativa completa sem diálogos (1-2 páginas)',
    placeholder: 'Conte a história completa do início ao fim, incluindo os principais eventos e a resolução...'
  },
  resumo: {
    label: 'Resumo Expandido',
    description: 'Versão detalhada com análise temática e contexto',
    placeholder: 'Inclua análises de personagens, temas, subtextos e elementos narrativos importantes...'
  }
};

export const ResumosPanel: React.FC<ResumosPanelProps> = ({ resumos, logline, onUpdateResumos }) => {
  const [activeTab, setActiveTab] = useState<ResumoTab>('logline');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const currentResumos: Resumos = resumos || {
    logline: logline || '',
    sinopse: '',
    argumento: '',
    resumo: ''
  };

  const getCurrentValue = (tab: ResumoTab): string => {
    return currentResumos[tab] || '';
  };

  const handleEdit = () => {
    setEditValue(getCurrentValue(activeTab));
    setIsEditing(true);
  };

  const handleSave = () => {
    const updated: Resumos = {
      ...currentResumos,
      [activeTab]: editValue
    };
    onUpdateResumos(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const tabs: ResumoTab[] = ['logline', 'sinopse', 'argumento', 'resumo'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Resumos do Projeto</h2>
          <p className="text-slate-400 text-sm mt-1">Logline, sinopse, argumento e resumo expandido.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tabInfo[tab].label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1">{tabInfo[activeTab].label}</h3>
          <p className="text-sm text-slate-500">{tabInfo[activeTab].description}</p>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full h-64 bg-slate-800 text-slate-200 p-4 rounded-lg border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans text-sm resize-none"
              placeholder={tabInfo[activeTab].placeholder}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {getCurrentValue(activeTab) ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {getCurrentValue(activeTab)}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Nenhum conteúdo para "{tabInfo[activeTab].label}" ainda.</p>
                <p className="text-xs mt-1">Clique em "Editar" para adicionar.</p>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Word Count / Stats */}
      {getCurrentValue(activeTab) && (
        <div className="flex gap-4 text-xs text-slate-500">
          <span>{getCurrentValue(activeTab).split(/\s+/).filter(Boolean).length} palavras</span>
          <span>{getCurrentValue(activeTab).length} caracteres</span>
        </div>
      )}
    </div>
  );
};
