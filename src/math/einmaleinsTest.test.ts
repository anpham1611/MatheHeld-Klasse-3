import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countCorrectAnswers,
  EINMALEINS_TEST_SIZE,
  generateEinmaleinsTest,
  getGermanGrade,
} from './einmaleinsTest';

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

test('builds 60 distinct questions with a 48/12 focus-to-easy mix', () => {
  const questions = generateEinmaleinsTest(seededRandom(17));
  const distinctQuestions = new Set(questions.map(({ a, b }) => `${a}x${b}`));
  const focusQuestions = questions.filter(({ a, b }) =>
    [4, 6, 7, 8].includes(a) || [4, 6, 7, 8].includes(b),
  );

  assert.equal(questions.length, EINMALEINS_TEST_SIZE);
  assert.equal(distinctQuestions.size, EINMALEINS_TEST_SIZE);
  assert.equal(focusQuestions.length, 48);
  assert.ok(questions.every(({ a, b, answer }) => a >= 2 && a <= 9 && b >= 2 && b <= 9 && answer === a * b));
});

test('counts unanswered and incorrect answers as wrong', () => {
  const questions = [
    { a: 4, b: 5, answer: 20 },
    { a: 6, b: 7, answer: 42 },
    { a: 3, b: 5, answer: 15 },
  ];

  assert.equal(countCorrectAnswers(questions, [20, 41, null]), 1);
});

test('maps supplied score boundaries to German grades', () => {
  assert.deepEqual(
    [0, 14, 15, 29, 30, 39, 40, 48, 49, 54, 55, 60].map(getGermanGrade),
    [6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1],
  );
});
