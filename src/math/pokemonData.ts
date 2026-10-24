export interface Pokemon {
  id: string;
  pokedexNo: number;
  nameDe: string;
  nameVi: string;
  typeDe: string;
  typeVi: string;
  typeIcon: string;
  badgeBg: string;
  themeColor: string;
  sprite: string;
  maxHp: number;
  baseCatchRate: number;
  moveDe: string;
  moveVi: string;
  habitatDe: string;
  habitatVi: string;
  rarity: 'common' | 'rare' | 'legendary';
  legacyOnly?: boolean;
}

export const MAX_CAPTURED_POKEMON = 50;
export const KANTO_POKEDEX_COUNT = 151;

type PokemonType =
  | 'Normal' | 'Fighting' | 'Flying' | 'Poison' | 'Ground' | 'Rock' | 'Bug'
  | 'Ghost' | 'Steel' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic'
  | 'Ice' | 'Dragon' | 'Dark' | 'Fairy';

interface TypeInfo {
  de: string;
  vi: string;
  icon: string;
  badgeBg: string;
  color: string;
  sprite: string;
}

const TYPE_INFO: Record<PokemonType, TypeInfo> = {
  Normal: { de: 'Normal', vi: 'Hệ Thường', icon: '⭐', badgeBg: 'bg-stone-500 text-white', color: '#78716c', sprite: '⭐🦊' },
  Fighting: { de: 'Kampf', vi: 'Hệ Giác Đấu', icon: '🥊', badgeBg: 'bg-rose-700 text-white', color: '#be123c', sprite: '🥊🐒' },
  Flying: { de: 'Flug', vi: 'Hệ Bay', icon: '🪽', badgeBg: 'bg-sky-500 text-white', color: '#0ea5e9', sprite: '🪽🦅' },
  Poison: { de: 'Gift', vi: 'Hệ Độc', icon: '☠️', badgeBg: 'bg-fuchsia-700 text-white', color: '#a21caf', sprite: '☠️🐍' },
  Ground: { de: 'Boden', vi: 'Hệ Đất', icon: '🏜️', badgeBg: 'bg-amber-700 text-white', color: '#b45309', sprite: '🏜️🐾' },
  Rock: { de: 'Gestein', vi: 'Hệ Đá', icon: '🪨', badgeBg: 'bg-yellow-700 text-white', color: '#a16207', sprite: '🪨🦕' },
  Bug: { de: 'Käfer', vi: 'Hệ Bọ', icon: '🐛', badgeBg: 'bg-lime-600 text-slate-950', color: '#65a30d', sprite: '🐛🦋' },
  Ghost: { de: 'Geist', vi: 'Hệ Ma', icon: '👻', badgeBg: 'bg-violet-700 text-white', color: '#6d28d9', sprite: '👻🦇' },
  Steel: { de: 'Stahl', vi: 'Hệ Thép', icon: '⚙️', badgeBg: 'bg-slate-500 text-white', color: '#64748b', sprite: '⚙️🤖' },
  Fire: { de: 'Feuer', vi: 'Hệ Lửa', icon: '🔥', badgeBg: 'bg-orange-600 text-white', color: '#ea580c', sprite: '🔥🦎' },
  Water: { de: 'Wasser', vi: 'Hệ Nước', icon: '💧', badgeBg: 'bg-blue-600 text-white', color: '#2563eb', sprite: '💧🐢' },
  Grass: { de: 'Pflanze', vi: 'Hệ Cỏ', icon: '🍃', badgeBg: 'bg-emerald-600 text-white', color: '#059669', sprite: '🍃🐸' },
  Electric: { de: 'Elektro', vi: 'Hệ Điện', icon: '⚡', badgeBg: 'bg-amber-400 text-amber-950', color: '#f59e0b', sprite: '⚡🐭' },
  Psychic: { de: 'Psycho', vi: 'Hệ Tâm Linh', icon: '🔮', badgeBg: 'bg-purple-600 text-white', color: '#9333ea', sprite: '🔮🧠' },
  Ice: { de: 'Eis', vi: 'Hệ Băng', icon: '❄️', badgeBg: 'bg-cyan-500 text-slate-950', color: '#06b6d4', sprite: '❄️🐧' },
  Dragon: { de: 'Drache', vi: 'Hệ Rồng', icon: '🐉', badgeBg: 'bg-indigo-700 text-white', color: '#4338ca', sprite: '🐉✨' },
  Dark: { de: 'Unlicht', vi: 'Hệ Bóng Tối', icon: '🌙', badgeBg: 'bg-slate-700 text-white', color: '#334155', sprite: '🌙🦇' },
  Fairy: { de: 'Fee', vi: 'Hệ Tiên', icon: '💖', badgeBg: 'bg-pink-500 text-white', color: '#ec4899', sprite: '💖🧚' },
};

