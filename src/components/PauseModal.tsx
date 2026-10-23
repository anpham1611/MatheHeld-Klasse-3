import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';

interface PauseModalProps {
  lang: Language;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  lang,
  onResume,
  onRestart,
  onQuit,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-400/20 rounded-2xl flex items-center justify-center text-3xl border border-amber-400/40">
          ⏸️
        </div>

        <h2 className="text-3xl font-extrabold text-amber-300 font-['Fredoka'] mb-2">
          {t(lang, 'pause')}
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          {lang === 'de' ? 'Kurze Verschnaufpause für den Mathe-Helden!' : 'Nghỉ giải lao một chút nào bé yêu!'}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              sound.playJump();
              onResume();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-lg cursor-pointer transform active:scale-95 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t(lang, 'resume')}</span>
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onRestart();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-base cursor-pointer transform active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t(lang, 'restart')}</span>
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onToggleMute();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-base cursor-pointer transform active:scale-95 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? t(lang, 'soundOn') : t(lang, 'soundOff')}</span>
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onQuit();
            }}
            className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold rounded-2xl border border-red-500/30 flex items-center justify-center gap-2 text-base cursor-pointer transform active:scale-95 transition"
          >
            <Home className="w-4 h-4" />
            <span>{t(lang, 'quitToMap')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
