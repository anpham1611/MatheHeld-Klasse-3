import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX } from 'lucide-react';
import { PlayerProfile } from '../../types/game';
import { sound } from '../../audio/soundManager';
import {
  generateMonsterRound,
  MAX_MONSTERS_PER_ROUND,
  MIN_MONSTERS_PER_ROUND,
  MonsterDesign,
  MonsterShape,
} from '../../math/monsterParty';

interface MonsterPartyProps {
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const BODY_PATHS: Record<MonsterShape, string> = {
  round: 'M80 27 C112 27 130 48 128 82 C126 113 108 129 80 129 C50 129 31 111 32 80 C32 48 49 27 80 27Z',
  pointy: 'M80 19 C95 37 122 39 127 66 C135 101 111 128 80 129 C48 130 26 106 33 73 C38 49 64 40 80 19Z',
  square: 'M51 30 Q80 20 109 30 Q130 37 128 60 L126 103 Q124 127 101 129 L58 128 Q33 126 32 103 L32 58 Q32 36 51 30Z',
  tall: 'M80 20 C112 20 121 44 117 75 L111 111 Q107 132 80 132 Q52 132 48 111 L43 74 C39 44 49 20 80 20Z',
  wide: 'M80 34 C108 26 136 42 135 75 C134 106 109 123 80 119 C50 126 25 107 25 77 C24 46 51 27 80 34Z',
  spiky: 'M80 18 L93 38 L116 27 L116 51 L138 62 L123 79 L135 99 L110 105 L105 131 L82 118 L62 133 L55 109 L30 108 L40 84 L23 67 L46 54 L44 31 L68 39Z',
};

const ARM_PATHS = [
  ['M39 76 Q21 57 16 72 Q15 82 31 89', 'M121 76 Q139 57 144 72 Q145 82 129 89'],
  ['M39 77 Q18 81 19 96 Q22 104 39 94', 'M121 77 Q142 81 141 96 Q138 104 121 94'],
  ['M39 76 Q21 54 18 42', 'M121 76 Q139 54 142 42'],
];

function MonsterArt({ monster, silhouette = false }: { monster: MonsterDesign; silhouette?: boolean }) {
  const fill = silhouette ? '#201b2b' : monster.color;
  const stroke = silhouette ? '#201b2b' : '#28334a';
  const eyePositions = monster.eyes === 1 ? [80] : monster.eyes === 2 ? [62, 98] : [52, 80, 108];
  const arms = ARM_PATHS[monster.pose];

  return (
    <svg viewBox="0 0 160 160" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: monster.antennae }, (_, index) => {
        const x = monster.antennae === 1 ? 80 : index === 0 ? 59 : 101;
        return <g key={`antenna-${index}`}>
          <path d={`M${x} 34 Q${x - 3} 20 ${x} 12`} fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <circle cx={x} cy="11" r="6" fill={silhouette ? fill : monster.accent} stroke={stroke} strokeWidth="3" />
        </g>;
      })}
      {monster.horns > 0 && <path d="M54 43 L43 22 L68 38Z" fill={silhouette ? fill : monster.accent} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />}
      {monster.horns > 1 && <path d="M106 39 L120 20 L124 48Z" fill={silhouette ? fill : monster.accent} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />}
      {arms.map((path, index) => <path key={`arm-${index}`} d={path} fill="none" stroke={stroke} strokeWidth="11" strokeLinecap="round" />)}
      <path d="M59 119 Q52 137 43 139 M101 119 Q108 137 117 139" fill="none" stroke={stroke} strokeWidth="12" strokeLinecap="round" />
      <path d={BODY_PATHS[monster.shape]} fill={fill} stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
      {!silhouette && <>
        {eyePositions.map((x, index) => <g key={`eye-${index}`}>
          <ellipse cx={x} cy="68" rx="13" ry="16" fill="#fffdf5" stroke={stroke} strokeWidth="3" />
          <circle cx={x + 2} cy="70" r="6" fill="#263044" />
          <circle cx={x + 4} cy="68" r="2" fill="white" />
        </g>)}
        {monster.mouth === 'smile' && <path d="M59 94 Q80 116 101 94" fill="#f57b9d" stroke={stroke} strokeWidth="4" strokeLinecap="round" />}
        {monster.mouth === 'toothy' && <path d="M59 91 Q80 86 101 91 L96 108 Q80 116 64 108Z" fill="#fff5d5" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />}
        {monster.mouth === 'surprised' && <ellipse cx="80" cy="101" rx="10" ry="14" fill="#713958" stroke={stroke} strokeWidth="4" />}
        {monster.mouth === 'zigzag' && <path d="M59 96 L70 91 L80 101 L91 91 L102 96 Q93 116 80 111 Q67 116 59 96Z" fill="#ffb34e" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />}
        <circle cx="49" cy="84" r="4" fill={monster.accent} opacity=".8" />
        <circle cx="111" cy="84" r="4" fill={monster.accent} opacity=".8" />
      </>}
    </svg>
  );
}

