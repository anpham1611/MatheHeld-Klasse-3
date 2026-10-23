import { createClient, Client } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

export interface DbPlayerRecord {
  id: number;
  name: string;
  avatar: string;
  stars: number;
  euro_coins: number;
  current_streak: number;
  highest_streak: number;
  unlocked_hats: string;
  equipped_hat: string;
  captured_pokemon: string;
  total_problems_solved: number;
  created_at: string;
  updated_at: string;
}

export interface DbGameScoreRecord {
  id?: number;
  player_id?: number;
  player_name: string;
  game_key: string;
  high_score: number;
  times_played: number;
  problems_solved: number;
  stars_earned: number;
  coins_earned: number;
  level_reached: number;
  details_json: string;
  updated_at?: string;
}

let dbInstance: Client | null = null;
let activeEngine: 'sqlite' | 'turso' = 'sqlite';

export function getEngineInfo() {
  const configured = (process.env.DB_ENGINE || '').toLowerCase().trim();
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  return {
    engine: activeEngine,
    configuredEngine: configured || 'sqlite',
    hasTursoUrl: Boolean(tursoUrl),
    databaseTarget: activeEngine === 'turso' ? (tursoUrl || 'turso-cloud') : (process.env.SQLITE_FILE || 'matheheld.db'),
  };
}

export function getDb(): Client {
  if (dbInstance) return dbInstance;

  const engine = (process.env.DB_ENGINE || '').toLowerCase().trim();
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (engine === 'turso' || (tursoUrl && !engine)) {
    if (!tursoUrl) {
      console.warn('[DB] DB_ENGINE is set to turso but TURSO_DATABASE_URL is missing. Falling back to SQLite.');
      activeEngine = 'sqlite';
      const sqliteFile = process.env.SQLITE_FILE || 'file:matheheld.db';
      dbInstance = createClient({ url: sqliteFile });
    } else {
      activeEngine = 'turso';
      console.log(`[DB] Connected to Turso database: ${tursoUrl}`);
      dbInstance = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      });
    }
  } else {
    activeEngine = 'sqlite';
    const sqliteFile = process.env.SQLITE_FILE || 'file:matheheld.db';
    console.log(`[DB] Connected to SQLite database: ${sqliteFile}`);
    dbInstance = createClient({
      url: sqliteFile,
    });
  }

  return dbInstance;
}

export async function initDatabase() {
  const db = getDb();

  // Create players table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      avatar TEXT DEFAULT 'fuchs',
      stars INTEGER DEFAULT 0,
      euro_coins INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      highest_streak INTEGER DEFAULT 0,
      unlocked_hats TEXT DEFAULT '["standard"]',
      equipped_hat TEXT DEFAULT 'standard',
      captured_pokemon TEXT DEFAULT '["pikachu"]',
      total_problems_solved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Create game_scores table: separate score and progress for each game
  await db.execute(`
    CREATE TABLE IF NOT EXISTS game_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER,
      player_name TEXT NOT NULL,
      game_key TEXT NOT NULL,
      high_score INTEGER DEFAULT 0,
      times_played INTEGER DEFAULT 0,
      problems_solved INTEGER DEFAULT 0,
      stars_earned INTEGER DEFAULT 0,
      coins_earned INTEGER DEFAULT 0,
      level_reached INTEGER DEFAULT 1,
      details_json TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(player_name, game_key)
    );
  `);

  // Create game_history table: log of past play sessions
  await db.execute(`
    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      game_key TEXT NOT NULL,
      score INTEGER NOT NULL,
      stars INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 0,
      played_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed default player if table is empty
  const countRes = await db.execute('SELECT COUNT(*) as count FROM players');
  const count = Number(countRes.rows[0]?.count || 0);

  if (count === 0) {
    console.log('[DB] Seeding default player profile (Leo der Fuchs)...');
    await db.execute({
      sql: `INSERT OR IGNORE INTO players (name, avatar, stars, euro_coins, current_streak, highest_streak, unlocked_hats, equipped_hat, captured_pokemon, total_problems_solved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'Leo der Fuchs',
        'fuchs',
        12,
        45,
        0,
        5,
        JSON.stringify(['standard']),
        'standard',
        JSON.stringify(['pikachu']),
        24,
      ],
    });

    const defaultScores = [
      { key: 'minecraft', score: 320, solved: 8, stars: 4, coins: 15 },
      { key: 'number_line', score: 450, solved: 6, stars: 3, coins: 10 },
      { key: 'einmaleins', score: 620, solved: 10, stars: 5, coins: 20 },
      { key: 'euro_shop', score: 380, solved: 5, stars: 2, coins: 0 },
      { key: 'tower_math', score: 250, solved: 4, stars: 2, coins: 0 },
      { key: 'pokemon', score: 150, solved: 2, stars: 1, coins: 5 },
    ];

    for (const ds of defaultScores) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO game_scores (player_name, game_key, high_score, times_played, problems_solved, stars_earned, coins_earned)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: ['Leo der Fuchs', ds.key, ds.score, 1, ds.solved, ds.stars, ds.coins],
      });
    }
  }

  console.log('[DB] Database tables initialized successfully.');
}

