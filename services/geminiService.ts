import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BreakdownResult, Shot, Character, Scene } from "../types";

export interface InputFile {
  data: string; // Text content OR Base64 string
  mimeType: string; // 'text/plain' or 'application/pdf'
}

export type ImageStyle = 'BW_SKETCH' | 'COLOR_STORYBOARD' | 'REALISTIC';

// Detecta se está em produção (Vercel) ou desenvolvimento local
const isProduction = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

// Schemas para respostas estruturadas
const structureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    author: { type: Type.STRING },
    logline: { type: Type.STRING },
    total_scenes: { type: Type.INTEGER },
    characters_metadata: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING, enum: ['Protagonista', 'Elenco de Apoio', 'Figuração'] },
          costume_suggestion: { type: Type.STRING },
          color_palette_hex: { type: Type.STRING },
        },
        required: ["name", "role", "costume_suggestion", "color_palette_hex"]
      }
    },
    unique_locations: { type: Type.ARRAY, items: { type: Type.STRING } },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scene_number: { type: Type.STRING },
          header: { type: Type.STRING },
          location: { type: Type.STRING },
          time: { type: Type.STRING },
          characters: { type: Type.ARRAY, items: { type: Type.STRING } },
          props: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          estimated_duration_mins: { type: Type.NUMBER },
        },
        required: ["scene_number", "header", "location", "time", "characters", "summary", "props"]
      }
    }
  },
  required: ["scenes", "characters_metadata", "unique_locations"]
};

const shotsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    shots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          shot_number: { type: Type.INTEGER },
          size: { type: Type.STRING },
          angle: { type: Type.STRING },
          movement: { type: Type.STRING },
          subject: { type: Type.STRING },
          description: { type: Type.STRING },
          background_details: { type: Type.STRING },
          visual_prompt: { type: Type.STRING }
        },
        required: ["shot_number", "size", "angle", "movement", "subject", "description", "visual_prompt", "background_details"]
      }
    }
  },
  required: ["shots"]
};

const updatePromptsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    updated_prompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          shot_number: { type: Type.INTEGER },
          visual_prompt: { type: Type.STRING }
        },
        required: ["shot_number", "visual_prompt"]
      }
    }
  },
  required: ["updated_prompts"]
};

// Função auxiliar para fazer requisições à API serverless (produção)
const callServerlessApi = async (action: string, payload: any, apiKey: string) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
};

// STAGE 1: Fast Structure Analysis
export const analyzeStructure = async (input: InputFile, apiKey: string): Promise<BreakdownResult> => {
  if (!apiKey) throw new Error("API Key não fornecida. Por favor, insira sua chave do Google Gemini.");

  // Em produção, usa a API serverless; em desenvolvimento, chama diretamente
  if (isProduction()) {
    return callServerlessApi('analyzeStructure', { input }, apiKey);
  }

  // Desenvolvimento local - chamada direta
  let ai;
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e: any) {
    throw new Error(`Erro ao inicializar API: ${e.message || 'Verifique se a API Key está correta'}`);
  }
  
  const systemPrompt = `
    Atue como um experiente 1º Assistente de Direção (AD) e Diretor de Arte Brasileiro.
    TAREFA: Analisar o roteiro para estruturar a produção.
    IDIOMA DE SAÍDA: **PORTUGUÊS (PT-BR)**.
    CLASSIFICAÇÃO DE ELENCO (Use estritamente estes termos):
    - **Protagonista**: Personagens principais.
    - **Elenco de Apoio**: Personagens com falas ou relevância, mas secundários.
    - **Figuração**: Personagens de fundo, sem nome próprio ou falas relevantes.
    INSTRUÇÕES CRITICAS DE INFERÊNCIA:
    1. **Objetos de Cena (Props):** Não liste apenas o que está escrito. Deduza objetos lógicos pelo contexto.
       - Ex: Se é uma "Igreja/Casamento", inclua: "Bíblia, Velas, Cálice, Flores de Altar".
    2. **Figurino & Aparência:**
       - Descreva o figurino completo E características físicas marcantes.
       - Ex: "Padre idoso, barba branca, batina cerimonial preta com dourado, Estola bordada".
    Se o input for PDF, extraia as cenas mesmo com formatação quebrada.
  `;

  let userContentPart;
  if (input.mimeType === 'application/pdf') {
    userContentPart = { inlineData: { data: input.data, mimeType: 'application/pdf' } };
  } else {
    userContentPart = { text: input.data };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'user', parts: [userContentPart] }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: structureSchema,
      temperature: 0.4,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  const result = JSON.parse(text) as BreakdownResult;
  result.scenes = result.scenes.map(s => ({ ...s, shots: [] }));
  return result;
};

