# AI Sim Sandbox Implementation Plan - Phase 2 & 3: Autonomous Behavior & Needs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Sim's autonomous behavior driven by a "Needs" system, add pathfinding for navigation, and refine the memory retrieval logic.

**Architecture:** Extend the existing Zustand store with Needs. Implement a Tick loop in the frontend that periodically calls the Agent API. Integrate A* pathfinding on the client side.

**Tech Stack:** Next.js, Zustand, LangChain, MongoDB, ngraph.path (for A*).

---

### Task 1: Needs System in Zustand

**Files:**
- Modify: `src/store/useSimStore.ts` (new file) or `src/store/useWorldStore.ts`

- [ ] **Step 1: Create Sim Store for Needs**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/store/useSimStore.ts
git commit -m "feat: add sim store with needs system"
```

---

### Task 2: A* Pathfinding Integration

**Files:**
- Create: `src/lib/world/pathfinding.ts`
- Test: `src/lib/world/__tests__/pathfinding.test.ts`

- [ ] **Step 1: Install pathfinding library**

Run: `pnpm add ngraph.graph ngraph.path`
Expected: Library installed.

- [ ] **Step 2: Implement Pathfinding Utility**

```typescript
import createGraph from 'ngraph.graph';
import path from 'ngraph.path';

export function findPath(start: [number, number], end: [number, number], blocked: Set<string>) {
  const graph = createGraph();
  // Simple 2D grid pathfinding for now (x, z)
  for (let x = -10; x <= 10; x++) {
    for (let z = -10; z <= 10; z++) {
      if (blocked.has(`${x},${z}`)) continue;
      graph.addNode(`${x},${z}`);
      // Add neighbors (up, down, left, right)
      [[1,0], [-1,0], [0,1], [0,-1]].forEach(([dx, dz]) => {
        const nx = x + dx;
        const nz = z + dz;
        if (!blocked.has(`${nx},${nz}`)) {
          graph.addLink(`${x},${z}`, `${nx},${nz}`);
        }
      });
    }
  }
  const pathFinder = path.aStar(graph);
  return pathFinder.find(`${start[0]},${start[1]}`, `${end[0]},${end[1]}`);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/world/pathfinding.ts
git commit -m "feat: implement basic A* pathfinding"
```

---

### Task 3: Autonomous Tick Loop

**Files:**
- Create: `src/components/sim/SimLoop.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create SimLoop Component**

```typescript
'use client';
import { useEffect } from 'react';
import { useSimStore } from '@/store/useSimStore';

export default function SimLoop() {
  const { stats, updateStats, setThinking, isThinking } = useSimStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      // 1. Decay stats
      updateStats({ hunger: Math.max(0, stats.hunger - 1) });

      // 2. If hungry and not thinking, trigger agent
      if (stats.hunger < 80 && !isThinking) {
        setThinking(true);
        try {
          await fetch('/api/agent/tick', { 
            method: 'POST', 
            body: JSON.stringify({ stats }) 
          });
        } finally {
          setThinking(false);
        }
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [stats, isThinking]);

  return null;
}
```

- [ ] **Step 2: Add SimLoop to Page**

```typescript
import SimLoop from '@/components/sim/SimLoop';
// ... inside Home component
<SimLoop />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sim/SimLoop.tsx src/app/page.tsx
git commit -m "feat: add autonomous tick loop"
```

---

### Task 4: UI for Thoughts and Needs

**Files:**
- Create: `src/components/ui/SimOverlay.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement SimOverlay**

```typescript
'use client';
import { useSimStore } from '@/store/useSimStore';

export default function SimOverlay() {
  const { stats, isThinking } = useSimStore();

  return (
    <div className="absolute top-4 right-4 bg-white/80 p-4 rounded shadow-lg w-64">
      <h2 className="font-bold border-b mb-2">Sim Status</h2>
      <div className="space-y-1">
        <div>Hunger: {stats.hunger}%</div>
        <div>Energy: {stats.energy}%</div>
        <div className="mt-2 italic text-sm">
          {isThinking ? "Thinking..." : "Idle"}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SimOverlay.tsx
git commit -m "feat: add UI overlay for needs and thoughts"
```
