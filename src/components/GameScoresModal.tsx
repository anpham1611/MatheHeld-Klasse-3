import React from 'react';
import { X, Trophy, Star, Coins, Sparkles, Check, Save } from 'lucide-react';
import { PlayerProfile, GameScoreDetail } from '../types/game';
import { sound } from '../audio/soundManager';
import { GAME_CATALOG, GAME_SCORE_KEYS } from '../math/gameCatalog';

interface GameScoresModalProps {
  player: PlayerProfile;
  gameScores?: Record<string, GameScoreDetail>;
  onSave: () => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
}

export const GameScoresModal: React.FC<GameScoresModalProps> = ({
  player,
  gameScores = {},
  onSave,
  isSaving,
  onClose,
}) => {
  const games = GAME_SCORE_KEYS.map((key) => ({
    key,
    ...GAME_CATALOG[key],
    score: player.scores[key] || 0,
    solved: gameScores[key]?.problemsSolved || 0,
    timesPlayed: gameScores[key]?.timesPlayed || (player.scores[key] ? 1 : 0),
  }));

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
              {"Ergebnisse & Rekorde je Spiel"}
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
                      {"Gespielt"}: <strong className="text-white">{g.timesPlayed}</strong>
                    </span>
                    {g.solved > 0 && (
                      <span>
                        {"Aufgaben gelöst"}: <strong className="text-emerald-300">{g.solved}</strong>
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
                  {g.scoreMode === 'running' ? 'Gesamtpunkte' : 'Höchstpunktzahl'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
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
                <span>{"Wird gespeichert..."}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{"Speichern"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
