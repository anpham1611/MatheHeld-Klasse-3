import React, { useState } from 'react';
import { ShieldAlert, Trash2, X, Lock } from 'lucide-react';
import { Language } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';

interface DeletePlayerConfirmModalProps {
  lang: Language;
  playerName: string;
  onConfirmDelete: () => Promise<void>;
  onClose: () => void;
}

export const DeletePlayerConfirmModal: React.FC<DeletePlayerConfirmModalProps> = ({
  lang,
  playerName,
  onConfirmDelete,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const REQUIRED_PIN = '8888';
  const isPinCorrect = pinInput.trim() === REQUIRED_PIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPinCorrect) {
      sound.playWrong();
      setErrorMsg(t(lang, 'wrongCode8888'));
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete();
      sound.playWrong();
      onClose();
    } catch {
      setErrorMsg(lang === 'de' ? 'Fehler beim Löschen!' : 'Lỗi khi xoá!');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 sm:border-3 border-rose-500/90 rounded-3xl p-5 sm:p-6 max-w-md w-full text-left shadow-2xl relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Header */}
        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="w-12 h-12 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-rose-400 font-['Fredoka']">
              {t(lang, 'deleteConfirmTitle')}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              {lang === 'de' ? `Spieler: "${playerName}"` : `Tài khoản: "${playerName}"`}
            </p>
          </div>
        </div>

        {/* Form with 8888 Code Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-2xl">
            <p className="text-xs text-slate-200 mb-3 leading-relaxed">
              {t(lang, 'deleteConfirmPrompt')}
            </p>

            <div className="flex flex-col items-center gap-2">
              <div className="relative w-full max-w-[200px]">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
                    setErrorMsg(null);
                  }}
                  maxLength={4}
                  autoFocus
                  placeholder="••••"
                  className="w-full text-center bg-slate-950 border-2 border-rose-500/60 focus:border-rose-400 text-rose-200 font-black text-2xl tracking-[0.5em] py-2 px-3 rounded-xl focus:outline-none transition font-mono"
                />
                <Lock className="w-4 h-4 text-rose-400 absolute left-3 top-3.5 opacity-60" />
              </div>
            </div>

            {errorMsg && (
              <div className="mt-3 text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-500/60 px-3 py-1.5 rounded-xl text-center">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition cursor-pointer"
            >
              {t(lang, 'cancelBtn')}
            </button>

            <button
              type="submit"
              disabled={!isPinCorrect || isDeleting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl cursor-pointer transition flex items-center gap-2 shadow-lg shadow-rose-900/40 active:scale-95 font-['Fredoka']"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {isDeleting
                  ? (lang === 'de' ? 'Wird gelöscht...' : 'Đang xoá...')
                  : t(lang, 'confirmDeletePermanently')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
