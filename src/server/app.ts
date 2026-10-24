import express, { Request, Response } from 'express';
import {
  getEngineInfo,
  getMathBrickBuild,
  getPlayerByName,
  initDatabase,
  listAllPlayers,
  saveMathBrickBuild,
  savePlayerProfile,
  renamePlayer,
  createPlayer,
  deletePlayer,
} from './db.js';
import { BRICK_CATALOG, getBrickDimensions, getBrickPiece } from '../math/brickCatalog.js';
import { BaseGridSize, blockFitsBaseGrid, blocksOverlap, DEFAULT_BASE_GRID_SIZE, isBaseGridSize } from '../math/brickBuilding.js';
import type { VoxelBlock } from '../math/minecraftCurriculum.js';

export const app = express();
app.use(express.json());

const VALID_BLOCK_TYPES: VoxelBlock['type'][] = ['dirt', 'wood', 'cobblestone', 'iron', 'fence', 'cake', 'chest', 'chicken'];
const VALID_BLOCK_COLORS = new Set(['#e53935', '#1e88e5', '#fdd835', '#43a047', '#f5f5f5', '#263238', '#fb8c00', '#8e24aa']);
const VALID_ROTATIONS = new Set([0, 90, 180, 270]);

function parseMathBrickBuild(value: unknown): { blocks: VoxelBlock[]; inventory: Record<string, number>; gridSize: BaseGridSize } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as { blocks?: unknown; inventory?: unknown; gridSize?: unknown };
  const gridSize = source.gridSize === undefined ? DEFAULT_BASE_GRID_SIZE : source.gridSize;
  if (!isBaseGridSize(gridSize)) return null;
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
    if (!blockFitsBaseGrid(safeBlock, gridSize)
      || safeBlock.y < 0 || safeBlock.y + dimensions.height > 39
      || blocks.some((placed) => blocksOverlap(placed, safeBlock))) return null;
    blocks.push(safeBlock);
  }

  return { blocks, inventory, gridSize };
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

// 5. Rename player (safe update of nickname without cloning!)
app.post('/api/players/rename', async (req: Request, res: Response) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || typeof oldName !== 'string' || !oldName.trim()) {
      return res.status(400).json({ success: false, error: 'Current player name is required' });
    }
    if (!newName || typeof newName !== 'string' || !newName.trim()) {
      return res.status(400).json({ success: false, error: 'New player name is required' });
    }

    const trimmedOld = oldName.trim();
    const trimmedNew = newName.trim();

    if (trimmedNew.length < 2 || trimmedNew.length > 20) {
      return res.status(400).json({ success: false, error: 'Name must be between 2 and 20 characters' });
    }

    const updated = await renamePlayer(trimmedOld, trimmedNew);
    res.json({
      success: true,
      renamed: true,
      player: updated?.player,
      gameScores: updated?.gameScores,
      engine: getEngineInfo(),
    });
  } catch (error: any) {
    console.error('Error renaming player:', error);
    if (error.code === 'NAME_EXISTS') {
      return res.status(409).json({ success: false, code: 'NAME_EXISTS', error: error.message });
    }
    res.status(500).json({ success: false, error: error.message || 'Rename error' });
  }
});

// 6. Create brand new player profile
app.post('/api/players/create', async (req: Request, res: Response) => {
  try {
    const { name, avatar } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Player name is required' });
    }

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      return res.status(400).json({ success: false, error: 'Name must be between 2 and 20 characters' });
    }

    const created = await createPlayer({ name: trimmed, avatar });
    res.json({
      success: true,
      created: true,
      player: created?.player,
      gameScores: created?.gameScores,
      engine: getEngineInfo(),
    });
  } catch (error: any) {
    console.error('Error creating player:', error);
    if (error.code === 'NAME_EXISTS') {
      return res.status(409).json({ success: false, code: 'NAME_EXISTS', error: error.message });
    }
    res.status(500).json({ success: false, error: error.message || 'Creation error' });
  }
});

// 7. Check nickname availability
app.get('/api/players/check/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name.trim();
    if (!name) return res.json({ success: true, exists: false, available: false });
    const existing = await getPlayerByName(name);
    res.json({
      success: true,
      name,
      exists: Boolean(existing),
      available: !existing,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Delete player profile
app.delete('/api/players/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name.trim();
    if (!name) {
      return res.status(400).json({ success: false, error: 'Player name is required' });
    }
    await deletePlayer(name);
    res.json({ success: true, deleted: true });
  } catch (error: any) {
    console.error(`Error deleting player ${req.params.name}:`, error);
    res.status(500).json({ success: false, error: error.message || 'Delete error' });
  }
});
