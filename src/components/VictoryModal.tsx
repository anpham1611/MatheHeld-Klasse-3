import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { Language } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';

interface VictoryModalProps {
  lang: Language;
  score: number;
  starsEarned: number;
  streak: number;
  coinsEarned: number;
  onNext: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  lang,
  score,
  starsEarned,
  streak,
  coinsEarned,
  onNext,
  onRestart,
  onQuit,
}) => {
  useEffect(() => {
    sound.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-400/20 blur-3xl pointer-events-none rounded-full" />

        <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-2xl flex items-center justify-center text-4xl shadow-xl shadow-yellow-500/30 animate-bounce">
          🏆
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 font-['Fredoka'] mb-1">
          {t(lang, 'wellDone')}
        </h2>
        <p className="text-emerald-400 font-bold text-sm tracking-wide uppercase mb-6">
          {lang === 'de' ? 'Klasse 3 Mathe-Champion!' : 'Nhà vô địch toán lớp 3!'}
        </p>

        {/* Reward Badges */}
        <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">{t(lang, 'stars')}</span>
            <div className="flex items-center gap-1 text-yellow-400 font-black text-xl font-['Fredoka']">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>+{starsEarned}</span>
            </div>
          </div>

          <div className="flex flex-col items-center border-x border-slate-700/60 px-2">
            <span className="text-xs text-slate-400 mb-1">{t(lang, 'score')}</span>
            <div className="flex items-center gap-1 text-indigo-400 font-black text-xl font-['Fredoka']">
              <Trophy className="w-5 h-5 text-indigo-400" />
              <span>{score}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">{t(lang, 'coins')}</span>
            <div className="flex items-center gap-1 text-amber-400 font-black text-xl font-['Fredoka']">
              <span className="text-lg">🪙</span>
              <span>+{coinsEarned}</span>
            </div>
          </div>
        </div>

        {streak > 2 && (
          <div className="mb-6 py-2 px-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
            <span>🔥</span>
            <span>
              {lang === 'de'
                ? `Mega Serie von ${streak} richtigen Antworten am Stück!`
                : `Chuỗi siêu phàm: ${streak} câu trả lời đúng liên tiếp!`}
            </span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => {
              sound.playJump();
              onNext();
            }}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 text-lg cursor-pointer transform active:scale-95 transition"
          >
            <span>{lang === 'de' ? 'Nächste Runde spielen' : 'Chơi hiệp tiếp theo'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                sound.playJump();
                onRestart();
              }}
              className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-sm cursor-pointer transform active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t(lang, 'restart')}</span>
            </button>

            <button
              onClick={() => {
                sound.playJump();
                onQuit();
              }}
              className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-sm cursor-pointer transform active:scale-95 transition"
            >
              <span>{t(lang, 'quitToMap')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
