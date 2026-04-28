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
  updateStats: (delta: Partial<SimStats>) => void;
  setPosition: (pos: [number, number, number]) => void;
  setThinking: (thinking: boolean) => void;
}

export const useSimStore = create<SimState>((set) => ({
  stats: { hunger: 100, energy: 100, happiness: 100 },
  position: [0, 0, 0],
  isThinking: false,
  updateStats: (delta) => set((state) => ({
    stats: { ...state.stats, ...delta }
  })),
  setPosition: (position) => set({ position }),
  setThinking: (isThinking) => set({ isThinking }),
}));
