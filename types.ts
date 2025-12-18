
export interface Character {
  name: string;
  role: 'Protagonista' | 'Elenco de Apoio' | 'Figuração';
  actor_name?: string; // New: Suggested actor/actress
  contract_status?: string; // New: e.g., "Em Negociação", "Assinado"
  costume_suggestion: string; // Description of clothing AND physical appearance
  color_palette_hex: string; // Hex code for the character's visual identity
  notes?: string;
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

// v1.5: Tipos para Cenários
export interface Cenario {
  nome: string;
  tipo: 'Interior' | 'Exterior' | 'Misto';
  descricao: string;
  ambientacao: string;
  iluminacao_sugerida: string;
  referencias_visuais?: string;
  cenas_associadas: string[];
}

// v1.5: Tipos para Objetos de Cena
export interface ObjetoCena {
  nome: string;
  categoria: 'Decoração' | 'Ação' | 'Figurino' | 'Veículo' | 'Alimento' | 'Documento' | 'Outros';
  descricao: string;
  quantidade: number;
  cenas_associadas: string[];
  importancia: 'Essencial' | 'Importante' | 'Decorativo';
  notas?: string;
}

// v1.5: Tipos para Locações
export interface Locacao {
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
  // v1.5: Novos campos
  resumos?: Resumos;
  cenarios?: Cenario[];
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
