import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, Clock3, RotateCcw, Send, Sparkles, Trophy } from 'lucide-react';
import { sound } from '../../audio/soundManager';
import {
  countCorrectAnswers,
  EINMALEINS_TEST_SECONDS,
  EINMALEINS_TEST_SIZE,
  EinmaleinsQuestion,
  generateEinmaleinsTest,
  getGermanGrade,
} from '../../math/einmaleinsTest';

interface EinmaleinsTestProps {
  onBack: () => void;
  mode?: 'sequential' | 'full-page';
}

type TestPhase = 'intro' | 'running' | 'result';

const GRADE_LABELS: Record<number, string> = {
  1: 'Sehr gut',
  2: 'Gut',
  3: 'Befriedigend',
  4: 'Ausreichend',
  5: 'Mangelhaft',
  6: 'Ungenügend',
};

const GRADE_BANDS = [
  { grade: 1, range: '55–60 richtig' },
  { grade: 2, range: '49–54 richtig' },
  { grade: 3, range: '40–48 richtig' },
  { grade: 4, range: '30–39 richtig' },
  { grade: 5, range: '15–29 richtig' },
  { grade: 6, range: '0–14 richtig' },
];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const EinmaleinsTest: React.FC<EinmaleinsTestProps> = ({ onBack, mode = 'sequential' }) => {
  const isFullPage = mode === 'full-page';
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [questions, setQuestions] = useState<EinmaleinsQuestion[]>([]);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(EINMALEINS_TEST_SECONDS);
  const [confirmExit, setConfirmExit] = useState(false);
  const deadline = useRef<number | null>(null);
  const answerField = useRef<HTMLInputElement>(null);
  const resultStarted = useRef(false);
  const resultEffectsPlayed = useRef(false);

  const currentQuestion = questions[questionIndex];
  const correctAnswers = countCorrectAnswers(questions, answers);
  const grade = getGermanGrade(correctAnswers);
  const isTopGrade = grade <= 2;
  const isMiddleGrade = grade <= 4;

  const finishTest = () => {
    if (resultStarted.current) return;
    resultStarted.current = true;
    setPhase('result');
  };

  useEffect(() => {
    if (phase !== 'result' || resultEffectsPlayed.current) return;
    resultEffectsPlayed.current = true;

    if (isTopGrade) {
      sound.playFanfare();
      const colors = ['#fbbf24', '#fff7ad', '#fb7185', '#60a5fa', '#c084fc'];
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.62 }, colors });
      confetti({ particleCount: 45, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
    } else if (isMiddleGrade) {
      sound.playCorrect();
      confetti({
        particleCount: 28,
        spread: 48,
        startVelocity: 22,
        origin: { y: 0.65 },
        colors: ['#34d399', '#60a5fa', '#fbbf24'],
      });
    } else {
      sound.playJump();
    }
  }, [phase, isMiddleGrade, isTopGrade]);

  useEffect(() => {
    if (phase !== 'running') return;

    const timer = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil(((deadline.current ?? Date.now()) - Date.now()) / 1000),
      );
      setTimeLeft(remaining);

      if (remaining === 0) finishTest();
    }, 250);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'running') answerField.current?.focus();
  }, [phase, questionIndex]);

  const startTest = () => {
    setQuestions(generateEinmaleinsTest());
    setAnswers(Array(EINMALEINS_TEST_SIZE).fill(null));
    setQuestionIndex(0);
    setAnswerInput('');
    setTimeLeft(EINMALEINS_TEST_SECONDS);
    resultStarted.current = false;
    resultEffectsPlayed.current = false;
    deadline.current = Date.now() + EINMALEINS_TEST_SECONDS * 1000;
    sound.playJump();
    setPhase('running');
  };

  const handleBack = () => {
    if (phase === 'running') {
      setConfirmExit(true);
      return;
    }
    onBack();
  };

  const submitAnswer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phase !== 'running') return;

    if (Date.now() >= (deadline.current ?? 0)) {
      setTimeLeft(0);
      finishTest();
      return;
    }

    const answer = Number(answerInput);
    if (!Number.isInteger(answer) || answer < 0 || answer > 100) return;

    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answer;
    setAnswers(updatedAnswers);
    setAnswerInput('');
    sound.playJump();

    if (questionIndex + 1 === EINMALEINS_TEST_SIZE) {
      finishTest();
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  const updateListedAnswer = (index: number, value: string) => {
    const answer = value === '' ? null : Number(value);
    if (answer !== null && (!Number.isInteger(answer) || answer < 0 || answer > 100)) return;

    setAnswers((currentAnswers) => {
      const updatedAnswers = [...currentAnswers];
      updatedAnswers[index] = answer;
      return updatedAnswers;
    });
  };

  const submitFullPageTest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (Date.now() >= (deadline.current ?? 0)) setTimeLeft(0);
    finishTest();
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-5 text-white sm:px-8">
      <header className={`mx-auto flex w-full max-w-4xl items-center justify-between gap-3 ${isFullPage ? 'sticky top-0 z-20 bg-slate-950/90 py-2 backdrop-blur' : ''}`}>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 font-bold hover:bg-white/15"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>
        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-2 font-black tabular-nums">
          <Clock3 className={`h-5 w-5 ${timeLeft <= 60 && phase === 'running' ? 'text-rose-400' : 'text-amber-300'}`} />
          <span aria-live="off" className={timeLeft <= 60 && phase === 'running' ? 'text-rose-300' : 'text-white'}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      <main className={`mx-auto flex w-full flex-col items-center py-8 sm:py-12 ${isFullPage ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {phase === 'intro' && (
          <section className="w-full rounded-[2rem] border border-indigo-300/20 bg-slate-900/80 p-6 shadow-2xl sm:p-10">
            <div className="mb-5 text-center text-6xl" aria-hidden="true">🦊</div>
            <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-indigo-300">Der 1×1-Test</p>
            <h1 className="mt-2 text-center font-['Fredoka'] text-3xl font-black sm:text-5xl">Schaffst du alle 60?</h1>
            <p className="mx-auto mt-4 max-w-xl text-center leading-relaxed text-slate-300">
              {isFullPage
                ? 'Du hast 5 Minuten. Alle Aufgaben stehen auf einer Seite. Tippe ein beliebiges Antwortfeld an und löse sie in deiner Reihenfolge.'
                : 'Du hast 5 Minuten. Tippe jedes Ergebnis ein. Die Reihen 4, 6, 7 und 8 kommen besonders oft dran.'}
            </p>

            <div className="my-7 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              {[4, 6, 7, 8].map((table) => (
                <div key={table} className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-3">
                  <span className="block text-xs font-bold uppercase text-indigo-200">Schwerpunkt</span>
                  <span className="font-['Fredoka'] text-3xl font-black text-white">{table}er</span>
                </div>
              ))}
            </div>

            <div className="mb-7 rounded-2xl bg-slate-950/70 p-4">
              <h2 className="mb-3 text-center font-black text-amber-200">Notenschlüssel</h2>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                {GRADE_BANDS.map(({ grade: gradeNumber, range }) => (
                  <li key={gradeNumber} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className="font-black text-amber-300">{gradeNumber} · {GRADE_LABELS[gradeNumber]}</span>
                    <span className="whitespace-nowrap text-slate-300">{range}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={startTest}
              className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 text-xl font-black text-slate-950 shadow-lg shadow-orange-500/20 transition hover:scale-[1.02]"
            >
              <CheckCircle2 className="h-6 w-6" />
              Test starten
            </button>
          </section>
        )}

        {phase === 'running' && isFullPage && (
          <section className="w-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-indigo-200">
              <span>Tippe eine Aufgabe an, um ihre Antwort einzutragen.</span>
              <span>{answers.filter((answer) => answer !== null).length} von {EINMALEINS_TEST_SIZE} beantwortet</span>
            </div>
            <form onSubmit={submitFullPageTest}>
              <ol className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-3">
                {questions.map((question, index) => (
                  <li key={`${question.a}-${question.b}`}>
                    <label
                      htmlFor={`einmaleins-answer-${index}`}
                      className={`flex min-h-16 cursor-text items-center gap-2 rounded-xl border px-3 py-2 transition focus-within:border-amber-300 ${
                        answers[index] === null
                          ? 'border-slate-700 bg-slate-900/80 hover:border-indigo-400'
                          : 'border-indigo-400/40 bg-indigo-500/10'
                      }`}
                    >
                      <span className="shrink-0 text-xs font-bold text-slate-400">{index + 1})</span>
                      <span className="flex-1 whitespace-nowrap font-black text-white">
                        {question.a} · {question.b} =
                      </span>
                      <input
                        id={`einmaleins-answer-${index}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="100"
                        step="1"
                        value={answers[index] ?? ''}
                        onChange={(event) => updateListedAnswer(index, event.target.value)}
                        aria-label={`Antwort für Aufgabe ${index + 1}: ${question.a} mal ${question.b}`}
                        className="w-16 rounded-lg border border-slate-600 bg-slate-950 px-2 py-2 text-center font-black text-amber-200 outline-none focus:border-amber-300"
                      />
                    </label>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  type="submit"
                  className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-4 text-lg font-black text-white transition hover:bg-indigo-400"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Test beenden & auswerten
                </button>
                <p className="text-center text-sm text-slate-400">Nicht ausgefüllte Aufgaben zählen als falsch. Die Zeit läuft weiter.</p>
              </div>
            </form>
          </section>
        )}

        {phase === 'running' && !isFullPage && currentQuestion && (
          <section className="w-full">
            <div className="mb-5 flex items-center justify-between text-sm font-bold text-indigo-200">
              <span>Aufgabe {questionIndex + 1} von {EINMALEINS_TEST_SIZE}</span>
              <span>{questionIndex} beantwortet</span>
            </div>
            <div className="mb-8 h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width]"
                style={{ width: `${(questionIndex / EINMALEINS_TEST_SIZE) * 100}%` }}
              />
            </div>

            <div className="rounded-[2rem] border border-indigo-300/20 bg-slate-900/80 p-6 text-center shadow-2xl sm:p-12">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-indigo-300">Wie viel ist</p>
              <div className="my-7 font-['Fredoka'] text-6xl font-black tracking-wide sm:text-8xl">
                {currentQuestion.a} · {currentQuestion.b} = <span className="text-amber-300">?</span>
              </div>
              <form onSubmit={submitAnswer} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                <label htmlFor="einmaleins-answer" className="sr-only">Ergebnis eingeben</label>
                <input
                  ref={answerField}
                  id="einmaleins-answer"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  required
                  value={answerInput}
                  onChange={(event) => setAnswerInput(event.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border-2 border-indigo-300/30 bg-slate-950 px-5 py-4 text-center text-3xl font-black text-white outline-none focus:border-amber-300"
                  aria-label="Ergebnis eingeben"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-4 font-black text-white transition hover:bg-indigo-400"
                >
                  {questionIndex + 1 === EINMALEINS_TEST_SIZE ? 'Auswerten' : 'Weiter'}
                  <Send className="h-5 w-5" />
                </button>
              </form>
              <p className="mt-5 text-sm text-slate-400">Deine Antworten werden erst am Ende ausgewertet.</p>
            </div>
          </section>
        )}

        {phase === 'result' && (
          <section className={`w-full rounded-[2rem] border bg-slate-900/80 p-6 text-center shadow-2xl sm:p-10 ${isTopGrade ? 'border-amber-300/60 shadow-amber-400/20' : isMiddleGrade ? 'border-emerald-300/40 shadow-emerald-400/10' : 'border-sky-300/30 shadow-sky-400/10'}`}>
            <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl text-6xl ${isTopGrade ? 'animate-bounce bg-gradient-to-br from-amber-300 to-orange-500 shadow-xl shadow-amber-400/40' : isMiddleGrade ? 'animate-pulse bg-emerald-400/15 ring-2 ring-emerald-300/40' : 'animate-pulse bg-sky-400/15 ring-2 ring-sky-300/30'}`}>
              {isTopGrade ? <span className="relative"><Trophy className="h-14 w-14 fill-amber-100 text-amber-100" /><Sparkles className="absolute -right-4 -top-3 h-6 w-6 text-white" /></span> : isMiddleGrade ? '🌟' : '🌱'}
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-300">Test beendet</p>
            <h1 className="mt-2 font-['Fredoka'] text-3xl font-black sm:text-5xl">Dein Ergebnis</h1>
            <div className={`mx-auto my-7 flex h-32 w-32 items-center justify-center rounded-full border-4 font-['Fredoka'] text-7xl font-black shadow-xl ${isTopGrade ? 'border-amber-300 bg-amber-300/10 text-amber-200 shadow-amber-500/20' : isMiddleGrade ? 'border-emerald-300 bg-emerald-300/10 text-emerald-200 shadow-emerald-500/10' : 'border-sky-300 bg-sky-300/10 text-sky-200 shadow-sky-500/10'}`}>
              {grade}
            </div>
            <h2 className={`text-xl font-black sm:text-2xl ${isTopGrade ? 'text-amber-200' : isMiddleGrade ? 'text-emerald-200' : 'text-sky-200'}`}>
              {isTopGrade ? 'Einmaleins-Champion!' : isMiddleGrade ? 'Stark gemacht!' : 'Weiter üben – du schaffst das!'}
            </h2>
            <p className="mt-1 text-slate-300">
              {isTopGrade ? 'Was für eine tolle Leistung!' : isMiddleGrade ? 'Du bist auf einem guten Weg.' : 'Mit jeder Runde wirst du sicherer.'}
            </p>
            <p className="text-2xl font-black">Note {grade} · {GRADE_LABELS[grade]}</p>
            <p className="mt-2 text-lg text-slate-300">{correctAnswers} von {EINMALEINS_TEST_SIZE} richtig</p>
            <p className="mt-1 text-sm text-slate-400">
              {timeLeft === 0 ? 'Zeit abgelaufen' : `${formatTime(timeLeft)} übrig`}
            </p>
            <section className="mt-8 text-left" aria-labelledby="answer-review-title">
              <h2 id="answer-review-title" className="text-center text-lg font-black text-indigo-200">
                Alle Aufgaben im Überblick
              </h2>
              <ol className="mt-3 max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                {questions.map((question, index) => {
                  const givenAnswer = answers[index];
                  const isCorrect = givenAnswer === question.answer;
                  const status = isCorrect
                    ? 'Richtig'
                    : givenAnswer === null
                      ? 'Nicht beantwortet'
                      : 'Falsch';

                  return (
                    <li
                      key={`${question.a}-${question.b}`}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-950/30'
                          : givenAnswer === null
                            ? 'border-slate-700 bg-slate-950/60'
                            : 'border-rose-500/30 bg-rose-950/30'
                      }`}
                    >
                      <span className="shrink-0 font-black text-white">
                        {index + 1}) {question.a} · {question.b} = ?
                      </span>
                      <span className="text-right text-slate-300">
                        Deine Antwort: {givenAnswer === null ? '—' : givenAnswer}
                        <br />
                        Erwartet: <strong className="text-white">{question.answer}</strong>
                      </span>
                      <span className={`shrink-0 text-xs font-black ${isCorrect ? 'text-emerald-300' : givenAnswer === null ? 'text-slate-400' : 'text-rose-300'}`}>
                        {status}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={startTest}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 hover:bg-amber-300"
              >
                <RotateCcw className="h-5 w-5" /> Nochmal spielen
              </button>
              <button
                onClick={onBack}
                className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-black hover:bg-white/15"
              >
                Zur Spielauswahl
              </button>
            </div>
          </section>
        )}
      </main>

      {confirmExit && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="exit-test-title">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 id="exit-test-title" className="text-xl font-black">Test abbrechen?</h2>
            <p className="mt-2 text-slate-300">Dein bisheriges Ergebnis geht verloren.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmExit(false)} className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 font-bold hover:bg-indigo-400">
                Weiterrechnen
              </button>
              <button onClick={onBack} className="flex-1 rounded-xl bg-slate-700 px-4 py-3 font-bold hover:bg-slate-600">
                Test verlassen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
