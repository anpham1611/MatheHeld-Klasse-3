import assert from 'node:assert/strict';
import test from 'node:test';
import { generateMonsterRound } from './monsterParty';

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

test('generates five distinct monsters with a corresponding shadow for each', () => {
  const round = generateMonsterRound(5, seededRandom(17));
  const monsterIds = round.monsters.map(({ id }) => id);
  const shadowIds = round.shadows.map(({ id }) => id);

  assert.equal(round.monsters.length, 5);
  assert.equal(round.shadows.length, 5);
  assert.equal(new Set(monsterIds).size, 5);
  assert.deepEqual(new Set(shadowIds), new Set(monsterIds));
  assert.notDeepEqual(shadowIds, monsterIds);
});

test('supports every round size from five through fifteen', () => {
  for (let count = 5; count <= 15; count += 1) {
    const round = generateMonsterRound(count, seededRandom(count));
    const monsterIds = round.monsters.map(({ id }) => id);
    const shadowIds = round.shadows.map(({ id }) => id);

    assert.equal(round.monsters.length, count);
    assert.equal(round.shadows.length, count);
    assert.equal(new Set(monsterIds).size, count);
    assert.deepEqual(new Set(shadowIds), new Set(monsterIds));
  }
});

test('different random seeds generate different monster artwork', () => {
  const first = generateMonsterRound(5, seededRandom(23));
  const second = generateMonsterRound(5, seededRandom(41));

  assert.notDeepEqual(first.monsters, second.monsters);
});
