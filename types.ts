
export interface Character {
  name: string;
  role: 'Protagonista' | 'Elenco de Apoio' | 'Figuração';
  actor_name?: string; // Suggested actor/actress
  contract_status?: string; // e.g., "Em Negociação", "Assinado"
  costume_suggestion: string; // Description of clothing AND physical appearance
  color_palette_hex: string; // Hex code for the character's visual identity
  notes?: string;
  // v1.5: Campos expandidos para caracterização detalhada
  caracterizacao?: {
    etnia?: string;          // Ex: "Negra", "Branca", "Asiática", "Latina"
    idade_aparente?: string; // Ex: "25-30 anos"
    biotipo?: string;        // Ex: "Alta e magra", "Baixa e robusta"
    cabelo?: string;         // Ex: "Cabelos cacheados pretos"
    olhos?: string;          // Ex: "Olhos castanhos escuros"
    tracos_distintivos?: string; // Ex: "Cicatriz na mão esquerda"
    personalidade?: string;  // Ex: "Ansiosa, perfeccionista"
    classe_social?: string;  // Ex: "Alta", "Média", "Baixa"
    contexto_social?: string; // Ex: "Família tradicional rica"
  };
}

// v1.5: Figurino detalhado e separado por cena
export interface Figurino {
  id: string;
  personagem: string;
  cenas: string[];         // Cenas onde usa este figurino
  descricao: string;
  pecas: string[];         // Ex: ["Vestido de noiva branco", "Véu bordado"]
  acessorios: string[];    // Ex: ["Brincos de pérola", "Aliança de ouro"]
  paleta_cores: string[];  // Hex codes
  estilo: string;          // Ex: "Clássico", "Moderno", "Vintage"
  simbolismo?: string;     // Ex: "O branco representa pureza, mas o véu rasgado sugere..."
  notas_producao?: string; // Ex: "Precisa de 2 cópias para cena da chuva"
}

// v1.5: Cenário detalhado
export interface Cenario {
  id: string;
  nome: string;
  tipo: 'Interior' | 'Exterior' | 'Misto';
  localizacao: string;     // Ex: "Igreja Matriz do centro"
  epoca: string;           // Ex: "Contemporâneo", "Anos 70"
  atmosfera: string;       // Ex: "Solene, tradicional"
  elementos_principais: string[]; // Ex: ["Altar", "Vitrais", "Bancos de madeira"]
  iluminacao: string;      // Ex: "Luz natural dos vitrais, velas"
  som_ambiente?: string;   // Ex: "Órgão tocando ao fundo"
  simbolismo?: string;     // Ex: "A igreja representa tradição vs. liberdade"
  referencias_visuais?: string[]; // URLs de imagens de referência
  notas_tecnicas?: string; // Ex: "Verificar permissão para filmar"
  cenas_associadas: string[];
}

// v1.5: Elenco - gestão de casting
export interface Elenco {
  personagem: string;
  ator_confirmado?: string;
  atores_considerados?: string[];
  status: 'Aberto' | 'Em Negociação' | 'Confirmado' | 'Indisponível';
  cache_diaria?: string;
  dias_filmagem?: number;
  disponibilidade?: string;
  notas_casting?: string;
}

export interface Prop {
  name: string;
  quantity?: number;
  notes?: string;
}

export interface Shot {
  shot_number: number;
  size: string; // e.g., "Close-Up (CU)", "Wide Shot (WS)", "Two-Shot"
  angle: string; // e.g., "Eye Level", "Low Angle", "High Angle"
  movement: string; // e.g., "Static", "Dolly In", "Pan Right", "Handheld"
  subject: string; // Who or what is the focus
  description: string; // Specific action in this shot
  background_details: string; // What is visible behind (e.g., stained glass, blur)
  visual_prompt: string; // AI Image prompt for this specific shot
  imageUrl?: string; // URL/Base64 of the generated storyboard image
}

export interface Scene {
  scene_number: number | string;
  header: string;
  location: string;
  time: string;
  characters: string[];
  props: string[];
  summary: string;
  estimated_duration_mins: number;
  shots: Shot[]; // Detailed shot list. If empty, it means it hasn't been generated yet.
  sceneImageUrl?: string; // Master concept art for the whole scene
}

// v1.5: Novos tipos para Resumos
export interface Resumos {
  logline: string;       // Uma frase que resume a essência do filme
  sinopse: string;       // Resumo curto (1-2 parágrafos)
  argumento: string;     // Resumo médio (1-2 páginas)
  resumo: string;        // Resumo completo e detalhado
}

// v1.5: Tipos para Objetos de Cena
export interface ObjetoCena {
  id?: string;
  nome: string;
  categoria: 'Decoração' | 'Ação' | 'Figurino' | 'Veículo' | 'Alimento' | 'Documento' | 'Outros';
  descricao: string;
  quantidade: number;
  cenas_associadas: string[];
  importancia: 'Essencial' | 'Importante' | 'Decorativo';
  simbolismo?: string;   // Ex: "A aliança representa o compromisso que será quebrado"
  notas?: string;
}

// v1.5: Tipos para Locações
export interface Locacao {
  id?: string;
  nome: string;
  tipo_espaco: 'Interior' | 'Exterior';
  endereco_sugerido?: string;
  caracteristicas: string;
  necessidades_tecnicas?: string;
  cenas_associadas: string[];
  notas?: string;
}

export interface BreakdownResult {
  title: string;
  author: string;
  logline: string;
  // v1.5: Novos campos para produção
  resumos?: Resumos;
  cenarios?: Cenario[];
  figurinos?: Figurino[];
  elenco?: Elenco[];
  objetos_cena?: ObjetoCena[];
  locacoes?: Locacao[];
  // Campos existentes
  scenes: Scene[];
  total_scenes: number;
  characters_metadata: Character[]; // Detailed character info
  unique_locations: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
