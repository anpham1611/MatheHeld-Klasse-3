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
  topicName: string;
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

export const LOGIC_TIERS = [
  { id: 1, de: 'Grundlagen', vi: 'Nền tảng' },
  { id: 2, de: 'Logisches Denken', vi: 'Suy luận logic' },
  { id: 3, de: 'Knifflige Rätsel', vi: 'Câu đố nâng cao' },
  { id: 4, de: 'Expertenlogik', vi: 'Logic chuyên sâu' },
  { id: 5, de: 'Meisterrätsel', vi: 'Câu đố bậc thầy' },
];

const TOPIC_TITLES: Array<[string, string, string]> = [
  ['Basic Arithmetic Reasoning', 'Einfaches Rechnen', 'Suy luận số học cơ bản'],
  ['Number Series Completion', 'Zahlenfolgen', 'Hoàn thành dãy số'],
  ['Logic Toggles', 'An-Aus-Logik', 'Bật-tắt logic'],
  ['Measurement Problems', 'Messen und Vergleichen', 'Đo lường và so sánh'],
  ['Picture Analogies & Associations', 'Bildanalogien', 'Liên tưởng hình ảnh'],
  ['Sequence Stories', 'Geschichten ordnen', 'Sắp xếp câu chuyện'],
  ['Finish-the-Row Patterns', 'Musterreihen', 'Hoàn thành quy luật'],
  ['Arrow-Grid Mazes', 'Pfeil-Labyrinth', 'Mê cung mũi tên'],
  ['Categorizing / What Belongs?', 'Dinge sortieren', 'Phân loại đồ vật'],
  ['Odd-One-Out Elimination', 'Was passt nicht?', 'Tìm hình khác nhóm'],
  ['Shadow Matching', 'Schatten finden', 'Tìm chiếc bóng'],
  ['Counting Logic / Find & Count', 'Zählen und entdecken', 'Đếm và khám phá'],
  ['Visual Discrimination Drills', 'Bilder vergleichen', 'Tìm hình giống nhau'],
  ['Simple Grid Placement', 'Bildergitter ergänzen', 'Điền vào ô hình'],
  ['Basic Weight Balancing', 'Waagen-Rätsel', 'Cân thăng bằng'],
  ['Alphabet Sequences', 'Buchstabenfolgen', 'Dãy chữ cái'],
  ['Color-coded Logic Traps', 'Farben-Labyrinth', 'Mê cung màu sắc'],
  ['Clock & Time Logic', 'Uhr und Zeit', 'Đồng hồ và thời gian'],
  ['Shape Segmentation', 'Formen zerlegen', 'Tách hình'],
  ['Elementary Venn Diagrams', 'Mengen sortieren', 'Phân loại theo nhóm'],
  ['Constraint Satisfaction', 'Regeln erfüllen', 'Thỏa mãn điều kiện'],
  ['Elementary Probability', 'Einfache Wahrscheinlichkeit', 'Xác suất cơ bản'],
  ['Truth-Teller & Liar Riddles', 'Wahrheit und Lüge', 'Người nói thật và nói dối'],
  ['Combinatorics Foundations', 'Kombinatorik-Grundlagen', 'Nền tảng tổ hợp'],
  ['Logic Matrix Grids', 'Logikgitter', 'Bảng suy luận logic'],
  ['Spatial Rotations', 'Räumliches Drehen', 'Xoay hình không gian'],
  ['Word Ladders', 'Wortleitern', 'Thang biến đổi từ'],
  ['Rebus Decoders', 'Bilderrätsel', 'Giải đố hình chữ'],
  ['Basic Sudoku Matrixing', 'Sudoku-Grundlagen', 'Sudoku cơ bản'],
  ['Crossword Logic Mapping', 'Kreuzwort-Logik', 'Suy luận ô chữ'],
  ['Letter Unscrambling Logic', 'Buchstaben ordnen', 'Sắp xếp chữ cái'],
  ['Cryptic Grids', 'Geheimschrift-Gitter', 'Lưới mật mã'],
  ['Symbol Substitution Sudoku', 'Symbol-Sudoku', 'Sudoku ký hiệu'],
  ['Classic River Crossing', 'Flussüberquerung', 'Qua sông kinh điển'],
  ['Table-Deduction Navigation', 'Tabellen-Rätsel', 'Suy luận từ bảng'],
  ['Syllogism Analysis', 'Aussagen prüfen', 'Phân tích tam đoạn luận'],
  ['Analogical Maps', 'Analogie-Karten', 'Bản đồ tương tự'],
  ['Network Traversal', 'Netzwerkwege', 'Đường đi mạng lưới'],
  ['Basic Game Trees', 'Spielbäume', 'Cây trò chơi cơ bản'],
  ['Set Theory Basics', 'Mengenlehre', 'Lý thuyết tập hợp'],
  ['Recursive Strategies', 'Rückwärtsrechnen', 'Chiến lược đệ quy'],
  ['Mathematical Invariants', 'Mathematische Invarianten', 'Bất biến toán học'],
  ['Geometric Deductions', 'Geometrisches Denken', 'Suy luận hình học'],
  ['Resource Allocation Optimization', 'Ressourcen optimal verteilen', 'Phân bổ tài nguyên tối ưu'],
  ['Coin Paradox Boxes', 'Falsch beschriftete Kisten', 'Hộp dán nhãn sai'],
  ['Misleading Marathoners', 'Marathon-Rangfolge', 'Suy luận thứ hạng chạy'],
  ['Overlapping Area Calculations', 'Überlappende Flächen', 'Tính diện tích chồng lấn'],
  ['Diagonal Thinking Paths', 'Diagonale Muster', 'Quy luật đường chéo'],
  ['Three-Variable Truth Riddles', 'Drei Arten von Aussagen', 'Câu đố ba kiểu người'],
  ['The Short Pour Volumetric Paradox', 'Wasser abmessen', 'Đong nước bằng bình'],
  ['Divisor Logic Constraints', 'Teiler-Rätsel', 'Ràng buộc ước số'],
  ['Intersecting Rectangles', 'Rechtecke im Schnitt', 'Hình chữ nhật giao nhau'],
  ['Socks in the Dark Probability', 'Socken im Dunkeln', 'Xác suất rút tất trong tối'],
  ['Net Balance Deductions', 'Mehrstufige Waagen', 'Suy luận cân nhiều tầng'],
  ['The Monty Hall Trap', 'Das Monty-Hall-Problem', 'Bài toán Monty Hall'],
  ['Conditional Formatting Paths', 'Bedingte Labyrinthwege', 'Đường mê cung có điều kiện'],
  ['Loop Constraints (Slitherlink styles)', 'Schleifen-Rätsel', 'Ràng buộc vòng lặp'],
  ['Minefield Deductions (Minesweeper styles)', 'Minenfeld-Logik', 'Suy luận bãi mìn'],
  ['Polyomino Packing', 'Polyomino-Puzzle', 'Xếp hình polyomino'],
  ['Directed Acyclic Graphs', 'Gerichtete azyklische Graphen', 'Đồ thị có hướng không chu trình'],
  ['Fault-Tree Diagnosis', 'Fehlerbaum-Diagnose', 'Chẩn đoán cây lỗi'],
  ['Graph Coloring Restrictions', 'Graphen färben', 'Tô màu đồ thị'],
  ['Cryptarithms / Alphametics', 'Kryptarithmen', 'Mật mã số học'],
  ['Order-Relation Sorting', 'Ungleichungen ordnen', 'Sắp xếp bất đẳng thức'],
  ['State-Space Transitions', 'Zustandsübergänge', 'Chuyển đổi trạng thái'],
  ['Advanced Interview Brain Teasers', 'Knifflige Interviewfragen', 'Câu đố phỏng vấn nâng cao'],
  ['Modular Arithmetic Logic', 'Modulo-Rechnen', 'Số học modulo'],
  ['Pigeonhole Principle Applications', 'Schubfachprinzip', 'Nguyên lý Dirichlet'],
  ['Multi-Agent Game Theory', 'Spieltheorie mit mehreren', 'Lý thuyết trò chơi nhiều người'],
  ['Complex Truth-Value Trees', 'Verschachtelte Wahrheitsbäume', 'Cây giá trị chân lý phức tạp'],
  ['Self-Referential Logic Riddles', 'Selbstbezügliche Rätsel', 'Câu đố tự tham chiếu'],
  ['Infinite Loop Regressions', 'Endlosschleifen und Grenzen', 'Vòng lặp vô hạn và giới hạn'],
  ['Dynamic Programming Paths', 'Dynamische Pfadplanung', 'Quy hoạch động đường đi'],
  ['Asymmetric Information Logic', 'Ungleiche Informationen', 'Logic thông tin bất đối xứng'],
  ['Zero-Sum Strategy Optimization', 'Nullsummen-Strategien', 'Tối ưu chiến lược tổng bằng không'],
  ['Probability Distribution Shifts', 'Wahrscheinlichkeiten aktualisieren', 'Cập nhật phân phối xác suất'],
  ['Complex Spatial Tessellation', 'Räumliche Parkettierung', 'Lát không gian phức tạp'],
  ['Inductive Reason Blocks', 'Induktives Schließen', 'Suy luận quy nạp'],
  ['Bayesian Inference Drills', 'Bayes-Schlussfolgerungen', 'Suy luận Bayes'],
  ['Network Flow Maximization', 'Maximaler Netzwerkfluss', 'Tối đa hóa luồng mạng'],
  ['Boolean Algebra Minimization', 'Boolesche Vereinfachung', 'Tối giản đại số Boolean'],
  ['Graph Theory Trees', 'Bäume in Graphen', 'Cây trong lý thuyết đồ thị'],
  ['Combinatorial Game Theory', 'Kombinatorische Spiele', 'Lý thuyết trò chơi tổ hợp'],
  ['Parity-Check Logic', 'Paritätsprüfung', 'Kiểm tra tính chẵn lẻ'],
  ['Gödelian Diagonalization Basics', 'Gödels Diagonalargument', 'Lập luận đường chéo Gödel'],
  ['Meta-Reasoning Puzzles', 'Meta-Rätsel', 'Câu đố suy luận meta'],
  ['Advanced Strategic Moves', 'Strategische Spielzüge', 'Nước đi chiến lược nâng cao'],
  ['Lateral Thinking Paradoxes', 'Querdenker-Paradoxien', 'Nghịch lý tư duy sáng tạo'],
  ['The Prisoner’s Dilemma Variants', 'Varianten des Gefangenendilemmas', 'Biến thể thế lưỡng nan tù nhân'],
  ['Knights and Knaves Meta-Chains', 'Verschachtelte Ritter und Schurken', 'Chuỗi hiệp sĩ và kẻ nói dối'],
  ['Infinite Horizon Games', 'Spiele mit unendlichem Horizont', 'Trò chơi với chân trời vô hạn'],
  ['Fuzzy Logic Categorization', 'Unscharfe Logik', 'Phân loại logic mờ'],
  ['Combinatorial Optimizations', 'Kombinatorische Optimierung', 'Tối ưu tổ hợp'],
  ['Chaos Logic Navigation', 'Navigation im Chaos', 'Điều hướng trong hỗn loạn'],
  ['Quantum Logic Rules', 'Quantenlogik', 'Quy tắc logic lượng tử'],
  ['Mislabeled Multi-Tier Inventories', 'Mehrstufig falsch beschriftete Kisten', 'Kho nhiều tầng dán nhãn sai'],
  ['Topological Invariance', 'Topologische Invarianz', 'Bất biến tô pô'],
  ['Non-Euclidean Geometry Mazes', 'Nichteuklidische Labyrinthe', 'Mê cung hình học phi Euclid'],
  ['Algorithmic Complexity Reduction', 'Algorithmen vereinfachen', 'Giảm độ phức tạp thuật toán'],
  ['The Ultimate Meta-Puzzle', 'Das ultimative Meta-Rätsel', 'Câu đố meta tối thượng'],
];

