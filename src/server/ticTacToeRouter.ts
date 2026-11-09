import express from 'express';
import { getDb } from './db.js';
import { RoomError, RoomService } from './ticTacToeRooms.js';

export function createTicTacToeRouter(service?: RoomService) {
  const router = express.Router();
  let rooms = service;
  router.use(express.json({ limit: '16kb' }));
  router.post('/', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    // Do not accept cross-origin browser requests to private game rooms.
    const origin = req.get('origin');
    if (origin) {
      try { if (new URL(origin).host !== req.get('host')) { res.status(403).json({ error: 'Ungültiger Ursprung.' }); return; } }
      catch { res.status(403).json({ error: 'Ungültiger Ursprung.' }); return; }
    }
    const credential = req.get('authorization')?.replace(/^Bearer /, '') ?? '';
    const { event, payload, name } = req.body ?? {};
    try {
      rooms ??= new RoomService(getDb());
      res.json(await rooms.handle(credential, name, event, payload));
    } catch (error) {
      if (error instanceof RoomError) res.status(error.status).json({ error: error.message });
      else { console.error('[TicTacToe] Room request failed'); res.status(503).json({ error: 'Der Spielserver ist gerade nicht verfügbar. Bitte versuche es erneut.' }); }
    }
  });
  return router;
}
