import { createHash, randomInt, randomUUID } from 'node:crypto';
import type { Client } from '@libsql/client';
import { createRound, otherAnimal, playMove, type Animal, type Round } from '../games/ticTacToe/engine.js';
import type { Participant, RoomSnapshot } from '../games/ticTacToe/network.js';

const ROOM_LIFETIME = 2 * 60 * 60 * 1000;
const commands = new Set(['create_room', 'join_room', 'make_move', 'request_state', 'request_rematch', 'leave_room']);
type Member = Participant & { keyHash: string };
interface StoredRoom {
  roomId: string; roundId: string; roundNumber: number; revision: number;
  phase: RoomSnapshot['phase']; game: Round; members: Record<Animal, Member | null>;
  deadline: number | null; rematchRequested: Animal[];
  receipts: { key: string; fingerprint: string }[];
}
type Actor = Member;

export class RoomError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const fail = (status: number, message: string): never => { throw new RoomError(status, message); };
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

/** Durable shared state: no room or timer depends on one server process. */
export class RoomService {
  private initialization: Promise<unknown> | undefined;
  constructor(private db: Client, private now = Date.now) {}

  private initialize() {
    this.initialization ??= this.db.batch([
      `CREATE TABLE IF NOT EXISTS tic_tac_toe_rooms (
        code TEXT PRIMARY KEY, state_json TEXT NOT NULL, version INTEGER NOT NULL,
        owner_hash TEXT NOT NULL, phase TEXT NOT NULL, expires_at INTEGER NOT NULL
      )`,
      'CREATE INDEX IF NOT EXISTS tic_tac_toe_rooms_expiry ON tic_tac_toe_rooms(expires_at)',
      'CREATE INDEX IF NOT EXISTS tic_tac_toe_rooms_owner ON tic_tac_toe_rooms(owner_hash, phase)',
    ], 'write').catch(error => { this.initialization = undefined; throw error; });
    return this.initialization;
  }
  private snapshot(room: StoredRoom, actor: Actor, now: number): RoomSnapshot {
    const you = this.memberSeat(room, actor);
    const publicMember = (member: Member | null): Participant | null => member ? { id: member.id, name: member.name } : null;
    return {
      roomId: room.roomId, roundId: room.roundId, roundNumber: room.roundNumber, revision: room.revision,
      phase: room.phase, game: room.game, players: { kitten: publicMember(room.members.kitten), puppy: publicMember(room.members.puppy) },
      deadline: room.deadline, serverNow: now, you, rematchRequested: room.rematchRequested,
    };
  }
  private memberSeat(room: StoredRoom, actor: Actor): Animal {
    for (const seat of ['kitten', 'puppy'] as const) if (room.members[seat]?.keyHash === actor.keyHash) return seat;
    return fail(403, 'Du gehörst nicht zu diesem Raum.');
  }
  private async create(actor: Actor, payload: Record<string, unknown>, now: number): Promise<RoomSnapshot> {
    if (typeof payload.size !== 'number') fail(400, 'Ungültige Spielfeldgröße.');
    let game: Round;
    try { game = createRound(payload.size as number); } catch { return fail(400, 'Wähle 3×3 oder eine Größe von 5 bis 15.'); }
    const preferred = payload.preferredSymbol ?? 'X';
    if (preferred !== 'X' && preferred !== 'O') fail(400, 'Ungültiges Symbol.');
    await this.db.execute({ sql: 'DELETE FROM tic_tac_toe_rooms WHERE expires_at <= ?', args: [now] });
    for (let attempt = 0; attempt < 5; attempt++) {
      const roomId = randomInt(100_000_000).toString().padStart(8, '0');
      const seat: Animal = preferred === 'X' ? 'kitten' : 'puppy';
      const room: StoredRoom = {
        roomId, roundId: randomUUID(), roundNumber: 1, revision: 1, phase: 'waiting', game,
        members: { kitten: null, puppy: null }, deadline: null, rematchRequested: [], receipts: [],
      };
      room.members[seat] = actor;
      // The count guard is part of the insert, so simultaneous creates cannot
      // exceed the waiting-room limit for this credential.
      const inserted = await this.db.execute({
        sql: `INSERT OR IGNORE INTO tic_tac_toe_rooms(code, state_json, version, owner_hash, phase, expires_at)
          SELECT ?, ?, 1, ?, 'waiting', ? WHERE
          (SELECT COUNT(*) FROM tic_tac_toe_rooms WHERE owner_hash = ? AND phase = 'waiting' AND expires_at > ?) < 3`,
        args: [roomId, JSON.stringify(room), actor.keyHash, now + ROOM_LIFETIME, actor.keyHash, now],
      });
      if (inserted.rowsAffected) return this.snapshot(room, actor, now);
    }
    return fail(429, 'Du hast schon mehrere offene Räume. Bitte nutze einen vorhandenen Raum.');
  }

  async handle(credential: string, name: string, event: string, payload: Record<string, unknown>): Promise<RoomSnapshot> {
    // The first half is a public participant ID; the remaining 128 random bits
    // stay secret. Store only a hash of the full bearer credential. A room code
    // grants the second seat, never the existing player's move rights.
    if (typeof credential !== 'string' || !/^[a-f0-9]{64}$/.test(credential)) fail(401, 'Ungültige Spielverbindung. Bitte lade die Seite neu.');
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 64) fail(400, 'Ungültiger Spielername.');
    if (!commands.has(event) || !payload || typeof payload !== 'object' || Array.isArray(payload)) fail(400, 'Ungültige Spielanfrage.');
    const actor: Actor = { id: credential.slice(0, 32), keyHash: hash(credential), name: name.trim() };
    await this.initialize();
    if (event === 'create_room') return this.create(actor, payload, this.now());
    const code = typeof payload.roomId === 'string' ? payload.roomId.trim().toUpperCase() : '';
    // Keep already shared legacy codes usable until their rooms expire.
    if (!/^(?:[0-9]{8}|[A-Z2-9]{8})$/.test(code)) fail(400, 'Bitte gib den achtstelligen Raumcode ein.');