export const MonsterParty: React.FC<MonsterPartyProps> = ({
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const [monsterCount, setMonsterCount] = useState(MIN_MONSTERS_PER_ROUND);
  const [round, setRound] = useState(() => generateMonsterRound(MIN_MONSTERS_PER_ROUND));
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
  const [draggingMonsterId, setDraggingMonsterId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'wrong' | 'correct' | null>(null);
  const [complete, setComplete] = useState(false);
  const matchedCount = Object.keys(connections).length;

  const connectMonster = useCallback((monsterId: string, shadowId: string) => {
    if (complete || connections[monsterId]) return;
    if (monsterId !== shadowId) {
      sound.playWrong();
      setFeedback('wrong');
      setSelectedMonsterId(null);
      return;
    }

    const nextConnections = { ...connections, [monsterId]: shadowId };
    setConnections(nextConnections);
    setSelectedMonsterId(null);
    setFeedback('correct');
    sound.playCorrect();

    if (Object.keys(nextConnections).length === round.monsters.length) {
      setComplete(true);
      sound.playFanfare();
      onUpdateStats(3, 10, round.monsters.length);
    }
  }, [complete, connections, onUpdateStats, round.monsters.length]);

  useEffect(() => {
    if (!draggingMonsterId) return;

    const handlePointerUp = (event: PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-shadow-id]');
      if (target?.dataset.shadowId) connectMonster(draggingMonsterId, target.dataset.shadowId);
      setDraggingMonsterId(null);
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [connectMonster, draggingMonsterId]);

  const startNewRound = (count = monsterCount) => {
    setMonsterCount(count);
    setRound(generateMonsterRound(count));
    setConnections({});
    setSelectedMonsterId(null);
    setDraggingMonsterId(null);
    setFeedback(null);
    setComplete(false);
  };

  const monsterRows = new Map(round.monsters.map((monster, index) => [monster.id, index]));
  const shadowRows = new Map(round.shadows.map((monster, index) => [monster.id, index]));

  return (
    <main className="h-[100dvh] min-h-[100dvh] overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top,#fff7df_0%,#f9e9c8_55%,#f1dcb8_100%)] px-3 py-3 text-slate-800 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3">
          <button onClick={onBack} aria-label="Zur Weltkarte" className="rounded-2xl border-2 border-amber-200 bg-white/90 p-3 shadow-sm transition hover:bg-white active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs font-extrabold text-violet-700 sm:text-sm">{player.name} · {player.scores.monsterparty || 0} Punkte</p>
            <h1 className="font-['Fredoka'] text-2xl font-black text-indigo-950 sm:text-4xl">Monsterparty <span aria-hidden="true">👾</span></h1>
            <p className="text-xs font-bold text-slate-600 sm:text-sm">Vorschulblock · Logisches Denken · ab 5 Jahre</p>
          </div>
          <button onClick={onToggleMute} aria-label={isMuted ? 'Ton einschalten' : 'Ton ausschalten'} className="rounded-2xl border-2 border-amber-200 bg-white/90 p-3 shadow-sm transition hover:bg-white active:scale-95">
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </header>

        <section className="mt-5 rounded-[2rem] border-[5px] border-white bg-[#fffdf6] p-3 shadow-[0_16px_50px_rgba(114,76,27,.18)] sm:mt-7 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-['Fredoka'] text-xl font-black text-indigo-950 sm:text-2xl">Monsterparty</p>
              <p className="max-w-xl text-sm font-bold text-slate-600 sm:text-base">Ziehe jedes bunte Monster zu seinem passenden Schatten!</p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="monster-count" className="flex flex-col rounded-2xl bg-violet-100 px-3 py-2 text-xs font-black text-violet-900">
                <span>Monster pro Runde</span>
                <select
                  id="monster-count"
                  value={monsterCount}
                  onChange={(event) => startNewRound(Number(event.target.value))}
                  className="mt-1 rounded-lg border border-violet-200 bg-white px-2 py-1 text-base font-black text-indigo-950 outline-offset-2"
                >
                  {Array.from(
                    { length: MAX_MONSTERS_PER_ROUND - MIN_MONSTERS_PER_ROUND + 1 },
                    (_, index) => MIN_MONSTERS_PER_ROUND + index,
                  ).map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
              <div className="min-w-24 rounded-2xl bg-amber-100 px-3 py-2 text-center">
                <span className="block text-xs font-black uppercase tracking-wide text-amber-800">Geschafft</span>
                <span className="font-['Fredoka'] text-xl font-black text-amber-950">{matchedCount} / {round.monsters.length}</span>
              </div>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3 px-1 text-center text-xs font-black uppercase tracking-wider text-slate-500 sm:gap-6 sm:text-sm">
            <span>Die Monster</span>
            <span>Die Schatten</span>
          </div>

          <div className="relative">
            <svg viewBox={`0 0 1000 ${round.monsters.length * 96 - 8}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
              {Object.entries(connections).map(([monsterId, shadowId]) => {
                const startY = 44 + (monsterRows.get(monsterId) ?? 0) * 96;
                const endY = 44 + (shadowRows.get(shadowId) ?? 0) * 96;
                return <path key={monsterId} d={`M250 ${startY} C420 ${startY}, 580 ${endY}, 750 ${endY}`} fill="none" stroke="#8a5bd4" strokeWidth="8" strokeLinecap="round" opacity=".75" />;
              })}
            </svg>

            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="flex flex-col gap-2">
                {round.monsters.map((monster, index) => {
                  const matched = Boolean(connections[monster.id]);
                  const selected = selectedMonsterId === monster.id || draggingMonsterId === monster.id;
                  return <button
                    key={monster.id}
                    type="button"
                    disabled={matched || complete}
                    onPointerDown={() => {
                      if (matched || complete) return;
                      setDraggingMonsterId(monster.id);
                      setSelectedMonsterId(monster.id);
                      setFeedback(null);
                    }}
                    onClick={() => {
                      if (!matched && !complete) {
                        setSelectedMonsterId(monster.id);
                        setFeedback(null);
                      }
                    }}
                    aria-label={`Monster ${index + 1} zum passenden Schatten ziehen oder auswählen`}
                    className={`relative z-10 flex h-[88px] touch-none items-center justify-center rounded-2xl border-[3px] bg-white px-1 shadow-[0_4px_0_#e8dcc5] transition sm:h-[88px] ${matched ? 'border-emerald-300 bg-emerald-50 opacity-70' : selected ? 'border-violet-500 ring-4 ring-violet-200' : 'border-amber-100 hover:border-amber-300'} ${matched || complete ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                  >
                    <span className="h-[76px] w-[76px] sm:h-[82px] sm:w-[82px]"><MonsterArt monster={monster} /></span>
                    {matched && <span className="absolute right-1 top-1 text-sm" aria-hidden="true">✓</span>}
                  </button>;
                })}
              </div>

              <div className="flex flex-col gap-2">
                {round.shadows.map((shadow, index) => {
                  const matched = Object.values(connections).includes(shadow.id);
                  return <button
                    key={shadow.id}
                    type="button"
                    data-shadow-id={shadow.id}
                    disabled={matched || complete}
                    onClick={() => {
                      if (selectedMonsterId) connectMonster(selectedMonsterId, shadow.id);
                    }}
                    aria-label={`Schatten ${index + 1} auswählen`}
                    className={`relative z-10 flex h-[88px] items-center justify-center rounded-2xl border-[3px] px-1 shadow-[0_4px_0_#e8dcc5] transition ${matched ? 'border-emerald-300 bg-emerald-50 opacity-70' : 'border-slate-200 bg-[#f7f3ec] hover:border-violet-300 hover:bg-white'} ${matched || complete ? 'cursor-default' : 'cursor-crosshair'}`}
                  >
                    <span className="h-[76px] w-[76px] sm:h-[82px] sm:w-[82px]"><MonsterArt monster={shadow} silhouette /></span>
                    {matched && <span className="absolute right-1 top-1 text-sm" aria-hidden="true">✓</span>}
                  </button>;
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 min-h-8 text-center" aria-live="polite">
            {feedback === 'wrong' && <p className="font-black text-rose-600">Fast! Suche weiter nach dem passenden Schatten.</p>}
            {feedback === 'correct' && !complete && <p className="font-black text-emerald-700">Genau! Das passt perfekt!</p>}
            {!feedback && !complete && <p className="text-sm font-bold text-slate-500">Du kannst auch erst ein Monster und dann seinen Schatten antippen.</p>}
          </div>
        </section>

        {complete && <section className="mt-5 rounded-[2rem] border-4 border-amber-300 bg-white p-5 text-center shadow-lg sm:p-7">
          <div className="mb-2 text-5xl" aria-hidden="true">🎉👾🌟</div>
          <h2 className="font-['Fredoka'] text-2xl font-black text-indigo-950 sm:text-3xl">Alle Monster gefunden!</h2>
          <p className="mt-1 font-bold text-slate-600">Du hast alle {round.monsters.length} Monster ihren Schatten zugeordnet. Toll gemacht!</p>
          <div className="my-3 flex items-center justify-center gap-2 font-black text-amber-600"><Trophy className="h-5 w-5" />{round.monsters.length} von {round.monsters.length} richtig</div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => startNewRound()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-black text-white shadow-md transition hover:bg-violet-500 active:scale-95"><RefreshCw className="h-5 w-5" />Neue Monster</button>
            <button onClick={onBack} className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-amber-950 shadow-md transition hover:bg-amber-300 active:scale-95">Zur Weltkarte</button>
          </div>
        </section>}
      </div>
    </main>
  );
};