// STAGE 2: Detailed Shot Generation (Per Scene)
export const generateSceneShots = async (
  sceneNumber: string | number, 
  fullInput: InputFile, 
  sceneContext: any,
  globalCharacters: Character[],
  apiKey: string
): Promise<Shot[]> => {
  
  if (isProduction()) {
    return callServerlessApi('generateSceneShots', {
      sceneNumber,
      fullInput,
      sceneContext,
      globalCharacters,
    }, apiKey);
  }

  // Desenvolvimento local - chamada direta
  const ai = new GoogleGenAI({ apiKey });

  const sceneCharacterDetails = globalCharacters
    .filter(c => sceneContext.characters.includes(c.name) || sceneContext.characters.some((sc: string) => sc.includes(c.name)))
    .map(c => `${c.name} (${c.actor_name || 'Ator não definido'}): ${c.costume_suggestion}`)
    .join('\n');

  const systemPrompt = `
    Atue como um Diretor de Fotografia (DoP).
    TAREFA: Criar a DECUPAGEM (Shot List) para a CENA ${sceneNumber}.
    IDIOMA:
    - description, subject: PORTUGUÊS (PT-BR).
    - visual_prompt: INGLÊS.
    CONTEXTO DA CENA:
    Header: ${sceneContext.header}
    Resumo: ${sceneContext.summary}
    Objetos: ${sceneContext.props.join(', ')}
    **CONSISTÊNCIA VISUAL DE PERSONAGENS (CRÍTICO):**
    Use estas descrições exatas para gerar o 'visual_prompt':
    ${sceneCharacterDetails}
    INSTRUÇÕES:
    1. No 'visual_prompt', SEMPRE descreva o personagem baseado na lista acima (roupas, aparência) para manter consistência entre planos.
    2. Se houver objetos (props) importantes, inclua-os no prompt visual.
  `;

  let userContentPart;
  if (fullInput.mimeType === 'application/pdf') {
    userContentPart = { inlineData: { data: fullInput.data, mimeType: 'application/pdf' } };
  } else {
    userContentPart = { text: fullInput.data };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'user', parts: [userContentPart] }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: shotsSchema,
      temperature: 0.5,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response");
  
  const result = JSON.parse(text);
  return result.shots || [];
};

// STAGE 2.5: Update Existing Shots with New Characters
export const updateShotsWithNewCharacters = async (
  scene: Scene,
  globalCharacters: Character[],
  apiKey: string
): Promise<Shot[]> => {
  if (!scene.shots || scene.shots.length === 0) return [];

  if (isProduction()) {
    const result = await callServerlessApi('updateShotsWithNewCharacters', {
      scene,
      globalCharacters,
    }, apiKey);
    
    if (Array.isArray(result)) return result;
    
    if (result.updated_prompts) {
      const updatesMap = new Map<number, string>();
      result.updated_prompts.forEach((p: any) => updatesMap.set(p.shot_number, p.visual_prompt));
      return scene.shots.map(shot => {
        if (updatesMap.has(shot.shot_number)) {
          return { ...shot, visual_prompt: updatesMap.get(shot.shot_number)!, imageUrl: undefined };
        }
        return shot;
      });
    }
    return scene.shots;
  }

  // Desenvolvimento local - chamada direta
  const ai = new GoogleGenAI({ apiKey });

  const sceneCharacterDetails = globalCharacters
    .filter(c => scene.characters.includes(c.name) || scene.characters.some((sc: string) => sc.includes(c.name)))
    .map(c => `${c.name}: ${c.costume_suggestion}`)
    .join('\n');

  const shotsContext = scene.shots.map(s => `Shot ${s.shot_number}: [Action: ${s.description}] [Current Prompt: ${s.visual_prompt}]`).join('\n');

  const systemPrompt = `
    TASK: Rewrite the 'visual_prompt' (English) for the provided shots to MATCH the UPDATED character descriptions exactly.
    UPDATED CHARACTER DESCRIPTIONS (Apply these strictly):
    ${sceneCharacterDetails}
    INSTRUCTIONS:
    1. Keep the original camera angle, shot size, and action/subject described in the shot.
    2. ONLY update the physical appearance and clothing of the characters in the 'visual_prompt' to match the "UPDATED CHARACTER DESCRIPTIONS".
    3. Return a JSON with the updated visual_prompt for each shot_number.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'user', parts: [{ text: shotsContext }] }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: updatePromptsSchema,
      temperature: 0.3,
    }
  });

  const text = response.text;
  if (!text) return scene.shots;

  try {
    const result = JSON.parse(text);
    const updatesMap = new Map<number, string>();
    result.updated_prompts.forEach((p: any) => updatesMap.set(p.shot_number, p.visual_prompt));

    return scene.shots.map(shot => {
      if (updatesMap.has(shot.shot_number)) {
        return { ...shot, visual_prompt: updatesMap.get(shot.shot_number)!, imageUrl: undefined };
      }
      return shot;
    });
  } catch (e) {
    console.error("Failed to parse prompt updates", e);
    return scene.shots;
  }
};

// STAGE 3: Image Generation
export const generateImage = async (
  prompt: string, 
  style: ImageStyle, 
  apiKey: string
): Promise<string> => {
  
  if (isProduction()) {
    const result = await callServerlessApi('generateImage', { prompt, style }, apiKey);
    if (result.image) return result.image;
    throw new Error("Could not generate image");
  }

  // Desenvolvimento local - chamada direta
  const ai = new GoogleGenAI({ apiKey });
  
  let stylePrefix = "";
  switch(style) {
    case 'BW_SKETCH':
      stylePrefix = "Rough charcoal storyboard sketch, black and white, loose expressive lines, cinematic composition. ";
      break;
    case 'COLOR_STORYBOARD':
      stylePrefix = "Digital concept art, cinematic storyboard, dramatic lighting, vibrant colors, detailed environment. ";
      break;
    case 'REALISTIC':
      stylePrefix = "Cinematic film still, 4k, highly detailed, photorealistic, shot on 35mm lens, movie frame, atmospheric lighting. ";
      break;
  }

  const finalPrompt = stylePrefix + prompt;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-preview-image-generation',
    contents: {
      parts: [{ text: finalPrompt }]
    },
    config: {
      responseModalities: ["image", "text"],
    }
  });

  let base64Image = "";
  if (response.candidates && response.candidates[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data || "";
        break;
      }
    }
  }

  if (!base64Image) {
    throw new Error("Could not generate image");
  }

  return `data:image/png;base64,${base64Image}`;
};
