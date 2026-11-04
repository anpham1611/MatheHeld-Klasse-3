export interface EinmaleinsQuestion {
  a: number;
  b: number;
  answer: number;
}

export const EINMALEINS_TEST_SIZE = 60;
export const EINMALEINS_TEST_SECONDS = 5 * 60;

const FOCUS_TABLES = new Set([4, 6, 7, 8]);
const EASIER_TABLES = new Set([2, 3, 5, 9]);
const FOCUS_QUESTION_COUNT = 48;
const EASIER_QUESTION_COUNT = EINMALEINS_TEST_SIZE - FOCUS_QUESTION_COUNT;

function shuffled<T>(items: T[], random: () => number): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function generateEinmaleinsTest(
  random: () => number = Math.random,
): EinmaleinsQuestion[] {
  const focusQuestions: EinmaleinsQuestion[] = [];
  const easierQuestions: EinmaleinsQuestion[] = [];

  for (let a = 2; a <= 9; a += 1) {
    for (let b = 2; b <= 9; b += 1) {
      const question = { a, b, answer: a * b };

      if (FOCUS_TABLES.has(a) || FOCUS_TABLES.has(b)) {
        focusQuestions.push(question);
      } else if (EASIER_TABLES.has(a) && EASIER_TABLES.has(b)) {
        easierQuestions.push(question);
      }
    }
  }

  return shuffled(
    [
      ...shuffled(focusQuestions, random).slice(0, FOCUS_QUESTION_COUNT),
      ...shuffled(easierQuestions, random).slice(0, EASIER_QUESTION_COUNT),
    ],
    random,
  );
}

export function countCorrectAnswers(
  questions: EinmaleinsQuestion[],
  answers: Array<number | null>,
): number {
  return questions.reduce(
    (count, question, index) => count + (answers[index] === question.answer ? 1 : 0),
    0,
  );
}

export function getGermanGrade(correctAnswers: number): number {
  if (correctAnswers >= 55) return 1;
  if (correctAnswers >= 49) return 2;
  if (correctAnswers >= 40) return 3;
  if (correctAnswers >= 30) return 4;
  if (correctAnswers >= 15) return 5;
  return 6;
}
