import { PlayerProfile } from '../types/game';

export function scoreAfterGame(
  scores: PlayerProfile['scores'],
  gameKey: keyof PlayerProfile['scores'],
  scoreAchieved: number,
): number {
  const safeScore = Math.max(0, scoreAchieved);

  // Live / continuous modes where score increments on correct and decrements on wrong
  if (gameKey === 'minecraft' || gameKey === 'pokemon' || gameKey === 'mathbrick' || gameKey === 'logic_game' || gameKey === 'roboforge') {
    return safeScore;
  }

  // Session quest games: save highest score achieved in that quest
  return Math.max(scores[gameKey] || 0, safeScore);
}

export function totalGameScore(scores: PlayerProfile['scores']): number {
  return Object.values(scores).reduce(
    (total, score) => total + (typeof score === 'number' ? score : 0),
    0,
  );
}
