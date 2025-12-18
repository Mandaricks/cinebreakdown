import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [key, setKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      onSave(storedKey);
    }
  }, [onSave]);

  if (!isOpen && key) return null;
  // If open but we have a key (from local storage check), we might still want to show if explicit open,
  // but for this logic, we only show if we need a key.
  
  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem('gemini_api_key', key);
      onSave(key);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Configuração da API</h2>
        <p className="text-slate-400 text-sm mb-6">
          Para realizar a decupagem com baixo custo (frações de centavo), precisamos da sua API Key do Google Gemini.
          <br/><br/>
          A chave é salva apenas no seu navegador.
        </p>
        
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Google Gemini API Key</label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Cole sua chave aqui..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-6"
        />

        <div className="flex gap-3">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 px-4 py-2 text-center text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Gerar Chave
          </a>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Começar
          </button>
        </div>
      </div>
    </div>
  );
};
