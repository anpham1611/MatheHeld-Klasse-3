import React, { useRef, useState } from 'react';
import { Bot, Users, Sparkles } from 'lucide-react';
import { validSize, type Round } from './engine';
import type { Difficulty } from './ai';
import { SYMBOL_BY_SEAT, type GameSymbol } from './symbols';

export type GameMode = 'robot' | 'online';
export function SymbolMark({ symbol }: { symbol: GameSymbol }) {
  return <span aria-hidden="true" className={`ttt-symbol-mark ${symbol === 'X' ? 'symbol-x' : 'symbol-o'}`} />;
}

/** HTML grid is a complete renderer, not a decorative accessibility overlay. */
export function AccessibleBoard({ round, enabled, winning, onMove }: {
  round: Round; enabled: boolean; winning: number[]; onMove: (index: number) => void;
}) {
  const [focus, setFocus] = useState(0);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: React.KeyboardEvent, index: number) {
    const row = Math.floor(index / round.size), col = index % round.size;
    const destinations: Record<string, number> = {
      ArrowLeft: row * round.size + Math.max(0, col - 1),
      ArrowRight: row * round.size + Math.min(round.size - 1, col + 1),
      ArrowUp: Math.max(0, row - 1) * round.size + col,
      ArrowDown: Math.min(round.size - 1, row + 1) * round.size + col,
      Home: event.ctrlKey ? 0 : row * round.size,
      End: event.ctrlKey ? round.board.length - 1 : (row + 1) * round.size - 1,
    };
    if (destinations[event.key] === undefined) return;
    event.preventDefault();
    const destination = destinations[event.key];
    setFocus(destination);
    cells.current[destination]?.focus();
  }
  return <div className="ttt-grid-scroll">
    <div role="grid" aria-label={`${round.size} mal ${round.size} Spielfeld`} className="ttt-html-grid">
      {Array.from({ length: round.size }, (_, row) => <div key={row} role="row" className="ttt-grid-row"
        style={{ gridTemplateColumns: `repeat(${round.size}, minmax(44px, 1fr))` }}>
        {round.board.slice(row * round.size, (row + 1) * round.size).map((cell, col) => {
          const index = row * round.size + col;
          const win = winning.includes(index);
          return <button key={index} role="gridcell" ref={node => { cells.current[index] = node; }}
            type="button" tabIndex={focus === index ? 0 : -1} onFocus={() => setFocus(index)}
            aria-label={`Zeile ${row + 1}, Spalte ${col + 1}: ${cell ? SYMBOL_BY_SEAT[cell] : 'frei'}${win ? ', Gewinnfeld' : ''}`}
            aria-disabled={!enabled || !!cell} onKeyDown={event => navigate(event, index)}
            onClick={() => { if (enabled && !cell) onMove(index); }}
            className={`ttt-cell ${cell ?? ''} ${win ? 'winner' : ''}`}>
            <span aria-hidden="true" className={cell ? 'ttt-piece' : 'ttt-empty'}>{cell ? <SymbolMark symbol={SYMBOL_BY_SEAT[cell]} /> : '✦'}</span>
          </button>;
        })}
      </div>)}
    </div>
    <p className="ttt-help">Pfeiltasten zum Navigieren · Enter oder Leertaste zum Setzen</p>
  </div>;
}

interface SetupProps {
  mode: GameMode; size: number; difficulty: Difficulty; configured: boolean; busy: boolean;
  roomCode: string;
  symbol: GameSymbol;
  onSymbol: (symbol: GameSymbol) => void;
  onRoomCode: (code: string) => void;
  onMode: (mode: GameMode) => void;
  onSize: (size: number) => void;
  onDifficulty: (difficulty: Difficulty) => void;
  onStart: () => void; onCreate: () => void; onJoin: () => void;
}

