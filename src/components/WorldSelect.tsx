import React from 'react';
import {
  ArrowLeft,
  Star,
  Trophy,
  Award,
  Sparkles,
  Volume2,
  VolumeX,
  Globe,
  Save,
  Users,
  Check,
  Coins,
} from 'lucide-react';
import { GameScreen, Language, PlayerProfile, CharacterAvatar, DbEngineInfo } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';

interface WorldSelectProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  player: PlayerProfile;
  onSelectWorld: (world: GameScreen) => void;
  onBackToTitle: () => void;
  onSaveProgress: () => Promise<void>;
  isSaving: boolean;
  saveMessage: string | null;
  onOpenScoresModal: () => void;
  onOpenSwitchModal: () => void;
  engineInfo: DbEngineInfo | null;
  isMuted: boolean;
  onToggleMute: () => void;
}

const AVATAR_EMOJIS: Record<CharacterAvatar, string> = {
  fuchs: '🦊',
  eule: '🦉',
  hase: '🐰',
  baer: '🐻',
  drache: '🐲',
};

export const WorldSelect: React.FC<WorldSelectProps> = ({
  lang,
  onSetLang,
  player,
  onSelectWorld,
  onBackToTitle,
  onSaveProgress,
  isSaving,
  saveMessage,
  onOpenScoresModal,
  onOpenSwitchModal,
  engineInfo,
  isMuted,
  onToggleMute,
}) => {
  const worlds = [
    {
      id: 'minecraft' as GameScreen,
      title: t(lang, 'worldMinecraftTitle'),
      desc: t(lang, 'worldMinecraftDesc'),
      icon: '🧱🟩',
      bgGradient: 'from-emerald-600 via-teal-800 to-green-950',
      borderColor: 'border-emerald-300',
      badge: lang === 'de' ? '⭐ 3D VOXEL MINECRAFT' : '⭐ MINECRAFT TOÁN 3',
      score: player.scores.minecraft || 0,
    },
    {
      id: 'number_line' as GameScreen,
      title: t(lang, 'world1Title'),
      desc: t(lang, 'world1Desc'),
      icon: '🚀',
      bgGradient: 'from-blue-600 to-indigo-900',
      borderColor: 'border-blue-400',
      badge: lang === 'de' ? 'Zahlen bis 1000' : 'Số đến 1000',
      score: player.scores.number_line,
    },
    {
      id: 'einmaleins' as GameScreen,
      title: t(lang, 'world2Title'),
      desc: t(lang, 'world2Desc'),
      icon: '⚡',
      bgGradient: 'from-amber-600 to-red-900',
      borderColor: 'border-amber-400',
      badge: lang === 'de' ? '1x1 & Division' : '1x1 & Phép chia',
      score: player.scores.einmaleins,
    },
    {
      id: 'euro_shop' as GameScreen,
      title: t(lang, 'world3Title'),
      desc: t(lang, 'world3Desc'),
      icon: '💶',
      bgGradient: 'from-emerald-600 to-teal-950',
      borderColor: 'border-emerald-400',
      badge: 'Euro & Cent',
      score: player.scores.euro_shop,
    },
    {
      id: 'tower_math' as GameScreen,
      title: t(lang, 'world4Title'),
      desc: t(lang, 'world4Desc'),
      icon: '🏰',
      bgGradient: 'from-purple-600 to-indigo-950',
      borderColor: 'border-purple-400',
      badge: lang === 'de' ? 'Schriftl. Rechnen' : 'Đặt tính rồi tính',
      score: player.scores.tower_math,
    },
    {
      id: 'pokemon' as GameScreen,
      title: t(lang, 'worldPokemonTitle'),
      desc: t(lang, 'worldPokemonDesc'),
      icon: '⚡🐭',
      bgGradient: 'from-red-600 via-amber-600 to-rose-950',
      borderColor: 'border-amber-300',
      badge: lang === 'de' ? '🔴 NEU: POKÉMON' : '🔴 MỚI: POKÉMON',
      score: player.scores.pokemon || 0,
    },
    {
      id: 'logic_game' as GameScreen,
      title: t(lang, 'worldLogicTitle'),
      desc: t(lang, 'worldLogicDesc'),
      icon: '🧩🌈',
      bgGradient: 'from-fuchsia-600 via-pink-700 to-rose-950',
      borderColor: 'border-pink-300',
      badge: lang === 'de' ? '🧠 20 BILDER-RÄTSEL' : '🧠 20 CÂU ĐỐ HÌNH',
      score: player.scores.logic_game || 0,
    },
  ];

  return (
    <div className="relative w-full min-h-[100dvh] h-[100dvh] overflow-y-auto overscroll-contain bg-slate-950 flex flex-col justify-between p-3 sm:p-6 pb-20 select-none">
      {/* Responsive Header */}
      <header className="flex flex-col gap-2.5 pb-3 border-b border-slate-800 w-full shrink-0">
        <div className="flex items-center justify-between gap-2 w-full flex-wrap">
          {/* Left: Back button & Save Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playJump();
                onBackToTitle();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition border border-slate-700 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'de' ? 'Menü' : 'Menu'}</span>
            </button>

            {/* SAVE BUTTON AT MENU */}
            <button
              onClick={async () => {
                sound.playCorrect();
                await onSaveProgress();
              }}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold rounded-xl text-xs sm:text-sm cursor-pointer transition shadow-md shadow-emerald-600/30 border border-emerald-400/40 active:scale-95 disabled:opacity-50 font-['Fredoka']"
              title={t(lang, 'saveProgress')}
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? t(lang, 'saving') : t(lang, 'saveProgress')}</span>
            </button>
          </div>

          {/* Center: Player Stats Banner (clickable to switch player) */}
          <div
            onClick={() => {
              sound.playJump();
              onOpenSwitchModal();
            }}
            className="hidden md:flex items-center gap-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-700 hover:border-amber-400/60 px-3.5 py-1.5 rounded-2xl shadow-inner cursor-pointer transition"
            title={t(lang, 'switchPlayer')}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{AVATAR_EMOJIS[player.avatar] || '🦊'}</span>
              <span className="font-black text-white text-sm font-['Fredoka'] truncate max-w-[120px]">
                {player.name}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-1 text-yellow-400 font-black text-xs">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span>{player.stars}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
              <Coins className="w-3.5 h-3.5" />
              <span>{player.euroCoins}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              ({engineInfo?.engine === 'turso' ? 'Turso' : 'SQLite'})
            </span>
          </div>

          {/* Right: Scores breakdown, Certificate, Language, Sound */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View All Game Scores Modal */}
            <button
              onClick={() => {
                sound.playJump();
                onOpenScoresModal();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer transition font-['Fredoka']"
              title={t(lang, 'gameScoresTitle')}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{lang === 'de' ? 'Spielstände' : 'Bảng điểm'}</span>
            </button>

            {/* Certificate */}
            <button
              onClick={() => {
                sound.playJump();
                onSelectWorld('certificate');
              }}
              className="p-2 sm:px-3 sm:py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer transition"
              title={t(lang, 'certificateTitle')}
            >
              <Award className="w-4 h-4 text-amber-400" />
            </button>

            {/* Language */}
            <button
              onClick={() => {
                sound.playJump();
                onSetLang(lang === 'de' ? 'vi' : 'de');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
              title={t(lang, 'languageToggle')}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-black">{lang === 'de' ? 'DE' : 'VI'}</span>
            </button>

            {/* Sound */}
            <button
              onClick={() => {
                sound.playJump();
                onToggleMute();
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl cursor-pointer transition"
              title={isMuted ? t(lang, 'soundOn') : t(lang, 'soundOff')}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Player Stats Banner */}
        <div
          onClick={() => {
            sound.playJump();
            onOpenSwitchModal();
          }}
          className="flex md:hidden items-center justify-between gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-inner text-xs w-full cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span>{AVATAR_EMOJIS[player.avatar] || '🦊'}</span>
            <span className="font-bold text-white font-['Fredoka'] truncate max-w-[110px]">{player.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
              <Star className="w-3 h-3 fill-yellow-400" />
              <span>{player.stars}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Coins className="w-3 h-3" />
              <span>{player.euroCoins}</span>
            </div>
          </div>
        </div>

        {/* Save confirmation banner */}
        {saveMessage && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold">{saveMessage}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">SQLite / Turso DB</span>
          </div>
        )}
      </header>

      {/* Main World Selection Grid */}
      <main className="max-w-4xl w-full mx-auto my-auto py-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Fredoka'] mb-2">
            {t(lang, 'modesTitle')}
          </h2>
          <p className="text-slate-400 text-sm">
            {lang === 'de'
              ? 'Wähle ein Fachgebiet der 3. Klasse und sammle goldene Sterne für dein Mathe-Diplom!'
              : 'Chọn chủ đề toán lớp 3 và tích luỹ thật nhiều sao vàng để nhận Bằng Khen!'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {worlds.map((w) => (
            <div
              key={w.id}
              onClick={() => {
                sound.playJump();
                onSelectWorld(w.id);
              }}
              className={`group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${w.bgGradient} border-3 ${w.borderColor} shadow-xl hover:shadow-2xl cursor-pointer transform hover:-translate-y-1.5 transition-all duration-200`}
            >
              {/* Badge & Highscore */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur">
                  {w.badge}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-200 bg-black/30 px-2.5 py-1 rounded-full">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{w.score} Pkt</span>
                </div>
              </div>

              {/* Title & Icon */}
              <div className="flex items-start gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {w.icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-black text-white font-['Fredoka'] tracking-wide group-hover:text-yellow-300 transition-colors">
                    {w.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 mt-1">
                    {w.desc}
                  </p>
                </div>
              </div>

              {/* Play CTA Bar */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-black text-white">
                <span className="flex items-center gap-1 text-yellow-300">
                  <Sparkles className="w-4 h-4" />
                  <span>{w.id === 'logic_game'
                    ? (lang === 'de' ? 'Ab 3 Jahren' : 'Dành cho bé từ 3 tuổi')
                    : (lang === 'de' ? '3. Klasse Lehrplan' : 'Chương trình Lớp 3')}</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform">
                  {lang === 'de' ? 'Spielen ▶' : 'Vào chơi ▶'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="text-center py-2 text-xs text-slate-500 font-mono">
        {lang === 'de' ? 'Grundschule Deutschland · Klasse 3 Mathematik' : 'Toán Lớp 3 · Tiêu Chuẩn Tiểu Học Quốc Tế'}
        {' • '}{engineInfo?.engine === 'turso' ? '⚡ Turso Cloud' : '🗄️ SQLite'}
      </footer>
    </div>
  );
};
