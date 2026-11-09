import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient } from '@libsql/client';
import { parseSnapshot } from '../games/ticTacToe/network';

const module = await import('./ticTacToeRooms').catch(() => undefined);
function api() { assert.ok(module, 'Shared database-backed room service must exist'); return module; }
const credentials = ['1'.repeat(64), '2'.repeat(64), '3'.repeat(64)];

async function fixture() {
  const { RoomService } = api();
  const db = createClient({ url: 'file::memory:' });
  let now = 1000;
  const service = new RoomService(db, () => now);
  const call = (who: number, event: string, payload: Record<string, unknown> = {}) => service.handle(credentials[who], `Kind ${who + 1}`, event, payload);
  return { db, service, call, setNow(value: number) { now = value; } };
}

test('creates a shareable code and another device joins the same persisted room', async () => {
  const { db, call } = await fixture();
  try {
    const host = await call(0, 'create_room', { size: 5, preferredSymbol: 'O' });
    assert.match(host.roomId, /^[A-Z2-9]{8}$/);
    assert.equal(host.phase, 'waiting');
    assert.equal(host.you, 'puppy');
    assert.ok(parseSnapshot(host, credentials[0].slice(0, 32)));
    const guest = await call(1, 'join_room', { roomId: host.roomId.toLowerCase() });
    assert.equal(guest.phase, 'playing');
    assert.equal(guest.you, 'kitten');
    assert.equal(guest.game.board.length, 25);
    assert.ok(parseSnapshot(guest, credentials[1].slice(0, 32)));
    const { RoomService } = api();
    const anotherInstance = new RoomService(db, () => 1000);
    const fresh = await anotherInstance.handle(credentials[0], 'Host', 'request_state', { roomId: host.roomId });
    assert.equal(fresh.players.kitten?.name, 'Kind 2');
    assert.equal(fresh.phase, 'playing');
    assert.ok(!JSON.stringify(fresh).includes(credentials[0]));
    assert.ok(!JSON.stringify(fresh).includes('keyHash'));
  } finally { db.close(); }
});

test('validates moves, deduplicates commands, and refuses outsiders and third players', async () => {
  const { db, call } = await fixture();
  try {
    const host = await call(0, 'create_room', { size: 3 });
    const guest = await call(1, 'join_room', { roomId: host.roomId });
    await assert.rejects(() => call(2, 'join_room', { roomId: host.roomId }));
    await assert.rejects(() => call(2, 'request_state', { roomId: host.roomId }));
    const move = { roomId: host.roomId, roundId: guest.roundId, expectedRevision: guest.revision, commandId: 'move-1', row: 0, col: 0 };
    await assert.rejects(() => call(1, 'make_move', move));
    const moved = await call(0, 'make_move', move);
    assert.equal(moved.game.board[0], 'kitten');
    assert.equal((await call(0, 'make_move', move)).revision, moved.revision);
    await assert.rejects(() => call(0, 'make_move', { ...move, col: 1 }));
    await assert.rejects(() => call(1, 'make_move', { ...move, commandId: 'move-2', expectedRevision: moved.revision }));
    await assert.rejects(() => call(1, 'make_move', { ...move, commandId: 'move-3', col: 1 }));
    await assert.rejects(() => call(1, 'make_move', { ...move, commandId: 'move-4', expectedRevision: moved.revision, row: -1 }));
    assert.ok(parseSnapshot(moved, credentials[0].slice(0, 32)));
  } finally { db.close(); }
});

test('server deadlines forfeit rounds and both players must approve a fresh rematch', async () => {
  const { db, call, setNow } = await fixture();
  try {
    const host = await call(0, 'create_room', { size: 3 });
    const guest = await call(1, 'join_room', { roomId: host.roomId });
    setNow(16000);
    const finished = await call(1, 'request_state', { roomId: host.roomId });
    assert.equal(finished.game.result?.kind, 'forfeit');
    assert.equal(finished.game.result?.winner, 'puppy');
    assert.equal(finished.deadline, null);
    assert.ok(parseSnapshot(finished, credentials[1].slice(0, 32)));
    const payload = { roomId: host.roomId, roundId: guest.roundId, expectedRevision: finished.revision, commandId: 'again-host' };
    const waiting = await call(0, 'request_rematch', payload);
    assert.equal(waiting.phase, 'finished');
    const rematch = await call(1, 'request_rematch', { ...payload, commandId: 'again-guest' });
    assert.equal(rematch.roundNumber, 2);
    assert.notEqual(rematch.roundId, host.roundId);
    assert.equal(rematch.game.moves, 0);
    assert.equal(rematch.phase, 'playing');
    assert.ok(parseSnapshot(rematch, credentials[1].slice(0, 32)));
  } finally { db.close(); }
});

test('concurrent joins claim only one remaining seat', async () => {
  const { db, call } = await fixture();
  try {
    const host = await call(0, 'create_room', { size: 3 });
    const results = await Promise.allSettled([call(1, 'join_room', { roomId: host.roomId }), call(2, 'join_room', { roomId: host.roomId })]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.filter(result => result.status === 'rejected').length, 1);
  } finally { db.close(); }
});

test('invalid credentials, malformed commands, and expired codes fail closed', async () => {
  const { db, call, service, setNow } = await fixture();
  try {
    await assert.rejects(() => service.handle('short', 'Mia', 'create_room', { size: 3 }));
    await assert.rejects(() => call(0, 'create_room', { size: 4 }));
    await assert.rejects(() => call(0, 'create_room', { size: 3, preferredSymbol: 'Z' }));
    const host = await call(0, 'create_room', { size: 3 });
    const stolenPublicId = credentials[0].slice(0, 32) + 'f'.repeat(32);
    await assert.rejects(() => service.handle(stolenPublicId, 'Intruder', 'request_state', { roomId: host.roomId }));
    await assert.rejects(() => call(1, 'join_room', { roomId: '../../../' }));
    setNow(1000 + 2 * 60 * 60 * 1000 + 1);
    await assert.rejects(() => call(1, 'join_room', { roomId: host.roomId }));
  } finally { db.close(); }
});

test('simultaneous moves cannot place two pieces in one turn', async () => {
  const { db, call } = await fixture();
  try {
    const host = await call(0, 'create_room', { size: 3 });
    const joined = await call(1, 'join_room', { roomId: host.roomId });
    const move = { roomId: host.roomId, roundId: joined.roundId, expectedRevision: joined.revision, row: 0 };
    const results = await Promise.allSettled([
      call(0, 'make_move', { ...move, commandId: 'parallel-1', col: 0 }),
      call(0, 'make_move', { ...move, commandId: 'parallel-2', col: 1 }),
    ]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const state = await call(1, 'request_state', { roomId: host.roomId });
    assert.equal(state.game.moves, 1);
    assert.equal(state.game.board.filter(Boolean).length, 1);
    assert.equal(state.game.turn, 'puppy');
  } finally { db.close(); }
});
