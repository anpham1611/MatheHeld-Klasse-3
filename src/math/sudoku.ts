export type SudokuDifficultyId = 'easy' | 'medium' | 'hard' | 'expert' | 'master' | 'extreme';

export interface SudokuDifficulty {
  id: SudokuDifficultyId;
  name: string;
  size: 4 | 6 | 9;
  boxRows: 2 | 3;
  boxCols: 2 | 3;
  targetClues: number;
}

export interface SudokuPuzzle extends SudokuDifficulty {
  puzzle: number[][];
  clueCount: number;
}

export const SUDOKU_LEVELS: SudokuDifficulty[] = [
  { id: 'easy', name: 'Einfach', size: 4, boxRows: 2, boxCols: 2, targetClues: 10 },
  { id: 'medium', name: 'Mittel', size: 4, boxRows: 2, boxCols: 2, targetClues: 7 },
  { id: 'hard', name: 'Schwer', size: 6, boxRows: 2, boxCols: 3, targetClues: 24 },
  { id: 'expert', name: 'Experte', size: 6, boxRows: 2, boxCols: 3, targetClues: 18 },
  { id: 'master', name: 'Meister', size: 9, boxRows: 3, boxCols: 3, targetClues: 40 },
  { id: 'extreme', name: 'Extrem', size: 9, boxRows: 3, boxCols: 3, targetClues: 32 },
];

function shuffle<T>(values: T[], random: () => number): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function shuffledGroups(groupCount: number, groupSize: number, random: () => number): number[] {
  return shuffle(Array.from({ length: groupCount }, (_, index) => index), random)
    .flatMap((group) => shuffle(Array.from({ length: groupSize }, (_, index) => group * groupSize + index), random));
}

function createSolution(level: SudokuDifficulty, random: () => number): number[][] {
  const rowOrder = shuffledGroups(level.size / level.boxRows, level.boxRows, random);
  const columnOrder = shuffledGroups(level.size / level.boxCols, level.boxCols, random);
  const digits = shuffle(Array.from({ length: level.size }, (_, index) => index + 1), random);

  return rowOrder.map((row) => columnOrder.map((column) => {
    const pattern = (level.boxCols * (row % level.boxRows) + Math.floor(row / level.boxRows) + column) % level.size;
    return digits[pattern];
  }));
}

export function isValidSudokuMove(
  grid: number[][],
  row: number,
  column: number,
  value: number,
  boxRows: number,
  boxCols: number,
): boolean {
  const size = grid.length;
  for (let index = 0; index < size; index += 1) {
    if (index !== column && grid[row][index] === value) return false;
    if (index !== row && grid[index][column] === value) return false;
  }

  const firstRow = Math.floor(row / boxRows) * boxRows;
  const firstColumn = Math.floor(column / boxCols) * boxCols;
  for (let currentRow = firstRow; currentRow < firstRow + boxRows; currentRow += 1) {
    for (let currentColumn = firstColumn; currentColumn < firstColumn + boxCols; currentColumn += 1) {
      if ((currentRow !== row || currentColumn !== column) && grid[currentRow][currentColumn] === value) return false;
    }
  }
  return true;
}

function countSolutions(grid: number[][], level: SudokuDifficulty, stopAfter = 2): number {
  let solutions = 0;

  const search = (): void => {
    if (solutions >= stopAfter) return;

    let bestRow = -1;
    let bestColumn = -1;
    let bestValues: number[] | null = null;

    for (let row = 0; row < level.size; row += 1) {
      for (let column = 0; column < level.size; column += 1) {
        if (grid[row][column] !== 0) continue;
        const possibleValues = Array.from({ length: level.size }, (_, index) => index + 1)
          .filter((value) => isValidSudokuMove(grid, row, column, value, level.boxRows, level.boxCols));
        if (possibleValues.length === 0) return;
        if (bestValues === null || possibleValues.length < bestValues.length) {
          bestRow = row;
          bestColumn = column;
          bestValues = possibleValues;
          if (bestValues.length === 1) break;
        }
      }
      if (bestValues?.length === 1) break;
    }

    if (bestValues === null) {
      solutions += 1;
      return;
    }

    for (const value of bestValues) {
      grid[bestRow][bestColumn] = value;
      search();
      grid[bestRow][bestColumn] = 0;
      if (solutions >= stopAfter) return;
    }
  };

  search();
  return solutions;
}

export function generateSudokuPuzzle(
  difficultyId: SudokuDifficultyId,
  random: () => number = Math.random,
): SudokuPuzzle {
  const level = SUDOKU_LEVELS.find(({ id }) => id === difficultyId) ?? SUDOKU_LEVELS[0];
  const solution = createSolution(level, random);
  const puzzle = solution.map((row) => [...row]);
  let clueCount = level.size * level.size;

  for (const cellIndex of shuffle(Array.from({ length: clueCount }, (_, index) => index), random)) {
    if (clueCount <= level.targetClues) break;
    const row = Math.floor(cellIndex / level.size);
    const column = cellIndex % level.size;
    const originalValue = puzzle[row][column];
    puzzle[row][column] = 0;

    if (countSolutions(puzzle, level) === 1) {
      clueCount -= 1;
    } else {
      puzzle[row][column] = originalValue;
    }
  }

  return { ...level, puzzle, clueCount };
}

export function isSudokuSolved(grid: number[][], boxRows: number, boxCols: number): boolean {
  const size = grid.length;
  const expected = new Set(Array.from({ length: size }, (_, index) => index + 1));
  const rowsValid = grid.every((row) => row.length === size && new Set(row).size === size && row.every((value) => expected.has(value)));
  if (!rowsValid) return false;

  for (let column = 0; column < size; column += 1) {
    if (new Set(grid.map((row) => row[column])).size !== size) return false;
  }
  for (let firstRow = 0; firstRow < size; firstRow += boxRows) {
    for (let firstColumn = 0; firstColumn < size; firstColumn += boxCols) {
      const box = [];
      for (let row = firstRow; row < firstRow + boxRows; row += 1) {
        for (let column = firstColumn; column < firstColumn + boxCols; column += 1) box.push(grid[row][column]);
      }
      if (new Set(box).size !== size) return false;
    }
  }
  return true;
}
