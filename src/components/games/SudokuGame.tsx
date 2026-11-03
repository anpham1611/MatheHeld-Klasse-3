import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Clock3, Eraser, Sparkles, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { PlayerProfile } from '../../types/game';
import { sound } from '../../audio/soundManager';
import {
  generateSudokuPuzzle,
  isSudokuSolved,
  isValidSudokuMove,
  SUDOKU_LEVELS,
  SudokuDifficultyId,
  SudokuPuzzle,
} from '../../math/sudoku';

interface SudokuGameProps {
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

interface SelectedCell {
  row: number;
  column: number;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function boxLabel(size: number): string {
  return size === 4 ? '2×2-Block' : size === 6 ? '2×3-Block' : '3×3-Block';
}

export const SudokuGame: React.FC<SudokuGameProps> = ({
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const [game, setGame] = useState<SudokuPuzzle | null>(null);
  const [grid, setGrid] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackCell, setFeedbackCell] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [complete, setComplete] = useState(false);
  const timerRunning = Boolean(game) && !complete;

  useEffect(() => {
    if (!timerRunning) return;
    const timerId = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timerId);
  }, [timerRunning]);

  const startLevel = (levelId: SudokuDifficultyId) => {
    const nextGame = generateSudokuPuzzle(levelId);
    setGame(nextGame);
    setGrid(nextGame.puzzle.map((row) => [...row]));
    setSelectedCell(null);
    setFeedback(null);
    setFeedbackCell(null);
    setElapsedSeconds(0);
    setComplete(false);
  };

  const chooseLevel = () => {
    setGame(null);
    setGrid([]);
    setSelectedCell(null);
    setFeedback(null);
    setFeedbackCell(null);
    setComplete(false);
    setElapsedSeconds(0);
  };

  const placeNumber = (value: number) => {
    if (!game || !selectedCell || complete) return;
    const { row, column } = selectedCell;
    if (game.puzzle[row][column] !== 0) return;

    if (!isValidSudokuMove(grid, row, column, value, game.boxRows, game.boxCols)) {
      sound.playWrong();
      setFeedback('wrong');
      setFeedbackCell(`${row}-${column}`);
      return;
    }

    const nextGrid = grid.map((gridRow) => [...gridRow]);
    nextGrid[row][column] = value;
    setGrid(nextGrid);
    setFeedback('correct');
    setFeedbackCell(`${row}-${column}`);
    sound.playCorrect();

    if (isSudokuSolved(nextGrid, game.boxRows, game.boxCols)) {
      setComplete(true);
      sound.playFanfare();
      onUpdateStats(3, 10, game.size * game.size - game.clueCount);
    }
  };

  const clearSelectedCell = () => {
    if (!game || !selectedCell || game.puzzle[selectedCell.row][selectedCell.column] !== 0) return;
    setGrid((current) => {
      const nextGrid = current.map((row) => [...row]);
      nextGrid[selectedCell.row][selectedCell.column] = 0;
      return nextGrid;
    });
    setFeedback(null);
    setFeedbackCell(null);
  };

  const heading = game ? `Sudoku · ${game.name}` : 'Sudoku';

