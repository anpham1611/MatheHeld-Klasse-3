import React, { useEffect, useState } from 'react';
import { ArrowLeft, HardDrive, PackagePlus, RotateCcw, Save, Trash2, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { Language, PlayerProfile } from '../../types/game';
import { VoxelBlock } from '../../math/minecraftCurriculum';
import { BRICK_CATALOG, BRICK_GROUPS, BrickGroupId, COMMON_BRICK_IDS, getBrickDimensions, getBrickPiece, SPECIAL_BRICK_IDS } from '../../math/brickCatalog';
import { blockOccupiesCell, blocksOverlap, createStartingInventory, removePlacedBrick } from '../../math/brickBuilding';
import { generateBrickMathQuestion, BrickMathQuestion } from '../../math/mathBrickCurriculum';
import { sound } from '../../audio/soundManager';
import { VoxelCanvas } from '../minecraft/VoxelCanvas';

interface MathBrickBuilderProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

type BrickType = VoxelBlock['type'];
type Inventory = Record<string, number>;
type GameMode = 'sandbox' | 'blueprint';
type Rotation = 0 | 90 | 180 | 270;

interface SavedBuild {
  blocks: VoxelBlock[];
  inventory: Inventory;
}

interface BuilderState extends SavedBuild {
  schemaVersion: 2;
  savedBuild?: SavedBuild;
}

interface ActiveChallenge {
  question: BrickMathQuestion;
  hard: boolean;
  rareReward?: string;
}

const COLORS = [
  { hex: '#e53935', nameDe: 'Rot', nameVi: 'Đỏ' },
  { hex: '#1e88e5', nameDe: 'Blau', nameVi: 'Xanh dương' },
  { hex: '#fdd835', nameDe: 'Gelb', nameVi: 'Vàng' },
  { hex: '#43a047', nameDe: 'Grün', nameVi: 'Xanh lá' },
  { hex: '#f5f5f5', nameDe: 'Weiß', nameVi: 'Trắng' },
  { hex: '#263238', nameDe: 'Schwarz', nameVi: 'Đen' },
  { hex: '#fb8c00', nameDe: 'Orange', nameVi: 'Cam' },
  { hex: '#8e24aa', nameDe: 'Lila', nameVi: 'Tím' },
];
const VALID_BLOCK_TYPES: BrickType[] = ['dirt', 'wood', 'cobblestone', 'iron', 'fence', 'cake', 'chest', 'chicken'];

function emptyInventory(): Inventory {
  return createStartingInventory();
}

const emptyState = (): BuilderState => ({ schemaVersion: 2, blocks: [], inventory: emptyInventory() });

function readInventory(value: unknown): Inventory {
  const inventory = emptyInventory();
  if (!value || typeof value !== 'object') return inventory;
  const stored = value as Record<string, unknown>;
  const hasCatalogStock = BRICK_CATALOG.some(({ id }) => typeof stored[id] === 'number');
  if (hasCatalogStock) {
    for (const { id } of BRICK_CATALOG) {
      const amount = stored[id];
      if (typeof amount === 'number' && Number.isInteger(amount) && amount >= 0 && amount <= 999999) inventory[id] = amount;
    }
  } else {
    const legacyMap: Record<string, string> = {
      dirt: 'brick-2x2', wood: 'brick-2x4', cobblestone: 'plate-2x4', iron: 'tile-2x2',
      fence: 'panel-wall-1x4', cake: 'tile-1x1', chest: 'gear-2x2', chicken: 'animal-2x2',
    };
    Object.entries(legacyMap).forEach(([oldId, newId]) => {
      const amount = stored[oldId];
      if (typeof amount === 'number' && Number.isInteger(amount) && amount >= 0 && amount <= 999999) inventory[newId] = amount;
    });
  }
  return inventory;
}

function readVoxelBlock(value: unknown): VoxelBlock | null {
  if (!value || typeof value !== 'object') return null;
  const block = value as VoxelBlock;
  if (!Number.isInteger(block.x) || !Number.isInteger(block.y) || !Number.isInteger(block.z)
    || !VALID_BLOCK_TYPES.includes(block.type)
    || (block.rotation !== undefined && ![0, 90, 180, 270].includes(block.rotation))) return null;
  const legacyPieceIds: Record<string, string> = {
    fence: 'panel-wall-1x4', cake: 'tile-1x1', chest: 'gear-2x2', chicken: 'animal-2x2',
  };
  const pieceId = block.pieceId || legacyPieceIds[block.type] || 'brick-1x1';
  const dimensions = getBrickDimensions(pieceId, block.rotation);
  if (!getBrickPiece(pieceId) || block.x < -9 || block.z < -9
    || block.x + dimensions.width - 1 > 9 || block.z + dimensions.depth - 1 > 9
    || block.y < 0 || block.y + dimensions.height > 39) return null;
  const brickColor = COLORS.some((color) => color.hex === block.brickColor) ? block.brickColor : undefined;
  return { ...block, pieceId, rotation: block.rotation || 0, brickColor };
}

function readBuilderState(key: string): BuilderState {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return emptyState();
    const parsed = JSON.parse(stored) as Partial<BuilderState>;
    const inventory = readInventory(parsed.inventory);
    const savedInventory = parsed.savedBuild?.inventory ? readInventory(parsed.savedBuild.inventory) : undefined;
    if (parsed.schemaVersion !== 2) {
      BRICK_CATALOG.forEach(({ id }) => {
        inventory[id] = Math.max(2, inventory[id] || 0);
        if (savedInventory) savedInventory[id] = Math.max(2, savedInventory[id] || 0);
      });
    }
    const blocks = Array.isArray(parsed.blocks) ? parsed.blocks.map(readVoxelBlock).filter((block): block is VoxelBlock => !!block).slice(0, 400) : [];
    const savedBlocks = Array.isArray(parsed.savedBuild?.blocks) ? parsed.savedBuild.blocks.map(readVoxelBlock).filter((block): block is VoxelBlock => !!block).slice(0, 400) : undefined;
    return {
      schemaVersion: 2,
      blocks,
      inventory,
      ...(savedBlocks && savedInventory ? { savedBuild: { blocks: savedBlocks, inventory: savedInventory } } : {}),
    };
  } catch {
    return emptyState();
  }
}