// Base HP values and localized species names from the canonical Kanto Pokédex.
// Vietnamese labels use the commonly recognized English species names.
type KantoPokemonRow = readonly [number, string, string, string, string, number];

const KANTO_POKEMON: KantoPokemonRow[] = [
  [1, 'bisasam', 'Bisasam', 'Bulbasaur', 'Grass/Poison', 45],
  [2, 'ivysaur', 'Bisaknosp', 'Ivysaur', 'Grass/Poison', 60],
  [3, 'venusaur', 'Bisaflor', 'Venusaur', 'Grass/Poison', 80],
  [4, 'glumanda', 'Glumanda', 'Charmander', 'Fire', 39],
  [5, 'charmeleon', 'Glutexo', 'Charmeleon', 'Fire', 58],
  [6, 'charizard', 'Glurak', 'Charizard', 'Fire/Flying', 78],
  [7, 'schiggy', 'Schiggy', 'Squirtle', 'Water', 44],
  [8, 'wartortle', 'Schillok', 'Wartortle', 'Water', 59],
  [9, 'blastoise', 'Turtok', 'Blastoise', 'Water', 79],
  [10, 'caterpie', 'Raupy', 'Caterpie', 'Bug', 45],
  [11, 'metapod', 'Safcon', 'Metapod', 'Bug', 50],
  [12, 'butterfree', 'Smettbo', 'Butterfree', 'Bug/Flying', 60],
  [13, 'weedle', 'Hornliu', 'Weedle', 'Bug/Poison', 40],
  [14, 'kakuna', 'Kokuna', 'Kakuna', 'Bug/Poison', 45],
  [15, 'beedrill', 'Bibor', 'Beedrill', 'Bug/Poison', 65],
  [16, 'pidgey', 'Taubsi', 'Pidgey', 'Normal/Flying', 40],
  [17, 'pidgeotto', 'Tauboga', 'Pidgeotto', 'Normal/Flying', 63],
  [18, 'pidgeot', 'Tauboss', 'Pidgeot', 'Normal/Flying', 83],
  [19, 'rattata', 'Rattfratz', 'Rattata', 'Normal', 30],
  [20, 'raticate', 'Rattikarl', 'Raticate', 'Normal', 55],
  [21, 'spearow', 'Habitak', 'Spearow', 'Normal/Flying', 40],
  [22, 'fearow', 'Ibitak', 'Fearow', 'Normal/Flying', 65],
  [23, 'ekans', 'Rettan', 'Ekans', 'Poison', 35],
  [24, 'arbok', 'Arbok', 'Arbok', 'Poison', 60],
  [25, 'pikachu', 'Pikachu', 'Pikachu', 'Electric', 35],
  [26, 'raichu', 'Raichu', 'Raichu', 'Electric', 60],
  [27, 'sandshrew', 'Sandan', 'Sandshrew', 'Ground', 50],
  [28, 'sandslash', 'Sandamer', 'Sandslash', 'Ground', 75],
  [29, 'nidoran-f', 'Nidoran♀', 'Nidoran♀', 'Poison', 55],
  [30, 'nidorina', 'Nidorina', 'Nidorina', 'Poison', 70],
  [31, 'nidoqueen', 'Nidoqueen', 'Nidoqueen', 'Poison/Ground', 90],
  [32, 'nidoran-m', 'Nidoran♂', 'Nidoran♂', 'Poison', 46],
  [33, 'nidorino', 'Nidorino', 'Nidorino', 'Poison', 61],
  [34, 'nidoking', 'Nidoking', 'Nidoking', 'Poison/Ground', 81],
  [35, 'clefairy', 'Piepi', 'Clefairy', 'Fairy', 70],
  [36, 'clefable', 'Pixi', 'Clefable', 'Fairy', 95],
  [37, 'vulpix', 'Vulpix', 'Vulpix', 'Fire', 38],
  [38, 'ninetales', 'Vulnona', 'Ninetales', 'Fire', 73],
  [39, 'pummeluff', 'Pummeluff', 'Jigglypuff', 'Normal/Fairy', 115],
  [40, 'wigglytuff', 'Knuddeluff', 'Wigglytuff', 'Normal/Fairy', 140],
  [41, 'zubat', 'Zubat', 'Zubat', 'Poison/Flying', 40],
  [42, 'golbat', 'Golbat', 'Golbat', 'Poison/Flying', 75],
  [43, 'oddish', 'Myrapla', 'Oddish', 'Grass/Poison', 45],
  [44, 'gloom', 'Duflor', 'Gloom', 'Grass/Poison', 60],
  [45, 'vileplume', 'Giflor', 'Vileplume', 'Grass/Poison', 75],
  [46, 'paras', 'Paras', 'Paras', 'Bug/Grass', 35],
  [47, 'parasect', 'Parasek', 'Parasect', 'Bug/Grass', 60],
  [48, 'venonat', 'Bluzuk', 'Venonat', 'Bug/Poison', 60],
  [49, 'venomoth', 'Omot', 'Venomoth', 'Bug/Poison', 70],
  [50, 'diglett', 'Digda', 'Diglett', 'Ground', 10],
  [51, 'dugtrio', 'Digdri', 'Dugtrio', 'Ground', 35],
  [52, 'meowth', 'Mauzi', 'Meowth', 'Normal', 40],
  [53, 'persian', 'Snobilikat', 'Persian', 'Normal', 65],
  [54, 'psyduck', 'Enton', 'Psyduck', 'Water', 50],
  [55, 'golduck', 'Entoron', 'Golduck', 'Water', 80],
  [56, 'mankey', 'Menki', 'Mankey', 'Fighting', 40],
  [57, 'primeape', 'Rasaff', 'Primeape', 'Fighting', 65],
  [58, 'growlithe', 'Fukano', 'Growlithe', 'Fire', 55],
  [59, 'arcanine', 'Arkani', 'Arcanine', 'Fire', 90],
  [60, 'poliwag', 'Quapsel', 'Poliwag', 'Water', 40],
  [61, 'poliwhirl', 'Quaputzi', 'Poliwhirl', 'Water', 65],
  [62, 'poliwrath', 'Quappo', 'Poliwrath', 'Water/Fighting', 90],
  [63, 'abra', 'Abra', 'Abra', 'Psychic', 25],
  [64, 'kadabra', 'Kadabra', 'Kadabra', 'Psychic', 40],
  [65, 'alakazam', 'Simsala', 'Alakazam', 'Psychic', 55],
  [66, 'machop', 'Machollo', 'Machop', 'Fighting', 70],
  [67, 'machoke', 'Maschock', 'Machoke', 'Fighting', 80],
  [68, 'machamp', 'Machomei', 'Machamp', 'Fighting', 90],
  [69, 'bellsprout', 'Knofensa', 'Bellsprout', 'Grass/Poison', 50],
  [70, 'weepinbell', 'Ultrigaria', 'Weepinbell', 'Grass/Poison', 65],
  [71, 'victreebel', 'Sarzenia', 'Victreebel', 'Grass/Poison', 80],
  [72, 'tentacool', 'Tentacha', 'Tentacool', 'Water/Poison', 40],
  [73, 'tentacruel', 'Tentoxa', 'Tentacruel', 'Water/Poison', 80],
  [74, 'geodude', 'Kleinstein', 'Geodude', 'Rock/Ground', 40],
  [75, 'graveler', 'Georok', 'Graveler', 'Rock/Ground', 55],
  [76, 'golem', 'Geowaz', 'Golem', 'Rock/Ground', 80],
  [77, 'ponyta', 'Ponita', 'Ponyta', 'Fire', 50],
  [78, 'rapidash', 'Gallopa', 'Rapidash', 'Fire', 65],
  [79, 'slowpoke', 'Flegmon', 'Slowpoke', 'Water/Psychic', 90],
  [80, 'slowbro', 'Lahmus', 'Slowbro', 'Water/Psychic', 95],
  [81, 'magnemite', 'Magnetilo', 'Magnemite', 'Electric/Steel', 25],
  [82, 'magneton', 'Magneton', 'Magneton', 'Electric/Steel', 50],
  [83, 'farfetchd', 'Porenta', 'Farfetch’d', 'Normal/Flying', 52],
  [84, 'doduo', 'Dodu', 'Doduo', 'Normal/Flying', 35],
  [85, 'dodrio', 'Dodri', 'Dodrio', 'Normal/Flying', 60],
  [86, 'seel', 'Jurob', 'Seel', 'Water', 65],
  [87, 'dewgong', 'Jugong', 'Dewgong', 'Water/Ice', 90],
  [88, 'grimer', 'Sleima', 'Grimer', 'Poison', 80],
  [89, 'muk', 'Sleimok', 'Muk', 'Poison', 105],
  [90, 'shellder', 'Muschas', 'Shellder', 'Water', 30],
  [91, 'cloyster', 'Austos', 'Cloyster', 'Water/Ice', 50],
  [92, 'gastly', 'Nebulak', 'Gastly', 'Ghost/Poison', 30],
  [93, 'haunter', 'Alpollo', 'Haunter', 'Ghost/Poison', 45],
  [94, 'gengar', 'Gengar', 'Gengar', 'Ghost/Poison', 60],
  [95, 'onix', 'Onix', 'Onix', 'Rock/Ground', 35],
  [96, 'drowzee', 'Traumato', 'Drowzee', 'Psychic', 60],
  [97, 'hypno', 'Hypno', 'Hypno', 'Psychic', 85],
  [98, 'krabby', 'Krabby', 'Krabby', 'Water', 30],
  [99, 'kingler', 'Kingler', 'Kingler', 'Water', 55],
  [100, 'voltorb', 'Voltobal', 'Voltorb', 'Electric', 40],
  [101, 'electrode', 'Lektrobal', 'Electrode', 'Electric', 60],
  [102, 'exeggcute', 'Owei', 'Exeggcute', 'Grass/Psychic', 60],
  [103, 'exeggutor', 'Kokowei', 'Exeggutor', 'Grass/Psychic', 95],
  [104, 'cubone', 'Tragosso', 'Cubone', 'Ground', 50],
  [105, 'marowak', 'Knogga', 'Marowak', 'Ground', 60],
  [106, 'hitmonlee', 'Kicklee', 'Hitmonlee', 'Fighting', 50],
  [107, 'hitmonchan', 'Nockchan', 'Hitmonchan', 'Fighting', 50],
  [108, 'lickitung', 'Schlurp', 'Lickitung', 'Normal', 90],
  [109, 'koffing', 'Smogon', 'Koffing', 'Poison', 40],
  [110, 'weezing', 'Smogmog', 'Weezing', 'Poison', 65],
  [111, 'rhyhorn', 'Rihorn', 'Rhyhorn', 'Ground/Rock', 80],
  [112, 'rhydon', 'Rizeros', 'Rhydon', 'Ground/Rock', 105],
  [113, 'chansey', 'Chaneira', 'Chansey', 'Normal', 250],
  [114, 'tangela', 'Tangela', 'Tangela', 'Grass', 65],
  [115, 'kangaskhan', 'Kangama', 'Kangaskhan', 'Normal', 105],
  [116, 'horsea', 'Seeper', 'Horsea', 'Water', 30],
  [117, 'seadra', 'Seemon', 'Seadra', 'Water', 55],
  [118, 'goldeen', 'Goldini', 'Goldeen', 'Water', 45],
  [119, 'seaking', 'Golking', 'Seaking', 'Water', 80],
  [120, 'staryu', 'Sterndu', 'Staryu', 'Water', 30],
  [121, 'starmie', 'Starmie', 'Starmie', 'Water/Psychic', 60],
  [122, 'mr-mime', 'Pantimos', 'Mr. Mime', 'Psychic/Fairy', 40],
  [123, 'scyther', 'Sichlor', 'Scyther', 'Bug/Flying', 70],
  [124, 'jynx', 'Rossana', 'Jynx', 'Ice/Psychic', 65],
  [125, 'electabuzz', 'Elektek', 'Electabuzz', 'Electric', 65],
  [126, 'magmar', 'Magmar', 'Magmar', 'Fire', 65],
  [127, 'pinsir', 'Pinsir', 'Pinsir', 'Bug', 65],
  [128, 'tauros', 'Tauros', 'Tauros', 'Normal', 75],
  [129, 'magikarp', 'Karpador', 'Magikarp', 'Water', 20],
  [130, 'gyarados', 'Garados', 'Gyarados', 'Water/Flying', 95],
  [131, 'lapras', 'Lapras', 'Lapras', 'Water/Ice', 130],
  [132, 'ditto', 'Ditto', 'Ditto', 'Normal', 48],
  [133, 'evoli', 'Evoli', 'Eevee', 'Normal', 55],
  [134, 'vaporeon', 'Aquana', 'Vaporeon', 'Water', 130],
  [135, 'jolteon', 'Blitza', 'Jolteon', 'Electric', 65],
  [136, 'flareon', 'Flamara', 'Flareon', 'Fire', 65],
  [137, 'porygon', 'Porygon', 'Porygon', 'Normal', 65],
  [138, 'omanyte', 'Amonitas', 'Omanyte', 'Rock/Water', 35],
  [139, 'omastar', 'Amoroso', 'Omastar', 'Rock/Water', 70],
  [140, 'kabuto', 'Kabuto', 'Kabuto', 'Rock/Water', 30],
  [141, 'kabutops', 'Kabutops', 'Kabutops', 'Rock/Water', 60],
  [142, 'aerodactyl', 'Aerodactyl', 'Aerodactyl', 'Rock/Flying', 80],
  [143, 'relaxo', 'Relaxo', 'Snorlax', 'Normal', 160],
  [144, 'articuno', 'Arktos', 'Articuno', 'Ice/Flying', 90],
  [145, 'zapdos', 'Zapdos', 'Zapdos', 'Electric/Flying', 90],
  [146, 'moltres', 'Lavados', 'Moltres', 'Fire/Flying', 90],
  [147, 'dratini', 'Dratini', 'Dratini', 'Dragon', 41],
  [148, 'dragonair', 'Dragonir', 'Dragonair', 'Dragon', 61],
  [149, 'dragoran', 'Dragoran', 'Dragonite', 'Dragon/Flying', 91],
  [150, 'mewtu', 'Mewtu', 'Mewtwo', 'Psychic', 106],
  [151, 'mew', 'Mew', 'Mew', 'Psychic', 100],
];

