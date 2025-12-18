
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

export interface BreakdownResult {
  title: string;
  author: string;
  logline: string;
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