import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Settings2, Copy, Wifi, Heart, Trophy, Clock3 } from 'lucide-react';
import type { PlayerProfile } from '../../types/game';
import { sound } from '../../audio/soundManager';
import { createRound, playMove, type Round } from '../../games/ticTacToe/engine';
import type { Difficulty } from '../../games/ticTacToe/ai';
import { OnlineSession, type OnlineState, type OnlineTransport } from '../../games/ticTacToe/network';
import { SetupPanel, SymbolMark, type GameMode } from '../../games/ticTacToe/GameUI';
import { SEAT_BY_SYMBOL, SYMBOL_BY_SEAT, type GameSymbol } from '../../games/ticTacToe/symbols';
import { BoardPanel } from '../../games/ticTacToe/BoardPanel';
import { createDefaultRoomTransport } from '../../games/ticTacToe/httpTransport';
import '../../games/ticTacToe/ticTacToe.css';

interface Props {
  player: PlayerProfile;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  /** Optional host override; otherwise the built-in room-code API is used. */
  onlineTransport?: OnlineTransport;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

const emptyOnline: OnlineState = { snapshot: null, connection: 'connected', pending: false, syncing: false, error: null };

export function SuperIntellectTicTacToe({ player, onBack, isMuted, onToggleMute, onlineTransport }: Props) {
  const [mode, setMode] = useState<GameMode>('robot');
  const [size, setSize] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedSymbol, setSelectedSymbol] = useState<GameSymbol>('X');
  const [round, setRound] = useState<Round>(() => createRound(3));
  const [started, setStarted] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [aiAttempt, setAiAttempt] = useState(0);
  const [aiError, setAiError] = useState(false);
  const [session, setSession] = useState<OnlineSession | null>(null);
  const [online, setOnline] = useState<OnlineState>(emptyOnline);
  const [roomCode, setRoomCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now);
  const [localDeadline, setLocalDeadline] = useState(() => Date.now() + 15000);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const ownedTransport = onlineTransport ? null : createDefaultRoomTransport(player.name);
    const connected = new OnlineSession(onlineTransport ?? ownedTransport!);
    setSession(connected);
    setOnline(connected.getState());
    const unsubscribe = connected.subscribe(() => setOnline(connected.getState()));
    return () => { unsubscribe(); connected.dispose(); ownedTransport?.dispose(); };
  }, [onlineTransport, player.name]);

  const snapshot = mode === 'online' ? online.snapshot : null;
  const active = mode === 'online' ? !!snapshot : started;
  const game = snapshot?.game ?? round;
  const you = snapshot?.you ?? SEAT_BY_SYMBOL[selectedSymbol];
  const roundKey = snapshot ? `${snapshot.roomId}:${snapshot.roundId}` : `local:${epoch}`;
  const preview = useMemo(() => {
    let board = createRound(size);
    for (const i of [0, size + 1, 2, size * 2]) board = playMove(board, i, board.turn);
    return board;
  }, [size]);
  const displayed = active ? game : preview;

  useEffect(() => {
    setLocalDeadline(Date.now() + 15000);
    setNow(Date.now());
  }, [round.moves, epoch, started]);
  useEffect(() => {
    if (!active || game.result) return;
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    const refresh = () => setNow(Date.now());
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, [active, game.result]);
  const seconds = snapshot ? session?.secondsRemaining() ?? 0 : Math.max(0, Math.ceil((localDeadline - now) / 1000));
  const canMove = active && !game.result && (mode === 'online' ? session?.canMove() === true : game.turn === you);

  // All robot levels run in a disposable worker. Restart/exit invalidates work
  // through both effect cleanup and the round-position token check.
  useEffect(() => {
    if (mode !== 'robot' || !started || round.result || round.turn === you) return;
    let cancelled = false;
    let worker: Worker | undefined;
    const token = `${epoch}:${round.moves}:${aiAttempt}`;
    setAiError(false);
    const timer = window.setTimeout(() => {
      try {
        worker = new Worker(new URL('../../games/ticTacToe/ai.worker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (event: MessageEvent<{ token: string; move?: number; error?: boolean }>) => {
          if (cancelled || event.data.token !== token) return;
          if (event.data.error || !Number.isInteger(event.data.move)) { setAiError(true); return; }
          try { setRound(playMove(round, event.data.move!, round.turn)); }
          catch { setAiError(true); }
        };
        worker.onerror = () => { if (!cancelled) setAiError(true); };
        worker.postMessage({ token, round, difficulty });
      } catch { if (!cancelled) setAiError(true); }
    }, reducedMotion ? 250 : 600);
    return () => { cancelled = true; window.clearTimeout(timer); worker?.terminate(); };
  }, [mode, started, round, epoch, aiAttempt, difficulty, reducedMotion, you]);

  const heard = useRef({ key: '', moves: 0 });
  const celebrated = useRef<string | null>(null);
  useEffect(() => {
    if (!active) return;
    if (heard.current.key === roundKey && game.moves > heard.current.moves && !isMuted) sound.playBlockPlace();
    heard.current = { key: roundKey, moves: game.moves };
    if (!game.result || celebrated.current === roundKey) return;
    celebrated.current = roundKey;
    if (game.result.winner === you) {
      if (!isMuted) sound.playFanfare();
      if (!reducedMotion) confetti({ particleCount: 100, spread: 80, origin: { y: .58 }, colors: ['#ffaac6', '#8ed5fa', '#ffe079', '#9ae0bc'], disableForReducedMotion: true });
    }
  }, [active, game.moves, game.result, roundKey, you, isMuted, reducedMotion]);

  function start() {
    setNotice(null); setAiError(false); setRound(createRound(size)); setEpoch(n => n + 1); setStarted(true);
    if (!isMuted) sound.playJump();
  }
  function settings() {
    session?.leave(); setStarted(false); setAiError(false); setNotice(null); setEpoch(n => n + 1);
  }
  function perform(action: Promise<unknown>) {
    setNotice(null);
    void action.catch(error => setNotice(error instanceof Error ? error.message : 'Das hat nicht geklappt. Versuch es noch einmal.'));
  }
  function move(index: number) {
    if (!canMove) return;
    if (mode === 'online') { if (session) perform(session.move(index)); return; }
    setRound(current => {
      try { return playMove(current, index, you); }
      catch { return current; }
    });
  }

  let status = 'Bereit für eine Runde?';
  if (active) {
    if (game.result) status = game.result.kind === 'draw' ? 'Unentschieden — High Five!'
      : game.result.winner === you ? 'Du hast gewonnen!' : mode === 'robot' ? 'Der Roboter gewinnt. Du schaffst das nächste Mal!' : 'Dein Gegenüber gewinnt.';
    else if (snapshot?.phase === 'waiting') status = 'Warte auf deinen Spielgefährten …';
    else if (snapshot && online.connection !== 'connected') status = 'Verbindung unterbrochen — wir verbinden neu …';
    else if (snapshot && online.syncing) status = 'Spielstand wird neu geladen …';
    else if (snapshot && seconds === 0) status = 'Zeit abgelaufen — warte auf die Serverentscheidung …';
    else if (snapshot && online.pending) status = 'Dein Zug wird bestätigt …';
    else if (mode === 'robot' && game.turn !== you) status = aiError ? 'Der Roboter braucht einen Neustart.' : 'Der Roboter denkt nach …';
    else status = game.turn === you ? 'Du bist dran!' : 'Dein Gegenüber ist dran!';
  }
  const names = {
    kitten: snapshot?.players.kitten?.name ?? (you === 'kitten' ? player.name : 'Roboter'),
    puppy: snapshot?.players.puppy?.name ?? (you === 'puppy' ? player.name : 'Roboter'),
  };

  return <div className="ttt-page">
    <header className="ttt-header">
      <button type="button" className="ttt-back" onClick={onBack}><ArrowLeft size={19} /><span>Zu den Welten</span></button>
      <div className="ttt-brand"><span aria-hidden="true">✦</span> MATHEHELD <span className="ttt-brand-badge">SPIELZEIT</span></div>
      <button type="button" className="ttt-sound" onClick={onToggleMute} aria-label={isMuted ? 'Ton einschalten' : 'Ton ausschalten'} aria-pressed={!isMuted}>
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
    </header>
    <main className="ttt-main">
      <section className="ttt-hero">
        <div className="ttt-eyebrow">KLEINE ZEICHEN. GROSSE IDEEN.</div>
        <h1>Super Intellect <span>Tic Tac Toe<span className="ttt-title-star" aria-hidden="true">✦</span></span></h1>
        <p>Ein schlaues Duell mit deinen liebsten Spielgefährten.</p>
      </section>
      <div className={`ttt-layout ${active ? 'in-game' : ''}`}>
        <aside className="ttt-sidebar">
          {!active ? <SetupPanel mode={mode} size={size} difficulty={difficulty} configured={!!session} busy={online.pending}
            symbol={selectedSymbol} onSymbol={setSelectedSymbol}
            roomCode={roomCode} onRoomCode={setRoomCode} onMode={value => { setMode(value); setNotice(null); }} onSize={setSize}
            onDifficulty={setDifficulty} onStart={start} onCreate={() => { if (session) perform(session.create(size, selectedSymbol)); }}
            onJoin={() => { if (session) perform(session.join(roomCode, selectedSymbol)); }} />
            : <section className="ttt-card ttt-play-info">
              <div className="ttt-section-label"><Heart size={16} /> DAS X/O-DUELL</div>
              <h2>Schön, dass du spielst!</h2>
              <p>Du spielst <strong>{SYMBOL_BY_SEAT[you]}</strong>.</p>
              <div className="ttt-tip"><span aria-hidden="true">💡</span><div><strong>Ein kleiner Denktipp</strong><p>Schau auch auf die andere Farbe. Kannst du eine Reihe verhindern?</p></div></div>
              <ul className="ttt-directions"><li>↔ Waagerecht</li><li>↕ Senkrecht</li><li>⤢ Diagonal</li></ul>
              <div className="ttt-line-rule"><strong>{game.target}</strong><span>gleiche Zeichen in einer Reihe<br />bringen den Sieg!</span></div>
              {mode === 'robot' && <p className="ttt-help">Der Timer hilft dir beim Planen. Du darfst dir auch länger Zeit nehmen.</p>}
              {snapshot && <div className="ttt-room-info">
                <span><Wifi size={16} /> Dein Raum</span><code>{snapshot.roomId}</code>
                <button type="button" className="ttt-secondary" onClick={() => {
                  if (!navigator.clipboard?.writeText) { setNotice('Markiere den Raumcode und kopiere ihn.'); return; }
                  void navigator.clipboard.writeText(snapshot.roomId).then(() => setNotice('Raumcode kopiert!')).catch(() => setNotice('Markiere den Raumcode und kopiere ihn.'));
                }}><Copy size={15} /> Raumcode kopieren</button>
                {snapshot.phase === 'waiting' && <p className="ttt-help">Teile diesen Code. Dein Freund wählt „Mit Freunden“ und gibt ihn bei „Raum beitreten“ ein.</p>}
                <p className="ttt-help">Online: 15 Sekunden pro Zug. Bei Zeitablauf verlierst du die Runde.</p>
              </div>}
              <button type="button" className="ttt-secondary ttt-settings" onClick={settings}><Settings2 size={16} />{snapshot ? 'Raum verlassen' : 'Einstellungen'}</button>
            </section>}
          {(notice || (mode === 'online' && online.error)) && <div className="ttt-notice" role="status">{notice ?? online.error}</div>}
          {snapshot && online.syncing && online.connection === 'connected' && <button type="button" className="ttt-secondary" onClick={() => perform(session!.sync())}>Erneut verbinden</button>}
        </aside>
        <div className="ttt-play-area">
          <section className="ttt-match-status ttt-card">
            <div className={`ttt-player kitten ${active && game.turn === 'kitten' && !game.result ? 'current' : ''}`}>
              <span className="ttt-avatar" aria-hidden="true"><SymbolMark symbol="X" /></span><div><strong>{active ? names.kitten : 'Team X'}</strong><small>{active && you === 'kitten' ? 'X · Das bist du!' : 'X · Team Rosa'}</small></div>
            </div>
            <span className="ttt-versus" aria-hidden="true">VS</span>
            <div className={`ttt-player puppy ${active && game.turn === 'puppy' && !game.result ? 'current' : ''}`}>
              <span className="ttt-avatar" aria-hidden="true"><SymbolMark symbol="O" /></span><div><strong>{active ? names.puppy : 'Team O'}</strong><small>{active && you === 'puppy' ? 'O · Das bist du!' : 'O · Team Blau'}</small></div>
            </div>
          </section>
          <div className={`ttt-turn ${canMove ? 'your-turn' : ''}`}>
            <span className="ttt-turn-dot" aria-hidden="true" /><p role="status" aria-live="polite">{status}</p>
            {active && !game.result && snapshot?.phase !== 'waiting' && <span className="ttt-clock" aria-label={`${seconds} Sekunden verbleiben`}><Clock3 size={15} />{seconds}s</span>}
          </div>
          {active && !game.result && snapshot?.phase !== 'waiting' && <div className={`ttt-timer ${seconds <= 5 ? 'urgent' : ''}`} aria-hidden="true"><div style={{ width: `${seconds / 15 * 100}%` }} /></div>}
          {aiError && mode === 'robot' && active && <button type="button" className="ttt-secondary" onClick={() => setAiAttempt(n => n + 1)}>Roboter erneut starten</button>}
          {active && mode === 'robot' && seconds === 0 && game.turn === you && !game.result && <p className="ttt-help">Ganz in Ruhe — du findest deinen nächsten Zug! 🌱</p>}
          <BoardPanel key={roundKey} round={displayed} enabled={canMove} reducedMotion={reducedMotion} onMove={move} status={status} seconds={active && !game.result && snapshot?.phase !== 'waiting' ? seconds : undefined} />
          {active && game.result ? <section className="ttt-result ttt-card" aria-label="Rundenergebnis">
            <div className="ttt-result-icon" aria-hidden="true">{game.result.kind === 'draw' ? '🤝' : game.result.winner === you ? '🏆' : '🌱'}</div>
            <h2>{game.result.kind === 'draw' ? 'Zusammen richtig schlau!' : game.result.winner === you ? 'Hurra, du hast gewonnen!' : 'Jede Runde macht dich schlauer!'}</h2>
            <p>{game.result.kind === 'forfeit' ? 'Die Zeit ist abgelaufen. Der Server hat die Runde entschieden.' : game.result.kind === 'draw' ? 'Das Feld ist voll. Niemand hat eine Gewinnreihe.' : `${SYMBOL_BY_SEAT[game.result.winner!]} hat eine Gewinnreihe geschafft.`}</p>
            {snapshot ? <>
              <button type="button" className="ttt-primary" disabled={online.pending || online.syncing || online.connection !== 'connected' || snapshot.rematchRequested.includes(you)}
                onClick={() => perform(session!.rematch())}><RotateCcw size={18} />{snapshot.rematchRequested.includes(you) ? 'Warte auf Zustimmung …' : 'Noch eine Runde anfragen'}</button>
              {snapshot.rematchRequested.length > 0 && <p className="ttt-help">Eine neue Runde startet erst, wenn beide zustimmen.</p>}
            </> : <button type="button" className="ttt-primary" onClick={start}><RotateCcw size={18} /> Noch eine Runde!</button>}
          </section> : <div className="ttt-board-note"><Trophy size={17} /><span>{active ? 'Gute Ideen wachsen mit jedem Zug.' : 'Wähle dein Symbol und lass die Zeichen spielen!'}</span></div>}
        </div>
      </div>
      <footer className="ttt-footer"><Heart size={14} /> Fair spielen. Neues probieren. Zusammen Spaß haben.</footer>
    </main>
  </div>;
}
