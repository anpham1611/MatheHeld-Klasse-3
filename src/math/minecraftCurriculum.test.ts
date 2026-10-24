import assert from 'node:assert/strict';
import test from 'node:test';
import { shuffleAnswerOptions } from './minecraftCurriculum.js';

test('Minecraft answer shuffling moves the correct answer without changing choices', () => {
  const options = [7, 12, 18, 24];
  const firstShuffle = shuffleAnswerOptions(options, () => 0);
  const secondShuffle = shuffleAnswerOptions(options, () => 0.999999);

  assert.deepEqual([...firstShuffle].sort((a, b) => a - b), options);
  assert.deepEqual([...secondShuffle].sort((a, b) => a - b), options);
  assert.notEqual(firstShuffle.indexOf(7), secondShuffle.indexOf(7));
  assert.deepEqual(options, [7, 12, 18, 24]);
});
