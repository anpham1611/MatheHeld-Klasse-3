import type { PlayerProfile } from '../types/game';

export type GameScoreKey = keyof PlayerProfile['scores'];

export interface GameCatalogEntry {
  name: string;
  icon: string;
  color: string;
  certificateDetail: string;
  scoreMode: 'running' | 'best';
}

// Exhaustive score registry: adding a profile score key requires one entry here.
// Score reports, certificate badges, and total Pkt aggregation derive from this catalog.
export const GAME_CATALOG: Record<GameScoreKey, GameCatalogEntry> = {
  minecraft: {
    name: 'Minecraft 3D Mathe-Welt',
    icon: '🧱🟩',
    color: 'from-emerald-600/30 to-teal-950/40 border-emerald-500/40 text-emerald-300',
    certificateDetail: 'Fläche & Quests',
    scoreMode: 'running',
  },
  number_line: {
    name: 'Zahlenstrahl bis 1000',
    icon: '🚀',
    color: 'from-blue-600/30 to-indigo-950/40 border-blue-500/40 text-blue-300',
    certificateDetail: 'H-Z-E Meister',
    scoreMode: 'best',
  },
  einmaleins: {
    name: 'Einmaleins & Division',
    icon: '⚡',
    color: 'from-amber-600/30 to-red-950/40 border-amber-500/40 text-amber-300',
    certificateDetail: 'Multiplikation',
    scoreMode: 'best',
  },
  euro_shop: {
    name: 'Euro & Cent Supermarkt',
    icon: '💶',
    color: 'from-teal-600/30 to-emerald-950/40 border-teal-500/40 text-teal-300',
    certificateDetail: 'Wechselgeld',
    scoreMode: 'best',
  },
  tower_math: {
    name: 'Schriftliches Rechnen',
    icon: '🏰',
    color: 'from-purple-600/30 to-indigo-950/40 border-purple-500/40 text-purple-300',
    certificateDetail: 'Mit Übertrag',
    scoreMode: 'best',
  },
  pokemon: {
    name: 'PokéMath Arena',
    icon: '⚡🐭',
    color: 'from-rose-600/30 to-red-950/40 border-rose-500/40 text-rose-300',
    certificateDetail: 'Mathe mit Pokémon',
    scoreMode: 'running',
  },
  logic_game: {
    name: 'Kleine Denker: Logik-Abenteuer',
    icon: '🧩🌈',
    color: 'from-fuchsia-600/30 to-rose-950/40 border-pink-500/40 text-pink-300',
    certificateDetail: 'Muster & Rätsel',
    scoreMode: 'running',
  },
  monsterparty: {
    name: 'Vorschulblock: Monsterparty',
    icon: '👾🌙',
    color: 'from-violet-600/30 to-indigo-950/40 border-fuchsia-500/40 text-fuchsia-300',
    certificateDetail: 'Formen & Schatten',
    scoreMode: 'best',
  },
  vehicle_puzzle: {
    name: 'Vorschulblock: Puzzle-Rätsel',
    icon: '🚗🚜',
    color: 'from-sky-600/30 to-blue-950/40 border-sky-500/40 text-sky-300',
    certificateDetail: 'Fahrzeuge & Formen',
    scoreMode: 'best',
  },
  sudoku: {
    name: 'Vorschulblock: Sudoku',
    icon: '🔢🧩',
    color: 'from-amber-600/30 to-orange-950/40 border-amber-500/40 text-amber-300',
    certificateDetail: 'Zahlen & Logik',
    scoreMode: 'best',
  },
  mathbrick: {
    name: 'MathBrick Builder',
    icon: '🧱🛠️',
    color: 'from-cyan-600/30 to-slate-950/40 border-cyan-500/40 text-cyan-300',
    certificateDetail: 'Mathe & 3D-Bauen',
    scoreMode: 'running',
  },
  roboforge: {
    name: 'RoboForge: Mathe-Rettung',
    icon: '🤖🌳',
    color: 'from-emerald-600/30 to-sky-950/40 border-emerald-500/40 text-emerald-300',
    certificateDetail: 'Mathe & Code',
    scoreMode: 'running',
  },
  maze_discovery: {
    name: 'Wegfinder 3D',
    icon: '🤖🧩',
    color: 'from-cyan-600/30 to-violet-950/40 border-cyan-500/40 text-cyan-300',
    certificateDetail: 'Planen & Labyrinth',
    scoreMode: 'best',
  },
};

export const GAME_SCORE_KEYS = Object.keys(GAME_CATALOG) as GameScoreKey[];
