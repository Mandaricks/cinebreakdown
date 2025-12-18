/**
 * Serviço de Geração de Imagens - 100% Gratuito
 * 
 * Usa Pollinations.ai - não precisa de API key!
 * Documentação: https://pollinations.ai
 */

// Pollinations.ai - Completamente gratuito
const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/';

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  seed?: number;
  model?: 'flux' | 'turbo';  // flux é mais detalhado, turbo é mais rápido
  nologo?: boolean;
}

/**
 * Gera uma imagem usando Pollinations.ai (gratuito)
 * @param prompt Descrição da imagem em inglês
 * @param options Opções de tamanho e modelo
 * @returns URL da imagem gerada
 */
export const generateImage = async (
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<string> => {
  const {
    width = 512,
    height = 512,
    seed = Math.floor(Math.random() * 1000000),
    model = 'flux',
    nologo = true
  } = options;

  // Encode do prompt para URL
  const encodedPrompt = encodeURIComponent(prompt);
  
  // Constrói a URL com parâmetros
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    seed: seed.toString(),
    model,
    nologo: nologo.toString()
  });

  const imageUrl = `${POLLINATIONS_URL}${encodedPrompt}?${params.toString()}`;
  
  return imageUrl;
};

/**
 * Gera imagem de conceito para um personagem
 */
export const generateCharacterImage = async (
  characterName: string,
  description: string,
  costume: string
): Promise<string> => {
  const prompt = `cinematic portrait, ${characterName}, ${description}, wearing ${costume}, professional film production still, dramatic lighting, high quality, detailed`;
  
  return generateImage(prompt, {
    width: 512,
    height: 768,
    model: 'flux'
  });
};

/**
 * Gera imagem de storyboard para uma cena
 */
export const generateStoryboardImage = async (
  sceneDescription: string,
  shotType: string,
  location: string
): Promise<string> => {
  const prompt = `storyboard frame, ${shotType}, ${sceneDescription}, location: ${location}, cinematic composition, film production, professional cinematography`;
  
  return generateImage(prompt, {
    width: 768,
    height: 432,  // Aspecto 16:9 aproximado
    model: 'flux'
  });
};

/**
 * Gera imagem de referência para cenário
 */
export const generateScenarioImage = async (
  scenarioName: string,
  atmosphere: string,
  lighting: string,
  elements: string[]
): Promise<string> => {
  const elementsStr = elements.join(', ');
  const prompt = `film set design, ${scenarioName}, ${atmosphere} atmosphere, ${lighting} lighting, featuring ${elementsStr}, cinematic location, production design reference, high detail`;
  
  return generateImage(prompt, {
    width: 768,
    height: 512,
    model: 'flux'
  });
};

/**
 * Gera imagem de referência para figurino
 */
export const generateCostumeImage = async (
  characterName: string,
  costumeDescription: string,
  style: string,
  colors: string[]
): Promise<string> => {
  const colorsStr = colors.join(' and ');
  const prompt = `fashion costume design, ${characterName} character, ${costumeDescription}, ${style} style, color palette: ${colorsStr}, costume reference for film, full body view, detailed fabric textures`;
  
  return generateImage(prompt, {
    width: 512,
    height: 768,
    model: 'flux'
  });
};

/**
 * Testa se a API está funcionando
 */
export const testImageGeneration = async (): Promise<boolean> => {
  try {
    const testUrl = await generateImage('test image', { width: 64, height: 64 });
    // Verifica se a URL foi gerada corretamente
    return testUrl.includes('pollinations.ai');
  } catch (e) {
    console.error('Erro ao testar geração de imagem:', e);
    return false;
  }
};
