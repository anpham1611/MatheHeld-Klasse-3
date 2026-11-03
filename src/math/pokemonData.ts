import { HOENN_POKEMON, JOHTO_POKEMON } from './pokemonRegionalData.js';

export type PokemonAttackStyle = 'physical' | 'ranged';

export interface Pokemon {
  id: string;
  pokedexNo: number;
  nameDe: string;
  typeDe: string;
  typeIcon: string;
  badgeBg: string;
  themeColor: string;
  sprite: string;
  maxHp: number;
  baseCatchRate: number;
  attackStyle: PokemonAttackStyle;
  moveDe: string;
  habitatDe: string;
  rarity: 'common' | 'rare' | 'legendary';
  legacyOnly?: boolean;
}

export const MAX_CAPTURED_POKEMON = 100;
export const KANTO_POKEDEX_COUNT = 151;
export const JOHTO_POKEDEX_COUNT = 100;
export const HOENN_POKEDEX_COUNT = 135;
export const NATIONAL_POKEDEX_COUNT = KANTO_POKEDEX_COUNT + JOHTO_POKEDEX_COUNT + HOENN_POKEDEX_COUNT;

type PokemonType =
  | 'Normal' | 'Fighting' | 'Flying' | 'Poison' | 'Ground' | 'Rock' | 'Bug'
  | 'Ghost' | 'Steel' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic'
  | 'Ice' | 'Dragon' | 'Dark' | 'Fairy';

interface TypeInfo {
  de: string;
  icon: string;
  badgeBg: string;
  color: string;
  sprite: string;
}

const TYPE_INFO: Record<PokemonType, TypeInfo> = {
  Normal: { de: 'Normal', icon: '⭐', badgeBg: 'bg-stone-500 text-white', color: '#78716c', sprite: '⭐🦊' },
  Fighting: { de: 'Kampf', icon: '🥊', badgeBg: 'bg-rose-700 text-white', color: '#be123c', sprite: '🥊🐒' },
  Flying: { de: 'Flug', icon: '🪽', badgeBg: 'bg-sky-500 text-white', color: '#0ea5e9', sprite: '🪽🦅' },
  Poison: { de: 'Gift', icon: '☠️', badgeBg: 'bg-fuchsia-700 text-white', color: '#a21caf', sprite: '☠️🐍' },
  Ground: { de: 'Boden', icon: '🏜️', badgeBg: 'bg-amber-700 text-white', color: '#b45309', sprite: '🏜️🐾' },
  Rock: { de: 'Gestein', icon: '🪨', badgeBg: 'bg-yellow-700 text-white', color: '#a16207', sprite: '🪨🦕' },
  Bug: { de: 'Käfer', icon: '🐛', badgeBg: 'bg-lime-600 text-slate-950', color: '#65a30d', sprite: '🐛🦋' },
  Ghost: { de: 'Geist', icon: '👻', badgeBg: 'bg-violet-700 text-white', color: '#6d28d9', sprite: '👻🦇' },
  Steel: { de: 'Stahl', icon: '⚙️', badgeBg: 'bg-slate-500 text-white', color: '#64748b', sprite: '⚙️🤖' },
  Fire: { de: 'Feuer', icon: '🔥', badgeBg: 'bg-orange-600 text-white', color: '#ea580c', sprite: '🔥🦎' },
  Water: { de: 'Wasser', icon: '💧', badgeBg: 'bg-blue-600 text-white', color: '#2563eb', sprite: '💧🐢' },
  Grass: { de: 'Pflanze', icon: '🍃', badgeBg: 'bg-emerald-600 text-white', color: '#059669', sprite: '🍃🐸' },
  Electric: { de: 'Elektro', icon: '⚡', badgeBg: 'bg-amber-400 text-amber-950', color: '#f59e0b', sprite: '⚡🐭' },
  Psychic: { de: 'Psycho', icon: '🔮', badgeBg: 'bg-purple-600 text-white', color: '#9333ea', sprite: '🔮🧠' },
  Ice: { de: 'Eis', icon: '❄️', badgeBg: 'bg-cyan-500 text-slate-950', color: '#06b6d4', sprite: '❄️🐧' },
  Dragon: { de: 'Drache', icon: '🐉', badgeBg: 'bg-indigo-700 text-white', color: '#4338ca', sprite: '🐉✨' },
  Dark: { de: 'Unlicht', icon: '🌙', badgeBg: 'bg-slate-700 text-white', color: '#334155', sprite: '🌙🦇' },
  Fairy: { de: 'Fee', icon: '💖', badgeBg: 'bg-pink-500 text-white', color: '#ec4899', sprite: '💖🧚' },
};

