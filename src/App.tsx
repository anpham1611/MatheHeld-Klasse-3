import React, { useState, useEffect } from 'react';
import { GameScreen, Language, CharacterAvatar, PlayerProfile } from './types/game';
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
  const [lang, setLang] = useState<Language>('de');
  const [isMuted, setIsMuted] = useState(false);

  // Player Profile from localStorage
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  // Save profile to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch {
      // storage unavailable
    }
  }, [player]);

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

      return {
        ...prev,
        stars: prev.stars + starsGained,
        euroCoins: prev.euroCoins + coinsGained,
        capturedPokemon: newCapturedList,
        scores: {
          ...prev.scores,
          [modeKey]: Math.max(prev.scores[modeKey] || 0, scoreAchieved),
        },
        totalProblemsSolved: prev.totalProblemsSolved + 1,
      };
    });
  };

  const handleUpdateName = (newName: string) => {
    setPlayer((prev) => ({ ...prev, name: newName }));
  };

  const handleSelectAvatar = (avatar: CharacterAvatar) => {
    setPlayer((prev) => ({ ...prev, avatar }));
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
          onStart={() => setScreen('world_map')}
          onOpenCertificate={() => setScreen('certificate')}
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
    </div>
  );
}
