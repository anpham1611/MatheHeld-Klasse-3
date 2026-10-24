import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Trash2, Undo2, Volume2, VolumeX, Zap } from 'lucide-react';
import { sound } from '../../audio/soundManager';
import { Language, PlayerProfile } from '../../types/game';

type Direction = 'up' | 'right' | 'down' | 'left';
type Command = Direction | 'loop';
type Cell = [number, number];

interface Mission {
  title: string;
  chapter: string;
  area: string;
  math: string;
  answer: number;
  choices: number[];
  hint: string;
  start: Cell;
  battery: Cell;
  robot: Cell;
  rocks: Cell[];
  reward: string;
  cols: number;
  rows: number;
}

const MISSIONS: Mission[] = [
  {
    title: 'Robi erwacht', chapter: 'Kapitel 1 · Roboter aufwecken', area: 'Energie-Wiese',
    math: '4 Hunderter, 2 Zehner und 6 Einer – welche Zahl ist das?', answer: 426, choices: [246, 426, 462],
    hint: 'Die Hunderter stehen vorne. Danach kommen Zehner und Einer.',
    start: [0, 3], battery: [2, 3], robot: [2, 1], rocks: [[1, 2]], reward: 'Solar-Antenne', cols: 4, rows: 4,
  },
  {
    title: 'Der Lichtweg', chapter: 'Kapitel 1 · Roboter aufwecken', area: 'Glühwürmchen-Wald',
    math: '238 + 145 = ?', answer: 383, choices: [373, 383, 393],
    hint: 'Rechne erst 238 + 100. Dann addiere noch 45.',
    start: [0, 3], battery: [3, 2], robot: [3, 0], rocks: [[1, 3], [2, 1]], reward: 'Leuchtrad', cols: 4, rows: 4,
  },
  {
    title: 'Die verlorene Sicherung', chapter: 'Kapitel 1 · Roboter aufwecken', area: 'Moos-Tal',
    math: '500 − 275 = ?', answer: 225, choices: [225, 235, 325],
    hint: 'Rechne 500 − 200. Ziehe danach noch 75 ab.',
    start: [0, 3], battery: [2, 2], robot: [4, 0], rocks: [[1, 3], [3, 2]], reward: 'Ersatzteil-Funk', cols: 5, rows: 4,
  },
  {
    title: 'Ersatzteile sammeln', chapter: 'Kapitel 2 · Brücke reparieren', area: 'Klippenschlucht',
    math: '6 × 4 = ?', answer: 24, choices: [20, 24, 28],
    hint: 'Zähle sechs Vierer-Schritte: 4, 8, 12, 16, 20, 24.',
    start: [0, 3], battery: [2, 3], robot: [4, 1], rocks: [[1, 2], [3, 3]], reward: 'Brücken-Bolzen', cols: 5, rows: 4,
  },
  {
    title: 'Die Brücke hält!', chapter: 'Kapitel 2 · Brücke reparieren', area: 'Wackelbrücke',
    math: '32 : 4 = ?', answer: 8, choices: [6, 8, 9],
    hint: 'Wie oft passt die 4 in die 32? 4 × ? = 32.',
    start: [0, 3], battery: [3, 2], robot: [4, 0], rocks: [[1, 3], [2, 1], [3, 1]], reward: 'Brücken-Planke', cols: 5, rows: 4,
  },
  {
    title: 'Hilfe im Farn-Labyrinth', chapter: 'Kapitel 3 · Die große Rettung', area: 'Farn-Labyrinth',
    math: '250 + 150 = ?', answer: 400, choices: [350, 400, 410],
    hint: '250 + 100 = 350. Jetzt fehlen noch 50.',
    start: [0, 3], battery: [2, 2], robot: [4, 0], rocks: [[1, 2], [3, 2], [3, 1]], reward: 'Rettungs-Kapsel', cols: 5, rows: 4,
  },
  {
    title: 'Das Energiekern-Team', chapter: 'Kapitel 3 · Die große Rettung', area: 'Energie-Kern',
    math: '7 × 8 = ?', answer: 56, choices: [54, 56, 64],
    hint: '7 × 4 = 28. Verdopple 28 für 7 × 8.',
    start: [0, 3], battery: [3, 3], robot: [4, 0], rocks: [[1, 2], [2, 2], [3, 1]], reward: 'Kern-Kristall', cols: 5, rows: 4,
  },
];

