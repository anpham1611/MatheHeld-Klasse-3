import type { Animal } from './engine';

export type GameSymbol = 'X' | 'O';

// Preserve existing engine/network seat identifiers. Presentation uses only X/O;
// changing the wire keys would break host integrations for no gameplay benefit.
export const SYMBOL_BY_SEAT: Record<Animal, GameSymbol> = { kitten: 'X', puppy: 'O' };
export const SEAT_BY_SYMBOL: Record<GameSymbol, Animal> = { X: 'kitten', O: 'puppy' };
