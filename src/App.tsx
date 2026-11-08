import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { GameScreen, CharacterAvatar, PlayerProfile, GameScoreDetail } from './types/game';
import { sound } from './audio/soundManager';
import { TitleScreen } from './components/TitleScreen';
import { WorldSelect } from './components/WorldSelect';
import { NumberLineGlider } from './components/games/NumberLineGlider';
import { EinmaleinsArena } from './components/games/EinmaleinsArena';
import { EinmaleinsTest } from './components/games/EinmaleinsTest';
import { EuroShop } from './components/games/EuroShop';
import { TowerMath } from './components/games/TowerMath';
import { PokemonArena } from './components/games/PokemonArena';
import { MinecraftMathWorld } from './components/games/MinecraftMathWorld';
import { LogicAdventure } from './components/games/LogicAdventure';
import { MonsterParty } from './components/games/MonsterParty';
import { VehiclePuzzle } from './components/games/VehiclePuzzle';
import { SudokuGame } from './components/games/SudokuGame';
import { PreschoolCollection } from './components/PreschoolCollection';
import { MathBrickBuilder } from './components/games/MathBrickBuilder';
import { RoboForge } from './components/games/RoboForge';
import { CertificateModal } from './components/CertificateModal';
import { PlayerSwitchModal } from './components/PlayerSwitchModal';
import { GameScoresModal } from './components/GameScoresModal';
import { RenamePlayerModal } from './components/RenamePlayerModal';
import { NewPlayerModal } from './components/NewPlayerModal';
import {
  loadPlayerFromDb,
  savePlayerToDb,
  renamePlayerInDb,
  createPlayerInDb,
} from './services/playerService';
import { scoreAfterGame } from './math/gameScore';
import type { OnlineTransport } from './games/ticTacToe/network';

const MazeDiscovery = lazy(() => import('./components/games/MazeDiscovery').then((module) => ({ default: module.MazeDiscovery })));
const SuperIntellectTicTacToe = lazy(() => import('./components/games/SuperIntellectTicTacToe').then((module) => ({ default: module.SuperIntellectTicTacToe })));

const STORAGE_KEY = 'matheheld_klasse3_profile_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Leo der Fuchs',
  avatar: 'fuchs',
  stars: 0,
  euroCoins: 0,
  currentStreak: 0,
  highestStreak: 0,
  unlockedHats: ['standard'],
  equippedHat: 'standard',
  capturedPokemon: ['pikachu'],
  scores: {
    minecraft: 0,
    number_line: 0,
    einmaleins: 0,
    euro_shop: 0,
    tower_math: 0,
    pokemon: 0,
    logic_game: 0,
    monsterparty: 0,
    vehicle_puzzle: 0,
    sudoku: 0,
    mathbrick: 0,
    roboforge: 0,
    maze_discovery: 0,
  },
  totalProblemsSolved: 0,
};

