import React, { useState, useEffect } from 'react';
import { Scene, Shot } from '../types';
import { generateImage, ImageStyle } from '../services/geminiService';

interface SceneCardProps {
  scene: Scene;
  apiKey: string | null;
  onGenerateShots: () => Promise<void>;
  onUpdateScene: (scene: Scene) => void;
}

// --- SUB-COMPONENTS ---

// 1. ImageViewer Modal
const ImageViewer: React.FC<{ src: string, onClose: () => void }> = ({ src, onClose }) => {
  useEffect(() => {
    // Bloqueia a rolagem quando o modal abre
    document.body.style.overflow = 'hidden';
    
    // Libera a rolagem quando o modal fecha (Cleanup function)
    return () => { 
      // CRITICAL FIX: Explicitly set to 'auto' instead of empty string to prevent getting stuck
      document.body.style.overflow = 'auto'; 
    };
  }, []);

  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[95vh] w-full flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 md:right-4 text-slate-400 hover:text-white font-bold flex items-center gap-2"
        >
          <span className="text-xs uppercase">Fechar</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <img 
          src={src} 
          alt="Full Size Storyboard" 
          className="max-w-full max-h-[85vh] object-contain rounded border border-slate-800 shadow-2xl bg-black" 
          onClick={(e) => e.stopPropagation()} 
        />
        
        <a 
          href={src} 
          download={`storyboard_image_${Date.now()}.jpg`}
          onClick={(e) => e.stopPropagation()}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Baixar Imagem
        </a>
      </div>
    </div>
  );
};

