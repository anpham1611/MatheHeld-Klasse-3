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
  baseCatchRate: number; // percentage base
  moveDe: string;
  moveVi: string;
  habitatDe: string;
  habitatVi: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export const POKEMON_ROSTER: Pokemon[] = [
  {
    id: 'pikachu',
    pokedexNo: 25,
    nameDe: 'Pikachu',
    nameVi: 'Pikachu',
    typeDe: 'Elektro',
    typeVi: 'Hệ Điện',
    typeIcon: '⚡',
    badgeBg: 'bg-amber-400 text-amber-950',
    themeColor: '#f59e0b',
    sprite: '⚡🐭',
    maxHp: 60,
    baseCatchRate: 65,
    moveDe: 'Donnerschock',
    moveVi: 'Sốc Điện',
    habitatDe: 'Zahlenwald',
    habitatVi: 'Rừng Số Học',
    rarity: 'common',
  },
  {
    id: 'glumanda',
    pokedexNo: 4,
    nameDe: 'Glumanda',
    nameVi: 'Charmander (Glumanda)',
    typeDe: 'Feuer',
    typeVi: 'Hệ Lửa',
    typeIcon: '🔥',
    badgeBg: 'bg-orange-500 text-white',
    themeColor: '#ea580c',
    sprite: '🔥🦎',
    maxHp: 55,
    baseCatchRate: 60,
    moveDe: 'Flammenwurf',
    moveVi: 'Phun Lửa',
    habitatDe: 'Rechen-Vulkan',
    habitatVi: 'Núi Lửa Tính Toán',
    rarity: 'common',
  },
  {
    id: 'schiggy',
    pokedexNo: 7,
    nameDe: 'Schiggy',
    nameVi: 'Squirtle (Schiggy)',
    typeDe: 'Wasser',
    typeVi: 'Hệ Nước',
    typeIcon: '💧',
    badgeBg: 'bg-blue-500 text-white',
    themeColor: '#2563eb',
    sprite: '💧🐢',
    maxHp: 58,
    baseCatchRate: 60,
    moveDe: 'Aquaknarre',
    moveVi: 'Súng Nước',
    habitatDe: 'Euro-Küste',
    habitatVi: 'Bờ Biển Euro',
    rarity: 'common',
  },
  {
    id: 'bisasam',
    pokedexNo: 1,
    nameDe: 'Bisasam',
    nameVi: 'Bulbasaur (Bisasam)',
    typeDe: 'Pflanze',
    typeVi: 'Hệ Cỏ',
    typeIcon: '🍃',
    badgeBg: 'bg-emerald-500 text-white',
    themeColor: '#059669',
    sprite: '🍃🐸',
    maxHp: 62,
    baseCatchRate: 60,
    moveDe: 'Rankenhieb',
    moveVi: 'Roi Mây',
    habitatDe: 'Mathe-Wiese',
    habitatVi: 'Đồng Cỏ Toán Học',
    rarity: 'common',
  },
  {
    id: 'evoli',
    pokedexNo: 133,
    nameDe: 'Evoli',
    nameVi: 'Eevee (Evoli)',
    typeDe: 'Normal',
    typeVi: 'Hệ Thường',
    typeIcon: '⭐',
    badgeBg: 'bg-amber-600 text-white',
    themeColor: '#b45309',
    sprite: '🦊✨',
    maxHp: 65,
    baseCatchRate: 55,
    moveDe: 'Sternschauer',
    moveVi: 'Mưa Sao Băng',
    habitatDe: 'Stellenwert-Hügel',
    habitatVi: 'Đồi Hàng Trăm',
    rarity: 'rare',
  },
  {
    id: 'pummeluff',
    pokedexNo: 39,
    nameDe: 'Pummeluff',
    nameVi: 'Jigglypuff (Pummeluff)',
    typeDe: 'Fee',
    typeVi: 'Hệ Tiên',
    typeIcon: '💖',
    badgeBg: 'bg-pink-400 text-pink-950',
    themeColor: '#db2777',
    sprite: '🎈🎤',
    maxHp: 75,
    baseCatchRate: 50,
    moveDe: 'Gesang & Zauberschein',
    moveVi: 'Hát Ru Kỳ Diệu',
    habitatDe: 'Melodie-Tal',
    habitatVi: 'Thung Lũng Giai Điệu',
    rarity: 'rare',
  },
  {
    id: 'gengar',
    pokedexNo: 94,
    nameDe: 'Gengar',
    nameVi: 'Gengar',
    typeDe: 'Geist',
    typeVi: 'Hệ Ma',
    typeIcon: '👻',
    badgeBg: 'bg-purple-600 text-white',
    themeColor: '#7c3aed',
    sprite: '👻😈',
    maxHp: 70,
    baseCatchRate: 45,
    moveDe: 'Spukball',
    moveVi: 'Bóng Đêm Hắc Ám',
    habitatDe: 'Nacht-Turm',
    habitatVi: 'Tháp Bóng Đêm',
    rarity: 'rare',
  },
  {
    id: 'relaxo',
    pokedexNo: 143,
    nameDe: 'Relaxo',
    nameVi: 'Snorlax (Relaxo)',
    typeDe: 'Normal',
    typeVi: 'Hệ Thường',
    typeIcon: '💤',
    badgeBg: 'bg-teal-700 text-white',
    themeColor: '#0f766e',
    sprite: '🐻💤',
    maxHp: 110,
    baseCatchRate: 40,
    moveDe: 'Bodyslam & Erholung',
    moveVi: 'Đè Bẹp Khổng Lồ',
    habitatDe: 'Schlaf-Berg',
    habitatVi: 'Đỉnh Núi Say Giấc',
    rarity: 'rare',
  },
  {
    id: 'dragoran',
    pokedexNo: 149,
    nameDe: 'Dragoran',
    nameVi: 'Dragonite (Dragoran)',
    typeDe: 'Drache',
    typeVi: 'Hệ Rồng',
    typeIcon: '🐉',
    badgeBg: 'bg-amber-500 text-amber-950',
    themeColor: '#d97706',
    sprite: '🐲💨',
    maxHp: 95,
    baseCatchRate: 35,
    moveDe: 'Drachenstoß',
    moveVi: 'Long Xung Kích',
    habitatDe: 'Wolken-Arena',
    habitatVi: 'Đấu Trường Mây',
    rarity: 'rare',
  },
  {
    id: 'lucario',
    pokedexNo: 448,
    nameDe: 'Lucario',
    nameVi: 'Lucario',
    typeDe: 'Kampf',
    typeVi: 'Hệ Giác Đấu',
    typeIcon: '🥋',
    badgeBg: 'bg-sky-600 text-white',
    themeColor: '#0284c7',
    sprite: '🐺🥋',
    maxHp: 85,
    baseCatchRate: 35,
    moveDe: 'Aurasphäre',
    moveVi: 'Cầu Khí Công Aura',
    habitatDe: 'Dojo-Gipfel',
    habitatVi: 'Đỉnh Núi Dojo',
    rarity: 'rare',
  },
  {
    id: 'mew',
    pokedexNo: 151,
    nameDe: 'Mew',
    nameVi: 'Mew',
    typeDe: 'Psycho',
    typeVi: 'Hệ Siêu Linh',
    typeIcon: '🌸',
    badgeBg: 'bg-pink-500 text-white',
    themeColor: '#ec4899',
    sprite: '🐱✨',
    maxHp: 90,
    baseCatchRate: 25,
    moveDe: 'Sternen-Telekinese',
    moveVi: 'Siêu Năng Lượng Vũ Trụ',
    habitatDe: 'Geheimnisvoller Schrein',
    habitatVi: 'Điện Thờ Bí Ẩn',
    rarity: 'legendary',
  },
  {
    id: 'mewtu',
    pokedexNo: 150,
    nameDe: 'Mewtu',
    nameVi: 'Mewtwo (Mewtu)',
    typeDe: 'Psycho',
    typeVi: 'Hệ Siêu Linh',
    typeIcon: '🔮',
    badgeBg: 'bg-violet-700 text-white',
    themeColor: '#6d28d9',
    sprite: '👽🔮',
    maxHp: 120,
    baseCatchRate: 20,
    moveDe: 'Psychostoß',
    moveVi: 'Chấn Động Tâm Linh',
    habitatDe: 'Zahlen-Labor 1000',
    habitatVi: 'Viện Nghiên Cứu Số 1000',
    rarity: 'legendary',
  },
];

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

