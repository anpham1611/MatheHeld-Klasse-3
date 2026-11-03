export interface LogicChoice {
  art: string;
  label?: string;
  correct?: boolean;
  silhouette?: boolean;
  sizes?: number[];
}

export interface LogicPuzzle {
  topicId: number;
  topicName: string;
  group: number;
  prompt: string;
  visual: string;
  choices: LogicChoice[];
}

export const LOGIC_GROUPS = [
  { de: 'Schauen & Sortieren', emoji: '👀' },
  { de: 'Größe & Lage', emoji: '📏' },
  { de: 'Muster & Zahlen', emoji: '🔢' },
  { de: 'Tiere & Alltag', emoji: '🐾' },
];

export const LOGIC_TIERS = [
  { id: 1, de: 'Grundlagen' },
  { id: 2, de: 'Logisches Denken' },
  { id: 3, de: 'Knifflige Rätsel' },
  { id: 4, de: 'Expertenlogik' },
  { id: 5, de: 'Meisterrätsel' },
];

const TOPIC_TITLES: string[] = [
  'Einfaches Rechnen',
  'Zahlenfolgen',
  'An-Aus-Logik',
  'Messen und Vergleichen',
  'Bildanalogien',
  'Geschichten ordnen',
  'Musterreihen',
  'Pfeil-Labyrinth',
  'Dinge sortieren',
  'Was passt nicht?',
  'Schatten finden',
  'Zählen und entdecken',
  'Bilder vergleichen',
  'Bildergitter ergänzen',
  'Waagen-Rätsel',
  'Buchstabenfolgen',
  'Farben-Labyrinth',
  'Uhr und Zeit',
  'Formen zerlegen',
  'Mengen sortieren',
  'Regeln erfüllen',
  'Einfache Wahrscheinlichkeit',
  'Wahrheit und Lüge',
  'Kombinatorik-Grundlagen',
  'Logikgitter',
  'Räumliches Drehen',
  'Wortleitern',
  'Bilderrätsel',
  'Sudoku-Grundlagen',
  'Kreuzwort-Logik',
  'Buchstaben ordnen',
  'Geheimschrift-Gitter',
  'Symbol-Sudoku',
  'Flussüberquerung',
  'Tabellen-Rätsel',
  'Aussagen prüfen',
  'Analogie-Karten',
  'Netzwerkwege',
  'Spielbäume',
  'Mengenlehre',
  'Rückwärtsrechnen',
  'Mathematische Invarianten',
  'Geometrisches Denken',
  'Ressourcen optimal verteilen',
  'Falsch beschriftete Kisten',
  'Marathon-Rangfolge',
  'Überlappende Flächen',
  'Diagonale Muster',
  'Drei Arten von Aussagen',
  'Wasser abmessen',
  'Teiler-Rätsel',
  'Rechtecke im Schnitt',
  'Socken im Dunkeln',
  'Mehrstufige Waagen',
  'Das Monty-Hall-Problem',
  'Bedingte Labyrinthwege',
  'Schleifen-Rätsel',
  'Minenfeld-Logik',
  'Polyomino-Puzzle',
  'Gerichtete azyklische Graphen',
  'Fehlerbaum-Diagnose',
  'Graphen färben',
  'Kryptarithmen',
  'Ungleichungen ordnen',
  'Zustandsübergänge',
  'Knifflige Interviewfragen',
  'Modulo-Rechnen',
  'Schubfachprinzip',
  'Spieltheorie mit mehreren',
  'Verschachtelte Wahrheitsbäume',
  'Selbstbezügliche Rätsel',
  'Endlosschleifen und Grenzen',
  'Dynamische Pfadplanung',
  'Ungleiche Informationen',
  'Nullsummen-Strategien',
  'Wahrscheinlichkeiten aktualisieren',
  'Räumliche Parkettierung',
  'Induktives Schließen',
  'Bayes-Schlussfolgerungen',
  'Maximaler Netzwerkfluss',
  'Boolesche Vereinfachung',
  'Bäume in Graphen',
  'Kombinatorische Spiele',
  'Paritätsprüfung',
  'Gödels Diagonalargument',
  'Meta-Rätsel',
  'Strategische Spielzüge',
  'Querdenker-Paradoxien',
  'Varianten des Gefangenendilemmas',
  'Verschachtelte Ritter und Schurken',
  'Spiele mit unendlichem Horizont',
  'Unscharfe Logik',
  'Kombinatorische Optimierung',
  'Navigation im Chaos',
  'Quantenlogik',
  'Mehrstufig falsch beschriftete Kisten',
  'Topologische Invarianz',
  'Nichteuklidische Labyrinthe',
  'Algorithmen vereinfachen',
  'Das ultimative Meta-Rätsel',
];

export const LOGIC_TOPICS = TOPIC_TITLES.map((de, index) => ({
  id: index + 1,
  tier: Math.floor(index / 20) + 1,
  de,
}));

interface Picture {
  de: string;
  emoji: string;
}

interface Relation {
  subject: Picture;
  answer: Picture;
  visual: string;
}

type GeneratedLogicPuzzle = Omit<LogicPuzzle, 'topicId' | 'topicName'>;

const picture = (de: string, emoji: string): Picture => ({ de, emoji });
const itemName = (item: Picture) => item.de;

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

function sample<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}

function choices(correct: LogicChoice, distractors: LogicChoice[]): LogicChoice[] {
  return shuffle([correct, ...distractors]);
}

function numberChoices(answer: number, offsets = [-2, -1, 1, 2]): LogicChoice[] {
  const candidates = new Set(offsets.map((offset) => answer + offset).filter((value) => value >= 0 && value !== answer));
  for (let offset = 1; candidates.size < 3; offset++) {
    if (answer - offset >= 0) candidates.add(answer - offset);
    candidates.add(answer + offset);
  }
  const distractors = sample([...candidates], 3);
  return shuffle([answer, ...distractors].map((value) => ({ art: String(value), correct: value === answer })));
}

function modularPower(base: number, exponent: number, modulus: number): number {
  let result = 1;
  for (let power = 0; power < exponent; power++) result = (result * base) % modulus;
  return result;
}

function chooseCount(total: number, selected: number): number {
  let result = 1;
  for (let index = 1; index <= selected; index++) result = result * (total - selected + index) / index;
  return Math.round(result);
}

function otherPictures(items: Picture[], answer: Picture, count: number): Picture[] {
  return sample(items.filter((item) => item !== answer), count);
}

function textPuzzle(
  group: number,
  promptDe: string,
  visual: string,
  answer: string,
  distractors: string[]): GeneratedLogicPuzzle {
  const options = new Set([answer]);
  const wrongAnswers = distractors.filter((option) => option && option !== answer);
  for (const option of wrongAnswers) options.add(option);
  for (let offset = 1; options.size < 4; offset++) {
    const numericAnswer = Number(answer);
    const fallback = Number.isFinite(numericAnswer)
      ? String(numericAnswer + offset)
      : `Andere Antwort ${offset}`;
    if (!options.has(fallback)) options.add(fallback);
  }
  return {
    group,
    prompt: promptDe,
    visual,
    choices: shuffle([...options].map((art) => ({ art, correct: art === answer }))),
  };
}

const FRUITS = [
  picture('Apfel',  '🍎'), picture('Banane',  '🍌'), picture('Erdbeere',  '🍓'),
  picture('Birne',  '🍐'), picture('Orange',  '🍊'), picture('Traube',  '🍇'),
  picture('Kirsche',  '🍒'), picture('Ananas',  '🍍'), picture('Pfirsich',  '🍑'),
  picture('Wassermelone',  '🍉'), picture('Kiwi',  '🥝'), picture('Zitrone',  '🍋'),
];

const ANIMALS = [
  picture('Löwe',  '🦁'), picture('Elefant',  '🐘'), picture('Affe',  '🐒'),
  picture('Vogel',  '🐦'), picture('Fuchs',  '🦊'), picture('Hase',  '🐰'),
  picture('Frosch',  '🐸'), picture('Bär',  '🐻'), picture('Katze',  '🐱'),
  picture('Hund',  '🐶'), picture('Giraffe',  '🦒'), picture('Panda',  '🐼'),
];

const SHAPES = [
  picture('Kreis',  '⚪'), picture('Dreieck',  '🔺'),
  picture('Quadrat',  '🟦'), picture('Stern',  '⭐'),
  picture('Herz',  '❤️'), picture('Rechteck',  '🟫'),
  picture('Raute',  '🔶'), picture('Oval',  '🥚'),
];

const COLORS = [
  { de: 'roten', basket: '🧺🔴', items: ['🍎', '🍓', '🚗', '🧱', '🧦', '🧸'] },
  { de: 'blauen', basket: '🧺🔵', items: ['🫐', '🧢', '🧤', '🪣', '🐟', '🧩'] },
  { de: 'gelben', basket: '🧺🟡', items: ['🍌', '🌟', '🦆', '🧀', '🚕', '🌼'] },
];

