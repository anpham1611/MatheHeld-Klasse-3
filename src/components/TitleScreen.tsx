import React, { useEffect, useState } from 'react';
import { Play, Volume2, VolumeX, Globe, Award, Sparkles, Star } from 'lucide-react';
import { Language, CharacterAvatar, PlayerProfile } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';

interface TitleScreenProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  player: PlayerProfile;
  onSelectAvatar: (avatar: CharacterAvatar) => void;
  onStart: () => void;
  onOpenCertificate: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const AVATARS: { id: CharacterAvatar; emoji: string; nameDe: string; nameVi: string }[] = [
  { id: 'fuchs', emoji: '🦊', nameDe: 'Leo Fuchs', nameVi: 'Cáo Leo' },
  { id: 'eule', emoji: '🦉', nameDe: 'Mia Eule', nameVi: 'Cú Mia' },
  { id: 'hase', emoji: '🐰', nameDe: 'Ben Hase', nameVi: 'Thỏ Ben' },
  { id: 'baer', emoji: '🐻', nameDe: 'Bruno Bär', nameVi: 'Gấu Bruno' },
  { id: 'drache', emoji: '🐲', nameDe: 'Fiete Drache', nameVi: 'Rồng Fiete' },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  lang,
  onSetLang,
  player,
  onSelectAvatar,
  onStart,
  onOpenCertificate,
  isMuted,
  onToggleMute,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Keyboard listener: Space or Enter to start
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playJump();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="relative w-full min-h-[100dvh] h-[100dvh] overflow-y-auto overscroll-contain bg-slate-950 flex flex-col justify-between select-none p-2 sm:p-4">
      {/* Dynamic Animated Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Cosmic Gradients */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl" />

        {/* Ambient floating math particles */}
        <div className="absolute top-1/4 left-10 text-indigo-400/20 text-7xl font-['Fredoka'] animate-bounce">
          1000
        </div>
        <div className="absolute top-2/3 left-1/4 text-amber-400/20 text-6xl font-['Fredoka']">
          7 × 8
        </div>
        <div className="absolute top-1/5 right-16 text-emerald-400/20 text-6xl font-['Fredoka']">
          2,50 €
        </div>
        <div className="absolute bottom-1/4 right-1/3 text-purple-400/20 text-5xl font-['Fredoka']">
          H-Z-E
        </div>
      </div>

      {/* Top Bar Controls */}
      <header className="relative z-10 px-2.5 py-2 sm:px-6 sm:py-4 flex items-center justify-between gap-2 shrink-0">
        {/* German Curriculum & Pokemon Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl backdrop-blur">
            <span className="text-sm sm:text-base">🇩🇪</span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-300 tracking-wide">
              {lang === 'de' ? 'Klasse 3' : 'Toán Lớp 3'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-600/30 border border-emerald-500/50 px-3 py-1.5 rounded-2xl backdrop-blur animate-pulse">
            <span className="text-sm">🧱</span>
            <span className="text-xs font-extrabold text-emerald-300">
              {lang === 'de' ? 'Minecraft 3D Mathe!' : 'Minecraft Toán 3D!'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 bg-red-600/30 border border-red-500/50 px-3 py-1.5 rounded-2xl backdrop-blur">
            <span className="text-sm">🔴</span>
            <span className="text-xs font-extrabold text-amber-300">
              {lang === 'de' ? 'PokéMath inklusive!' : 'Kèm PokéMath!'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Certificate / Diploma Quick Access */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenCertificate();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer transition backdrop-blur"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{t(lang, 'certificateTitle')}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              sound.playJump();
              onSetLang(lang === 'de' ? 'vi' : 'de');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition backdrop-blur"
            title={t(lang, 'languageToggle')}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'de' ? 'Tiếng Việt' : 'Deutsch'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playJump();
              onToggleMute();
            }}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl cursor-pointer transition backdrop-blur"
            title={isMuted ? t(lang, 'soundOn') : t(lang, 'soundOff')}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Hero Centerpiece & Title Lockup */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 text-center my-auto">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="mb-4">
          <svg className="w-72 sm:w-96 md:w-[480px] h-auto mx-auto drop-shadow-2xl" viewBox="0 0 500 120">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            {/* Title Text */}
            <text
              x="250"
              y="55"
              textAnchor="middle"
              fontFamily="Fredoka, sans-serif"
              fontWeight="900"
              fontSize="52"
              fill="url(#goldGrad)"
              letterSpacing="2"
              stroke="#78350f"
              strokeWidth="4"
              paintOrder="stroke fill"
            >
              {lang === 'de' ? 'MATHEHELD' : 'VUA TOÁN HỌC'}
            </text>
            <text
              x="250"
              y="100"
              textAnchor="middle"
              fontFamily="Fredoka, sans-serif"
              fontWeight="800"
              fontSize="28"
              fill="url(#blueGrad)"
              letterSpacing="6"
            >
              {lang === 'de' ? 'KLASSE 3 · GRUNDSCHULE' : 'LỚP 3 · TIỂU HỌC'}
            </text>
          </svg>
        </div>

        <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto mb-6 font-medium">
          {t(lang, 'appSubtitle')}
        </p>

        {/* Hero Character Display */}
        <div className="relative mb-6 group">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-indigo-600 via-amber-500 to-yellow-400 p-1 shadow-2xl shadow-amber-500/20 transform hover:scale-105 transition duration-300">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-7xl select-none relative overflow-hidden">
              <span className="animate-bounce">{AVATARS.find((a) => a.id === player.avatar)?.emoji || '🦊'}</span>
              <div className="absolute -bottom-1 text-[11px] font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                {lang === 'de' ? 'Wähle deinen Helden' : 'Chọn nhân vật'}
              </div>
            </div>
          </div>

          {/* Quick Avatar Selector */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => {
                  sound.playJump();
                  onSelectAvatar(av.id);
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition cursor-pointer border ${
                  player.avatar === av.id
                    ? 'bg-amber-500 border-yellow-300 scale-110 shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 opacity-80'
                }`}
                title={lang === 'de' ? av.nameDe : av.nameVi}
              >
                {av.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Start CTA */}
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => {
              sound.playJump();
              onStart();
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 cursor-pointer transform active:scale-95 transition tracking-wide font-['Fredoka'] group"
          >
            <Play className="w-6 h-6 fill-current text-slate-950 group-hover:scale-110 transition-transform" />
            <span>{t(lang, 'startAdventure')}</span>
          </button>

          <div className="text-xs text-amber-300 font-semibold tracking-wide">
            {t(lang, 'pressSpaceToStart')}
          </div>
        </div>
      </main>

      {/* Flat Control-Hint Line Footer */}
      <footer className="relative z-10 px-4 py-3 bg-slate-950/90 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400 font-mono tracking-tight">
          {t(lang, 'controlsHint')}
        </p>
      </footer>
    </div>
  );
};
