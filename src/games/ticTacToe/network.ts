import { createRound, findWinningLine, otherAnimal, validSize, type Animal, type Cell, type Result, type Round } from './engine';

export type NetworkCommand = 'create_room' | 'join_room' | 'make_move' | 'request_rematch' | 'leave_room' | 'request_state';
export type NetworkEvent = 'room_state' | 'receive_move' | 'connection_status' | 'command_error';
export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
export interface Participant { id: string; name: string }
export interface RoomSnapshot {
  roomId: string;
  roundId: string;
  /** Increasing across rematches; revision increases within each round. */
  roundNumber: number;
  revision: number;
  phase: 'waiting' | 'playing' | 'finished';
  game: Round;
  players: Record<Animal, Participant | null>;
  you: Animal;
  serverNow: number;
  deadline: number | null;
  rematchRequested: Animal[];
}

/**
 * Inject this through SuperIntellectTicTacToe.onlineTransport.
 * Identity comes from the authenticated host, NEVER player.name.
 *
 * Socket.IO mapping (no dependency required by this game):
 * request: (event, payload) => socket.timeout(8000).emitWithAck(event, payload)
 * subscribe: (event, handler) => { socket.on(event, handler);
 *   return () => socket.off(event, handler); }
 * Translate socket connect/disconnect into connection_status events.
 * create_room, join_room and request_state must resolve a full RoomSnapshot.
 * Other commands may resolve a snapshot or acknowledge with undefined;
 * broadcasts must then supply the authoritative room_state/receive_move.
 *
 * Server obligations: authorize membership from socket authentication, validate
 * moves and expectedRevision, deduplicate commandId, enforce the 15s deadline
 * atomically, and broadcast forfeit. Never accept a browser's winner claim.
 */
export interface OnlineTransport {
  userId: string;
  request(event: NetworkCommand, payload: Record<string, unknown>): Promise<unknown>;
  subscribe(event: NetworkEvent, handler: (value: unknown) => void): () => void;
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const animal = (value: unknown): value is Animal => value === 'kitten' || value === 'puppy';
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 128;
const integer = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
const timestamp = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

/** Fail closed at the transport boundary; do not render a malformed server board. */
export function parseSnapshot(value: unknown, userId: string): RoomSnapshot | null {
  if (!record(value) || !text(value.roomId) || !text(value.roundId) || !integer(value.roundNumber) || !integer(value.revision)
    || !animal(value.you) || !timestamp(value.serverNow) || !record(value.players) || !record(value.game)
    || !['waiting', 'playing', 'finished'].includes(String(value.phase))) return null;
  const players: Record<Animal, Participant | null> = { kitten: null, puppy: null };
  for (const symbol of ['kitten', 'puppy'] as const) {
    const participant = value.players[symbol];
    if (participant === null) continue;
    if (!record(participant) || !text(participant.id) || !text(participant.name)) return null;
    players[symbol] = { id: participant.id, name: participant.name };
  }
  if (players[value.you]?.id !== userId || (players.kitten && players.kitten.id === players.puppy?.id)) return null;
  const raw = value.game;
  if (typeof raw.size !== 'number' || !validSize(raw.size) || !Array.isArray(raw.board) || raw.board.length !== raw.size * raw.size
    || !raw.board.every(cell => cell === null || animal(cell)) || !animal(raw.turn)) return null;
  const board: Cell[] = [...raw.board];
  const kittens = board.filter(cell => cell === 'kitten').length;
  const puppies = board.filter(cell => cell === 'puppy').length;
  const turn: Animal = kittens === puppies ? 'kitten' : 'puppy';
  const moves = kittens + puppies;
  const target = raw.size === 3 ? 3 : 5;
  if (kittens < puppies || kittens > puppies + 1 || raw.turn !== turn || raw.moves !== moves || raw.target !== target) return null;
  const winners = new Map<Animal, number[]>();
  board.forEach((cell, i) => {
    if (!cell || winners.has(cell)) return;
    const line = findWinningLine(board, raw.size as number, target, i);
    if (line) winners.set(cell, line);
  });
  if (winners.size > 1) return null;
  let result: Result | null = null;
  if (raw.result !== null) {
    if (!record(raw.result) || !Array.isArray(raw.result.line)) return null;
    const { kind, winner } = raw.result;
    if (kind === 'line') {
      if (!animal(winner) || winner !== otherAnimal(turn) || !winners.has(winner)) return null;
      result = { kind, winner, line: winners.get(winner)! };
    } else if (kind === 'draw') {
      if (winner !== null || moves !== board.length || winners.size || raw.result.line.length) return null;
      result = { kind, winner: null, line: [] };
    } else if (kind === 'forfeit') {
      if (winner !== otherAnimal(turn) || winners.size || moves === board.length || raw.result.line.length) return null;
      result = { kind, winner: otherAnimal(turn), line: [] };
    } else return null;
  } else if (winners.size || moves === board.length) return null;
  if (value.phase === 'playing' && (!players.kitten || !players.puppy || result || !timestamp(value.deadline)
    || value.deadline - value.serverNow > 15000)) return null;
  if (value.phase === 'waiting' && (moves || result || value.deadline !== null || (players.kitten && players.puppy))) return null;
  if (value.phase === 'finished' && (!players.kitten || !players.puppy || !result || value.deadline !== null)) return null;
  if (!Array.isArray(value.rematchRequested) || !value.rematchRequested.every(animal) || new Set(value.rematchRequested).size !== value.rematchRequested.length) return null;
  return {
    roomId: value.roomId, roundId: value.roundId, roundNumber: value.roundNumber, revision: value.revision,
    phase: value.phase as RoomSnapshot['phase'], game: { size: raw.size, target, board, turn, moves, result },
    players, you: value.you, serverNow: value.serverNow, deadline: value.deadline as number | null,
    rematchRequested: [...value.rematchRequested],
  };
}

export interface OnlineState {
  snapshot: RoomSnapshot | null;
  connection: ConnectionStatus;
  pending: boolean;
  syncing: boolean;
  error: string | null;
}

/** Owns online lifecycle, not local rules. Only server snapshots commit moves. */
export class OnlineSession {
  private state: OnlineState = { snapshot: null, connection: 'connected', pending: false, syncing: false, error: null };
  private listeners = new Set<() => void>();
  private unsubscribers: (() => void)[];
  private offset = 0;
  private generation = 0;
  private sequence = 0;
  private syncSequence = 0;
  private commandId: string | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | undefined;
  private disposed = false;

