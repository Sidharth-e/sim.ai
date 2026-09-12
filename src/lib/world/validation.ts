export const ALLOWED_BLOCK_TYPES = new Set([
  'wood',
  'stone',
  'dirt',
  'sand',
  'grass',
  'snow',
  'leaves',
  'glass',
  'wood_plank',
  'brick',
  'cobblestone',
  'iron',
  'gold',
  'campfire',
  'torch',
  'chest',
  'farmland',
  'water',
]);

export interface BlockValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateBlockPlacement(
  pos: [number, number, number],
  type: string,
  simPos?: [number, number, number],
  existingBlocks?: { pos: [number, number, number] }[]
): BlockValidationResult {
  const [x, y, z] = pos;

  if (isNaN(x) || isNaN(y) || isNaN(z)) {
    return { valid: false, reason: 'Coordinates must be valid numbers' };
  }

  if (Math.abs(x) > 200 || Math.abs(z) > 200 || y < -10 || y > 60) {
    return { valid: false, reason: 'Coordinates out of world bounds' };
  }

  const cleanType = type.trim().toLowerCase();
  if (!ALLOWED_BLOCK_TYPES.has(cleanType)) {
    return { valid: false, reason: `Invalid block type "${type}". Allowed: ${Array.from(ALLOWED_BLOCK_TYPES).join(', ')}` };
  }

  if (simPos) {
    const sx = Math.round(simPos[0]);
    const sy = Math.round(simPos[1]);
    const sz = Math.round(simPos[2]);

    if (x === sx && z === sz && (y === sy || y === sy + 1)) {
      return { valid: false, reason: 'Cannot place block directly inside Sim body' };
    }

    const dist = Math.sqrt((x - simPos[0]) ** 2 + (y - simPos[1]) ** 2 + (z - simPos[2]) ** 2);
    if (dist > 10) {
      return { valid: false, reason: `Block placement location is too far away (${Math.round(dist)} blocks > max 10 blocks reach)` };
    }
  }

  if (existingBlocks && existingBlocks.length > 0) {
    const exists = existingBlocks.some(
      (b) => b.pos[0] === x && b.pos[1] === y && b.pos[2] === z
    );
    if (exists) {
      return { valid: false, reason: `A block already exists at [${x}, ${y}, ${z}]` };
    }
  }

  return { valid: true };
}
