import express, { Request, Response } from 'express';
import {
  getEngineInfo,
  getMathBrickBuild,
  getPlayerByName,
  initDatabase,
  listAllPlayers,
  saveMathBrickBuild,
  savePlayerProfile,
} from './db.js';
import { BRICK_CATALOG, getBrickDimensions, getBrickPiece } from '../math/brickCatalog.js';
import { blocksOverlap } from '../math/brickBuilding.js';
import type { VoxelBlock } from '../math/minecraftCurriculum.js';

export const app = express();
app.use(express.json());

const VALID_BLOCK_TYPES: VoxelBlock['type'][] = ['dirt', 'wood', 'cobblestone', 'iron', 'fence', 'cake', 'chest', 'chicken'];
const VALID_BLOCK_COLORS = new Set(['#e53935', '#1e88e5', '#fdd835', '#43a047', '#f5f5f5', '#263238', '#fb8c00', '#8e24aa']);
const VALID_ROTATIONS = new Set([0, 90, 180, 270]);

function parseMathBrickBuild(value: unknown): { blocks: VoxelBlock[]; inventory: Record<string, number> } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as { blocks?: unknown; inventory?: unknown };
  if (!Array.isArray(source.blocks) || source.blocks.length > 400 || !source.inventory || typeof source.inventory !== 'object' || Array.isArray(source.inventory)) return null;

  const storedInventory = source.inventory as Record<string, unknown>;
  const catalogIds = new Set(BRICK_CATALOG.map(({ id }) => id));
  if (Object.keys(storedInventory).some((id) => !catalogIds.has(id))) return null;
  const inventory: Record<string, number> = {};
  for (const { id } of BRICK_CATALOG) {
    const amount = storedInventory[id] ?? 0;
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0 || amount > 999999) return null;
    inventory[id] = amount;
  }

  const blocks: VoxelBlock[] = [];
  for (const item of source.blocks) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const block = item as Record<string, unknown>;
    const { x, y, z, type, pieceId, rotation, brickColor } = block;
    if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)
      || typeof type !== 'string' || !VALID_BLOCK_TYPES.includes(type as VoxelBlock['type'])
      || typeof pieceId !== 'string' || !getBrickPiece(pieceId)
      || (rotation !== undefined && (typeof rotation !== 'number' || !VALID_ROTATIONS.has(rotation)))
      || (brickColor !== undefined && (typeof brickColor !== 'string' || !VALID_BLOCK_COLORS.has(brickColor)))) return null;

    const safeRotation = typeof rotation === 'number' ? rotation : 0;
    const dimensions = getBrickDimensions(pieceId, safeRotation);
    const safeBlock: VoxelBlock = {
      x: x as number,
      y: y as number,
      z: z as number,
      type: type as VoxelBlock['type'],
      pieceId,
      rotation: safeRotation as VoxelBlock['rotation'],
      ...(typeof brickColor === 'string' ? { brickColor } : {}),
    };
    if (safeBlock.x < -9 || safeBlock.z < -9
      || safeBlock.x + dimensions.width - 1 > 9 || safeBlock.z + dimensions.depth - 1 > 9
      || safeBlock.y < 0 || safeBlock.y + dimensions.height > 39
      || blocks.some((placed) => blocksOverlap(placed, safeBlock))) return null;
    blocks.push(safeBlock);
  }

  return { blocks, inventory };
}

let databaseInitialization: Promise<void> | undefined;

export function initializeServer(): Promise<void> {
  databaseInitialization ??= initDatabase().catch((error) => {
    console.error('[DB] Failed to initialize database:', error);
  });
  return databaseInitialization;
}

// 1. Database status & engine info
app.get('/api/status', (_req: Request, res: Response) => {
  const engineInfo = getEngineInfo();
  res.json({
    status: 'ok',
    ...engineInfo,
    timestamp: new Date().toISOString(),
  });
});

// 2. List recent players (for quick picker & account switching)
app.get('/api/players', async (_req: Request, res: Response) => {
  try {
    const players = await listAllPlayers();
    res.json({
      success: true,
      players,
      engine: getEngineInfo(),
    });
  } catch (error: any) {
    console.error('Error fetching players:', error);
    res.status(500).json({ success: false, error: error.message || 'Database error' });
  }
});

// 3. Get single player by name with separate game scores
app.get('/api/players/:name', async (req: Request, res: Response) => {
  try {
    const rawName = req.params.name;
    const data = await getPlayerByName(rawName);

    if (!data) {
      return res.json({
        success: true,
        exists: false,
        name: rawName,
        message: 'Player not found in database',
        engine: getEngineInfo(),
      });
    }

    res.json({
      success: true,
      exists: true,
      player: data.player,
      gameScores: data.gameScores,
      engine: getEngineInfo(),
    });
  } catch (error: any) {
    console.error(`Error loading player ${req.params.name}:`, error);
    res.status(500).json({ success: false, error: error.message || 'Database error' });
  }
});

app.get('/api/players/:name/mathbrick-build', async (req: Request, res: Response) => {
  try {
    const build = await getMathBrickBuild(req.params.name);
    res.json({ success: true, ...build });
  } catch (error: any) {
    console.error(`Error loading MathBrick build for ${req.params.name}:`, error);
    res.status(500).json({ success: false, error: error.message || 'Database error' });
  }
});

app.put('/api/players/:name/mathbrick-build', async (req: Request, res: Response) => {
  try {
    const name = req.params.name.trim();
    if (!name || name.length > 100) {
      return res.status(400).json({ success: false, error: 'Valid player name is required' });
    }
    const build = parseMathBrickBuild(req.body);
    if (!build) {
      return res.status(400).json({ success: false, error: 'Invalid MathBrick build data' });
    }
    const saved = await saveMathBrickBuild(name, build);
    if (!saved) return res.status(404).json({ success: false, error: 'Player not found' });
    res.json({ success: true, saved: true });
  } catch (error: any) {
    console.error(`Error saving MathBrick build for ${req.params.name}:`, error);
    res.status(500).json({ success: false, error: error.message || 'Database error' });
  }
});

// 4. Save/Update player profile and per-game scores
app.post('/api/players/save', async (req: Request, res: Response) => {
  try {
    const {
      name,
      avatar,
      stars,
      euroCoins,
      currentStreak,
      highestStreak,
      unlockedHats,
      equippedHat,
      capturedPokemon,
      totalProblemsSolved,
      scores,
      lastGameKey,
      lastGameScore,
      lastStarsEarned,
      lastCoinsEarned,
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Valid player name is required' });
    }

    const saved = await savePlayerProfile({
      name: name.trim(),
      avatar,
      stars: typeof stars === 'number' ? stars : undefined,
      euroCoins: typeof euroCoins === 'number' ? euroCoins : undefined,
      currentStreak: typeof currentStreak === 'number' ? currentStreak : undefined,
      highestStreak: typeof highestStreak === 'number' ? highestStreak : undefined,
      unlockedHats,
      equippedHat,
      capturedPokemon,
      totalProblemsSolved: typeof totalProblemsSolved === 'number' ? totalProblemsSolved : undefined,
      scores,
      lastGameKey,
      lastGameScore,
      lastStarsEarned,
      lastCoinsEarned,
    });

    res.json({
      success: true,
      saved: true,
      player: saved?.player,
      gameScores: saved?.gameScores,
      engine: getEngineInfo(),
    });
  } catch (error: any) {
    console.error('Error saving player:', error);
    res.status(500).json({ success: false, error: error.message || 'Save error' });
  }
});
