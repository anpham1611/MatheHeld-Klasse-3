import { PlayerProfile, GameScoreDetail, DbEngineInfo, SavedPlayerSummary } from '../types/game';

export interface LoadPlayerResponse {
  exists: boolean;
  player?: PlayerProfile;
  gameScores?: Record<string, GameScoreDetail>;
  engine?: DbEngineInfo;
  error?: string;
}

export interface SavePlayerResponse {
  success: boolean;
  saved?: boolean;
  player?: PlayerProfile;
  gameScores?: Record<string, GameScoreDetail>;
  engine?: DbEngineInfo;
  error?: string;
}

export async function fetchDbStatus(): Promise<DbEngineInfo | null> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function loadPlayerFromDb(name: string): Promise<LoadPlayerResponse> {
  try {
    const cleanName = encodeURIComponent(name.trim());
    const res = await fetch(`/api/players/${cleanName}`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('[PlayerService] Failed to load from server, using local fallback:', err);
    return {
      exists: false,
      error: err.message,
    };
  }
}

export async function savePlayerToDb(
  player: PlayerProfile,
  lastGameMeta?: {
    gameKey: string;
    score: number;
    starsEarned?: number;
    coinsEarned?: number;
  }
): Promise<SavePlayerResponse> {
  try {
    const payload = {
      name: player.name,
      avatar: player.avatar,
      stars: player.stars,
      euroCoins: player.euroCoins,
      currentStreak: player.currentStreak,
      highestStreak: player.highestStreak,
      unlockedHats: player.unlockedHats,
      equippedHat: player.equippedHat,
      capturedPokemon: player.capturedPokemon,
      totalProblemsSolved: player.totalProblemsSolved,
      scores: player.scores,
      lastGameKey: lastGameMeta?.gameKey,
      lastGameScore: lastGameMeta?.score,
      lastStarsEarned: lastGameMeta?.starsEarned,
      lastCoinsEarned: lastGameMeta?.coinsEarned,
    };

    const res = await fetch('/api/players/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('[PlayerService] Failed to save to server:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function fetchSavedPlayersList(): Promise<SavedPlayerSummary[]> {
  try {
    const res = await fetch('/api/players');
    if (!res.ok) return [];
    const data = await res.json();
    return data.players || [];
  } catch (err) {
    console.warn('[PlayerService] Failed to list players:', err);
    return [];
  }
}
