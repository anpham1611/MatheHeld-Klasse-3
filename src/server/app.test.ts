import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { app } from './app.js';
import { POKEMON_ROSTER } from '../math/pokemonData.js';

test('profile save rejects oversized, duplicate, and unknown Pokémon collections', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${port}/api/players/save`;
  const knownIds = POKEMON_ROSTER.map(({ id }) => id);

  try {
    const invalidCollections = [
      knownIds.slice(0, 51),
      ['pikachu', 'pikachu'],
      ['unknown-pokemon'],
    ];

    for (const capturedPokemon of invalidCollections) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Test Hero', capturedPokemon }),
      });

      assert.equal(response.status, 400);
      assert.equal((await response.json()).success, false);
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});
