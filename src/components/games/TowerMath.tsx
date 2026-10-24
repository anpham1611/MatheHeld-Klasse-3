import React, { useState } from 'react';
import { ArrowLeft, Pause, Check, RotateCcw, Building2, HelpCircle, PenTool } from 'lucide-react';
import { Language, PlayerProfile } from '../../types/game';
import { t } from '../../math/translations';
import { sound } from '../../audio/soundManager';
import { generateTowerTask, TowerTask } from '../../math/curriculum';
import { PauseModal } from '../PauseModal';
import { VictoryModal } from '../VictoryModal';
import { Scratchpad } from '../Scratchpad';

interface TowerMathProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TowerMath: React.FC<TowerMathProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const [task, setTask] = useState<TowerTask>(() => generateTowerTask(true));
  const [isAddition, setIsAddition] = useState(true);

  // User input digits
  const [userE, setUserE] = useState('');
  const [userZ, setUserZ] = useState('');
  const [userH, setUserH] = useState('');
  const [userCarryE, setUserCarryE] = useState(''); // Übertrag from Einer to Zehner
  const [userCarryZ, setUserCarryZ] = useState(''); // Übertrag from Zehner to Hunderter

  const [towerHeight, setTowerHeight] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const resetInputs = () => {
    setUserE('');
    setUserZ('');
    setUserH('');
    setUserCarryE('');
    setUserCarryZ('');
    setErrorFeedback(null);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckAnswer = () => {
    if (isProcessing || showVictory || isPaused) return;
    const fullAnswer = parseInt(`${userH || '0'}${userZ || '0'}${userE || '0'}`);
    setIsProcessing(true);

    if (fullAnswer === task.answer) {
      sound.playCorrect();
      const nextScore = score + 1;
      setScore(nextScore);
      setStreak((s) => s + 1);

      const nextHeight = towerHeight + 1;
      setTowerHeight(nextHeight);

      if (nextHeight >= 5) {
        setShowVictory(true);
        onUpdateStats(3, 30, nextScore);
        setIsProcessing(false);
      } else {
        setTimeout(() => {
          const nextOpAddition = Math.random() > 0.4;
          setIsAddition(nextOpAddition);
          setTask(generateTowerTask(nextOpAddition));
          resetInputs();
          setShowHint(false);
          setIsProcessing(false);
        }, 500);
      }
    } else {
      sound.playWrong();
      setStreak(0);
      const nextScore = Math.max(0, score - 1);
      setScore(nextScore);
      setErrorFeedback(
        lang === 'de'
          ? `Leider falsch (${fullAnswer}). Die richtige Antwort war ${task.answer} (-1 Punkt). Nächste Aufgabe...`
          : `Chưa đúng (${fullAnswer}). Đáp án đúng là ${task.answer} (-1 điểm). Đang chuyển câu tiếp...`
      );

      // Advance to next task without allowing retry on this problem
      setTimeout(() => {
        const nextOpAddition = Math.random() > 0.4;
        setIsAddition(nextOpAddition);
        setTask(generateTowerTask(nextOpAddition));
        resetInputs();
        setShowHint(false);
        setErrorFeedback(null);
        setIsProcessing(false);
      }, 1200);
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] h-[100dvh] overflow-hidden flex flex-col bg-slate-950 select-none">
      {/* Header */}
      <header className="px-3 py-2 sm:px-4 sm:py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20 shrink-0 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              sound.playJump();
              onBack();
            }}
            className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => setIsPaused(true)}
            className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer transition"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold border border-indigo-400 cursor-pointer transition"
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t(lang, 'scratchpad')}</span>
          </button>
        </div>

        <div className="text-center">
          <div className="text-[11px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {lang === 'de'
                ? 'Turmbau: Schriftlich'
                : 'Xây tháp đặt tính'}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-300">
            {lang === 'de' ? `Etage: ${towerHeight}/5` : `Tầng: ${towerHeight}/5`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-xl text-right">
            <div className="text-[9px] text-slate-400 uppercase font-bold">{t(lang, 'score')}</div>
            <div className="text-sm sm:text-base font-black text-amber-400 tabular-nums font-['Fredoka']">
              {score}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Scrollable on mobile */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 pb-28 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 flex flex-col md:flex-row items-center justify-start md:justify-center gap-6">
        {/* Left: The Math Castle Tower Graphic (order-2 on mobile so table comes first) */}
        <div className="order-2 md:order-1 flex flex-col items-center justify-end h-48 sm:h-80 w-full sm:w-44 max-w-xs bg-slate-900/60 rounded-3xl border-2 border-indigo-900/60 p-3 relative">
          <div className="absolute top-2.5 text-xs text-indigo-300 font-bold uppercase">
            {lang === 'de' ? '🏰 Mathe-Turm' : '🏰 Tháp Toán Học'}
          </div>

          {/* Tower Blocks stacked bottom to top */}
          <div className="w-full flex flex-col-reverse gap-1.5">
            {Array.from({ length: 5 }).map((_, idx) => {
              const isBuilt = idx < towerHeight;
              return (
                <div
                  key={idx}
                  className={`w-full h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                    isBuilt
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-100'
                      : 'border-2 border-dashed border-slate-800 bg-slate-950/40 text-slate-600'
                  }`}
                >
                  {isBuilt ? (lang === 'de' ? `Etage ${idx + 1} ⭐` : `Tầng ${idx + 1} ⭐`) : `...`}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: The German Column Calculation Table (Stellenwertgitter) */}
        <div className="order-1 md:order-2 w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 text-slate-900 shadow-2xl border-4 border-indigo-300 flex flex-col items-center font-['Fredoka']">
          {/* Header Row: H - Z - E */}
          <div className="grid grid-cols-4 gap-2 w-full text-center text-sm font-black mb-2">
            <div></div>
            <div className="bg-red-100 text-red-700 py-1 rounded-lg">H (100)</div>
            <div className="bg-blue-100 text-blue-700 py-1 rounded-lg">Z (10)</div>
            <div className="bg-emerald-100 text-emerald-700 py-1 rounded-lg">E (1)</div>
          </div>

          {/* First Number Row */}
          <div className="grid grid-cols-4 gap-2 w-full text-center text-3xl font-black mb-2">
            <div></div>
            <div className="py-2 bg-slate-50 rounded-xl">{task.h1}</div>
            <div className="py-2 bg-slate-50 rounded-xl">{task.z1}</div>
            <div className="py-2 bg-slate-50 rounded-xl">{task.e1}</div>
          </div>

          {/* Second Number Row with Operator */}
          <div className="grid grid-cols-4 gap-2 w-full text-center text-3xl font-black mb-2 items-center">
            <div className="text-indigo-600 text-4xl">{task.op}</div>
            <div className="py-2 bg-slate-50 rounded-xl">{task.h2}</div>
            <div className="py-2 bg-slate-50 rounded-xl">{task.z2}</div>
            <div className="py-2 bg-slate-50 rounded-xl">{task.e2}</div>
          </div>

          {/* Carrying Row (Übertrag) */}
          <div className="grid grid-cols-4 gap-2 w-full text-center mb-2 items-center text-xs">
            <div className="text-slate-400 font-bold">{t(lang, 'carryingLabel')}</div>
            <input
              type="text"
              maxLength={1}
              value={userCarryZ}
              onChange={(e) => setUserCarryZ(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-10 h-8 mx-auto text-center font-bold text-red-600 bg-red-50 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            />
            <input
              type="text"
              maxLength={1}
              value={userCarryE}
              onChange={(e) => setUserCarryE(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-10 h-8 mx-auto text-center font-bold text-blue-600 bg-blue-50 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <div></div>
          </div>

          {/* Divider Line (Rechenstrich) */}
          <div className="w-full border-t-4 border-slate-900 my-2" />

          {/* Answer Input Row (Ergebnis) */}
          <div className="grid grid-cols-4 gap-2 w-full text-center text-3xl font-black mb-4">
            <div className="flex items-center justify-center text-xl text-emerald-600">=</div>
            <input
              type="text"
              maxLength={1}
              disabled={isProcessing}
              value={userH}
              onChange={(e) => setUserH(e.target.value.replace(/\D/g, ''))}
              placeholder="?"
              className="py-2 text-center text-3xl font-black bg-emerald-50 border-2 border-emerald-400 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
            <input
              type="text"
              maxLength={1}
              disabled={isProcessing}
              value={userZ}
              onChange={(e) => setUserZ(e.target.value.replace(/\D/g, ''))}
              placeholder="?"
              className="py-2 text-center text-3xl font-black bg-emerald-50 border-2 border-emerald-400 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
            <input
              type="text"
              maxLength={1}
              disabled={isProcessing}
              value={userE}
              onChange={(e) => setUserE(e.target.value.replace(/\D/g, ''))}
              placeholder="?"
              className="py-2 text-center text-3xl font-black bg-emerald-50 border-2 border-emerald-400 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Feedback & Error */}
          {errorFeedback && (
            <div className="w-full text-center text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl mb-3 border border-rose-200">
              {errorFeedback}
            </div>
          )}

          {/* Buttons: Check & Hint */}
          <div className="w-full flex gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              disabled={isProcessing}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl cursor-pointer transition text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Tipp</span>
            </button>

            <button
              onClick={handleCheckAnswer}
              disabled={isProcessing}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              <span>{t(lang, 'checkAnswer')}</span>
            </button>
          </div>

          {showHint && (
            <div className="mt-3 text-xs text-indigo-950 bg-indigo-50 p-3 rounded-xl border border-indigo-200 w-full text-left">
              💡 {task.op === '+' ? (
                <>
                  Schritt 1: Einer zusammenrechnen ({task.e1} + {task.e2} = {task.e1 + task.e2}). Übertrag notieren!<br />
                  Schritt 2: Zehner mit Übertrag rechnen.<br />
                  Schritt 3: Hunderter addieren.
                </>
              ) : (
                <>
                  Schritt 1: Einer subtrahieren ({task.e1} - {task.e2}). Wenn nötig, Zehner entbündeln!<br />
                  Schritt 2: Zehner rechnen.<br />
                  Schritt 3: Hunderter rechnen.
                </>
              )}
            </div>
          )}
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
            setTowerHeight(0);
            resetInputs();
            setTask(generateTowerTask(isAddition));
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
          coinsEarned={30}
          onNext={() => {
            setShowVictory(false);
            setTowerHeight(0);
            resetInputs();
            setTask(generateTowerTask(true));
          }}
          onRestart={() => {
            setShowVictory(false);
            setScore(0);
            setStreak(0);
            setTowerHeight(0);
            resetInputs();
            setTask(generateTowerTask(true));
          }}
          onQuit={onBack}
        />
      )}
    </div>
  );
};