// Find player by name (case-insensitive)
export async function getPlayerByName(rawName: string) {
  const db = getDb();
  const name = rawName.trim();
  if (!name) return null;

  const result = await db.execute({
    sql: `SELECT * FROM players WHERE LOWER(name) = LOWER(?) LIMIT 1`,
    args: [name],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const actualName = String(row.name);

  // Get all individual game scores for this player
  const scoresResult = await db.execute({
    sql: `SELECT * FROM game_scores WHERE LOWER(player_name) = LOWER(?)`,
    args: [actualName],
  });

  const scoresMap: Record<string, number> = {
    minecraft: 0,
    number_line: 0,
    einmaleins: 0,
    euro_shop: 0,
    tower_math: 0,
    pokemon: 0,
    logic_game: 0,
  };

  const detailedGameScores: Record<string, any> = {};

  for (const sRow of scoresResult.rows) {
    const key = String(sRow.game_key);
    const highScore = Number(sRow.high_score || 0);
    scoresMap[key] = highScore;
    detailedGameScores[key] = {
      gameKey: key,
      highScore,
      timesPlayed: Number(sRow.times_played || 0),
      problemsSolved: Number(sRow.problems_solved || 0),
      starsEarned: Number(sRow.stars_earned || 0),
      coinsEarned: Number(sRow.coins_earned || 0),
      levelReached: Number(sRow.level_reached || 1),
      details: sRow.details_json ? JSON.parse(String(sRow.details_json)) : {},
      updatedAt: sRow.updated_at,
    };
  }

  let unlockedHats: string[] = ['standard'];
  try {
    unlockedHats = JSON.parse(String(row.unlocked_hats || '["standard"]'));
  } catch {}

  let capturedPokemon: string[] = [];
  try {
    capturedPokemon = JSON.parse(String(row.captured_pokemon || '[]'));
  } catch {}

  return {
    player: {
      id: Number(row.id),
      name: actualName,
      avatar: String(row.avatar || 'fuchs'),
      stars: Number(row.stars || 0),
      euroCoins: Number(row.euro_coins || 0),
      currentStreak: Number(row.current_streak || 0),
      highestStreak: Number(row.highest_streak || 0),
      unlockedHats,
      equippedHat: String(row.equipped_hat || 'standard'),
      capturedPokemon,
      totalProblemsSolved: Number(row.total_problems_solved || 0),
      scores: scoresMap,
    },
    gameScores: detailedGameScores,
  };
}

// List all players for quick switching
export async function listAllPlayers() {
  const db = getDb();
  const result = await db.execute(`
    SELECT p.id, p.name, p.avatar, p.stars, p.euro_coins, p.total_problems_solved, p.updated_at,
           COUNT(gs.id) as games_played,
           MAX(gs.high_score) as best_game_score
    FROM players p
    LEFT JOIN game_scores gs ON LOWER(gs.player_name) = LOWER(p.name)
    GROUP BY p.id
    ORDER BY p.updated_at DESC
    LIMIT 20
  `);

  return result.rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    avatar: String(r.avatar || 'fuchs'),
    stars: Number(r.stars || 0),
    euroCoins: Number(r.euro_coins || 0),
    totalProblemsSolved: Number(r.total_problems_solved || 0),
    bestGameScore: Number(r.best_game_score || 0),
    updatedAt: String(r.updated_at || ''),
  }));
}

