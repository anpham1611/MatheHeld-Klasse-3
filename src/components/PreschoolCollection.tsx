import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { VEHICLE_CATALOG_SIZE } from '../math/vehiclePuzzle';

type PreschoolMiniGame = 'monsterparty' | 'vehicle_puzzle';

interface PreschoolCollectionProps {
  onBack: () => void;
  onSelectGame: (game: PreschoolMiniGame) => void;
}

const miniGames: Array<{
  id: PreschoolMiniGame;
  title: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    id: 'monsterparty',
    title: 'Monsterparty',
    description: 'Ziehe jedes bunte Monster zu seinem passenden Schatten.',
    icon: '👾🌙',
    color: 'from-fuchsia-500 to-violet-700',
  },
  {
    id: 'vehicle_puzzle',
    title: 'Puzzle-Rätsel: Verkehrsmittel',
    description: `Wähle 5–15 Fahrzeuge und ordne zwei Teile pro Fahrzeug zu. Jede Runde wählt Modelle aus ${VEHICLE_CATALOG_SIZE} Fahrzeugen.`,
    icon: '🚗🚜🚂🚁',
    color: 'from-sky-500 to-blue-700',
  },
];

export const PreschoolCollection: React.FC<PreschoolCollectionProps> = ({ onBack, onSelectGame }) => (
  <main className="min-h-[100dvh] overflow-y-auto bg-[radial-gradient(ellipse_at_top,#fff7df_0%,#f9e9c8_55%,#f1dcb8_100%)] px-3 py-5 text-slate-800 sm:px-6 sm:py-8">
    <div className="mx-auto max-w-4xl">
      <button onClick={onBack} className="mb-5 inline-flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-white/90 px-4 py-3 font-black text-indigo-950 shadow-sm transition hover:bg-white active:scale-95">
        <ArrowLeft className="h-5 w-5" /> Zur Weltkarte
      </button>

      <header className="mb-7 text-center">
        <div className="mb-2 text-5xl" aria-hidden="true">🧠✨</div>
        <h1 className="font-['Fredoka'] text-2xl font-black text-indigo-950 sm:text-4xl">
          Vorschulblock - Logisches Denken, rätseln und knobeln
        </h1>
        <p className="mt-2 font-bold text-slate-600">Wähle ein Rätsel aus. Jedes Spiel überrascht dich mit neuen Bildern!</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Mini-Spiele auswählen">
        {miniGames.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`group rounded-[2rem] border-4 border-white bg-gradient-to-br ${game.color} p-5 text-left text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl active:scale-[.99] sm:p-7`}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide">Ab 5 Jahren</span>
              <span className="text-4xl" aria-hidden="true">{game.icon}</span>
            </div>
            <h2 className="font-['Fredoka'] text-2xl font-black sm:text-3xl">{game.title}</h2>
            <p className="mt-2 min-h-12 font-bold text-white/90">{game.description}</p>
            <span className="mt-5 flex items-center justify-between border-t border-white/25 pt-4 font-black text-amber-100">
              Jetzt spielen <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </span>
          </button>
        ))}
      </section>
    </div>
  </main>
);
