import { Language } from '../types/game';

export type BrickMathKind = 'geometry' | 'fraction' | 'pattern' | 'word_problem';

export interface BrickMathQuestion {
  kind: BrickMathKind;
  prompt: string;
  visual: string;
  answer: string;
  options: string[];
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function answerOptions(answer: number | string, distractors: Array<number | string>): string[] {
  return shuffle([...new Set([String(answer), ...distractors.map(String)])].slice(0, 4));
}

function makeFraction(hard: boolean, lang: Language): BrickMathQuestion {
  const denominator = pick(hard ? [8, 10, 12, 16] : [4, 6, 8, 10]);
  const numerator = 1 + Math.floor(Math.random() * (denominator - 1));
  const answer = `${numerator}/${denominator}`;
  const prompt = lang === 'de'
    ? `Von ${denominator} Noppen sind ${numerator} blau. Welcher Bruch ist blau?`
    : `Trong ${denominator} núm gạch, có ${numerator} núm màu xanh. Phân số nào chỉ phần màu xanh?`;
  return {
    kind: 'fraction',
    prompt,
    visual: `${Array.from({ length: denominator }, (_, index) => index < numerator ? '🔵' : '⚪').join(' ')}`,
    answer,
    options: answerOptions(answer, [`${Math.max(1, numerator - 1)}/${denominator}`, `${Math.min(denominator - 1, numerator + 1)}/${denominator}`, `${numerator}/${denominator - 1}`]),
  };
}

function makeGeometry(hard: boolean, lang: Language): BrickMathQuestion {
  const heights = Array.from({ length: hard ? 5 : 4 }, () => 1 + Math.floor(Math.random() * (hard ? 5 : 4)));
  const total = heights.reduce((sum, height) => sum + height, 0);
  const visual = heights.map((height) => `${'🧱'.repeat(height)}`).join('   ');
  return {
    kind: 'geometry',
    prompt: lang === 'de'
      ? `Wie viele 1×1-Steine stecken in diesen ${heights.length} Türmen zusammen?`
      : `Có tất cả bao nhiêu viên gạch 1×1 trong ${heights.length} cột này?`,
    visual,
    answer: String(total),
    options: answerOptions(total, [total - 2, total + 1, total + 3]),
  };
}

function makePattern(hard: boolean, lang: Language): BrickMathQuestion {
  if (hard) {
    const first = 2 + Math.floor(Math.random() * 8);
    const step = 2 + Math.floor(Math.random() * 5);
    const sequence = Array.from({ length: 4 }, (_, index) => first + step * index);
    const answer = sequence[3] + step;
    return {
      kind: 'pattern',
      prompt: lang === 'de' ? 'Welcher Stein setzt das Zahlenmuster fort?' : 'Số nào tiếp tục quy luật?',
      visual: `${sequence.join('  →  ')}  →  ?`,
      answer: String(answer),
      options: answerOptions(answer, [answer - step, answer + 1, answer + step]),
    };
  }

  const first = pick(['🔴', '🔵', '🟡', '🟢', '🟣']);
  const second = pick(['🧱', '🪵', '🪨', '⚙️', '💎'].filter((item) => item !== first));
  const answer = `${first} ${second} ${first} ${second} ${first} ?`;
  return {
    kind: 'pattern',
    prompt: lang === 'de' ? 'Welcher Baustein kommt als Nächstes?' : 'Khối nào xuất hiện tiếp theo?',
    visual: answer,
    answer: second,
    options: shuffle([second, first, '⭐', '⚙️'].filter((item, index, items) => items.indexOf(item) === index)),
  };
}

function makeWordProblem(hard: boolean, lang: Language): BrickMathQuestion {
  const wheelsPerRover = hard ? 8 : 6;
  const blocksPerRover = hard ? 18 : 14;
  const availableWheels = wheelsPerRover * (2 + Math.floor(Math.random() * 6)) + Math.floor(Math.random() * wheelsPerRover);
  const availableBlocks = blocksPerRover * (2 + Math.floor(Math.random() * 5)) + Math.floor(Math.random() * blocksPerRover);
  const rovers = Math.min(Math.floor(availableWheels / wheelsPerRover), Math.floor(availableBlocks / blocksPerRover));
  return {
    kind: 'word_problem',
    prompt: lang === 'de'
      ? `Ein Rover braucht ${wheelsPerRover} Räder und ${blocksPerRover} Steine. Du hast ${availableWheels} Räder und ${availableBlocks} Steine. Wie viele Rover kannst du bauen?`
      : `Một xe cần ${wheelsPerRover} bánh xe và ${blocksPerRover} khối. Bé có ${availableWheels} bánh xe và ${availableBlocks} khối. Bé làm được bao nhiêu xe?`,
    visual: '🛞  🛞  🛞  🛞  ➜  🚙',
    answer: String(rovers),
    options: answerOptions(rovers, [rovers - 1, rovers + 1, rovers + 2].filter((value) => value > 0)),
  };
}

export function generateBrickMathQuestion(lang: Language, hard = false): BrickMathQuestion {
  const generators = [makeGeometry, makeFraction, makePattern, makeWordProblem];
  return pick(generators)(hard, lang);
}
