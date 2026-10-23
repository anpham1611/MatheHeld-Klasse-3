/**
 * German Grade 3 Math Curriculum (Mathematik Klasse 3 Grundschule)
 * Following Baden-Württemberg, Bayern, NRW & Berlin Lehrpläne
 */

export interface StellenwertTask {
  id: string;
  number: number;
  h: number; // Hunderter
  z: number; // Zehner
  e: number; // Einer
  questionDe: string;
  questionVi: string;
  hintDe: string;
  hintVi: string;
  options: number[];
  answer: number;
  type: 'identify' | 'decompose' | 'neighbors';
}

export interface EinmaleinsTask {
  id: string;
  a: number;
  b: number;
  op: 'x' | ':';
  questionStr: string;
  answer: number;
  remainder?: number; // For division with remainder (Division mit Rest)
  options: { label: string; value: number; remainder?: number }[];
  hintDe: string;
  hintVi: string;
}

export interface EuroItem {
  id: string;
  nameDe: string;
  nameVi: string;
  icon: string;
  priceCents: number; // in cents
}

export const EURO_ITEMS: EuroItem[] = [
  { id: 'brezel', nameDe: 'Frische Laugenbrezel', nameVi: 'Bánh mì xoắn Brezel Đức', icon: '🥨', priceCents: 120 },
  { id: 'schorle', nameDe: 'Bio-Apfelschorle', nameVi: 'Nước táo có ga Apfelschorle', icon: '🧃', priceCents: 150 },
  { id: 'franz', nameDe: 'Franzbrötchen', nameVi: 'Bánh quế Franzbrötchen', icon: '🥐', priceCents: 180 },
  { id: 'schoko', nameDe: 'Tafel Schokolade', nameVi: 'Thanh sô-cô-la', icon: '🍫', priceCents: 95 },
  { id: 'heft', nameDe: 'Matheheft DIN A4', nameVi: 'Vở ô li toán A4', icon: '📓', priceCents: 140 },
  { id: 'stift', nameDe: 'Buntstifte-Set', nameVi: 'Hộp bút màu vẽ', icon: '✏️', priceCents: 260 },
  { id: 'ball', nameDe: 'Mini-Fußball', nameVi: 'Quả bóng đá mini', icon: '⚽', priceCents: 450 },
  { id: 'baer', nameDe: 'Gummibärchen', nameVi: 'Kẹo dẻo gấu Haribo', icon: '🍬', priceCents: 110 },
];

export interface EuroTask {
  id: string;
  items: EuroItem[];
  totalCents: number;
  paidCents: number;
  changeCents: number;
  customerAvatar: string;
  customerName: string;
}

export interface TowerTask {
  id: string;
  num1: number;
  num2: number;
  op: '+' | '-';
  answer: number;
  h1: number;
  z1: number;
  e1: number;
  h2: number;
  z2: number;
  e2: number;
}

