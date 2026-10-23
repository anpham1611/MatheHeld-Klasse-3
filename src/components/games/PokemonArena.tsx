import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Pause, BookOpen, Sparkles, RefreshCw, HelpCircle, PenTool, CheckCircle2 } from 'lucide-react';
import { Language, PlayerProfile } from '../../types/game';
import { t } from '../../math/translations';
import { sound } from '../../audio/soundManager';
import {
  POKEMON_ROSTER,
  Pokemon,
  generatePokemonBattleTask,
  PokemonMathBattleTask,
} from '../../math/pokemonData';
import { PauseModal } from '../PauseModal';
import { Scratchpad } from '../Scratchpad';

interface PokemonArenaProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number, caughtPokemonId?: string) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PokemonArena: React.FC<PokemonArenaProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  // Current Wild Pokemon
  const [wildPokemon, setWildPokemon] = useState<Pokemon>(() => {
    return POKEMON_ROSTER[Math.floor(Math.random() * POKEMON_ROSTER.length)];
  });
  const [wildHp, setWildHp] = useState<number>(wildPokemon.maxHp);
  const [playerHp, setPlayerHp] = useState<number>(100);

  // Battle Phase
  // 'menu': choosing action (Attack, Ball, Run, Pokedex)
  // 'math': solving math problem for Attack or Catch
  // 'wobbling': Pokéball thrown and shaking 1, 2, 3
  // 'caught': Celebration screen
  const [battlePhase, setBattlePhase] = useState<'menu' | 'math' | 'wobbling' | 'caught'>('menu');
  const [currentTask, setCurrentTask] = useState<PokemonMathBattleTask | null>(null);
  const [wobbleCount, setWobbleCount] = useState<number>(0);

  // Logs & Animations
  const [battleLog, setBattleLog] = useState<string>(
    lang === 'de'
      ? `Ein wildes ${wildPokemon.nameDe} (Lv. 3) erscheint im hohen Gras!`
      : `Một chú ${wildPokemon.nameVi} hoang dã xuất hiện trong bụi cỏ!`
  );
  const [isHitWild, setIsHitWild] = useState<boolean>(false);
  const [isAttackingPlayer, setIsAttackingPlayer] = useState<boolean>(false);

  // Modals & Tools
  const [isPaused, setIsPaused] = useState(false);
  const [showPokedex, setShowPokedex] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Local state of caught pokemon list
  const [capturedList, setCapturedList] = useState<string[]>(
    player.capturedPokemon || ['pikachu']
  );
  const [score, setScore] = useState<number>(player.scores.pokemon || 0);

  // Keyboard shortcut listener for math options 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (battlePhase === 'math' && currentTask) {
        if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
          const index = parseInt(e.code.replace('Digit', '')) - 1;
          if (currentTask.options[index] !== undefined) {
            handleAnswerMath(currentTask.options[index]);
          }
        }
      } else if (e.code === 'Escape') {
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [battlePhase, currentTask, isPaused]);

  // Start Attack Action
  const handleStartAttack = () => {
    sound.playJump();
    const task = generatePokemonBattleTask('attack');
    setCurrentTask(task);
    setBattlePhase('math');
    setShowHint(false);
    setBattleLog(
      lang === 'de'
        ? `Löse die Mathe-Aufgabe für eine mächtige Attacke!`
        : `Giải đúng phép toán để tung đòn tấn công uy lực!`
    );
  };

  // Start Catch Action (Pokéball)
  const handleStartCatch = () => {
    sound.playPokeballThrow();
    const task = generatePokemonBattleTask('catch');
    setCurrentTask(task);
    setBattlePhase('math');
    setShowHint(false);
    setBattleLog(
      lang === 'de'
        ? `Rechen-Fang-Aufgabe: Berechne das Ergebnis, um den Pokéball perfekt zu werfen!`
        : `Phép toán thu phục: Tính đúng để ném trúng bóng Pokéball!`
    );
  };

  // Encounter New Wild Pokemon (Run / Suche)
  const handleNewEncounter = () => {
    sound.playJump();
    const randomMon = POKEMON_ROSTER[Math.floor(Math.random() * POKEMON_ROSTER.length)];
    setWildPokemon(randomMon);
    setWildHp(randomMon.maxHp);
    setBattlePhase('menu');
    setCurrentTask(null);
    setBattleLog(
      lang === 'de'
        ? `Rascheln im hohen Gras... Ein wildes ${randomMon.nameDe} erscheint!`
        : `Lá cỏ xào xạc... Một chú ${randomMon.nameVi} xuất hiện!`
    );
  };

  // Handle Math Answer
  const handleAnswerMath = (selectedAnswer: number) => {
    if (!currentTask) return;

    if (selectedAnswer === currentTask.answer) {
      sound.playCorrect();

      if (currentTask.actionType === 'attack') {
        // Player attacks wild Pokemon
        setIsAttackingPlayer(true);
        setIsHitWild(true);
        setTimeout(() => {
          setIsAttackingPlayer(false);
          setIsHitWild(false);
        }, 500);

        const damage = Math.floor(Math.random() * 20) + 25;
        const remainingHp = Math.max(0, wildHp - damage);
        setWildHp(remainingHp);

        setScore((s) => s + 80);

        if (remainingHp <= 0) {
          sound.playFanfare();
          setBattleLog(
            lang === 'de'
              ? `Volltreffer! Das wilde ${wildPokemon.nameDe} wurde besiegt (+80 Punkte)!`
              : `Chí mạng! ${wildPokemon.nameVi} đã bị đánh bại (+80 điểm)!`
          );
          setBattlePhase('menu');
          onUpdateStats(1, 10, score + 80);
        } else {
          setBattleLog(
            lang === 'de'
              ? `Klasse gerechnet! Du landest einen Volltreffer mit ${damage} KP Schaden!`
              : `Bé tính chuẩn lắm! Đòn đánh gây ${damage} sát thương!`
          );
          setBattlePhase('menu');
        }
      } else {
        // Catch Attempt (Pokéball Throw)
        setBattlePhase('wobbling');
        setBattleLog(
          lang === 'de'
            ? `Perfekter Wurf! Der Pokéball wackelt...`
            : `Cú ném hoàn hảo! Bóng Pokéball đang rung lắc...`
        );

        // Shake sequence: 1... 2... 3... Catch!
        let shake = 1;
        setWobbleCount(1);
        sound.playPokeballWobble();

        const shakeInterval = setInterval(() => {
          shake++;
          setWobbleCount(shake);
          if (shake <= 3) {
            sound.playPokeballWobble();
          } else {
            clearInterval(shakeInterval);
            // Catch succeeded!
            sound.playPokeballCaught();
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.55 },
              colors: ['#ef4444', '#ffffff', '#fbbf24', '#3b82f6'],
            });

            // Update captured list
            if (!capturedList.includes(wildPokemon.id)) {
              const newList = [...capturedList, wildPokemon.id];
              setCapturedList(newList);
              onUpdateStats(3, 25, score + 200, wildPokemon.id);
            } else {
              onUpdateStats(1, 15, score + 120);
            }

            setScore((s) => s + 200);
            setBattlePhase('caught');
            setBattleLog(
              lang === 'de'
                ? `Klick! Hurra! Du hast ${wildPokemon.nameDe} gefangen und in den Pokédex eingetragen!`
                : `Tách! Tuyệt vời! Bé đã thu phục thành công ${wildPokemon.nameVi} vào Pokédex!`
            );
          }
        }, 850);
      }
    } else {
      sound.playWrong();
      setBattleLog(
        lang === 'de'
          ? `Daneben gerechnet! Das Ergebnis war leider nicht richtig (${selectedAnswer}).`
          : `Tính nhầm rồi bé ơi! Kết quả (${selectedAnswer}) chưa chính xác.`
      );
      setBattlePhase('menu');
    }
  };

  const hpPercentage = Math.round((wildHp / wildPokemon.maxHp) * 100);
  const hpColor =
    hpPercentage > 50 ? 'bg-emerald-500' : hpPercentage > 20 ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <div className="relative w-full min-h-[100dvh] h-[100dvh] overflow-hidden flex flex-col bg-slate-950 select-none">
      {/* Top Header Cluster */}
      <header className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20 shrink-0 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              sound.playJump();
              onBack();
            }}
            className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => setIsPaused(true)}
            className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer transition"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold border border-indigo-400 cursor-pointer transition"
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t(lang, 'scratchpad')}</span>
          </button>
        </div>

        {/* Title & Pokédex Counter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playJump();
              setShowPokedex(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl border-2 border-red-400 shadow-md cursor-pointer transition font-bold text-xs"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Pokédex ({capturedList.length}/{POKEMON_ROSTER.length})</span>
          </button>

          {/* Score Readout */}
          <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-xl text-right">
            <div className="text-[9px] text-slate-400 uppercase font-bold">{t(lang, 'score')}</div>
            <div className="text-sm sm:text-base font-black text-amber-400 tabular-nums font-['Fredoka']">
              {score}
            </div>
          </div>
        </div>
      </header>

      {/* Main Battle Stadium / Field - Fully scrollable on mobile */}
      <div className="flex-1 relative flex flex-col justify-start md:justify-between p-3 sm:p-6 pb-28 bg-gradient-to-b from-sky-950 via-emerald-950/40 to-slate-950 overflow-y-auto overscroll-contain gap-4">
        {/* Background Visual: Tall Grass & Battle Circles */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full border-8 border-dashed border-emerald-400/40" />
        </div>

        {/* TOP RIGHT: Wild Pokemon Cluster */}
        <div className="relative z-10 self-end w-full max-w-sm flex flex-col items-end">
          {/* Wild Status Box */}
          <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-3 shadow-xl w-full mb-3 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base font-['Fredoka']">
                  {lang === 'de' ? wildPokemon.nameDe : wildPokemon.nameVi}
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  Lv. 3
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${wildPokemon.badgeBg}`}>
                {wildPokemon.typeIcon} {lang === 'de' ? wildPokemon.typeDe : wildPokemon.typeVi}
              </span>
            </div>

            {/* HP Bar */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-400">KP</span>
              <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${hpColor}`}
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-300 tabular-nums">
                {wildHp}/{wildPokemon.maxHp}
              </span>
            </div>
          </div>

          {/* Wild Pokemon Sprite Stage */}
          <div className="relative pr-6">
            <div className="w-36 h-10 bg-emerald-900/40 rounded-full blur-sm absolute bottom-0 left-2" />
            <div
              className={`text-8xl select-none transition-transform duration-300 ${
                isHitWild ? 'scale-75 translate-x-4 opacity-70 animate-shake' : 'hover:scale-105'
              }`}
            >
              {wildPokemon.sprite}
            </div>

            {/* Pokéball in Flight or Wobbling */}
            {battlePhase === 'wobbling' && (
              <div className="absolute top-4 left-6 flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-full border-4 border-slate-900 shadow-2xl flex items-center justify-center text-2xl relative overflow-hidden transition-transform duration-300 ${
                    wobbleCount % 2 === 1 ? '-rotate-24' : 'rotate-24'
                  }`}
                  style={{
                    background: 'linear-gradient(to bottom, #ef4444 50%, #ffffff 50%)',
                  }}
                >
                  <div className="w-5 h-5 bg-white border-3 border-slate-900 rounded-full" />
                </div>
                <div className="mt-1 text-xs font-black text-amber-300 animate-pulse bg-slate-900/80 px-2 py-0.5 rounded-md">
                  Wackel {wobbleCount}...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM LEFT: Player's Companion Sprite & Status */}
        <div className="relative z-10 self-start w-full max-w-sm flex flex-col items-start">
          <div className="relative pl-6 mb-2">
            <div className="w-36 h-10 bg-indigo-900/40 rounded-full blur-sm absolute bottom-0 left-2" />
            <div
              className={`text-8xl select-none transition-transform duration-300 ${
                isAttackingPlayer ? 'translate-x-12 scale-110' : ''
              }`}
            >
              ⚡🐭
            </div>
          </div>

          {/* Player Companion Status Box */}
          <div className="bg-slate-900/90 border-2 border-indigo-500/60 rounded-2xl p-3 shadow-xl w-full backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base font-['Fredoka']">
                  Pikachu (Partner)
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  Lv. 3
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-amber-950">
                ⚡ Elektro
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-400">KP</span>
              <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div className="h-full bg-emerald-500 w-full" />
              </div>
              <span className="text-xs font-bold text-slate-300 tabular-nums">100/100</span>
            </div>
          </div>
        </div>

        {/* BATTLE DIALOGUE & ACTION CONTROL CONSOLE */}
        <div className="relative z-20 w-full max-w-3xl mx-auto bg-slate-900/95 border-3 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-2xl">
          {/* Battle Dialogue Text Line */}
          <div className="min-h-12 bg-slate-950/80 rounded-2xl px-4 py-2.5 border border-slate-800 flex items-center justify-between mb-3">
            <p className="text-sm sm:text-base font-bold text-amber-300 tracking-wide font-['Fredoka']">
              {battleLog}
            </p>
          </div>

          {/* PHASE 1: Main Battle Menu (Angriff, Pokéball, Suche, Pokédex) */}
          {battlePhase === 'menu' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={handleStartAttack}
                className="py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 transition font-['Fredoka']"
              >
                <span>⚔️</span>
                <span>{lang === 'de' ? 'Angriff' : 'Tấn công'}</span>
              </button>

              <button
                onClick={handleStartCatch}
                className="py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 transition font-['Fredoka']"
              >
                <span>🔴</span>
                <span>{lang === 'de' ? 'Pokéball' : 'Ném bóng'}</span>
              </button>

              <button
                onClick={handleNewEncounter}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 transition font-['Fredoka']"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'de' ? 'Neues Pokémon' : 'Đổi Pokemon'}</span>
              </button>

              <button
                onClick={() => setShowPokedex(true)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 transition font-['Fredoka']"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Pokédex</span>
              </button>
            </div>
          )}

          {/* PHASE 2: Math Question Card (Attack or Catch) */}
          {battlePhase === 'math' && currentTask && (
            <div className="flex flex-col items-center">
              <div className="w-full bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {currentTask.actionType === 'attack' ? '⚡' : '🔴'}
                  </span>
                  <span className="text-sm font-black text-white font-['Fredoka']">
                    {lang === 'de' ? currentTask.mathPromptDe : currentTask.mathPromptVi}
                  </span>
                </div>

                <div className="text-2xl font-black text-amber-300 font-['Fredoka'] px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  {lang === 'de' ? currentTask.questionStrDe : currentTask.questionStrVi}
                </div>
              </div>

              {/* 4 Math Answer Options (with keyboard shortcuts 1, 2, 3, 4) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                {currentTask.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerMath(opt)}
                    className="py-3 px-4 bg-slate-800 hover:bg-indigo-600 text-white border-2 border-slate-700 hover:border-indigo-400 rounded-2xl font-black text-xl font-['Fredoka'] flex items-center justify-between cursor-pointer transform active:scale-95 transition shadow-lg"
                  >
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                    <Sparkles className="w-4 h-4 text-amber-400 opacity-50" />
                  </button>
                ))}
              </div>

              {/* Hint button */}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-indigo-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'de' ? 'Rechen-Tipp' : 'Gợi ý giải'}</span>
                </button>
              </div>

              {showHint && (
                <div className="mt-1 text-xs text-amber-300 font-medium">
                  💡 {lang === 'de' ? currentTask.hintDe : currentTask.hintVi}
                </div>
              )}
            </div>
          )}

          {/* PHASE 3: Caught Screen Celebration */}
          {battlePhase === 'caught' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-lg">
                  {wildPokemon.sprite}
                </div>
                <div>
                  <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    🎉 {lang === 'de' ? 'Erfolgreich Gefangen!' : 'Thu phục thành công!'}
                  </div>
                  <div className="text-xl font-black text-white font-['Fredoka']">
                    {lang === 'de' ? wildPokemon.nameDe : wildPokemon.nameVi}
                  </div>
                  <div className="text-xs text-slate-400">
                    {lang === 'de' ? wildPokemon.habitatDe : wildPokemon.habitatVi}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPokedex(true)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Im Pokédex ansehen
                </button>

                <button
                  onClick={handleNewEncounter}
                  className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm rounded-xl shadow-lg cursor-pointer transform active:scale-95 transition"
                >
                  Weiteres suchen ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POKÉDEX MODAL */}
      {showPokedex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border-4 border-red-500 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white text-xs font-black">
                  🔴
                </div>
                <h3 className="text-2xl font-black text-white font-['Fredoka']">
                  Offizieller Pokédex ({capturedList.length}/{POKEMON_ROSTER.length})
                </h3>
              </div>

              <button
                onClick={() => setShowPokedex(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Grid of Pokemon */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
              {POKEMON_ROSTER.map((mon) => {
                const isCaught = capturedList.includes(mon.id);
                return (
                  <div
                    key={mon.id}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition ${
                      isCaught
                        ? 'bg-slate-800/90 border-amber-400/80 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="text-4xl mb-1">{isCaught ? mon.sprite : '❓'}</div>
                    <div className="font-black text-sm text-white font-['Fredoka']">
                      {isCaught ? (lang === 'de' ? mon.nameDe : mon.nameVi) : '???'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      No. {mon.pokedexNo} · {lang === 'de' ? mon.typeDe : mon.typeVi}
                    </div>
                    {isCaught && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Gefangen</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Scratchpad Window */}
      {showScratchpad && (
        <Scratchpad lang={lang} onClose={() => setShowScratchpad(false)} />
      )}

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          lang={lang}
          onResume={() => setIsPaused(false)}
          onRestart={handleNewEncounter}
          onQuit={onBack}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      )}
    </div>
  );
};
