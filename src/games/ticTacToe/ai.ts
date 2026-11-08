import { findWinningLine, otherAnimal, playMove, type Animal, type Cell, type Round } from './engine';

export type Difficulty = 'easy' | 'medium' | 'hard';
const emptyCells = (board: readonly Cell[]) => board.flatMap((cell, i) => cell ? [] : [i]);
const minimaxCache = new Map<string, number>();

function winningMove(round: Round, animal: Animal, legal: number[]): number | null {
  const board = [...round.board];
  for (const i of legal) {
    board[i] = animal;
    const line = findWinningLine(board, round.size, round.target, i);
    board[i] = null;
    if (line) return i;
  }
  return null;
}

function minimax(round: Round, robot: Animal): number {
  if (round.result) return round.result.winner === robot ? 100 - round.moves : round.result.winner ? round.moves - 100 : 0;
  const key = robot + round.turn + round.board.map(c => c === 'kitten' ? 'k' : c === 'puppy' ? 'p' : '.').join('');
  const cached = minimaxCache.get(key);
  if (cached !== undefined) return cached;
  const scores = emptyCells(round.board).map(i => minimax(playMove(round, i, round.turn), robot));
  const score = round.turn === robot ? Math.max(...scores) : Math.min(...scores);
  minimaxCache.set(key, score);
  return score;
}

/** Score every unblocked five-cell window containing a proposed move, including gaps. */
function potential(round: Round, index: number, animal: Animal): number {
  const { size, target, board } = round;
  const row = Math.floor(index / size);
  const col = index % size;
  const weights = [0, 2, 18, 150, 2500, 500000];
  let score = 0;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    for (let offset = 0; offset < target; offset++) {
      const startR = row - dr * offset;
      const startC = col - dc * offset;
      const endR = startR + dr * (target - 1);
      const endC = startC + dc * (target - 1);
      if (Math.min(startR, endR, startC, endC) < 0 || Math.max(startR, endR, startC, endC) >= size) continue;
      let count = 1;
      let blocked = false;
      for (let n = 0; n < target; n++) {
        const i = (startR + dr * n) * size + startC + dc * n;
        if (i === index) continue;
        if (board[i] === otherAnimal(animal)) { blocked = true; break; }
        if (board[i] === animal) count++;
      }
      if (!blocked) score += weights[count];
    }
  }
  return score;
}

function rankedCandidates(round: Round, animal: Animal, limit: number): { index: number; score: number }[] {
  const candidates = new Set<number>();
  round.board.forEach((cell, index) => {
    if (!cell) return;
    const r = Math.floor(index / round.size);
    const c = index % round.size;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < round.size && nc < round.size && !round.board[nr * round.size + nc]) candidates.add(nr * round.size + nc);
    }
  });
  if (!candidates.size) candidates.add(Math.floor(round.size / 2) * round.size + Math.floor(round.size / 2));
  const center = (round.size - 1) / 2;
  return [...candidates].map(index => ({
    index,
    score: potential(round, index, animal) + potential(round, index, otherAnimal(animal)) * 1.1
      - (Math.abs(Math.floor(index / round.size) - center) + Math.abs(index % round.size - center)) * 0.1,
  })).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, limit);
}

export function chooseMove(round: Round, difficulty: Difficulty, random = Math.random): number | null {
  if (round.result) return null;
  const legal = emptyCells(round.board);
  if (!legal.length) return null;
  const randomMove = () => legal[Math.min(legal.length - 1, Math.max(0, Math.floor(random() * legal.length)))];
  if (difficulty === 'easy') return randomMove();
  const win = winningMove(round, round.turn, legal);
  if (win !== null) return win;
  const block = winningMove(round, otherAnimal(round.turn), legal);
  if (block !== null) return block;
  if (difficulty === 'medium') return randomMove();
  if (round.size === 3) {
    return legal.map(index => ({ index, score: minimax(playMove(round, index, round.turn), round.turn) }))
      .sort((a, b) => b.score - a.score)[0].index;
  }
  // Two-ply heuristic search: at most twelve branches and six opponent replies.
  // Immediate wins/blocks above examine every empty cell, not just nearby cells.
  const candidates = rankedCandidates(round, round.turn, 12);
  let best = candidates[0].index;
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const next = playMove(round, candidate.index, round.turn);
    const replies = rankedCandidates(next, next.turn, 6);
    const score = candidate.score - (replies[0]?.score ?? 0) * 0.95;
    if (score > bestScore) { bestScore = score; best = candidate.index; }
  }
  return best;
}
