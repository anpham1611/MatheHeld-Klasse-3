export type GameScreen = 
  | 'title' 
  | 'world_map' 
  | 'minecraft'
  | 'number_line' 
  | 'einmaleins' 
  | 'euro_shop' 
  | 'tower_math' 
  | 'pokemon'
  | 'certificate';

export type Language = 'de' | 'vi';

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
  };
  totalProblemsSolved: number;
}

export interface SoundSettings {
  muted: boolean;
  sfxVolume: number;
  bgmVolume: number;
}

export type MathTopic = 'stellenwert' | 'einmaleins' | 'division' | 'euro' | 'schriftlich';