export default function App({ ticTacToeTransport }: { ticTacToeTransport?: OnlineTransport } = {}) {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [isMuted, setIsMuted] = useState(false);

  const [gameScores, setGameScores] = useState<Record<string, GameScoreDetail>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modals
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false);
  const [isFirstTimeOnboarding, setIsFirstTimeOnboarding] = useState(() => {
    try {
      const hasOnboarded = localStorage.getItem('matheheld_onboarded_v1');
      const hasSaved = localStorage.getItem(STORAGE_KEY);
      return !hasOnboarded && !hasSaved;
    } catch {
      return false;
    }
  });

  // Player Profile initialized from localStorage or default
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch {}
    return DEFAULT_PROFILE;
  });

  // Sync player profile on boot
  useEffect(() => {
    // Try loading current player from the server
    const currentName = player.name || 'Leo der Fuchs';
    loadPlayerFromDb(currentName).then((res) => {
      const loadedPlayer = res.player;
      if (res.exists && loadedPlayer) {
        setPlayer(loadedPlayer);
        if (res.gameScores) setGameScores(res.gameScores);
      } else {
        // Player doesn't exist yet in DB; save initial state
        savePlayerToDb(player).catch(() => {});
      }
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

  // Manual or automatic save progress
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
        const msg =  `Spielstand für ${player.name} gespeichert!`
          ;
        triggerSaveToast(msg);
      } else {
        triggerSaveToast( 'Lokal gespeichert!' );
      }
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  }, [player]);

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
        [modeKey]: scoreAfterGame(prev.scores, modeKey, scoreAchieved),
      };

      const updatedPlayer: PlayerProfile = {
        ...prev,
        stars: prev.stars + starsGained,
        euroCoins: prev.euroCoins + coinsGained,
        capturedPokemon: newCapturedList,
        scores: newScores,
        totalProblemsSolved: prev.totalProblemsSolved + 1,
      };

      // Automatically sync this game score in the background
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

  const handleCapturedPokemonChange = (capturedPokemon: string[]) => {
    setPlayer((prev) => {
      const updatedPlayer = { ...prev, capturedPokemon };
      savePlayerToDb(updatedPlayer).catch(() => {});
      return updatedPlayer;
    });
  };

  // Rename existing player safely (updates DB without cloning!)
  const handleRenamePlayer = async (newName: string) => {
    const clean = newName.trim();
    if (!clean || clean === player.name) return { success: true };

    try {
      const res = await renamePlayerInDb(player.name, clean);
      if (res.success && res.player) {
        setPlayer(res.player);
        if (res.gameScores) setGameScores(res.gameScores);
        const msg =  `Name zu "${res.player.name}" geändert & Spielstand gesichert!`
          ;
        triggerSaveToast(msg);
        return { success: true };
      }
      return {
        success: false,
        error: res.error || ( 'Dieser Name ist bereits vergeben!' ),
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Fehler beim Ändern des Namens.' };
    }
  };

  // Create brand new player with clean 0 stats
  const handleCreatePlayer = async (name: string, avatar: CharacterAvatar) => {
    const clean = name.trim();
    if (!clean) return { success: false, error: 'Bitte gib einen Namen ein.' };

    try {
      const res = await createPlayerInDb(clean, avatar);
      if (res.success && res.player) {
        setPlayer(res.player);
        setGameScores(res.gameScores || {});
        try {
          localStorage.setItem('matheheld_onboarded_v1', 'true');
        } catch {}
        setIsFirstTimeOnboarding(false);
        setShowNewPlayerModal(false);
        const msg =  `Neuer Held "${res.player.name}" erstellt! Willkommen im Spiel!`
          ;
        triggerSaveToast(msg);
        return { success: true };
      }
      return {
        success: false,
        error: res.error || ( 'Dieser Name ist bereits vergeben!' ),
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Fehler beim Erstellen des Spielers.' };
    }
  };

  // Switch or load player by name
  const handleSwitchPlayer = async (name: string, isExisting: boolean) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    setIsSaving(true);
    try {
      const res = await loadPlayerFromDb(cleanName);
      if (res.exists && res.player) {
        setPlayer(res.player);
        if (res.gameScores) setGameScores(res.gameScores);
        try {
          localStorage.setItem('matheheld_onboarded_v1', 'true');
        } catch {}
        setIsFirstTimeOnboarding(false);
        const msg =  `Willkommen zurück, ${res.player.name}! Alter Spielstand geladen.`
          ;
        triggerSaveToast(msg);
      } else {
        await handleCreatePlayer(cleanName, 'fuchs');
      }
    } finally {
      setIsSaving(false);
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
                    player={player}
          onSelectAvatar={handleSelectAvatar}
          onOpenRenameModal={() => setShowRenameModal(true)}
          onOpenNewPlayerModal={() => setShowNewPlayerModal(true)}
          onStart={() => setScreen('world_map')}
          onOpenCertificate={() => setScreen('certificate')}
          onOpenSwitchModal={() => setShowSwitchModal(true)}
          onOpenScoresModal={() => setShowScoresModal(true)}
          onSaveProgress={() => handleSaveProgress()}
          isSaving={isSaving}
          saveMessage={saveMessage}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'world_map' && (
        <WorldSelect
                    player={player}
          onSelectWorld={(world) => setScreen(world)}
          onBackToTitle={() => setScreen('title')}
          onSaveProgress={() => handleSaveProgress()}
          isSaving={isSaving}
          saveMessage={saveMessage}
          onOpenScoresModal={() => setShowScoresModal(true)}
          onOpenSwitchModal={() => setShowSwitchModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'minecraft' && (
        <MinecraftMathWorld
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
                    player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('einmaleins', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'einmaleins_test' && (
        <EinmaleinsTest onBack={() => setScreen('world_map')} />
      )}

      {screen === 'einmaleins_test_v2' && (
        <EinmaleinsTest mode="full-page" onBack={() => setScreen('world_map')} />
      )}

      {screen === 'euro_shop' && (
        <EuroShop
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
                    player={player}
          onUpdateStats={(stars, coins, score, caughtId) =>
            handleUpdateStats('pokemon', stars, coins, score, caughtId)
          }
          onCapturedPokemonChange={handleCapturedPokemonChange}
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'logic_game' && (
        <LogicAdventure
                    player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('logic_game', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'preschool_collection' && (
        <PreschoolCollection
          onBack={() => setScreen('world_map')}
          onSelectGame={(game) => setScreen(game)}
        />
      )}

      {screen === 'monsterparty' && (
        <MonsterParty
          player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('monsterparty', stars, coins, score)
          }
          onBack={() => setScreen('preschool_collection')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'vehicle_puzzle' && (
        <VehiclePuzzle
          player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('vehicle_puzzle', stars, coins, score)
          }
          onBack={() => setScreen('preschool_collection')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'sudoku' && (
        <SudokuGame
          player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('sudoku', stars, coins, score)
          }
          onBack={() => setScreen('preschool_collection')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'mathbrick' && (
        <MathBrickBuilder
                    player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('mathbrick', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'roboforge' && (
        <RoboForge
                    player={player}
          onUpdateStats={(stars, coins, score) =>
            handleUpdateStats('roboforge', stars, coins, score)
          }
          onBack={() => setScreen('world_map')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'maze_discovery' && (
        <Suspense fallback={<div className="grid min-h-[100dvh] place-items-center bg-sky-100 font-black text-sky-900">Labyrinth wird geladen …</div>}>
          <MazeDiscovery
                        player={player}
            onUpdateStats={(stars, coins, score) =>
              handleUpdateStats('maze_discovery', stars, coins, score)
            }
            onBack={() => setScreen('world_map')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </Suspense>
      )}

      {screen === 'super_intellect_tic_tac_toe' && (
        <Suspense fallback={<div className="grid min-h-[100dvh] place-items-center bg-sky-50 font-bold text-sky-800">Pfoten-Spiel wird geladen … 🐾</div>}>
          <SuperIntellectTicTacToe
            player={player}
            onBack={() => setScreen('world_map')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onlineTransport={ticTacToeTransport}
          />
        </Suspense>
      )}

      {screen === 'certificate' && (
        <CertificateModal
          player={player}
          onRenamePlayer={handleRenamePlayer}
          onBack={() => setScreen('world_map')}
        />
      )}

      {/* Switch Player / Load Old Profile Modal */}
      {showSwitchModal && (
        <PlayerSwitchModal
                    currentName={player.name}
          onSelectPlayer={handleSwitchPlayer}
          onOpenCreateNew={() => {
            setShowSwitchModal(false);
            setShowNewPlayerModal(true);
          }}
          onClose={() => setShowSwitchModal(false)}
        />
      )}

      {/* Per-Game Scores & Highscores Breakdown Modal */}
      {showScoresModal && (
        <GameScoresModal
          player={player}
          gameScores={gameScores}
          onSave={() => handleSaveProgress()}
          isSaving={isSaving}
          onClose={() => setShowScoresModal(false)}
        />
      )}

      {/* Safe Rename Nickname Modal */}
      {showRenameModal && (
        <RenamePlayerModal
                    currentName={player.name}
          onRename={handleRenamePlayer}
          onClose={() => setShowRenameModal(false)}
        />
      )}

      {/* Create New Hero & First-time Onboarding Modal */}
      {(showNewPlayerModal || isFirstTimeOnboarding) && (
        <NewPlayerModal
                    isOpen={showNewPlayerModal || isFirstTimeOnboarding}
          isFirstTime={isFirstTimeOnboarding}
          onCreatePlayer={handleCreatePlayer}
          onPickExisting={() => {
            setIsFirstTimeOnboarding(false);
            setShowNewPlayerModal(false);
            setShowSwitchModal(true);
          }}
          onClose={() => {
            setIsFirstTimeOnboarding(false);
            setShowNewPlayerModal(false);
          }}
        />
      )}
    </div>
  );
}
