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

function getHeight(x: number, z: number): number {
  return Math.round(
    Math.sin(x * 0.06) * 3 +
    Math.cos(z * 0.05) * 3 +
    Math.sin((x + z) * 0.03) * 2 +
    Math.cos(x * 0.1 - z * 0.07) * 1.5
  );
}

function hash(x: number, z: number): number {
  const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function generateWorld(): { blocks: Block[]; entities: Entity[] } {
  const blocks: Block[] = [];
  const SIZE = 40;
  const WATER_LEVEL = -1;
  const DEPTH = 3;

  for (let x = -SIZE; x <= SIZE; x++) {
    for (let z = -SIZE; z <= SIZE; z++) {
      const h = getHeight(x, z);
      const isUnderwater = h <= WATER_LEVEL;

      blocks.push({ pos: [x, h, z], type: isUnderwater ? 'sand' : 'grass' });

      for (let d = 1; d <= DEPTH; d++) {
        blocks.push({
          pos: [x, h - d, z],
          type: d <= 2 ? 'dirt' : 'stone',
        });
      }

      if (
        !isUnderwater &&
        hash(x, z) > 0.97 &&
        x % 4 === 0 && z % 4 === 0 &&
        Math.abs(x) < SIZE - 2 &&
        Math.abs(z) < SIZE - 2
      ) {
        const trunkHeight = 3 + Math.floor(hash(x + 0.5, z + 0.5) * 2);
        for (let y = 1; y <= trunkHeight; y++) {
          blocks.push({ pos: [x, h + y, z], type: 'wood' });
        }
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            for (let dy = 0; dy <= 1; dy++) {
              if (dx === 0 && dz === 0 && dy === 0) continue;
              blocks.push({
                pos: [x + dx, h + trunkHeight + dy, z + dz],
                type: 'leaves',
              });
            }
          }
        }
        blocks.push({ pos: [x, h + trunkHeight + 2, z], type: 'leaves' });
      }
    }
  }

  const entities: Entity[] = [];
  const animalSpots: [number, number][] = [
    [5, 8], [-10, 6], [15, -5], [-18, -12], [8, -14],
    [20, 10], [-12, 18], [25, -8], [-6, 22], [12, 16],
  ];
  animalSpots.forEach(([x, z], i) => {
    const h = getHeight(x, z);
    if (h > WATER_LEVEL) {
      entities.push({
        id: `animal-${i}`,
        type: i % 3 === 0 ? 'cow' : i % 3 === 1 ? 'sheep' : 'chicken',
        pos: [x, h + 1, z],
        health: 100,
      });
    }
  });

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
          b.pos[0] !== pos[0] || b.pos[1] !== pos[1] || b.pos[2] !== pos[2]
      ),
    })),
}));
