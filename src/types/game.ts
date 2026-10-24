export type GameScreen = 
  | 'title' 
  | 'world_map' 
  | 'minecraft'
  | 'number_line' 
  | 'einmaleins' 
  | 'euro_shop' 
  | 'tower_math' 
  | 'pokemon'
  | 'logic_game'
  | 'mathbrick'
  | 'roboforge'
  | 'certificate';

export type Language = 'de';

export type CharacterAvatar = 'fuchs' | 'eule' | 'hase' | 'baer' | 'drache';

export interface PlayerProfile {
  name: string;
  avatar: CharacterAvatar;
  stars: number;
  euroCoins: number;
  currentStreak: number;
  highestStreak: number;
  unlockedHats: string[];
  equippedHat: string;
  capturedPokemon?: string[];
  scores: {
    minecraft?: number;
    number_line: number;
    einmaleins: number;
    euro_shop: number;
    tower_math: number;
    pokemon?: number;
    logic_game?: number;
    mathbrick?: number;
    roboforge?: number;
  };
  totalProblemsSolved: number;
}

export interface GameScoreDetail {
  gameKey: string;
  highScore: number;
  timesPlayed: number;
  problemsSolved: number;
  starsEarned: number;
  coinsEarned: number;
  levelReached: number;
  details?: Record<string, any>;
  updatedAt?: string;
}

export interface DbEngineInfo {
  engine: 'sqlite' | 'turso';
  configuredEngine: string;
  hasTursoUrl: boolean;
  databaseTarget: string;
}

export interface SavedPlayerSummary {
  id: number;
  name: string;
  avatar: CharacterAvatar;
  stars: number;
  euroCoins: number;
  totalProblemsSolved: number;
  bestGameScore: number;
  updatedAt: string;
}

export interface SoundSettings {
  muted: boolean;
  sfxVolume: number;
  bgmVolume: number;
}

export type MathTopic = 'stellenwert' | 'einmaleins' | 'division' | 'euro' | 'schriftlich';