  constructor(private transport: OnlineTransport, private now = Date.now) {
    if (!text(transport.userId)) throw new Error('Authenticated user ID required.');
    this.unsubscribers = [
      transport.subscribe('room_state', value => this.receive(value)),
      transport.subscribe('receive_move', value => this.receive(value)),
      transport.subscribe('connection_status', value => {
        if (!['connected', 'reconnecting', 'disconnected'].includes(String(value))) return;
        this.clearPending();
        this.update({ connection: value as ConnectionStatus, syncing: !!this.state.snapshot });
        if (value === 'connected' && this.state.snapshot) void this.sync();
      }),
      transport.subscribe('command_error', value => {
        if (!record(value) || value.commandId !== this.commandId) return;
        this.clearPending();
        this.update({ error: 'Der Server hat die Anfrage abgelehnt. Bitte versuche es erneut.' });
      }),
    ];
  }

  getState = (): OnlineState => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private update(patch: Partial<OnlineState>) {
    if (this.disposed) return;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener());
  }
  private clearPending() {
    clearTimeout(this.pendingTimer);
    this.commandId = null;
    this.update({ pending: false });
  }
  private accept(snapshot: RoomSnapshot, allowEqual = false): boolean {
    const previous = this.state.snapshot;
    if (previous) {
      if (snapshot.roomId !== previous.roomId || snapshot.roundNumber < previous.roundNumber) return false;
      if (snapshot.roundNumber === previous.roundNumber && (snapshot.roundId !== previous.roundId || snapshot.revision < previous.revision
        || (!allowEqual && snapshot.revision === previous.revision))) return false;
      if (snapshot.roundNumber === previous.roundNumber) {
        if (snapshot.game.size !== previous.game.size || snapshot.you !== previous.you || snapshot.game.moves < previous.game.moves) return false;
        if (previous.game.board.some((cell, index) => cell !== null && snapshot.game.board[index] !== cell)) return false;
        if (previous.phase !== 'waiting' && snapshot.phase === 'waiting') return false;
        for (const symbol of ['kitten', 'puppy'] as const) {
          if (previous.players[symbol] && previous.players[symbol]?.id !== snapshot.players[symbol]?.id) return false;
        }
        if (previous.game.result && (snapshot.game.result?.kind !== previous.game.result.kind
          || snapshot.game.result.winner !== previous.game.result.winner || snapshot.game.moves !== previous.game.moves
          || snapshot.game.board.some((cell, index) => cell !== previous.game.board[index]))) return false;
      }
      if (snapshot.roundNumber > previous.roundNumber && snapshot.roundId === previous.roundId) return false;
    }
    this.offset = snapshot.serverNow - this.now();
    this.clearPending();
    this.update({ snapshot, syncing: false, error: null });
    return true;
  }
  private receive(value: unknown) {
    if (!this.state.snapshot || this.state.connection !== 'connected' || this.state.syncing) return;
    const snapshot = parseSnapshot(value, this.transport.userId);
    if (!snapshot) { this.update({ error: 'Ungültiger Spielstand. Bitte neu verbinden.' }); return; }
    this.accept(snapshot);
  }
  secondsRemaining(): number {
    const deadline = this.state.snapshot?.deadline;
    return deadline == null ? 15 : Math.max(0, Math.min(15, Math.ceil((deadline - this.now() - this.offset) / 1000)));
  }
  canMove(): boolean {
    const { snapshot, pending, connection, syncing } = this.state;
    return !!snapshot && snapshot.phase === 'playing' && snapshot.game.turn === snapshot.you
      && !pending && !syncing && connection === 'connected' && this.secondsRemaining() > 0;
  }

