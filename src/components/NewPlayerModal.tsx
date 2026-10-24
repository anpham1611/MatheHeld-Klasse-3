import React, { useState, useEffect } from 'react';
import { UserPlus, Sparkles, Check, X, AlertCircle, ArrowRight } from 'lucide-react';
import { Language, CharacterAvatar } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';
import { checkPlayerNameAvailability, fetchSavedPlayersList } from '../services/playerService';

interface NewPlayerModalProps {
  lang: Language;
  isOpen: boolean;
  isFirstTime?: boolean;
  onCreatePlayer: (name: string, avatar: CharacterAvatar) => Promise<{ success: boolean; error?: string }>;
  onPickExisting?: () => void;
  onClose: () => void;
}

const AVATAR_OPTIONS: { id: CharacterAvatar; emoji: string; nameDe: string; nameVi: string }[] = [
  { id: 'fuchs', emoji: '🦊', nameDe: 'Leo Fuchs', nameVi: 'Cáo Leo' },
  { id: 'eule', emoji: '🦉', nameDe: 'Mia Eule', nameVi: 'Cú Mia' },
  { id: 'hase', emoji: '🐰', nameDe: 'Ben Hase', nameVi: 'Thỏ Ben' },
  { id: 'baer', emoji: '🐻', nameDe: 'Bruno Bär', nameVi: 'Gấu Bruno' },
  { id: 'drache', emoji: '🐲', nameDe: 'Fiete Drache', nameVi: 'Rồng Fiete' },
];

export const NewPlayerModal: React.FC<NewPlayerModalProps> = ({
  lang,
  isOpen,
  isFirstTime = false,
  onCreatePlayer,
  onPickExisting,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<CharacterAvatar>('fuchs');
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    checked: boolean;
    available: boolean;
    exists: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasExistingAccounts, setHasExistingAccounts] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNameInput('');
      setErrorMessage(null);
      setAvailability(null);
      setChecking(false);
      return;
    }
    fetchSavedPlayersList().then((list) => {
      setHasExistingAccounts(list.length > 0);
    });
  }, [isOpen]);

  useEffect(() => {
    const trimmed = nameInput.trim();
    setErrorMessage(null);

    if (!trimmed || trimmed.length < 2) {
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
  }, [nameInput]);

  if (!isOpen) return null;

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

    if (availability?.exists) {
      setErrorMessage(t(lang, 'nameAlreadyTaken'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await onCreatePlayer(clean, selectedAvatar);
    setIsSubmitting(false);

    if (result.success) {
      sound.playCorrect();
      onClose();
    } else {
      sound.playWrong();
      setErrorMessage(result.error || (lang === 'de' ? 'Fehler beim Erstellen!' : 'Lỗi khi tạo tài khoản!'));
    }
  };

  const trimmed = nameInput.trim();
  const isTooShort = trimmed.length > 0 && trimmed.length < 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 sm:border-3 border-amber-400/90 rounded-3xl p-4 sm:p-6 max-w-lg w-full text-left shadow-2xl relative flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Close Button - hide if first-time onboarding so they complete profile or select existing */}
        {!isFirstTime && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            {isFirstTime ? '👋' : <UserPlus className="w-6 h-6 text-amber-400" />}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-['Fredoka']">
              {isFirstTime ? t(lang, 'welcomeFirstTimeTitle') : t(lang, 'createNewProfile')}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isFirstTime ? t(lang, 'welcomeFirstTimeDesc') : (lang === 'de' ? 'Erstelle ein neues Benutzerkonto mit eigenen Sternen & Münzen:' : 'Tạo hồ sơ mới riêng biệt (bắt đầu từ 0 sao, 0 xu, điểm độc lập):')}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selection */}
          <div className="bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t(lang, 'chooseStarterAvatar')}
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => {
                    sound.playJump();
                    setSelectedAvatar(av.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition cursor-pointer ${
                    selectedAvatar === av.id
                      ? 'bg-amber-500/25 border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600 opacity-75 hover:opacity-100'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{av.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-300 mt-1 truncate max-w-full font-['Fredoka']">
                    {lang === 'de' ? av.nameDe.split(' ')[0] : av.nameVi.split(' ')[1] || av.nameVi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nickname Input */}
          <div className="bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                placeholder="Zum Beispiel: Tom, Mia, Ben, Anna …"
                className="w-full bg-slate-900 border-2 border-slate-600 focus:border-amber-400 text-white font-bold px-3 py-2.5 rounded-xl text-base focus:outline-none transition font-['Fredoka']"
              />
              {checking && (
                <div className="absolute right-3 top-3 text-xs text-amber-300 animate-pulse font-bold">
                  {lang === 'de' ? 'Prüfe...' : 'Kiểm tra...'}
                </div>
              )}
            </div>

            {/* Too short hint */}
            {isTooShort && (
              <div className="mt-2 text-xs font-semibold text-amber-300/80 px-2">
                {t(lang, 'nameMinChars')}
              </div>
            )}

            {/* Only show 'Already taken' when exists is STRICTLY true */}
            {availability?.checked && availability.exists && (
              <div className="mt-2.5 text-xs font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{t(lang, 'nameAlreadyTaken')}</span>
              </div>
            )}

            {/* Show 'Available' when exists is false and length >= 2 */}
            {availability?.checked && !availability.exists && availability.available && trimmed.length >= 2 && (
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-between pt-2">
            {isFirstTime && hasExistingAccounts && onPickExisting ? (
              <button
                type="button"
                onClick={onPickExisting}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer py-1"
              >
                {t(lang, 'orChooseExisting')}
              </button>
            ) : !isFirstTime ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition cursor-pointer w-full sm:w-auto"
              >
                {t(lang, 'cancelBtn')}
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                checking ||
                trimmed.length < 2 ||
                (availability?.exists ?? false)
              }
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-lg font-['Fredoka'] active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? (lang === 'de' ? 'Erstelle...' : 'Đang tạo...') : t(lang, 'createAndStart')}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
