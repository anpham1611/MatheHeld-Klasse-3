import type { VoxelBlock } from './minecraftCurriculum.js';

export type BrickGroupId =
  | 'bricks'
  | 'plates'
  | 'slopes'
  | 'tiles'
  | 'panels'
  | 'technic'
  | 'wedge_curved'
  | 'nature'
  | 'figures';

export type BrickShape =
  | 'brick'
  | 'plate'
  | 'slope'
  | 'tile'
  | 'panel'
  | 'beam'
  | 'axle'
  | 'gear'
  | 'pin'
  | 'motor'
  | 'tire'
  | 'wedge'
  | 'curved'
  | 'leaf'
  | 'flower'
  | 'tree'
  | 'animal'
  | 'minifigure'
  | 'accessory';

export interface BrickCatalogItem {
  id: string;
  group: BrickGroupId;
  nameDe: string;
  nameVi: string;
  icon: string;
  width: number;
  depth: number;
  /** Height measured in plate units. Three plate units make one brick unit. */
  height: number;
  shape: BrickShape;
  material: VoxelBlock['type'];
  studs: boolean;
  rarity: 'common' | 'special';
  angle?: 30 | 45 | 65;
}

export const BRICK_GROUPS: Array<{ id: BrickGroupId; nameDe: string; nameVi: string; icon: string }> = [
  { id: 'bricks', nameDe: 'Steine', nameVi: 'Gạch', icon: '🧱' },
  { id: 'plates', nameDe: 'Platten', nameVi: 'Tấm mỏng', icon: '▰' },
  { id: 'slopes', nameDe: 'Schrägen', nameVi: 'Gạch dốc', icon: '◢' },
  { id: 'tiles', nameDe: 'Fliesen', nameVi: 'Gạch trơn', icon: '◻️' },
  { id: 'panels', nameDe: 'Wände & Fenster', nameVi: 'Tấm & cửa sổ', icon: '🪟' },
  { id: 'technic', nameDe: 'Technic', nameVi: 'Cơ khí', icon: '⚙️' },
  { id: 'wedge_curved', nameDe: 'Keile & Kurven', nameVi: 'Nêm & cong', icon: '🪽' },
  { id: 'nature', nameDe: 'Natur', nameVi: 'Thiên nhiên', icon: '🌿' },
  { id: 'figures', nameDe: 'Figuren & Zubehör', nameVi: 'Nhân vật & phụ kiện', icon: '🧑' },
];

function item(
  id: string,
  group: BrickGroupId,
  nameDe: string,
  nameVi: string,
  icon: string,
  width: number,
  depth: number,
  height: number,
  shape: BrickShape,
  material: VoxelBlock['type'],
  rarity: BrickCatalogItem['rarity'] = 'common',
  studs = true,
  angle?: BrickCatalogItem['angle'],
): BrickCatalogItem {
  return { id, group, nameDe, nameVi, icon, width, depth, height, shape, material, rarity, studs, angle };
}

const BRICKS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 6], [1, 8], [1, 10],
  [2, 2], [2, 3], [2, 4], [2, 6], [2, 8], [2, 10],
] as const;

const PLATES = [
  [1, 1], [1, 2], [1, 4], [1, 6], [2, 2], [2, 4], [2, 6],
  [4, 4], [4, 8], [6, 8], [6, 16],
] as const;

const TILES = [[1, 1], [1, 2], [1, 4], [2, 2], [2, 4], [4, 4]] as const;

const commonItems: BrickCatalogItem[] = [
  ...BRICKS.map(([width, depth], index) => item(
    `brick-${width}x${depth}`, 'bricks', `Stein ${width}×${depth}`, `Gạch ${width}×${depth}`, '🧱',
    width, depth, 3, 'brick', (['dirt', 'wood', 'cobblestone', 'iron'] as const)[index % 4],
  )),
  ...PLATES.map(([width, depth], index) => item(
    `plate-${width}x${depth}`, 'plates', `Platte ${width}×${depth}`, `Tấm ${width}×${depth}`, '▰',
    width, depth, 1, 'plate', (['wood', 'cobblestone', 'iron', 'dirt'] as const)[index % 4],
  )),
  ...([30, 45, 65] as const).flatMap((angle) => [[1, 2], [2, 2], [2, 4]].map(([width, depth]) => item(
    `slope-${angle}-${width}x${depth}`, 'slopes', `${angle}° Schräge ${width}×${depth}`, `Gạch dốc ${angle}° ${width}×${depth}`, '◢',
    width, depth, 3, 'slope', 'cobblestone', 'common', true, angle,
  ))),
  ...TILES.map(([width, depth], index) => item(
    `tile-${width}x${depth}`, 'tiles', `Fliese ${width}×${depth}`, `Gạch trơn ${width}×${depth}`, '◻️',
    width, depth, 1, 'tile', (['iron', 'wood', 'cobblestone', 'dirt'] as const)[index % 4], 'common', false,
  )),
  item('panel-wall-1x4', 'panels', 'Wandpanel 1×4', 'Tấm tường 1×4', '🧱', 1, 4, 9, 'panel', 'wood'),
  item('panel-window-1x4', 'panels', 'Fensterpanel 1×4', 'Tấm cửa sổ 1×4', '🪟', 1, 4, 9, 'panel', 'iron'),
  item('panel-door-2x4', 'panels', 'Türpanel 2×4', 'Tấm cửa 2×4', '🚪', 2, 4, 9, 'panel', 'wood'),
  item('panel-glass-2x4', 'panels', 'Glaspanel 2×4', 'Tấm kính 2×4', '🪟', 2, 4, 9, 'panel', 'iron'),
];