  private async enter(event: 'create_room' | 'join_room', payload: Record<string, unknown>, expectedRoom?: string) {
    if (this.state.pending || this.state.snapshot || this.state.connection !== 'connected') throw new Error('Verbindung ist noch nicht bereit.');
    const generation = ++this.generation;
    this.update({ pending: true, error: null });
    try {
      const value = await this.transport.request(event, payload);
      if (this.disposed || generation !== this.generation) return;
      const snapshot = parseSnapshot(value, this.transport.userId);
      if (!snapshot || (expectedRoom && snapshot.roomId !== expectedRoom)) throw new Error('Der Server hat keinen gültigen Raum geliefert.');
      this.accept(snapshot);
    } catch (error) {
      if (!this.disposed && generation === this.generation) this.update({ pending: false, error: error instanceof Error ? error.message : 'Verbindung fehlgeschlagen.' });
      throw error;
    }
  }
  create(size: number) {
    createRound(size);
    return this.enter('create_room', { size, target: size === 3 ? 3 : 5, turnSeconds: 15, timeoutPolicy: 'forfeit' });
  }
  join(roomCode: string) {
    const roomId = roomCode.trim();
    if (!text(roomId)) return Promise.reject(new Error('Bitte gib einen Raumcode ein.'));
    return this.enter('join_room', { roomId }, roomId);
  }

  private async command(event: 'make_move' | 'request_rematch', extra: Record<string, unknown>) {
    const snapshot = this.state.snapshot;
    if (!snapshot) throw new Error('Kein Raum verbunden.');
    const generation = this.generation;
    const commandId = `${this.now()}-${++this.sequence}-${Math.random().toString(36).slice(2)}`;
    this.commandId = commandId;
    this.update({ pending: true, error: null });
    this.pendingTimer = setTimeout(() => {
      if (this.commandId !== commandId) return;
      this.clearPending();
      this.update({ error: 'Keine Bestätigung. Spielstand wird neu geladen.', syncing: true });
      void this.sync();
    }, 8000);
    try {
      const response = await this.transport.request(event, {
        roomId: snapshot.roomId, roundId: snapshot.roundId, expectedRevision: snapshot.revision, commandId, ...extra,
      });
      if (this.disposed || generation !== this.generation || this.commandId !== commandId) return;
      if (response !== undefined && response !== null) this.receive(response);
    } catch {
      if (this.disposed || generation !== this.generation || this.commandId !== commandId) return;
      this.clearPending();
      this.update({ error: 'Anfrage fehlgeschlagen. Spielstand wird neu geladen.', syncing: true });
      await this.sync();
    }
  }
  async move(index: number) {
    const snapshot = this.state.snapshot;
    if (!this.canMove() || !snapshot || !Number.isInteger(index) || index < 0 || index >= snapshot.game.board.length || snapshot.game.board[index]) throw new Error('Dieser Zug ist nicht möglich.');
    await this.command('make_move', { row: Math.floor(index / snapshot.game.size), col: index % snapshot.game.size });
  }
  async rematch() {
    const snapshot = this.state.snapshot;
    if (!snapshot || snapshot.phase !== 'finished' || snapshot.rematchRequested.includes(snapshot.you)
      || this.state.pending || this.state.syncing || this.state.connection !== 'connected') throw new Error('Neue Runde ist noch nicht bereit.');
    await this.command('request_rematch', {});
  }
  async sync() {
    const snapshot = this.state.snapshot;
    if (!snapshot || this.state.connection !== 'connected') return;
    const generation = this.generation;
    const syncSequence = ++this.syncSequence;
    this.update({ syncing: true });
    try {
      const value = await this.transport.request('request_state', { roomId: snapshot.roomId, lastRevision: snapshot.revision });
      if (this.disposed || generation !== this.generation || syncSequence !== this.syncSequence || this.state.connection !== 'connected') return;
      const fresh = parseSnapshot(value, this.transport.userId);
      if (!fresh || !this.accept(fresh, true)) throw new Error('Invalid state');
    } catch {
      if (this.disposed || generation !== this.generation || syncSequence !== this.syncSequence) return;
      this.update({ syncing: true, error: 'Spielstand nicht verfügbar. Bitte erneut verbinden.' });
    }
  }
  leave() {
    const snapshot = this.state.snapshot;
    ++this.generation;
    this.clearPending();
    this.update({ snapshot: null, syncing: false, error: null });
    if (snapshot) void this.transport.request('leave_room', { roomId: snapshot.roomId }).catch(() => {});
  }
  dispose() {
    this.leave();
    this.disposed = true;
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}
