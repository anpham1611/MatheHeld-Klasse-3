import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen, Language, CharacterAvatar, PlayerProfile, GameScoreDetail, DbEngineInfo } from './types/game';
import { sound } from './audio/soundManager';
import { TitleScreen } from './components/TitleScreen';
import { WorldSelect } from './components/WorldSelect';
import { NumberLineGlider } from './components/games/NumberLineGlider';
import { EinmaleinsArena } from './components/games/EinmaleinsArena';
import { EuroShop } from './components/games/EuroShop';
import { TowerMath } from './components/games/TowerMath';
import { PokemonArena } from './components/games/PokemonArena';
import { MinecraftMathWorld } from './components/games/MinecraftMathWorld';
import { CertificateModal } from './components/CertificateModal';
import { PlayerSwitchModal } from './components/PlayerSwitchModal';
import { GameScoresModal } from './components/GameScoresModal';
import { loadPlayerFromDb, savePlayerToDb, fetchDbStatus } from './services/playerService';

const STORAGE_KEY = 'matheheld_klasse3_profile_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Leo der Fuchs',
  avatar: 'fuchs',
  stars: 12,
  euroCoins: 45,
  currentStreak: 0,
  highestStreak: 5,
  unlockedHats: ['standard'],
  equippedHat: 'standard',
  capturedPokemon: ['pikachu'],
  scores: {
    minecraft: 320,
    number_line: 450,
    einmaleins: 620,
    euro_shop: 380,
    tower_math: 250,
    pokemon: 150,
  },
  totalProblemsSolved: 24,
};

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [lang, setLang] = useState<Language>('vi');
  const [isMuted, setIsMuted] = useState(false);

  // Database & Engine state
  const [engineInfo, setEngineInfo] = useState<DbEngineInfo | null>(null);
  const [gameScores, setGameScores] = useState<Record<string, GameScoreDetail>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modals
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);

  // Player Profile initialized from localStorage or default
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_PROFILE;
  });

  // Fetch DB engine status and sync player profile on boot
  useEffect(() => {
    fetchDbStatus().then((info) => {
      if (info) setEngineInfo(info);
    });

    // Try loading current player from database (SQLite or Turso)
    const currentName = player.name || 'Leo der Fuchs';
    loadPlayerFromDb(currentName).then((res) => {
      if (res.exists && res.player) {
        setPlayer(res.player);
        if (res.gameScores) setGameScores(res.gameScores);
      } else {
        // Player doesn't exist yet in DB; save initial state
        savePlayerToDb(player).catch(() => {});
      }
      if (res.engine) setEngineInfo(res.engine);
    });
  }, []);

  // Save profile to localStorage on change for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch {}
  }, [player]);

  // Flash a notification toast
  const triggerSaveToast = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => {
      setSaveMessage(null);
    }, 3500);
  };

  // Manual or automatic Save Progress to SQLite / Turso
  const handleSaveProgress = useCallback(async (lastGameMeta?: {
    gameKey: string;
    score: number;
    starsEarned?: number;
    coinsEarned?: number;
  }) => {
    setIsSaving(true);
    try {
      const res = await savePlayerToDb(player, lastGameMeta);
      if (res.success) {
        if (res.gameScores) {
          setGameScores(res.gameScores);
        }
        if (res.engine) {
          setEngineInfo(res.engine);
        }
        const engineLabel = res.engine?.engine === 'turso' ? 'Turso' : 'SQLite';
        const msg = lang === 'de'
          ? `Spielstand für ${player.name} in ${engineLabel} gespeichert!`
          : `Đã lưu kết quả của ${player.name} vào ${engineLabel} thành công!`;
        triggerSaveToast(msg);
      } else {
        triggerSaveToast(lang === 'de' ? 'Lokal gespeichert!' : 'Đã lưu vào bộ nhớ máy!');
      }
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  }, [player, lang]);

  // Update Game Stats & Auto-persist to DB
  const handleUpdateStats = (
    modeKey: keyof PlayerProfile['scores'],
    starsGained: number,
    coinsGained: number,
    scoreAchieved: number,
    caughtPokemonId?: string
  ) => {
    setPlayer((prev) => {
      const currentList = prev.capturedPokemon || [];
      const newCapturedList = caughtPokemonId && !currentList.includes(caughtPokemonId)
        ? [...currentList, caughtPokemonId]
        : currentList;

      const newScores = {
        ...prev.scores,
        [modeKey]: Math.max(prev.scores[modeKey] || 0, scoreAchieved),
      };

      const updatedPlayer: PlayerProfile = {
        ...prev,
        stars: prev.stars + starsGained,
        euroCoins: prev.euroCoins + coinsGained,
        capturedPokemon: newCapturedList,
        scores: newScores,
        totalProblemsSolved: prev.totalProblemsSolved + 1,
      };

      // Automatically sync this game score to SQLite/Turso backend in background
      savePlayerToDb(updatedPlayer, {
        gameKey: modeKey,
        score: scoreAchieved,
        starsEarned: starsGained,
        coinsEarned: coinsGained,
      }).then((res) => {
        if (res.gameScores) {
          setGameScores(res.gameScores);
        }
      }).catch(() => {});

      return updatedPlayer;
    });
  };

  // Switch or load player by name (Senior Engineer requirement: enter name to load old or create new)
  const handleSwitchPlayer = async (name: string, isExisting: boolean) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    setIsSaving(true);
    try {
      const res = await loadPlayerFromDb(cleanName);
      if (res.exists && res.player) {
        setPlayer(res.player);
        if (res.gameScores) setGameScores(res.gameScores);
        const msg = lang === 'de'
          ? `Willkommen zurück, ${res.player.name}! Alter Spielstand geladen.`
          : `Chào mừng ${res.player.name} trở lại! Đã tải dữ liệu thành tích cũ.`;
        triggerSaveToast(msg);
      } else {
        // Create fresh new profile
        const newProfile: PlayerProfile = {
          name: cleanName,
          avatar: 'fuchs',
          stars: 0,
          euroCoins: 0,
          currentStreak: 0,
          highestStreak: 0,
          unlockedHats: ['standard'],
          equippedHat: 'standard',
          capturedPokemon: [],
          scores: {
            minecraft: 0,
            number_line: 0,
            einmaleins: 0,
            euro_shop: 0,
            tower_math: 0,
            pokemon: 0,
          },
          totalProblemsSolved: 0,
        };
        setPlayer(newProfile);
        setGameScores({});
        await savePlayerToDb(newProfile);
        const msg = lang === 'de'
          ? `Neuer Held ${cleanName} erstellt! Viel Erfolg!`
          : `Tạo tài khoản mới cho ${cleanName}! Chúc bạn chơi vui vẻ!`;
        triggerSaveToast(msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Inline name change on Title Screen
  const handleUpdateName = async (newName: string) => {
    const clean = newName.trim();
    if (!clean || clean === player.name) return;

    // Check if player exists in DB
    const res = await loadPlayerFromDb(clean);
    if (res.exists && res.player) {
      setPlayer(res.player);
      if (res.gameScores) setGameScores(res.gameScores);
      const msg = lang === 'de'
        ? `Spielstand für ${res.player.name} geladen!`
        : `Đã tìm thấy và tải dữ liệu cũ của ${res.player.name}!`;
      triggerSaveToast(msg);
    } else {
      // Rename current or create new
      const updated = { ...player, name: clean };
      setPlayer(updated);
      savePlayerToDb(updated).catch(() => {});
      const msg = lang === 'de'
        ? `Name zu ${clean} geändert & gespeichert!`
        : `Đã đổi tên sang ${clean} và lưu lại!`;
      triggerSaveToast(msg);
    }
  };

  // Avatar select on Title Screen
  const handleSelectAvatar = (avatar: CharacterAvatar) => {
    setPlayer((prev) => {
      const updated = { ...prev, avatar };
      savePlayerToDb(updated).catch(() => {});
      return updated;
    });
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] overflow-x-hidden bg-slate-950 font-['Nunito',sans-serif] flex flex-col">
      {screen === 'title' && (
        <TitleScreen
          lang={lang}
          onSetLang={setLang}
          player={player}
          onSelectAvatar={handleSelectAvatar}
          onUpdateName={handleUpdateName}
          onStart={() => setScreen('world_map')}
          onOpenCertificate={() => setScreen('certificate')}
          onOpenSwitchModal={() => setShowSwitchModal(true)}
          onOpenScoresModal={() => setShowScoresModal(true)}
          onSaveProgress={() => handleSaveProgress()}
          isSaving={isSaving}
          saveMessage={saveMessage}
          engineInfo={engineInfo}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'world_map' && (
        <WorldSelect
          lang={lang}
          onSetLang={setLang}
          player={player}
          onSelectWorld={(world) => setScreen(world)}
          onBackToTitle={() => setScreen('title')}
          onSaveProgress={() => handleSaveProgress()}
          isSaving={isSaving}
          saveMessage={saveMessage}
          onOpenScoresModal={() => setShowScoresModal(true)}
          onOpenSwitchModal={() => setShowSwitchModal(true)}
          engineInfo={engineInfo}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'minecraft' && (
        <MinecraftMathWorld
          lang={lang}
          player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('minecraft', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'number_line' && (
        <NumberLineGlider
          lang={lang}
          player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('number_line', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'einmaleins' && (
        <EinmaleinsArena
          lang={lang}
          player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('einmaleins', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'euro_shop' && (
        <EuroShop
          lang={lang}
          player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('euro_shop', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'tower_math' && (
        <TowerMath
          lang={lang}
          player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('tower_math', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'pokemon' && (
        <PokemonArena
          lang={lang}
          player={player}
          onUpdateStats={(stars, coins, score, caughtId) =>
            handleUpdateStats('pokemon', stars, coins, score, caughtId)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'certificate' && (
        <CertificateModal
          lang={lang}
          player={player}
          onUpdateName={handleUpdateName}
          onBack={() => setScreen('world_map')}
        />
      )}

      {/* Switch Player / Load Old Profile Modal */}
      {showSwitchModal && (
        <PlayerSwitchModal
          lang={lang}
          currentName={player.name}
          onSelectPlayer={handleSwitchPlayer}
          onClose={() => setShowSwitchModal(false)}
        />
      )}

      {/* Per-Game Scores & Highscores Breakdown Modal */}
      {showScoresModal && (
        <GameScoresModal
          lang={lang}
          player={player}
          gameScores={gameScores}
          engineInfo={engineInfo}
          onSave={() => handleSaveProgress()}
          isSaving={isSaving}
          onClose={() => setShowScoresModal(false)}
        />
      )}
    </div>
  );
}
