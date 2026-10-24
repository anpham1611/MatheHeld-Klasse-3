import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, AlertCircle, Sparkles, Info } from 'lucide-react';
import { Language } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';
import { checkPlayerNameAvailability } from '../services/playerService';

interface RenamePlayerModalProps {
  lang: Language;
  currentName: string;
  onRename: (newName: string) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export const RenamePlayerModal: React.FC<RenamePlayerModalProps> = ({
  lang,
  currentName,
  onRename,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(currentName);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    checked: boolean;
    available: boolean;
    exists: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = nameInput.trim();
    setErrorMessage(null);

    // If empty or identical to current name
    if (!trimmed || trimmed.toLowerCase() === currentName.toLowerCase()) {
      setAvailability(null);
      setChecking(false);
      return;
    }

    // If too short, don't query server
    if (trimmed.length < 2) {
      setAvailability(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      const res = await checkPlayerNameAvailability(trimmed);
      setChecking(false);
      setAvailability({
        checked: true,
        available: Boolean(res.available),
        exists: Boolean(res.exists),
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [nameInput, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameInput.trim();

    if (!clean) {
      setErrorMessage(lang === 'de' ? 'Bitte gib einen Namen ein.' : 'Vui lòng nhập tên biệt danh.');
      return;
    }

    if (clean.length < 2 || clean.length > 20) {
      setErrorMessage(t(lang, 'nameMinChars'));
      return;
    }

    if (clean.toLowerCase() === currentName.toLowerCase()) {
      onClose();
      return;
    }

    if (availability?.exists) {
      setErrorMessage(t(lang, 'nameAlreadyTaken'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await onRename(clean);
    setIsSubmitting(false);

    if (result.success) {
      sound.playCorrect();
      onClose();
    } else {
      sound.playWrong();
      setErrorMessage(result.error || (lang === 'de' ? 'Fehler beim Speichern!' : 'Lỗi khi đổi tên!'));
    }
  };

  const trimmed = nameInput.trim();
  const isSameAsCurrent = trimmed.toLowerCase() === currentName.toLowerCase();
  const isTooShort = trimmed.length > 0 && trimmed.length < 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 sm:border-3 border-amber-400/90 rounded-3xl p-4 sm:p-6 max-w-md w-full text-left shadow-2xl relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            <Edit3 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-300 font-['Fredoka']">
              {t(lang, 'renameHero')}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'de'
                ? `Ändere den Namen für "${currentName}". Alle Punkte & Sterne bleiben erhalten!`
                : `Đổi tên cho "${currentName}". Toàn bộ điểm số & ngôi sao được giữ nguyên!`}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t(lang, 'enterPlayerName')} (2 - 20 {lang === 'de' ? 'Zeichen' : 'ký tự'})
            </label>

            <div className="relative">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setErrorMessage(null);
                }}
                maxLength={20}
                autoFocus
                placeholder="Ví dụ: Leo, Mia, Bin..."
                className="w-full bg-slate-900 border-2 border-slate-600 focus:border-amber-400 text-white font-bold px-3 py-2.5 rounded-xl text-base focus:outline-none transition font-['Fredoka']"
              />
              {checking && (
                <div className="absolute right-3 top-3 text-xs text-amber-300 animate-pulse font-bold">
                  {lang === 'de' ? 'Prüfe...' : 'Kiểm tra...'}
                </div>
              )}
            </div>

            {/* Same as current name notice */}
            {isSameAsCurrent && (
              <div className="mt-2.5 text-xs font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{t(lang, 'currentNameNotice')}</span>
              </div>
            )}

            {/* Too short hint */}
            {isTooShort && (
              <div className="mt-2 text-xs font-semibold text-amber-300/80 px-2">
                {t(lang, 'nameMinChars')}
              </div>
            )}

            {/* Only show 'Already taken' when exists is STRICTLY true */}
            {availability?.checked && availability.exists && !isSameAsCurrent && (
              <div className="mt-2.5 text-xs font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{t(lang, 'nameAlreadyTaken')}</span>
              </div>
            )}

            {/* Show 'Available' when exists is false and length >= 2 */}
            {availability?.checked && !availability.exists && availability.available && !isSameAsCurrent && trimmed.length >= 2 && (
              <div className="mt-2.5 text-xs font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t(lang, 'nameAvailableNotice')}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-2 text-xs font-bold text-rose-400 flex items-center gap-1.5 px-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition cursor-pointer"
            >
              {t(lang, 'cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                checking ||
                isSameAsCurrent ||
                trimmed.length < 2 ||
                (availability?.exists ?? false)
              }
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-lg font-['Fredoka']"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? (lang === 'de' ? 'Speichern...' : 'Đang lưu...') : t(lang, 'saveNewName')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