// Euro denominations
export const EURO_DENOMINATIONS = [
  { value: 1000, label: '10 €', type: 'note', bg: 'bg-red-600 border-red-400 text-white' },
  { value: 500, label: '5 €', type: 'note', bg: 'bg-emerald-600 border-emerald-400 text-white' },
  { value: 200, label: '2 €', type: 'coin', bg: 'bg-gradient-to-br from-amber-300 to-amber-500 border-amber-200 text-amber-950 ring-2 ring-slate-300' },
  { value: 100, label: '1 €', type: 'coin', bg: 'bg-gradient-to-br from-slate-200 to-slate-400 border-slate-100 text-slate-900 ring-2 ring-amber-400' },
  { value: 50, label: '50 ct', type: 'coin', bg: 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-amber-950' },
  { value: 20, label: '20 ct', type: 'coin', bg: 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-amber-950' },
  { value: 10, label: '10 ct', type: 'coin', bg: 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-amber-950' },
  { value: 5, label: '5 ct', type: 'coin', bg: 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-600 text-amber-100' },
  { value: 2, label: '2 ct', type: 'coin', bg: 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-600 text-amber-100' },
  { value: 1, label: '1 ct', type: 'coin', bg: 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-600 text-amber-100' },
];

export function formatEuro(cents: number): string {
  const euros = (cents / 100).toFixed(2).replace('.', ',');
  return `${euros} €`;
}

// Generator: Stellenwert & Zahlenraum bis 1000
export function generateStellenwertTask(): StellenwertTask {
  const types: ('identify' | 'decompose' | 'neighbors')[] = ['identify', 'decompose', 'neighbors'];
  const type = types[Math.floor(Math.random() * types.length)];
  const num = Math.floor(Math.random() * 899) + 101; // 101 - 999
  const h = Math.floor(num / 100);
  const z = Math.floor((num % 100) / 10);
  const e = num % 10;

  let questionDe = '';
  let questionVi = '';
  let hintDe = '';
  let hintVi = '';
  let answer = num;
  const optionsSet = new Set<number>();
  optionsSet.add(num);

  if (type === 'identify') {
    questionDe = `Welche Zahl ist ${h} Hunderter (H), ${z} Zehner (Z) und ${e} Einer (E)?`;
    questionVi = `Số nào gồm ${h} Trăm (H), ${z} Chục (Z) và ${e} Đơn vị (E)?`;
    hintDe = `${h}00 + ${z}0 + ${e} = ?`;
    hintVi = `${h}00 + ${z}0 + ${e} = ?`;
    answer = num;
  } else if (type === 'decompose') {
    // ask for one specific place value
    const place = Math.random() > 0.5 ? 'Z' : 'H';
    if (place === 'H') {
      questionDe = `Wie viele HUNDERTER (H) hat die Zahl ${num}?`;
      questionVi = `Số ${num} có bao nhiêu TRĂM (Hunderter)?`;
      hintDe = `Schau auf die erste Stelle von ${num}.`;
      hintVi = `Nhìn vào chữ số hàng trăm đầu tiên của ${num}.`;
      answer = h;
      optionsSet.clear();
      optionsSet.add(h);
      optionsSet.add(z);
      optionsSet.add(e);
      optionsSet.add(Math.min(9, h + 1));
    } else {
      questionDe = `Wie viele ZEHNTER (Z) hat die Zahl ${num}?`;
      questionVi = `Số ${num} có bao nhiêu CHỤC (Zehner)?`;
      hintDe = `Schau auf die mittlere Stelle von ${num}.`;
      hintVi = `Nhìn vào chữ số hàng chục ở giữa của ${num}.`;
      answer = z;
      optionsSet.clear();
      optionsSet.add(z);
      optionsSet.add(h);
      optionsSet.add(e);
      optionsSet.add((z + 2) % 10);
    }
  } else {
    // Nachbarzahlen (Vorgänger / Nachfolger / Nachbarzehner)
    const subType = Math.random() > 0.5 ? 'nachfolger' : 'nachbarzehner';
    if (subType === 'nachfolger') {
      questionDe = `Welche Zahl ist der NACHFOLGER von ${num}?`;
      questionVi = `Số liền sau của ${num} là số nào?`;
      hintDe = `Rechne: ${num} + 1`;
      hintVi = `Tính: ${num} + 1`;
      answer = num + 1;
      optionsSet.clear();
      optionsSet.add(num + 1);
      optionsSet.add(num - 1);
      optionsSet.add(num + 10);
      optionsSet.add(num + 2);
    } else {
      const nextTen = Math.ceil((num + 1) / 10) * 10;
      questionDe = `Was ist der nächste NACHBARZEHNER von ${num}?`;
      questionVi = `Số tròn chục tiếp theo (Nachbarzehner) của ${num} là gì?`;
      hintDe = `Runde auf den nächsten Zehner über ${num}.`;
      hintVi = `Tìm số tròn chục lớn hơn gần nhất với ${num}.`;
      answer = nextTen;
      optionsSet.clear();
      optionsSet.add(nextTen);
      optionsSet.add(Math.floor(num / 10) * 10);
      optionsSet.add(nextTen + 10);
      optionsSet.add(num + 1);
    }
  }

  // Fill up options if fewer than 4
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1) * (type === 'decompose' ? 1 : 10);
    const candidate = Math.max(1, answer + delta);
    optionsSet.add(candidate);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `stw_${Date.now()}_${Math.random()}`,
    number: num,
    h,
    z,
    e,
    questionDe,
    questionVi,
    hintDe,
    hintVi,
    options,
    answer,
    type,
  };
}

// Generator: Einmaleins (1x1) & Division mit/ohne Rest
export function generateEinmaleinsTask(includeRemainder: boolean = false): EinmaleinsTask {
  const isMultiplication = !includeRemainder || Math.random() > 0.45;

  if (isMultiplication) {
    // Multiplikation: 2-9 x 2-10
    const a = Math.floor(Math.random() * 8) + 2; // 2..9
    const b = Math.floor(Math.random() * 9) + 2; // 2..10
    const answer = a * b;

    const optSet = new Set<number>();
    optSet.add(answer);
    optSet.add(answer + a);
    optSet.add(answer - b > 0 ? answer - b : answer + 2);
    optSet.add((a + 1) * b);
    optSet.add(answer + 10);

    const opts = Array.from(optSet).filter(n => n > 0).slice(0, 4).sort(() => Math.random() - 0.5);

    return {
      id: `1x1_${Date.now()}_${Math.random()}`,
      a,
      b,
      op: 'x',
      questionStr: `${a} · ${b} = ?`,
      answer,
      options: opts.map(val => ({ label: `${val}`, value: val })),
      hintDe: `Tipp: ${a} mal die ${b} rechnen.`,
      hintVi: `Gợi ý: ${a} lần số ${b}.`,
    };
  } else {
    // Division: either clean or with remainder (Klasse 3 Standard)
    const withRemainder = Math.random() > 0.4;
    const divisor = Math.floor(Math.random() * 7) + 3; // 3..9
    const quotient = Math.floor(Math.random() * 8) + 2; // 2..9

    if (!withRemainder) {
      const dividend = divisor * quotient;
      const optSet = new Set<number>();
      optSet.add(quotient);
      optSet.add(quotient + 1);
      optSet.add(Math.max(1, quotient - 1));
      optSet.add(quotient + 2);

      const opts = Array.from(optSet).slice(0, 4).sort(() => Math.random() - 0.5);

      return {
        id: `div_${Date.now()}_${Math.random()}`,
        a: dividend,
        b: divisor,
        op: ':',
        questionStr: `${dividend} : ${divisor} = ?`,
        answer: quotient,
        options: opts.map(val => ({ label: `${val}`, value: val })),
        hintDe: `Umkehraufgabe: ? · ${divisor} = ${dividend}`,
        hintVi: `Tính ngược lại: ? · ${divisor} = ${dividend}`,
      };
    } else {
      const remainder = Math.floor(Math.random() * (divisor - 1)) + 1; // 1 .. divisor-1
      const dividend = divisor * quotient + remainder;

      const correctLabel = `${quotient} R ${remainder}`;
      const distractors = [
        `${quotient + 1} R ${remainder}`,
        `${quotient} R ${Math.max(1, remainder - 1)}`,
        `${Math.max(1, quotient - 1)} R ${remainder}`,
        `${quotient} R ${remainder + 1 < divisor ? remainder + 1 : 1}`,
      ];

      const opts = [
        { label: correctLabel, value: quotient, remainder },
        ...distractors.slice(0, 3).map((lbl, idx) => ({
          label: lbl,
          value: quotient + idx + 1,
          remainder: (remainder + idx) % divisor,
        })),
      ].sort(() => Math.random() - 0.5);

      return {
        id: `divrem_${Date.now()}_${Math.random()}`,
        a: dividend,
        b: divisor,
        op: ':',
        questionStr: `${dividend} : ${divisor} = ? (mit Rest)`,
        answer: quotient,
        remainder,
        options: opts,
        hintDe: `Wie oft passt die ${divisor} in ${dividend}? ${quotient} · ${divisor} = ${quotient * divisor}. Bleibt Rest ${remainder}!`,
        hintVi: `${divisor} vừa khít bao nhiêu lần trong ${dividend}? Thừa ra phần dư R ${remainder}!`,
      };
    }
  }
}

// Generator: Euro & Cent Shop Task
const CUSTOMERS = [
  { name: 'Oma Gerda', avatar: '👵' },
  { name: 'Herr Müller', avatar: '👨‍🏫' },
  { name: 'Schülerin Lea', avatar: '👧' },
  { name: 'Lukas', avatar: '👦' },
  { name: 'Postbote Ben', avatar: '📬' },
];

export function generateEuroTask(): EuroTask {
  const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  const itemCount = Math.random() > 0.5 ? 2 : 1;
  const shuffledItems = [...EURO_ITEMS].sort(() => Math.random() - 0.5);
  const items = shuffledItems.slice(0, itemCount);

  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);

  // Customer pays with a standard round note or coin that covers the bill
  const paymentOptions = [200, 500, 1000, 2000].filter(val => val > totalCents);
  const paidCents = paymentOptions.length > 0 ? paymentOptions[0] : 1000;
  const changeCents = paidCents - totalCents;

  return {
    id: `euro_${Date.now()}_${Math.random()}`,
    items,
    totalCents,
    paidCents,
    changeCents,
    customerAvatar: customer.avatar,
    customerName: customer.name,
  };
}

// Generator: Tower Math (Schriftliche Addition & Subtraktion)
export function generateTowerTask(isAddition: boolean = true): TowerTask {
  let num1: number, num2: number, answer: number;

  if (isAddition) {
    num1 = Math.floor(Math.random() * 450) + 120; // 120..570
    num2 = Math.floor(Math.random() * 400) + 110; // 110..510
    answer = num1 + num2;
  } else {
    num1 = Math.floor(Math.random() * 500) + 300; // 300..800
    num2 = Math.floor(Math.random() * (num1 - 100)) + 50;
    answer = num1 - num2;
  }

  return {
    id: `tower_${Date.now()}_${Math.random()}`,
    num1,
    num2,
    op: isAddition ? '+' : '-',
    answer,
    h1: Math.floor(num1 / 100),
    z1: Math.floor((num1 % 100) / 10),
    e1: num1 % 10,
    h2: Math.floor(num2 / 100),
    z2: Math.floor((num2 % 100) / 10),
    e2: num2 % 10,
  };
}
