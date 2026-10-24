import { PlayerProfile, GameScoreDetail, DbEngineInfo, SavedPlayerSummary } from '../types/game';
import type { VoxelBlock } from '../math/minecraftCurriculum';
import { BaseGridSize, DEFAULT_BASE_GRID_SIZE, isBaseGridSize } from '../math/brickBuilding';

export interface SavedMathBrickBuild {
  blocks: VoxelBlock[];
  inventory: Record<string, number>;
  gridSize: BaseGridSize;
}

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

export async function loadMathBrickBuild(playerName: string): Promise<SavedMathBrickBuild | null> {
  const response = await fetch(`/api/players/${encodeURIComponent(playerName.trim())}/mathbrick-build`);
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  const data = await response.json();
  const build = data.savedBuild as Partial<SavedMathBrickBuild> | null;
  if (!build) return null;
  return {
    ...build,
    gridSize: isBaseGridSize(build.gridSize) ? build.gridSize : DEFAULT_BASE_GRID_SIZE,
  } as SavedMathBrickBuild;
}

export async function saveMathBrickBuild(playerName: string, build: SavedMathBrickBuild): Promise<void> {
  const response = await fetch(`/api/players/${encodeURIComponent(playerName.trim())}/mathbrick-build`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(build),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || `Server returned ${response.status}`);
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

export async function renamePlayerInDb(
  oldName: string,
  newName: string
): Promise<SavePlayerResponse & { code?: string }> {
  try {
    const res = await fetch('/api/players/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName: oldName.trim(), newName: newName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Server error (${res.status})`,
        code: data.code,
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi kết nối khi đổi tên',
    };
  }
}

export async function createPlayerInDb(
  name: string,
  avatar: string = 'fuchs'
): Promise<SavePlayerResponse & { code?: string }> {
  try {
    const res = await fetch('/api/players/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), avatar }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Server error (${res.status})`,
        code: data.code,
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi kết nối khi tạo tài khoản',
    };
  }
}

export async function deletePlayerInDb(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(name.trim())}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Xoá thất bại' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối' };
  }
}

export async function checkPlayerNameAvailability(name: string): Promise<{ available: boolean; exists: boolean }> {
  try {
    const clean = name.trim();
    if (!clean || clean.length < 2) return { available: false, exists: false };
    const res = await loadPlayerFromDb(clean);
    if (res.exists) {
      return { available: false, exists: true };
    }
    return { available: true, exists: false };
  } catch {
    return { available: false, exists: false };
  }
}

