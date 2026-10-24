import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Language, PlayerProfile } from '../../types/game';
import { sound } from '../../audio/soundManager';
import { generateLogicRound, LOGIC_GROUPS, LOGIC_TIERS, type LogicPuzzle } from '../../math/logicPuzzles';

interface LogicAdventureProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const LogicAdventure: React.FC<LogicAdventureProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [puzzles, setPuzzles] = useState<LogicPuzzle[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'tryAgain' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [complete, setComplete] = useState(false);
  const [startingTotal, setStartingTotal] = useState(player.scores.logic_game || 0);
  const advanceTimer = useRef<number | null>(null);
  const puzzle = puzzles[round];

  useEffect(() => () => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
  }, []);

  const startTier = (tier: number) => {
    setStartingTotal(player.scores.logic_game || 0);
    setSelectedTier(tier);
    setPuzzles(generateLogicRound(lang, tier));
    setRound(0);
    setScore(0);
    setAnswered(false);
    setFeedback(null);
    setComplete(false);
  };

  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);

  const choose = (choice: (typeof puzzles)[number]['choices'][number], index: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedChoiceIndex(index);

    if (!choice.correct) {
      sound.playWrong();
      setFeedback('wrong');
      const nextScore = Math.max(0, score - 1);
      setScore(nextScore);

      advanceTimer.current = window.setTimeout(() => {
        if (round === puzzles.length - 1) {
          setComplete(true);
          sound.playFanfare();
          onUpdateStats(1, 5, nextScore);
        } else {
          setRound((current) => current + 1);
          setAnswered(false);
          setFeedback(null);
          setSelectedChoiceIndex(null);
        }
      }, 700);
      return;
    }

    sound.playCorrect();
    setFeedback('correct');
    const nextScore = score + 1;
    setScore(nextScore);
    advanceTimer.current = window.setTimeout(() => {
      if (round === puzzles.length - 1) {
        setComplete(true);
        sound.playFanfare();
        onUpdateStats(3, 15, nextScore);
      } else {
        setRound((current) => current + 1);
        setAnswered(false);
        setFeedback(null);
        setSelectedChoiceIndex(null);
      }
    }, 650);
  };

  const restart = () => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    startTier(selectedTier ?? 1);
  };

  const chooseAnotherTier = () => {
    setSelectedTier(null);
    setPuzzles([]);
    setComplete(false);
    setFeedback(null);
  };

  const text = (de: string, vi: string) => lang === 'de' ? de : vi;

  return (
    <main className="min-h-[100dvh] h-[100dvh] overflow-y-auto bg-gradient-to-b from-sky-100 via-violet-50 to-amber-100 text-slate-800 font-['Nunito',sans-serif] px-3 py-3 sm:px-6 sm:py-5">
      <header className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="rounded-2xl bg-white/90 border-2 border-sky-200 p-3 shadow-sm hover:bg-white active:scale-95"
          aria-label={text('Zurück zur Karte', 'Về bản đồ')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs sm:text-sm font-extrabold text-violet-600">
            {player.name} · {text('Gesamtpunkte', 'Tổng điểm')}: {player.scores.logic_game || 0}
          </p>
          <h1 className="text-xl sm:text-3xl font-black text-indigo-950 font-['Fredoka']">
            {text('Kleine Denker', 'Bé thông minh')} 🧩
          </h1>
        </div>
        <button
          onClick={onToggleMute}
          className="rounded-2xl bg-white/90 border-2 border-sky-200 p-3 shadow-sm hover:bg-white active:scale-95"
          aria-label={isMuted ? text('Ton einschalten', 'Bật âm thanh') : text('Ton ausschalten', 'Tắt âm thanh')}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {complete ? (
        <section className="max-w-xl mx-auto mt-10 sm:mt-16 rounded-[2rem] border-4 border-amber-300 bg-white p-6 sm:p-10 text-center shadow-xl">
          <div className="text-7xl mb-3" aria-hidden="true">🏆</div>
          <h2 className="text-3xl sm:text-4xl font-black text-indigo-950 font-['Fredoka']">
            {text('Alle Rätsel geschafft!', 'Bé đã giải hết câu đố!')}
          </h2>
          <p className="mt-3 text-lg font-bold text-slate-600">
            {text('Du hast 20 Rätsel gelöst. Toll gemacht!', 'Bé đã giải 20 câu đố. Giỏi lắm!')}
          </p>
          <div className="my-6 text-4xl" aria-label={text('Drei Sterne', 'Ba ngôi sao')}>⭐ ⭐ ⭐</div>
          <p className="text-lg font-bold text-slate-600">{text('Punkte in dieser Runde', 'Điểm vòng này')}: {score}</p>
          <p className="my-3 mb-6 text-xl font-black text-violet-700">{text('Gesamtpunkte', 'Tổng điểm')}: {startingTotal + score}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={restart}
              className="rounded-2xl bg-violet-600 px-4 py-4 text-lg font-black text-white shadow-lg hover:bg-violet-500 active:scale-95"
            >{text('Nochmal spielen', 'Chơi lại')}</button>
            <button
              onClick={chooseAnotherTier}
              className="rounded-2xl bg-sky-500 px-4 py-4 text-lg font-black text-white shadow-lg hover:bg-sky-400 active:scale-95"
            >{text('Stufe wechseln', 'Đổi cấp độ')}</button>
            <button
              onClick={onBack}
              className="rounded-2xl bg-amber-400 px-4 py-4 text-lg font-black text-amber-950 shadow-lg hover:bg-amber-300 active:scale-95"
            >{text('Zur Karte', 'Về bản đồ')}</button>
          </div>
        </section>
      ) : selectedTier === null ? (
        <section className="max-w-3xl mx-auto mt-8 rounded-[2rem] border-4 border-white bg-white/90 p-5 sm:p-8 shadow-xl">
          <h2 className="text-center text-2xl sm:text-3xl font-black text-indigo-950 font-['Fredoka']">
            {text('Wähle eine Rätselstufe', 'Chọn cấp độ câu đố')}
          </h2>
          <p className="mt-2 mb-5 text-center font-bold text-slate-600">
            {text('Jede Stufe enthält 20 verschiedene Themen.', 'Mỗi cấp có 20 chủ đề khác nhau.')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {LOGIC_TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => startTier(tier.id)}
                className="rounded-2xl border-4 border-violet-100 bg-gradient-to-br from-sky-50 to-pink-100 p-4 text-left shadow-sm transition hover:border-violet-300 hover:-translate-y-1"
              >
                <span className="block text-sm font-black uppercase tracking-wide text-violet-600">
                  {text('Stufe', 'Cấp')} {tier.id}
                </span>
                <span className="block text-xl font-black text-indigo-950">
                  {text(tier.de, tier.vi)}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-5xl mx-auto mt-4 sm:mt-6">
          <div className="mb-4 rounded-2xl bg-white/80 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-black text-indigo-900">
                {LOGIC_GROUPS[puzzle.group].emoji} {text(LOGIC_GROUPS[puzzle.group].de, LOGIC_GROUPS[puzzle.group].vi)} · {puzzle.topicName}
              </span>
              <span className="font-black text-violet-700 tabular-nums">
                {round + 1} / {puzzles.length}
              </span>
            </div>
            <div
              className="h-3 rounded-full bg-violet-100 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={puzzles.length}
              aria-valuenow={round + 1}
            >
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all duration-300" style={{ width: `${((round + 1) / puzzles.length) * 100}%` }} />
            </div>
          </div>

          <div className="rounded-[2rem] border-4 border-white bg-white/90 p-4 sm:p-7 shadow-xl">
            <h2 className="text-center text-xl sm:text-3xl font-black text-indigo-950 font-['Fredoka']">
              {puzzle.prompt}
            </h2>
            <div className={`my-4 sm:my-6 min-h-24 flex items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-pink-100 px-3 py-4 font-black text-center whitespace-pre-line break-words ${puzzle.visual.length > 24 ? 'text-xl sm:text-3xl' : 'text-5xl sm:text-7xl'}`}>
              <span aria-label={puzzle.visual}>{puzzle.visual}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {puzzle.choices.map((choice, index) => {
                const isSelectedWrong = answered && selectedChoiceIndex === index && !choice.correct;
                const isCorrect = answered && choice.correct;
                return (
                  <button
                    key={`${round}-${index}`}
                    onClick={() => choose(choice, index)}
                    disabled={answered}
                    className={`min-h-28 sm:min-h-36 rounded-3xl border-4 p-3 flex flex-col items-center justify-center gap-2 text-indigo-950 shadow-md transition active:scale-95 disabled:cursor-default ${
                      isCorrect
                        ? 'border-emerald-400 bg-emerald-100 scale-[1.03]'
                        : isSelectedWrong
                        ? 'border-rose-500 bg-rose-100 scale-[0.98]'
                        : 'border-white bg-gradient-to-br from-amber-50 to-pink-100 hover:border-violet-300 hover:-translate-y-1'
                    }`}
                    aria-label={choice.label || choice.art || text('Bären der Größe nach', 'Gấu xếp theo kích thước')}
                  >
                    {choice.sizes ? (
                      <span className="flex items-center justify-center gap-0.5 h-16">
                        {choice.sizes.map((size, sizeIndex) => (
                          <span key={sizeIndex} style={{ fontSize: size }} aria-hidden="true">🐻</span>
                        ))}
                      </span>
                    ) : (
                      <span
                        className={`max-w-full break-words font-black ${choice.art.length > 8 ? 'text-base sm:text-xl' : 'text-4xl sm:text-5xl'} ${choice.art.includes('━') ? 'text-amber-700' : ''}`}
                        style={{ filter: choice.silhouette ? 'brightness(0)' : undefined }}
                        aria-hidden="true"
                      >{choice.art}</span>
                    )}
                    {choice.label && <span className="text-sm font-bold">{choice.label}</span>}
                  </button>
                );
              })}
            </div>

            <p className="min-h-8 mt-4 text-center text-lg sm:text-xl font-black" aria-live="polite">
              {feedback === 'correct' && <span className="text-emerald-600 font-black">{text('Richtig (+1 Punkt)! 🌟', 'Đúng rồi (+1 điểm)! 🌟')}</span>}
              {feedback === 'wrong' && <span className="text-rose-600 font-black">{text('Falsch (-1 Punkt)! Nächste Frage... ❌', 'Chưa đúng (-1 điểm)! Qua câu tiếp theo... ❌')}</span>}
              {!feedback && <span className="text-slate-400">{text('Tippe auf das passende Bild!', 'Chạm vào hình đúng nhé!')}</span>}
            </p>
          </div>
        </section>
      )}
    </main>
  );
};
