# Fix Simulation Rendering and Initial State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the simulation by ensuring entities and blocks are rendered correctly, and the world has initial content (trees) for the Sim to interact with.

**Architecture:** Update React-Three-Fiber components to render the new state properties (entities) and handle various block types visually. Populate the initial state with trees.

**Tech Stack:** React, Three.js, React-Three-Drei, Zustand.

---

### Task 1: Update VoxelWorld to Render Entities and Various Blocks

**Files:**
- Modify: `src/components/world/VoxelWorld.tsx`

- [ ] **Step 1: Update VoxelWorld to include entities and better block styles**

```tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Grid, Sphere } from '@react-three/drei';
import { useWorldStore } from '@/store/useWorldStore';
import { useSimStore } from '@/store/useSimStore';

const getBlockColor = (type: string) => {
  switch (type) {
    case 'grass': return 'green';
    case 'tree': return 'saddlebrown';
    case 'wood': return 'peru';
    case 'campfire': return 'orange';
    default: return 'gray';
  }
};

export default function VoxelWorld() {
  const blocks = useWorldStore((state) => state.blocks);
  const entities = useWorldStore((state) => state.entities);
  const simPosition = useSimStore((state) => state.position);

  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Grid infiniteGrid fadeDistance={50} cellColor="#222" sectionColor="#444" />
      
      {/* The Sim */}
      <Box position={simPosition}>
        <meshStandardMaterial color="red" />
      </Box>

      {/* Entities (Animals) */}
      {entities.map((entity) => (
        <Sphere key={entity.id} position={entity.pos} args={[0.4, 16, 16]}>
          <meshStandardMaterial color="pink" />
        </Sphere>
      ))}

      {/* Blocks */}
      {blocks.map((block, i) => (
        <Box key={i} position={block.pos}>
          <meshStandardMaterial color={getBlockColor(block.type)} />
        </Box>
      ))}
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify component compiles**

- [ ] **Step 3: Commit**

```bash
git add src/components/world/VoxelWorld.tsx
git commit -m "feat(ui): render entities and colored blocks in VoxelWorld"
```

### Task 2: Populate Initial World with Trees

**Files:**
- Modify: `src/store/useWorldStore.ts`

- [ ] **Step 1: Add initial trees to the store**

```typescript
// src/store/useWorldStore.ts
export const useWorldStore = create<WorldState>((set) => ({
  blocks: [
    { pos: [0, 0, 0], type: 'grass' },
    { pos: [2, 0, 2], type: 'tree' },
    { pos: [-3, 0, 1], type: 'tree' },
    { pos: [1, 0, -4], type: 'tree' },
    { pos: [5, 0, 0], type: 'tree' },
  ],
  // ... rest of implementation
```

- [ ] **Step 2: Commit**

```bash
git add src/store/useWorldStore.ts
git commit -m "feat(world): add initial tree blocks to the world"
```

### Task 3: Adjust SimLoop for Better Interaction

**Files:**
- Modify: `src/components/sim/SimLoop.tsx`

- [ ] **Step 1: Lower hunger threshold and increase spawning chance**

```typescript
// src/components/sim/SimLoop.tsx
// ...
      // 2. If hungry and not thinking, trigger agent
      if (newHunger < 95 && !isThinking) { // Lower threshold for testing
// ...
      // Random spawning of entities
      if (worldState.entities.length < 5 && Math.random() < 0.3) { // Increased chance
// ...
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sim/SimLoop.tsx
git commit -m "chore(sim): adjust hunger threshold and spawning rate for testing"
```