export function SetupPanel(props: SetupProps) {
  const { mode, size, difficulty, configured, busy } = props;
  const [custom, setCustom] = useState(![3, 5, 10].includes(size));
  const [customValue, setCustomValue] = useState(String(size === 3 ? 7 : size));
  const customNumber = Number(customValue);
  const customValid = Number.isInteger(customNumber) && customNumber >= 5 && customNumber <= 15;
  const invalid = custom && !customValid;
  return <section className="ttt-setup ttt-card" aria-label="Spieleinstellungen">
    <div className="ttt-section-label"><Sparkles size={16} /> DEIN NÄCHSTES ABENTEUER</div>
    <h2>Mit wem spielst du?</h2>
    <div className="ttt-mode-options">
      <button type="button" disabled={busy} aria-pressed={mode === 'robot'} className={`ttt-mode ${mode === 'robot' ? 'selected' : ''}`}
        onClick={() => props.onMode('robot')}><Bot /><span>Mit Roboter<small>Ein schlauer Spielgefährte</small></span></button>
      <button type="button" disabled={busy} aria-pressed={mode === 'online'} className={`ttt-mode pink ${mode === 'online' ? 'selected' : ''}`}
        onClick={() => props.onMode('online')}><Users /><span>Mit Freunden<small>Gemeinsam online spielen</small></span></button>
    </div>
    <fieldset disabled={busy} className="ttt-symbol-choice">
      <legend>Welches Symbol möchtest du sein?</legend>
      <div className="ttt-symbol-options">
        {(['X', 'O'] as const).map(symbol => <button key={symbol} type="button"
          aria-label={`Als ${symbol} spielen`} aria-pressed={props.symbol === symbol}
          className={`ttt-symbol-option ${props.symbol === symbol ? 'selected' : ''}`}
          onClick={() => props.onSymbol(symbol)}>
          <SymbolMark symbol={symbol} /><span>Ich spiele {symbol}</span>
        </button>)}
      </div>
      <p className="ttt-help">{mode === 'online' ? 'Dein Wunschsymbol. Der Server bestätigt die Zuteilung. X beginnt immer.'
        : props.symbol === 'X' ? 'Du beginnst mit X.' : 'Der Roboter beginnt mit X. Du spielst O.'}</p>
    </fieldset>
    <fieldset disabled={busy}>
      <legend>Wie groß ist dein Spielfeld?</legend>
      <div className="ttt-size-options">
        {[3, 5, 10].map(n => <button type="button" key={n} aria-pressed={!custom && size === n}
          className={`ttt-size ${!custom && size === n ? 'selected' : ''}`}
          onClick={() => { setCustom(false); props.onSize(n); }}><strong>{n}×{n}</strong><small>{n === 3 ? 'Mini' : n === 5 ? 'Super' : 'Mega'}</small></button>)}
        <button type="button" aria-pressed={custom} className={`ttt-size ${custom ? 'selected' : ''}`}
          onClick={() => { setCustom(true); if (customValid) props.onSize(customNumber); }}><strong>＋</strong><small>Eigene Größe</small></button>
      </div>
      {custom && <label className="ttt-custom">Eigene Größe (5–15)
        <input type="number" min={5} max={15} step={1} value={customValue} aria-invalid={invalid}
          onChange={event => { setCustomValue(event.target.value); const n = Number(event.target.value); if (n >= 5 && validSize(n)) props.onSize(n); }} />
      </label>}
      {invalid && <p className="ttt-error">Wähle eine ganze Zahl von 5 bis 15.</p>}
    </fieldset>
    <p className="ttt-rule"><span aria-hidden="true">💡</span> <strong>{size === 3 ? 3 : 5} gleiche Zeichen in einer Reihe</strong> gewinnen. Auch senkrecht und diagonal!</p>
    {mode === 'robot' ? <>
      <fieldset disabled={busy}>
        <legend>Wie schlau ist dein Roboter?</legend>
        <div className="ttt-difficulties">
          {([['easy', '🌱', 'Leicht'], ['medium', '🌟', 'Mittel'], ['hard', '🧠', 'Knifflig']] as const).map(([level, icon, label]) =>
            <button type="button" key={level} aria-pressed={difficulty === level}
              className={difficulty === level ? 'selected' : ''} onClick={() => props.onDifficulty(level)}><span aria-hidden="true">{icon}</span> {label}</button>)}
        </div>
      </fieldset>
      <button type="button" className="ttt-primary ttt-start" disabled={busy || invalid} onClick={props.onStart}>Los geht’s! <span aria-hidden="true">→</span></button>
    </> : <div className="ttt-online-setup">
      {!configured && <p className="ttt-notice">Online ist noch nicht verbunden. Dein Plattform-Team kann den sicheren Raum-Adapter anschließen. Mit Roboter kannst du sofort spielen!</p>}
      <p className="ttt-help">15 Sekunden pro Zug. Läuft die Zeit ab, gewinnt dein Gegenüber. Der Server entscheidet.</p>
      <button type="button" className="ttt-primary" disabled={!configured || busy || invalid} onClick={props.onCreate}>Raum erstellen</button>
      <label className="ttt-room-label">Oder mit Raumcode beitreten
        <input disabled={!configured || busy} value={props.roomCode} maxLength={128} placeholder="Raumcode" autoComplete="off"
          onChange={event => props.onRoomCode(event.target.value)} />
      </label>
      <button type="button" className="ttt-secondary" disabled={!configured || busy || !props.roomCode.trim()} onClick={props.onJoin}>Raum beitreten</button>
    </div>}
  </section>;
}
