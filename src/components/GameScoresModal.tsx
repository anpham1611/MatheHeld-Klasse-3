import React from 'react';
import { X, Trophy, Star, Coins, Sparkles, Check, Database, Save } from 'lucide-react';
import { Language, PlayerProfile, GameScoreDetail, DbEngineInfo } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';

interface GameScoresModalProps {
  lang: Language;
  player: PlayerProfile;
  gameScores?: Record<string, GameScoreDetail>;
  engineInfo?: DbEngineInfo | null;
  onSave: () => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
}

export const GameScoresModal: React.FC<GameScoresModalProps> = ({
  lang,
  player,
  gameScores = {},
  engineInfo,
  onSave,
  isSaving,
  onClose,
}) => {
  const games = [
    {
      key: 'minecraft',
      name: lang === 'de' ? 'Minecraft 3D Mathe-Welt' : 'Minecraft Toán 3D',
      icon: '🧱🟩',
      score: player.scores.minecraft || 0,
      solved: gameScores['minecraft']?.problemsSolved || 0,
      timesPlayed: gameScores['minecraft']?.timesPlayed || (player.scores.minecraft ? 1 : 0),
      color: 'from-emerald-600/30 to-teal-950/40 border-emerald-500/40 text-emerald-300',
    },
    {
      key: 'number_line',
      name: lang === 'de' ? 'Zahlenstrahl bis 1000' : 'Bay trên trục số 1000',
      icon: '🚀',
      score: player.scores.number_line || 0,
      solved: gameScores['number_line']?.problemsSolved || 0,
      timesPlayed: gameScores['number_line']?.timesPlayed || (player.scores.number_line ? 1 : 0),
      color: 'from-blue-600/30 to-indigo-950/40 border-blue-500/40 text-blue-300',
    },
    {
      key: 'einmaleins',
      name: lang === 'de' ? 'Einmaleins & Division' : 'Võ đài Bảng Cửu Chương',
      icon: '⚡',
      score: player.scores.einmaleins || 0,
      solved: gameScores['einmaleins']?.problemsSolved || 0,
      timesPlayed: gameScores['einmaleins']?.timesPlayed || (player.scores.einmaleins ? 1 : 0),
      color: 'from-amber-600/30 to-red-950/40 border-amber-500/40 text-amber-300',
    },
    {
      key: 'euro_shop',
      name: lang === 'de' ? 'Euro & Cent Supermarkt' : 'Siêu thị Tiền Euro & Cent',
      icon: '💶',
      score: player.scores.euro_shop || 0,
      solved: gameScores['euro_shop']?.problemsSolved || 0,
      timesPlayed: gameScores['euro_shop']?.timesPlayed || (player.scores.euro_shop ? 1 : 0),
      color: 'from-teal-600/30 to-emerald-950/40 border-teal-500/40 text-teal-300',
    },
    {
      key: 'tower_math',
      name: lang === 'de' ? 'Schriftliches Rechnen' : 'Xây tháp Đặt tính rồi tính',
      icon: '🏰',
      score: player.scores.tower_math || 0,
      solved: gameScores['tower_math']?.problemsSolved || 0,
      timesPlayed: gameScores['tower_math']?.timesPlayed || (player.scores.tower_math ? 1 : 0),
      color: 'from-purple-600/30 to-indigo-950/40 border-purple-500/40 text-purple-300',
    },
    {
      key: 'pokemon',
      name: lang === 'de' ? 'PokéMath Arena' : 'Đấu trường PokéMath',
      icon: '⚡🐭',
      score: player.scores.pokemon || 0,
      solved: gameScores['pokemon']?.problemsSolved || 0,
      timesPlayed: gameScores['pokemon']?.timesPlayed || (player.scores.pokemon ? 1 : 0),
      color: 'from-rose-600/30 to-red-950/40 border-rose-500/40 text-rose-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 sm:border-3 border-amber-400/90 rounded-3xl p-4 sm:p-6 max-w-xl w-full text-left shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
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
            📊
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-['Fredoka']">
              {t(lang, 'gameScoresTitle')}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
              <span className="font-bold text-white">{player.name}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {player.stars}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Coins className="w-3.5 h-3.5" />
                {player.euroCoins}
              </span>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar min-h-0">
          {games.map((g) => (
            <div
              key={g.key}
              className={`p-3.5 rounded-2xl bg-gradient-to-r ${g.color} border flex items-center justify-between gap-3 shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <h3 className="font-extrabold text-white text-sm font-['Fredoka']">
                    {g.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                    <span>
                      {t(lang, 'timesPlayed')}: <strong className="text-white">{g.timesPlayed}</strong>
                    </span>
                    {g.solved > 0 && (
                      <span>
                        {t(lang, 'problemsSolved')}: <strong className="text-emerald-300">{g.solved}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1 text-sm font-black text-amber-300 font-['Fredoka']">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>{g.score} Pkt</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  {t(lang, 'bestScore')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Engine:{' '}
              <strong className={engineInfo?.engine === 'turso' ? 'text-cyan-300' : 'text-amber-300'}>
                {engineInfo?.engine === 'turso' ? '⚡ Turso (Cloud)' : '🗄️ SQLite (Local)'}
              </strong>
            </span>
          </div>

          <button
            onClick={async () => {
              sound.playCorrect();
              await onSave();
            }}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm cursor-pointer transition font-['Fredoka'] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>{t(lang, 'saving')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t(lang, 'saveBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