const LEGENDARY_POKEDEX_NUMBERS = new Set([144, 145, 146, 150, 151]);

function createPokemon(
  [pokedexNo, id, nameDe, nameVi, typeNames, baseHp]: KantoPokemonRow,
  legacyOnly = false,
): Pokemon {
  const types = typeNames.split('/') as PokemonType[];
  const primaryType = TYPE_INFO[types[0]];
  const localizedTypes = types.map((type) => TYPE_INFO[type]);
  const maxHp = Math.round(50 + baseHp * 0.28);

  return {
    id,
    pokedexNo,
    nameDe,
    nameVi,
    typeDe: localizedTypes.map((type) => type.de).join(' / '),
    typeVi: localizedTypes.map((type) => type.vi).join(' / '),
    typeIcon: localizedTypes.map((type) => type.icon).join(''),
    badgeBg: primaryType.badgeBg,
    themeColor: primaryType.color,
    sprite: primaryType.sprite,
    maxHp,
    baseCatchRate: Math.max(20, Math.min(70, 80 - Math.round(maxHp * 0.45))),
    moveDe: `${primaryType.de}-Attacke`,
    moveVi: `Đòn ${primaryType.vi}`,
    habitatDe: 'Kanto-Arena',
    habitatVi: 'Đấu trường Kanto',
    rarity: LEGENDARY_POKEDEX_NUMBERS.has(pokedexNo) ? 'legendary' : maxHp >= 80 ? 'rare' : 'common',
    ...(legacyOnly ? { legacyOnly: true } : {}),
  };
}