  return (
    <main className="h-[100dvh] min-h-[100dvh] overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top,#fff7df_0%,#f9e9c8_55%,#f1dcb8_100%)] px-3 py-3 text-slate-800 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3">
          <button
            onClick={game ? chooseLevel : onBack}
            aria-label={game ? 'Zur Schwierigkeitsauswahl' : 'Zurück zur Spielauswahl'}
            className="rounded-2xl border-2 border-amber-200 bg-white/90 p-3 shadow-sm transition hover:bg-white active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs font-extrabold text-amber-700 sm:text-sm">{player.name} · {player.scores.sudoku || 0} Punkte</p>
            <h1 className="font-['Fredoka'] text-2xl font-black text-indigo-950 sm:text-4xl">{heading}</h1>
            <p className="text-xs font-bold text-slate-600 sm:text-sm">Vorschulblock · Logisches Denken · ab 5 Jahre</p>
          </div>
          <button onClick={onToggleMute} aria-label={isMuted ? 'Ton einschalten' : 'Ton ausschalten'} className="rounded-2xl border-2 border-amber-200 bg-white/90 p-3 shadow-sm transition hover:bg-white active:scale-95">
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </header>

        {!game ? (
          <section className="mx-auto mt-6 max-w-4xl rounded-[2rem] border-[5px] border-white bg-[#fffdf6] p-4 shadow-[0_16px_50px_rgba(114,76,27,.18)] sm:mt-8 sm:p-7">
            <div className="mb-5 text-center">
              <div className="mb-1 text-5xl" aria-hidden="true">🔢🧩</div>
              <h2 className="font-['Fredoka'] text-2xl font-black text-indigo-950 sm:text-3xl">Wähle deine Sudoku-Stufe</h2>
              <p className="mt-2 font-bold text-slate-600">Jede Zeile, Spalte und jeder Block enthält jede Zahl genau einmal.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SUDOKU_LEVELS.map((level, index) => (
                <button
                  key={level.id}
                  onClick={() => startLevel(level.id)}
                  className={`rounded-2xl border-4 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${index < 2 ? 'border-emerald-100 bg-emerald-50 hover:border-emerald-300' : index < 4 ? 'border-sky-100 bg-sky-50 hover:border-sky-300' : 'border-violet-100 bg-violet-50 hover:border-violet-300'}`}
                >
                  <span className="block text-xs font-black uppercase tracking-wide text-amber-700">Stufe {index + 1}</span>
                  <span className="mt-1 block font-['Fredoka'] text-2xl font-black text-indigo-950">{level.name}</span>
                  <span className="mt-2 block text-sm font-bold text-slate-600">{level.size}×{level.size} · {boxLabel(level.size)}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="mx-auto mt-4 max-w-3xl rounded-[2rem] border-[5px] border-white bg-[#fffdf6] p-3 shadow-[0_16px_50px_rgba(114,76,27,.18)] sm:mt-6 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-['Fredoka'] text-xl font-black text-indigo-950 sm:text-2xl">{game.name} · {game.size}×{game.size}</h2>
                <p className="text-xs font-bold text-slate-600 sm:text-sm">Fülle jede Zeile, Spalte und jeden {boxLabel(game.size)} ohne Wiederholung.</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-amber-100 px-3 py-2 font-['Fredoka'] font-black text-amber-950" aria-label={`Spielzeit ${formatTime(elapsedSeconds)}`}>
                <Clock3 className="h-5 w-5" />
                <time dateTime={`PT${elapsedSeconds}S`}>{formatTime(elapsedSeconds)}</time>
              </div>
            </div>

            <div
              role="group"
              aria-label={`${game.size} mal ${game.size} Sudoku-Feld`}
              className="mx-auto grid w-full max-w-[540px] overflow-hidden rounded-xl border-[3px] border-indigo-900 bg-white shadow-md"
              style={{ gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))` }}
            >
              {grid.flatMap((row, rowIndex) => row.map((value, columnIndex) => {
                const isGiven = game.puzzle[rowIndex][columnIndex] !== 0;
                const isSelected = selectedCell?.row === rowIndex && selectedCell.column === columnIndex;
                const isFeedbackCell = feedbackCell === `${rowIndex}-${columnIndex}`;
                const sameUnit = selectedCell && (
                  selectedCell.row === rowIndex
                  || selectedCell.column === columnIndex
                  || (Math.floor(selectedCell.row / game.boxRows) === Math.floor(rowIndex / game.boxRows)
                    && Math.floor(selectedCell.column / game.boxCols) === Math.floor(columnIndex / game.boxCols))
                );
                const sameNumber = selectedCell && grid[selectedCell.row][selectedCell.column] !== 0
                  && grid[selectedCell.row][selectedCell.column] === value;
                const fontSize = game.size === 4 ? '1.6rem' : game.size === 6 ? '1.35rem' : 'clamp(13px, 3.7vw, 22px)';

                return <button
                  key={`${rowIndex}-${columnIndex}`}
                  type="button"
                  aria-label={`Zeile ${rowIndex + 1}, Spalte ${columnIndex + 1}${isGiven ? ', vorgegeben' : ', frei'}${value ? `, Zahl ${value}` : ''}`}
                  onClick={() => {
                    setSelectedCell({ row: rowIndex, column: columnIndex });
                    setFeedback(null);
                    setFeedbackCell(null);
                  }}
                  className={`relative aspect-square min-w-0 border-indigo-300 font-['Fredoka'] font-black transition-colors ${isSelected ? 'z-10 bg-indigo-200 text-indigo-950 ring-4 ring-indigo-500' : sameNumber ? 'bg-amber-100 text-indigo-950' : sameUnit ? 'bg-sky-50 text-indigo-950' : isGiven ? 'bg-slate-100 text-indigo-950' : 'bg-white text-sky-700 hover:bg-sky-50'} ${isFeedbackCell && feedback === 'wrong' ? 'animate-pulse !bg-rose-200 !text-rose-800' : ''} ${isFeedbackCell && feedback === 'correct' ? '!bg-emerald-100' : ''}`}
                  style={{
                    borderRightWidth: columnIndex === game.size - 1 ? 0 : (columnIndex + 1) % game.boxCols === 0 ? 3 : 1,
                    borderBottomWidth: rowIndex === game.size - 1 ? 0 : (rowIndex + 1) % game.boxRows === 0 ? 3 : 1,
                    fontSize,
                  }}
                >
                  {value || ''}
                  {isFeedbackCell && feedback === 'correct' && <span className="absolute right-0 top-0 text-[9px] text-emerald-600" aria-hidden="true">✓</span>}
                </button>;
              }))}
            </div>

            <div className="mx-auto mt-4 grid max-w-[540px] gap-2" style={{ gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))` }} aria-label="Zahlen auswählen">
              {Array.from({ length: game.size }, (_, index) => {
                const value = index + 1;
                const filledCount = grid.flat().filter((cell) => cell === value).length;
                return <button
                  key={value}
                  type="button"
                  disabled={!selectedCell || (selectedCell !== null && game.puzzle[selectedCell.row][selectedCell.column] !== 0) || filledCount >= game.size || complete}
                  onClick={() => placeNumber(value)}
                  aria-label={`Zahl ${value} eintragen`}
                  className="rounded-xl bg-sky-600 py-2 font-['Fredoka'] text-lg font-black text-white shadow-[0_3px_0_#1e4d7a] transition hover:bg-sky-500 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-xl"
                >
                  {value}
                  <span className="block text-[9px] font-bold text-white/75">{game.size - filledCount}</span>
                </button>;
              })}
            </div>

            <div className="mx-auto mt-3 flex max-w-[540px] items-center justify-between gap-2">
              <div className="min-h-8 flex-1" aria-live="polite">
                {feedback === 'wrong' && <p className="flex items-center gap-1 text-sm font-black text-rose-600"><X className="h-4 w-4" />Diese Zahl steht schon in Zeile, Spalte oder Block.</p>}
                {feedback === 'correct' && <p className="flex items-center gap-1 text-sm font-black text-emerald-700"><Sparkles className="h-4 w-4" />Gute Wahl! Die Zahl passt.</p>}
                {!feedback && <p className="text-sm font-bold text-slate-500">Wähle ein freies Feld und tippe dann eine Zahl.</p>}
              </div>
              <button
                type="button"
                onClick={clearSelectedCell}
                disabled={!selectedCell || (selectedCell !== null && game.puzzle[selectedCell.row][selectedCell.column] !== 0) || grid[selectedCell?.row ?? 0]?.[selectedCell?.column ?? 0] === 0 || complete}
                aria-label="Ausgewähltes Feld leeren"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <Eraser className="h-4 w-4" /> Löschen
              </button>
            </div>
          </section>
        )}

        {complete && game && <section className="mx-auto mt-5 max-w-3xl rounded-[2rem] border-4 border-amber-300 bg-white p-5 text-center shadow-lg sm:p-7">
          <div className="mb-2 text-5xl" aria-hidden="true">🎉⭐🧩</div>
          <h2 className="font-['Fredoka'] text-2xl font-black text-indigo-950 sm:text-3xl">Sudoku gelöst!</h2>
          <p className="mt-1 font-bold text-slate-600">Stark geknobelt! Deine Zeit: {formatTime(elapsedSeconds)}</p>
          <div className="my-3 flex items-center justify-center gap-2 font-black text-amber-600"><Trophy className="h-5 w-5" />{game.name} · {game.size}×{game.size}</div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => startLevel(game.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-black text-white shadow-md transition hover:bg-amber-400 active:scale-95"><Sparkles className="h-5 w-5" />Nochmal spielen</button>
            <button onClick={chooseLevel} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-black text-white shadow-md transition hover:bg-sky-500 active:scale-95"><Check className="h-5 w-5" />Stufe wählen</button>
            <button onClick={onBack} className="rounded-2xl bg-violet-600 px-5 py-3 font-black text-white shadow-md transition hover:bg-violet-500 active:scale-95">Zur Spielauswahl</button>
          </div>
        </section>}
      </div>
    </main>
  );
};
