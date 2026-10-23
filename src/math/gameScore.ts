import { PlayerProfile } from '../types/game';

export function scoreAfterGame(
  scores: PlayerProfile['scores'],
  gameKey: keyof PlayerProfile['scores'],
  scoreAchieved: number,
): number {
  if (gameKey === 'logic_game') {
    return (scores.logic_game || 0) + scoreAchieved;
  }

  return Math.max(scores[gameKey] || 0, scoreAchieved);
}
