import { chooseMove, type Difficulty } from './ai';
import type { Round } from './engine';

// Each request carries a round/position token. The UI also terminates this worker
// on cleanup, so an abandoned robot turn can never place a piece in a new round.
self.onmessage = (event: MessageEvent<{ token: string; round: Round; difficulty: Difficulty }>) => {
  const { token, round, difficulty } = event.data;
  try {
    self.postMessage({ token, move: chooseMove(round, difficulty) });
  } catch {
    self.postMessage({ token, error: true });
  }
};
