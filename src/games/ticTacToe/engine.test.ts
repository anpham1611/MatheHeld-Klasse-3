import assert from 'node:assert/strict';
import test from 'node:test';

const engine = await import('./engine').catch(() => undefined);
function api() {
  assert.ok(engine, 'The dynamic board engine must exist');
  return engine;
}

test('creates supported boards and rejects ambiguous or unsafe dimensions', () => {
  const { createRound } = api();
  for (const size of [3, 5, 10, 15]) {
    const state = createRound(size);
    assert.equal(state.board.length, size * size);
    assert.equal(state.target, size === 3 ? 3 : 5);
    assert.equal(state.turn, 'kitten');
  }
  for (const size of [0, 4, 16, 5.5, NaN, Infinity]) assert.throws(() => createRound(size));
});

test('rejects illegal moves without changing the original position', () => {
  const { createRound, playMove } = api();
  const initial = createRound(3);
  assert.throws(() => playMove(initial, 0, 'puppy'));
  for (const cell of [-1, 9, 0.5, NaN]) assert.throws(() => playMove(initial, cell, 'kitten'));
  const next = playMove(initial, 0, 'kitten');
  assert.equal(initial.board[0], null);
  assert.equal(next.turn, 'puppy');
  assert.throws(() => playMove(next, 0, 'puppy'));
});

test('detects lines on all axes and at board edges', () => {
  const { createRound, playMove } = api();
  const sequences = [
    [0, 3, 1, 4, 2], [2, 0, 5, 1, 8], [0, 1, 4, 2, 8], [2, 0, 4, 1, 6],
  ];
  for (const sequence of sequences) {
    let state = createRound(3);
    for (const cell of sequence) state = playMove(state, cell, state.turn);
    assert.equal(state.result?.kind, 'line');
    assert.equal(state.result?.winner, 'kitten');
    assert.equal(state.result?.line.length, 3);
    assert.throws(() => playMove(state, 7, state.turn));
  }
});

test('requires five on larger boards and accepts longer runs', () => {
  const { createRound, playMove, findWinningLine } = api();
  let state = createRound(5);
  for (const cell of [0, 5, 1, 7, 2, 9, 3, 11]) state = playMove(state, cell, state.turn);
  assert.equal(state.result, null);
  state = playMove(state, 4, 'kitten');
  assert.deepEqual(state.result?.line, [0, 1, 2, 3, 4]);
  const board = createRound(10).board;
  for (const i of [20, 21, 22, 23, 24, 25]) board[i] = 'kitten';
  assert.deepEqual(findWinningLine(board, 10, 5, 23), [20, 21, 22, 23, 24, 25]);
});

test('does not wrap rows or declare a draw before the last move', () => {
  const { createRound, playMove, findWinningLine } = api();
  const board = createRound(5).board;
  for (const i of [3, 4, 5, 6, 7]) board[i] = 'kitten';
  assert.equal(findWinningLine(board, 5, 5, 5), null);
  let state = createRound(3);
  for (const cell of [0, 1, 2, 4, 3, 5, 7, 6]) state = playMove(state, cell, state.turn);
  assert.equal(state.result, null);
  state = playMove(state, 8, state.turn);
  assert.equal(state.result?.kind, 'draw');
});
