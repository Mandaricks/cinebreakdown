import React, { useState, useEffect } from 'react';
import { AIProvider, getApiKeyInstructions } from '../services/freeAIService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string, provider: AIProvider) => void;
}

interface ProviderOption {
  id: AIProvider;
  name: string;
  description: string;
  color: string;
  url: string;
  free: boolean;
}

const providers: ProviderOption[] = [
  {
    id: 'groq',
    name: 'Groq',
    description: 'Muito rápido, gratuito',
    color: 'bg-orange-600',
    url: 'https://console.groq.com',
    free: true
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Avançado, tier gratuito',
    color: 'bg-blue-600',
    url: 'https://aistudio.google.com/app/apikey',
    free: true
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Múltiplos modelos',
    color: 'bg-purple-600',
    url: 'https://openrouter.ai',
    free: true
  }
];

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [key, setKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('groq');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Tenta carregar chave salva
    const savedProvider = localStorage.getItem('ai_provider') as AIProvider || 'groq';
    const storedKey = localStorage.getItem(`${savedProvider}_api_key`);
    
    if (storedKey) {
      setSelectedProvider(savedProvider);
      setKey(storedKey);
      onSave(storedKey, savedProvider);
    }
  }, [onSave]);

  if (!isOpen && key) return null;
  
  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem(`${selectedProvider}_api_key`, key);
      localStorage.setItem('ai_provider', selectedProvider);
      onSave(key, selectedProvider);
    }
  };

  if (!isOpen) return null;

  const currentProvider = providers.find(p => p.id === selectedProvider)!;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Configuração da IA</h2>
          <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">100% Gratuito</span>
        </div>

        {/* Provider Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-3">Escolha o Provedor de IA</label>
          <div className="grid grid-cols-3 gap-2">
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id);
                  // Tenta carregar chave salva para este provider
                  const savedKey = localStorage.getItem(`${provider.id}_api_key`);
                  if (savedKey) setKey(savedKey);
                  else setKey('');
                }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedProvider === provider.id 
                    ? 'border-indigo-500 bg-slate-700' 
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`w-6 h-6 ${provider.color} rounded mb-2 flex items-center justify-center text-white text-xs font-bold`}>
                  {provider.name[0]}
                </div>
                <div className="font-medium text-white text-sm">{provider.name}</div>
                <div className="text-xs text-slate-400">{provider.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
            {currentProvider.name} API Key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Cole sua chave aqui..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Instructions Toggle */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-sm text-indigo-400 hover:text-indigo-300 mb-4 flex items-center gap-2"
        >
          <span>{showInstructions ? '▼' : '▶'}</span>
          Como obter uma API Key gratuita?
        </button>

        {showInstructions && (
          <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans">
              {getApiKeyInstructions(selectedProvider)}
            </pre>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className="flex items-start gap-3">
            <div className="text-lg">🖼️</div>
            <div>
              <div className="text-sm font-medium text-white">Geração de Imagens Gratuita</div>
              <div className="text-xs text-slate-400">
                Storyboards e artes conceituais são gerados via Pollinations.ai (100% gratuito, sem cadastro).
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <a 
            href={currentProvider.url}
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

        {/* Footer Note */}
        <p className="text-xs text-slate-500 text-center mt-4">
          A chave é salva apenas no seu navegador. Não enviamos para nossos servidores.
        </p>
      </div>
    </div>
  );
};
