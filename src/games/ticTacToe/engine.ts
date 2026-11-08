/** Pure rules shared by the renderer, robot, and online snapshot validator. */
export type Animal = 'kitten' | 'puppy';
export type Cell = Animal | null;
export interface Result {
  kind: 'line' | 'draw' | 'forfeit';
  winner: Animal | null;
  line: number[];
}
export interface Round {
  size: number;
  target: number;
  board: Cell[];
  turn: Animal;
  moves: number;
  result: Result | null;
}

export const otherAnimal = (animal: Animal): Animal => animal === 'kitten' ? 'puppy' : 'kitten';
export const validSize = (size: number): boolean => Number.isInteger(size) && (size === 3 || (size >= 5 && size <= 15));

export function createRound(size: number): Round {
  if (!validSize(size)) throw new Error('Choose 3×3 or a size from 5 through 15.');
  return { size, target: size === 3 ? 3 : 5, board: Array(size * size).fill(null), turn: 'kitten', moves: 0, result: null };
}

/** Scan coordinates, never flat offsets alone: offsets can wrap board edges. */
export function findWinningLine(board: readonly Cell[], size: number, target: number, index: number): number[] | null {
  const animal = board[index];
  if (!animal) return null;
  const row = Math.floor(index / size);
  const col = index % size;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const line = [index];
    for (const sign of [-1, 1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === animal) {
        if (sign < 0) line.unshift(r * size + c);
        else line.push(r * size + c);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= target) return line;
  }
  return null;
}

export function playMove(round: Round, index: number, animal: Animal): Round {
  if (round.result || animal !== round.turn || !Number.isInteger(index) || index < 0 || index >= round.board.length || round.board[index]) {
    throw new Error('Illegal move.');
  }
  const board = [...round.board];
  board[index] = animal;
  const moves = round.moves + 1;
  const line = findWinningLine(board, round.size, round.target, index);
  const result: Result | null = line
    ? { kind: 'line', winner: animal, line }
    : moves === board.length ? { kind: 'draw', winner: null, line: [] } : null;
  return { ...round, board, moves, turn: otherAnimal(animal), result };
}