const ODD_GROUPS = [
  { de: 'Obst', members: ['🍎', '🍐', '🍊', '🍇', '🍓', '🍒', '🍑'] },
  { de: 'Fische', members: ['🐟', '🐠', '🐡', '🐟', '🐠', '🐡', '🐟'] },
  { de: 'Spielzeug', members: ['🧸', '🪀', '🪁', '🧩', '🪆', '🪅', '🧸'] },
  { de: 'Kleidung', members: ['🧦', '🧢', '🧤', '👕', '👗', '🧥', '🧦'] },
  { de: 'Bauernhoftiere', members: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐐', '🐮'] },
  { de: 'Fahrzeuge', members: ['🚗', '🚕', '🚌', '🚲', '🚂', '🚜', '🚗'] },
];

const MATCH_ITEMS = [...FRUITS, ...ANIMALS, ...SHAPES.slice(0, 5)];

const NUMBER_OBJECTS = ['🍎', '🐤', '⭐', '🦋', '🔵', '🌼', '🍓', '🐸', '🚗', '🧸', '🍪', '🌈', '🐞', '🧁', '⚽', '🐠', '🍄', '🎈', '🌷', '🪁'];

const MOTHERS: Relation[] = [
  { subject: picture('Henne',  '🐔'), answer: picture('Küken',  '🐥'), visual: '🐔' },
  { subject: picture('Kuh',  '🐄'), answer: picture('Kalb',  '🐮'), visual: '🐄' },
  { subject: picture('Hund',  '🐶'), answer: picture('Welpe',  '🐕'), visual: '🐶' },
  { subject: picture('Katze',  '🐈'), answer: picture('Kätzchen',  '🐱'), visual: '🐈' },
  { subject: picture('Schaf',  '🐑'), answer: picture('Lamm',  '🐏'), visual: '🐑' },
  { subject: picture('Pferd',  '🐴'), answer: picture('Fohlen',  '🐎'), visual: '🐴' },
  { subject: picture('Schwein',  '🐷'), answer: picture('Ferkel',  '🐖'), visual: '🐷' },
  { subject: picture('Ente',  '🦆'), answer: picture('Entenküken',  '🐣'), visual: '🦆' },
  { subject: picture('Bär',  '🐻'), answer: picture('Bärenjunges',  '🐻‍❄️'), visual: '🐻' },
  { subject: picture('Löwe',  '🦁'), answer: picture('Löwenjunges',  '🐯'), visual: '🦁' },
  { subject: picture('Frosch',  '🐸'), answer: picture('Kaulquappe',  '🫧'), visual: '🐸' },
  { subject: picture('Schmetterling',  '🦋'), answer: picture('Raupe',  '🐛'), visual: '🦋' },
];

const HOMES: Relation[] = [
  { subject: picture('Vogel',  '🐦'), answer: picture('Nest',  '🪺'), visual: '🐦' },
  { subject: picture('Biene',  '🐝'), answer: picture('Bienenstock',  '🍯'), visual: '🐝' },
  { subject: picture('Fisch',  '🐟'), answer: picture('Wasser',  '🌊'), visual: '🐟' },
  { subject: picture('Hund',  '🐶'), answer: picture('Hundehütte',  '🐕‍🦺'), visual: '🐶' },
  { subject: picture('Bär',  '🐻'), answer: picture('Höhle',  '🪨'), visual: '🐻' },
  { subject: picture('Kaninchen',  '🐰'), answer: picture('Bau',  '🕳️'), visual: '🐰' },
  { subject: picture('Frosch',  '🐸'), answer: picture('Teich',  '🪷'), visual: '🐸' },
  { subject: picture('Pferd',  '🐴'), answer: picture('Stall',  '🏠'), visual: '🐴' },
  { subject: picture('Spinne',  '🕷️'), answer: picture('Netz',  '🕸️'), visual: '🕷️' },
  { subject: picture('Fuchs',  '🦊'), answer: picture('Fuchsbau',  '🕳️'), visual: '🦊' },
  { subject: picture('Löwe',  '🦁'), answer: picture('Savanne',  '🌴'), visual: '🦁' },
  { subject: picture('Pinguin',  '🐧'), answer: picture('Eis',  '🧊'), visual: '🐧' },
];

const FOODS: Relation[] = [
  { subject: picture('Kaninchen',  '🐰'), answer: picture('Karotte',  '🥕'), visual: '🐰' },
  { subject: picture('Affe',  '🐒'), answer: picture('Banane',  '🍌'), visual: '🐒' },
  { subject: picture('Katze',  '🐱'), answer: picture('Fisch',  '🐟'), visual: '🐱' },
  { subject: picture('Panda',  '🐼'), answer: picture('Bambus',  '🎋'), visual: '🐼' },
  { subject: picture('Maus',  '🐭'), answer: picture('Käse',  '🧀'), visual: '🐭' },
  { subject: picture('Bär',  '🐻'), answer: picture('Honig',  '🍯'), visual: '🐻' },
  { subject: picture('Pferd',  '🐴'), answer: picture('Apfel',  '🍎'), visual: '🐴' },
  { subject: picture('Schaf',  '🐑'), answer: picture('Gras',  '🌿'), visual: '🐑' },
  { subject: picture('Eichhörnchen',  '🐿️'), answer: picture('Nuss',  '🥜'), visual: '🐿️' },
  { subject: picture('Koala',  '🐨'), answer: picture('Eukalyptus',  '🍃'), visual: '🐨' },
  { subject: picture('Vogel',  '🐦'), answer: picture('Samen',  '🌻'), visual: '🐦' },
  { subject: picture('Biene',  '🐝'), answer: picture('Blüte',  '🌼'), visual: '🐝' },
];

const generators: Array<() => GeneratedLogicPuzzle> = [
  () => {
    const first = 2 + Math.floor(Math.random() * 8);
    const second = 1 + Math.floor(Math.random() * 9);
    const subtract = Math.random() < 0.5 && first > second;
    const answer = subtract ? first - second : first + second;
    return { group: 2, prompt: 'Rechne aus!', visual: `${first} ${subtract ? '−' : '+'} ${second} = ?`, choices: numberChoices(answer) };
  },
  () => {
    const geometric = Math.random() < 0.5;
    const start = geometric ? 1 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 8);
    const step = geometric ? 2 : 2 + Math.floor(Math.random() * 4);
    const sequence = Array.from({ length: 4 }, (_, index) => geometric ? start * step ** index : start + step * index);
    const answer = geometric ? start * step ** 4 : start + step * 4;
    return { group: 2, prompt: 'Welche Zahl folgt?', visual: `${sequence.join('  ·  ')}  ·  ?`, choices: numberChoices(answer, [-5, -2, 2, 5]) };
  },
  () => {
    const startsOn = Math.random() < 0.5;
    const toggles = 1 + Math.floor(Math.random() * 4);
    const isOn = toggles % 2 === 0 ? startsOn : !startsOn;
    return { group: 2, prompt: `Der Schalter startet ${startsOn ? 'an' : 'aus'} und wird ${toggles}-mal umgelegt. Wo steht er jetzt?`, visual: `${startsOn ? '🟢' : '⚫'}  ${'🔁 '.repeat(toggles)}`, choices: shuffle([{ art: '💡', label: 'An', correct: isOn }, { art: '⚫', label: 'Aus', correct: !isOn }]) };
  },
  () => {
    const lengths = sample([8, 10, 12, 14, 16, 18, 20], 4);
    const longest = Math.max(...lengths);
    return { group: 1, prompt: 'Welcher Stift ist am längsten?', visual: lengths.map((length) => `✏️ ${length} cm`).join('   '), choices: shuffle(lengths.map((length) => ({ art: `${length} cm`, correct: length === longest }))) };
  },
  () => {
    const relations = [
      { items: MOTHERS, prompt: 'Welches Tierbaby gehört dazu?' },
      { items: HOMES, prompt: 'Wo lebt dieses Tier?' },
      { items: FOODS, prompt: 'Was frisst dieses Tier?' },
    ];
    const relationType = pick(relations);
    const relation = pick(relationType.items);
    const pool = relationType.items.filter((item) => item !== relation && item.answer.emoji !== relation.answer.emoji).map((item) => item.answer);
    return { group: 0, prompt: relationType.prompt, visual: relation.visual, choices: choices({ art: relation.answer.emoji, label: itemName(relation.answer), correct: true }, otherPictures(pool, relation.answer, 3).map((item) => ({ art: item.emoji, label: itemName(item) }))) };
  },
  () => {
    const stories = [
      { sequence: ['🌰', '🌱', '🌿', '🌳'], de: 'Ein Samen wächst.' },
      { sequence: ['🥚', '🐣', '🐥', '🐔'], de: 'Ein Küken schlüpft.' },
      { sequence: ['🧼', '👐', '💧', '✨'], de: 'Hände werden gewaschen.' },
      { sequence: ['🧩', '🧩🧩', '🧩🧩🧩', '🖼️'], de: 'Ein Puzzle wird fertig.' },
    ];
    const story = pick(stories);
    const [first, second, third, answer] = story.sequence;
    const distractors = stories.map((item) => item.sequence[3]).filter((item) => item !== answer);
    return { group: 3, prompt: `Was kommt als Nächstes? ${story.de}`, visual: `${first}  →  ${second}  →  ${third}  →  ?`, choices: choices({ art: answer, correct: true }, sample(distractors, 3).map((art) => ({ art }))) };
  },
  () => {
    const patterns = [
      { items: ['🔴', '🔵'], sequence: [0, 1, 0, 1, 0], answer: 1 },
      { items: ['⭐', '🌙'], sequence: [0, 0, 1, 0, 0], answer: 1 },
      { items: ['🔺', '🟦', '⚪'], sequence: [0, 1, 2, 0, 1], answer: 2 },
    ];
    const pattern = pick(patterns);
    const visible = pattern.sequence.map((index) => pattern.items[index]);
    return { group: 2, prompt: 'Setze das Muster fort!', visual: `${visible.join('  ')}  ?`, choices: shuffle(pattern.items.map((art, index) => ({ art, correct: index === pattern.answer }))) };
  },
  () => {
    const routes = [
      { map: '🚶 ➡️ ⬆️ ➡️ 🏁', answer: '➡️' },
      { map: '🚶 ⬇️ ⬅️ ⬇️ 🏁', answer: '⬅️' },
      { map: '🚶 ⬅️ ⬆️ ⬅️ 🏁', answer: '⬆️' },
      { map: '🚶 ⬆️ ➡️ ⬆️ 🏁', answer: '⬆️' },
    ];
    const route = pick(routes);
    const firstDirection = route.map.split(' ')[1];
    const distractors = ['⬆️', '⬇️', '⬅️', '➡️'].filter((arrow) => arrow !== firstDirection);
    return { group: 1, prompt: 'Folge dem Weg. Welche Richtung kommt zuerst?', visual: route.map, choices: choices({ art: firstDirection, correct: true }, sample(distractors, 3).map((art) => ({ art }))) };
  },
  () => {
    const color = pick(COLORS);
    const correct = pick(color.items);
    const otherItems = COLORS.filter((item) => item !== color).flatMap((item) => item.items);
    return { group: 0, prompt: `Was gehört in den ${color.de} Korb?`, visual: color.basket, choices: choices({ art: correct, correct: true }, sample(otherItems, 3).map((art) => ({ art }))) };
  },
  () => {
    const group = pick(ODD_GROUPS);
    const same = sample([...new Set(group.members)], 3);
    const oddCandidates = ODD_GROUPS.filter((item) => item !== group).flatMap((item) => item.members).filter((item) => !same.includes(item));
    const odd = pick(oddCandidates);
    return { group: 0, prompt: `Was passt nicht zu ${group.de}?`, visual: same.join('  '), choices: shuffle([...same.map((art) => ({ art })), { art: odd, correct: true }]) };
  },
  () => {
    const target = pick(ANIMALS);
    return { group: 0, prompt: 'Welcher Schatten passt zum Bild?', visual: target.emoji, choices: choices({ art: target.emoji, label: itemName(target), correct: true, silhouette: true }, otherPictures(ANIMALS, target, 3).map((item) => ({ art: item.emoji, label: itemName(item), silhouette: true }))) };
  },
  () => {
    const count = 2 + Math.floor(Math.random() * 7);
    const object = pick(NUMBER_OBJECTS);
    return { group: 2, prompt: 'Wie viele Bilder siehst du?', visual: Array.from({ length: count }, () => object).join(' '), choices: numberChoices(count, [-3, -2, 1, 2]) };
  },
  () => {
    const target = pick(MATCH_ITEMS);
    const candidates = sample(MATCH_ITEMS.filter((item) => item !== target), 3);
    return { group: 0, prompt: 'Finde genau dasselbe Bild!', visual: target.emoji, choices: choices({ art: target.emoji, label: itemName(target), correct: true }, candidates.map((item) => ({ art: item.emoji, label: itemName(item) }))) };
  },
  () => {
    const [topLeft, topRight] = sample(['🔴', '🔵', '⭐', '🌙'], 2);
    return { group: 1, prompt: 'Welche Form gehört in die leere Ecke?', visual: `${topLeft}  ${topRight}\n${topRight}  ?`, choices: shuffle([{ art: topLeft, correct: true }, { art: topRight }, ...sample(['🔺', '🟩'], 2).map((art) => ({ art }))]) };
  },
  () => {
    const appleWeight = 2 + Math.floor(Math.random() * 5);
    const bananaWeight = appleWeight + 2;
    return { group: 2, prompt: 'Die Waage ist im Gleichgewicht. Wie viel wiegt die Banane?', visual: `⚖️  🍎 + 🍌 = ${appleWeight + bananaWeight} kg\n🍎 + 🍎 = ${appleWeight * 2} kg`, choices: numberChoices(bananaWeight, [-2, -1, 1, 2]).map((choice) => ({ ...choice, label: `${choice.art} kg` })) };
  },
  () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const step = 1 + Math.floor(Math.random() * 3);
    const start = Math.floor(Math.random() * (letters.length - step * 4));
    const sequence = Array.from({ length: 4 }, (_, index) => letters[start + step * index]);
    const answer = letters[start + step * 4];
    const distractors = [
      letters[start + step * 4 - 1],
      letters[start + step * 4 + 1],
      letters[start + step * 4 - 2],
    ].filter((letter): letter is string => Boolean(letter));
    return { group: 2, prompt: 'Welcher Buchstabe kommt als Nächstes?', visual: `${sequence.join('  ·  ')}  ·  ?`, choices: choices({ art: answer, correct: true }, distractors.map((art) => ({ art }))) };
  },
  () => {
    const pathColors = [
      { de: 'blaue', safe: '🟦', blocked: '🟥' },
      { de: 'grüne', safe: '🟩', blocked: '🟪' },
      { de: 'gelbe', safe: '🟨', blocked: '⬛' },
    ];
    const color = pick(pathColors);
    const validRoutes = [`${color.safe} → ${color.safe} → 🏁`, `${color.safe} → ${color.safe} → ${color.safe} → 🏁`];
    const invalidRoutes = [`${color.safe} → ${color.blocked} → 🏁`, `${color.blocked} → ${color.safe} → 🏁`, `${color.blocked} → ${color.blocked} → 🏁`];
    const answer = pick(validRoutes);
    return { group: 0, prompt: `Gehe nur über ${color.de} Felder. Welcher Weg klappt?`, visual: `${color.safe} = sicher   ${color.blocked} = gesperrt`, choices: choices({ art: answer, correct: true }, sample([...validRoutes.filter((route) => route !== answer), ...invalidRoutes], 3).map((art) => ({ art }))) };
  },
  () => {
    const start = 1 + Math.floor(Math.random() * 9);
    const advance = 1 + Math.floor(Math.random() * 3);
    const answer = ((start - 1 + advance) % 12) + 1;
    const distractors = [((answer + 10) % 12) + 1, (answer % 12) + 1, ((answer + 8) % 12) + 1];
    return { group: 2, prompt: `Es ist ${start} Uhr. Wie spät ist es in ${advance} Stunden?`, visual: `🕒  ${start}:00  →  ?`, choices: choices({ art: `${answer}:00`, correct: true }, distractors.map((art) => ({ art: `${art}:00` }))) };
  },
  () => {
    const pieces = 2 + Math.floor(Math.random() * 5);
    const shape = pick(['🔺', '🟦', '⚪']);
    return { group: 1, prompt: 'Aus wie vielen gleichen Teilen besteht die Form?', visual: `⬜  →  ${Array.from({ length: pieces }, () => shape).join(' ')}`, choices: numberChoices(pieces, [-2, -1, 1, 2]) };
  },
  () => {
    const candidates = [
      { art: '🍓', fruit: true, color: 'red' }, { art: '🍌', fruit: true, color: 'yellow' },
      { art: '🍎', fruit: true, color: 'red' }, { art: '🚗', fruit: false, color: 'red' },
      { art: '🍇', fruit: true, color: 'purple' }, { art: '🍋', fruit: true, color: 'yellow' },
      { art: '🐟', fruit: false, color: 'blue' }, { art: '🍊', fruit: true, color: 'orange' },
    ];
    const color = pick([
      { key: 'red', de: 'rot', emoji: '🔴' },
      { key: 'yellow', de: 'gelb', emoji: '🟡' },
    ]);
    const matches = candidates.filter((item) => item.fruit && item.color === color.key);
    const target = pick(matches);
    const distractors = sample(candidates.filter((item) => !(item.fruit && item.color === color.key)), 3);
    return { group: 0, prompt: `Finde etwas, das eine Frucht UND ${color.de} ist.`, visual: `🍎 ∩ ${color.emoji}`, choices: choices({ art: target.art, correct: true }, distractors.map((item) => ({ art: item.art }))) };
  },
];