// 2. Editable Tag List
const EditableTagList: React.FC<{ 
  items: string[], 
  onUpdate: (newItems: string[]) => void,
  placeholder: string
}> = ({ items, onUpdate, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onUpdate([...items, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdate(newItems);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {items.map((item, i) => (
        <span key={i} className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded flex items-center gap-1 group">
          {item}
          <button 
            onClick={() => handleRemove(i)}
            className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAdd}
        placeholder={placeholder}
        className="text-xs bg-slate-800 border border-slate-600 text-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none min-w-[120px]"
      />
    </div>
  );
};

// 3. ShotItem
const ShotItem: React.FC<{ 
  shot: Shot, 
  isEditing: boolean,
  apiKey: string | null,
  globalStyle: ImageStyle,
  onUpdate: (updatedShot: Shot) => void,
  onViewImage: (url: string) => void
}> = ({ shot, isEditing, apiKey, globalStyle, onUpdate, onViewImage }) => {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shot.visual_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (field: keyof Shot, value: string | number) => {
    onUpdate({ ...shot, [field]: value });
  };

  const handleGenerateImage = async () => {
    if (!apiKey) {
      alert("API Key necessária para gerar imagens.");
      return;
    }
    setGenerating(true);
    try {
      const base64Url = await generateImage(shot.visual_prompt, globalStyle, apiKey);
      onUpdate({ ...shot, imageUrl: base64Url });
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar imagem. Verifique sua API Key ou tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-slate-900/50 border border-indigo-500/50 rounded-md p-3 mb-2">
         <div className="grid grid-cols-3 gap-2 mb-2">
             <input 
               className="text-[10px] bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-bold uppercase"
               value={shot.size}
               onChange={(e) => handleChange('size', e.target.value)}
               placeholder="Size (e.g. CU)"
             />
             <input 
               className="text-[10px] bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-bold uppercase"
               value={shot.angle}
               onChange={(e) => handleChange('angle', e.target.value)}
               placeholder="Angle"
             />
             <input 
               className="text-[10px] bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-bold uppercase"
               value={shot.movement}
               onChange={(e) => handleChange('movement', e.target.value)}
               placeholder="Movement"
             />
         </div>
         <textarea
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-2"
            value={shot.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            placeholder="Action description..."
         />
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-[10px] uppercase text-slate-500 font-bold">Subject</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                value={shot.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500 font-bold">Background</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                value={shot.background_details}
                onChange={(e) => handleChange('background_details', e.target.value)}
              />
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-md p-3 mb-2 hover:border-slate-600 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Tech Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
              SHOT {shot.shot_number}
            </span>
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full border border-slate-700/50">
               <span className="text-indigo-400 text-[10px] font-bold uppercase">{shot.size}</span>
               <span className="text-slate-600 text-[10px]">•</span>
               <span className="text-emerald-400 text-[10px] font-bold uppercase">{shot.angle}</span>
               <span className="text-slate-600 text-[10px]">•</span>
               <span className="text-amber-400 text-[10px] font-bold uppercase">{shot.movement}</span>
            </div>
          </div>
          
          <div className="flex gap-4">
             {/* Text Content */}
             <div className="flex-1">
               <p className="text-sm text-slate-200 font-medium mb-2 leading-snug">{shot.description}</p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-800/50 p-2 rounded border border-slate-700/30">
                  <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Foco (Sujeito)</span>
                      <span className="text-slate-300">{shot.subject}</span>
                  </div>
                  <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Fundo / Cenário</span>
                      <span className="text-slate-300">{shot.background_details}</span>
                  </div>
               </div>
             </div>
             
             {/* Image Visualization Area */}
             <div className="w-32 flex-shrink-0 flex flex-col gap-2">
                {shot.imageUrl ? (
                  <div className="relative group/img">
                    <img 
                      src={shot.imageUrl} 
                      alt="Storyboard" 
                      className="w-full h-24 object-cover rounded border border-slate-600 bg-black cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onViewImage(shot.imageUrl!)}
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                       <div className="bg-black/50 p-1 rounded-full">
                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                       </div>
                    </div>
                    <button 
                      onClick={handleGenerateImage}
                      disabled={generating}
                      className="absolute bottom-1 right-1 bg-black/60 hover:bg-black/90 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
                      title="Regenerate"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleGenerateImage}
                    disabled={generating}
                    className="w-full h-24 bg-slate-800 border border-dashed border-slate-600 rounded flex flex-col items-center justify-center gap-1 hover:bg-slate-700 hover:border-slate-500 transition-colors group/btn"
                  >
                    {generating ? (
                      <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <svg className="w-6 h-6 text-slate-500 group-hover/btn:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[10px] text-slate-500 font-bold group-hover/btn:text-slate-300">Shot Vis</span>
                      </>
                    )}
                  </button>
                )}
             </div>
          </div>
        </div>
        
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 p-2 rounded transition-colors self-start mt-1 ${
            copied ? 'text-green-400 bg-green-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-700'
          }`}
          title="Copiar Prompt"
        >
          {copied ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          )}
        </button>
      </div>
      
      <div className="mt-2 pt-2 border-t border-slate-800 hidden group-hover:block animate-fade-in">
         <span className="text-[10px] text-slate-500 font-bold uppercase">Prompt IA:</span>
         <p className="text-[10px] text-slate-500 font-mono select-all hover:text-slate-400 transition-colors cursor-text">{shot.visual_prompt}</p>
      </div>
    </div>
  );
};

// 4. Main SceneCard
export const SceneCard: React.FC<SceneCardProps> = ({ scene, apiKey, onGenerateShots, onUpdateScene }) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingShots, setLoadingShots] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageStyle, setImageStyle] = useState<ImageStyle>('BW_SKETCH');
  const [generatingMaster, setGeneratingMaster] = useState(false);
  
  // Local state for image viewing
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  
  // Local state for editing
  const [editedScene, setEditedScene] = useState<Scene>(scene);

  // Sync when prop changes
  useEffect(() => {
    setEditedScene(scene);
  }, [scene]);
  
  const hasShots = scene.shots && scene.shots.length > 0;
  
  const triggerGeneration = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingShots(true);
    await onGenerateShots();
    setLoadingShots(false);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateScene(editedScene);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedScene(scene);
    setIsEditing(false);
  };

  const toggleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If not expanded, expand it
    if (!expanded) setExpanded(true);
    setIsEditing(!isEditing);
  };

  const handleGenerateMasterImage = async () => {
     if (!apiKey) {
       alert("API Key necessária.");
       return;
     }
     setGeneratingMaster(true);
     try {
       // Construct a rich prompt for the master scene
       const prompt = `Wide master shot concept art for a movie scene. Location: ${scene.location}. Time: ${scene.time}. Mood/Action: ${scene.summary}. Cinematic composition, highly detailed.`;
       const url = await generateImage(prompt, imageStyle, apiKey);
       onUpdateScene({ ...scene, sceneImageUrl: url });
     } catch (e) {
       console.error(e);
       alert("Erro ao gerar Concept Art.");
     } finally {
       setGeneratingMaster(false);
     }
  };
  
  const isNight = scene.time.toUpperCase().includes('NIGHT') || scene.time.toUpperCase().includes('NOITE');
  const borderColor = isNight ? 'border-indigo-900/50' : 'border-amber-900/30';
  const bgColor = isNight ? 'bg-slate-800/50' : 'bg-slate-800';

  return (
    <>
      <ImageViewer src={viewingImage || ''} onClose={() => setViewingImage(null)} />
      
      <div className={`rounded-lg border ${borderColor} ${bgColor} mb-4 overflow-hidden transition-all duration-300 shadow-lg`}>
        {/* Header Section */}
        <div 
          className="p-4 cursor-pointer hover:bg-slate-700/30 transition-colors flex items-center justify-between group"
          onClick={() => !isEditing && setExpanded(!expanded)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded text-slate-300 font-mono ${isNight ? 'bg-indigo-900/50 border border-indigo-500/30' : 'bg-amber-900/30 border border-amber-500/30'}`}>
                    CENA {scene.scene_number}
                  </span>
                  <span className="group-hover:text-white transition-colors">{scene.header}</span>
              </h3>
              {/* Edit Button */}
              <button 
                  onClick={toggleEdit}
                  className={`p-1 rounded-full transition-colors ${isEditing ? 'text-indigo-400 bg-indigo-900/50' : 'text-slate-600 hover:text-white hover:bg-slate-600'}`}
                  title="Editar Cena"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>

            {!isEditing ? (
              <p className="text-sm text-slate-400 mt-1 line-clamp-1">{scene.summary}</p>
            ) : (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <textarea
                  value={editedScene.summary}
                  onChange={(e) => setEditedScene({...editedScene, summary: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={handleCancel} className="text-xs text-slate-400 hover:text-white px-2 py-1">Cancelar</button>
                    <button onClick={handleSave} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded font-bold">Salvar Alterações</button>
                </div>
              </div>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex items-center gap-6 pl-4 border-l border-slate-700/50 ml-4">
              <div className="text-right hidden sm:block min-w-[80px]">
                  <div className="text-xs font-bold text-slate-300">
                    {hasShots ? `${scene.shots.length} Planos` : <span className="text-amber-500">Pendente</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">~{scene.estimated_duration_mins} min</div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-700/50 group-hover:bg-indigo-600 transition-all ${expanded ? 'rotate-180 bg-indigo-600' : ''}`}>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className={`border-t border-slate-700/50 p-4 bg-black/20 animate-fade-in-down ${isEditing ? 'border-l-2 border-l-indigo-500' : ''}`}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                {/* Characters & Props */}
                <div className="bg-slate-800/30 p-3 rounded border border-slate-700/30">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                      Personagens
                    </h4>
                    {!isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {scene.characters.map((char, i) => (
                          <span key={i} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded transition-colors cursor-default">{char}</span>
                        ))}
                      </div>
                    ) : (
                      <EditableTagList 
                        items={editedScene.characters}
                        onUpdate={(newItems) => setEditedScene({...editedScene, characters: newItems})}
                        placeholder="Add Personagem..."
                      />
                    )}
                </div>

                <div className="bg-slate-800/30 p-3 rounded border border-slate-700/30">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                      Props & Objetos
                    </h4>
                    {!isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {scene.props.length > 0 ? scene.props.map((prop, i) => (
                          <span key={i} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded transition-colors cursor-default">{prop}</span>
                        )) : <span className="text-xs text-slate-600 italic">Nenhum objeto relevante</span>}
                      </div>
                    ) : (
                      <EditableTagList 
                        items={editedScene.props}
                        onUpdate={(newItems) => setEditedScene({...editedScene, props: newItems})}
                        placeholder="Add Objeto..."
                      />
                    )}
                </div>
              </div>

              {/* MASTER SCENE CONCEPT ART AREA */}
              <div className="bg-slate-800/30 p-3 rounded border border-slate-700/30 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Concept Art (Cena Master)
                    </h4>
                    <div className="flex items-center gap-1">
                      <select 
                          value={imageStyle} 
                          onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                          className="text-[10px] bg-slate-800 border border-slate-600 text-slate-300 rounded px-1 py-0.5 outline-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="BW_SKETCH">Sketch</option>
                          <option value="COLOR_STORYBOARD">Color</option>
                          <option value="REALISTIC">Realista</option>
                        </select>
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleGenerateMasterImage(); }}
                          disabled={generatingMaster}
                          className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded flex items-center gap-1"
                      >
                          {generatingMaster ? "Gerando..." : "Gerar"}
                      </button>
                    </div>
                </div>
                
                <div className="flex-1 bg-black/40 rounded border border-slate-700/50 flex items-center justify-center min-h-[120px] overflow-hidden relative group/master">
                    {scene.sceneImageUrl ? (
                      <>
                          <img 
                            src={scene.sceneImageUrl} 
                            alt="Concept Art" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90" 
                            onClick={() => setViewingImage(scene.sceneImageUrl!)}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/master:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Ver Tela Cheia</span>
                          </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Nenhuma imagem gerada</span>
                    )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2 mt-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 pl-1 border-l-2 border-indigo-500">
                  Lista de Planos (Shot List)
                </h4>
                
                {hasShots && (
                  <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Estilo dos Planos:</span>
                      <select 
                        value={imageStyle} 
                        onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                        className="text-xs bg-slate-800 border border-slate-600 text-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="BW_SKETCH">✏️ Storyboard P&B</option>
                        <option value="COLOR_STORYBOARD">🎨 Storyboard Color</option>
                        <option value="REALISTIC">📸 Fotonovela (Realista)</option>
                      </select>
                  </div>
                )}
              </div>
              
              {!hasShots && !loadingShots && (
                <div className="flex flex-col items-center justify-center py-8 bg-slate-800/50 rounded border border-dashed border-slate-600">
                    <p className="text-slate-400 text-sm mb-3">Decupagem técnica pendente.</p>
                    <button 
                      onClick={triggerGeneration}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Gerar Lista de Planos (IA)
                    </button>
                </div>
              )}

              {loadingShots && (
                <div className="flex flex-col items-center justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-indigo-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs text-slate-500 animate-pulse">Criando decupagem e visual prompts...</span>
                </div>
              )}

              {hasShots && (
                  <div className="space-y-1">
                    {(isEditing ? editedScene : scene).shots.map((shot, idx) => (
                      <ShotItem 
                        key={idx} 
                        shot={shot} 
                        isEditing={isEditing}
                        apiKey={apiKey}
                        globalStyle={imageStyle}
                        onUpdate={(updatedShot) => {
                          const newShots = [...editedScene.shots];
                          newShots[idx] = updatedShot;
                          setEditedScene({...editedScene, shots: newShots});
                          // Immediate save if not in global edit mode to persist image generation
                          if (!isEditing) {
                            onUpdateScene({...scene, shots: newShots});
                          }
                        }}
                        onViewImage={setViewingImage}
                      />
                    ))}
                    {isEditing && (
                      <button 
                        onClick={() => {
                            const nextNum = editedScene.shots.length + 1;
                            const newShot: Shot = {
                              shot_number: nextNum,
                              size: 'MS', angle: 'Eye Level', movement: 'Static',
                              subject: '...', description: '...', background_details: '...', visual_prompt: '...'
                            };
                            setEditedScene({...editedScene, shots: [...editedScene.shots, newShot]});
                        }}
                        className="w-full py-2 border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-xs rounded mt-2"
                      >
                        + Adicionar Plano Manualmente
                      </button>
                    )}
                  </div>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
};