const DIRECTIONS: { command: Direction; label: string; icon: string; delta: Cell }[] = [
  { command: 'up', label: 'Oben', icon: '⬆️', delta: [0, -1] },
  { command: 'right', label: 'Rechts', icon: '➡️', delta: [1, 0] },
  { command: 'down', label: 'Unten', icon: '⬇️', delta: [0, 1] },
  { command: 'left', label: 'Links', icon: '⬅️', delta: [-1, 0] },
];

interface Progress {
  skin: number;
}

const loadProgress = (playerName: string): Progress => {
  try {
    const raw = localStorage.getItem(`roboforge-v1:${encodeURIComponent(playerName.toLowerCase())}`);
    if (raw) {
      const saved = JSON.parse(raw);
      return { skin: Number.isInteger(saved.skin) && saved.skin >= 0 && saved.skin <= 2 ? saved.skin : 0 };
    }
  } catch {
    // Use the default robot color if browser storage is unavailable.
  }
  return { skin: 0 };
};

const ROBOT_SKINS = [
  { name: 'Himmelblau', color: 'from-sky-400 to-blue-600', unlock: 0 },
  { name: 'Sonnengelb', color: 'from-amber-300 to-orange-500', unlock: 2 },
  { name: 'Waldgrün', color: 'from-emerald-400 to-green-600', unlock: 4 },
];

const CHAPTERS = [
  { title: 'Roboter aufwecken', start: 0, end: 3 },
  { title: 'Brücke reparieren', start: 3, end: 5 },
  { title: 'Die große Rettung', start: 5, end: 7 },
];

