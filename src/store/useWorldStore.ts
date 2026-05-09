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

export const useWorldStore = create<WorldState>((set) => ({
  blocks: [{ pos: [0, 0, 0], type: 'grass' }],
  entities: [],
  addBlock: (pos, type) => set((state) => ({ 
    blocks: [...state.blocks, { pos, type }] 
  })),
  addEntity: (entity) => set((state) => ({
    entities: [...state.entities, entity]
  })),
  removeEntity: (id) => set((state) => ({
    entities: state.entities.filter(e => e.id !== id)
  })),
  removeBlock: (pos) => set((state) => ({
    blocks: state.blocks.filter(b => b.pos[0] !== pos[0] || b.pos[1] !== pos[1] || b.pos[2] !== pos[2])
  })),
}));