export const MathBrickBuilder: React.FC<MathBrickBuilderProps> = ({
  lang,
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const text = (de: string, vi: string) => lang === 'de' ? de : vi;
  const storageKey = `mathbrick_builder_${encodeURIComponent(player.name.toLowerCase())}`;
  const [state, setState] = useState<BuilderState>(() => readBuilderState(storageKey));
  const [activePieceId, setActivePieceId] = useState('brick-2x2');
  const [activeGroup, setActiveGroup] = useState<BrickGroupId>('bricks');
  const [activeColor, setActiveColor] = useState(COLORS[0].hex);
  const [activeRotation, setActiveRotation] = useState<Rotation>(0);
  const [tool, setTool] = useState<'build' | 'remove'>('build');
  const [challenge, setChallenge] = useState<ActiveChallenge | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<'wrong' | 'correct' | null>(null);
  const [notice, setNotice] = useState('');
  const [selectedCommon, setSelectedCommon] = useState('brick-2x2');
  const [selectedRare, setSelectedRare] = useState('gear-2x2');
  const [mode, setMode] = useState<GameMode>('sandbox');
  const [blueprintComplete, setBlueprintComplete] = useState(false);
  const [score, setScore] = useState(player.scores.mathbrick || 0);
  const activePiece = getBrickPiece(activePieceId)!;
  const activePieceType = activePiece.material;

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      setNotice(text('Speicher voll. Baue weniger Steine.', 'Bộ nhớ đầy. Hãy xây ít khối hơn.'));
    }
  }, [state, storageKey]);

  const blockCount = Object.values(state.inventory).reduce((sum, amount) => sum + amount, 0);

  const handlePlaceBlock = (block: VoxelBlock) => {
    const pieceId = block.pieceId;
    if (!pieceId || !getBrickPiece(pieceId)) return false;
    if (state.blocks.length >= 400) {
      setNotice(text('Maximal 400 Bausteine pro Bau.', 'Tối đa 400 khối cho mỗi công trình.'));
      return false;
    }
    if ((state.inventory[pieceId] || 0) < 1) {
      setNotice(text('Keine Steine dieser Sorte mehr.', 'Đã hết loại khối này.'));
      return false;
    }
    if (state.blocks.some((existing) => blocksOverlap(existing, block))) {
      setNotice(text('Dieser Platz ist schon belegt.', 'Vị trí này đã có khối.'));
      return false;
    }
    setState((current) => ({
      ...current,
      blocks: [...current.blocks, block],
      inventory: { ...current.inventory, [pieceId]: current.inventory[pieceId] - 1 },
    }));
    setNotice('');
    return true;
  };

  const handleRemoveBlock = (block: VoxelBlock) => {
    if (!removePlacedBrick(state.blocks, state.inventory, block)) return false;
    setState((current) => {
      const result = removePlacedBrick(current.blocks, current.inventory, block);
      return result ? { ...current, ...result } : current;
    });
    setBlueprintComplete(false);
    setNotice(text('Stein entfernt und ins Lager gelegt.', 'Đã tháo khối và hoàn lại vào kho.'));
    return true;
  };

  const returnBlocksToInventory = () => {
    setState((current) => {
      const inventory = { ...current.inventory };
      current.blocks.forEach((block) => {
        const pieceId = block.pieceId || 'brick-1x1';
        inventory[pieceId] += 1;
      });
      return { ...current, blocks: [], inventory };
    });
    sound.playBlockBreak();
    setBlueprintComplete(false);
  };

  const undoLastBlock = () => {
    setState((current) => {
      const last = current.blocks[current.blocks.length - 1];
      if (!last) return current;
      const pieceId = last.pieceId || 'brick-1x1';
      const inventory = { ...current.inventory, [pieceId]: current.inventory[pieceId] + 1 };
      return { ...current, blocks: current.blocks.slice(0, -1), inventory };
    });
    sound.playBlockBreak();
  };

  const saveBuild = () => {
    setState((current) => ({
      ...current,
      savedBuild: { blocks: current.blocks, inventory: current.inventory },
    }));
    sound.playCorrect();
    setNotice(text('Bau und Sammlung gespeichert!', 'Đã lưu công trình và bộ sưu tập!'));
  };

  const loadBuild = () => {
    if (!state.savedBuild) return;
    setState((current) => ({ ...current, ...current.savedBuild! }));
    setBlueprintComplete(false);
    setNotice(text('Gespeicherter Bau geladen.', 'Đã tải công trình đã lưu.'));
    sound.playJump();
  };

  const startChallenge = (hard = false) => {
    const question = generateBrickMathQuestion(lang, hard);
    setChallenge({ question, hard, ...(hard ? { rareReward: selectedRare } : {}) });
    setAnswerFeedback(null);
    setNotice('');
    sound.playJump();
  };

  const startExchange = () => {
    if (state.inventory[selectedCommon] < 3) {
      setNotice(text('Du brauchst 3 gleiche normale Steine zum Tauschen.', 'Cần 3 khối thường cùng loại để đổi.'));
      return;
    }
    setState((current) => ({
      ...current,
      inventory: { ...current.inventory, [selectedCommon]: current.inventory[selectedCommon] - 3 },
    }));
    startChallenge(true);
  };

  const earnRewardPack = () => {
    const rewards = [
      ...Array.from({ length: 8 }, () => COMMON_BRICK_IDS[Math.floor(Math.random() * COMMON_BRICK_IDS.length)]),
      ...Array.from({ length: 2 }, () => SPECIAL_BRICK_IDS[Math.floor(Math.random() * SPECIAL_BRICK_IDS.length)]),
    ];
    setState((current) => {
      const inventory = { ...current.inventory };
      rewards.forEach((pieceId) => { inventory[pieceId] += 1; });
      return { ...current, inventory };
    });
    setNotice(text('Pack erhalten: 8 normale + 2 besondere Steine!', 'Nhận gói: 8 khối thường + 2 khối đặc biệt!'));
  };

  const answerQuestion = (answer: string) => {
    if (!challenge) return;
    if (answer !== challenge.question.answer) {
      sound.playWrong();
      setAnswerFeedback('wrong');
      return;
    }
    sound.playCorrect();
    const nextScore = score + (challenge.hard ? 250 : 100);
    setScore(nextScore);
    onUpdateStats(challenge.hard ? 2 : 1, challenge.hard ? 5 : 2, nextScore);
    if (challenge.hard && challenge.rareReward) {
      setState((current) => ({
        ...current,
        inventory: { ...current.inventory, [challenge.rareReward!]: current.inventory[challenge.rareReward!] + 1 },
      }));
      setNotice(text('Richtig! Dein gewähltes Spezialteil gehört dir!', 'Chính xác! Khối đặc biệt bé chọn đã thuộc về bé!'));
    } else {
      earnRewardPack();
    }
    setChallenge(null);
    setAnswerFeedback(null);
  };

  const checkBlueprint = () => {
    const occupied = (x: number, y: number, z: number) => state.blocks.some((block) => blockOccupiesCell(block, x, y, z));
    const supportedEnds = occupied(-2, 0, 0) && occupied(2, 0, 0);
    const completeDeck = [-2, -1, 0, 1, 2].every((x) => occupied(x, 3, 0));
    if (!supportedEnds || !completeDeck) {
      setNotice(text('Noch nicht stabil: Baue beide Stützen und eine durchgehende Fahrbahn!', 'Chưa vững: xây đủ hai trụ và mặt cầu liền nhau nhé!'));
      sound.playWrong();
      return;
    }
    if (blueprintComplete) return;
    setBlueprintComplete(true);
    const nextScore = score + 250;
    setScore(nextScore);
    onUpdateStats(2, 5, nextScore);
    sound.playLevelUp();
    setNotice(text('Brücke hält die 5-kg-Prüflast! Blueprint geschafft!', 'Cầu chịu được tải thử 5 kg! Hoàn thành bản thiết kế!'));
  };

  const setGameMode = (nextMode: GameMode) => {
    setMode(nextMode);
    setBlueprintComplete(false);
    setNotice('');
  };

  return (
    <main className="h-[100dvh] min-h-[620px] overflow-y-auto bg-slate-950 text-slate-100 font-['Nunito',sans-serif] flex flex-col">
      <header className="shrink-0 flex items-center justify-between gap-3 border-b border-cyan-500/30 bg-slate-900 px-3 py-2.5 sm:px-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-xl border border-slate-700 bg-slate-800 p-2.5 hover:bg-slate-700" aria-label={text('Zurück', 'Quay lại')}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-['Fredoka'] text-lg font-black sm:text-2xl">🧱 MathBrick Builder</h1>
            <p className="text-xs font-bold text-slate-400">{player.name} · {text('Abenteuer ab 8 Jahren', 'Phiêu lưu từ 8 tuổi')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm font-black text-amber-200 sm:flex">
            <Trophy className="h-4 w-4" /> {score} Pkt
          </div>
          <button onClick={onToggleMute} className="rounded-xl border border-slate-700 bg-slate-800 p-2.5" aria-label={isMuted ? 'Sound on' : 'Sound off'}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="shrink-0 flex items-center justify-center gap-2 border-b border-slate-800 bg-slate-900/60 p-2">
        <button onClick={() => setGameMode('sandbox')} className={`rounded-xl px-4 py-2 text-sm font-black ${mode === 'sandbox' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
          {text('Sandbox', 'Sáng tạo')} 🧱
        </button>
        <button onClick={() => setGameMode('blueprint')} className={`rounded-xl px-4 py-2 text-sm font-black ${mode === 'blueprint' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
          {text('Blueprint: Brücke', 'Bản thiết kế: Cây cầu')} 🌉
        </button>
      </div>

      <section className="flex flex-col gap-3 p-3 sm:p-4 lg:grid lg:flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-1">
        <div className="min-w-0 min-h-[440px] flex flex-col gap-3">
          {mode === 'blueprint' && (
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/50 p-3 sm:p-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-['Fredoka'] font-black text-cyan-200">🌉 {text('Brücken-Blueprint', 'Bản thiết kế cây cầu')}</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">{text('Baue Stützen bei X −2 und +2. Verbinde sie mit einer Fahrbahn auf Plattenhöhe 3.', 'Xây trụ ở X −2 và +2. Nối hai trụ bằng mặt cầu ở cao độ 3 tấm.')}</p>
                <p className="text-xs text-cyan-300 mt-1">{text('Stabilitätsregel: beide Enden tragen durchgehende Fahrbahn.', 'Quy tắc ổn định: hai đầu đỡ mặt cầu liên tục.')}</p>
              </div>
              <button onClick={checkBlueprint} disabled={blueprintComplete} className="shrink-0 rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-50">
                {blueprintComplete ? text('Geschafft ✓', 'Hoàn thành ✓') : text('5 kg testen', 'Thử tải 5 kg')}
              </button>
            </div>
          )}

          <div className="min-w-0 flex-1 min-h-[390px]">
            <VoxelCanvas
              blocks={state.blocks}
              activeBlockType={activePieceType}
              activePiece={activePiece}
              activeRotation={activeRotation}
              activeBrickColor={activePiece.rarity === 'common' ? activeColor : undefined}
              placementEnabled={tool === 'build'}
              removalEnabled={tool === 'remove'}
              allowPan
              showStuds
              onBlockPlace={handlePlaceBlock}
              onBlockRemove={handleRemoveBlock}
              lang={lang}
            />
          </div>
          <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="min-w-0 text-xs text-slate-400">{tool === 'build'
              ? text('Klicken: Stein setzen · Ziehen: drehen · Shift+Ziehen: schwenken', 'Chạm: đặt khối · Kéo: xoay · Shift+kéo: di chuyển')
              : text('Klicke auf einen Stein, um ihn abzubauen. Er kommt zurück ins Lager.', 'Chạm vào khối để tháo và hoàn lại vào kho.')}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTool(tool === 'build' ? 'remove' : 'build')} className={`rounded-lg px-3 py-2 text-xs font-bold ${tool === 'remove' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                {tool === 'build' ? text('Stein entfernen', 'Tháo khối') : text('Weiterbauen', 'Tiếp tục xây')}
              </button>
              {tool === 'build' && <button onClick={() => setActiveRotation(((activeRotation + 90) % 360) as Rotation)} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold">{text('Drehen 90°', 'Xoay 90°')} ↻</button>}
              <button onClick={undoLastBlock} disabled={!state.blocks.length} className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold disabled:opacity-40"><RotateCcw className="h-3.5 w-3.5" /> {text('Rückgängig', 'Hoàn tác')}</button>
              <button onClick={returnBlocksToInventory} disabled={!state.blocks.length} className="flex items-center gap-1 rounded-lg bg-rose-950 px-3 py-2 text-xs font-bold text-rose-200 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> {text('Alles abbauen', 'Tháo hết')}</button>
            </div>
          </div>
        </div>

        <aside className="min-w-0 flex flex-col gap-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-['Fredoka'] text-lg font-black">📦 {text('Steine & Teile', 'Gạch & chi tiết')}</h2>
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-black text-cyan-200">{blockCount} {text('frei', 'còn')}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{text('Wähle Teil und Farbe. Größenangaben sind Noppen.', 'Chọn chi tiết và màu. Kích thước tính theo núm gạch.')}</p>
            <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
              {BRICK_GROUPS.map((group) => (
                <button key={group.id} onClick={() => setActiveGroup(group.id)} className={`shrink-0 rounded-lg px-2 py-1.5 text-[10px] font-black ${activeGroup === group.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                  {group.icon} {text(group.nameDe, group.nameVi)}
                </button>
              ))}
            </div>
            <div className="mt-2 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {BRICK_CATALOG.filter((piece) => piece.group === activeGroup).map((piece) => (
                <button key={piece.id} onClick={() => { setActivePieceId(piece.id); setTool('build'); }} className={`rounded-xl border p-2 text-left transition ${activePieceId === piece.id ? 'border-cyan-400 bg-cyan-950/70' : 'border-slate-700 bg-slate-800'}`}>
                  <span className="text-lg">{piece.icon}</span>
                  <span className="ml-1 text-[10px] font-bold">{text(piece.nameDe, piece.nameVi)}</span>
                  <span className="float-right rounded bg-black/30 px-1.5 text-xs font-black">{state.inventory[piece.id] || 0}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-bold text-cyan-200">
              {text(activePiece.nameDe, activePiece.nameVi)} · {activePiece.width}×{activePiece.depth} · {text('Bestand', 'Còn')}: {state.inventory[activePiece.id] || 0}
            </p>
            {activePiece.rarity === 'common' && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COLORS.map((color) => (
                  <button key={color.hex} onClick={() => setActiveColor(color.hex)} aria-label={text(color.nameDe, color.nameVi)} className={`rounded-lg border px-2 py-1 text-xs ${activeColor === color.hex ? 'border-cyan-300 bg-cyan-900' : 'border-slate-700 bg-slate-800'}`}>
                    <span className="mr-1 inline-block h-3 w-3 rounded-sm border border-white/50 align-middle" style={{ backgroundColor: color.hex }} />
                    {text(color.nameDe, color.nameVi)}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3 sm:p-4">
            <h2 className="font-['Fredoka'] text-lg font-black text-emerald-200">🧠 {text('Steine verdienen', 'Kiếm gạch')}</h2>
            <p className="mt-1 text-xs text-slate-300">{text('Löse eine Mathefrage und erhalte 8 normale + 2 Spezialsteine.', 'Giải câu đố toán để nhận 8 khối thường + 2 khối đặc biệt.')}</p>
            <button onClick={() => startChallenge()} className="mt-3 w-full rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-black text-emerald-950 hover:bg-emerald-400">
              <PackagePlus className="mr-1 inline h-4 w-4" /> {text('Mathe lösen · 10 Steine', 'Giải toán · 10 khối')}
            </button>
          </section>

          <section className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-950/25 p-3 sm:p-4">
            <h2 className="font-['Fredoka'] text-base font-black text-fuchsia-200">♻️ {text('Stein-Tausch', 'Đổi khối')}</h2>
            <div className="mt-2 flex gap-2">
              <select value={selectedCommon} onChange={(event) => setSelectedCommon(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white">
                {BRICK_CATALOG.filter((piece) => piece.rarity === 'common').map((piece) => <option key={piece.id} value={piece.id}>{text(piece.nameDe, piece.nameVi)} ({state.inventory[piece.id] || 0})</option>)}
              </select>
              <select value={selectedRare} onChange={(event) => setSelectedRare(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white">
                {BRICK_CATALOG.filter((piece) => piece.rarity === 'special').map((piece) => <option key={piece.id} value={piece.id}>{text(piece.nameDe, piece.nameVi)}</option>)}
              </select>
            </div>
            <button onClick={startExchange} className="mt-2 w-full rounded-xl bg-fuchsia-600 px-3 py-2.5 text-xs font-black hover:bg-fuchsia-500">
              {text('3 normale gegen schwere Frage + Spezialteil', 'Đổi 3 khối thường lấy câu khó + khối đặc biệt')}
            </button>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <h2 className="font-['Fredoka'] font-black">💾 {text('Bau speichern', 'Lưu công trình')}</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={saveBuild} className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2.5 text-xs font-bold hover:bg-slate-700"><Save className="h-4 w-4" /> {text('Speichern', 'Lưu')}</button>
              <button onClick={loadBuild} disabled={!state.savedBuild} className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2.5 text-xs font-bold hover:bg-slate-700 disabled:opacity-40"><HardDrive className="h-4 w-4" /> {text('Laden', 'Tải')}</button>
            </div>
          </section>

          {notice && <p role="status" className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-3 text-sm font-bold text-cyan-100">{notice}</p>}
        </aside>
      </section>

      {challenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={text('Mathefrage', 'Câu hỏi toán')}>
          <section className="w-full max-w-2xl rounded-3xl border-2 border-cyan-400/60 bg-slate-900 p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${challenge.hard ? 'bg-fuchsia-500/20 text-fuchsia-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                  {challenge.hard ? text('Schwere Challenge', 'Thử thách khó') : text('Mathe-Challenge', 'Thử thách toán')}
                </span>
                <h2 className="mt-2 font-['Fredoka'] text-xl font-black sm:text-2xl">{challenge.question.prompt}</h2>
              </div>
              <button onClick={() => setChallenge(null)} className="rounded-lg bg-slate-800 p-2" aria-label={text('Schließen', 'Đóng')}><X className="h-5 w-5" /></button>
            </div>
            <div className="my-5 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-center text-2xl leading-relaxed sm:text-4xl">{challenge.question.visual}</div>
            <div className="grid grid-cols-2 gap-3">
              {challenge.question.options.map((option, index) => (
                <button key={`${option}-${index}`} onClick={() => answerQuestion(option)} className="min-h-14 rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-lg font-black hover:border-cyan-400 hover:bg-slate-700">
                  {option}
                </button>
              ))}
            </div>
            {answerFeedback === 'wrong' && <p className="mt-4 text-center font-bold text-amber-300">{text('Noch nicht. Probiere es nochmal!', 'Chưa đúng. Thử lại nhé!')}</p>}
            {challenge.hard && <p className="mt-4 text-center text-xs text-fuchsia-200">{text('Richtig gelöst: 1 gewähltes Spezialteil!', 'Giải đúng: nhận 1 khối đặc biệt đã chọn!')}</p>}
          </section>
        </div>
      )}
    </main>
  );
};