const specialItems: BrickCatalogItem[] = [
  item('technic-beam-1x4', 'technic', 'Technic-Balken 1×4', 'Thanh Technic 1×4', '➖', 1, 4, 3, 'beam', 'iron', 'special', false),
  item('technic-beam-1x6', 'technic', 'Technic-Balken 1×6', 'Thanh Technic 1×6', '➖', 1, 6, 3, 'beam', 'iron', 'special', false),
  item('technic-beam-1x8', 'technic', 'Technic-Balken 1×8', 'Thanh Technic 1×8', '➖', 1, 8, 3, 'beam', 'iron', 'special', false),
  item('axle-1x2', 'technic', 'Achse 1×2', 'Trục 1×2', '➖', 1, 2, 1, 'axle', 'iron', 'special', false),
  item('axle-1x4', 'technic', 'Achse 1×4', 'Trục 1×4', '➖', 1, 4, 1, 'axle', 'iron', 'special', false),
  item('gear-2x2', 'technic', 'Zahnrad 2×2', 'Bánh răng 2×2', '⚙️', 2, 2, 1, 'gear', 'iron', 'special', false),
  item('gear-4x4', 'technic', 'Zahnrad 4×4', 'Bánh răng 4×4', '⚙️', 4, 4, 1, 'gear', 'iron', 'special', false),
  item('technic-pin', 'technic', 'Technic-Pin', 'Chốt Technic', '🔩', 1, 1, 3, 'pin', 'iron', 'special', false),
  item('motor-2x2', 'technic', 'Motor 2×2', 'Động cơ 2×2', '🔋', 2, 2, 3, 'motor', 'chest', 'special', false),
  item('tire-2x2', 'technic', 'Reifen 2×2', 'Lốp xe 2×2', '🛞', 2, 2, 6, 'tire', 'cobblestone', 'special', false),
  item('wedge-2x4', 'wedge_curved', 'Flügelkeil 2×4', 'Cánh nêm 2×4', '🪽', 2, 4, 3, 'wedge', 'iron', 'special', false),
  item('wedge-4x6', 'wedge_curved', 'Flügelkeil 4×6', 'Cánh nêm 4×6', '🪽', 4, 6, 3, 'wedge', 'iron', 'special', false),
  item('curved-2x4', 'wedge_curved', 'Kurvenstein 2×4', 'Gạch cong 2×4', '〰️', 2, 4, 3, 'curved', 'wood', 'special', true),
  item('curved-4x6', 'wedge_curved', 'Kurvenstein 4×6', 'Gạch cong 4×6', '〰️', 4, 6, 3, 'curved', 'wood', 'special', true),
  item('leaf-2x2', 'nature', 'Blatt 2×2', 'Lá 2×2', '🍃', 2, 2, 3, 'leaf', 'dirt', 'special', false),
  item('flower-1x1', 'nature', 'Blume 1×1', 'Hoa 1×1', '🌼', 1, 1, 6, 'flower', 'cake', 'special', false),
  item('tree-2x2', 'nature', 'Baum 2×2', 'Cây 2×2', '🌳', 2, 2, 9, 'tree', 'wood', 'special', false),
  item('animal-2x2', 'nature', 'Tier 2×2', 'Động vật 2×2', '🐾', 2, 2, 6, 'animal', 'chicken', 'special', false),
  item('minifigure-1x1', 'figures', 'Minifigur 1×1', 'Nhân vật 1×1', '🧑', 1, 1, 6, 'minifigure', 'chicken', 'special', false),
  item('tool-1x2', 'figures', 'Werkzeug 1×2', 'Dụng cụ 1×2', '🔧', 1, 2, 1, 'accessory', 'iron', 'special', false),
  item('food-1x1', 'figures', 'Zubehör 1×1', 'Phụ kiện 1×1', '🍎', 1, 1, 1, 'accessory', 'cake', 'special', false),
];

export const BRICK_CATALOG = [...commonItems, ...specialItems];
export const COMMON_BRICK_IDS = commonItems.map(({ id }) => id);
export const SPECIAL_BRICK_IDS = specialItems.map(({ id }) => id);

const itemsById = new Map(BRICK_CATALOG.map((brick) => [brick.id, brick]));

export function getBrickPiece(id?: string): BrickCatalogItem | undefined {
  return id ? itemsById.get(id) : undefined;
}

export function getBrickDimensions(id?: string, rotation = 0) {
  const piece = getBrickPiece(id);
  if (!piece) return { width: 1, depth: 1, height: 3 };
  const rotated = Math.abs(rotation % 180) === 90;
  return {
    width: rotated ? piece.depth : piece.width,
    depth: rotated ? piece.width : piece.depth,
    height: piece.height,
  };
}
