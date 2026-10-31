export type Cell = [x: number, y: number];
export const MAZE_MATRIX_SIZES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;
export type MazeMatrixSize = typeof MAZE_MATRIX_SIZES[number];

export interface MazeLevel {
  level: number;
  name: string;
  maxSteps: number;
  grid: number[][];
}

const activeLevels = new Map<MazeMatrixSize, MazeLevel>();
const levelSignatures = new Map<MazeMatrixSize, Set<number>>();
const levelVariations = new Map<MazeMatrixSize, Map<number, number>>();
const directions: Cell[] = [[0, -2], [2, 0], [0, 2], [-2, 0]];
const keyFor = ([x, y]: Cell) => `${x},${y}`;

const createRandom = (level: number, variation: number, matrixSize: number) => {
  let seed = (Math.imul(level, 0x9e3779b1) ^ Math.imul(variation + 1, 0x85ebca6b) ^ Math.imul(matrixSize, 0xc2b2ae35)) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const findShortestPath = (grid: number[][], start: Cell, goal: Cell): Cell[] => {
  const parents = new Map<string, Cell | null>([[keyFor(start), null]]);
  const queue = [start];

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const [x, y] = queue[cursor];
    if (x === goal[0] && y === goal[1]) break;
    for (const [dx, dy] of directions) {
      const next: Cell = [x + dx / 2, y + dy / 2];
      if (grid[next[1]]?.[next[0]] !== 0 || parents.has(keyFor(next))) continue;
      parents.set(keyFor(next), queue[cursor]);
      queue.push(next);
    }
  }

  const path: Cell[] = [];
  let cell: Cell | null | undefined = goal;
  while (cell) {
    path.push(cell);
    cell = parents.get(keyFor(cell));
  }
  return path.reverse();
};

const generateMazeLevel = (level: number, variation: number, size: MazeMatrixSize): MazeLevel => {
  const grid = Array.from({ length: size }, () => Array<number>(size).fill(1));
  const random = createRandom(level, variation, size);
  const stack: Cell[] = [[1, 1]];
  grid[1][1] = 0;

  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const available = directions
      .map(([dx, dy]) => [x + dx, y + dy] as Cell)
      .filter(([nextX, nextY]) => nextX > 0 && nextY > 0 && nextX < size - 1 && nextY < size - 1 && grid[nextY][nextX] === 1);
    if (!available.length) {
      stack.pop();
      continue;
    }

    const [nextX, nextY] = available[Math.floor(random() * available.length)];
    grid[(y + nextY) / 2][(x + nextX) / 2] = 0;
    grid[nextY][nextX] = 0;
    stack.push([nextX, nextY]);
  }

  const braidCandidates: Cell[] = [];
  for (let y = 1; y < size - 1; y += 1) {
    for (let x = 1; x < size - 1; x += 1) {
      if (grid[y][x] !== 1) continue;
      const openNeighbors = [[0, -1], [1, 0], [0, 1], [-1, 0]]
        .filter(([dx, dy]) => grid[y + dy][x + dx] === 0).length;
      if (openNeighbors >= 2) braidCandidates.push([x, y]);
    }
  }
  for (let i = braidCandidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [braidCandidates[i], braidCandidates[j]] = [braidCandidates[j], braidCandidates[i]];
  }
  const progress = (level - 1) / 99;
  const braidCount = Math.min(braidCandidates.length, Math.max(1, Math.floor(braidCandidates.length * (0.01 + 0.18 * progress))));
  for (const [x, y] of braidCandidates.slice(0, braidCount)) grid[y][x] = 0;

  const start: Cell = [1, 1];
  const last = size - 2 - (size % 2 === 0 ? 1 : 0);
  const goal: Cell = [last, last];
  const solution = findShortestPath(grid, start, goal);
  grid[start[1]][start[0]] = 2;
  grid[goal[1]][goal[0]] = 3;
  const coin = solution[Math.floor((solution.length - 1) / 2)];
  grid[coin[1]][coin[0]] = 4;

  const zone = Math.floor((level - 1) / 20);
  const names = ['Kristallgänge', 'Sternenwald', 'Mondkrater', 'Roboterfabrik', 'Nebellabyrinth'];
  const detourAllowance = Math.max(10, Math.floor((solution.length - 1) * (0.03 + progress * 0.08)));
  return {
    level,
    name: `${names[zone]} ${level}`,
    maxSteps: solution.length - 1 + detourAllowance,
    grid,
  };
};

const hashGrid = (grid: number[][]): number => {
  let hash = 2166136261;
  hash = Math.imul(hash ^ grid.length, 16777619);
  hash = Math.imul(hash ^ grid[0].length, 16777619);
  for (const row of grid) for (const cell of row) hash = Math.imul(hash ^ cell, 16777619);
  return hash >>> 0;
};

export const getMazeLevel = (level: number, matrixSize: MazeMatrixSize = 10): MazeLevel => {
  const levelNumber = Math.max(1, Math.min(100, Math.floor(level)));
  if (activeLevels.get(matrixSize)?.level === levelNumber) return activeLevels.get(matrixSize)!;

  let signatures = levelSignatures.get(matrixSize);
  if (!signatures) {
    signatures = new Set();
    levelSignatures.set(matrixSize, signatures);
  }
  let variations = levelVariations.get(matrixSize);
  if (!variations) {
    variations = new Map();
    levelVariations.set(matrixSize, variations);
  }

  for (let nextLevel = 1; nextLevel <= levelNumber; nextLevel += 1) {
    if (variations.has(nextLevel)) continue;

    let generated: MazeLevel | undefined;
    let selectedVariation = 0;
    for (let variation = 0; variation < 1000 && !generated; variation += 1) {
      const candidate = generateMazeLevel(nextLevel, variation, matrixSize);
      const signature = hashGrid(candidate.grid);
      if (!signatures.has(signature)) {
        generated = candidate;
        selectedVariation = variation;
        signatures.add(signature);
      }
    }
    if (!generated) throw new Error(`Could not create a unique maze for level ${nextLevel}`);
    variations.set(nextLevel, selectedVariation);
    if (nextLevel === levelNumber) activeLevels.set(matrixSize, generated);
  }

  if (activeLevels.get(matrixSize)?.level === levelNumber) return activeLevels.get(matrixSize)!;
  const variation = variations.get(levelNumber)!;
  const generated = generateMazeLevel(levelNumber, variation, matrixSize);
  activeLevels.set(matrixSize, generated);
  return generated;
};

export const findCell = (grid: number[][], value: number): Cell => {
  const y = grid.findIndex((row) => row.includes(value));
  return [grid[y].indexOf(value), y];
};

export const isWalkable = (grid: number[][], [x, y]: Cell): boolean =>
  y >= 0 && y < grid.length && x >= 0 && x < grid[y].length && grid[y][x] !== 1;

export const sameCell = ([ax, ay]: Cell, [bx, by]: Cell): boolean => ax === bx && ay === by;

export const adjacentCells = ([ax, ay]: Cell, [bx, by]: Cell): boolean =>
  Math.abs(ax - bx) + Math.abs(ay - by) === 1;
