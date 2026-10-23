import { Language } from '../types/game';

export interface LogicChoice {
  art: string;
  label?: string;
  correct?: boolean;
  silhouette?: boolean;
  sizes?: number[];
}

export interface LogicPuzzle {
  topicId: number;
  group: number;
  prompt: string;
  visual: string;
  choices: LogicChoice[];
}

export const LOGIC_GROUPS = [
  { de: 'Schauen & Sortieren', vi: 'Quan sát & phân loại', emoji: '👀' },
  { de: 'Größe & Lage', vi: 'Kích thước & vị trí', emoji: '📏' },
  { de: 'Muster & Zahlen', vi: 'Quy luật & số đếm', emoji: '🔢' },
  { de: 'Tiere & Alltag', vi: 'Động vật & cuộc sống', emoji: '🐾' },
];

interface Picture {
  de: string;
  vi: string;
  emoji: string;
}

interface Relation {
  subject: Picture;
  answer: Picture;
  visual: string;
}

type GeneratedLogicPuzzle = Omit<LogicPuzzle, 'topicId'>;

const picture = (de: string, vi: string, emoji: string): Picture => ({ de, vi, emoji });
const word = (lang: Language, de: string, vi: string) => lang === 'de' ? de : vi;
const itemName = (item: Picture, lang: Language) => lang === 'de' ? item.de : item.vi;

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

function otherPictures(items: Picture[], answer: Picture, count: number): Picture[] {
  return sample(items.filter((item) => item !== answer), count);
}

const FRUITS = [
  picture('Apfel', 'táo', '🍎'), picture('Banane', 'chuối', '🍌'), picture('Erdbeere', 'dâu tây', '🍓'),
  picture('Birne', 'lê', '🍐'), picture('Orange', 'cam', '🍊'), picture('Traube', 'nho', '🍇'),
  picture('Kirsche', 'anh đào', '🍒'), picture('Ananas', 'dứa', '🍍'), picture('Pfirsich', 'đào', '🍑'),
  picture('Wassermelone', 'dưa hấu', '🍉'), picture('Kiwi', 'kiwi', '🥝'), picture('Zitrone', 'chanh', '🍋'),
];

const ANIMALS = [
  picture('Löwe', 'sư tử', '🦁'), picture('Elefant', 'voi', '🐘'), picture('Affe', 'khỉ', '🐒'),
  picture('Vogel', 'chim', '🐦'), picture('Fuchs', 'cáo', '🦊'), picture('Hase', 'thỏ', '🐰'),
  picture('Frosch', 'ếch', '🐸'), picture('Bär', 'gấu', '🐻'), picture('Katze', 'mèo', '🐱'),
  picture('Hund', 'chó', '🐶'), picture('Giraffe', 'hươu cao cổ', '🦒'), picture('Panda', 'gấu trúc', '🐼'),
];

const SHAPES = [
  picture('Kreis', 'hình tròn', '⚪'), picture('Dreieck', 'hình tam giác', '🔺'),
  picture('Quadrat', 'hình vuông', '🟦'), picture('Stern', 'ngôi sao', '⭐'),
  picture('Herz', 'trái tim', '❤️'), picture('Rechteck', 'hình chữ nhật', '🟫'),
  picture('Raute', 'hình thoi', '🔶'), picture('Oval', 'hình bầu dục', '🥚'),
];

const SHAPE_SCENES = [
  { shape: SHAPES[1], scene: '🏠' }, { shape: SHAPES[2], scene: '🏡' },
  { shape: SHAPES[0], scene: '🚲' }, { shape: SHAPES[0], scene: '🕰️' },
  { shape: SHAPES[6], scene: '🪁' }, { shape: SHAPES[4], scene: '❤️' },
  { shape: SHAPES[2], scene: '🤖' }, { shape: SHAPES[1], scene: '⛵' },
  { shape: SHAPES[0], scene: '🎂' }, { shape: SHAPES[5], scene: '🚪' },
  { shape: SHAPES[3], scene: '✨' }, { shape: SHAPES[7], scene: '🥚' },
];