    // Optimistic database concurrency works with SQLite and hosted Turso, even
    // when join/move requests land on different Vercel instances.
    for (let attempt = 0; attempt < 6; attempt++) {
      const now = this.now();
      const rows = await this.db.execute({ sql: 'SELECT state_json, version, expires_at FROM tic_tac_toe_rooms WHERE code = ?', args: [code] });
      const row = rows.rows[0];
      if (!row || Number(row.expires_at) <= now) fail(404, 'Raum nicht gefunden oder abgelaufen. Prüfe den Code.');
      const room: StoredRoom = JSON.parse(String(row.state_json));
      let seat = (['kitten', 'puppy'] as const).find(candidate => room.members[candidate]?.keyHash === actor.keyHash);
      if (!seat && event !== 'join_room') fail(403, 'Du gehörst nicht zu diesem Raum.');
      if (!seat && Object.values(room.members).some(member => member?.id === actor.id)) fail(403, 'Ungültige Spielverbindung.');
      if (!seat && (room.phase !== 'waiting' || (room.members.kitten && room.members.puppy))) fail(409, 'Dieser Raum ist bereits voll.');

      let changed = false;
      // Expiration is computed on the server for reads as well as writes. No
      // background timer is needed and clients cannot extend their own turn.
      if (room.phase === 'playing' && room.deadline !== null && now >= room.deadline) {
        room.game.result = { kind: 'forfeit', winner: otherAnimal(room.game.turn), line: [] };
        room.phase = 'finished'; room.deadline = null; room.revision++; changed = true;
      } else if (event === 'join_room' && !seat) {
        seat = room.members.kitten ? 'puppy' : 'kitten';
        room.members[seat] = actor;
        room.phase = 'playing'; room.deadline = now + 15000; room.revision++; changed = true;
      } else if (event === 'leave_room') {
        if (room.phase === 'waiting') {
          const removed = await this.db.execute({ sql: 'DELETE FROM tic_tac_toe_rooms WHERE code = ? AND version = ?', args: [code, Number(row.version)] });
          if (!removed.rowsAffected) continue;
        }
        // During play, leaving behaves like disconnecting: the original turn
        // deadline continues. Returning with the same credential can reconnect.
        return this.snapshot(room, actor, now);
      } else if (event === 'make_move' || event === 'request_rematch') {
        if (typeof payload.commandId !== 'string' || !payload.commandId || payload.commandId.length > 128) fail(400, 'Ungültige Anfragenummer.');
        const key = `${actor.id}:${payload.commandId}`;
        const fingerprint = hash(JSON.stringify([event, payload.roundId, payload.row, payload.col]));
        const receipt = room.receipts.find(item => item.key === key);
        if (receipt) {
          if (receipt.fingerprint !== fingerprint) fail(409, 'Diese Anfragenummer wurde schon verwendet.');
          return this.snapshot(room, actor, now);
        }
        if (payload.roundId !== room.roundId) fail(409, 'Diese Runde ist nicht mehr aktuell.');
        if (event === 'make_move') {
          if (payload.expectedRevision !== room.revision) fail(409, 'Spielstand geändert. Bitte versuche den Zug erneut.');
          const { row: r, col } = payload;
          if (!Number.isInteger(r) || !Number.isInteger(col) || Number(r) < 0 || Number(col) < 0 || Number(r) >= room.game.size || Number(col) >= room.game.size) fail(400, 'Ungültiges Feld.');
          try { room.game = playMove(room.game, Number(r) * room.game.size + Number(col), seat!); }
          catch { return fail(409, 'Dieser Zug ist nicht möglich. Warte, bis du dran bist.'); }
          room.phase = room.game.result ? 'finished' : 'playing';
          room.deadline = room.game.result ? null : now + 15000;
          room.revision++;
        } else {
          if (room.phase !== 'finished') fail(409, 'Die Runde läuft noch.');
          if (!room.rematchRequested.includes(seat!)) room.rematchRequested.push(seat!);
          room.revision++;
          if (room.rematchRequested.length === 2) {
            room.roundId = randomUUID(); room.roundNumber++; room.revision = 1;
            room.game = createRound(room.game.size); room.phase = 'playing';
            room.deadline = now + 15000; room.rematchRequested = [];
          }
        }
        room.receipts = [...room.receipts.slice(-63), { key, fingerprint }];
        changed = true;
      }
      if (!changed) return this.snapshot(room, actor, now);
      const updated = await this.db.execute({
        sql: `UPDATE tic_tac_toe_rooms SET state_json = ?, version = version + 1, phase = ?, expires_at = ? WHERE code = ? AND version = ?`,
        args: [JSON.stringify(room), room.phase, now + ROOM_LIFETIME, code, Number(row.version)],
      });
      if (updated.rowsAffected) return this.snapshot(room, actor, now);
    }
    return fail(409, 'Der Raum wird gerade aktualisiert. Bitte versuche es erneut.');
  }
}
