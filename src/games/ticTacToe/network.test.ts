import assert from 'node:assert/strict';
import test from 'node:test';
import { createRound, playMove } from './engine';
import type { OnlineTransport, RoomSnapshot, NetworkEvent } from './network';

const network = await import('./network').catch(() => undefined);
function api() { assert.ok(network, 'Authoritative online adapter must exist'); return network; }
function snapshot(overrides: Partial<RoomSnapshot> = {}): RoomSnapshot {
  return {
    roomId: 'ROOM', roundId: 'round-1', roundNumber: 1, revision: 1,
    phase: 'playing', game: createRound(3),
    players: { kitten: { id: 'user-1', name: 'Mia' }, puppy: { id: 'user-2', name: 'Leo' } },
    you: 'kitten', serverNow: 1000, deadline: 16000, rematchRequested: [], ...overrides,
  };
}
function fakeTransport() {
  const listeners = new Map<NetworkEvent, (value: unknown) => void>();
  const commands: { event: string; payload: Record<string, unknown> }[] = [];
  let response: unknown = snapshot();
  const transport: OnlineTransport = {
    userId: 'user-1',
    subscribe(event, callback) { listeners.set(event, callback); return () => { listeners.delete(event); }; },
    async request(event, payload) { commands.push({ event, payload }); return response; },
  };
  return { transport, commands, listeners, setResponse(value: unknown) { response = value; }, emit(event: NetworkEvent, value: unknown) { listeners.get(event)?.(value); } };
}

test('validates identity, board shape, turn parity, outcomes, and room configuration', () => {
  const { parseSnapshot } = api();
  assert.ok(parseSnapshot(snapshot(), 'user-1'));
  for (const value of [
    snapshot({ you: 'puppy' }), snapshot({ game: { ...createRound(3), board: [null] } }),
    snapshot({ game: { ...createRound(3), turn: 'puppy' } }),
    snapshot({ game: { ...createRound(3), result: { kind: 'line', winner: 'kitten', line: [0, 1, 2] } } }),
    snapshot({ deadline: null }), snapshot({ deadline: 999999 }), snapshot({ roundNumber: NaN }),
    snapshot({ players: { kitten: { id: 'user-1', name: 'Mia' }, puppy: { id: 'user-1', name: 'Leo' } } }),
  ]) assert.equal(parseSnapshot(value, 'user-1'), null);
});

test('waits for authoritative moves and ignores stale or unrelated snapshots', async () => {
  const { OnlineSession } = api();
  const fake = fakeTransport();
  const session = new OnlineSession(fake.transport, () => 1000);
  await session.join('ROOM');
  fake.setResponse(undefined);
  const request = session.move(0);
  assert.equal(session.getState().snapshot?.game.board[0], null);
  assert.equal(session.getState().pending, true);
  await request;
  fake.emit('receive_move', snapshot({ revision: 2, game: playMove(createRound(3), 0, 'kitten') }));
  assert.equal(session.getState().snapshot?.game.board[0], 'kitten');
  assert.equal(session.getState().pending, false);
  fake.emit('room_state', snapshot());
  fake.emit('room_state', snapshot({ roomId: 'OTHER', revision: 99 }));
  assert.equal(session.getState().snapshot?.revision, 2);
  assert.equal(fake.commands.at(-1)?.event, 'make_move');
  assert.equal(fake.commands.at(-1)?.payload.expectedRevision, 1);
  session.dispose();
  assert.equal(fake.listeners.size, 0);
});

test('client clock expiry blocks moves but only a server result forfeits', async () => {
  const { OnlineSession } = api();
  let now = 1000;
  const fake = fakeTransport();
  const session = new OnlineSession(fake.transport, () => now);
  await session.join('ROOM');
  now = 16001;
  assert.equal(session.secondsRemaining(), 0);
  assert.equal(session.canMove(), false);
  assert.equal(session.getState().snapshot?.game.result, null);
  await assert.rejects(() => session.move(0));
  fake.emit('room_state', snapshot({
    revision: 2, phase: 'finished', deadline: null,
    game: { ...createRound(3), result: { kind: 'forfeit', winner: 'puppy', line: [] } },
  }));
  assert.equal(session.getState().snapshot?.game.result?.kind, 'forfeit');
  session.dispose();
});

