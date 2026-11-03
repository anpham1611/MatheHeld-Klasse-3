import { PlayerProfile } from '../types/game';
import { GAME_CATALOG, GAME_SCORE_KEYS } from './gameCatalog';

export function scoreAfterGame(
  scores: PlayerProfile['scores'],
  gameKey: keyof PlayerProfile['scores'],
  scoreAchieved: number,
): number {
  const safeScore = Math.max(0, scoreAchieved);

  if (GAME_CATALOG[gameKey].scoreMode === 'running') {
    return safeScore;
  }

  return Math.max(scores[gameKey] || 0, safeScore);
}

export function totalGameScore(scores: PlayerProfile['scores']): number {
  return GAME_SCORE_KEYS.reduce((total, key) => total + (scores[key] || 0), 0);
}