export type PokemonRow = readonly [number, string, string, string, number];

const KANTO_POKEMON: PokemonRow[] = [
  [1, 'bisasam', 'Bisasam', 'Grass/Poison', 45],
  [2, 'ivysaur', 'Bisaknosp', 'Grass/Poison', 60],
  [3, 'venusaur', 'Bisaflor', 'Grass/Poison', 80],
  [4, 'glumanda', 'Glumanda', 'Fire', 39],
  [5, 'charmeleon', 'Glutexo', 'Fire', 58],
  [6, 'charizard', 'Glurak', 'Fire/Flying', 78],
  [7, 'schiggy', 'Schiggy', 'Water', 44],
  [8, 'wartortle', 'Schillok', 'Water', 59],
  [9, 'blastoise', 'Turtok', 'Water', 79],
  [10, 'caterpie', 'Raupy', 'Bug', 45],
  [11, 'metapod', 'Safcon', 'Bug', 50],
  [12, 'butterfree', 'Smettbo', 'Bug/Flying', 60],
  [13, 'weedle', 'Hornliu', 'Bug/Poison', 40],
  [14, 'kakuna', 'Kokuna', 'Bug/Poison', 45],
  [15, 'beedrill', 'Bibor', 'Bug/Poison', 65],
  [16, 'pidgey', 'Taubsi', 'Normal/Flying', 40],
  [17, 'pidgeotto', 'Tauboga', 'Normal/Flying', 63],
  [18, 'pidgeot', 'Tauboss', 'Normal/Flying', 83],
  [19, 'rattata', 'Rattfratz', 'Normal', 30],
  [20, 'raticate', 'Rattikarl', 'Normal', 55],
  [21, 'spearow', 'Habitak', 'Normal/Flying', 40],
  [22, 'fearow', 'Ibitak', 'Normal/Flying', 65],
  [23, 'ekans', 'Rettan', 'Poison', 35],
  [24, 'arbok', 'Arbok', 'Poison', 60],
  [25, 'pikachu', 'Pikachu', 'Electric', 35],
  [26, 'raichu', 'Raichu', 'Electric', 60],
  [27, 'sandshrew', 'Sandan', 'Ground', 50],
  [28, 'sandslash', 'Sandamer', 'Ground', 75],
  [29, 'nidoran-f', 'Nidoran♀', 'Poison', 55],
  [30, 'nidorina', 'Nidorina', 'Poison', 70],
  [31, 'nidoqueen', 'Nidoqueen', 'Poison/Ground', 90],
  [32, 'nidoran-m', 'Nidoran♂', 'Poison', 46],
  [33, 'nidorino', 'Nidorino', 'Poison', 61],
  [34, 'nidoking', 'Nidoking', 'Poison/Ground', 81],
  [35, 'clefairy', 'Piepi', 'Fairy', 70],
  [36, 'clefable', 'Pixi', 'Fairy', 95],
  [37, 'vulpix', 'Vulpix', 'Fire', 38],
  [38, 'ninetales', 'Vulnona', 'Fire', 73],
  [39, 'pummeluff', 'Pummeluff', 'Normal/Fairy', 115],
  [40, 'wigglytuff', 'Knuddeluff', 'Normal/Fairy', 140],
  [41, 'zubat', 'Zubat', 'Poison/Flying', 40],
  [42, 'golbat', 'Golbat', 'Poison/Flying', 75],
  [43, 'oddish', 'Myrapla', 'Grass/Poison', 45],
  [44, 'gloom', 'Duflor', 'Grass/Poison', 60],
  [45, 'vileplume', 'Giflor', 'Grass/Poison', 75],
  [46, 'paras', 'Paras', 'Bug/Grass', 35],
  [47, 'parasect', 'Parasek', 'Bug/Grass', 60],
  [48, 'venonat', 'Bluzuk', 'Bug/Poison', 60],
  [49, 'venomoth', 'Omot', 'Bug/Poison', 70],
  [50, 'diglett', 'Digda', 'Ground', 10],
  [51, 'dugtrio', 'Digdri', 'Ground', 35],
  [52, 'meowth', 'Mauzi', 'Normal', 40],
  [53, 'persian', 'Snobilikat', 'Normal', 65],
  [54, 'psyduck', 'Enton', 'Water', 50],
  [55, 'golduck', 'Entoron', 'Water', 80],
  [56, 'mankey', 'Menki', 'Fighting', 40],
  [57, 'primeape', 'Rasaff', 'Fighting', 65],
  [58, 'growlithe', 'Fukano', 'Fire', 55],
  [59, 'arcanine', 'Arkani', 'Fire', 90],
  [60, 'poliwag', 'Quapsel', 'Water', 40],
  [61, 'poliwhirl', 'Quaputzi', 'Water', 65],
  [62, 'poliwrath', 'Quappo', 'Water/Fighting', 90],
  [63, 'abra', 'Abra', 'Psychic', 25],
  [64, 'kadabra', 'Kadabra', 'Psychic', 40],
  [65, 'alakazam', 'Simsala', 'Psychic', 55],
  [66, 'machop', 'Machollo', 'Fighting', 70],
  [67, 'machoke', 'Maschock', 'Fighting', 80],
  [68, 'machamp', 'Machomei', 'Fighting', 90],
  [69, 'bellsprout', 'Knofensa', 'Grass/Poison', 50],
  [70, 'weepinbell', 'Ultrigaria', 'Grass/Poison', 65],
  [71, 'victreebel', 'Sarzenia', 'Grass/Poison', 80],
  [72, 'tentacool', 'Tentacha', 'Water/Poison', 40],
  [73, 'tentacruel', 'Tentoxa', 'Water/Poison', 80],
  [74, 'geodude', 'Kleinstein', 'Rock/Ground', 40],
  [75, 'graveler', 'Georok', 'Rock/Ground', 55],
  [76, 'golem', 'Geowaz', 'Rock/Ground', 80],
  [77, 'ponyta', 'Ponita', 'Fire', 50],
  [78, 'rapidash', 'Gallopa', 'Fire', 65],
  [79, 'slowpoke', 'Flegmon', 'Water/Psychic', 90],
  [80, 'slowbro', 'Lahmus', 'Water/Psychic', 95],
  [81, 'magnemite', 'Magnetilo', 'Electric/Steel', 25],
  [82, 'magneton', 'Magneton', 'Electric/Steel', 50],
  [83, 'farfetchd', 'Porenta', 'Normal/Flying', 52],
  [84, 'doduo', 'Dodu', 'Normal/Flying', 35],
  [85, 'dodrio', 'Dodri', 'Normal/Flying', 60],
  [86, 'seel', 'Jurob', 'Water', 65],
  [87, 'dewgong', 'Jugong', 'Water/Ice', 90],
  [88, 'grimer', 'Sleima', 'Poison', 80],
  [89, 'muk', 'Sleimok', 'Poison', 105],
  [90, 'shellder', 'Muschas', 'Water', 30],
  [91, 'cloyster', 'Austos', 'Water/Ice', 50],
  [92, 'gastly', 'Nebulak', 'Ghost/Poison', 30],
  [93, 'haunter', 'Alpollo', 'Ghost/Poison', 45],
  [94, 'gengar', 'Gengar', 'Ghost/Poison', 60],
  [95, 'onix', 'Onix', 'Rock/Ground', 35],
  [96, 'drowzee', 'Traumato', 'Psychic', 60],
  [97, 'hypno', 'Hypno', 'Psychic', 85],
  [98, 'krabby', 'Krabby', 'Water', 30],
  [99, 'kingler', 'Kingler', 'Water', 55],
  [100, 'voltorb', 'Voltobal', 'Electric', 40],
  [101, 'electrode', 'Lektrobal', 'Electric', 60],
  [102, 'exeggcute', 'Owei', 'Grass/Psychic', 60],
  [103, 'exeggutor', 'Kokowei', 'Grass/Psychic', 95],
  [104, 'cubone', 'Tragosso', 'Ground', 50],
  [105, 'marowak', 'Knogga', 'Ground', 60],
  [106, 'hitmonlee', 'Kicklee', 'Fighting', 50],
  [107, 'hitmonchan', 'Nockchan', 'Fighting', 50],
  [108, 'lickitung', 'Schlurp', 'Normal', 90],
  [109, 'koffing', 'Smogon', 'Poison', 40],
  [110, 'weezing', 'Smogmog', 'Poison', 65],
  [111, 'rhyhorn', 'Rihorn', 'Ground/Rock', 80],
  [112, 'rhydon', 'Rizeros', 'Ground/Rock', 105],
  [113, 'chansey', 'Chaneira', 'Normal', 250],
  [114, 'tangela', 'Tangela', 'Grass', 65],
  [115, 'kangaskhan', 'Kangama', 'Normal', 105],
  [116, 'horsea', 'Seeper', 'Water', 30],
  [117, 'seadra', 'Seemon', 'Water', 55],
  [118, 'goldeen', 'Goldini', 'Water', 45],
  [119, 'seaking', 'Golking', 'Water', 80],
  [120, 'staryu', 'Sterndu', 'Water', 30],
  [121, 'starmie', 'Starmie', 'Water/Psychic', 60],
  [122, 'mr-mime', 'Pantimos', 'Psychic/Fairy', 40],
  [123, 'scyther', 'Sichlor', 'Bug/Flying', 70],
  [124, 'jynx', 'Rossana', 'Ice/Psychic', 65],
  [125, 'electabuzz', 'Elektek', 'Electric', 65],
  [126, 'magmar', 'Magmar', 'Fire', 65],
  [127, 'pinsir', 'Pinsir', 'Bug', 65],
  [128, 'tauros', 'Tauros', 'Normal', 75],
  [129, 'magikarp', 'Karpador', 'Water', 20],
  [130, 'gyarados', 'Garados', 'Water/Flying', 95],
  [131, 'lapras', 'Lapras', 'Water/Ice', 130],
  [132, 'ditto', 'Ditto', 'Normal', 48],
  [133, 'evoli', 'Evoli', 'Normal', 55],
  [134, 'vaporeon', 'Aquana', 'Water', 130],
  [135, 'jolteon', 'Blitza', 'Electric', 65],
  [136, 'flareon', 'Flamara', 'Fire', 65],
  [137, 'porygon', 'Porygon', 'Normal', 65],
  [138, 'omanyte', 'Amonitas', 'Rock/Water', 35],
  [139, 'omastar', 'Amoroso', 'Rock/Water', 70],
  [140, 'kabuto', 'Kabuto', 'Rock/Water', 30],
  [141, 'kabutops', 'Kabutops', 'Rock/Water', 60],
  [142, 'aerodactyl', 'Aerodactyl', 'Rock/Flying', 80],
  [143, 'relaxo', 'Relaxo', 'Normal', 160],
  [144, 'articuno', 'Arktos', 'Ice/Flying', 90],
  [145, 'zapdos', 'Zapdos', 'Electric/Flying', 90],
  [146, 'moltres', 'Lavados', 'Fire/Flying', 90],
  [147, 'dratini', 'Dratini', 'Dragon', 41],
  [148, 'dragonair', 'Dragonir', 'Dragon', 61],
  [149, 'dragoran', 'Dragoran', 'Dragon/Flying', 91],
  [150, 'mewtu', 'Mewtu', 'Psychic', 106],
  [151, 'mew', 'Mew', 'Psychic', 100],
];