export const LOGIC_TOPICS = TOPIC_TITLES.map(([en, de, vi], index) => ({
  id: index + 1,
  tier: Math.floor(index / 20) + 1,
  en,
  de,
  vi,
}));

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

type GeneratedLogicPuzzle = Omit<LogicPuzzle, 'topicId' | 'topicName'>;

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
  lang: Language,
  group: number,
  promptDe: string,
  promptVi: string,
  visual: string,
  answer: string,
  distractors: string[],
): GeneratedLogicPuzzle {
  const options = new Set([answer]);
  const wrongAnswers = distractors.filter((option) => option && option !== answer);
  for (const option of wrongAnswers) options.add(option);
  for (let offset = 1; options.size < 4; offset++) {
    const numericAnswer = Number(answer);
    const fallback = Number.isFinite(numericAnswer)
      ? String(numericAnswer + offset)
      : word(lang, `Andere Antwort ${offset}`, `Đáp án khác ${offset}`);
    if (!options.has(fallback)) options.add(fallback);
  }
  return {
    group,
    prompt: word(lang, promptDe, promptVi),
    visual,
    choices: shuffle([...options].map((art) => ({ art, correct: art === answer }))),
  };
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

const generators: Array<(lang: Language) => GeneratedLogicPuzzle> = [
  (lang) => {
    const first = 2 + Math.floor(Math.random() * 8);
    const second = 1 + Math.floor(Math.random() * 9);
    const subtract = Math.random() < 0.5 && first > second;
    const answer = subtract ? first - second : first + second;
    return { group: 2, prompt: word(lang, 'Rechne aus!', 'Hãy tính nhé!'), visual: `${first} ${subtract ? '−' : '+'} ${second} = ?`, choices: numberChoices(answer) };
  },
  (lang) => {
    const geometric = Math.random() < 0.5;
    const start = geometric ? 1 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 8);
    const step = geometric ? 2 : 2 + Math.floor(Math.random() * 4);
    const sequence = Array.from({ length: 4 }, (_, index) => geometric ? start * step ** index : start + step * index);
    const answer = geometric ? start * step ** 4 : start + step * 4;
    return { group: 2, prompt: word(lang, 'Welche Zahl folgt?', 'Số nào tiếp theo?'), visual: `${sequence.join('  ·  ')}  ·  ?`, choices: numberChoices(answer, [-5, -2, 2, 5]) };
  },
  (lang) => {
    const startsOn = Math.random() < 0.5;
    const toggles = 1 + Math.floor(Math.random() * 4);
    const isOn = toggles % 2 === 0 ? startsOn : !startsOn;
    return { group: 2, prompt: word(lang, `Der Schalter startet ${startsOn ? 'an' : 'aus'} und wird ${toggles}-mal umgelegt. Wo steht er jetzt?`, `Công tắc bắt đầu ở trạng thái ${startsOn ? 'bật' : 'tắt'} và được gạt ${toggles} lần. Bây giờ nó thế nào?`), visual: `${startsOn ? '🟢' : '⚫'}  ${'🔁 '.repeat(toggles)}`, choices: shuffle([{ art: '💡', label: word(lang, 'An', 'Bật'), correct: isOn }, { art: '⚫', label: word(lang, 'Aus', 'Tắt'), correct: !isOn }]) };
  },
  (lang) => {
    const lengths = sample([8, 10, 12, 14, 16, 18, 20], 4);
    const longest = Math.max(...lengths);
    return { group: 1, prompt: word(lang, 'Welcher Stift ist am längsten?', 'Cây bút nào dài nhất?'), visual: lengths.map((length) => `✏️ ${length} cm`).join('   '), choices: shuffle(lengths.map((length) => ({ art: `${length} cm`, correct: length === longest }))) };
  },
  (lang) => {
    const relations = [
      { items: MOTHERS, prompt: word(lang, 'Welches Tierbaby gehört dazu?', 'Con vật con nào thuộc về con vật này?') },
      { items: HOMES, prompt: word(lang, 'Wo lebt dieses Tier?', 'Con vật này sống ở đâu?') },
      { items: FOODS, prompt: word(lang, 'Was frisst dieses Tier?', 'Con vật này ăn gì?') },
    ];
    const relationType = pick(relations);
    const relation = pick(relationType.items);
    const pool = relationType.items.filter((item) => item !== relation && item.answer.emoji !== relation.answer.emoji).map((item) => item.answer);
    return { group: 0, prompt: relationType.prompt, visual: relation.visual, choices: choices({ art: relation.answer.emoji, label: itemName(relation.answer, lang), correct: true }, otherPictures(pool, relation.answer, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang) }))) };
  },
  (lang) => {
    const stories = [
      { sequence: ['🌰', '🌱', '🌿', '🌳'], de: 'Ein Samen wächst.', vi: 'Hạt giống lớn lên.' },
      { sequence: ['🥚', '🐣', '🐥', '🐔'], de: 'Ein Küken schlüpft.', vi: 'Gà con nở ra.' },
      { sequence: ['🧼', '👐', '💧', '✨'], de: 'Hände werden gewaschen.', vi: 'Rửa tay sạch sẽ.' },
      { sequence: ['🧩', '🧩🧩', '🧩🧩🧩', '🖼️'], de: 'Ein Puzzle wird fertig.', vi: 'Hoàn thành trò chơi ghép hình.' },
    ];
    const story = pick(stories);
    const [first, second, third, answer] = story.sequence;
    const distractors = stories.map((item) => item.sequence[3]).filter((item) => item !== answer);
    return { group: 3, prompt: word(lang, `Was kommt als Nächstes? ${story.de}`, `Điều gì xảy ra tiếp theo? ${story.vi}`), visual: `${first}  →  ${second}  →  ${third}  →  ?`, choices: choices({ art: answer, correct: true }, sample(distractors, 3).map((art) => ({ art }))) };
  },
  (lang) => {
    const patterns = [
      { items: ['🔴', '🔵'], sequence: [0, 1, 0, 1, 0], answer: 1 },
      { items: ['⭐', '🌙'], sequence: [0, 0, 1, 0, 0], answer: 1 },
      { items: ['🔺', '🟦', '⚪'], sequence: [0, 1, 2, 0, 1], answer: 2 },
    ];
    const pattern = pick(patterns);
    const visible = pattern.sequence.map((index) => pattern.items[index]);
    return { group: 2, prompt: word(lang, 'Setze das Muster fort!', 'Hãy tiếp tục quy luật!'), visual: `${visible.join('  ')}  ?`, choices: shuffle(pattern.items.map((art, index) => ({ art, correct: index === pattern.answer }))) };
  },
  (lang) => {
    const routes = [
      { map: '🚶 ➡️ ⬆️ ➡️ 🏁', answer: '➡️' },
      { map: '🚶 ⬇️ ⬅️ ⬇️ 🏁', answer: '⬅️' },
      { map: '🚶 ⬅️ ⬆️ ⬅️ 🏁', answer: '⬆️' },
      { map: '🚶 ⬆️ ➡️ ⬆️ 🏁', answer: '⬆️' },
    ];
    const route = pick(routes);
    const firstDirection = route.map.split(' ')[1];
    const distractors = ['⬆️', '⬇️', '⬅️', '➡️'].filter((arrow) => arrow !== firstDirection);
    return { group: 1, prompt: word(lang, 'Folge dem Weg. Welche Richtung kommt zuerst?', 'Đi theo đường đi. Hướng nào xuất hiện đầu tiên?'), visual: route.map, choices: choices({ art: firstDirection, correct: true }, sample(distractors, 3).map((art) => ({ art }))) };
  },
  (lang) => {
    const color = pick(COLORS);
    const correct = pick(color.items);
    const otherItems = COLORS.filter((item) => item !== color).flatMap((item) => item.items);
    return { group: 0, prompt: word(lang, `Was gehört in den ${color.de} Korb?`, `Món nào nên vào giỏ màu ${color.vi}?`), visual: color.basket, choices: choices({ art: correct, correct: true }, sample(otherItems, 3).map((art) => ({ art }))) };
  },
  (lang) => {
    const group = pick(ODD_GROUPS);
    const same = sample([...new Set(group.members)], 3);
    const oddCandidates = ODD_GROUPS.filter((item) => item !== group).flatMap((item) => item.members).filter((item) => !same.includes(item));
    const odd = pick(oddCandidates);
    return { group: 0, prompt: word(lang, `Was passt nicht zu ${group.de}?`, `Món nào không thuộc nhóm ${group.vi}?`), visual: same.join('  '), choices: shuffle([...same.map((art) => ({ art })), { art: odd, correct: true }]) };
  },
  (lang) => {
    const target = pick(ANIMALS);
    return { group: 0, prompt: word(lang, 'Welcher Schatten passt zum Bild?', 'Bóng nào khớp với hình này?'), visual: target.emoji, choices: choices({ art: target.emoji, label: itemName(target, lang), correct: true, silhouette: true }, otherPictures(ANIMALS, target, 3).map((item) => ({ art: item.emoji, label: itemName(item, lang), silhouette: true }))) };
  },
  (lang) => {
    const count = 2 + Math.floor(Math.random() * 7);
    const object = pick(NUMBER_OBJECTS);
    return { group: 2, prompt: word(lang, 'Wie viele Bilder siehst du?', 'Có bao nhiêu hình?'), visual: Array.from({ length: count }, () => object).join(' '), choices: numberChoices(count, [-3, -2, 1, 2]) };
  },
  (lang) => {
    const target = pick(MATCH_ITEMS);
    const candidates = sample(MATCH_ITEMS.filter((item) => item !== target), 3);
    return { group: 0, prompt: word(lang, 'Finde genau dasselbe Bild!', 'Hãy tìm hình giống hệt!'), visual: target.emoji, choices: choices({ art: target.emoji, label: itemName(target, lang), correct: true }, candidates.map((item) => ({ art: item.emoji, label: itemName(item, lang) }))) };
  },
  (lang) => {
    const [topLeft, topRight] = sample(['🔴', '🔵', '⭐', '🌙'], 2);
    return { group: 1, prompt: word(lang, 'Welche Form gehört in die leere Ecke?', 'Hình nào thuộc vào ô trống?'), visual: `${topLeft}  ${topRight}\n${topRight}  ?`, choices: shuffle([{ art: topLeft, correct: true }, { art: topRight }, ...sample(['🔺', '🟩'], 2).map((art) => ({ art }))]) };
  },
  (lang) => {
    const appleWeight = 2 + Math.floor(Math.random() * 5);
    const bananaWeight = appleWeight + 2;
    return { group: 2, prompt: word(lang, 'Die Waage ist im Gleichgewicht. Wie viel wiegt die Banane?', 'Cân đang thăng bằng. Quả chuối nặng bao nhiêu?'), visual: `⚖️  🍎 + 🍌 = ${appleWeight + bananaWeight} kg\n🍎 + 🍎 = ${appleWeight * 2} kg`, choices: numberChoices(bananaWeight, [-2, -1, 1, 2]).map((choice) => ({ ...choice, label: `${choice.art} kg` })) };
  },
  (lang) => {
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
    return { group: 2, prompt: word(lang, 'Welcher Buchstabe kommt als Nächstes?', 'Chữ cái nào tiếp theo?'), visual: `${sequence.join('  ·  ')}  ·  ?`, choices: choices({ art: answer, correct: true }, distractors.map((art) => ({ art }))) };
  },
  (lang) => {
    const validRoutes = ['🟦 → 🟦 → 🏁', '🟦 → 🟦 → 🟦 → 🏁'];
    const invalidRoutes = ['🟦 → 🟥 → 🏁', '🟥 → 🟦 → 🏁', '🟩 → 🟦 → 🏁'];
    const answer = pick(validRoutes);
    return { group: 0, prompt: word(lang, 'Gehe nur über blaue Felder. Welcher Weg klappt?', 'Chỉ đi qua ô màu xanh. Đường nào đúng?'), visual: '🟦 = sicher   🟥 = gesperrt', choices: choices({ art: answer, correct: true }, sample([...validRoutes.filter((route) => route !== answer), ...invalidRoutes], 3).map((art) => ({ art }))) };
  },
  (lang) => {
    const start = 1 + Math.floor(Math.random() * 9);
    const advance = 1 + Math.floor(Math.random() * 3);
    const answer = ((start - 1 + advance) % 12) + 1;
    const distractors = [((answer + 10) % 12) + 1, (answer % 12) + 1, ((answer + 8) % 12) + 1];
    return { group: 2, prompt: word(lang, `Es ist ${start} Uhr. Wie spät ist es in ${advance} Stunden?`, `Bây giờ là ${start} giờ. Sau ${advance} giờ là mấy giờ?`), visual: `🕒  ${start}:00  →  ?`, choices: choices({ art: `${answer}:00`, correct: true }, distractors.map((art) => ({ art: `${art}:00` }))) };
  },
  (lang) => {
    const pieces = 2 + Math.floor(Math.random() * 5);
    const shape = pick(['🔺', '🟦', '⚪']);
    return { group: 1, prompt: word(lang, 'Aus wie vielen gleichen Teilen besteht die Form?', 'Hình này gồm bao nhiêu phần bằng nhau?'), visual: `⬜  →  ${Array.from({ length: pieces }, () => shape).join(' ')}`, choices: numberChoices(pieces, [-2, -1, 1, 2]) };
  },
  (lang) => {
    const candidates = [
      { art: '🍓', fruit: true, red: true }, { art: '🍌', fruit: true, red: false },
      { art: '🍎', fruit: true, red: true }, { art: '🚗', fruit: false, red: true },
      { art: '🍇', fruit: true, red: false }, { art: '🐟', fruit: false, red: false },
    ];
    const target = pick(candidates.filter((item) => item.fruit && item.red));
    return { group: 0, prompt: word(lang, 'Finde etwas, das eine Frucht UND rot ist.', 'Tìm thứ vừa là trái cây VÀ có màu đỏ.'), visual: '🍎∩🔴', choices: choices({ art: target.art, correct: true }, sample(candidates.filter((item) => item !== target && !(item.fruit && item.red)), 3).map((item) => ({ art: item.art }))) };
  },
];