interface RoboForgeProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const RoboForge: React.FC<RoboForgeProps> = ({ lang, player, onUpdateStats, onBack, isMuted, onToggleMute }) => {
  const [progress, setProgress] = useState<Progress>(() => loadProgress(player.name));
  const [missionIndex, setMissionIndex] = useState(0);
  const [stage, setStage] = useState<'map' | 'math' | 'code' | 'won'>('map');
  const [commands, setCommands] = useState<Command[]>([]);
  const [position, setPosition] = useState<Cell>(MISSIONS[0].start);
  const [hasBattery, setHasBattery] = useState(false);
  const [answerMessage, setAnswerMessage] = useState('');
  const [runMessage, setRunMessage] = useState('');
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);
  const mission = MISSIONS[missionIndex];
  const completedCount = Math.min(MISSIONS.length, Math.max(0, player.scores.roboforge || 0));
  const completedMissions = Array.from({ length: completedCount }, (_, index) => index);

  useEffect(() => {
    try {
      localStorage.setItem(`roboforge-v1:${encodeURIComponent(player.name.toLowerCase())}`, JSON.stringify(progress));
    } catch {
      // The game stays playable when browser storage is unavailable.
    }
  }, [player.name, progress]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const chooseMission = (index: number) => {
    if (index > Math.min(MISSIONS.length - 1, completedCount)) return;
    setMissionIndex(index);
    setPosition(MISSIONS[index].start);
    setCommands([]);
    setHasBattery(false);
    setAnswerMessage('');
    setRunMessage('');
    setStage('math');
  };

  const addCommand = (command: Command) => {
    if (commands.length < 9 && !running) setCommands((current) => [...current, command]);
  };

  const runProgram = () => {
    if (running || commands.length === 0) return;
    const program: Direction[] = [];
    let previousMove: Direction | null = null;
    for (const command of commands) {
      if (command === 'loop') {
        if (!previousMove) {
          setRunMessage('Setze zuerst einen Richtungspfeil. Dann kann Robi ihn wiederholen.');
          return;
        }
        program.push(previousMove, previousMove);
      } else {
        program.push(command);
        previousMove = command;
      }
    }

    setPosition(mission.start);
    setHasBattery(false);
    setRunMessage('Robi startet sein Programm!');
    setRunning(true);
    let current: Cell = [...mission.start];
    let collected = false;
    let step = 0;

    const moveNext = () => {
      const instruction = program[step];
      if (!instruction) {
        setRunning(false);
        if (current[0] === mission.robot[0] && current[1] === mission.robot[1] && collected) {
          sound.playFanfare();
          setRunMessage(`Geschafft! Robi hat ${mission.reward} eingebaut. 🌟`);
          setStage('won');
          if (!completedMissions.includes(missionIndex)) {
            onUpdateStats(2, 10, Math.min(MISSIONS.length, completedCount + 1));
          }
        } else if (!collected) {
          setRunMessage('Fast! Robi braucht noch das Energieteil. Ändere die Befehle und versuche es erneut.');
        } else {
          setRunMessage('Das Energieteil ist da! Führe Robi noch bis zum wartenden Roboter.');
        }
        return;
      }

      const delta = DIRECTIONS.find((item) => item.command === instruction)!.delta;
      const next: Cell = [current[0] + delta[0], current[1] + delta[1]];
      const blocked = next[0] < 0 || next[1] < 0 || next[0] >= mission.cols || next[1] >= mission.rows
        || mission.rocks.some(([x, y]) => x === next[0] && y === next[1]);
      if (blocked) {
        setRunning(false);
        setRunMessage('Plopp! Dort ist ein Felsen oder der Weg endet. Ändere deinen Code und probiere es nochmal.');
        sound.playWrong();
        return;
      }

      current = next;
      setPosition(next);
      if (next[0] === mission.battery[0] && next[1] === mission.battery[1]) {
        collected = true;
        setHasBattery(true);
        sound.playCoin();
      }
      step += 1;
      timer.current = window.setTimeout(moveNext, 360);
    };
    timer.current = window.setTimeout(moveNext, 250);
  };

  const checkAnswer = (answer: number) => {
    if (answer === mission.answer) {
      sound.playCorrect();
      setAnswerMessage('Genau! Der Roboter ist startklar. Programmiere jetzt den Rettungsweg!');
      setStage('code');
    } else {
      sound.playWrong();
      setAnswerMessage(`Noch nicht ganz. ${mission.hint} Schau dir die Aufgabe an und probiere es nochmal!`);
    }
  };

  const resetProgram = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setRunning(false);
    setPosition(mission.start);
    setHasBattery(false);
    setRunMessage('');
  };

  const cellAt = (cell: Cell, target: Cell) => cell[0] === target[0] && cell[1] === target[1];

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-100 px-3 py-4 text-slate-800 sm:px-6 sm:py-5">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <button onClick={onBack} className="rounded-2xl border-2 border-white bg-white/90 p-3 shadow-sm" aria-label="Zurück zur Spielkarte">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
              <p className="text-sm font-extrabold text-emerald-700">{player.name} · {completedCount} / {MISSIONS.length} Rettungen</p>
          <h1 className="font-['Fredoka'] text-2xl font-black text-emerald-950 sm:text-3xl">🤖 RoboForge: Mathe-Rettung</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleMute} className="rounded-2xl border-2 border-white bg-white/90 p-2 shadow-sm" aria-label={isMuted ? (lang === 'de' ? 'Ton einschalten' : 'Bật âm thanh') : (lang === 'de' ? 'Ton ausschalten' : 'Tắt âm thanh')}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <div className="rounded-2xl border-2 border-white bg-white/90 px-3 py-2 text-sm font-black text-amber-700 shadow-sm">⭐ {player.scores.roboforge || 0}</div>
        </div>
      </header>

      <section className="mx-auto mt-5 max-w-6xl">
        <div className="rounded-3xl border-2 border-white/80 bg-white/75 p-4 shadow-lg sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-emerald-700">Energie-Wald · Rettungszentrale</p>
              <h2 className="mt-1 text-xl font-black text-slate-800 sm:text-2xl">Bring die Roboter nach Hause!</h2>
              <p className="mt-1 max-w-2xl text-sm font-semibold text-slate-600">Löse eine Mathe-Aufgabe, sammle das Energieteil und programmiere einen sicheren Weg. Fehler darfst du jederzeit verbessern.</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-800 sm:self-center">
              <Zap className="h-5 w-5 fill-emerald-400" /> Wald-Energie {Math.round((completedCount / MISSIONS.length) * 100)}%
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {CHAPTERS.map((chapter, chapterIndex) => {
              const done = completedMissions.filter((index) => index >= chapter.start && index < chapter.end).length;
              const total = chapter.end - chapter.start;
              return (
                <div key={chapterIndex} className={`rounded-2xl border-2 p-3 ${done === total ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
                  <p className="text-xs font-black uppercase text-emerald-700">Kapitel {chapterIndex + 1}</p>
                  <p className="font-black">{chapter.title}</p>
                  <p className="text-xs font-bold text-slate-500">{done === total ? '✅ Gebiet gerettet!' : `${done} von ${total} Missionen`}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MISSIONS.map((item, index) => {
              const unlocked = index <= Math.min(MISSIONS.length - 1, completedCount);
              const complete = completedMissions.includes(index);
              return (
                <button
                  key={item.title}
                  onClick={() => chooseMission(index)}
                  disabled={!unlocked}
                  className={`rounded-2xl border-2 p-4 text-left transition ${unlocked ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50 shadow-sm hover:-translate-y-0.5 hover:border-emerald-400' : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-black uppercase text-emerald-700">{item.chapter}</p>
                      <h3 className="mt-1 font-black">{item.title}</h3>
                      <p className="text-sm font-semibold text-slate-500">📍 {item.area}</p>
                    </div>
                    <span className="text-2xl" aria-hidden="true">{complete ? '✅' : unlocked ? '🤖' : '🔒'}</span>
                  </div>
                  {complete && <p className="mt-2 text-xs font-black text-amber-700">🧩 Teil gefunden: {item.reward}</p>}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-sky-50 p-3">
            <span className="mr-1 text-sm font-black text-sky-900">Robi-Farbe:</span>
            {ROBOT_SKINS.map((skin, index) => {
              const unlocked = completedCount >= skin.unlock;
              return <button key={skin.name} disabled={!unlocked} onClick={() => setProgress((current) => ({ ...current, skin: index }))} className={`rounded-full border-2 px-3 py-1.5 text-xs font-black ${progress.skin === index ? 'border-sky-700 bg-sky-700 text-white' : unlocked ? 'border-white bg-white text-sky-900' : 'border-slate-200 bg-slate-100 text-slate-400'}`} aria-label={unlocked ? `${skin.name} auswählen` : `${skin.name} nach ${skin.unlock} Rettungen freischalten`}>{unlocked ? skin.name : `🔒 ${skin.name}`}</button>;
            })}
            <span className="ml-auto text-sm">{['🔵', '🟡', '🟢'][progress.skin]} Robi wartet auf dich!</span>
          </div>
        </div>

        {stage !== 'map' && (
          <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <div className="rounded-3xl border-2 border-white bg-white/90 p-4 shadow-lg sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black uppercase text-emerald-700">{mission.chapter} · {mission.area}</p>
                  <h2 className="text-xl font-black">{mission.title}</h2>
                </div>
                <button onClick={() => { resetProgram(); setStage('map'); }} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">Zur Karte</button>
              </div>

              {stage === 'math' ? (
                <div className="rounded-2xl bg-amber-50 p-4 sm:p-6">
                  <p className="text-sm font-black text-amber-800">🔋 Erst die Energie-Aufgabe lösen!</p>
                  <h3 className="my-4 text-center text-xl font-black sm:text-2xl">{mission.math}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {mission.choices.map((choice) => <button key={choice} onClick={() => checkAnswer(choice)} className="min-h-14 rounded-2xl border-2 border-amber-200 bg-white text-xl font-black text-amber-900 shadow-sm transition hover:border-amber-400 active:scale-95">{choice}</button>)}
                  </div>
                  <p className="mt-3 min-h-10 text-center text-sm font-bold text-amber-900" aria-live="polite">{answerMessage || 'Du kannst es in Ruhe versuchen – es gibt keinen Punkteabzug.'}</p>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black">
                    <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">🔋 Energieteil {hasBattery ? 'gesammelt!' : 'einsammeln'}</span>
                    <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-800">🤖 Roboter wartet am Ziel</span>
                  </div>
                  <div className="mx-auto grid max-w-md gap-1.5 rounded-2xl bg-emerald-100 p-2 sm:gap-2 sm:p-3" style={{ gridTemplateColumns: `repeat(${mission.cols}, minmax(0, 1fr))` }} role="img" aria-label={`${mission.area}: Robi steuert über ein Raster zum Energieteil und zum Roboter`}>
                    {Array.from({ length: mission.rows * mission.cols }, (_, index) => {
                      const cell: Cell = [index % mission.cols, Math.floor(index / mission.cols)];
                      const isRock = mission.rocks.some(([x, y]) => x === cell[0] && y === cell[1]);
                      const isPlayer = cellAt(cell, position);
                      const isBattery = cellAt(cell, mission.battery);
                      const isRobot = cellAt(cell, mission.robot);
                      const isStart = cellAt(cell, mission.start);
                      return <div key={index} className={`flex aspect-square items-center justify-center rounded-xl border-2 text-2xl sm:text-3xl ${isRock ? 'border-emerald-700 bg-emerald-700' : 'border-white bg-white/90'}`} aria-hidden="true">
                        {isRock ? '🌳' : isPlayer ? <span className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-xl shadow ${ROBOT_SKINS[progress.skin].color}`}>🤖</span> : isRobot ? '🆘' : isBattery && !hasBattery ? '🔋' : isStart ? '🏁' : '·'}
                      </div>;
                    })}
                  </div>
                  <p className="mt-2 text-center text-xs font-bold text-slate-500">🏁 Start · 🔋 Energieteil · 🆘 Rettungsroboter · 🌳 Hindernis</p>
                </>
              )}
            </div>

            <div className="rounded-3xl border-2 border-white bg-white/90 p-4 shadow-lg sm:p-6">
              {stage === 'won' ? (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                  <div className="animate-bounce text-6xl">🎉</div>
                  <h2 className="mt-3 text-2xl font-black text-emerald-800">Mission geschafft!</h2>
                  <p className="mt-2 font-bold text-slate-600">Du hast {mission.reward} verdient und {mission.area} gerettet.</p>
                  <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-2 font-black text-amber-800">🧩 Neuer Roboter-Teil: {mission.reward}</p>
                  <button onClick={() => { resetProgram(); setStage('map'); }} className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white shadow-lg">Weiter zur Rettungskarte</button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-black text-sky-800">🧠 Dein Programm</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">Tippe Pfeile in der Reihenfolge an. Robi zeigt jeden Schritt sofort.</p>
                  <div className="mt-3 flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 p-3" aria-label="Befehlsfolge">
                    {commands.length ? commands.map((command, index) => <span key={`${command}-${index}`} className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-white px-2 text-lg font-black shadow-sm">{command === 'loop' ? '↻×2' : DIRECTIONS.find((item) => item.command === command)?.icon}</span>) : <span className="text-sm font-bold text-slate-400">Deine Befehle erscheinen hier …</span>}
                  </div>
                  <p className="mt-2 text-right text-xs font-black text-slate-500">{commands.length} / 9 Befehle</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {DIRECTIONS.map(({ command, label, icon }) => <button key={command} onClick={() => addCommand(command)} disabled={running || commands.length >= 9} className="min-h-14 rounded-2xl border-2 border-sky-100 bg-sky-50 text-lg font-black text-sky-900 transition hover:border-sky-300 active:scale-95 disabled:opacity-50">{icon} {label}</button>)}
                  </div>
                  {missionIndex >= 5 && <button onClick={() => addCommand('loop')} disabled={running || commands.length >= 9} className="mt-2 w-full rounded-2xl border-2 border-violet-200 bg-violet-50 px-3 py-3 font-black text-violet-800 disabled:opacity-50">↻ Wiederhole letzten Pfeil 2× <span className="block text-xs font-bold">Eine kleine Schleife spart Befehle!</span></button>}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button onClick={runProgram} disabled={running || commands.length === 0} className="col-span-1 flex items-center justify-center gap-1 rounded-2xl bg-emerald-600 px-2 py-3 text-sm font-black text-white shadow-md disabled:opacity-50"><Play className="h-4 w-4 fill-white" /> Start</button>
                    <button onClick={() => setCommands((current) => current.slice(0, -1))} disabled={running || commands.length === 0} className="flex items-center justify-center gap-1 rounded-2xl bg-amber-100 px-2 py-3 text-sm font-black text-amber-900 disabled:opacity-50"><Undo2 className="h-4 w-4" /> Zurück</button>
                    <button onClick={() => { resetProgram(); setCommands([]); }} disabled={running} className="flex items-center justify-center gap-1 rounded-2xl bg-slate-100 px-2 py-3 text-sm font-black text-slate-700 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Neu</button>
                  </div>
                  {missionIndex >= 5 && <p className="mt-3 rounded-xl bg-violet-50 p-2 text-xs font-bold text-violet-800">Tipp: Die ↻-Schleife wiederholt den letzten Pfeil zweimal. Du kannst danach weiter programmieren.</p>}
                  <p className="mt-3 min-h-10 text-center text-sm font-black text-slate-700" aria-live="polite">{runMessage || 'Sammle erst 🔋 und bring Robi dann zu 🆘.'}</p>
                </>
              )}
            </div>
          </section>
        )}

        {stage === 'won' && completedCount === MISSIONS.length && <div className="mt-4 rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 text-center text-lg font-black text-amber-900">🌳 Der Energie-Wald leuchtet wieder! Danke, Robo Engineer! 🌟</div>}
      </section>
    </main>
  );
};