test('disconnect freezes play and reconnect requests a fresh authoritative snapshot', async () => {
  const { OnlineSession } = api();
  const fake = fakeTransport();
  const session = new OnlineSession(fake.transport, () => 1000);
  await session.join('ROOM');
  fake.emit('connection_status', 'disconnected');
  assert.equal(session.canMove(), false);
  fake.setResponse(snapshot({ revision: 2 }));
  fake.emit('connection_status', 'connected');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fake.commands.at(-1)?.event, 'request_state');
  assert.equal(session.getState().snapshot?.revision, 2);
  assert.equal(session.canMove(), true);
  session.dispose();
});

test('command rejection clears pending state and new rounds cannot be rolled back', async () => {
  const { OnlineSession } = api();
  const fake = fakeTransport();
  const session = new OnlineSession(fake.transport, () => 1000);
  await session.join('ROOM');
  fake.setResponse(undefined);
  await session.move(0);
  const commandId = fake.commands.at(-1)?.payload.commandId;
  fake.emit('command_error', { commandId, code: 'illegal_move' });
  assert.equal(session.getState().pending, false);
  assert.ok(session.getState().error);
  fake.emit('room_state', snapshot({ roundId: 'round-2', roundNumber: 2, revision: 1 }));
  fake.emit('room_state', snapshot({ revision: 100 }));
  assert.equal(session.getState().snapshot?.roundId, 'round-2');
  session.dispose();
});

test('active room settings and terminal results cannot be overwritten within a round', async () => {
  const { OnlineSession } = api();
  const fake = fakeTransport();
  const session = new OnlineSession(fake.transport, () => 1000);
  await session.join('ROOM');
  fake.emit('room_state', snapshot({ revision: 2, game: createRound(5) }));
  assert.equal(session.getState().snapshot?.game.size, 3);
  fake.emit('room_state', snapshot({ revision: 3, phase: 'finished', deadline: null,
    game: { ...createRound(3), result: { kind: 'forfeit', winner: 'puppy', line: [] } } }));
  fake.emit('room_state', snapshot({ revision: 4 }));
  assert.equal(session.getState().snapshot?.game.result?.kind, 'forfeit');
  session.dispose();
});

test('a delayed older synchronization response cannot freeze a newer accepted state', async () => {
  const { OnlineSession } = api();
  const fake = fakeTransport();
  const session = new OnlineSession(fake.transport, () => 1000);
  await session.join('ROOM');
  let firstResolve: (value: unknown) => void;
  let secondResolve: (value: unknown) => void;
  let requests = 0;
  fake.transport.request = async () => new Promise(resolve => { if (++requests === 1) firstResolve = resolve; else secondResolve = resolve; });
  const first = session.sync();
  const second = session.sync();
  secondResolve!(snapshot({ revision: 3 }));
  await second;
  firstResolve!(snapshot({ revision: 2 }));
  await first;
  assert.equal(session.getState().snapshot?.revision, 3);
  assert.equal(session.getState().syncing, false);
  assert.equal(session.canMove(), true);
  session.dispose();
});

test('existing pieces cannot move or disappear in a newer snapshot of the same round', async () => {
  const { OnlineSession } = api();
  const fake = fakeTransport();
  const session = new OnlineSession(fake.transport, () => 1000);
  await session.join('ROOM');
  fake.emit('room_state', snapshot({ revision: 2, game: playMove(createRound(3), 0, 'kitten') }));
  fake.emit('room_state', snapshot({ revision: 3, game: playMove(createRound(3), 1, 'kitten') }));
  assert.equal(session.getState().snapshot?.game.board[0], 'kitten');
  assert.equal(session.getState().snapshot?.game.board[1], null);
  session.dispose();
});

test('room creation forwards symbol preference but server assignment remains authoritative', async () => {
  const { OnlineSession } = api();
  const fake = fakeTransport();
  const session = new OnlineSession(fake.transport, () => 1000);
  await session.create(3, 'O');
  assert.equal(fake.commands[0].payload.preferredSymbol, 'O');
  assert.equal(session.getState().snapshot?.you, 'kitten');
  session.dispose();
});
