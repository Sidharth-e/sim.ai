import { create } from 'zustand';

interface Block {
  pos: [number, number, number];
  type: string;
}

interface WorldState {
  blocks: Block[];
  addBlock: (pos: [number, number, number], type: string) => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  blocks: [{ pos: [0, 0, 0], type: 'grass' }],
  addBlock: (pos, type) => set((state) => ({ 
    blocks: [...state.blocks, { pos, type }] 
  })),
}));
