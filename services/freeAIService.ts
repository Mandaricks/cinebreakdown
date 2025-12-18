/**
 * Serviço de IA Gratuito - Alternativas sem custo
 * 
 * Opções:
 * 1. Groq (gratuito, muito rápido) - Llama 3.2, Mixtral
 * 2. OpenRouter (modelos gratuitos) - Llama, Mistral
 * 3. HuggingFace Inference API (gratuito com limites)
 * 
 * Para imagens: Pollinations.ai (100% gratuito)
 */

import { BreakdownResult, Character, Scene, Shot } from '../types';
import { generateStoryboardImage, generateCharacterImage } from './imageService';

// URLs das APIs
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Modelos gratuitos
const FREE_MODELS = {
  groq: {
    fast: 'llama-3.2-3b-preview',      // Mais rápido
    balanced: 'llama-3.2-11b-text-preview', // Balanceado
    best: 'llama-3.3-70b-versatile'    // Melhor qualidade
  },
  openrouter: {
    free: 'meta-llama/llama-3.2-3b-instruct:free',
    mistral: 'mistralai/mistral-7b-instruct:free'
  }
};

export type AIProvider = 'groq' | 'openrouter' | 'gemini';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

/**
 * Chama a API de texto (Groq ou OpenRouter)
 */
const callTextAPI = async (
  messages: { role: string; content: string }[],
  config: AIConfig,
  jsonMode: boolean = true
): Promise<string> => {
  const { provider, apiKey, model } = config;

  let url: string;
  let headers: Record<string, string>;
  let modelToUse: string;

  switch (provider) {
    case 'groq':
      url = GROQ_API_URL;
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      modelToUse = model || FREE_MODELS.groq.balanced;
      break;

    case 'openrouter':
      url = OPENROUTER_API_URL;
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'CineBreakdown'
      };
      modelToUse = model || FREE_MODELS.openrouter.free;
      break;

    default:
      throw new Error(`Provider ${provider} não suportado neste serviço`);
  }

  const body: any = {
    model: modelToUse,
    messages,
    temperature: 0.4,
    max_tokens: 4096
  };

  // JSON mode (se disponível)
  if (jsonMode && provider === 'groq') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
    throw new Error(error.error?.message || `Erro ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

/**
 * Analisa estrutura do roteiro usando API gratuita
 */
export const analyzeStructureFree = async (
  scriptText: string,
  config: AIConfig
): Promise<BreakdownResult> => {
  const systemPrompt = `Você é um experiente 1º Assistente de Direção (AD) brasileiro.
Analise o roteiro e retorne um JSON com esta estrutura EXATA:

{
  "title": "título do projeto",
  "author": "autor se identificável",
  "logline": "resumo em uma frase",
  "total_scenes": número,
  "characters_metadata": [
    {
      "name": "NOME",
      "role": "Protagonista" ou "Elenco de Apoio" ou "Figuração",
      "costume_suggestion": "descrição do figurino e aparência",
      "color_palette_hex": "#hexcolor"
    }
  ],
  "unique_locations": ["local1", "local2"],
  "scenes": [
    {
      "scene_number": "1",
      "header": "INT. LOCAL - DIA",
      "location": "local",
      "time": "DIA/NOITE",
      "characters": ["NOME1", "NOME2"],
      "props": ["objeto1", "objeto2"],
      "summary": "resumo da cena",
      "estimated_duration_mins": número
    }
  ]
}

IMPORTANTE:
- Extraia TODAS as cenas
- Inclua objetos de cena deduzidos pelo contexto
- Descreva figurinos com detalhes visuais
- Responda APENAS com o JSON, sem explicações`;

  const response = await callTextAPI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: scriptText }
  ], config, true);

  // Tenta extrair JSON da resposta
  let jsonStr = response;
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const result = JSON.parse(jsonStr) as BreakdownResult;
  result.scenes = result.scenes.map(s => ({ ...s, shots: [] }));
  return result;
};

/**
 * Gera shot list para uma cena usando API gratuita
 */
export const generateShotsFree = async (
  scene: Scene,
  characters: Character[],
  config: AIConfig
): Promise<Shot[]> => {
  const characterDescriptions = characters
    .filter(c => scene.characters.includes(c.name))
    .map(c => `${c.name}: ${c.costume_suggestion}`)
    .join('\n');

  const systemPrompt = `Você é um Diretor de Fotografia criando uma decupagem.
Gere uma lista de planos (shots) para esta cena.

CENA: ${scene.header}
RESUMO: ${scene.summary}
OBJETOS: ${scene.props.join(', ')}
PERSONAGENS:
${characterDescriptions}

Retorne um JSON com esta estrutura:
{
  "shots": [
    {
      "shot_number": 1,
      "size": "PLANO GERAL / MÉDIO / CLOSE-UP / etc",
      "angle": "altura dos olhos / contra-plongée / plongée",
      "movement": "estático / travelling / pan / etc",
      "subject": "quem ou o quê está em foco",
      "description": "descrição da ação no plano",
      "background_details": "o que aparece ao fundo",
      "visual_prompt": "prompt em INGLÊS para gerar imagem do storyboard"
    }
  ]
}

Gere 4-8 planos que cubram a cena cinematograficamente.
Responda APENAS com o JSON.`;

  const response = await callTextAPI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Gere a decupagem para a cena ${scene.scene_number}` }
  ], config, true);

  let jsonStr = response;
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const result = JSON.parse(jsonStr);
  return result.shots || [];
};

/**
 * Gera imagem de storyboard usando Pollinations.ai (GRATUITO)
 */
export const generateShotImage = async (shot: Shot, sceneLocation: string): Promise<string> => {
  return generateStoryboardImage(shot.description, shot.size, sceneLocation);
};

/**
 * Gera imagem de personagem usando Pollinations.ai (GRATUITO)
 */
export const generateCharacterArt = async (character: Character): Promise<string> => {
  return generateCharacterImage(
    character.name,
    character.caracterizacao?.biotipo || 'person',
    character.costume_suggestion
  );
};

/**
 * Testa conexão com a API
 */
export const testConnection = async (config: AIConfig): Promise<boolean> => {
  try {
    const response = await callTextAPI([
      { role: 'user', content: 'Responda apenas: OK' }
    ], config, false);
    return response.toLowerCase().includes('ok');
  } catch (e) {
    console.error('Teste de conexão falhou:', e);
    return false;
  }
};

/**
 * Obtém instruções para conseguir API key gratuita
 */
export const getApiKeyInstructions = (provider: AIProvider): string => {
  switch (provider) {
    case 'groq':
      return `🚀 Groq - API Gratuita e Rápida

1. Acesse: https://console.groq.com
2. Crie uma conta (gratuita)
3. Vá em API Keys
4. Clique em "Create API Key"
5. Copie a chave

✅ Tier gratuito: 30 req/min, 14.400/dia
✅ Modelos: Llama 3.2, Mixtral
✅ Muito rápido!`;

    case 'openrouter':
      return `🌐 OpenRouter - Múltiplos Modelos Gratuitos

1. Acesse: https://openrouter.ai
2. Crie uma conta
3. Vá em Keys
4. Crie uma nova chave

✅ Modelos gratuitos: Llama 3.2, Mistral
✅ Créditos iniciais gratuitos`;

    case 'gemini':
      return `✨ Google Gemini - API Gratuita

1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com conta Google
3. Clique em "Create API Key"
4. Copie a chave

✅ Tier gratuito generoso
✅ Modelo mais avançado`;

    default:
      return 'Provider não reconhecido';
  }
};