/**
 * Generate quick tactical 3rd grade math tasks for Pokemon battles
 */
export function generatePokemonBattleTask(actionType: 'attack' | 'catch'): PokemonMathBattleTask {
  const isMultiplication = Math.random() > 0.4;

  if (actionType === 'catch') {
    // Catch question: typically a round 1000 question or tens complement
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
    const a = Math.floor(Math.random() * 8) + 2; // 2..9
    const b = Math.floor(Math.random() * 8) + 2; // 2..9
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
  } else {
    // Quick Division or Tens math
    const b = Math.floor(Math.random() * 7) + 3; // 3..9
    const ans = Math.floor(Math.random() * 8) + 2; // 2..9
    const a = b * ans;

    const optSet = new Set<number>();
    optSet.add(ans);
    optSet.add(ans + 1);
    optSet.add(Math.max(1, ans - 1));
    optSet.add(ans + 2);

    const options = Array.from(optSet).slice(0, 4).sort(() => Math.random() - 0.5);

    return {
      id: `poke_div_${Date.now()}`,
      questionStrDe: `${a} : ${b} = ?`,
      questionStrVi: `${a} : ${b} = ?`,
      mathPromptDe: `Wasser-Strahl / Blitzschlag: ${a} geteilt durch ${b}!`,
      mathPromptVi: `Phóng đòn phép thuật: ${a} chia cho ${b}!`,
      answer: ans,
      options,
      hintDe: `Umkehraufgabe: ? · ${b} = ${a}`,
      hintVi: `Tính ngược lại: ? · ${b} = ${a}`,
      actionType: 'attack',
    };
  }
}
