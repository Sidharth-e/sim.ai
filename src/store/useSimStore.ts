import { create } from 'zustand';

interface SimStats {
  hunger: number;
  energy: number;
  happiness: number;
}

interface SimState {
  stats: SimStats;
  position: [number, number, number];
  isThinking: boolean;
  lastThought: string;
  inventory: Record<string, number>;
  updateStats: (delta: Partial<SimStats>) => void;
  setPosition: (pos: [number, number, number]) => void;
  setThinking: (thinking: boolean) => void;
  setLastThought: (thought: string) => void;
  addToInventory: (item: string, amount: number) => void;
  removeFromInventory: (item: string, amount: number) => void;
}

export const useSimStore = create<SimState>((set) => ({
  stats: { hunger: 90, energy: 100, happiness: 100 },
  position: [0, 6, 0],
  isThinking: false,
  lastThought: '',
  inventory: { wood: 0, raw_meat: 0, cooked_meat: 0 },
  updateStats: (delta) => set((state) => ({
    stats: { ...state.stats, ...delta }
  })),
  setPosition: (position) => set({ position }),
  setThinking: (isThinking) => set({ isThinking }),
  setLastThought: (lastThought) => set({ lastThought }),
  addToInventory: (item, amount) => set((state) => ({
    inventory: {
      ...state.inventory,
      [item]: (state.inventory[item] || 0) + amount
    }
  })),
  removeFromInventory: (item, amount) => set((state) => ({
    inventory: {
      ...state.inventory,
      [item]: Math.max(0, (state.inventory[item] || 0) - amount)
    }
  })),
}));