const LEGENDARY_POKEDEX_NUMBERS = new Set([
  144, 145, 146, 150, 151,
  243, 244, 245, 249, 250, 251,
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
]);
const RANGED_ATTACK_TYPES = new Set<PokemonType>([
  'Poison', 'Ghost', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon',
]);

function createPokemon(
  [pokedexNo, id, nameDe, typeNames, baseHp]: PokemonRow,
  legacyOnly = false,
): Pokemon {
  const types = typeNames.split('/').map((type) => type[0].toUpperCase() + type.slice(1)) as PokemonType[];
  const primaryType = TYPE_INFO[types[0]];
  const localizedTypes = types.map((type) => TYPE_INFO[type]);
  const maxHp = Math.round(50 + baseHp * 0.28);
  const region =
    pokedexNo <= KANTO_POKEDEX_COUNT
      ? 'Kanto'
      : pokedexNo <= KANTO_POKEDEX_COUNT + JOHTO_POKEDEX_COUNT
        ? 'Johto'
        : pokedexNo <= NATIONAL_POKEDEX_COUNT
          ? 'Hoenn'
          : 'Sinnoh';

  return {
    id,
    pokedexNo,
    nameDe,
    typeDe: localizedTypes.map((type) => type.de).join(' / '),
    typeIcon: localizedTypes.map((type) => type.icon).join(''),
    badgeBg: primaryType.badgeBg,
    themeColor: primaryType.color,
    sprite: primaryType.sprite,
    maxHp,
    baseCatchRate: Math.max(20, Math.min(70, 80 - Math.round(maxHp * 0.45))),
    attackStyle: RANGED_ATTACK_TYPES.has(types[0]) ? 'ranged' : 'physical',
    moveDe: `${primaryType.de}-Attacke`,
    habitatDe: `${region}-Arena`,
    rarity: LEGENDARY_POKEDEX_NUMBERS.has(pokedexNo) ? 'legendary' : maxHp >= 80 ? 'rare' : 'common',
    ...(legacyOnly ? { legacyOnly: true } : {}),
  };
}

