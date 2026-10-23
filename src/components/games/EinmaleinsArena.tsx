import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Pause, Star, Zap, Shield, Flame, HelpCircle, PenTool } from 'lucide-react';
import { Language, PlayerProfile } from '../../types/game';
import { t } from '../../math/translations';
import { sound } from '../../audio/soundManager';
import { generateEinmaleinsTask, EinmaleinsTask } from '../../math/curriculum';
import { PauseModal } from '../PauseModal';
import { VictoryModal } from '../VictoryModal';
import { Scratchpad } from '../Scratchpad';

interface EinmaleinsArenaProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const MONSTER_TYPES = [
  { name: 'Slimey', emoji: '👾', color: 'from-emerald-400 to-teal-600', maxHp: 1 },
  { name: 'Mushy', emoji: '🍄', color: 'from-rose-400 to-red-600', maxHp: 1 },
  { name: 'Ghosty', emoji: '👻', color: 'from-purple-400 to-indigo-600', maxHp: 1 },
  { name: 'Golem', emoji: '🗿', color: 'from-amber-500 to-orange-700', maxHp: 1 },
  { name: 'Drache Boss', emoji: '🐲', color: 'from-yellow-400 to-red-600', maxHp: 3 },
];

export const EinmaleinsArena: React.FC<EinmaleinsArenaProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const [task, setTask] = useState<EinmaleinsTask>(() => generateEinmaleinsTask(true));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feverMeter, setFeverMeter] = useState(0);
  const [isFever, setIsFever] = useState(false);
  const [monsterIdx, setMonsterIdx] = useState(0);
  const [monsterHp, setMonsterHp] = useState(1);
  const [monsterHit, setMonsterHit] = useState(false);
  const [heroCast, setHeroCast] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrongOption, setWrongOption] = useState<number | null>(null);

  const currentMonster = MONSTER_TYPES[monsterIdx % MONSTER_TYPES.length];

  // Fever timer
  useEffect(() => {
    if (feverMeter >= 100 && !isFever) {
      setIsFever(true);
      sound.playCombo();
      const timer = setTimeout(() => {
        setIsFever(false);
        setFeverMeter(0);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [feverMeter, isFever]);

  // Keyboard shortcut 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        const index = parseInt(e.code.replace('Digit', '')) - 1;
        if (task.options[index]) {
          handleSelectOption(task.options[index], index);
        }
      } else if (e.code === 'Escape') {
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, isPaused, showVictory]);

  const handleSelectOption = (
    opt: { label: string; value: number; remainder?: number },
    idx: number
  ) => {
    if (isPaused || showVictory) return;

    const isCorrect =
      opt.value === task.answer &&
      (task.remainder === undefined || opt.remainder === task.remainder);

    if (isCorrect) {
      sound.playCorrect();
      setHeroCast(true);
      setMonsterHit(true);
      setTimeout(() => {
        setHeroCast(false);
        setMonsterHit(false);
      }, 400);

      const multiplier = isFever ? 2 : 1;
      const pts = (100 + streak * 15) * multiplier;
      setScore((s) => s + pts);
      setStreak((s) => s + 1);
      setFeverMeter((m) => Math.min(100, m + 22));

      // Advance monster or defeat boss
      const nextHp = monsterHp - 1;
      if (nextHp <= 0) {
        sound.playFanfare();
        const nextIdx = monsterIdx + 1;
        if (nextIdx >= 8) {
          setShowVictory(true);
          onUpdateStats(3, 20, score + pts);
        } else {
          setMonsterIdx(nextIdx);
          const nextMon = MONSTER_TYPES[nextIdx % MONSTER_TYPES.length];
          setMonsterHp(nextMon.maxHp);
        }
      } else {
        setMonsterHp(nextHp);
      }

      setTask(generateEinmaleinsTask(true));
      setShowHint(false);
      setWrongOption(null);
    } else {
      sound.playWrong();
      setStreak(0);
      setWrongOption(idx);
      setTimeout(() => setWrongOption(null), 700);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-950 select-none">
      {/* Top HUD */}
      <header className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playJump();
              onBack();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPaused(true)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer transition"
          >
            <Pause className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold border border-indigo-400 cursor-pointer transition"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">{t(lang, 'scratchpad')}</span>
          </button>
        </div>

        {/* Fever Gauge */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800">
          <Flame
            className={`w-5 h-5 ${
              isFever ? 'text-amber-400 animate-bounce' : 'text-slate-500'
            }`}
          />
          <div className="w-24 sm:w-36 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFever
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 animate-pulse'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${isFever ? 100 : feverMeter}%` }}
            />
          </div>
          {isFever && (
            <span className="text-[11px] font-black text-amber-300 animate-pulse hidden sm:inline">
              2x FEUER!
            </span>
          )}
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-xl text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t(lang, 'score')}</div>
            <div className="text-base font-black text-amber-400 tabular-nums font-['Fredoka']">
              {score}
            </div>
          </div>
        </div>
      </header>

      {/* Arena Stage */}
      <div className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-indigo-950/60 to-slate-950">
        {/* Arena Background Dojo Graphics */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <div className="w-96 h-96 rounded-full border-8 border-dashed border-indigo-400/30 animate-spin-slow" />
        </div>

        {/* Monster Cluster */}
        <div className="relative z-10 flex flex-col items-center mt-2">
          {/* Question Banner Above Monster */}
          <div className="bg-slate-900/95 border-3 border-amber-400 rounded-3xl px-8 py-3.5 shadow-2xl text-center mb-4 transform hover:scale-105 transition">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
              {task.op === 'x'
                ? lang === 'de'
                  ? 'Multiplikation (Einmaleins)'
                  : 'Phép nhân (Bảng cửu chương)'
                : lang === 'de'
                ? 'Division mit Rest'
                : 'Phép chia có số dư'}
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white font-['Fredoka'] tracking-wide">
              {task.questionStr}
            </div>

            {/* Hint Toggle */}
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-indigo-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{lang === 'de' ? 'Rechen-Tipp' : 'Gợi ý giải'}</span>
              </button>
            </div>
            {showHint && (
              <div className="mt-1 text-xs text-amber-300 font-medium animate-in fade-in">
                💡 {lang === 'de' ? task.hintDe : task.hintVi}
              </div>
            )}
          </div>

          {/* Monster Avatar */}
          <div
            className={`relative flex flex-col items-center transition-transform duration-200 ${
              monsterHit ? 'scale-75 rotate-12 opacity-80' : 'hover:scale-105'
            }`}
          >
            {/* Monster HP */}
            <div className="flex gap-1 mb-2">
              {Array.from({ length: currentMonster.maxHp }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-2 rounded-full ${
                    i < monsterHp ? 'bg-rose-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr shadow-2xl flex items-center justify-center text-6xl sm:text-7xl border-4 border-white/20 relative">
              <span>{currentMonster.emoji}</span>
              {monsterHit && (
                <div className="absolute inset-0 bg-white/40 rounded-3xl animate-ping" />
              )}
            </div>

            <div className="text-sm font-black text-slate-300 mt-2 font-['Fredoka']">
              {currentMonster.name} ({monsterIdx + 1}/8)
            </div>
          </div>
        </div>

        {/* Hero Character & Spell Casting */}
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
          {/* Hero Sprite */}
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-lg mb-4 transition-transform ${
              heroCast ? '-translate-y-4 scale-110' : ''
            }`}
          >
            🦊
          </div>

          {/* Spell Answer Options (4 buttons with keyboard shortcuts [1, 2, 3, 4]) */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {task.options.map((opt, i) => {
              const isWrong = wrongOption === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt, i)}
                  className={`py-4 px-6 rounded-2xl border-3 font-['Fredoka'] font-black text-2xl sm:text-3xl flex items-center justify-between cursor-pointer transition transform active:scale-95 shadow-xl ${
                    isWrong
                      ? 'bg-rose-600/80 border-rose-400 text-white animate-shake'
                      : 'bg-slate-800/90 hover:bg-indigo-600/90 border-slate-700 hover:border-indigo-400 text-white'
                  }`}
                >
                  <span className="text-xs text-slate-400 bg-slate-900/60 px-2 py-1 rounded-lg">
                    Taste {i + 1}
                  </span>
                  <span className="tracking-wide">{opt.label}</span>
                  <Zap className="w-5 h-5 text-amber-400 opacity-60" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scratchpad Window */}
      {showScratchpad && (
        <Scratchpad lang={lang} onClose={() => setShowScratchpad(false)} />
      )}

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          lang={lang}
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            setIsPaused(false);
            setScore(0);
            setStreak(0);
            setMonsterIdx(0);
            setMonsterHp(1);
            setTask(generateEinmaleinsTask(true));
          }}
          onQuit={onBack}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      )}

      {/* Victory Modal */}
      {showVictory && (
        <VictoryModal
          lang={lang}
          score={score}
          starsEarned={3}
          streak={streak}
          coinsEarned={20}
          onNext={() => {
            setShowVictory(false);
            setMonsterIdx(0);
            setMonsterHp(1);
            setTask(generateEinmaleinsTask(true));
          }}
          onRestart={() => {
            setShowVictory(false);
            setScore(0);
            setStreak(0);
            setMonsterIdx(0);
            setMonsterHp(1);
            setTask(generateEinmaleinsTask(true));
          }}
          onQuit={onBack}
        />
      )}
    </div>
  );
};
