import { parseSnapshot, type NetworkCommand, type NetworkEvent, type OnlineTransport } from './network';

/** Same-origin HTTP transport works on Express and stateless Vercel functions. */
export class HttpRoomTransport implements OnlineTransport {
  readonly userId: string;
  private listeners = new Map<NetworkEvent, Set<(value: unknown) => void>>();
  private controllers = new Set<AbortController>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private roomId: string | null = null;
  private generation = 0;
  private disconnected = false;
  private disposed = false;

  constructor(private name: string, private credential: string, private fetcher: typeof fetch = (input, init) => globalThis.fetch(input, init)) {
    if (!/^[a-f0-9]{64}$/.test(credential)) throw new Error('Ungültige Spielverbindung.');
    this.userId = credential.slice(0, 32);
  }
  subscribe(event: NetworkEvent, listener: (value: unknown) => void) {
    const listeners = this.listeners.get(event) ?? new Set();
    listeners.add(listener); this.listeners.set(event, listeners);
    return () => { listeners.delete(listener); };
  }
  private emit(event: NetworkEvent, value: unknown) {
    this.listeners.get(event)?.forEach(listener => listener(value));
  }
  private async send(event: NetworkCommand, payload: Record<string, unknown>): Promise<unknown> {
    const controller = new AbortController();
    const leaving = event === 'leave_room';
    if (!leaving) this.controllers.add(controller);
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await this.fetcher('/api/tic-tac-toe', {
        method: 'POST', cache: 'no-store', credentials: 'same-origin', keepalive: leaving,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.credential}` },
        body: JSON.stringify({ event, payload, name: this.name }), signal: controller.signal,
      });
      let value: unknown;
      try { value = await response.json(); }
      catch { throw new Error('Der Spielserver ist hier nicht erreichbar. Bitte prüfe, ob die API mit bereitgestellt wurde.'); }
      if (!response.ok) throw new Error(value && typeof value === 'object' && 'error' in value && typeof value.error === 'string' ? value.error : 'Der Spielserver ist nicht erreichbar.');
      return value;
    } finally { clearTimeout(timeout); this.controllers.delete(controller); }
  }
  async request(event: NetworkCommand, payload: Record<string, unknown>): Promise<unknown> {
    if (this.disposed) throw new Error('Spielverbindung geschlossen.');
    if (event === 'leave_room') {
      this.roomId = null; ++this.generation; clearTimeout(this.timer);
      return this.send(event, payload);
    }
    const generation = this.generation;
    const value = await this.send(event, payload);
    const snapshot = parseSnapshot(value, this.userId);
    if (!snapshot) throw new Error('Der Server hat keinen gültigen Spielstand geliefert.');
    if (!this.disposed && generation === this.generation && (event === 'create_room' || event === 'join_room')) {
      this.roomId = snapshot.roomId;
      clearTimeout(this.timer);
      this.schedulePoll();
    }
    return snapshot;
  }
  private schedulePoll() {
    if (this.disposed || !this.roomId) return;
    this.timer = setTimeout(() => { void this.poll(); }, 1000);
  }
  private async poll() {
    const roomId = this.roomId;
    const generation = this.generation;
    if (!roomId || this.disposed) return;
    try {
      const value = await this.send('request_state', { roomId });
      if (this.disposed || generation !== this.generation) return;
      const snapshot = parseSnapshot(value, this.userId);
      if (!snapshot) throw new Error('Invalid room snapshot');
      if (this.disconnected) { this.disconnected = false; this.emit('connection_status', 'connected'); }
      this.emit('room_state', snapshot);
    } catch {
      if (this.disposed || generation !== this.generation) return;
      if (!this.disconnected) { this.disconnected = true; this.emit('connection_status', 'disconnected'); }
    } finally { if (!this.disposed && generation === this.generation) this.schedulePoll(); }
  }
  dispose() {
    this.disposed = true; ++this.generation; clearTimeout(this.timer);
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear(); this.listeners.clear();
  }
}

export function createDefaultRoomTransport(name: string): HttpRoomTransport {
  // Keep the reconnect credential per tab and profile. It is not a claimed
  // login ID: display names carry no authorization in the room service.
  const key = `matheheld_ttt_connection:${name}`;
  let credential: string | null = null;
  try { credential = sessionStorage.getItem(key); } catch { /* Private storage may be disabled. */ }
  if (!credential || !/^[a-f0-9]{64}$/.test(credential)) {
    credential = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
    try { sessionStorage.setItem(key, credential); } catch { /* This session can still play without persistence. */ }
  }
  return new HttpRoomTransport(name, credential);
}
