import assert from 'node:assert/strict';
import test from 'node:test';

const engine = await import('./engine').catch(() => undefined);
const ai = await import('./ai').catch(() => undefined);
function api() {
  assert.ok(engine && ai, 'Robot logic and board engine must exist');
  return { ...engine, ...ai };
}

test('Easy selects only empty cells and returns no move after completion', () => {
  const { createRound, playMove, chooseMove } = api();
  const state = playMove(createRound(3), 0, 'kitten');
  assert.equal(chooseMove(state, 'easy', () => 0), 1);
  assert.equal(chooseMove(state, 'easy', () => 0.999), 8);
  let won = createRound(3);
  for (const i of [0, 3, 1, 4, 2]) won = playMove(won, i, won.turn);
  assert.equal(chooseMove(won, 'hard'), null);
});

test('Medium takes wins before blocks and blocks an immediate threat', () => {
  const { createRound, playMove, chooseMove } = api();
  let state = createRound(3);
  for (const i of [0, 3, 1]) state = playMove(state, i, state.turn);
  assert.equal(chooseMove(state, 'medium'), 2);
  state = playMove(state, 4, state.turn);
  state = playMove(state, 8, state.turn);
  assert.equal(chooseMove(state, 'medium'), 5);
});

test('Hard on 3×3 never loses against any reachable human reply', () => {
  const { createRound, playMove, chooseMove } = api();
  let outcomes = 0;
  function visit(state: ReturnType<typeof createRound>) {
    if (state.result) {
      assert.notEqual(state.result.winner, 'kitten');
      outcomes++;
      return;
    }
    if (state.turn === 'puppy') {
      const move = chooseMove(state, 'hard');
      assert.notEqual(move, null);
      visit(playMove(state, move!, 'puppy'));
    } else {
      state.board.forEach((cell, i) => { if (!cell) visit(playMove(state, i, 'kitten')); });
    }
  }
  visit(createRound(3));
  assert.ok(outcomes > 100);
});

test('larger-board Hard blocks five-in-a-row and stays bounded on a 15×15 opening', () => {
  const { createRound, playMove, chooseMove } = api();
  let state = createRound(5);
  for (const i of [0, 5, 1, 7, 2, 9, 3]) state = playMove(state, i, state.turn);
  assert.equal(chooseMove(state, 'hard'), 4);
  const large = playMove(createRound(15), 112, 'kitten');
  const start = performance.now();
  const move = chooseMove(large, 'hard');
  assert.equal(large.board[move!], null);
  assert.ok(performance.now() - start < 2000, 'Search must have a bounded candidate budget');
});