// Upsert player profile and game scores
export async function savePlayerProfile(data: {
  name: string;
  avatar?: string;
  stars?: number;
  euroCoins?: number;
  currentStreak?: number;
  highestStreak?: number;
  unlockedHats?: string[];
  equippedHat?: string;
  capturedPokemon?: string[];
  totalProblemsSolved?: number;
  scores?: Record<string, number>;
  lastGameKey?: string;
  lastGameScore?: number;
  lastStarsEarned?: number;
  lastCoinsEarned?: number;
}) {
  const db = getDb();
  const name = data.name.trim();
  if (!name) throw new Error('Player name is required');

  const avatar = data.avatar || 'fuchs';
  const stars = data.stars ?? 0;
  const euroCoins = data.euroCoins ?? 0;
  const currentStreak = data.currentStreak ?? 0;
  const highestStreak = data.highestStreak ?? 0;
  const unlockedHats = JSON.stringify(data.unlockedHats || ['standard']);
  const equippedHat = data.equippedHat || 'standard';
  const capturedPokemon = JSON.stringify(data.capturedPokemon || []);
  const totalProblemsSolved = data.totalProblemsSolved ?? 0;

  // Check if player exists
  const existing = await db.execute({
    sql: `SELECT id, name FROM players WHERE LOWER(name) = LOWER(?) LIMIT 1`,
    args: [name],
  });

  let playerId: number;

  if (existing.rows.length > 0) {
    playerId = Number(existing.rows[0].id);
    const existingName = String(existing.rows[0].name);

    await db.execute({
      sql: `UPDATE players SET
              avatar = ?,
              stars = ?,
              euro_coins = ?,
              current_streak = ?,
              highest_streak = ?,
              unlocked_hats = ?,
              equipped_hat = ?,
              captured_pokemon = ?,
              total_problems_solved = ?,
              updated_at = datetime('now')
            WHERE id = ?`,
      args: [
        avatar,
        stars,
        euroCoins,
        currentStreak,
        highestStreak,
        unlockedHats,
        equippedHat,
        capturedPokemon,
        totalProblemsSolved,
        playerId,
      ],
    });
  } else {
    const insertRes = await db.execute({
      sql: `INSERT INTO players (
              name, avatar, stars, euro_coins, current_streak, highest_streak,
              unlocked_hats, equipped_hat, captured_pokemon, total_problems_solved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
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
      ],
    });
    playerId = Number(insertRes.lastInsertRowid || 0);
  }

  // Update game scores if provided
  if (data.scores) {
    for (const [gameKey, score] of Object.entries(data.scores)) {
      if (typeof score !== 'number') continue;

      // Check existing game score
      const existingScoreRes = await db.execute({
        sql: `SELECT * FROM game_scores WHERE LOWER(player_name) = LOWER(?) AND game_key = ? LIMIT 1`,
        args: [name, gameKey],
      });

      if (existingScoreRes.rows.length > 0) {
        const row = existingScoreRes.rows[0];
        const prevHigh = Number(row.high_score || 0);
        const newHigh = Math.max(prevHigh, score);
        const isThisGame = data.lastGameKey === gameKey;

        await db.execute({
          sql: `UPDATE game_scores SET
                  high_score = ?,
                  times_played = times_played + ?,
                  stars_earned = stars_earned + ?,
                  coins_earned = coins_earned + ?,
                  updated_at = datetime('now')
                WHERE id = ?`,
          args: [
            newHigh,
            isThisGame ? 1 : 0,
            isThisGame ? (data.lastStarsEarned || 0) : 0,
            isThisGame ? (data.lastCoinsEarned || 0) : 0,
            row.id,
          ],
        });
      } else {
        const isThisGame = data.lastGameKey === gameKey;
        await db.execute({
          sql: `INSERT INTO game_scores (
                  player_id, player_name, game_key, high_score, times_played,
                  problems_solved, stars_earned, coins_earned
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            playerId,
            name,
            gameKey,
            score,
            isThisGame ? 1 : 0,
            0,
            isThisGame ? (data.lastStarsEarned || 0) : 0,
            isThisGame ? (data.lastCoinsEarned || 0) : 0,
          ],
        });
      }
    }
  }

  // Record into history if a game session just finished
  if (data.lastGameKey && (data.lastGameScore !== undefined || data.lastStarsEarned)) {
    await db.execute({
      sql: `INSERT INTO game_history (player_name, game_key, score, stars, coins)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        name,
        data.lastGameKey,
        data.lastGameScore || 0,
        data.lastStarsEarned || 0,
        data.lastCoinsEarned || 0,
      ],
    });
  }

  return await getPlayerByName(name);
}
