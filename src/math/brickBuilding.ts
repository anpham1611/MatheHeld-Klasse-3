import { VoxelBlock } from './minecraftCurriculum';
import { getBrickDimensions, getBrickPiece } from './brickCatalog';

export type BrickInventory = Record<string, number>;

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