const KANTO_ROSTER = KANTO_POKEMON.map((entry) => createPokemon(entry));
const JOHTO_ROSTER = JOHTO_POKEMON.map((entry) => createPokemon(entry));
const HOENN_ROSTER = HOENN_POKEMON.map((entry) => createPokemon(entry));
const LEGACY_POKEMON = createPokemon(
  [448, 'lucario', 'Lucario', 'Fighting/Steel', 70],
  true,
);

// Lucario remains viewable and usable by existing owners, but is never a wild encounter.
export const POKEMON_ROSTER: Pokemon[] = [...KANTO_ROSTER, ...JOHTO_ROSTER, ...HOENN_ROSTER, LEGACY_POKEMON];
export const WILD_POKEMON_ROSTER: Pokemon[] = [...KANTO_ROSTER, ...JOHTO_ROSTER, ...HOENN_ROSTER];

const POKEMON_IDS = new Set(POKEMON_ROSTER.map(({ id }) => id));

export function isValidCapturedPokemonCollection(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length <= MAX_CAPTURED_POKEMON
    && value.every((id) => typeof id === 'string' && POKEMON_IDS.has(id))
    && new Set(value).size === value.length;
}

export function normalizeCapturedPokemon(value: unknown): string[] {
  if (!Array.isArray(value)) return ['pikachu'];
  const normalized = [...new Set(value.filter((id): id is string => typeof id === 'string' && POKEMON_IDS.has(id)))].slice(0, MAX_CAPTURED_POKEMON);
  return normalized.length ? normalized : ['pikachu'];
}