function advancedPuzzle(topicId: number): GeneratedLogicPuzzle {
  const group = (topicId - 1) % LOGIC_GROUPS.length;
  switch (topicId) {
    case 21: {
      const [first, middle, last] = sample(['Ari', 'Ben', 'Cem', 'Dia'], 3);
      return textPuzzle( group,  `${first}, ${middle} und ${last} stehen in einer Reihe. ${first} steht vor ${middle}, ${last} nach ${middle}. Wer steht in der Mitte?`,  `${first} → ${middle} → ${last}`,  middle,  [first, last, 'Niemand']);
    }
    case 22: {
      const red = 2 + Math.floor(Math.random() * 5);
      const blue = 1 + Math.floor(Math.random() * 4);
      const total = red + blue;
      return textPuzzle( group,  `In einer Tüte liegen ${red} rote und ${blue} blaue Kugeln. Wie groß ist die Chance auf Rot?`,  `🔴 × ${red}　🔵 × ${blue}`,  `${red}/${total}`,  [`${blue}/${total}`, `1/${total}`, `${red}/${total + 1}`]);
    }
    case 23: {
      const [a, b] = sample(['Ari', 'Ben', 'Cem', 'Dia'], 2);
      return textPuzzle( group,  `Genau eine Person sagt immer die Wahrheit. ${a} sagt: „${b} lügt.“ ${b} sagt: „Wir sind verschieden.“ Wer sagt die Wahrheit?`,  `${a}: ${b} lügt\n${b}: Wir sind verschieden`,  b,  [a, 'Beide', 'Niemand']);
    }
    case 24: {
      const shirts = 2 + Math.floor(Math.random() * 5);
      const hats = 2 + Math.floor(Math.random() * 4);
      const answer = shirts * hats;
      const wrong = numberChoices(answer).filter((choice) => !choice.correct).map((choice) => choice.art);
      return textPuzzle( group,  `Du hast ${shirts} Hemden und ${hats} Hüte. Wie viele Outfits kannst du bilden?`,  `${shirts} × ${hats} = ?`,  String(answer),  wrong);
    }
    case 25: {
      const people = sample(['Ava', 'Ben', 'Cara', 'Duc'], 3);
      const pets = sample(['🐱', '🐶', '🐦', '🐰'], 3);
      return textPuzzle( group,  'Jede Person hat ein anderes Tier. Welches Tier fehlt?',  `${people[0]} ${pets[0]}\n${people[1]} ${pets[1]}\n${people[2]} ?`,  pets[2],  pets.filter((pet) => pet !== pets[2]).slice(0, 3));
    }
    case 26: {
      const [a, b, c, d, e, f] = sample(['A', 'B', 'C', 'D', 'E', 'F'], 6);
      return textPuzzle( group,  `Welches Feld liegt im Würfelnetz gegenüber von ${b}?`,  `　${e}\n${a} ${b} ${c} ${d}\n　${f}`,  d,  [a, c, e]);
    }
    case 27: {
      const ladders = [
        { start: 'COLD', next: 'CORD', wrong: ['CARD', 'WARM', 'COLD'] },
        { start: 'HAND', next: 'HARD', wrong: ['CARD', 'HARE', 'BEND'] },
        { start: 'HEAD', next: 'HEAL', wrong: ['DEAL', 'HEART', 'HAND'] },
      ];
      const ladder = pick(ladders);
      return textPuzzle( group,  `Ändere genau einen Buchstaben. Welches Wort kann ein Schritt von ${ladder.start} sein?`,  `${ladder.start} → ?`,  ladder.next,  ladder.wrong);
    }
    case 28: {
      const rebuses = [
        { visual: 'STAND\n　I', answer: 'UNDERSTAND', wrong: ['OUTSTAND', 'STANDING', 'INSIDE'] },
        { visual: 'MAN\n↑\nBOARD', answer: 'MAN OVERBOARD', wrong: ['BOARDMAN', 'MAN ABOARD', 'OVERMAN'] },
        { visual: 'HEAD\n↑\nHEELS', answer: 'HEAD OVER HEELS', wrong: ['HEELHEAD', 'HEAD TO TOE', 'OVERHEAD'] },
      ];
      const rebus = pick(rebuses);
      return textPuzzle( group,  'Lies das Bilderrätsel: Was bedeutet die Anordnung?',  rebus.visual,  rebus.answer,  rebus.wrong);
    }
    case 29:
    case 33: {
      const symbols = sample(topicId === 29 ? ['1', '2', '3'] : ['🔺', '⚪', '🟦'], 3);
      const rows = Array.from({ length: 3 }, (_, row) => Array.from({ length: 3 }, (_, col) => symbols[(row + col) % 3]));
      const blank = Math.floor(Math.random() * 9);
      const answer = rows[Math.floor(blank / 3)][blank % 3];
      rows[Math.floor(blank / 3)][blank % 3] = '?';
      const visual = rows.map((row) => row.join(' ')).join('\n');
      return textPuzzle( group,  'Jede Zeile und Spalte braucht jedes Zeichen genau einmal. Was fehlt?',  visual,  answer,  symbols.filter((symbol) => symbol !== answer).concat(topicId === 29 ? '4' : '⭐').slice(0, 3));
    }
    case 30: {
      const words = ['CAT', 'BAT', 'RAT', 'HAT'];
      const answer = pick(words);
      return textPuzzle( group,  `Ein Kreuzwort hat das Muster _AT. Die Kreuzung gibt den ersten Buchstaben ${answer[0]}. Welches Wort passt?`,  `${answer[0]} _ T`,  answer,  words.filter((word) => word !== answer));
    }
    case 31: {
      const words = [
        { letters: 'T A C', hint: 'beginnt mit C und endet mit T', answer: 'CAT', wrong: ['ACT', 'TAC', 'CTA'] },
        { letters: 'G O D', hint: 'beginnt mit D und endet mit G', answer: 'DOG', wrong: ['GOD', 'ODG', 'DGO'] },
        { letters: 'R A E', hint: 'beginnt mit E und endet mit R', answer: 'EAR', wrong: ['ARE', 'ERA', 'RAE'] },
      ];
      const item = pick(words);
      return textPuzzle( group,  `Ordne die Buchstaben. Das Wort ${item.hint}.`,  item.letters,  item.answer,  item.wrong);
    }
    case 32: {
      const cells = sample(['🍎', '🔑', '⭐', '🐟'], 4);
      const blank = Math.floor(Math.random() * 4);
      const answer = cells[blank];
      const shown = [...cells];
      shown[blank] = '?';
      const target = ['A1', 'B1', 'A2', 'B2'][blank];
      return textPuzzle( group,  `Im Gitter bedeutet der Buchstabe die Spalte und die Zahl die Zeile. Was steht bei ${target}?`,  `　A　B\n1 ${shown[0]} ${shown[1]}\n2 ${shown[2]} ${shown[3]}`,  answer,  cells.filter((cell) => cell !== answer));
    }
    case 34: {
      const crossing = pick([
        { items: ['🦊', '🐐', '🥬'], answer: '🐐' },
        { items: ['🐺', '🐑', '🌿'], answer: '🐑' },
        { items: ['🐈', '🐦', '🌾'], answer: '🐦' },
      ]);
      return textPuzzle( group,  'Der Fährmann kann immer nur eines mitnehmen. Was muss zuerst ans andere Ufer?',  crossing.items.join('　') + '　⛵',  crossing.answer,  crossing.items.filter((item) => item !== crossing.answer));
    }
    case 35: {
      const people = sample(['Ava', 'Ben', 'Cara', 'Duc'], 3);
      const pets = sample(['Katze', 'Hund', 'Vogel'], 3);
      return textPuzzle( group,  `${people[0]}, ${people[1]} und ${people[2]} haben je ein anderes Tier. ${people[0]} hat ${pets[0]}, ${people[1]} hat ${pets[1]}. Wer hat ${pets[2]}?`,  `${people.join(' · ')}`,  people[2],  people.slice(0, 2));
    }
    case 36: {
      const categories = pick([
        { de: ['Tiger', 'Katzen', 'Tiere'] },
        { de: ['Rosen', 'Blumen', 'Pflanzen'] },
        { de: ['Dackel', 'Hunde', 'Tiere'] },
      ]);
      const [subset, superset, member] =  categories.de ;
      return textPuzzle( group,  `Alle ${categories.de[0]} sind ${categories.de[1]}. Alle ${categories.de[1]} sind ${categories.de[2]}. Sind alle ${categories.de[0]} ${categories.de[2]}?`,  `${subset} → ${superset} → ${member}`,  '✅ Ja',  ['❌ Nein', 'Manchmal', 'Nicht bestimmbar']);
    }
    case 37: {
      const pairs = [
        { left: '🔑 : 🔒', relation: 'Schlüssel öffnet Schloss. Passwort öffnet …?', answer: '👤', wrong: ['🔑', '🚪', '⌨️'] },
        { left: '✏️ : Papier', relation: 'Stift schreibt auf Papier. Pinsel malt auf …?', answer: '🖼️', wrong: ['✏️', '🎨', '🧽'] },
        { left: '🐝 : Honig', relation: 'Biene macht Honig. Kuh gibt …?', answer: '🥛', wrong: ['🧶', '🥚', '🥜'] },
      ];
      const pair = pick(pairs);
      return textPuzzle( group,  pair.relation,  `${pair.left} = ?`,  pair.answer,  pair.wrong);
    }
    case 38: {
      const [a, b, c, d] = sample(['A', 'B', 'C', 'D', 'E', 'F'], 4);
      return textPuzzle( group,  `Finde einen Weg von ${a} nach ${d}, ohne einen Knoten zweimal zu besuchen.`,  `${a}—${b}—${d}\n${a}—${c}—${d}`,  `${a} → ${b} → ${d}`,  [`${a} → ${b} → ${a} → ${d}`, `${a} → ${c} → ${b} → ${d}`, `${a} → ${a} → ${d}`]);
    }
    case 39: {
      const maxTake = 2 + Math.floor(Math.random() * 3);
      const answer = 1 + Math.floor(Math.random() * maxTake);
      const pile = (maxTake + 1) * (2 + Math.floor(Math.random() * 3)) + answer;
      return textPuzzle( group,  `Es liegen ${pile} Streichhölzer. Nimm 1 bis ${maxTake}; wer das letzte nimmt, gewinnt. Was ist der beste erste Zug?`,  `🔥 × ${pile} · pro Zug 1–${maxTake}`,  String(answer),  sample(Array.from({ length: maxTake + 3 }, (_, index) => String(index + 1)).filter((value) => value !== String(answer)), 3));
    }
    case 40: {
      const start = 1 + Math.floor(Math.random() * 5);
      const left = [start, start + 1, start + 2, start + 4];
      const right = [start + 1, start + 2, start + 3, start + 5];
      const answer = `{${left.filter((value) => right.includes(value)).join(', ')}}`;
      return textPuzzle( group,  'Welche Zahlen liegen in beiden Mengen?',  `{${left.join(', ')}} ∩ {${right.join(', ')}}`,  answer,  [`{${left[0]}}`, `{${left[0]}, ${right[3]}}`, `{${left.join(', ')}, ${right[3]}}`]);
    }
    case 41: {
      const original = 2 + Math.floor(Math.random() * 9);
      const multiplier = 2 + Math.floor(Math.random() * 3);
      const added = 1 + Math.floor(Math.random() * 8);
      const result = original * multiplier + added;
      return textPuzzle( group,  `Arbeite rückwärts: Eine Zahl wird mit ${multiplier} multipliziert und dann um ${added} erhöht. Das Ergebnis ist ${result}. Welche Zahl war es?`,  `□ × ${multiplier} + ${added} = ${result}`,  String(original),  numberChoices(original).filter((choice) => !choice.correct).map((choice) => choice.art));
    }
    case 42: {
      const coins = 5 + Math.floor(Math.random() * 7);
      const initialHeads = Math.floor(Math.random() * (coins + 1));
      return textPuzzle( group,  `Du drehst immer genau 2 von ${coins} Münzen um. Start: ${initialHeads} zeigen Kopf. Was bleibt immer gleich?`,  `🪙 × ${coins} · Start: ${initialHeads} Kopf`,  initialHeads % 2 === 0 ? 'Gerade Kopfzahl' : 'Ungerade Kopfzahl',  [initialHeads % 2 === 0 ? 'Ungerade Kopfzahl' : 'Gerade Kopfzahl', 'Alle zeigen Kopf', 'Keine zeigt Kopf']);
    }
    case 43: {
      const first = 30 + Math.floor(Math.random() * 51);
      const second = 30 + Math.floor(Math.random() * Math.max(1, 151 - first - 30));
      const answer = 180 - first - second;
      return textPuzzle( group,  `Zwei Winkel eines Dreiecks sind ${first}° und ${second}°. Wie groß ist der dritte?`,  `${first}° + ${second}° + ? = 180°`,  `${answer}°`,  [`${answer + 10}°`, `${answer - 10}°`, `${first}°`]);
    }
    case 44: {
      const budget = 8 + Math.floor(Math.random() * 9);
      const count = Math.floor(budget / 2);
      const answer = count * 3;
      const useOther = Math.floor(budget / 5) * 5;
      return textPuzzle( group,  `Du hast ${budget} Münzen. Rote Kisten kosten 2 und bringen 3 Punkte; blaue kosten 5 und bringen 5. Wie hoch ist der beste Gewinn?`,  `Budget ${budget} · Rot 2→3 · Blau 5→5`,  String(Math.max(answer, useOther)),  [String(answer - 1), String(answer + 1), String(useOther + 1)]);
    }
    case 45: {
      const [fruitA, fruitB] = sample([
        { de: 'Äpfel', art: '🍎' }, { de: 'Birnen', art: '🍐' },
        { de: 'Kirschen', art: '🍒' }, { de: 'Pflaumen', art: '🫐' },
      ], 2);
      return textPuzzle( group,  `Alle Kisten sind falsch beschriftet: ${fruitA.de}, ${fruitB.de}, Gemischt. Aus welcher Kiste ziehst du zuerst?`,  `${fruitA.art}　${fruitB.art}　📦🌈\nAlle Etiketten falsch`,  'Gemischt',  [fruitA.de, fruitB.de, 'Beliebige Kiste']);
    }
    case 46: {
      const [first, second, third] = sample(['Mira', 'Leo', 'Tom', 'Nia', 'Kai'], 3);
      return textPuzzle( group,  `${first} läuft vor ${second}. ${second} läuft vor ${third}. Wer ist zuerst im Ziel?`,  `${first} > ${second} > ${third}`,  first,  [second, third, 'Nicht bestimmbar']);
    }
    case 47: {
      const areaA = 6 + Math.floor(Math.random() * 15);
      const areaB = 5 + Math.floor(Math.random() * 14);
      const overlap = 1 + Math.floor(Math.random() * Math.min(areaA, areaB) / 2);
      const answer = areaA + areaB - overlap;
      return textPuzzle( group,  `Rechteck A hat ${areaA} cm², B hat ${areaB} cm². Ihre gemeinsame Fläche ist ${overlap} cm². Wie groß ist die Gesamtfläche?`,  `${areaA} + ${areaB} − ${overlap} = ?`,  `${answer} cm²`,  [`${areaA + areaB} cm²`, `${answer + overlap} cm²`, `${Math.abs(areaA - areaB)} cm²`]);
    }
    case 48: {
      const start = 1 + Math.floor(Math.random() * 8);
      return textPuzzle( group,  'Finde das Muster in Zeilen und Spalten. Welche Zahl fehlt?',  `${start} ${start + 1} ${start + 2}\n${start + 1} ${start + 2} ${start + 3}\n${start + 2} ${start + 3} ?`,  String(start + 4),  [String(start + 3), String(start + 5), String(start + 6)]);
    }
    case 49: {
      const [a, b, c] = sample(['Ari', 'Ben', 'Cem', 'Dia'], 3);
      return textPuzzle( group,  `${a}, ${b} und ${c} sind Wahrheitssager, Lügner und Joker. ${a}: „${b} ist Joker.“ ${b}: „${c} ist Lügner.“ ${c}: „${a} sagt die Wahrheit.“ Wer ist wer?`,  'Joker darf wahr oder falsch sprechen',  `${a}=Joker, ${b}=Wahr, ${c}=Lügner`,  [`${a}=Wahr, ${b}=Lügner, ${c}=Joker`, `${a}=Lügner, ${b}=Joker, ${c}=Wahr`, `${a}=Wahr, ${b}=Joker, ${c}=Lügner`]);
    }
    case 50: {
      const small = 2 + Math.floor(Math.random() * 4);
      const large = small + 1 + Math.floor(Math.random() * 5);
      const answer = large - small;
      return textPuzzle( group,  `Du hast einen ${large}-L- und einen ${small}-L-Krug. Fülle den großen und gieße den kleinen ganz voll. Wie viel bleibt im großen Krug?`,  `${large} L − ${small} L = ?`,  `${answer} L`,  [`${small} L`, `${large} L`, `${answer + 1} L`]);
    }
    case 51: {
      const prime = pick([2, 3, 5, 7]);
      const answer = prime * prime;
      return textPuzzle( group,  `Welche Zahl kleiner als 50 hat genau drei positive Teiler und ist durch ${prime} teilbar?`,  `Teiler: 1 · ? · ${answer}`,  String(answer),  [String(prime), String(answer + 1), String(answer + prime)]);
    }
    case 52: {
      const length = 5 + Math.floor(Math.random() * 11);
      const width = 3 + Math.floor(Math.random() * 8);
      const answer = 2 * (length + width);
      return textPuzzle( group,  `Ein Rechteck ist ${length} cm lang und ${width} cm breit. Wie groß ist sein Umfang?`,  `${length} + ${width} + ${length} + ${width}`,  `${answer} cm`,  [`${length * width} cm`, `${length + width} cm`, `${answer + 2} cm`]);
    }
    case 53: {
      const colors = 2 + Math.floor(Math.random() * 6);
      return textPuzzle( group,  `Im Dunkeln liegen Socken in ${colors} Farben. Wie viele musst du mindestens nehmen, um ein gleichfarbiges Paar sicher zu haben?`,  `${colors} Farben · Paar gesucht`,  String(colors + 1),  [String(colors), String(colors + 2), String(colors * 2)]);
    }
    case 54: {
      const lighter = 3 + Math.floor(Math.random() * 8);
      const heavier = lighter + 2 + Math.floor(Math.random() * 8);
      return textPuzzle( group,  `Zwei Gewichte wiegen zusammen ${lighter + heavier} kg. Das leichtere wiegt ${lighter} kg. Wie schwer ist das andere?`,  `A + B = ${lighter + heavier}\nA = ${lighter}`,  `${heavier} kg`,  [`${heavier - 1} kg`, `${lighter} kg`, `${heavier + 2} kg`]);
    }
    case 55: {
      const doors = 3 + Math.floor(Math.random() * 4);
      return textPuzzle( group,  `Bei ${doors} Türen öffnet der Moderator alle falschen Türen bis auf eine. Wie hoch ist die Gewinnchance beim Wechseln?`,  `🚪 × ${doors} · Wechseln`,  `${doors - 1}/${doors}`,  [`1/${doors}`, `1/2`, `${doors}/${doors}`]);
    }
    case 56: {
      const rules = [
        { de: 'Rot: links', color: '🔴', answer: '⬅️ Links', wrong: ['➡️ Rechts', '⬆️ Geradeaus', '⬇️ Zurück'] },
        { de: 'Blau: rechts', color: '🔵', answer: '➡️ Rechts', wrong: ['⬅️ Links', '⬆️ Geradeaus', '⬇️ Zurück'] },
        { de: 'Gelb: umdrehen', color: '🟡', answer: '⬇️ Zurück', wrong: ['⬅️ Links', '➡️ Rechts', '⬆️ Geradeaus'] },
      ];
      const rule = pick(rules);
      const directions = ['⬅️', '➡️', '⬆️', '⬇️'];
      const directionNames =  ['Links', 'Rechts', 'Geradeaus', 'Zurück'] ;
      const answerIndex = rule.answer.startsWith('⬅️') ? 0 : rule.answer.startsWith('➡️') ? 1 : rule.answer.startsWith('⬆️') ? 2 : 3;
      const options = directions.map((arrow, index) => `${arrow} ${directionNames[index]}`);
      return textPuzzle( group,  `Im Labyrinth gilt die Regel „${rule.de}“. Du erreichst das Feld. Wohin gehst du?`,  `START → ${rule.color} → ?`,  options[answerIndex],  options.filter((_, index) => index !== answerIndex));
    }
    case 57: {
      const clue = Math.random() < 0.5 ? 0 : 4;
      const answer = clue === 0 ? 0 : 4;
      return textPuzzle( group,  `Bei Slitherlink zeigt eine Zelle ${clue}. Wie viele Linien müssen ihre Zellkanten berühren?`,  `┌───┐\n│ ${clue} │\n└───┘`,  String(answer),  clue === 0 ? ['1', '2', '4'] : ['0', '2', '3']);
    }
    case 58: {
      const clue = 1 + Math.floor(Math.random() * 4);
      const known = clue - 1;
      return textPuzzle( group,  `Eine Minesweeper-Zahl ${clue} berührt genau ${clue} Minen. ${known} angrenzende Minen sind bereits markiert. Ist das letzte Feld sicher?`,  `💣 × ${known}　?　[${clue}]`,  '💣 Mine',  ['✅ Sicher', 'Immer sicher', 'Nicht angrenzend']);
    }
    case 59: {
      const units = 8 + 4 * Math.floor(Math.random() * 5);
      const pieceSize = 4;
      return textPuzzle( group,  `Ein Feld aus ${units} Einheitsquadraten wird mit Teilen aus je ${pieceSize} Quadraten gefüllt. Wie viele Teile brauchst du?`,  `${units} ÷ ${pieceSize} = ?`,  String(units / pieceSize),  [String(units / pieceSize - 1), String(units / pieceSize + 1), String(units)]);
    }
    case 60: {
      const first = 1 + Math.floor(Math.random() * 7);
      const second = 1 + Math.floor(Math.random() * 7);
      return textPuzzle( group,  `Zwei getrennte Wege haben Engpässe von ${first} und ${second} Einheiten. Wie viel kann insgesamt fließen?`,  `Quelle → (${first}) + (${second}) → Ziel`,  String(first + second),  [String(Math.max(first, second)), String(Math.min(first, second)), String(first + second + 1)]);
    }
    case 61: {
      const [a, b] = sample(['A', 'B', 'C', 'D'], 2);
      return textPuzzle( group,  `Eine Maschine fällt aus, wenn Pumpe ${a} ODER ${b} ausfällt. ${a} arbeitet. Welche Pumpe erklärt den Ausfall?`,  `Ausfall = ${a} defekt ODER ${b} defekt\n${a} ist OK`,  `Pumpe ${b}`,  [`Pumpe ${a}`, 'Beide müssen kaputt sein', 'Keine']);
    }
    case 62: {
      const regions = 3 + Math.floor(Math.random() * 2);
      return textPuzzle( group,  `${regions} Regionen grenzen alle aneinander. Wie viele Farben brauchst du mindestens, damit Nachbarn verschieden sind?`,  `Knoten: ${regions} · benachbarte Paare: alle`,  String(regions),  regions === 3 ? ['2', '4', '5'] : ['3', '5', '6']);
    }
    case 63: {
      const a = 5 + Math.floor(Math.random() * 4);
      const c = 2 * a - 10;
      return textPuzzle( group,  `Jeder Buchstabe ist eine andere Ziffer. A liegt zwischen 5 und 8. C=${c}. Löse A + A = BC.`,  `A + A = BC\nC = ${c}`,  `A=${a}, B=1, C=${c}`,  [`A=${a - 1}, B=1`, `A=${a}, B=2`, `A=${a + 1}, B=1`]);
    }
    case 64: {
      const [x, y, z] = sample(['p', 'q', 'r', 's'], 3);
      return textPuzzle( group,  `Es gilt ${x} < ${z} und ${z} < ${y}. Welche Reihenfolge stimmt?`,  `${x} < ${z}　und　${z} < ${y}`,  `${x} < ${z} < ${y}`,  [`${z} < ${x} < ${y}`, `${y} < ${z} < ${x}`, `${x} < ${y} < ${z}`]);
    }
    case 65: {
      const directions =  ['⬆️ Norden', '➡️ Osten', '⬇️ Süden', '⬅️ Westen']
        ;
      const start = Math.floor(Math.random() * 4);
      const turns = 1 + Math.floor(Math.random() * 3);
      const answer = directions[(start + turns) % 4];
      return textPuzzle( group,   `Ein Pfeil zeigt ${directions[start].split(' ')[1]}. Drehe ihn ${turns}-mal um 90° nach rechts. Wohin zeigt er?`
        ,
      `${directions[start].split(' ')[0]} × ${turns} ${'Rechtsdrehungen'}`,  answer,  directions.filter((direction) => direction !== answer));
    }
    case 66: {
      const switches = sample(['A', 'B', 'C'], 3);
      return textPuzzle( group,  'Drei Schalter steuern drei Lampen im Nebenraum. Du darfst den Raum nur einmal betreten. Welche Methode findet alle Zuordnungen?',  `Schalter ${switches.join(' · ')} → 💡 💡 💡`,  `${switches[0]} einschalten, warten, aus; ${switches[1]} einschalten; dann Licht und Wärme prüfen`,  ['Alle gleichzeitig einschalten', 'Jeden Schalter einmal drücken', 'Nur Schalter C einschalten']);
    }
    case 67: {
      const base = 2 + Math.floor(Math.random() * 5);
      const modulus = 5 + Math.floor(Math.random() * 5);
      const exponent = 40 + Math.floor(Math.random() * 61);
      const answer = modularPower(base, exponent, modulus);
      const wrongs = sample(Array.from({ length: modulus }, (_, value) => String(value)).filter((value) => value !== String(answer)), 3);
      return textPuzzle( group,  `Berechne den Rest von ${base}^${exponent}, geteilt durch ${modulus}.`,  `${base}^${exponent} mod ${modulus} = ?`,  String(answer),  wrongs);
    }
    case 68: {
      const people = 13 + Math.floor(Math.random() * 19);
      const guaranteed = Math.floor((people - 1) / 12) + 1;
      return textPuzzle( group,  `Bei ${people} Personen: Wie viele müssen mindestens im selben Geburtsmonat geboren sein?`,  '12 Geburtsmonate',  String(guaranteed),  [String(guaranteed + 1), String(guaranteed + 2), String(guaranteed - 1)]);
    }
    case 69: {
      const reward = 2 + Math.floor(Math.random() * 4);
      const temptation = reward + 2 + Math.floor(Math.random() * 4);
      return textPuzzle( group,  `Beim Gefangenendilemma bringt Kooperation ${reward} Punkte. Verrat bringt dir ${temptation}, wenn die andere Person kooperiert. Was ist dann deine beste Antwort?`,  `Beide kooperieren: ${reward} · Du verrätst, andere kooperiert: ${temptation}`,  'Verraten',  ['Kooperieren', 'Zufällig wählen', 'Aufgeben']);
    }
    case 70: {
      const values = [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5];
      const answer = values[0] && (values[1] || !values[2]);
      const display = values.map((value, index) => `${'ABC'[index]}=${value ? '1' : '0'}`).join(' · ');
      return textPuzzle( group,  'Werte den verschachtelten Wahrheitsausdruck aus.',  `${display}\nA ∧ (B ∨ ¬C)`,  answer ? '✅ 1' : '❌ 0',  [answer ? '❌ 0' : '✅ 1', 'Beides', 'Unbekannt']);
    }
    case 71: {
      const paradox = pick([
        { de: 'Der Satz sagt: „Dieser Satz ist falsch.“', visual: 'S ↔ nicht S' },
        { de: 'Ein Barbier rasiert alle, die sich nicht selbst rasieren. Wen rasiert er?', visual: 'Barbier: rasiert alle, die sich nicht selbst rasieren' },
      ]);
      return textPuzzle( group,  `${paradox.de} Welche Lösung ist möglich?`,  paradox.visual,  'Keine widerspruchsfreie Lösung',  ['Immer wahr', 'Immer falsch', 'Beide Fälle zugleich']);
    }
    case 72: {
      const states = 3 + Math.floor(Math.random() * 8);
      return textPuzzle( group,  `Ein deterministischer Prozess hat ${states} mögliche Zustände und läuft ${states + 1}-mal. Was muss passieren?`,  `${states} Zustände · ${states + 1} Schritte`,  'Ein Zustand wiederholt sich',  ['Alle Zustände sind neu', 'Der Prozess endet sofort', 'Es gibt unendlich viele Zustände']);
    }
    case 73: {
      const side = 2 + Math.floor(Math.random() * 4);
      const answer = chooseCount(side * 2, side);
      return textPuzzle( group,  `Auf einem ${side}×${side}-Gitter darfst du nur nach rechts oder unten gehen. Wie viele kürzeste Wege gibt es?`,  `↘ ${side} Schritte rechts + ${side} Schritte unten`,  String(answer),  [String(answer - 1), String(answer + 1), String(side * side)]);
    }
    case 74: {
      const colors = sample([
        { de: 'Rot', art: '🔴' }, { de: 'Blau', art: '🔵' },
        { de: 'Grün', art: '🟢' }, { de: 'Gelb', art: '🟡' },
      ], 3);
      return textPuzzle( group,  `Mira weiß: Die Karte ist nicht ${colors[0].de}. Lio kennt nur ${colors[0].de} oder ${colors[1].de}. Lio hört Mira. Welche Farbe bleibt?`,  `Mira: nicht ${colors[0].art}\nLio: ${colors[0].art} oder ${colors[1].art}`,  colors[1].art,  [colors[0].art, colors[2].art, '❔']);
    }
    case 75: {
      const payoff = 2 + Math.floor(Math.random() * 8);
      return textPuzzle( group,  `Bei „Kopf oder Zahl“ gewinnt eine Person ${payoff} Punkte, wenn die Münzen gleich sind; sonst gewinnt die andere. Welche Strategie schützt dich am besten?`,  'Gegner wählt Kopf oder Zahl',  '50/50 zufällig mischen',  ['Immer Kopf', 'Immer Zahl', 'Vorherige Wahl kopieren']);
    }
    case 76: {
      const redInA = 1;
      const totalA = 2 + Math.floor(Math.random() * 4);
      const redInB = 2 + Math.floor(Math.random() * 4);
      const totalB = redInB;
      const answer = (redInB / totalB) / ((redInA / totalA) + (redInB / totalB));
      return textPuzzle( group,  'Du wählst zufällig einen Beutel und ziehst Rot. Wie wahrscheinlich ist Beutel B?',  `A: ${redInA}/${totalA} rot · B: ${redInB}/${totalB} rot · gleiche Chance`,  `${Math.round(answer * 100)}%`,  [`${Math.round((1 - answer) * 100)}%`, '50%', '100%']);
    }
    case 77: {
      const length = 2 + Math.floor(Math.random() * 4);
      const width = 2 + Math.floor(Math.random() * 4);
      const height = 2 + Math.floor(Math.random() * 4);
      const volume = length * width * height;
      return textPuzzle( group,  `Ein Quader ist ${length}×${width}×${height} Einheiten groß. Wie viele Einheitswürfel füllen ihn?`,  `${length} × ${width} × ${height}`,  String(volume),  [String(volume - 1), String(volume + 1), String(length + width + height)]);
    }
    case 78: {
      const start = 1 + Math.floor(Math.random() * 8);
      const step = 2 + Math.floor(Math.random() * 6);
      return textPuzzle( group,  'Finde eine Regel, die für alle Schritte passt. Welche Zahl folgt?',  `${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, ?`,  String(start + 4 * step),  [String(start + 3 * step), String(start + 4 * step + 1), String(start + 5 * step)]);
    }
    case 79: {
      const prevalence = 1 + Math.floor(Math.random() * 5);
      const sensitivity = 85 + Math.floor(Math.random() * 15);
      const falsePositive = 2 + Math.floor(Math.random() * 9);
      const positiveCases = prevalence * sensitivity;
      const negatives = (100 - prevalence) * falsePositive;
      const posterior = Math.round(100 * positiveCases / (positiveCases + negatives));
      return textPuzzle( group,  `Eine Krankheit betrifft ${prevalence}% der Menschen. Test: ${sensitivity}% Treffer, ${falsePositive}% falsche Positive. Wie hoch ist die Krankheitschance nach positivem Test?`,  `Bayes: ${prevalence}% · ${sensitivity}% · ${falsePositive}%`,  `${posterior}%`,  [`${Math.max(1, posterior - 10)}%`, `${Math.min(99, posterior + 15)}%`, `${prevalence}%`]);
    }
    case 80: {
      const a = 2 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * (a - 1));
      const c = 2 + Math.floor(Math.random() * 6);
      const d = 1 + Math.floor(Math.random() * (c - 1));
      const flow = Math.min(a, b) + Math.min(c, d);
      return textPuzzle( group,  'Zwei unabhängige Wege verbinden Quelle und Ziel. Wie groß ist der maximale Fluss?',  `Quelle → ${a} → ${b} → Ziel\nQuelle → ${c} → ${d} → Ziel`,  String(flow),  [String(Math.max(a, b) + Math.max(c, d)), String(Math.min(a, b, c, d)), String(flow + 1)]);
    }
    case 81: {
      const value = Math.random() < 0.5 ? 'P' : 'Q';
      return textPuzzle( group,  'Vereinfache den Booleschen Ausdruck mit einer Regel.',  `${value} AND (${value === 'P' ? 'Q' : 'P'} OR NOT ${value === 'P' ? 'Q' : 'P'})`,  value,  [`NOT ${value}`, `${value} OR ${value === 'P' ? 'Q' : 'P'}`, '0']);
    }
    case 82: {
      const nodes = 4 + Math.floor(Math.random() * 10);
      return textPuzzle( group,  `Wie viele Kanten hat ein zusammenhängender Baum mit ${nodes} Knoten?`,  `${nodes} Knoten · Baum`,  String(nodes - 1),  [String(nodes), String(nodes + 1), String(nodes - 2)]);
    }
    case 83: {
      const take = 1 + Math.floor(Math.random() * 3);
      const pile = 4 * (1 + Math.floor(Math.random() * 3)) + take;
      return textPuzzle( group,  `Beim Nim-Spiel darfst du 1, 2 oder 3 Steine nehmen. Es liegen ${pile} Steine. Was ist der Gewinnzug?`,  `🪨 × ${pile} · Ziel: Gegner lässt ein Vielfaches von 4`,  String(take),  ['1', '2', '3'].filter((value) => value !== String(take)).concat('4').slice(0, 3));
    }
    case 84: {
      const bits: number[] = Array.from({ length: 5 }, () => Math.random() < 0.5 ? 0 : 1);
      if (bits.reduce((sum, bit) => sum + bit, 0) % 2 === 0) bits[0] = 1 - bits[0];
      return textPuzzle( group,  'Ergänze ein Bit, damit die Gesamtzahl der Einsen gerade ist.',  bits.join(''),  '1',  ['0', '2', 'Keine']);
    }
    case 85: {
      const index = 5 + Math.floor(Math.random() * 20);
      return textPuzzle( group,  `Eine Liste enthält ${index} Binärfolgen. Wie baut man sicher eine Folge, die nicht an Position ${index} der ${index}. Listenfolge steht?`,  `Neue Folge: ändere Bit ${index} der Folge ${index}`,  'Konstruiere sie diagonal',  ['Kopiere die erste Folge', 'Sortiere alphabetisch', 'Wähle nur Nullen']);
    }
    case 86: {
      const colors = sample(['🔴', '🔵', '🟢', '🟡'], 3);
      return textPuzzle( group,  `Der Code ist eine Farbe aus ${colors.join(' ')}. Mira weiß: nicht ${colors[0]}. Lio weiß nur, dass ${colors[0]} oder ${colors[1]} möglich ist. Nach Miras Hinweis: Welche Farbe bleibt?`,  `Mira: nicht ${colors[0]}\nLio: ${colors[0]} oder ${colors[1]}`,  colors[1],  [colors[0], colors[2], 'Nicht bestimmbar']);
    }
    case 87: {
      const safe = 1 + Math.floor(Math.random() * 4);
      const riskyBest = safe + 1 + Math.floor(Math.random() * 5);
      const riskyWorst = safe + 5 + Math.floor(Math.random() * 6);
      return textPuzzle( group,  'Wähle den Zug, der selbst gegen die beste Antwort des Gegners den kleinsten Verlust hat.',  `Sicher: Verlust ${safe}\nRiskant: Verlust ${riskyBest} oder ${riskyWorst}`,  'Sicher',  ['Riskant', 'Zufällig', 'Immer angreifen']);
    }
    case 88: {
      const puzzles = [
        { de: 'Ein Mann schiebt sein Auto zu einem Hotel und verliert sein ganzes Geld. Was spielt er?', visual: '🚗 → 🏨 → 💸', answerDe: 'Monopoly', wrongDe: ['Schach', 'Fußball', 'Reise nach Hause'] },
        { de: 'Ein elektrischer Zug fährt nach Norden. Wohin weht der Rauch?', visual: '🚆⚡ → Norden', answerDe: 'Kein Rauch', wrongDe: ['Norden', 'Süden', 'Osten'] },
        { de: 'Was wird größer, je mehr man davon wegnimmt?', visual: '🕳️', answerDe: 'Ein Loch', wrongDe: ['Ein Berg', 'Ein Ball', 'Ein Baum'] },
      ];
      const puzzle = pick(puzzles);
      return textPuzzle( group,  puzzle.de,  puzzle.visual,  puzzle.answerDe,   puzzle.wrongDe );
    }
    case 89: {
      const mutual = 2 + Math.floor(Math.random() * 4);
      const temptation = mutual + 2 + Math.floor(Math.random() * 4);
      return textPuzzle( group,  `Auszahlungen: beide kooperieren ${mutual}/${mutual}; allein verraten ${temptation}/0; beide verraten 1/1. Was ist für dich unabhängig vom anderen die dominante Strategie?`,  `Koop/Koop: ${mutual}/${mutual} · Verrat/Koop: ${temptation}/0 · Koop/Verrat: 0/${temptation} · Verrat/Verrat: 1/1`,  'Verraten',  ['Kooperieren', 'Münze werfen', 'Keine Strategie']);
    }
    case 90: {
      const names = sample(['Ari', 'Ben', 'Cem', 'Dia'], 3);
      return textPuzzle( group,  `${names[0]} sagt: „${names[1]} lügt.“ ${names[1]} sagt: „${names[2]} lügt.“ ${names[2]} sagt: „${names[0]} lügt.“ Jeder ist Ritter (wahr) oder Schurke (lügt). Was folgt?`,  'Aussagen bilden einen Kreis mit 3 Widersprüchen',  'Keine konsistente Zuordnung',  ['Alle Ritter', 'Alle Schurken', 'Genau ein Ritter']);
    }
    case 91: {
      const rounds = 5 + Math.floor(Math.random() * 20);
      return textPuzzle( group,  `In einem wiederholten Spiel mit ${rounds} Runden: Welche einfache Strategie kooperiert zuerst und spiegelt danach den letzten Zug des Gegners?`,  '🤝 → kopiere letzten Zug',  'Tit-for-tat',  ['Immer verraten', 'Immer zufällig', 'Immer passen']);
    }
    case 92: {
      const memberships = sample(Array.from({ length: 10 }, (_, index) => index / 10), 3);
      const best = memberships.indexOf(Math.max(...memberships));
      return textPuzzle( group,  'Welche Kategorie passt am stärksten? Wähle den höchsten Zugehörigkeitswert.',  `A: ${memberships[0].toFixed(1)} · B: ${memberships[1].toFixed(1)} · C: ${memberships[2].toFixed(1)}`,  ['A', 'B', 'C'][best],  ['A', 'B', 'C'].filter((label) => label !== ['A', 'B', 'C'][best]).concat('Alle gleich').slice(0, 3));
    }
    case 93: {
      const side = 2 + Math.floor(Math.random() * 9);
      const perimeter = side * 4;
      return textPuzzle( group,  `Vier Städte liegen an den Ecken eines Quadrats mit Seitenlänge ${side}. Wie lang ist die kürzeste Rundreise?`,  `□ Seite ${side} · alle Städte besuchen und zurück`,  String(perimeter),  [String(perimeter + 2), String(perimeter * 2), String(side * 2)]);
    }
    case 94: {
      const initial = (Math.random() * 0.1).toFixed(2);
      const later = (0.5 + Math.random() * 9).toFixed(1);
      return textPuzzle( group,  'Zwei fast gleiche Startwerte führen später zu stark verschiedenen Ergebnissen. Welche Eigenschaft zeigt das?',  `${initial} ≈ 0　→　${later} ≠ ?`,  'Empfindlichkeit gegenüber Anfangswerten',  ['Zufälligkeit ohne Regeln', 'Immer gleiche Ausgabe', 'Paritätsfehler']);
    }
    case 95: {
      const states = sample(['0', '1', 'Rot', 'Blau'], 2);
      return textPuzzle( group,  `Vor der Messung kann das Quantensystem in einer Überlagerung aus ${states[0]} und ${states[1]} sein. Was zeigt die Messung?`,  `${states[0]} + ${states[1]} → Messung`,  'Einen der möglichen Zustände',  ['Beide immer zugleich', 'Keinen Zustand', 'Immer den ersten']);
    }
    case 96: {
      const contents = sample(['Äpfel', 'Birnen', 'Kirschen'], 3);
      return textPuzzle( group,  `Drei Inventarkisten enthalten je nur ${contents[0]}, ${contents[1]} oder Gemischtes. Alle Etiketten sind falsch. Welche Kiste prüfst du zuerst?`,  `${contents[0]} · ${contents[1]} · Gemischt\nAlle Etiketten falsch`,  'Gemischt',  [contents[0], contents[1], 'Alle zugleich']);
    }
    case 97: {
      const stretches = 2 + Math.floor(Math.random() * 8);
      return textPuzzle( group,  `Ein Gummiring wird ${stretches}-mal gedehnt und gebogen, aber nicht zerschnitten oder verklebt. Wie viele Löcher hat er?`,  '⭕ → längliche Form → ⭕',  '1',  ['0', '2', String(stretches)]);
    }
    case 98: {
      const angle = Math.random() < 0.5 ? 90 : 100;
      const sum = angle * 3;
      return textPuzzle( group,  `Ein Dreieck auf einer Kugel hat drei gleiche Winkel von ${angle}°. Welche Winkelsumme hat es?`,  `${angle}° + ${angle}° + ${angle}°`,  `${sum}°`,  ['180°', '90°', '360°']);
    }
    case 99: {
      const comparisons = 8 + Math.floor(Math.random() * 13);
      const items = 2 ** comparisons;
      return textPuzzle( group,  `Eine sortierte Liste hat ${items.toLocaleString('de-DE')} Einträge. Wie viele Vergleiche braucht die binäre Suche höchstens ungefähr?`,  `2^${comparisons} Einträge`,  String(comparisons),  [String(comparisons - 1), String(comparisons + 1), String(items)]);
    }
    case 100: {
      const first = 2 + Math.floor(Math.random() * 6);
      const second = 1 + Math.floor(Math.random() * 7);
      const sum = first + second;
      const answer = sum % 2 === 0 ? sum : sum - 1;
      return textPuzzle( group,  `Meta-Rätsel: Ein Code startet bei ${first}, addiert ${second}; falls die Summe ungerade ist, ziehe 1 ab. Welcher Code bleibt?`,  `${first} + ${second} → gerade Zahl`,  String(answer),  [String(answer + 1), String(Math.max(0, answer - 1)), String(sum)]);
    }
    default: throw new Error(`Missing logic puzzle generator for topic ${topicId}`);
  }
}

export function generateLogicRound(tier = 1): LogicPuzzle[] {
  if (!LOGIC_TIERS.some((item) => item.id === tier)) throw new RangeError(`Unknown logic tier: ${tier}`);
  const topics = LOGIC_TOPICS.filter((topic) => topic.tier === tier);
  if (topics.length !== 20) throw new Error(`Logic tier ${tier} must contain exactly 20 topics`);
  return shuffle(topics.map((topic) => {
    const generate = topic.id <= generators.length ? generators[topic.id - 1] : undefined;
    return {
      ...(generate ? generate() : advancedPuzzle(topic.id)),
      topicId: topic.id,
      topicName: topic.de,
    };
  }));
}
