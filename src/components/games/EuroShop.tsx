import React, { useState } from 'react';
import { ArrowLeft, Pause, RotateCcw, Check, ShoppingBag, Sparkles, HelpCircle, PenTool } from 'lucide-react';
import { Language, PlayerProfile } from '../../types/game';
import { t } from '../../math/translations';
import { sound } from '../../audio/soundManager';
import {
  generateEuroTask,
  EuroTask,
  formatEuro,
  EURO_DENOMINATIONS,
} from '../../math/curriculum';
import { PauseModal } from '../PauseModal';
import { VictoryModal } from '../VictoryModal';
import { Scratchpad } from '../Scratchpad';

interface EuroShopProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const EuroShop: React.FC<EuroShopProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const [task, setTask] = useState<EuroTask>(() => generateEuroTask());
  const [selectedChange, setSelectedChange] = useState<{ value: number; id: string }[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [customersServed, setCustomersServed] = useState(0);

  const currentChangeCents = selectedChange.reduce((sum, item) => sum + item.value, 0);

  const handleAddDenomination = (value: number) => {
    sound.playCoin();
    setSelectedChange((prev) => [...prev, { value, id: `${value}_${Date.now()}_${Math.random()}` }]);
    setFeedback(null);
  };

  const handleRemoveCoin = (id: string) => {
    sound.playHit();
    setSelectedChange((prev) => prev.filter((item) => item.id !== id));
    setFeedback(null);
  };

  const handleClearAll = () => {
    sound.playHit();
    setSelectedChange([]);
    setFeedback(null);
  };

  const handleVerifyChange = () => {
    if (currentChangeCents === task.changeCents) {
      sound.playCorrect();
      setFeedback('correct');
      const addedScore = 150 + streak * 25;
      setScore((s) => s + addedScore);
      setStreak((s) => s + 1);

      setTimeout(() => {
        const nextServed = customersServed + 1;
        setCustomersServed(nextServed);
        if (nextServed >= 5) {
          setShowVictory(true);
          onUpdateStats(3, 25, score + addedScore);
        } else {
          setTask(generateEuroTask());
          setSelectedChange([]);
          setFeedback(null);
          setShowHint(false);
        }
      }, 1000);
    } else {
      sound.playWrong();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] h-[100dvh] overflow-hidden flex flex-col bg-slate-950 select-none">
      {/* Top Header */}
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
            <span>🥖 {lang === 'de' ? 'Deutsche Bäckerei' : 'Tiệm bánh & Euro'}</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-300">
            {lang === 'de'
              ? `Kunde ${customersServed + 1}/5`
              : `Khách ${customersServed + 1}/5`}
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

      {/* Main Cashier Counter Area - Scrollable on mobile */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 pb-28 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 flex flex-col items-center justify-start gap-4">
        {/* Customer & Shopping Receipt Banner */}
        <div className="w-full max-w-2xl bg-slate-900/90 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl mb-4 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Customer info */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-4xl shadow-inner">
                {task.customerAvatar}
              </div>
              <div>
                <div className="text-sm text-slate-400 font-medium">
                  {lang === 'de' ? 'Kunde:' : 'Khách:'}{' '}
                  <span className="text-white font-bold">{task.customerName}</span>
                </div>
                <div className="text-xs text-amber-300 mt-0.5">
                  {t(lang, 'customerPays')}{' '}
                  <span className="font-black text-base text-emerald-400">
                    {formatEuro(task.paidCents)}
                  </span>
                </div>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="flex flex-wrap gap-2 justify-center">
              {task.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-200">
                      {lang === 'de' ? item.nameDe : item.nameVi}
                    </div>
                    <div className="text-[11px] font-black text-amber-400">
                      {formatEuro(item.priceCents)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Math Equation Formula Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{t(lang, 'billAmount')}</span>
              <span className="font-black text-amber-300 font-['Fredoka'] text-lg">
                {formatEuro(task.totalCents)}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800">
              <span className="text-slate-400">
                {formatEuro(task.paidCents)} - {formatEuro(task.totalCents)} =
              </span>
              <span className="font-black text-emerald-400 font-['Fredoka'] text-lg">
                ? Rückgeld
              </span>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-indigo-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{lang === 'de' ? 'Tipp' : 'Gợi ý'}</span>
            </button>
          </div>

          {showHint && (
            <div className="mt-2 text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              💡 {lang === 'de'
                ? `Rechne Schritt für Schritt: Von ${formatEuro(task.totalCents)} bis zum nächsten Euro und dann bis ${formatEuro(task.paidCents)}. Das richtige Rückgeld ist ${formatEuro(task.changeCents)}!`
                : `Tính từng bước: Từ ${formatEuro(task.totalCents)} lên ${formatEuro(task.paidCents)}. Tiền thừa cần thối là ${formatEuro(task.changeCents)}!`}
            </div>
          )}
        </div>

        {/* Change Counter Output Tray (Rückgeld-Ablage) */}
        <div className="w-full max-w-2xl bg-amber-950/20 border-2 border-amber-600/30 rounded-3xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              🪙 {lang === 'de' ? 'Münz-Ablage (Aktuelles Wechselgeld)' : 'Khay tiền thối lại cho khách'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300 font-semibold">
                {lang === 'de' ? 'Liegt bereit:' : 'Đã xếp:'}
              </span>
              <span className="text-xl font-black text-yellow-400 font-['Fredoka'] tabular-nums">
                {formatEuro(currentChangeCents)}
              </span>
              {selectedChange.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-950/40 rounded-lg cursor-pointer ml-2 border border-rose-800"
                >
                  {t(lang, 'clearChange')}
                </button>
              )}
            </div>
          </div>

          {/* Dropped Coins / Notes */}
          <div className="min-h-18 p-2 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-wrap gap-2 items-center">
            {selectedChange.length === 0 ? (
              <span className="text-xs text-slate-500 italic p-2">
                {t(lang, 'dragMoneyHint')}
              </span>
            ) : (
              selectedChange.map((item) => {
                const denom = EURO_DENOMINATIONS.find((d) => d.value === item.value);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleRemoveCoin(item.id)}
                    title="Klicken zum Entfernen"
                    className={`h-11 px-3 rounded-xl flex items-center justify-center font-black text-sm shadow-md cursor-pointer transform hover:scale-105 active:scale-95 transition ${
                      denom?.bg || 'bg-slate-700'
                    }`}
                  >
                    {denom?.label} ✕
                  </button>
                );
              })
            )}
          </div>

          {/* Feedback Banner */}
          {feedback === 'correct' && (
            <div className="mt-2 text-center text-sm font-bold text-emerald-400 bg-emerald-500/20 py-2 rounded-xl animate-in zoom-in-95">
              🎉 {lang === 'de' ? 'Perfekt! Das Wechselgeld stimmt auf den Cent genau!' : 'Chính xác từng xu! Bé giỏi quá!'}
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="mt-2 text-center text-xs font-bold text-rose-400 bg-rose-500/20 py-2 rounded-xl animate-in shake">
              ⚠️ {lang === 'de'
                ? `Das Wechselgeld ist noch nicht ganz richtig (${formatEuro(currentChangeCents)}). Versuche es noch einmal!`
                : `Tiền thối chưa đúng (${formatEuro(currentChangeCents)}). Bé đếm lại nhé!`}
            </div>
          )}
        </div>

        {/* Euro Cash Register Box (Geldkassette: Bills & Coins selection) */}
        <div className="w-full max-w-2xl bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {lang === 'de' ? 'Geldkassette (Euro-Scheine & Münzen auswählen)' : 'Két tiền Euro (Bấm để lấy tiền)'}
          </div>

          {/* Notes (10€, 5€) & Large Coins (2€, 1€) */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {EURO_DENOMINATIONS.slice(0, 4).map((d) => (
              <button
                key={d.value}
                onClick={() => handleAddDenomination(d.value)}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center font-black text-base shadow-lg cursor-pointer transform active:scale-90 transition border-2 ${d.bg}`}
              >
                <span>{d.label}</span>
                <span className="text-[10px] opacity-80 uppercase tracking-tight">
                  {d.type === 'note' ? 'Schein' : 'Münze'}
                </span>
              </button>
            ))}
          </div>

          {/* Cent Coins (50ct, 20ct, 10ct, 5ct, 2ct, 1ct) */}
          <div className="grid grid-cols-6 gap-2">
            {EURO_DENOMINATIONS.slice(4).map((d) => (
              <button
                key={d.value}
                onClick={() => handleAddDenomination(d.value)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center font-black text-xs shadow-md cursor-pointer transform active:scale-90 transition border-2 ${d.bg}`}
              >
                <span>{d.label}</span>
              </button>
            ))}
          </div>

          {/* Hand Over Change Button */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={handleVerifyChange}
              disabled={selectedChange.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>{t(lang, 'giveChange')}</span>
            </button>
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
            setCustomersServed(0);
            setSelectedChange([]);
            setTask(generateEuroTask());
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
          coinsEarned={25}
          onNext={() => {
            setShowVictory(false);
            setCustomersServed(0);
            setSelectedChange([]);
            setTask(generateEuroTask());
          }}
          onRestart={() => {
            setShowVictory(false);
            setScore(0);
            setStreak(0);
            setCustomersServed(0);
            setSelectedChange([]);
            setTask(generateEuroTask());
          }}
          onQuit={onBack}
        />
      )}
    </div>
  );
};