export interface PokemonMathBattleTask {
  id: string;
  questionStrDe: string;
  mathPromptDe: string;
  answer: number;
  options: number[];
  hintDe: string;
  actionType: 'attack' | 'catch';
}

/** Generate quick tactical 3rd grade math tasks for Pokemon battles. */
export function generatePokemonBattleTask(actionType: 'attack' | 'catch'): PokemonMathBattleTask {
  const isMultiplication = Math.random() > 0.4;

  if (actionType === 'catch') {
    const target = Math.random() > 0.5 ? 1000 : 100;
    const current = Math.floor(Math.random() * (target - 50)) + 20;
    const answer = target - current;

    const optSet = new Set<number>();
    optSet.add(answer);
    optSet.add(answer + 10);
    optSet.add(Math.max(5, answer - 10));
    optSet.add(answer + 100 <= target ? answer + 100 : answer - 5);

    const options = Array.from(optSet).slice(0, 4).sort(() => Math.random() - 0.5);

    return {
      id: `poke_catch_${Date.now()}`,
      questionStrDe: `${current} + ? = ${target}`,
      mathPromptDe: `Wie viel fehlt bis zur vollen Zahl ${target}?`,
      answer,
      options,
      hintDe: `Rechne: ${target} - ${current} = ?`,
      actionType: 'catch',
    };
  }

  if (isMultiplication) {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    const answer = a * b;

    const optSet = new Set<number>();
    optSet.add(answer);
    optSet.add(answer + a);
    optSet.add(Math.max(1, answer - b));
    optSet.add((a + 1) * b);

    const options = Array.from(optSet).slice(0, 4).sort(() => Math.random() - 0.5);

    return {
      id: `poke_atk_${Date.now()}`,
      questionStrDe: `${a} · ${b} = ?`,
      mathPromptDe: `Berechne den Attacken-Treffer: ${a} mal ${b}!`,
      answer,
      options,
      hintDe: `${a} mal ${b} rechnen.`,
      actionType: 'attack',
    };
  }

  const b = Math.floor(Math.random() * 7) + 3;
  const answer = Math.floor(Math.random() * 8) + 2;
  const a = b * answer;

  const optSet = new Set<number>();
  optSet.add(answer);
  optSet.add(answer + 1);
  optSet.add(Math.max(1, answer - 1));
  optSet.add(answer + 2);

  const options = Array.from(optSet).slice(0, 4).sort(() => Math.random() - 0.5);

  return {
    id: `poke_div_${Date.now()}`,
    questionStrDe: `${a} : ${b} = ?`,
    mathPromptDe: `Wasser-Strahl / Blitzschlag: ${a} geteilt durch ${b}!`,
    answer,
    options,
    hintDe: `Umkehraufgabe: ? · ${b} = ${a}`,
    actionType: 'attack',
  };
}
