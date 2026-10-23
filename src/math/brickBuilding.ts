import type { VoxelBlock } from './minecraftCurriculum.js';
import { BRICK_CATALOG, getBrickDimensions, getBrickPiece } from './brickCatalog.js';

export type BrickInventory = Record<string, number>;
export const BASE_GRID_SIZES = [20, 30, 40] as const;
export type BaseGridSize = typeof BASE_GRID_SIZES[number];
export const DEFAULT_BASE_GRID_SIZE: BaseGridSize = 20;

export function isBaseGridSize(value: unknown): value is BaseGridSize {
  return BASE_GRID_SIZES.some((size) => size === value);
}

export function getBaseGridBounds(size: BaseGridSize) {
  const max = Math.floor(size / 2) - 1;
  return { min: -max, max };
}

export function blockFitsBaseGrid(block: VoxelBlock, size: BaseGridSize): boolean {
  const bounds = getBaseGridBounds(size);
  const dimensions = getBrickDimensions(block.pieceId, block.rotation);
  return block.x >= bounds.min && block.z >= bounds.min
    && block.x + dimensions.width - 1 <= bounds.max
    && block.z + dimensions.depth - 1 <= bounds.max;
}

export function createStartingInventory(): BrickInventory {
  return Object.fromEntries(BRICK_CATALOG.map(({ id }) => [id, 2]));
}

export function blocksOverlap(left: VoxelBlock, right: VoxelBlock): boolean {
  const leftSize = getBrickDimensions(left.pieceId, left.rotation);
  const rightSize = getBrickDimensions(right.pieceId, right.rotation);
  return left.x < right.x + rightSize.width && left.x + leftSize.width > right.x
    && left.z < right.z + rightSize.depth && left.z + leftSize.depth > right.z
    && left.y < right.y + rightSize.height && left.y + leftSize.height > right.y;
}

export function blockOccupiesCell(block: VoxelBlock, x: number, y: number, z: number): boolean {
  const size = getBrickDimensions(block.pieceId, block.rotation);
  return x >= block.x && x < block.x + size.width
    && z >= block.z && z < block.z + size.depth
    && y >= block.y && y < block.y + size.height;
}

export function removePlacedBrick(
  blocks: VoxelBlock[],
  inventory: BrickInventory,
  target: VoxelBlock,
): { blocks: VoxelBlock[]; inventory: BrickInventory } | null {
  const index = blocks.findIndex((block) => block.x === target.x && block.y === target.y && block.z === target.z
    && block.pieceId === target.pieceId && block.rotation === target.rotation);
  if (index < 0) return null;

  const pieceId = target.pieceId || 'brick-1x1';
  if (!getBrickPiece(pieceId)) return null;
  return {
    blocks: blocks.filter((_, blockIndex) => blockIndex !== index),
    inventory: { ...inventory, [pieceId]: (inventory[pieceId] || 0) + 1 },
  };
}