const KANTO_ROSTER = KANTO_POKEMON.map((entry) => createPokemon(entry));
const LEGACY_POKEMON = createPokemon(
  [448, 'lucario', 'Lucario', 'Lucario', 'Fighting/Steel', 70],
  true,
);

// Lucario remains viewable and usable by existing owners, but is never a wild encounter.
export const POKEMON_ROSTER: Pokemon[] = [...KANTO_ROSTER, LEGACY_POKEMON];
export const WILD_POKEMON_ROSTER: Pokemon[] = KANTO_ROSTER;

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
  questionStrVi: string;
  mathPromptDe: string;
  mathPromptVi: string;
  answer: number;
  options: number[];
  hintDe: string;
  hintVi: string;
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
      questionStrVi: `${current} + ? = ${target}`,
      mathPromptDe: `Wie viel fehlt bis zur vollen Zahl ${target}?`,
      mathPromptVi: `Cần cộng thêm bao nhiêu để tròn ${target}?`,
      answer,
      options,
      hintDe: `Rechne: ${target} - ${current} = ?`,
      hintVi: `Tính: ${target} - ${current} = ?`,
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
      questionStrVi: `${a} · ${b} = ?`,
      mathPromptDe: `Berechne den Attacken-Treffer: ${a} mal ${b}!`,
      mathPromptVi: `Tính đòn tấn công: ${a} nhân ${b}!`,
      answer,
      options,
      hintDe: `${a} mal ${b} rechnen.`,
      hintVi: `${a} lần số ${b}.`,
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
    questionStrVi: `${a} : ${b} = ?`,
    mathPromptDe: `Wasser-Strahl / Blitzschlag: ${a} geteilt durch ${b}!`,
    mathPromptVi: `Phóng đòn phép thuật: ${a} chia cho ${b}!`,
    answer,
    options,
    hintDe: `Umkehraufgabe: ? · ${b} = ${a}`,
    hintVi: `Tính ngược lại: ? · ${b} = ${a}`,
    actionType: 'attack',
  };
}
