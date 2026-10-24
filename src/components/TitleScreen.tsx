import React, { useEffect, useState } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  Globe,
  Award,
  Star,
  Save,
  Users,
  Trophy,
  Check,
  Edit2,
  Coins,
  UserPlus,
} from 'lucide-react';
import { Language, CharacterAvatar, PlayerProfile } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';
import { totalGameScore } from '../math/gameScore';

interface TitleScreenProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  player: PlayerProfile;
  onSelectAvatar: (avatar: CharacterAvatar) => void;
  onStart: () => void;
  onOpenCertificate: () => void;
  onOpenSwitchModal: () => void;
  onOpenScoresModal: () => void;
  onOpenRenameModal: () => void;
  onOpenNewPlayerModal: () => void;
  onSaveProgress: () => Promise<void>;
  isSaving: boolean;
  saveMessage: string | null;
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
  onOpenSwitchModal,
  onOpenScoresModal,
  onOpenRenameModal,
  onOpenNewPlayerModal,
  onSaveProgress,
  isSaving,
  saveMessage,
  isMuted,
  onToggleMute,
}) => {

  useEffect(() => {
    // Keyboard listener: Space or Enter to start (when not editing name input)
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

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
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl" />

        {/* Ambient math floating elements */}
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
      <header className="relative z-10 px-2 py-2 sm:px-6 sm:py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* German Curriculum Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2.5 py-1.5 rounded-2xl backdrop-blur">
            <span className="text-sm">🇩🇪</span>
            <span className="text-xs font-bold text-slate-300 tracking-wide">
              {lang === 'de' ? 'Klasse 3' : 'Toán Lớp 3'}
            </span>
          </div>

          {/* Save Progress Button */}
          <button
            onClick={() => {
              sound.playCorrect();
              onSaveProgress();
            }}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold cursor-pointer transition backdrop-blur shadow-sm active:scale-95"
            title={t(lang, 'saveProgress')}
          >
            <Save className={`w-3.5 h-3.5 text-emerald-400 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? t(lang, 'saving') : t(lang, 'saveProgress')}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create New Hero Button */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenNewPlayerModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold cursor-pointer transition backdrop-blur shadow-sm active:scale-95"
            title={t(lang, 'newHeroBtn')}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{t(lang, 'newHeroBtn')}</span>
          </button>

          {/* Switch Player / Load Old Profile */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenSwitchModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-indigo-600/25 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold cursor-pointer transition backdrop-blur shadow-sm active:scale-95"
            title={t(lang, 'switchPlayer')}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{t(lang, 'changeHero')}</span>
          </button>

          {/* Individual Game Scores */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenScoresModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer transition backdrop-blur shadow-sm active:scale-95"
            title={t(lang, 'gameScoresTitle')}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{t(lang, 'gameScoresTitle')}</span>
          </button>

          {/* Certificate */}
          <button
            onClick={() => {
              sound.playJump();
              onOpenCertificate();
            }}
            className="p-2 sm:px-3 sm:py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer transition backdrop-blur"
            title={t(lang, 'certificateTitle')}
          >
            <Award className="w-4 h-4 text-amber-400" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              sound.playJump();
              onSetLang(lang === 'de' ? 'vi' : 'de');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition backdrop-blur"
            title={t(lang, 'languageToggle')}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'de' ? 'VI' : 'DE'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playJump();
              onToggleMute();
            }}
            className="p-2 sm:p-2 bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl cursor-pointer transition backdrop-blur"
            title={isMuted ? t(lang, 'soundOn') : t(lang, 'soundOff')}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Save / Status Toast Notification */}
      {saveMessage && (
        <div className="relative z-20 mx-auto max-w-md w-full px-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 px-4 py-2 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">{saveMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Centerpiece & Title Lockup */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 text-center my-auto py-2">
        {/* Title Lockup */}
        <div className="mb-2">
          <svg className="w-64 sm:w-88 md:w-[440px] h-auto mx-auto drop-shadow-2xl" viewBox="0 0 500 115">
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
            <text
              x="250"
              y="52"
              textAnchor="middle"
              fontFamily="Fredoka, sans-serif"
              fontWeight="900"
              fontSize="50"
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
              y="95"
              textAnchor="middle"
              fontFamily="Fredoka, sans-serif"
              fontWeight="800"
              fontSize="26"
              fill="url(#blueGrad)"
              letterSpacing="6"
            >
              {lang === 'de' ? 'KLASSE 3 · GRUNDSCHULE' : 'LỚP 3 · TIỂU HỌC'}
            </text>
          </svg>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-4 font-medium">
          {t(lang, 'appSubtitle')}
        </p>

        {/* Hero Character Display & Interactive Profile Card */}
        <div className="relative mb-5 group flex flex-col items-center">
          {/* Avatar Big Preview */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 via-amber-500 to-yellow-400 p-1 shadow-2xl shadow-amber-500/20 transform hover:scale-105 transition duration-300">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-6xl select-none relative overflow-hidden">
              <span className="animate-bounce">{AVATARS.find((a) => a.id === player.avatar)?.emoji || '🦊'}</span>
              <div className="absolute -bottom-1 text-[10px] font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                {lang === 'de' ? 'Dein Held' : 'Nhân vật của bạn'}
              </div>
            </div>
          </div>

          {/* Interactive Player Name (Opens safe Rename Dialog) */}
          <div className="mt-3 flex items-center justify-center">
            <button
              onClick={() => {
                sound.playJump();
                onOpenRenameModal();
              }}
              className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 hover:border-amber-400 px-3.5 py-1.5 rounded-xl backdrop-blur transition cursor-pointer group shadow-sm active:scale-98"
              title={t(lang, 'renameHero')}
            >
              <span className="text-white font-extrabold text-base font-['Fredoka'] tracking-wide group-hover:text-amber-300 transition-colors">
                {player.name}
              </span>
              <span className="p-1 text-slate-400 group-hover:text-amber-300 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* Player Stats Badges */}
          <div className="flex items-center gap-3 mt-2 text-xs font-bold">
            <span className="flex items-center gap-1 text-yellow-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-yellow-500/30">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              {player.stars}
            </span>
            <span className="flex items-center gap-1 text-amber-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-amber-500/30">
              <Coins className="w-3.5 h-3.5" />
              {player.euroCoins}
            </span>
            <span
              className="flex items-center gap-1 text-indigo-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-indigo-500/30"
              title={lang === 'de' ? 'Gesamtpunkte' : 'Tổng điểm'}
            >
              <Trophy className="w-3.5 h-3.5" />
              {totalGameScore(player.scores)} {lang === 'de' ? 'Pkt' : 'điểm'}
            </span>
          </div>

          {/* Avatar Selector (Fox, Owl, Bunny, Bear, Dragon) */}
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
        <div className="space-y-2.5 w-full max-w-xs">
          <button
            onClick={() => {
              sound.playJump();
              onStart();
            }}
            className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 cursor-pointer transform active:scale-95 transition tracking-wide font-['Fredoka'] group"
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
      <footer className="relative z-10 px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 text-center flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-slate-400">
        <span>{t(lang, 'controlsHint')}</span>
      </footer>
    </div>
  );
};
