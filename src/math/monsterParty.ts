export type MonsterShape = 'round' | 'pointy' | 'square' | 'tall' | 'wide' | 'spiky';

export interface MonsterDesign {
  id: string;
  shape: MonsterShape;
  color: string;
  accent: string;
  mouth: string;
  eyes: number;
  horns: number;
  antennae: number;
  pose: number;
}

export interface MonsterRound {
  monsters: MonsterDesign[];
  shadows: MonsterDesign[];
}

export const MIN_MONSTERS_PER_ROUND = 5;
export const MAX_MONSTERS_PER_ROUND = 15;

const SHAPES: MonsterShape[] = ['round', 'pointy', 'square', 'tall', 'wide', 'spiky'];
const COLORS = [
  ['#48c7b1', '#ffb3c1'],
  ['#ff9b54', '#ffe16b'],
  ['#ae83e8', '#8ee2ff'],
  ['#9bcf4a', '#f9a8d4'],
  ['#65a8ee', '#ffc86b'],
  ['#f16f87', '#9cf0ca'],
  ['#e7b64f', '#b9a2ff'],
  ['#5cc4d5', '#ff9b54'],
];
const MOUTHS = ['smile', 'toothy', 'surprised', 'zigzag'];

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function generateMonsterRound(
  requestedCount = MIN_MONSTERS_PER_ROUND,
  random: () => number = Math.random,
): MonsterRound {
  const count = Math.min(
    MAX_MONSTERS_PER_ROUND,
    Math.max(MIN_MONSTERS_PER_ROUND, Math.floor(Number.isFinite(requestedCount) ? requestedCount : MIN_MONSTERS_PER_ROUND)),
  );
  const firstShape = Math.floor(random() * SHAPES.length);
  const designs = Array.from({ length: count }, (_, index) => {
    const [color, accent] = pick(COLORS, random);
    return {
      id: `monster-${index}`,
      shape: SHAPES[(firstShape + index) % SHAPES.length],
      color,
      accent,
      mouth: pick(MOUTHS, random),
      eyes: 1 + Math.floor(random() * 3),
      horns: Math.floor(random() * 3),
      antennae: Math.floor(random() * 3),
      pose: Math.floor(random() * 3),
    };
  });

  const monsters = shuffle(designs, random);
  const shadows = shuffle(designs, random);
  if (shadows.every((monster, index) => monster.id === monsters[index].id)) {
    shadows.push(shadows.shift()!);
  }

  return { monsters, shadows };
}
