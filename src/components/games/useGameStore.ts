import { create } from 'zustand';
import { adjacentCells, findCell, getMazeLevel, isWalkable, sameCell, type Cell, type MazeMatrixSize } from './mazeLevels';

export type MazeGameState = 'PLANNING' | 'EXECUTING' | 'WIN' | 'GAMEOVER';

interface CompletionReward {
  level: number;
  starsEarned: number;
  starsForLevel: number;
  coinsEarned: number;
}

interface GameStore {
  currentLevel: number;
  matrixSize: MazeMatrixSize;
  gameState: MazeGameState;
  plannedPath: Cell[];
  isDrawingPath: boolean;
  attemptsThisLevel: number;
  coinsCollected: number;
  playerPosition: Cell;
  bestStarsByLevel: Record<number, number>;
  levelStars: number;
  collectedCoins: string[];
  unclaimedCoins: number;
  lastResult: 'missed-goal' | 'wall' | null;
  addPathStep: (cell: Cell) => void;
  startPathDrawing: () => void;
  endPathDrawing: () => void;
  clearPath: () => void;
  setMatrixSize: (size: MazeMatrixSize) => void;
  startExecution: () => void;
  movePlayer: (cell: Cell) => boolean;
  finishExecution: (success: boolean) => CompletionReward | null;
  resetLevel: () => void;
  nextLevel: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentLevel: 1,
  matrixSize: 10,
  gameState: 'PLANNING',
  plannedPath: [],
  isDrawingPath: false,
  attemptsThisLevel: 0,
  coinsCollected: 0,
  playerPosition: [1, 1],
  bestStarsByLevel: {},
  levelStars: 0,
  collectedCoins: [],
  unclaimedCoins: 0,
  lastResult: null,

  addPathStep: (cell) => set((state) => {
    if (state.gameState !== 'PLANNING') return state;
    const level = getMazeLevel(state.currentLevel, state.matrixSize);
    const start = findCell(level.grid, 2);
    const previous = state.plannedPath.length
      ? state.plannedPath[state.plannedPath.length - 1]
      : start;

    if (state.plannedPath.length && sameCell(cell, state.plannedPath[state.plannedPath.length - 1])) {
      return { plannedPath: state.plannedPath.slice(0, -1), lastResult: null };
    }
    if (state.plannedPath.length && sameCell(cell, state.plannedPath[state.plannedPath.length - 2] ?? start)) {
      return { plannedPath: state.plannedPath.slice(0, -1), lastResult: null };
    }
    if (state.plannedPath.length >= level.maxSteps
      || !adjacentCells(previous, cell)
      || !isWalkable(level.grid, cell)
      || state.plannedPath.some((step) => sameCell(step, cell))) return state;

    return { plannedPath: [...state.plannedPath, cell], lastResult: null };
  }),

  startPathDrawing: () => set((state) => state.gameState === 'PLANNING' ? { isDrawingPath: true } : state),
  endPathDrawing: () => set({ isDrawingPath: false }),

  clearPath: () => set((state) => state.gameState === 'PLANNING'
    ? { plannedPath: [], isDrawingPath: false, lastResult: null }
    : state),

  setMatrixSize: (matrixSize) => set((state) => matrixSize === state.matrixSize ? state : ({
    matrixSize,
    currentLevel: 1,
    gameState: 'PLANNING',
    plannedPath: [],
    isDrawingPath: false,
    attemptsThisLevel: 0,
    coinsCollected: 0,
    playerPosition: [1, 1],
    bestStarsByLevel: {},
    levelStars: 0,
    collectedCoins: [],
    unclaimedCoins: 0,
    lastResult: null,
  })),

  startExecution: () => set((state) => state.gameState === 'PLANNING' && !state.isDrawingPath && state.plannedPath.length
    ? { gameState: 'EXECUTING', attemptsThisLevel: state.attemptsThisLevel + 1, playerPosition: [1, 1], lastResult: null }
    : state),

  movePlayer: (cell) => {
    const state = get();
    const level = getMazeLevel(state.currentLevel, state.matrixSize);
    if (state.gameState !== 'EXECUTING' || !adjacentCells(state.playerPosition, cell)) return false;
    if (!isWalkable(level.grid, cell)) {
      set({ playerPosition: [1, 1], plannedPath: [], isDrawingPath: false, gameState: 'PLANNING', lastResult: 'wall' });
      return false;
    }

    const isCoin = level.grid[cell[1]][cell[0]] === 4;
    const coinKey = `${state.currentLevel}:${state.matrixSize}:${cell[0]},${cell[1]}`;
    const collectCoin = isCoin && !state.collectedCoins.includes(coinKey);
    set({
      playerPosition: cell,
      ...(collectCoin ? {
        collectedCoins: [...state.collectedCoins, coinKey],
        coinsCollected: state.coinsCollected + 1,
        unclaimedCoins: state.unclaimedCoins + 1,
      } : {}),
    });
    return true;
  },

  finishExecution: (success) => {
    const state = get();
    if (state.gameState !== 'EXECUTING') return null;
    const level = getMazeLevel(state.currentLevel, state.matrixSize);
    const reachedGoal = sameCell(state.playerPosition, findCell(level.grid, 3));
    if (!success || !reachedGoal) {
      set({ gameState: 'PLANNING', plannedPath: [], isDrawingPath: false, playerPosition: [1, 1], lastResult: 'missed-goal' });
      return null;
    }

    const starsForLevel = Math.max(0, 3 - (state.attemptsThisLevel - 1));
    const previousBest = state.bestStarsByLevel[state.currentLevel] ?? 0;
    const reward = {
      level: state.currentLevel,
      starsEarned: Math.max(0, starsForLevel - previousBest),
      starsForLevel,
      coinsEarned: state.unclaimedCoins,
    };
    set({
      gameState: 'WIN',
      levelStars: starsForLevel,
      bestStarsByLevel: { ...state.bestStarsByLevel, [state.currentLevel]: Math.max(previousBest, starsForLevel) },
      unclaimedCoins: 0,
      lastResult: null,
    });
    return reward;
  },

  resetLevel: () => set((state) => ({
    gameState: 'PLANNING',
    plannedPath: [],
    isDrawingPath: false,
    attemptsThisLevel: 0,
    playerPosition: [1, 1],
    levelStars: 0,
    lastResult: null,
  })),

  nextLevel: () => set((state) => {
    if (state.currentLevel >= 100) return state;
    const currentLevel = state.currentLevel + 1;
    return {
      currentLevel,
      gameState: 'PLANNING',
      plannedPath: [],
      isDrawingPath: false,
      attemptsThisLevel: 0,
      playerPosition: [1, 1],
      levelStars: 0,
      lastResult: null,
    };
  }),
}));
