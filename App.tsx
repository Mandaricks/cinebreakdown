import React, { useState, useEffect } from 'react';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SceneCard } from './components/SceneCard';
import { CharacterBoard } from './components/CharacterBoard';
import { Dashboard } from './components/Dashboard';
import { ReportsPanel } from './components/ReportsPanel';
import { analyzeStructure, generateSceneShots, updateShotsWithNewCharacters, InputFile } from './services/geminiService';
import { generateProductionBible, generateAssetsZip } from './services/exportService';
import { AppStatus, BreakdownResult, Scene, Character } from './types';

// Icons Components
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
);

const JsonFileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const TrashIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
   </svg>
);

// Sidebar Icons
const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ScenesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const CharactersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ReportsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

type ViewSection = 'DASHBOARD' | 'SCENES' | 'CHARACTERS' | 'REPORTS';

interface SavedProject {
  id: string;
  title: string;
  date: string;
  result: BreakdownResult;
}

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [inputText, setInputText] = useState(''); 
  const [uploadedFile, setUploadedFile] = useState<InputFile | null>(null); 
  const [fileName, setFileName] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(true);
  
  // Navigation State
  const [activeSection, setActiveSection] = useState<ViewSection>('DASHBOARD');
  
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<BreakdownResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Character Sync State
  const [isSyncingCharacters, setIsSyncingCharacters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Project History State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  // Load History on Mount
  useEffect(() => {
    try {
      const history = localStorage.getItem('cinebreakdown_history');
      if (history) {
        setSavedProjects(JSON.parse(history));
      }
    } catch (e) {
      console.error("Failed to parse history", e);
    }
  }, []);

  // Auto-save Result whenever it changes
  useEffect(() => {
    if (result && status === AppStatus.SUCCESS) {
      saveToHistory(result);
    }
  }, [result, status]);

  const saveToHistory = (data: BreakdownResult) => {
    const newProject: SavedProject = {
      id: data.title + '_' + new Date().getTime(),
      title: data.title || 'Sem Título',
      date: new Date().toLocaleDateString('pt-BR'),
      result: data
    };

    const existingIndex = savedProjects.findIndex(p => p.title === data.title);
    let updatedProjects;
    
    if (existingIndex >= 0) {
      updatedProjects = [...savedProjects];
      updatedProjects[existingIndex] = { ...updatedProjects[existingIndex], result: data, date: new Date().toLocaleDateString('pt-BR') };
    } else {
      updatedProjects = [newProject, ...savedProjects];
    }
    
    if (updatedProjects.length > 5) updatedProjects = updatedProjects.slice(0, 5);

    setSavedProjects(updatedProjects);
    try {
      localStorage.setItem('cinebreakdown_history', JSON.stringify(updatedProjects));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  };

  const loadProject = (project: SavedProject) => {
    setResult(project.result);
    setStatus(AppStatus.SUCCESS);
    setActiveSection('DASHBOARD');
  };

  const deleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem('cinebreakdown_history', JSON.stringify(updated));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    if (file.name.endsWith('.json') || file.type === 'application/json') {
      reader.onload = (e) => {
        try {
          const jsonText = e.target?.result as string;
          const parsedResult = JSON.parse(jsonText) as BreakdownResult;
          
          if (!parsedResult.scenes || !parsedResult.total_scenes) {
            throw new Error("Formato de JSON inválido.");
          }

          setResult(parsedResult);
          setStatus(AppStatus.SUCCESS);
          setUploadedFile(null);
          setInputText('');
          setActiveSection('DASHBOARD');
        } catch (err) {
          console.error(err);
          setErrorMsg("Erro ao ler arquivo JSON.");
        }
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];
        setUploadedFile({ data: base64Data, mimeType: 'application/pdf' });
        setInputText('');
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setUploadedFile({ data: text, mimeType: 'text/plain' });
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setUploadedFile({ data: e.target.value, mimeType: 'text/plain' });
    setFileName('');
  };

  const handleAnalyze = async () => {
    if (!apiKey) return;
    const payload = uploadedFile || (inputText ? { data: inputText, mimeType: 'text/plain' } : null);

    if (!payload || !payload.data.trim()) {
      setErrorMsg("Por favor, cole um texto ou faça upload de um arquivo.");
      return;
    }

    setStatus(AppStatus.ANALYZING);
    setErrorMsg('');

    try {
      const data = await analyzeStructure(payload, apiKey);
      setResult(data);
      setStatus(AppStatus.SUCCESS);
      setActiveSection('SCENES'); // Auto-switch to breakdown
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha na análise inicial. Verifique sua API Key.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateShots = async (sceneIndex: number) => {
    if (!result || !apiKey) return;
    const scene = result.scenes[sceneIndex];
    const payload = uploadedFile || (inputText ? { data: inputText, mimeType: 'text/plain' } : null);
    const effectivePayload = payload || { data: `Scene: ${scene.header}\nSummary: ${scene.summary}`, mimeType: 'text/plain' };

    try {
      const shots = await generateSceneShots(scene.scene_number, effectivePayload, scene, result.characters_metadata, apiKey);
      const newScenes = [...result.scenes];
      newScenes[sceneIndex] = { ...scene, shots };
      setResult({ ...result, scenes: newScenes });
    } catch (e) {
      console.error("Failed to generate shots", e);
      alert("Erro ao gerar planos.");
    }
  };

  const handleSceneUpdate = (index: number, updatedScene: Scene) => {
    if (!result) return;
    const newScenes = [...result.scenes];
    newScenes[index] = updatedScene;
    setResult({ ...result, scenes: newScenes });
  };
  
  const handleCharacterUpdate = (newCharacters: Character[]) => {
    if (!result) return;
    setResult({ ...result, characters_metadata: newCharacters });
  };

  const handleSyncCharacters = async () => {
    if (!result || !apiKey) return;
    
    setIsSyncingCharacters(true);
    try {
      const updatedScenes = await Promise.all(result.scenes.map(async (scene) => {
        if (scene.shots && scene.shots.length > 0) {
           const updatedShots = await updateShotsWithNewCharacters(scene, result.characters_metadata, apiKey);
           return { ...scene, shots: updatedShots };
        }
        return scene;
      }));
      
      setResult({ ...result, scenes: updatedScenes });
      alert("Personagens sincronizados com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao sincronizar personagens.");
    } finally {
      setIsSyncingCharacters(false);
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      await generateProductionBible(result);
      setShowExportMenu(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZIP = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      const count = await generateAssetsZip(result);
      alert(`Pacote gerado! ${count} ativos.`);
      setShowExportMenu(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar ZIP.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${result.title || "projeto"}_cinebreakdown.json`;
    link.click();
    setShowExportMenu(false);
  };

  const handleReset = () => {
    if (confirm("Deseja voltar para a tela inicial? O projeto atual será salvo no histórico.")) {
      setInputText('');
      setUploadedFile(null);
      setFileName('');
      setResult(null);
      setStatus(AppStatus.IDLE);
    }
  };
  
  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
  };


  // --- RENDER: LANDING / UPLOAD PAGE ---

  if (status === AppStatus.IDLE || status === AppStatus.ERROR || status === AppStatus.ANALYZING) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col overflow-auto">
        <ApiKeyModal isOpen={showApiKeyModal} onSave={handleApiKeySave} />
        
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">CB</div>
                <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                  CineBreakdown 
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">v1.2 Fixed</span>
                </h1>
             </div>
             <button onClick={() => setShowApiKeyModal(true)} className="text-xs text-slate-400 hover:text-white">Alterar API Key</button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex flex-col lg:flex-row gap-8 items-start">
           <div className="flex-1 w-full">
              {status === AppStatus.ANALYZING ? (
                 <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 rounded-xl border border-slate-800">
                    <Spinner />
                    <h3 className="text-xl font-semibold text-white mb-2">Analisando Roteiro...</h3>
                    <p className="text-slate-500 text-sm">Identificando cenas, personagens e figurinos com IA.</p>
                 </div>
              ) : (
                <>
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-3">Assistente de Direção IA</h2>
                    <p className="text-slate-400">
                      Importe seu roteiro para gerar decupagem técnica, lista de elenco e artes conceituais automaticamente.
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-2 border border-slate-700 shadow-xl">
                    {fileName ? (
                      <div className="w-full h-64 bg-slate-900/50 flex flex-col items-center justify-center text-slate-300 rounded-lg border-2 border-dashed border-slate-700">
                         {fileName.endsWith('.json') ? <JsonFileIcon /> : <FileIcon />}
                         <span className="font-medium">{fileName}</span>
                         <button onClick={() => { setUploadedFile(null); setFileName(''); }} className="mt-4 text-xs text-red-400 hover:text-red-300 underline">Remover</button>
                      </div>
                    ) : (
                      <div className="relative w-full h-64">
                         {!inputText && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                               <UploadIcon />
                               <span className="text-sm text-slate-400">Arraste um arquivo (PDF, TXT, JSON) ou cole o texto</span>
                            </div>
                         )}
                         <textarea
                          value={inputText}
                          onChange={handleTextChange}
                          className="w-full h-full bg-slate-900/50 text-slate-300 p-4 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm resize-none relative z-10 bg-transparent"
                        />
                      </div>
                    )}
                    
                    <div className="p-4 flex items-center justify-between bg-slate-800 rounded-b-lg">
                      <div className="relative group">
                        <input type="file" accept=".txt,.md,.fountain,.pdf,.json" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <button className="text-sm text-slate-400 group-hover:text-white flex items-center gap-2 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          Carregar Arquivo
                        </button>
                      </div>
                      <button 
                        onClick={handleAnalyze} 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
                      >
                        {fileName.endsWith('.json') ? 'Abrir Projeto' : 'Iniciar Análise'}
                      </button>
                    </div>
                  </div>
                  {errorMsg && (
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm text-center">
                      {errorMsg}
                    </div>
                  )}
                </>
              )}
           </div>

           {/* Sidebar: Recent Projects */}
           <div className="w-full lg:w-80 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 h-fit">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 Projetos Recentes
               </h3>
               {savedProjects.length === 0 ? (
                 <p className="text-sm text-slate-500 italic">Nenhum histórico encontrado.</p>
               ) : (
                 <div className="space-y-3">
                   {savedProjects.map(project => (
                     <div 
                        key={project.id} 
                        onClick={() => loadProject(project)}
                        className="group bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 cursor-pointer transition-colors relative"
                     >
                        <h4 className="font-bold text-slate-200 text-sm truncate">{project.title}</h4>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-slate-500">{project.date}</span>
                          <span className="text-[10px] text-indigo-400">{project.result.total_scenes} Cenas</span>
                        </div>
                        <button 
                          onClick={(e) => deleteProject(e, project.id)}
                          className="absolute top-2 right-2 text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TrashIcon />
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
        </main>
      </div>
    );
  }

  // --- RENDER: MAIN APP VIEW WITH SIDEBAR ---

  const SidebarItem = ({ id, label, icon: Icon }: { id: ViewSection, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        activeSection === id 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
       <Icon />
       {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-20">
         <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
             <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white mr-3 shadow-md shadow-indigo-500/20">CB</div>
             <span className="font-bold text-white tracking-tight text-lg">CineBreakdown</span>
             <span className="ml-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">v1.2 Fixed</span>
         </div>

         <div className="p-4 border-b border-slate-800/50 bg-slate-800/20">
             <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Projeto Atual</div>
             <h2 className="text-sm font-bold text-white truncate" title={result?.title}>{result?.title || "Sem Título"}</h2>
             <p className="text-xs text-slate-400 mt-0.5 truncate">{result?.author || "Autor Desconhecido"}</p>
         </div>

         <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
             <SidebarItem id="DASHBOARD" label="Visão Geral" icon={DashboardIcon} />
             <SidebarItem id="SCENES" label="Roteiro & Decupagem" icon={ScenesIcon} />
             <SidebarItem id="CHARACTERS" label="Personagens & Arte" icon={CharactersIcon} />
             <SidebarItem id="REPORTS" label="Relatórios" icon={ReportsIcon} />
         </nav>

         <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/50">
            <button onClick={() => setShowApiKeyModal(true)} className="w-full text-xs text-slate-400 hover:text-white">Alterar API Key</button>
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm text-slate-300 transition-colors border border-slate-700 ${showExportMenu ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Exportar</span>
                </div>
                <svg className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {showExportMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in">
                   <button onClick={handleExportPDF} disabled={isExporting} className="w-full text-left px-4 py-3 text-xs hover:bg-indigo-600 hover:text-white text-slate-200 border-b border-slate-700/50 flex items-center justify-between group">
                      <span>PDF (Bíblia de Produção)</span>
                      <span className="opacity-0 group-hover:opacity-100">↓</span>
                   </button>
                   <button onClick={handleExportZIP} disabled={isExporting} className="w-full text-left px-4 py-3 text-xs hover:bg-indigo-600 hover:text-white text-slate-200 border-b border-slate-700/50 flex items-center justify-between group">
                      <span>ZIP (Imagens & CSVs)</span>
                      <span className="opacity-0 group-hover:opacity-100">↓</span>
                   </button>
                   <button onClick={handleExportJSON} disabled={isExporting} className="w-full text-left px-4 py-3 text-xs hover:bg-indigo-600 hover:text-white text-slate-200 flex items-center justify-between group">
                      <span>JSON (Backup Projeto)</span>
                      <span className="opacity-0 group-hover:opacity-100">↓</span>
                   </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded text-xs transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              Voltar ao Início
            </button>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 p-6 md:p-8 h-full scroll-smooth">
         <div className="max-w-6xl mx-auto animate-fade-in pb-10">
            
            {activeSection === 'DASHBOARD' && result && (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h2>
                    <p className="text-slate-400 text-sm mt-1">Status da produção e estatísticas principais.</p>
                  </div>
                </div>
                <Dashboard data={result} />
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /></svg>
                   </div>
                   <h3 className="text-lg font-bold text-white mb-4 relative z-10">Logline & Resumo</h3>
                   <p className="text-slate-300 leading-relaxed text-lg font-light relative z-10">{result.logline || "Nenhum logline disponível para este roteiro."}</p>
                </div>
              </div>
            )}

            {activeSection === 'SCENES' && result && (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                   <div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">Decupagem de Cenas</h2>
                      <p className="text-slate-400 text-sm mt-1">Análise cena a cena, storyboards e shot lists.</p>
                   </div>
                   <div className="text-sm font-mono bg-slate-800 px-3 py-1 rounded text-slate-300 border border-slate-700">
                      {result.total_scenes} Cenas Total
                   </div>
                </div>
                <div className="space-y-4">
                  {result.scenes.map((scene, index) => (
                    <SceneCard 
                      key={index} 
                      scene={scene} 
                      apiKey={apiKey}
                      onGenerateShots={() => handleGenerateShots(index)} 
                      onUpdateScene={(updatedScene) => handleSceneUpdate(index, updatedScene)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'CHARACTERS' && result && (
               <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">Personagens & Arte</h2>
                      <p className="text-slate-400 text-sm mt-1">Gestão de elenco, figurino e consistência visual.</p>
                    </div>
                  </div>
                  <CharacterBoard 
                    characters={result.characters_metadata || []} 
                    onUpdateCharacters={handleCharacterUpdate}
                    onSyncChanges={handleSyncCharacters}
                    isSyncing={isSyncingCharacters}
                  />
               </div>
            )}

            {activeSection === 'REPORTS' && result && (
               <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">Escritório de Produção</h2>
                      <p className="text-slate-400 text-sm mt-1">Relatórios consolidados para exportação (PDF/CSV).</p>
                    </div>
                  </div>
                  <ReportsPanel 
                    data={result} 
                    onUpdateResult={setResult}
                  />
               </div>
            )}

         </div>
      </main>
    </div>
  );
};

export default App;