const COLORS = [
  { de: 'roten', vi: 'đỏ', basket: '🧺🔴', items: ['🍎', '🍓', '🚗', '🧱', '🧦', '🧸'] },
  { de: 'blauen', vi: 'xanh dương', basket: '🧺🔵', items: ['🫐', '🧢', '🧤', '🪣', '🐟', '🧩'] },
  { de: 'gelben', vi: 'vàng', basket: '🧺🟡', items: ['🍌', '🌟', '🦆', '🧀', '🚕', '🌼'] },
];

const ODD_GROUPS = [
  { de: 'Obst', vi: 'trái cây', members: ['🍎', '🍐', '🍊', '🍇', '🍓', '🍒', '🍑'] },
  { de: 'Fische', vi: 'các loài cá', members: ['🐟', '🐠', '🐡', '🐟', '🐠', '🐡', '🐟'] },
  { de: 'Spielzeug', vi: 'đồ chơi', members: ['🧸', '🪀', '🪁', '🧩', '🪆', '🪅', '🧸'] },
  { de: 'Kleidung', vi: 'quần áo', members: ['🧦', '🧢', '🧤', '👕', '👗', '🧥', '🧦'] },
  { de: 'Bauernhoftiere', vi: 'động vật nông trại', members: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐐', '🐮'] },
  { de: 'Fahrzeuge', vi: 'phương tiện', members: ['🚗', '🚕', '🚌', '🚲', '🚂', '🚜', '🚗'] },
];

const SIZE_ITEMS = [
  { item: picture('Maus', 'chuột', '🐭'), size: 1 },
  { item: picture('Vogel', 'chim', '🐦'), size: 2 },
  { item: picture('Frosch', 'ếch', '🐸'), size: 3 },
  { item: picture('Hase', 'thỏ', '🐰'), size: 4 },
  { item: picture('Katze', 'mèo', '🐱'), size: 5 },
  { item: picture('Hund', 'chó', '🐶'), size: 6 },
  { item: picture('Panda', 'gấu trúc', '🐼'), size: 7 },
  { item: picture('Bär', 'gấu', '🐻'), size: 8 },
  { item: picture('Löwe', 'sư tử', '🦁'), size: 9 },
  { item: picture('Giraffe', 'hươu cao cổ', '🦒'), size: 10 },
  { item: picture('Elefant', 'voi', '🐘'), size: 11 },
  { item: picture('Wal', 'cá voi', '🐳'), size: 12 },
];

const MATCH_ITEMS = [...FRUITS, ...ANIMALS, ...SHAPES.slice(0, 5)];

const NUMBER_OBJECTS = ['🍎', '🐤', '⭐', '🦋', '🔵', '🌼', '🍓', '🐸', '🚗', '🧸', '🍪', '🌈', '🐞', '🧁', '⚽', '🐠', '🍄', '🎈', '🌷', '🪁'];

const MOTHERS: Relation[] = [
  { subject: picture('Henne', 'gà mẹ', '🐔'), answer: picture('Küken', 'gà con', '🐥'), visual: '🐔' },
  { subject: picture('Kuh', 'bò mẹ', '🐄'), answer: picture('Kalb', 'bê con', '🐮'), visual: '🐄' },
  { subject: picture('Hund', 'chó mẹ', '🐶'), answer: picture('Welpe', 'chó con', '🐕'), visual: '🐶' },
  { subject: picture('Katze', 'mèo mẹ', '🐈'), answer: picture('Kätzchen', 'mèo con', '🐱'), visual: '🐈' },
  { subject: picture('Schaf', 'cừu mẹ', '🐑'), answer: picture('Lamm', 'cừu con', '🐏'), visual: '🐑' },
  { subject: picture('Pferd', 'ngựa mẹ', '🐴'), answer: picture('Fohlen', 'ngựa con', '🐎'), visual: '🐴' },
  { subject: picture('Schwein', 'lợn mẹ', '🐷'), answer: picture('Ferkel', 'lợn con', '🐖'), visual: '🐷' },
  { subject: picture('Ente', 'vịt mẹ', '🦆'), answer: picture('Entenküken', 'vịt con', '🐣'), visual: '🦆' },
  { subject: picture('Bär', 'gấu mẹ', '🐻'), answer: picture('Bärenjunges', 'gấu con', '🐻‍❄️'), visual: '🐻' },
  { subject: picture('Löwe', 'sư tử mẹ', '🦁'), answer: picture('Löwenjunges', 'sư tử con', '🐯'), visual: '🦁' },
  { subject: picture('Frosch', 'ếch mẹ', '🐸'), answer: picture('Kaulquappe', 'nòng nọc', '🫧'), visual: '🐸' },
  { subject: picture('Schmetterling', 'bướm mẹ', '🦋'), answer: picture('Raupe', 'sâu bướm', '🐛'), visual: '🦋' },
];

const HOMES: Relation[] = [
  { subject: picture('Vogel', 'chim', '🐦'), answer: picture('Nest', 'tổ chim', '🪺'), visual: '🐦' },
  { subject: picture('Biene', 'ong', '🐝'), answer: picture('Bienenstock', 'tổ ong', '🍯'), visual: '🐝' },
  { subject: picture('Fisch', 'cá', '🐟'), answer: picture('Wasser', 'nước', '🌊'), visual: '🐟' },
  { subject: picture('Hund', 'chó', '🐶'), answer: picture('Hundehütte', 'nhà chó', '🐕‍🦺'), visual: '🐶' },
  { subject: picture('Bär', 'gấu', '🐻'), answer: picture('Höhle', 'hang', '🪨'), visual: '🐻' },
  { subject: picture('Kaninchen', 'thỏ', '🐰'), answer: picture('Bau', 'hang thỏ', '🕳️'), visual: '🐰' },
  { subject: picture('Frosch', 'ếch', '🐸'), answer: picture('Teich', 'ao', '🪷'), visual: '🐸' },
  { subject: picture('Pferd', 'ngựa', '🐴'), answer: picture('Stall', 'chuồng ngựa', '🏠'), visual: '🐴' },
  { subject: picture('Spinne', 'nhện', '🕷️'), answer: picture('Netz', 'mạng nhện', '🕸️'), visual: '🕷️' },
  { subject: picture('Fuchs', 'cáo', '🦊'), answer: picture('Fuchsbau', 'hang cáo', '🕳️'), visual: '🦊' },
  { subject: picture('Löwe', 'sư tử', '🦁'), answer: picture('Savanne', 'thảo nguyên', '🌴'), visual: '🦁' },
  { subject: picture('Pinguin', 'chim cánh cụt', '🐧'), answer: picture('Eis', 'băng tuyết', '🧊'), visual: '🐧' },
];

const FOODS: Relation[] = [
  { subject: picture('Kaninchen', 'thỏ', '🐰'), answer: picture('Karotte', 'cà rốt', '🥕'), visual: '🐰' },
  { subject: picture('Affe', 'khỉ', '🐒'), answer: picture('Banane', 'chuối', '🍌'), visual: '🐒' },
  { subject: picture('Katze', 'mèo', '🐱'), answer: picture('Fisch', 'cá', '🐟'), visual: '🐱' },
  { subject: picture('Panda', 'gấu trúc', '🐼'), answer: picture('Bambus', 'tre', '🎋'), visual: '🐼' },
  { subject: picture('Maus', 'chuột', '🐭'), answer: picture('Käse', 'phô mai', '🧀'), visual: '🐭' },
  { subject: picture('Bär', 'gấu', '🐻'), answer: picture('Honig', 'mật ong', '🍯'), visual: '🐻' },
  { subject: picture('Pferd', 'ngựa', '🐴'), answer: picture('Apfel', 'táo', '🍎'), visual: '🐴' },
  { subject: picture('Schaf', 'cừu', '🐑'), answer: picture('Gras', 'cỏ', '🌿'), visual: '🐑' },
  { subject: picture('Eichhörnchen', 'sóc', '🐿️'), answer: picture('Nuss', 'hạt', '🥜'), visual: '🐿️' },
  { subject: picture('Koala', 'gấu koala', '🐨'), answer: picture('Eukalyptus', 'lá bạch đàn', '🍃'), visual: '🐨' },
  { subject: picture('Vogel', 'chim', '🐦'), answer: picture('Samen', 'hạt giống', '🌻'), visual: '🐦' },
  { subject: picture('Biene', 'ong', '🐝'), answer: picture('Blüte', 'hoa', '🌼'), visual: '🐝' },
];

const WEATHER = [
  { weather: '🌧️', child: '🧒', clothes: '🧥☂️', de: 'Regen', vi: 'mưa' },
  { weather: '☀️', child: '👧', clothes: '🧢🕶️', de: 'Sonne', vi: 'nắng' },
  { weather: '❄️', child: '🧒', clothes: '🧣🧤', de: 'Schnee', vi: 'tuyết' },
  { weather: '🌬️', child: '👧', clothes: '🧥🧣', de: 'Wind', vi: 'gió' },
  { weather: '🌦️', child: '🧒', clothes: '🧥👢', de: 'Schauer', vi: 'mưa rào' },
  { weather: '🌞', child: '👦', clothes: '👒🕶️', de: 'heiße Sonne', vi: 'nắng nóng' },
  { weather: '☁️', child: '👧', clothes: '🧥👟', de: 'kühles Wetter', vi: 'trời mát' },
  { weather: '⛈️', child: '🧒', clothes: '🧥🥾', de: 'Gewitter', vi: 'giông bão' },
  { weather: '🌨️', child: '👧', clothes: '🧤🧣', de: 'Schneefall', vi: 'tuyết rơi' },
  { weather: '🌤️', child: '👦', clothes: '🧢👕', de: 'milder Sonnenschein', vi: 'nắng nhẹ' },
  { weather: '🌫️', child: '👧', clothes: '🧥👖', de: 'Nebel', vi: 'sương mù' },
  { weather: '🌧️', child: '👦', clothes: '☂️👢', de: 'Pfützenregen', vi: 'mưa có vũng nước' },
];

const CAUSE_EFFECTS = [
  { before: '🧒🟤👐', after: '🚰🧼👐', de: 'mit schmutzigen Händen gespielt', vi: 'chơi làm bẩn tay' },
  { before: '🌱☀️', after: '🌻', de: 'eine Blume Sonne bekommt', vi: 'hoa được tắm nắng' },
  { before: '🍎🔪', after: '🍎🍽️', de: 'ein Apfel geschnitten wird', vi: 'táo được cắt ra' },
  { before: '🌧️🌱', after: '🌱💧', de: 'es auf die Pflanze regnet', vi: 'cây được tưới mưa' },
  { before: '🧊☀️', after: '💧', de: 'Eis in der Sonne liegt', vi: 'đá nằm dưới nắng' },
  { before: '🪥🦷', after: '✨🦷', de: 'Zähne geputzt werden', vi: 'răng được đánh sạch' },
  { before: '🧺👕', after: '👕✨', de: 'Wäsche gewaschen wird', vi: 'quần áo được giặt' },
  { before: '🧩👐', after: '🧩🖼️', de: 'ein Puzzle zusammengesetzt wird', vi: 'ghép xong trò chơi xếp hình' },
  { before: '🌰🌱', after: '🌳', de: 'ein Samen wächst', vi: 'hạt giống lớn lên' },
  { before: '🎈📍', after: '💥', de: 'ein Ballon an einer Nadel platzt', vi: 'bóng bay chạm vào kim' },
  { before: '🧼👐', after: '✨👐', de: 'Hände mit Seife gewaschen werden', vi: 'tay được rửa bằng xà phòng' },
  { before: '🥛➡️🧊', after: '🍦', de: 'Saft eingefroren wird', vi: 'nước ép được làm đông' },
];

const GENERATORS: Array<(lang: Language) => GeneratedLogicPuzzle> = [
  (lang) => {
    const target = pick(FRUITS);
    const options = choices({ art: target.emoji, label: itemName(target, lang), correct: true }, otherPictures(FRUITS, target, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang) })));
    return { group: 0, prompt: word(lang, 'Finde genau dieselbe Frucht!', 'Tìm loại quả giống hệt nhé!'), visual: target.emoji, choices: options };
  },
  (lang) => {
    const target = pick(ANIMALS);
    return {
      group: 0,
      prompt: word(lang, 'Welcher Schatten passt zum Bild?', 'Bóng nào khớp với hình này?'),
      visual: target.emoji,
      choices: choices({ art: target.emoji, label: itemName(target, lang), correct: true, silhouette: true }, otherPictures(ANIMALS, target, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang), silhouette: true }))),
    };
  },
  (lang) => {
    const color = pick(COLORS);
    const correct = pick(color.items);
    const otherItems = COLORS.filter((item) => item !== color).flatMap((item) => item.items);
    return { group: 0, prompt: word(lang, `Was gehört in den ${color.de} Korb?`, `Món nào nên vào giỏ màu ${color.vi}?`), visual: color.basket, choices: choices({ art: correct, correct: true }, sample(otherItems, 3).map((art) => ({ art }))) };
  },
  (lang) => {
    const example = pick(SHAPE_SCENES);
    const shape = example.shape;
    return { group: 0, prompt: word(lang, 'Welche Form passt in die Lücke?', 'Hình nào phù hợp với chỗ trống?'), visual: `${example.scene}  □`, choices: choices({ art: shape.emoji, label: itemName(shape, lang), correct: true }, otherPictures(SHAPES, shape, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang) }))) };
  },
  (lang) => {
    const group = pick(ODD_GROUPS);
    const same = sample([...new Set(group.members)], 3);
    const oddCandidates = ODD_GROUPS.filter((item) => item !== group).flatMap((item) => item.members).filter((item) => !same.includes(item));
    const odd = pick(oddCandidates);
    return { group: 0, prompt: word(lang, `Was passt nicht zu ${group.de}?`, `Món nào không thuộc nhóm ${group.vi}?`), visual: same.join('  '), choices: shuffle([...same.map((art) => ({ art })), { art: odd, correct: true }]) };
  },
  (lang) => {
    const candidates = sample(SIZE_ITEMS, 4);
    const biggest = candidates.reduce((largest, candidate) => candidate.size > largest.size ? candidate : largest);
    return { group: 1, prompt: word(lang, 'Welches Tier ist am größten?', 'Con vật nào to nhất?'), visual: '📏  ?', choices: shuffle(candidates.map(({ item }) => ({ art: item.emoji, label: itemName(item, lang), correct: item === biggest.item }))) };
  },
  (lang) => {
    const lengths = sample([2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
    const longest = Math.max(...lengths);
    return { group: 1, prompt: word(lang, 'Finde den längsten Buntstift!', 'Tìm cây bút chì dài nhất!'), visual: '✏️ ✏️ ✏️', choices: shuffle(lengths.map((length) => ({ art: '━'.repeat(length), correct: length === longest }))) };
  },
  (lang) => {
    const subject = pick(ANIMALS);
    const table = pick(['🟥', '🟫', '🟨', '🟧', '🟩', '🟪']);
    const targetOnTop = Math.random() < 0.5;
    const correct = `${subject.emoji}${targetOnTop ? '⬆️' : '⬇️'}${table}`;
    const distractor = `${subject.emoji}${targetOnTop ? '⬇️' : '⬆️'}${table}`;
    const other = sample(ANIMALS.filter((item) => item !== subject), 2);
    return { group: 1, prompt: word(lang, `Welches Bild zeigt dasselbe Tier ${targetOnTop ? 'auf' : 'unter'} dem Tisch?`, `Hình nào cho thấy con vật giống gợi ý ở ${targetOnTop ? 'trên' : 'dưới'} bàn?`), visual: `${subject.emoji}  ?  ${table}`, choices: shuffle([{ art: correct, correct: true }, { art: distractor }, ...other.map((item) => ({ art: `${item.emoji}⬇️${table}` }))]) };
  },
  (lang) => {
    const subject = pick([picture('Fisch', 'cá', '🐟'), picture('Ente', 'vịt', '🦆'), picture('Frosch', 'ếch', '🐸')]);
    const container = pick(['🥣', '🪣', '🫙', '🏠', '🧺', '🛁']);
    const inside = Math.random() < 0.5;
    const correct = `${subject.emoji}${inside ? '⬇️' : '↗️'}${container}`;
    const wrong = `${subject.emoji}${inside ? '↗️' : '⬇️'}${container}`;
    return { group: 1, prompt: word(lang, `Finde dasselbe Tier ${inside ? 'im' : 'außerhalb des'} Behälter${inside ? '' : 's'}!`, `Tìm con vật giống gợi ý ở ${inside ? 'trong' : 'ngoài'} vật chứa nhé!`), visual: `${subject.emoji}  ${container}`, choices: shuffle([{ art: correct, correct: true }, { art: wrong }, ...sample(ANIMALS.filter((item) => item.emoji !== subject.emoji), 2).map((item) => ({ art: `${item.emoji}↗️${container}` }))]) };
  },
  (lang) => {
    const target = pick(MATCH_ITEMS);
    return { group: 1, prompt: word(lang, 'Finde die passende andere Hälfte!', 'Tìm nửa còn lại phù hợp nhé!'), visual: `${target.emoji}  ◐`, choices: choices({ art: target.emoji, label: itemName(target, lang), correct: true }, otherPictures(MATCH_ITEMS, target, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang) }))) };
  },
  (lang) => {
    const [first, second] = sample(['❤️', '💛', '💙', '💚', '💜', '🧡', '🤍', '🩷'], 2);
    const balloons = [first, second, first, second].join('🎈  ') + '🎈  ?';
    return { group: 2, prompt: word(lang, 'Was kommt als Nächstes?', 'Hình nào tiếp theo?'), visual: balloons, choices: shuffle([{ art: `${first}🎈`, correct: true }, { art: `${second}🎈` }, ...sample(['🩵🎈', '🖤🎈', '🤎🎈'], 2).map((art) => ({ art }))]) };
  },
  (lang) => {
    const count = 1 + Math.floor(Math.random() * 5);
    const object = pick(NUMBER_OBJECTS);
    const distractors = sample([1, 2, 3, 4, 5].filter((number) => number !== count), 3);
    return { group: 2, prompt: word(lang, 'Zähle die Bilder!', 'Bé hãy đếm số hình nhé!'), visual: Array.from({ length: count }, () => object).join(' '), choices: shuffle([count, ...distractors].map((number) => ({ art: String(number), correct: number === count }))) };
  },
  (lang) => {
    const count = 1 + Math.floor(Math.random() * 5);
    const object = pick(['🌼', '🌷', '🌻', '🌸', '🌺', '🌹', '💐', '🌵', '🌱', '🌾', '🍀', '🪻', '🪷', '🌿', '🍄', '🌴', '🌳', '🪴', '🌲', '🌼']);
    const groups = sample([1, 2, 3, 4, 5].filter((number) => number !== count), 3);
    const variants = shuffle([count, ...groups]);
    return { group: 2, prompt: word(lang, `Welche Gruppe hat genau ${count} Blumen?`, `Nhóm nào có đúng ${count} bông hoa?`), visual: `${count} 🌼`, choices: variants.map((number) => ({ art: Array.from({ length: number }, () => object).join(' '), correct: number === count })) };
  },
  (lang) => {
    const scenes = [
      { de: 'Picknick', vi: 'buổi dã ngoại', scene: '🧺🌳☀️', answers: ['🍎', '🥪', '🍓', '🧃'] },
      { de: 'Garten', vi: 'khu vườn', scene: '🌱🌷🪴', answers: ['💧', '🌻', '🦋', '🐝'] },
      { de: 'Strand', vi: 'bãi biển', scene: '🏖️🌊☀️', answers: ['🪣', '🐚', '🩴', '🏰'] },
      { de: 'Geburtstag', vi: 'sinh nhật', scene: '🎂🎈🎉', answers: ['🎁', '🕯️', '🎊', '🍰'] },
      { de: 'Bauernhof', vi: 'nông trại', scene: '🚜🌾🐄', answers: ['🌽', '🥛', '🐔', '🧺'] },
      { de: 'Schnee-Tag', vi: 'ngày tuyết', scene: '⛄❄️🏠', answers: ['🧣', '🧤', '🥾', '☃️'] },
      { de: 'Küche', vi: 'nhà bếp', scene: '🍽️🥣🍳', answers: ['🥄', '🍴', '🥕', '🧂'] },
      { de: 'Spielplatz', vi: 'sân chơi', scene: '🛝🌳⚽', answers: ['🪁', '🛴', '🏀', '🧸'] },
      { de: 'Wald', vi: 'khu rừng', scene: '🌲🍄🍂', answers: ['🦉', '🐿️', '🍁', '🪵'] },
      { de: 'Frühstück', vi: 'bữa sáng', scene: '🥣🥛🍽️', answers: ['🥄', '🍞', '🍯', '🍓'] },
      { de: 'Schule', vi: 'trường học', scene: '🎒📚✏️', answers: ['📖', '🖍️', '📏', '📝'] },
      { de: 'Badezimmer', vi: 'phòng tắm', scene: '🛁🧼🪥', answers: ['🧻', '🧴', '🧽', '🚿'] },
    ];
    const scene = pick(scenes);
    const answer = pick(scene.answers);
    const allAnswers = [...new Set(scenes.flatMap((item) => item.answers))];
    const distractors = sample(allAnswers.filter((item) => item !== answer), 3);
    return { group: 2, prompt: word(lang, 'Was fehlt in diesem Bild?', 'Hình này còn thiếu gì?'), visual: `${scene.scene}  □`, choices: shuffle([{ art: answer, correct: true }, ...distractors.map((art) => ({ art }))]) };
  },
  (lang) => {
    const family = pick(['🐻', '🐰', '🐱', '🐶', '🐼', '🦊', '🐸', '🦁', '🐨', '🐵', '🐷', '🐮']);
    const permutations = [[20, 32, 44], [44, 32, 20], [20, 44, 32], [32, 20, 44], [32, 44, 20], [44, 20, 32]];
    const correct = [20, 32, 44];
    const orderings = shuffle([correct, ...sample(permutations.filter((order) => order.join(',') !== correct.join(',')), 2)]);
    return { group: 2, prompt: word(lang, 'Welche Reihe geht von klein nach groß?', 'Dãy nào xếp từ nhỏ đến lớn?'), visual: `${family}  klein → groß`, choices: orderings.map((sizes) => ({ art: family, sizes, correct: sizes.join(',') === correct.join(',') })) };
  },
  (lang) => {
    const relation = pick(MOTHERS);
    const distractors = MOTHERS.filter((item) => item !== relation).map((item) => item.answer);
    return { group: 3, prompt: word(lang, `Welches Baby gehört zur ${relation.subject.de}?`, `Con nào là con của ${relation.subject.vi}?`), visual: relation.visual, choices: choices({ art: relation.answer.emoji, label: itemName(relation.answer, lang), correct: true }, otherPictures(distractors, relation.answer, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang) }))) };
  },
  (lang) => {
    const relation = pick(HOMES);
    const distractors = HOMES.filter((item) => item !== relation).map((item) => item.answer);
    return { group: 3, prompt: word(lang, `Wo wohnt der ${relation.subject.de}?`, `Con ${relation.subject.vi} sống ở đâu?`), visual: relation.visual, choices: choices({ art: relation.answer.emoji, label: itemName(relation.answer, lang), correct: true }, otherPictures(distractors, relation.answer, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang) }))) };
  },
  (lang) => {
    const relation = pick(FOODS);
    const distractors = FOODS.filter((item) => item !== relation).map((item) => item.answer);
    return { group: 3, prompt: word(lang, `Was frisst der ${relation.subject.de}?`, `Con ${relation.subject.vi} ăn gì?`), visual: relation.visual, choices: choices({ art: relation.answer.emoji, label: itemName(relation.answer, lang), correct: true }, otherPictures(distractors, relation.answer, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang) }))) };
  },
  (lang) => {
    const weather = pick(WEATHER);
    const clothes = WEATHER.filter((item) => item !== weather).map((item) => item.clothes);
    return { group: 3, prompt: word(lang, `Es gibt ${weather.de}! Was zieht das Kind an?`, `Trời ${weather.vi}! Bé nên mặc gì?`), visual: `${weather.weather}  ${weather.child}`, choices: choices({ art: weather.clothes, correct: true }, sample(clothes, 3).map((art) => ({ art }))) };
  },
  (lang) => {
    const event = pick(CAUSE_EFFECTS);
    const actions = ['🍰🥄', '🛌💤', '⚽🏃', '🎈🎉', '🍦😋', '📚📖', '🚗💨', '🎨🖌️', '🪁🌤️', '🐶🦴', '🧸🛏️', '🧹✨'];
    const wrong = sample(actions.filter((item) => item !== event.after), 3);
    return { group: 3, prompt: word(lang, 'Was könnte danach passieren?', 'Điều gì có thể xảy ra tiếp theo?'), visual: `${event.before}  ➜  ?`, choices: choices({ art: event.after, correct: true }, wrong.map((art) => ({ art }))) };
  },
];

// Each topic combines random examples, distractor sets, and answer positions.
// This creates hundreds of variants per topic without storing 2,000 fixed cards.
export function generateLogicRound(lang: Language): LogicPuzzle[] {
  return shuffle(GENERATORS.map((generate, index) => ({ ...generate(lang), topicId: index + 1 })));
}