function advancedPuzzle(topicId: number, lang: Language): GeneratedLogicPuzzle {
  const group = (topicId - 1) % LOGIC_GROUPS.length;
  switch (topicId) {
    case 21: {
      const [first, middle, last] = sample(['Ari', 'Ben', 'Cem', 'Dia'], 3);
      return textPuzzle(lang, group, `${first}, ${middle} und ${last} stehen in einer Reihe. ${first} steht vor ${middle}, ${last} nach ${middle}. Wer steht in der Mitte?`, `${first}, ${middle} và ${last} xếp thành hàng. ${first} đứng trước ${middle}, ${last} đứng sau ${middle}. Ai đứng giữa?`, `${first} → ${middle} → ${last}`, middle, [first, last, 'Niemand']);
    }
    case 22: {
      const red = 2 + Math.floor(Math.random() * 5);
      const blue = 1 + Math.floor(Math.random() * 4);
      const total = red + blue;
      return textPuzzle(lang, group, `In einer Tüte liegen ${red} rote und ${blue} blaue Kugeln. Wie groß ist die Chance auf Rot?`, `Trong túi có ${red} viên đỏ và ${blue} viên xanh. Xác suất lấy được viên đỏ là bao nhiêu?`, `🔴 × ${red}　🔵 × ${blue}`, `${red}/${total}`, [`${blue}/${total}`, `1/${total}`, `${red}/${total + 1}`]);
    }
    case 23: {
      const [a, b] = sample(['Ari', 'Ben', 'Cem', 'Dia'], 2);
      return textPuzzle(lang, group, `Genau eine Person sagt immer die Wahrheit. ${a} sagt: „${b} lügt.“ ${b} sagt: „Wir sind verschieden.“ Wer sagt die Wahrheit?`, `Chỉ một người luôn nói thật. ${a} nói: “${b} nói dối.” ${b} nói: “Chúng tôi khác nhau.” Ai nói thật?`, `${a}: ${b} lügt\n${b}: Wir sind verschieden`, b, [a, 'Beide', 'Niemand']);
    }
    case 24: {
      const shirts = 2 + Math.floor(Math.random() * 5);
      const hats = 2 + Math.floor(Math.random() * 4);
      const answer = shirts * hats;
      const wrong = numberChoices(answer).filter((choice) => !choice.correct).map((choice) => choice.art);
      return textPuzzle(lang, group, `Du hast ${shirts} Hemden und ${hats} Hüte. Wie viele Outfits kannst du bilden?`, `Bạn có ${shirts} áo và ${hats} mũ. Có bao nhiêu cách phối đồ?`, `${shirts} × ${hats} = ?`, String(answer), wrong);
    }
    case 25: {
      const people = sample(['Ava', 'Ben', 'Cara', 'Duc'], 3);
      const pets = sample(['🐱', '🐶', '🐦', '🐰'], 3);
      return textPuzzle(lang, group, 'Jede Person hat ein anderes Tier. Welches Tier fehlt?', 'Mỗi người có một con vật khác nhau. Con vật nào còn thiếu?', `${people[0]} ${pets[0]}\n${people[1]} ${pets[1]}\n${people[2]} ?`, pets[2], pets.filter((pet) => pet !== pets[2]).slice(0, 3));
    }
    case 26: {
      const [a, b, c, d, e, f] = sample(['A', 'B', 'C', 'D', 'E', 'F'], 6);
      return textPuzzle(lang, group, `Welches Feld liegt im Würfelnetz gegenüber von ${b}?`, `Ô nào đối diện với ${b} trong hình khai triển khối lập phương?`, `　${e}\n${a} ${b} ${c} ${d}\n　${f}`, d, [a, c, e]);
    }
    case 27: {
      const ladders = [
        { start: 'COLD', next: 'CORD', wrong: ['CARD', 'WARM', 'COLD'] },
        { start: 'HAND', next: 'HARD', wrong: ['CARD', 'HARE', 'BEND'] },
        { start: 'HEAD', next: 'HEAL', wrong: ['DEAL', 'HEART', 'HAND'] },
      ];
      const ladder = pick(ladders);
      return textPuzzle(lang, group, `Ändere genau einen Buchstaben. Welches Wort kann ein Schritt von ${ladder.start} sein?`, `Đổi đúng một chữ cái. Từ nào có thể là một bước từ ${ladder.start}?`, `${ladder.start} → ?`, ladder.next, ladder.wrong);
    }
    case 28: {
      const rebuses = [
        { visual: 'STAND\n　I', answer: 'UNDERSTAND', wrong: ['OUTSTAND', 'STANDING', 'INSIDE'] },
        { visual: 'MAN\n↑\nBOARD', answer: 'MAN OVERBOARD', wrong: ['BOARDMAN', 'MAN ABOARD', 'OVERMAN'] },
        { visual: 'HEAD\n↑\nHEELS', answer: 'HEAD OVER HEELS', wrong: ['HEELHEAD', 'HEAD TO TOE', 'OVERHEAD'] },
      ];
      const rebus = pick(rebuses);
      return textPuzzle(lang, group, 'Lies das Bilderrätsel: Was bedeutet die Anordnung?', 'Đọc câu đố hình: Cách sắp xếp này có nghĩa gì?', rebus.visual, rebus.answer, rebus.wrong);
    }
    case 29:
    case 33: {
      const symbols = sample(topicId === 29 ? ['1', '2', '3'] : ['🔺', '⚪', '🟦'], 3);
      const rows = Array.from({ length: 3 }, (_, row) => Array.from({ length: 3 }, (_, col) => symbols[(row + col) % 3]));
      const blank = Math.floor(Math.random() * 9);
      const answer = rows[Math.floor(blank / 3)][blank % 3];
      rows[Math.floor(blank / 3)][blank % 3] = '?';
      const visual = rows.map((row) => row.join(' ')).join('\n');
      return textPuzzle(lang, group, 'Jede Zeile und Spalte braucht jedes Zeichen genau einmal. Was fehlt?', 'Mỗi hàng và cột cần mỗi ký hiệu đúng một lần. Ký hiệu nào còn thiếu?', visual, answer, symbols.filter((symbol) => symbol !== answer).concat(topicId === 29 ? '4' : '⭐').slice(0, 3));
    }
    case 30: {
      const words = ['CAT', 'BAT', 'RAT', 'HAT'];
      const answer = pick(words);
      return textPuzzle(lang, group, `Ein Kreuzwort hat das Muster _AT. Die Kreuzung gibt den ersten Buchstaben ${answer[0]}. Welches Wort passt?`, `Ô chữ có mẫu _AT. Giao điểm cho chữ cái đầu là ${answer[0]}. Từ nào đúng?`, `${answer[0]} _ T`, answer, words.filter((word) => word !== answer));
    }
    case 31: {
      const words = [
        { letters: 'T A C', hint: 'beginnt mit C und endet mit T', answer: 'CAT', wrong: ['ACT', 'TAC', 'CTA'] },
        { letters: 'G O D', hint: 'beginnt mit D und endet mit G', answer: 'DOG', wrong: ['GOD', 'ODG', 'DGO'] },
        { letters: 'R A E', hint: 'beginnt mit E und endet mit R', answer: 'EAR', wrong: ['ARE', 'ERA', 'RAE'] },
      ];
      const item = pick(words);
      return textPuzzle(lang, group, `Ordne die Buchstaben. Das Wort ${item.hint}.`, `Sắp xếp chữ cái. Từ ${item.hint}.`, item.letters, item.answer, item.wrong);
    }
    case 32: {
      const cells = sample(['🍎', '🔑', '⭐', '🐟'], 4);
      const blank = Math.floor(Math.random() * 4);
      const answer = cells[blank];
      const shown = [...cells];
      shown[blank] = '?';
      const target = ['A1', 'B1', 'A2', 'B2'][blank];
      return textPuzzle(lang, group, `Im Gitter bedeutet der Buchstabe die Spalte und die Zahl die Zeile. Was steht bei ${target}?`, `Trong lưới, chữ cái là cột và số là hàng. Ô ${target} có gì?`, `　A　B\n1 ${shown[0]} ${shown[1]}\n2 ${shown[2]} ${shown[3]}`, answer, cells.filter((cell) => cell !== answer));
    }
    case 34: {
      const crossing = pick([
        { items: ['🦊', '🐐', '🥬'], answer: '🐐' },
        { items: ['🐺', '🐑', '🌿'], answer: '🐑' },
        { items: ['🐈', '🐦', '🌾'], answer: '🐦' },
      ]);
      return textPuzzle(lang, group, 'Der Fährmann kann immer nur eines mitnehmen. Was muss zuerst ans andere Ufer?', 'Người lái đò chỉ chở được một thứ mỗi lần. Cần đưa thứ gì sang bờ bên kia trước?', crossing.items.join('　') + '　⛵', crossing.answer, crossing.items.filter((item) => item !== crossing.answer));
    }
    case 35: {
      const people = sample(['Ava', 'Ben', 'Cara', 'Duc'], 3);
      const pets = sample(['Katze', 'Hund', 'Vogel'], 3);
      return textPuzzle(lang, group, `${people[0]}, ${people[1]} und ${people[2]} haben je ein anderes Tier. ${people[0]} hat ${pets[0]}, ${people[1]} hat ${pets[1]}. Wer hat ${pets[2]}?`, `${people[0]}, ${people[1]} và ${people[2]} mỗi người có một con vật khác nhau. ${people[0]} có ${pets[0]}, ${people[1]} có ${pets[1]}. Ai có ${pets[2]}?`, `${people.join(' · ')}`, people[2], people.slice(0, 2));
    }
    case 36: {
      const categories = pick([
        { de: ['Tiger', 'Katzen', 'Tiere'], vi: ['hổ', 'mèo', 'động vật'] },
        { de: ['Rosen', 'Blumen', 'Pflanzen'], vi: ['hoa hồng', 'hoa', 'thực vật'] },
        { de: ['Dackel', 'Hunde', 'Tiere'], vi: ['chó lạp xưởng', 'chó', 'động vật'] },
      ]);
      const [subset, superset, member] = lang === 'de' ? categories.de : categories.vi;
      return textPuzzle(lang, group, `Alle ${categories.de[0]} sind ${categories.de[1]}. Alle ${categories.de[1]} sind ${categories.de[2]}. Sind alle ${categories.de[0]} ${categories.de[2]}?`, `Mọi ${categories.vi[0]} đều là ${categories.vi[1]}. Mọi ${categories.vi[1]} đều là ${categories.vi[2]}. Vậy mọi ${categories.vi[0]} có phải ${categories.vi[2]} không?`, `${subset} → ${superset} → ${member}`, word(lang, '✅ Ja', '✅ Đúng'), [word(lang, '❌ Nein', '❌ Sai'), word(lang, 'Manchmal', 'Đôi khi'), word(lang, 'Nicht bestimmbar', 'Không thể kết luận')]);
    }
    case 37: {
      const pairs = [
        { left: '🔑 : 🔒', relation: 'Schlüssel öffnet Schloss. Passwort öffnet …?', vi: 'Chìa khóa mở ổ khóa. Mật khẩu mở …?', answer: '👤', wrong: ['🔑', '🚪', '⌨️'] },
        { left: '✏️ : Papier', relation: 'Stift schreibt auf Papier. Pinsel malt auf …?', vi: 'Bút viết trên giấy. Cọ vẽ trên …?', answer: '🖼️', wrong: ['✏️', '🎨', '🧽'] },
        { left: '🐝 : Honig', relation: 'Biene macht Honig. Kuh gibt …?', vi: 'Ong tạo mật. Bò cho …?', answer: '🥛', wrong: ['🧶', '🥚', '🥜'] },
      ];
      const pair = pick(pairs);
      return textPuzzle(lang, group, pair.relation, pair.vi, `${pair.left} = ?`, pair.answer, pair.wrong);
    }
    case 38: {
      const [a, b, c, d] = sample(['A', 'B', 'C', 'D', 'E', 'F'], 4);
      return textPuzzle(lang, group, `Finde einen Weg von ${a} nach ${d}, ohne einen Knoten zweimal zu besuchen.`, `Tìm đường từ ${a} đến ${d} mà không đi qua nút nào hai lần.`, `${a}—${b}—${d}\n${a}—${c}—${d}`, `${a} → ${b} → ${d}`, [`${a} → ${b} → ${a} → ${d}`, `${a} → ${c} → ${b} → ${d}`, `${a} → ${a} → ${d}`]);
    }
    case 39: {
      const maxTake = 2 + Math.floor(Math.random() * 3);
      const answer = 1 + Math.floor(Math.random() * maxTake);
      const pile = (maxTake + 1) * (2 + Math.floor(Math.random() * 3)) + answer;
      return textPuzzle(lang, group, `Es liegen ${pile} Streichhölzer. Nimm 1 bis ${maxTake}; wer das letzte nimmt, gewinnt. Was ist der beste erste Zug?`, `Có ${pile} que diêm. Mỗi lượt lấy 1 đến ${maxTake} que; ai lấy que cuối cùng thắng. Nước đầu tốt nhất là gì?`, `🔥 × ${pile} · pro Zug 1–${maxTake}`, String(answer), sample(Array.from({ length: maxTake + 3 }, (_, index) => String(index + 1)).filter((value) => value !== String(answer)), 3));
    }
    case 40: {
      const start = 1 + Math.floor(Math.random() * 5);
      const left = [start, start + 1, start + 2, start + 4];
      const right = [start + 1, start + 2, start + 3, start + 5];
      const answer = `{${left.filter((value) => right.includes(value)).join(', ')}}`;
      return textPuzzle(lang, group, 'Welche Zahlen liegen in beiden Mengen?', 'Những số nào nằm trong cả hai tập hợp?', `{${left.join(', ')}} ∩ {${right.join(', ')}}`, answer, [`{${left[0]}}`, `{${left[0]}, ${right[3]}}`, `{${left.join(', ')}, ${right[3]}}`]);
    }
    case 41: {
      const original = 2 + Math.floor(Math.random() * 9);
      const multiplier = 2 + Math.floor(Math.random() * 3);
      const added = 1 + Math.floor(Math.random() * 8);
      const result = original * multiplier + added;
      return textPuzzle(lang, group, `Arbeite rückwärts: Eine Zahl wird mit ${multiplier} multipliziert und dann um ${added} erhöht. Das Ergebnis ist ${result}. Welche Zahl war es?`, `Làm ngược lại: một số được nhân ${multiplier} rồi cộng ${added}, kết quả là ${result}. Số ban đầu là bao nhiêu?`, `□ × ${multiplier} + ${added} = ${result}`, String(original), numberChoices(original).filter((choice) => !choice.correct).map((choice) => choice.art));
    }
    case 42: {
      const coins = 5 + Math.floor(Math.random() * 7);
      const initialHeads = Math.floor(Math.random() * (coins + 1));
      return textPuzzle(lang, group, `Du drehst immer genau 2 von ${coins} Münzen um. Start: ${initialHeads} zeigen Kopf. Was bleibt immer gleich?`, `Mỗi lượt bạn lật đúng 2 trong ${coins} đồng xu. Ban đầu có ${initialHeads} mặt ngửa. Điều gì luôn giữ nguyên?`, `🪙 × ${coins} · Start: ${initialHeads} Kopf`, initialHeads % 2 === 0 ? 'Gerade Kopfzahl' : 'Ungerade Kopfzahl', [initialHeads % 2 === 0 ? 'Ungerade Kopfzahl' : 'Gerade Kopfzahl', 'Alle zeigen Kopf', 'Keine zeigt Kopf']);
    }
    case 43: {
      const first = 30 + Math.floor(Math.random() * 51);
      const second = 30 + Math.floor(Math.random() * Math.max(1, 151 - first - 30));
      const answer = 180 - first - second;
      return textPuzzle(lang, group, `Zwei Winkel eines Dreiecks sind ${first}° und ${second}°. Wie groß ist der dritte?`, `Hai góc của tam giác là ${first}° và ${second}°. Góc thứ ba bằng bao nhiêu?`, `${first}° + ${second}° + ? = 180°`, `${answer}°`, [`${answer + 10}°`, `${answer - 10}°`, `${first}°`]);
    }
    case 44: {
      const budget = 8 + Math.floor(Math.random() * 9);
      const count = Math.floor(budget / 2);
      const answer = count * 3;
      const useOther = Math.floor(budget / 5) * 5;
      return textPuzzle(lang, group, `Du hast ${budget} Münzen. Rote Kisten kosten 2 und bringen 3 Punkte; blaue kosten 5 und bringen 5. Wie hoch ist der beste Gewinn?`, `Bạn có ${budget} xu. Hộp đỏ giá 2 xu được 3 điểm; hộp xanh giá 5 xu được 5 điểm. Điểm cao nhất là bao nhiêu?`, `Budget ${budget} · Rot 2→3 · Blau 5→5`, String(Math.max(answer, useOther)), [String(answer - 1), String(answer + 1), String(useOther + 1)]);
    }
    case 45: {
      const [fruitA, fruitB] = sample([
        { de: 'Äpfel', vi: 'táo', art: '🍎' }, { de: 'Birnen', vi: 'lê', art: '🍐' },
        { de: 'Kirschen', vi: 'anh đào', art: '🍒' }, { de: 'Pflaumen', vi: 'mận', art: '🫐' },
      ], 2);
      return textPuzzle(lang, group, `Alle Kisten sind falsch beschriftet: ${fruitA.de}, ${fruitB.de}, Gemischt. Aus welcher Kiste ziehst du zuerst?`, `Các hộp đều dán nhãn sai: ${fruitA.vi}, ${fruitB.vi}, Hỗn hợp. Bạn lấy thử từ hộp nào trước?`, `${fruitA.art}　${fruitB.art}　📦🌈\nAlle Etiketten falsch`, word(lang, 'Gemischt', 'Hỗn hợp'), [fruitA.de, fruitB.de, word(lang, 'Beliebige Kiste', 'Bất kỳ hộp nào')]);
    }
    case 46: {
      const [first, second, third] = sample(['Mira', 'Leo', 'Tom', 'Nia', 'Kai'], 3);
      return textPuzzle(lang, group, `${first} läuft vor ${second}. ${second} läuft vor ${third}. Wer ist zuerst im Ziel?`, `${first} chạy trước ${second}. ${second} chạy trước ${third}. Ai về đích đầu tiên?`, `${first} > ${second} > ${third}`, first, [second, third, 'Nicht bestimmbar']);
    }
    case 47: {
      const areaA = 6 + Math.floor(Math.random() * 15);
      const areaB = 5 + Math.floor(Math.random() * 14);
      const overlap = 1 + Math.floor(Math.random() * Math.min(areaA, areaB) / 2);
      const answer = areaA + areaB - overlap;
      return textPuzzle(lang, group, `Rechteck A hat ${areaA} cm², B hat ${areaB} cm². Ihre gemeinsame Fläche ist ${overlap} cm². Wie groß ist die Gesamtfläche?`, `Hình chữ nhật A có ${areaA} cm², B có ${areaB} cm². Phần chồng nhau là ${overlap} cm². Tổng diện tích là bao nhiêu?`, `${areaA} + ${areaB} − ${overlap} = ?`, `${answer} cm²`, [`${areaA + areaB} cm²`, `${answer + overlap} cm²`, `${Math.abs(areaA - areaB)} cm²`]);
    }
    case 48: {
      const start = 1 + Math.floor(Math.random() * 8);
      return textPuzzle(lang, group, 'Finde das Muster in Zeilen und Spalten. Welche Zahl fehlt?', 'Tìm quy luật theo hàng và cột. Số nào còn thiếu?', `${start} ${start + 1} ${start + 2}\n${start + 1} ${start + 2} ${start + 3}\n${start + 2} ${start + 3} ?`, String(start + 4), [String(start + 3), String(start + 5), String(start + 6)]);
    }
    case 49: {
      const [a, b, c] = sample(['Ari', 'Ben', 'Cem', 'Dia'], 3);
      return textPuzzle(lang, group, `${a}, ${b} und ${c} sind Wahrheitssager, Lügner und Joker. ${a}: „${b} ist Joker.“ ${b}: „${c} ist Lügner.“ ${c}: „${a} sagt die Wahrheit.“ Wer ist wer?`, `${a}, ${b} và ${c} lần lượt là người nói thật, nói dối và Joker. ${a}: “${b} là Joker.” ${b}: “${c} nói dối.” ${c}: “${a} nói thật.” Ai là ai?`, 'Joker darf wahr oder falsch sprechen', `${a}=Joker, ${b}=Wahr, ${c}=Lügner`, [`${a}=Wahr, ${b}=Lügner, ${c}=Joker`, `${a}=Lügner, ${b}=Joker, ${c}=Wahr`, `${a}=Wahr, ${b}=Joker, ${c}=Lügner`]);
    }
    case 50: {
      const small = 2 + Math.floor(Math.random() * 4);
      const large = small + 1 + Math.floor(Math.random() * 5);
      const answer = large - small;
      return textPuzzle(lang, group, `Du hast einen ${large}-L- und einen ${small}-L-Krug. Fülle den großen und gieße den kleinen ganz voll. Wie viel bleibt im großen Krug?`, `Bạn có bình ${large} L và ${small} L. Đổ đầy bình lớn rồi rót đầy bình nhỏ. Bình lớn còn lại bao nhiêu?`, `${large} L − ${small} L = ?`, `${answer} L`, [`${small} L`, `${large} L`, `${answer + 1} L`]);
    }
    case 51: {
      const prime = pick([2, 3, 5, 7]);
      const answer = prime * prime;
      return textPuzzle(lang, group, `Welche Zahl kleiner als 50 hat genau drei positive Teiler?`, `Số nào nhỏ hơn 50 có đúng ba ước số dương?`, `1 · ? · ${answer}`, String(answer), [String(prime), String(answer + 1), String(answer + prime)]);
    }
    case 52: {
      const length = 5 + Math.floor(Math.random() * 11);
      const width = 3 + Math.floor(Math.random() * 8);
      const answer = 2 * (length + width);
      return textPuzzle(lang, group, `Ein Rechteck ist ${length} cm lang und ${width} cm breit. Wie groß ist sein Umfang?`, `Hình chữ nhật dài ${length} cm, rộng ${width} cm. Chu vi là bao nhiêu?`, `${length} + ${width} + ${length} + ${width}`, `${answer} cm`, [`${length * width} cm`, `${length + width} cm`, `${answer + 2} cm`]);
    }
    case 53: {
      const colors = 2 + Math.floor(Math.random() * 6);
      return textPuzzle(lang, group, `Im Dunkeln liegen Socken in ${colors} Farben. Wie viele musst du mindestens nehmen, um ein gleichfarbiges Paar sicher zu haben?`, `Trong bóng tối có tất ${colors} màu. Ít nhất phải lấy bao nhiêu chiếc để chắc chắn có một đôi cùng màu?`, `${colors} Farben · Paar gesucht`, String(colors + 1), [String(colors), String(colors + 2), String(colors * 2)]);
    }
    case 54: {
      const lighter = 3 + Math.floor(Math.random() * 8);
      const heavier = lighter + 2 + Math.floor(Math.random() * 8);
      return textPuzzle(lang, group, `Zwei Gewichte wiegen zusammen ${lighter + heavier} kg. Das leichtere wiegt ${lighter} kg. Wie schwer ist das andere?`, `Hai vật nặng tổng cộng ${lighter + heavier} kg. Vật nhẹ hơn nặng ${lighter} kg. Vật còn lại nặng bao nhiêu?`, `A + B = ${lighter + heavier}\nA = ${lighter}`, `${heavier} kg`, [`${heavier - 1} kg`, `${lighter} kg`, `${heavier + 2} kg`]);
    }
    case 55: {
      const doors = 3 + Math.floor(Math.random() * 4);
      return textPuzzle(lang, group, `Bei ${doors} Türen öffnet der Moderator alle falschen Türen bis auf eine. Wie hoch ist die Gewinnchance beim Wechseln?`, `Có ${doors} cánh cửa. Người dẫn mở mọi cửa sai trừ một cửa. Xác suất thắng khi đổi là bao nhiêu?`, `🚪 × ${doors} · Wechseln`, `${doors - 1}/${doors}`, [`1/${doors}`, `1/2`, `${doors}/${doors}`]);
    }
    case 56: {
      const rules = [
        { de: 'Rot: links', vi: 'Đỏ: rẽ trái', color: '🔴', answer: '⬅️ Links', wrong: ['➡️ Rechts', '⬆️ Geradeaus', '⬇️ Zurück'] },
        { de: 'Blau: rechts', vi: 'Xanh: rẽ phải', color: '🔵', answer: '➡️ Rechts', wrong: ['⬅️ Links', '⬆️ Geradeaus', '⬇️ Zurück'] },
        { de: 'Gelb: umdrehen', vi: 'Vàng: quay lại', color: '🟡', answer: '⬇️ Zurück', wrong: ['⬅️ Links', '➡️ Rechts', '⬆️ Geradeaus'] },
      ];
      const rule = pick(rules);
      const directions = ['⬅️', '➡️', '⬆️', '⬇️'];
      const directionNames = lang === 'de' ? ['Links', 'Rechts', 'Geradeaus', 'Zurück'] : ['Trái', 'Phải', 'Đi thẳng', 'Quay lại'];
      const answerIndex = rule.answer.startsWith('⬅️') ? 0 : rule.answer.startsWith('➡️') ? 1 : rule.answer.startsWith('⬆️') ? 2 : 3;
      const options = directions.map((arrow, index) => `${arrow} ${directionNames[index]}`);
      return textPuzzle(lang, group, `Im Labyrinth gilt die Regel „${rule.de}“. Du erreichst das Feld. Wohin gehst du?`, `Trong mê cung có quy tắc “${rule.vi}”. Bạn đến ô đó. Đi hướng nào?`, `START → ${rule.color} → ?`, options[answerIndex], options.filter((_, index) => index !== answerIndex));
    }
    case 57: {
      const clue = Math.random() < 0.5 ? 0 : 4;
      const answer = clue === 0 ? 0 : 4;
      return textPuzzle(lang, group, `Bei Slitherlink zeigt eine Zelle ${clue}. Wie viele Linien müssen ihre Zellkanten berühren?`, `Trong Slitherlink, ô có số ${clue}. Có bao nhiêu cạnh của ô cần được vẽ?`, `┌───┐\n│ ${clue} │\n└───┘`, String(answer), clue === 0 ? ['1', '2', '4'] : ['0', '2', '3']);
    }
    case 58: {
      const clue = 1 + Math.floor(Math.random() * 4);
      const known = clue - 1;
      return textPuzzle(lang, group, `Eine Minesweeper-Zahl ${clue} berührt genau ${clue} Minen. ${known} angrenzende Minen sind bereits markiert. Ist das letzte Feld sicher?`, `Số ${clue} trong Minesweeper chạm đúng ${clue} ô mìn. Đã đánh dấu ${known} ô mìn cạnh nó. Ô cuối cùng có an toàn không?`, `💣 × ${known}　?　[${clue}]`, '💣 Mine', ['✅ Sicher', 'Immer sicher', 'Nicht angrenzend']);
    }
    case 59: {
      const units = 8 + 4 * Math.floor(Math.random() * 5);
      const pieceSize = 4;
      return textPuzzle(lang, group, `Ein Feld aus ${units} Einheitsquadraten wird mit Teilen aus je ${pieceSize} Quadraten gefüllt. Wie viele Teile brauchst du?`, `Một hình gồm ${units} ô vuông đơn vị được lát bằng miếng, mỗi miếng có ${pieceSize} ô. Cần bao nhiêu miếng?`, `${units} ÷ ${pieceSize} = ?`, String(units / pieceSize), [String(units / pieceSize - 1), String(units / pieceSize + 1), String(units)]);
    }
    case 60: {
      const first = 1 + Math.floor(Math.random() * 7);
      const second = 1 + Math.floor(Math.random() * 7);
      return textPuzzle(lang, group, `Zwei getrennte Wege haben Engpässe von ${first} und ${second} Einheiten. Wie viel kann insgesamt fließen?`, `Hai đường riêng có nút thắt lần lượt ${first} và ${second} đơn vị. Tổng luồng tối đa là bao nhiêu?`, `Quelle → (${first}) + (${second}) → Ziel`, String(first + second), [String(Math.max(first, second)), String(Math.min(first, second)), String(first + second + 1)]);
    }
    case 61: {
      const [a, b] = sample(['A', 'B', 'C', 'D'], 2);
      return textPuzzle(lang, group, `Eine Maschine fällt aus, wenn Pumpe ${a} ODER ${b} ausfällt. ${a} arbeitet. Welche Pumpe erklärt den Ausfall?`, `Máy ngừng nếu bơm ${a} HOẶC ${b} hỏng. ${a} đang hoạt động. Bơm nào giải thích sự cố?`, `Ausfall = ${a} defekt ODER ${b} defekt\n${a} ist OK`, `Pumpe ${b}`, [`Pumpe ${a}`, 'Beide müssen kaputt sein', 'Keine']);
    }
    case 62: {
      const regions = 3 + Math.floor(Math.random() * 2);
      return textPuzzle(lang, group, `${regions} Regionen grenzen alle aneinander. Wie viele Farben brauchst du mindestens, damit Nachbarn verschieden sind?`, `${regions} vùng đều tiếp giáp lẫn nhau. Cần ít nhất bao nhiêu màu để các vùng kề nhau khác màu?`, `Knoten: ${regions} · benachbarte Paare: alle`, String(regions), regions === 3 ? ['2', '4', '5'] : ['3', '5', '6']);
    }
    case 63: {
      const a = 5 + Math.floor(Math.random() * 4);
      return textPuzzle(lang, group, 'Jeder Buchstabe ist eine andere Ziffer. Löse A + A = BC.', 'Mỗi chữ là một chữ số khác nhau. Tìm A + A = BC.', 'A + A = BC', `A=${a}, B=1, C=${2 * a - 10}`, [`A=${a - 1}, B=1`, `A=${a}, B=2`, `A=${a + 1}, B=1`]);
    }
    case 64: {
      const [x, y, z] = sample(['p', 'q', 'r', 's'], 3);
      return textPuzzle(lang, group, `Es gilt ${x} < ${z} und ${z} < ${y}. Welche Reihenfolge stimmt?`, `Biết ${x} < ${z} và ${z} < ${y}. Thứ tự nào đúng?`, `${x} < ${z}　und　${z} < ${y}`, `${x} < ${z} < ${y}`, [`${z} < ${x} < ${y}`, `${y} < ${z} < ${x}`, `${x} < ${y} < ${z}`]);
    }
    case 65: {
      const directions = lang === 'de'
        ? ['⬆️ Norden', '➡️ Osten', '⬇️ Süden', '⬅️ Westen']
        : ['⬆️ Bắc', '➡️ Đông', '⬇️ Nam', '⬅️ Tây'];
      const start = Math.floor(Math.random() * 4);
      const turns = 1 + Math.floor(Math.random() * 3);
      const answer = directions[(start + turns) % 4];
      return textPuzzle(lang, group, lang === 'de'
        ? `Ein Pfeil zeigt ${directions[start].split(' ')[1]}. Drehe ihn ${turns}-mal um 90° nach rechts. Wohin zeigt er?`
        : `Mũi tên chỉ hướng ${directions[start].split(' ')[1]}. Xoay ${turns} lần, mỗi lần 90° sang phải. Nó chỉ hướng nào?`,
      lang === 'de' ? `Ein Pfeil zeigt ${directions[start].split(' ')[1]}. Drehe ihn ${turns}-mal um 90° nach rechts. Wohin zeigt er?` : `Mũi tên chỉ hướng ${directions[start].split(' ')[1]}. Xoay ${turns} lần, mỗi lần 90° sang phải. Nó chỉ hướng nào?`,
      `${directions[start].split(' ')[0]} × ${turns} ${word(lang, 'Rechtsdrehungen', 'lần xoay phải')}`, answer, directions.filter((direction) => direction !== answer));
    }
    case 66: {
      const switches = sample(['A', 'B', 'C'], 3);
      return textPuzzle(lang, group, 'Drei Schalter steuern drei Lampen im Nebenraum. Du darfst den Raum nur einmal betreten. Welche Methode findet alle Zuordnungen?', 'Ba công tắc điều khiển ba bóng đèn ở phòng bên. Bạn chỉ được vào phòng một lần. Cách nào tìm được tất cả kết nối?', 'Schalter A · B · C → 💡 💡 💡', `${switches[0]} einschalten, warten, aus; ${switches[1]} einschalten; dann Licht und Wärme prüfen`, ['Alle gleichzeitig einschalten', 'Jeden Schalter einmal drücken', 'Nur Schalter C einschalten']);
    }
    case 67: {
      const base = 2 + Math.floor(Math.random() * 5);
      const modulus = 5 + Math.floor(Math.random() * 5);
      const exponent = 40 + Math.floor(Math.random() * 61);
      const answer = modularPower(base, exponent, modulus);
      const wrongs = sample(Array.from({ length: modulus }, (_, value) => String(value)).filter((value) => value !== String(answer)), 3);
      return textPuzzle(lang, group, `Berechne den Rest von ${base}^${exponent}, geteilt durch ${modulus}.`, `Tính số dư của ${base}^${exponent} khi chia cho ${modulus}.`, `${base}^${exponent} mod ${modulus} = ?`, String(answer), wrongs);
    }
    case 68: {
      const people = 13 + Math.floor(Math.random() * 19);
      const guaranteed = Math.floor((people - 1) / 12) + 1;
      return textPuzzle(lang, group, `Bei ${people} Personen: Wie viele müssen mindestens im selben Geburtsmonat geboren sein?`, `Trong ${people} người: ít nhất bao nhiêu người chắc chắn cùng tháng sinh?`, '12 Geburtsmonate', String(guaranteed), [String(guaranteed + 1), String(guaranteed + 2), String(guaranteed - 1)]);
    }
    case 69: {
      const reward = 2 + Math.floor(Math.random() * 4);
      const temptation = reward + 2 + Math.floor(Math.random() * 4);
      return textPuzzle(lang, group, `Beim Gefangenendilemma: Kooperation gegen Kooperation bringt ${reward}, Verrat gegen Kooperation ${temptation}; gegen Verrat bringt Kooperation 0 und Verrat 1. Was ist der beste Einzelzug?`, `Trong thế lưỡng nan tù nhân: hai bên hợp tác được ${reward}; phản bội người hợp tác được ${temptation}; khi đối thủ phản bội, hợp tác được 0 và phản bội được 1. Nước đi cá nhân tốt nhất là gì?`, `Koop/Koop: ${reward} · Verrat/Koop: ${temptation} · Koop/Verrat: 0 · Verrat/Verrat: 1`, word(lang, 'Verraten', 'Phản bội'), [word(lang, 'Kooperieren', 'Hợp tác'), word(lang, 'Zufällig wählen', 'Chọn ngẫu nhiên'), word(lang, 'Aufgeben', 'Bỏ cuộc')]);
    }
    case 70: {
      const values = [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5];
      const answer = values[0] && (values[1] || !values[2]);
      const display = values.map((value, index) => `${'ABC'[index]}=${value ? '1' : '0'}`).join(' · ');
      return textPuzzle(lang, group, 'Werte den verschachtelten Wahrheitsausdruck aus.', 'Tính giá trị biểu thức chân lý lồng nhau.', `${display}\nA ∧ (B ∨ ¬C)`, answer ? '✅ 1' : '❌ 0', [answer ? '❌ 0' : '✅ 1', 'Beides', 'Unbekannt']);
    }
    case 71: {
      const paradox = pick([
        { de: 'Der Satz sagt: „Dieser Satz ist falsch.“', vi: 'Câu nói: “Câu này là sai.”', visual: 'S ↔ nicht S' },
        { de: 'Ein Barbier rasiert alle, die sich nicht selbst rasieren. Wen rasiert er?', vi: 'Một thợ cạo cạo râu cho mọi người không tự cạo. Ai cạo cho chính ông?', visual: 'Barbier: rasiert alle, die sich nicht selbst rasieren' },
      ]);
      return textPuzzle(lang, group, `${paradox.de} Welche Lösung ist möglich?`, `${paradox.vi} Lời giải nào có thể đúng?`, paradox.visual, 'Keine widerspruchsfreie Lösung', ['Immer wahr', 'Immer falsch', 'Beide Fälle zugleich']);
    }
    case 72: {
      const states = 3 + Math.floor(Math.random() * 8);
      return textPuzzle(lang, group, `Ein deterministischer Prozess hat ${states} mögliche Zustände und läuft ${states + 1}-mal. Was muss passieren?`, `Một quy trình xác định có ${states} trạng thái và chạy ${states + 1} lần. Điều gì chắc chắn xảy ra?`, `${states} Zustände · ${states + 1} Schritte`, 'Ein Zustand wiederholt sich', ['Alle Zustände sind neu', 'Der Prozess endet sofort', 'Es gibt unendlich viele Zustände']);
    }
    case 73: {
      const side = 2 + Math.floor(Math.random() * 4);
      const answer = chooseCount(side * 2, side);
      return textPuzzle(lang, group, `Auf einem ${side}×${side}-Gitter darfst du nur nach rechts oder unten gehen. Wie viele kürzeste Wege gibt es?`, `Trên lưới ${side}×${side}, chỉ được đi sang phải hoặc xuống dưới. Có bao nhiêu đường ngắn nhất?`, `↘ ${side} Schritte rechts + ${side} Schritte unten`, String(answer), [String(answer - 1), String(answer + 1), String(side * side)]);
    }
    case 74: {
      const colors = sample([
        { de: 'Rot', vi: 'đỏ', art: '🔴' }, { de: 'Blau', vi: 'xanh dương', art: '🔵' },
        { de: 'Grün', vi: 'xanh lá', art: '🟢' }, { de: 'Gelb', vi: 'vàng', art: '🟡' },
      ], 3);
      return textPuzzle(lang, group, `Mira weiß: Die Karte ist nicht ${colors[0].de}. Lio kennt nur ${colors[0].de} oder ${colors[1].de}. Lio hört Mira. Welche Farbe bleibt?`, `Mira biết thẻ không phải màu ${colors[0].vi}. Lio chỉ biết thẻ màu ${colors[0].vi} hoặc ${colors[1].vi}. Lio nghe Mira. Màu nào còn lại?`, `Mira: nicht ${colors[0].art}\nLio: ${colors[0].art} oder ${colors[1].art}`, colors[1].art, [colors[0].art, colors[2].art, '❔']);
    }
    case 75: {
      const payoff = 2 + Math.floor(Math.random() * 8);
      return textPuzzle(lang, group, `Bei „Kopf oder Zahl“ gewinnt eine Person ${payoff} Punkte, wenn die Münzen gleich sind; sonst gewinnt die andere. Welche Strategie schützt dich am besten?`, `Trong trò sấp ngửa, một người được ${payoff} điểm nếu hai đồng giống nhau; người kia thắng nếu khác nhau. Chiến lược nào tốt nhất?`, 'Gegner wählt Kopf oder Zahl', '50/50 zufällig mischen', ['Immer Kopf', 'Immer Zahl', 'Vorherige Wahl kopieren']);
    }
    case 76: {
      const redInA = 1;
      const totalA = 2 + Math.floor(Math.random() * 4);
      const redInB = 2 + Math.floor(Math.random() * 4);
      const totalB = redInB;
      const answer = (redInB / totalB) / ((redInA / totalA) + (redInB / totalB));
      return textPuzzle(lang, group, 'Du wählst zufällig einen Beutel und ziehst Rot. Wie wahrscheinlich ist Beutel B?', 'Bạn chọn ngẫu nhiên một túi rồi rút được viên đỏ. Xác suất đó là túi B là bao nhiêu?', `A: ${redInA}/${totalA} rot · B: ${redInB}/${totalB} rot · gleiche Chance`, `${Math.round(answer * 100)}%`, [`${Math.round((1 - answer) * 100)}%`, '50%', '100%']);
    }
    case 77: {
      const length = 2 + Math.floor(Math.random() * 4);
      const width = 2 + Math.floor(Math.random() * 4);
      const height = 2 + Math.floor(Math.random() * 4);
      const volume = length * width * height;
      return textPuzzle(lang, group, `Ein Quader ist ${length}×${width}×${height} Einheiten groß. Wie viele Einheitswürfel füllen ihn?`, `Khối hộp có kích thước ${length}×${width}×${height}. Cần bao nhiêu khối lập phương đơn vị để lấp đầy?`, `${length} × ${width} × ${height}`, String(volume), [String(volume - 1), String(volume + 1), String(length + width + height)]);
    }
    case 78: {
      const start = 1 + Math.floor(Math.random() * 8);
      const step = 2 + Math.floor(Math.random() * 6);
      return textPuzzle(lang, group, 'Finde eine Regel, die für alle Schritte passt. Welche Zahl folgt?', 'Tìm quy luật đúng cho mọi bước. Số nào tiếp theo?', `${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, ?`, String(start + 4 * step), [String(start + 3 * step), String(start + 4 * step + 1), String(start + 5 * step)]);
    }
    case 79: {
      const prevalence = 1 + Math.floor(Math.random() * 5);
      const sensitivity = 85 + Math.floor(Math.random() * 15);
      const falsePositive = 2 + Math.floor(Math.random() * 9);
      const positiveCases = prevalence * sensitivity;
      const negatives = (100 - prevalence) * falsePositive;
      const posterior = Math.round(100 * positiveCases / (positiveCases + negatives));
      return textPuzzle(lang, group, `Eine Krankheit betrifft ${prevalence}% der Menschen. Test: ${sensitivity}% Treffer, ${falsePositive}% falsche Positive. Wie hoch ist die Krankheitschance nach positivem Test?`, `Bệnh ảnh hưởng ${prevalence}% dân số. Xét nghiệm đúng ${sensitivity}% ca bệnh và dương tính giả ${falsePositive}%. Sau kết quả dương tính, xác suất mắc bệnh khoảng bao nhiêu?`, `Bayes: ${prevalence}% · ${sensitivity}% · ${falsePositive}%`, `${posterior}%`, [`${Math.max(1, posterior - 10)}%`, `${Math.min(99, posterior + 15)}%`, `${prevalence}%`]);
    }
    case 80: {
      const a = 2 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * (a - 1));
      const c = 2 + Math.floor(Math.random() * 6);
      const d = 1 + Math.floor(Math.random() * (c - 1));
      const flow = Math.min(a, b) + Math.min(c, d);
      return textPuzzle(lang, group, 'Zwei unabhängige Wege verbinden Quelle und Ziel. Wie groß ist der maximale Fluss?', 'Hai đường độc lập nối nguồn và đích. Luồng tối đa là bao nhiêu?', `Quelle → ${a} → ${b} → Ziel\nQuelle → ${c} → ${d} → Ziel`, String(flow), [String(Math.max(a, b) + Math.max(c, d)), String(Math.min(a, b, c, d)), String(flow + 1)]);
    }
    case 81: {
      const value = Math.random() < 0.5 ? 'P' : 'Q';
      return textPuzzle(lang, group, 'Vereinfache den Booleschen Ausdruck mit einer Regel.', 'Rút gọn biểu thức Boolean bằng một quy tắc.', `${value} AND (${value === 'P' ? 'Q' : 'P'} OR NOT ${value === 'P' ? 'Q' : 'P'})`, value, [`NOT ${value}`, `${value} OR ${value === 'P' ? 'Q' : 'P'}`, '0']);
    }
    case 82: {
      const nodes = 4 + Math.floor(Math.random() * 10);
      return textPuzzle(lang, group, `Wie viele Kanten hat ein zusammenhängender Baum mit ${nodes} Knoten?`, `Cây liên thông có ${nodes} nút thì có bao nhiêu cạnh?`, `${nodes} Knoten · Baum`, String(nodes - 1), [String(nodes), String(nodes + 1), String(nodes - 2)]);
    }
    case 83: {
      const take = 1 + Math.floor(Math.random() * 3);
      const pile = 4 * (1 + Math.floor(Math.random() * 3)) + take;
      return textPuzzle(lang, group, `Beim Nim-Spiel darfst du 1, 2 oder 3 Steine nehmen. Es liegen ${pile} Steine. Was ist der Gewinnzug?`, `Trong Nim, bạn được lấy 1, 2 hoặc 3 viên. Có ${pile} viên. Nước thắng là lấy bao nhiêu?`, `🪨 × ${pile} · Ziel: Gegner lässt ein Vielfaches von 4`, String(take), ['1', '2', '3'].filter((value) => value !== String(take)).concat('4').slice(0, 3));
    }
    case 84: {
      const bits: number[] = Array.from({ length: 5 }, () => Math.random() < 0.5 ? 0 : 1);
      if (bits.reduce((sum, bit) => sum + bit, 0) % 2 === 0) bits[0] = 1 - bits[0];
      return textPuzzle(lang, group, 'Ergänze ein Bit, damit die Gesamtzahl der Einsen gerade ist.', 'Thêm một bit để tổng số bit 1 là số chẵn.', bits.join(''), '1', ['0', '2', 'Keine']);
    }
    case 85: {
      const index = 5 + Math.floor(Math.random() * 20);
      return textPuzzle(lang, group, `Eine Liste enthält ${index} Binärfolgen. Wie baut man sicher eine Folge, die nicht an Position ${index} der ${index}. Listenfolge steht?`, `Một danh sách có ${index} chuỗi nhị phân. Làm sao tạo chuỗi chắc chắn khác chuỗi thứ ${index} ở vị trí ${index}?`, `Neue Folge: ändere Bit ${index} der Folge ${index}`, 'Konstruiere sie diagonal', ['Kopiere die erste Folge', 'Sortiere alphabetisch', 'Wähle nur Nullen']);
    }
    case 86: {
      const colors = sample(['🔴', '🔵', '🟢', '🟡'], 3);
      return textPuzzle(lang, group, `Der Code ist eine Farbe aus ${colors.join(' ')}. Mira weiß: nicht ${colors[0]}. Lio weiß nur, dass ${colors[0]} oder ${colors[1]} möglich ist. Nach Miras Hinweis: Welche Farbe bleibt?`, `Mã là một màu trong ${colors.join(' ')}. Mira biết: không phải ${colors[0]}. Lio chỉ biết có thể là ${colors[0]} hoặc ${colors[1]}. Sau gợi ý của Mira, màu nào còn lại?`, `Mira: nicht ${colors[0]}\nLio: ${colors[0]} oder ${colors[1]}`, colors[1], [colors[0], colors[2], 'Nicht bestimmbar']);
    }
    case 87: {
      const safe = 1 + Math.floor(Math.random() * 4);
      const riskyBest = safe + 1 + Math.floor(Math.random() * 5);
      const riskyWorst = safe + 5 + Math.floor(Math.random() * 6);
      return textPuzzle(lang, group, 'Wähle den Zug, der selbst gegen die beste Antwort des Gegners den kleinsten Verlust hat.', 'Chọn nước đi có mức thiệt hại lớn nhất nhỏ nhất, kể cả khi đối thủ đáp trả tốt nhất.', `Sicher: Verlust ${safe}\nRiskant: Verlust ${riskyBest} oder ${riskyWorst}`, 'Sicher', ['Riskant', 'Zufällig', 'Immer angreifen']);
    }
    case 88: {
      const puzzles = [
        { de: 'Ein Mann schiebt sein Auto zu einem Hotel und verliert sein ganzes Geld. Was spielt er?', vi: 'Một người đẩy xe đến khách sạn và mất hết tiền. Anh ấy đang chơi gì?', visual: '🚗 → 🏨 → 💸', answerDe: 'Monopoly', answerVi: 'Cờ tỷ phú', wrongDe: ['Schach', 'Fußball', 'Reise nach Hause'], wrongVi: ['Cờ vua', 'Bóng đá', 'Đi du lịch'] },
        { de: 'Ein elektrischer Zug fährt nach Norden. Wohin weht der Rauch?', vi: 'Một đoàn tàu điện chạy về phía bắc. Khói bay hướng nào?', visual: '🚆⚡ → Norden', answerDe: 'Kein Rauch', answerVi: 'Không có khói', wrongDe: ['Norden', 'Süden', 'Osten'], wrongVi: ['Bắc', 'Nam', 'Đông'] },
        { de: 'Was wird größer, je mehr man davon wegnimmt?', vi: 'Thứ gì càng lấy đi thì càng lớn?', visual: '🕳️', answerDe: 'Ein Loch', answerVi: 'Cái hố', wrongDe: ['Ein Berg', 'Ein Ball', 'Ein Baum'], wrongVi: ['Ngọn núi', 'Quả bóng', 'Cái cây'] },
      ];
      const puzzle = pick(puzzles);
      return textPuzzle(lang, group, puzzle.de, puzzle.vi, puzzle.visual, word(lang, puzzle.answerDe, puzzle.answerVi), lang === 'de' ? puzzle.wrongDe : puzzle.wrongVi);
    }
    case 89: {
      const mutual = 2 + Math.floor(Math.random() * 4);
      const temptation = mutual + 2 + Math.floor(Math.random() * 4);
      return textPuzzle(lang, group, `Beide erhalten ${mutual} bei Kooperation. Wer allein verrät, erhält ${temptation}; wer verraten wird, 0. Was ist die dominante Einzelstrategie?`, `Cả hai được ${mutual} nếu hợp tác. Người phản bội một mình được ${temptation}; người bị phản bội được 0. Chiến lược cá nhân trội là gì?`, `Kooperation: ${mutual},${mutual}\nVerrat: ${temptation},0`, word(lang, 'Verraten', 'Phản bội'), [word(lang, 'Kooperieren', 'Hợp tác'), word(lang, 'Münze werfen', 'Tung đồng xu'), word(lang, 'Keine Strategie', 'Không có chiến lược')]);
    }
    case 90: {
      const names = sample(['Ari', 'Ben', 'Cem', 'Dia'], 3);
      return textPuzzle(lang, group, `${names[0]} sagt: „${names[1]} lügt.“ ${names[1]} sagt: „${names[2]} lügt.“ ${names[2]} sagt: „${names[0]} lügt.“ Jeder ist Ritter (wahr) oder Schurke (lügt). Was folgt?`, `${names[0]} nói: “${names[1]} nói dối.” ${names[1]} nói: “${names[2]} nói dối.” ${names[2]} nói: “${names[0]} nói dối.” Mỗi người hoặc luôn thật hoặc luôn nói dối. Kết luận nào đúng?`, 'Aussagen bilden einen Kreis mit 3 Widersprüchen', word(lang, 'Keine konsistente Zuordnung', 'Không có cách gán nhất quán'), [word(lang, 'Alle Ritter', 'Tất cả là hiệp sĩ'), word(lang, 'Alle Schurken', 'Tất cả là kẻ nói dối'), word(lang, 'Genau ein Ritter', 'Chính xác một hiệp sĩ')]);
    }
    case 91: {
      const rounds = 5 + Math.floor(Math.random() * 20);
      return textPuzzle(lang, group, `In einem wiederholten Spiel mit ${rounds} Runden: Welche einfache Strategie kooperiert zuerst und spiegelt danach den letzten Zug des Gegners?`, `Trong trò chơi lặp lại ${rounds} vòng: Chiến lược đơn giản nào hợp tác trước rồi bắt chước nước đi gần nhất của đối thủ?`, '🤝 → kopiere letzten Zug', 'Tit-for-tat', ['Immer verraten', 'Immer zufällig', 'Immer passen']);
    }
    case 92: {
      const memberships = sample(Array.from({ length: 10 }, (_, index) => index / 10), 3);
      const best = memberships.indexOf(Math.max(...memberships));
      return textPuzzle(lang, group, 'Welche Kategorie passt am stärksten? Wähle den höchsten Zugehörigkeitswert.', 'Danh mục nào phù hợp nhất? Chọn giá trị thành viên lớn nhất.', `A: ${memberships[0].toFixed(1)} · B: ${memberships[1].toFixed(1)} · C: ${memberships[2].toFixed(1)}`, ['A', 'B', 'C'][best], ['A', 'B', 'C'].filter((label) => label !== ['A', 'B', 'C'][best]).concat('Alle gleich').slice(0, 3));
    }
    case 93: {
      const side = 2 + Math.floor(Math.random() * 9);
      const perimeter = side * 4;
      return textPuzzle(lang, group, `Vier Städte liegen an den Ecken eines Quadrats mit Seitenlänge ${side}. Wie lang ist die kürzeste Rundreise?`, `Bốn thành phố ở bốn góc hình vuông cạnh ${side}. Độ dài hành trình khép kín ngắn nhất là bao nhiêu?`, `□ Seite ${side} · alle Städte besuchen und zurück`, String(perimeter), [String(perimeter + 2), String(perimeter * 2), String(side * 2)]);
    }
    case 94: {
      const initial = (Math.random() * 0.1).toFixed(2);
      const later = (0.5 + Math.random() * 9).toFixed(1);
      return textPuzzle(lang, group, 'Zwei fast gleiche Startwerte führen später zu stark verschiedenen Ergebnissen. Welche Eigenschaft zeigt das?', 'Hai giá trị ban đầu gần giống nhau nhưng sau đó cho kết quả rất khác. Đây là đặc tính nào?', `${initial} ≈ 0　→　${later} ≠ ?`, word(lang, 'Empfindlichkeit gegenüber Anfangswerten', 'Nhạy cảm với điều kiện ban đầu'), [word(lang, 'Zufälligkeit ohne Regeln', 'Ngẫu nhiên không quy luật'), word(lang, 'Immer gleiche Ausgabe', 'Luôn cùng kết quả'), word(lang, 'Paritätsfehler', 'Lỗi chẵn lẻ')]);
    }
    case 95: {
      const states = sample(['0', '1', 'Rot', 'Blau'], 2);
      return textPuzzle(lang, group, `Vor der Messung kann das Quantensystem in einer Überlagerung aus ${states[0]} und ${states[1]} sein. Was zeigt die Messung?`, `Trước khi đo, hệ lượng tử có thể ở chồng chập của ${states[0]} và ${states[1]}. Phép đo cho kết quả nào?`, `${states[0]} + ${states[1]} → Messung`, 'Einen der möglichen Zustände', ['Beide immer zugleich', 'Keinen Zustand', 'Immer den ersten']);
    }
    case 96: {
      const contents = sample(['Äpfel', 'Birnen', 'Kirschen'], 3);
      return textPuzzle(lang, group, `Drei Inventarkisten enthalten je nur ${contents[0]}, ${contents[1]} oder Gemischtes. Alle Etiketten sind falsch. Welche Kiste prüfst du zuerst?`, `Ba hộp kho chứa ${contents[0]}, ${contents[1]} hoặc hỗn hợp. Tất cả nhãn đều sai. Bạn kiểm tra hộp nào trước?`, `${contents[0]} · ${contents[1]} · Gemischt\nAlle Etiketten falsch`, word(lang, 'Gemischt', 'Hỗn hợp'), [contents[0], contents[1], word(lang, 'Alle zugleich', 'Tất cả cùng lúc')]);
    }
    case 97: {
      const stretches = 2 + Math.floor(Math.random() * 8);
      return textPuzzle(lang, group, `Ein Gummiring wird ${stretches}-mal gedehnt und gebogen, aber nicht zerschnitten oder verklebt. Wie viele Löcher hat er?`, `Một vòng cao su được kéo và uốn ${stretches} lần nhưng không cắt hay dán. Nó có bao nhiêu lỗ?`, '⭕ → längliche Form → ⭕', '1', ['0', '2', String(stretches)]);
    }
    case 98: {
      const angle = Math.random() < 0.5 ? 90 : 100;
      const sum = angle * 3;
      return textPuzzle(lang, group, `Ein Dreieck auf einer Kugel hat drei gleiche Winkel von ${angle}°. Welche Winkelsumme hat es?`, `Một tam giác trên mặt cầu có ba góc bằng nhau, mỗi góc ${angle}°. Tổng ba góc là bao nhiêu?`, `${angle}° + ${angle}° + ${angle}°`, `${sum}°`, ['180°', '90°', '360°']);
    }
    case 99: {
      const comparisons = 8 + Math.floor(Math.random() * 13);
      const items = 2 ** comparisons;
      return textPuzzle(lang, group, `Eine sortierte Liste hat ${items.toLocaleString('de-DE')} Einträge. Wie viele Vergleiche braucht die binäre Suche höchstens ungefähr?`, `Danh sách đã sắp xếp có ${items} mục. Tìm kiếm nhị phân cần tối đa khoảng bao nhiêu lần so sánh?`, `2^${comparisons} Einträge`, String(comparisons), [String(comparisons - 1), String(comparisons + 1), String(items)]);
    }
    case 100: {
      const first = 2 + Math.floor(Math.random() * 6);
      const second = 1 + Math.floor(Math.random() * 7);
      const sum = first + second;
      const answer = sum % 2 === 0 ? sum : sum - 1;
      return textPuzzle(lang, group, `Meta-Rätsel: Ein Code startet bei ${first}, addiert ${second}; falls die Summe ungerade ist, ziehe 1 ab. Welcher Code bleibt?`, `Câu đố meta: Mã bắt đầu bằng ${first}, cộng ${second}; nếu tổng lẻ thì trừ 1. Mã cuối là gì?`, `${first} + ${second} → gerade Zahl`, String(answer), [String(answer + 1), String(Math.max(0, answer - 1)), String(sum)]);
    }
    default: return textPuzzle(lang, group, 'Wähle die richtige Lösung.', 'Chọn đáp án đúng.', '🧩', 'A', ['B', 'C', 'D']);
  }
}

export function generateLogicRound(lang: Language, tier = 1): LogicPuzzle[] {
  const topics = LOGIC_TOPICS.filter((topic) => topic.tier === tier);
  return shuffle(topics.map((topic) => {
    const generate = topic.id <= generators.length ? generators[topic.id - 1] : undefined;
    return {
      ...(generate ? generate(lang) : advancedPuzzle(topic.id, lang)),
      topicId: topic.id,
      topicName: word(lang, topic.de, topic.vi),
    };
  }));
}
