import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Database, ArrowRight, X, Star, Coins, Trophy, UserPlus, Trash2, Search } from 'lucide-react';
import { Language, CharacterAvatar, SavedPlayerSummary, DbEngineInfo } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';
import { fetchSavedPlayersList, loadPlayerFromDb, fetchDbStatus, deletePlayerInDb } from '../services/playerService';
import { DeletePlayerConfirmModal } from './DeletePlayerConfirmModal';

interface PlayerSwitchModalProps {
  lang: Language;
  currentName: string;
  onSelectPlayer: (name: string, isExisting: boolean) => Promise<void>;
  onOpenCreateNew?: () => void;
  onClose: () => void;
}

const AVATAR_EMOJIS: Record<CharacterAvatar, string> = {
  fuchs: '🦊',
  eule: '🦉',
  hase: '🐰',
  baer: '🐻',
  drache: '🐲',
};

export const PlayerSwitchModal: React.FC<PlayerSwitchModalProps> = ({
  lang,
  currentName,
  onSelectPlayer,
  onOpenCreateNew,
  onClose,
}) => {
  const [inputName, setInputName] = useState(currentName);
  const [savedPlayers, setSavedPlayers] = useState<SavedPlayerSummary[]>([]);
  const [engineInfo, setEngineInfo] = useState<DbEngineInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<{
    checked: boolean;
    exists: boolean;
    player?: any;
  } | null>(null);

  useEffect(() => {
    loadPlayers();
    fetchDbStatus().then(setEngineInfo);
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    const list = await fetchSavedPlayersList();
    setSavedPlayers(list);
    setLoading(false);
  };

  const handleCheckName = async (nameToCheck: string) => {
    const trimmed = nameToCheck.trim();
    if (!trimmed) {
      setMatchStatus(null);
      return;
    }
    setSearching(true);
    const res = await loadPlayerFromDb(trimmed);
    setSearching(false);
    setMatchStatus({
      checked: true,
      exists: res.exists,
      player: res.player,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputName.trim();
    if (!clean) return;

    sound.playCorrect();
    const res = await loadPlayerFromDb(clean);
    await onSelectPlayer(clean, res.exists);
    onClose();
  };

  const handlePickSaved = async (player: SavedPlayerSummary) => {
    sound.playCorrect();
    await onSelectPlayer(player.name, true);
    onClose();
  };

  const handleDeletePlayer = async (playerToDelete: string) => {
    sound.playWrong();
    await deletePlayerInDb(playerToDelete);
    setDeleteConfirmTarget(null);
    loadPlayers();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 sm:border-3 border-amber-400/90 rounded-3xl p-4 sm:p-6 max-w-lg w-full text-left shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
          title="Đóng / Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            👤
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-['Fredoka']">
              {t(lang, 'switchPlayer')}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'de'
                ? 'Wähle deinen Helden oder erstelle ein neues Benutzerkonto:'
                : 'Chọn tài khoản của bạn hoặc tạo người chơi hoàn toàn mới:'}
            </p>
          </div>
        </div>

        {/* Action: Create New Player Button */}
        {onOpenCreateNew && (
          <div className="mb-3">
            <button
              onClick={() => {
                sound.playJump();
                onOpenCreateNew();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md font-['Fredoka'] active:scale-98"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>{t(lang, 'newHeroBtn')}</span>
            </button>
          </div>
        )}

        {/* Search / Direct Load Form */}
        <form onSubmit={handleSubmit} className="mb-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            <span>{t(lang, 'enterPlayerName')}</span>
            <span className="text-[10px] text-slate-400 normal-case font-normal">
              {lang === 'de' ? 'Zum schnellen Laden' : 'Tìm tài khoản đã lưu'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  setMatchStatus(null);
                }}
                onBlur={() => handleCheckName(inputName)}
                maxLength={20}
                placeholder="Ví dụ: Leo, Mia, Bin..."
                className="w-full bg-slate-900 border border-slate-600 focus:border-amber-400 text-white font-bold pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none transition font-['Fredoka']"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
            <button
              type="submit"
              disabled={!inputName.trim() || searching}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition flex items-center gap-1 shrink-0 shadow-md font-['Fredoka']"
            >
              <span>{matchStatus?.exists ? (lang === 'de' ? 'Laden' : 'Tải lại') : (lang === 'de' ? 'Start' : 'Vào')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Real-time Match Notice */}
          {matchStatus?.checked && (
            <div
              className={`mt-2 text-xs font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${
                matchStatus.exists
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {matchStatus.exists ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {lang === 'de'
                      ? `Gefunden! (${matchStatus.player?.stars || 0} ⭐, ${matchStatus.player?.euroCoins || 0} 🪙) - Klicke "Laden"`
                      : `Tìm thấy dữ liệu cũ! (${matchStatus.player?.stars || 0} ⭐, ${matchStatus.player?.euroCoins || 0} 🪙) - Bấm "Tải lại"`}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    {lang === 'de'
                      ? 'Kein Konto gefunden. Nutze "+ Neuer Held" zum Erstellen!'
                      : 'Chưa có tài khoản này. Bấm "+ Tạo người chơi mới" ở trên nhé!'}
                  </span>
                </>
              )}
            </div>
          )}
        </form>

        {/* Saved Players List */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 px-1 mb-1">
            <span>{t(lang, 'savedAccounts')}</span>
            <span className="text-[11px] text-amber-400 font-mono">
              {savedPlayers.length} {lang === 'de' ? 'Spieler' : 'tài khoản'}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              {lang === 'de' ? 'Lade Spieler...' : 'Đang tải danh sách người chơi...'}
            </div>
          ) : savedPlayers.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
              {lang === 'de'
                ? 'Noch keine Spieler gespeichert. Klicke auf "+ Neuer Held"!'
                : 'Chưa có người chơi nào. Bấm vào "+ Tạo người chơi mới"!'}
            </div>
          ) : (
            savedPlayers.map((p) => {
              const isCurrent = p.name.toLowerCase() === currentName.toLowerCase();
              const isConfirmingDelete = deleteConfirmTarget === p.name;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-400 shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div
                    onClick={() => handlePickSaved(p)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                      {AVATAR_EMOJIS[p.avatar] || '🦊'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm font-['Fredoka'] truncate">
                          {p.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md uppercase shrink-0">
                            {lang === 'de' ? 'Aktiv' : 'Đang chơi'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 text-yellow-400 font-bold">
                          <Star className="w-3 h-3 fill-yellow-400" />
                          {p.stars}
                        </span>
                        <span className="flex items-center gap-1 text-amber-300 font-bold">
                          <Coins className="w-3 h-3" />
                          {p.euroCoins}
                        </span>
                        <span className="flex items-center gap-1 text-indigo-300 font-bold truncate">
                          <Trophy className="w-3 h-3 shrink-0" />
                          {p.bestGameScore} Pkt
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Choose or Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePickSaved(p)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition font-['Fredoka'] cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-200'
                      }`}
                    >
                      {isCurrent ? (lang === 'de' ? 'Ausgewählt' : 'Đang chọn') : (lang === 'de' ? 'Wählen' : 'Chọn')}
                    </button>
                    {!isCurrent && (
                      <button
                        onClick={() => setDeleteConfirmTarget(p.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
                        title={t(lang, 'deletePlayer')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Database Engine Information Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Engine:{' '}
              <span className={`font-bold uppercase ${engineInfo?.engine === 'turso' ? 'text-cyan-300' : 'text-amber-300'}`}>
                {engineInfo?.engine === 'turso' ? '⚡ Turso Cloud' : '🗄️ SQLite File'}
              </span>
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[10px] truncate max-w-[160px]">
            {engineInfo?.databaseTarget}
          </span>
        </div>

        {/* Security PIN 8888 Delete Confirmation Modal */}
        {deleteConfirmTarget && (
          <DeletePlayerConfirmModal
            lang={lang}
            playerName={deleteConfirmTarget}
            onConfirmDelete={async () => {
              await handleDeletePlayer(deleteConfirmTarget);
            }}
            onClose={() => setDeleteConfirmTarget(null)}
          />
        )}
      </div>
    </div>
  );
};
