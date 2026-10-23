import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initDatabase,
  getEngineInfo,
  getPlayerByName,
  listAllPlayers,
  savePlayerProfile,
} from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes

// 1. Database status & engine info
app.get('/api/status', (req: Request, res: Response) => {
  const engineInfo = getEngineInfo();
  res.json({
    status: 'ok',
    ...engineInfo,
    timestamp: new Date().toISOString(),
  });
});

// 2. List recent players (for quick picker & account switching)
app.get('/api/players', async (req: Request, res: Response) => {
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

// Vite middleware (dev) or Static build (production)
async function startServer() {
  try {
    // Initialize DB tables
    await initDatabase();
  } catch (err) {
    console.error('[DB] Failed to initialize database:', err);
  }

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} [Mode: ${isProduction ? 'Production' : 'Development'}]`);
    console.log(`Active DB Engine: ${getEngineInfo().engine} (${getEngineInfo().databaseTarget})`);
  });
}

startServer();
