import { create } from 'zustand';

interface Block {
  pos: [number, number, number];
  type: string;
}

interface Entity {
  id: string;
  type: string;
  pos: [number, number, number];
  health: number;
}

interface WorldState {
  blocks: Block[];
  entities: Entity[];
  addBlock: (pos: [number, number, number], type: string) => void;
  addEntity: (entity: Entity) => void;
  removeEntity: (id: string) => void;
  removeBlock: (pos: [number, number, number]) => void;
}

function hash(x: number, z: number): number {
  const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function noise2d(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const a = hash(ix, iz);
  const b = hash(ix + 1, iz);
  const c = hash(ix, iz + 1);
  const d = hash(ix + 1, iz + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

type Biome = 'plains' | 'forest' | 'mountain' | 'water';

function getBiome(x: number, z: number): Biome {
  if (Math.abs(x) < 20 && Math.abs(z) < 20) return 'plains';

  const wobble = (noise2d(x * 0.015, z * 0.015) - 0.5) * 50;
  const nx = x + wobble;
  const nz = z + (noise2d(x * 0.015 + 97, z * 0.015 + 97) - 0.5) * 50;

  if (nx >= 0 && nz >= 0) return 'forest';
  if (nx < 0 && nz >= 0) return 'mountain';
  if (nx < 0 && nz < 0) return 'water';
  return 'plains';
}

function getHeight(x: number, z: number, biome: Biome): number {
  switch (biome) {
    case 'mountain':
      return Math.round(
        5 +
          noise2d(x * 0.02, z * 0.02) * 6 +
          noise2d(x * 0.05, z * 0.05) * 3 +
          noise2d(x * 0.1, z * 0.1) * 1.5,
      );
    case 'water':
      return -3;
    default:
      return 1;
  }
}

function addTree(
  blocks: Block[],
  x: number,
  h: number,
  z: number,
  maxTrunkExtra: number,
) {
  const trunkH = 3 + Math.floor(hash(x + 0.5, z + 0.5) * maxTrunkExtra);
  for (let y = 1; y <= trunkH; y++) {
    blocks.push({ pos: [x, h + y, z], type: 'wood' });
  }
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = 0; dy <= 1; dy++) {
        if (dx === 0 && dz === 0 && dy === 0) continue;
        blocks.push({
          pos: [x + dx, h + trunkH + dy, z + dz],
          type: 'leaves',
        });
      }
    }
  }
  blocks.push({ pos: [x, h + trunkH + 2, z], type: 'leaves' });
}

function generateWorld(): { blocks: Block[]; entities: Entity[] } {
  const blocks: Block[] = [];
  const SIZE = 180;

  for (let x = -SIZE; x <= SIZE; x++) {
    for (let z = -SIZE; z <= SIZE; z++) {
      const biome = getBiome(x, z);
      const h = getHeight(x, z, biome);

      let surfaceType: string;
      if (biome === 'water') {
        surfaceType = 'sand';
      } else if (biome === 'mountain') {
        surfaceType = h > 12 ? 'snow' : h > 8 ? 'stone' : 'grass';
      } else {
        surfaceType = 'grass';
      }

      blocks.push({ pos: [x, h, z], type: surfaceType });

      if (biome === 'mountain') {
        for (let y = h - 1; y >= 0; y--) {
          blocks.push({
            pos: [x, y, z],
            type: y > h - 3 ? 'dirt' : 'stone',
          });
        }
      } else if (biome === 'water') {
        for (let d = 1; d <= 2; d++) {
          blocks.push({ pos: [x, h - d, z], type: 'sand' });
        }
      } else {
        blocks.push({ pos: [x, h - 1, z], type: 'dirt' });
      }

      if (
        biome === 'forest' &&
        hash(x, z) > 0.85 &&
        x % 2 === 0 &&
        z % 2 === 0
      ) {
        addTree(blocks, x, h, z, 3);
      }

      if (
        biome === 'plains' &&
        hash(x + 200, z + 200) > 0.993 &&
        Math.abs(x) > 5 &&
        Math.abs(z) > 5
      ) {
        addTree(blocks, x, h, z, 2);
      }
    }
  }

  const entities: Entity[] = [];
  let animalId = 0;
  for (let x = -SIZE; x <= SIZE; x += 25) {
    for (let z = -SIZE; z <= SIZE; z += 25) {
      const biome = getBiome(x, z);
      if (biome === 'water') continue;
      if (hash(x * 0.37, z * 0.37) > 0.55) continue;
      const h = getHeight(x, z, biome);
      entities.push({
        id: `animal-${animalId}`,
        type:
          animalId % 3 === 0
            ? 'cow'
            : animalId % 3 === 1
              ? 'sheep'
              : 'chicken',
        pos: [x, h + 1, z],
        health: 100,
      });
      animalId++;
    }
  }

  return { blocks, entities };
}

const { blocks: initialBlocks, entities: initialEntities } = generateWorld();

export const useWorldStore = create<WorldState>((set) => ({
  blocks: initialBlocks,
  entities: initialEntities,
  addBlock: (pos, type) =>
    set((state) => ({
      blocks: [...state.blocks, { pos, type }],
    })),
  addEntity: (entity) =>
    set((state) => ({
      entities: [...state.entities, entity],
    })),
  removeEntity: (id) =>
    set((state) => ({
      entities: state.entities.filter((e) => e.id !== id),
    })),
  removeBlock: (pos) =>
    set((state) => ({
      blocks: state.blocks.filter(
        (b) =>
          b.pos[0] !== pos[0] || b.pos[1] !== pos[1] || b.pos[2] !== pos[2],
      ),
    })),
}));
