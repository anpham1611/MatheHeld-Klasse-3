import assert from 'node:assert/strict';
import test from 'node:test';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { createClient } from '@libsql/client';
import { RoomService } from './ticTacToeRooms';
import { createTicTacToeRouter } from './ticTacToeRouter';
import { OnlineSession } from '../games/ticTacToe/network';
import { createRound } from '../games/ticTacToe/engine';

const frontend = await import('../games/ticTacToe/httpTransport').catch(() => undefined);
function api() { assert.ok(frontend, 'Built-in HTTP room transport must exist'); return frontend; }
function until(session: OnlineSession, ready: () => boolean): Promise<void> {
  if (ready()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const cleanup = session.subscribe(() => { if (ready()) { clearTimeout(timer); cleanup(); resolve(); } });
    const timer = setTimeout(() => { cleanup(); reject(new Error('Timed out waiting for shared room update')); }, 6000);
  });
}

test('two independent HTTP clients create, join, share moves, and recover after polling fails', async () => {
  const { HttpRoomTransport } = api();
  const db = createClient({ url: 'file::memory:' });
  const app = express();
  app.use('/api/tic-tac-toe', createTicTacToeRouter(new RoomService(db)));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  let disconnected = false;
  const fetcher: typeof fetch = async (input, init) => {
    const body = JSON.parse(String(init?.body));
    if (disconnected && body.event === 'request_state') throw new Error('offline');
    return fetch(`${url}${input}`, init);
  };
  const hostTransport = new HttpRoomTransport('Mia', 'a'.repeat(64), fetcher);
  const guestTransport = new HttpRoomTransport('Leo', 'b'.repeat(64), fetcher);
  const host = new OnlineSession(hostTransport);
  const guest = new OnlineSession(guestTransport);
  try {
    await host.create(3);
    const code = host.getState().snapshot!.roomId;
    await guest.join(code.toLowerCase());
    await until(host, () => host.getState().snapshot?.phase === 'playing');
    assert.equal(host.getState().snapshot?.players.puppy?.name, 'Leo');
    await host.move(0);
    await until(guest, () => guest.getState().snapshot?.game.board[0] === 'kitten');
    await guest.move(4);
    await until(host, () => host.getState().snapshot?.game.board[4] === 'puppy');
    disconnected = true;
    await until(host, () => host.getState().connection === 'disconnected');
    assert.equal(host.canMove(), false);
    disconnected = false;
    await until(host, () => host.getState().connection === 'connected' && !host.getState().syncing);
    assert.equal(host.getState().snapshot?.game.moves, 2);
    assert.equal(host.canMove(), true);
    const unauthorized = await fetch(`${url}/api/tic-tac-toe`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'request_state', payload: { roomId: code }, name: 'Intruder' }),
    });
    assert.equal(unauthorized.status, 401);
  } finally {
    host.dispose(); guest.dispose(); hostTransport.dispose(); guestTransport.dispose();
    await new Promise<void>(resolve => server.close(() => resolve()));
    db.close();
  }
});

test('default browser fetch retains the global receiver instead of the transport instance', async () => {
  const { HttpRoomTransport } = api();
  const originalFetch = globalThis.fetch;
  let transport: InstanceType<typeof HttpRoomTransport> | undefined;
  try {
    globalThis.fetch = async function () {
      assert.equal(this, globalThis, 'Window.fetch requires its global receiver');
      return Response.json({ roomId: 'ABCDEFGH', roundId: 'r1', roundNumber: 1, revision: 1, phase: 'waiting',
        game: createRound(3), players: { kitten: { id: 'a'.repeat(32), name: 'Mia' }, puppy: null },
        you: 'kitten', serverNow: Date.now(), deadline: null, rematchRequested: [] });
    };
    transport = new HttpRoomTransport('Mia', 'a'.repeat(64));
    const snapshot = await transport.request('create_room', { size: 3 });
    assert.ok(snapshot);
  } finally { transport?.dispose(); globalThis.fetch = originalFetch; }
});

test('a static-only deployment shows a readable server error instead of a JSON parser error', async () => {
  const { HttpRoomTransport } = api();
  const transport = new HttpRoomTransport('Mia', 'a'.repeat(64), async () => new Response('<html>Not found</html>', {
    status: 404, headers: { 'Content-Type': 'text/html' },
  }));
  try { await assert.rejects(() => transport.request('create_room', { size: 3 }), /Spielserver/); }
  finally { transport.dispose(); }
});
