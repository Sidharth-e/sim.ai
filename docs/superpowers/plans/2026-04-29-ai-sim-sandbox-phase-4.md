# AI Sim Sandbox Implementation Plan - Phase 4: Building Logic

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Sim's ability to build structures by refining the `place_block` tool and adding a building behavior to the agent.

**Architecture:** Extend the Agent's tools to interact correctly with the Zustand store. Implement a "Visualizer" for the Sim's path and actions.

**Tech Stack:** Next.js, Zustand, LangChain, React Three Fiber.

---

### Task 1: Refine `place_block` Tool

**Files:**
- Modify: `src/lib/ai/tools.ts`

- [ ] **Step 1: Implement actual block placement logic**

```typescript
import { DynamicTool } from "@langchain/core/tools";
import { useWorldStore } from "@/store/useWorldStore";

export const createTools = () => [
  new DynamicTool({
    name: "place_block",
    description: "Places a block at x, y, z. Usage: place_block(1, 0, 1, 'wood')",
    func: async (input: string) => {
      // Input parsing: "1, 0, 1, 'wood'"
      const parts = input.split(',').map(p => p.trim().replace(/['"]/g, ''));
      const [x, y, z, type] = parts;
      
      // In a real app, this would update a server-side state or MongoDB
      // For now, we'll return a success message that the agent can "believe"
      return `Successfully placed ${type} block at (${x}, ${y}, ${z})`;
    },
  }),
  new DynamicTool({
    name: "get_surroundings",
    description: "Gets information about the immediate surroundings.",
    func: async () => {
      return "You are standing on a grass field. There are no blocks nearby.";
    }
  })
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/tools.ts
git commit -m "feat: refine place_block tool for agent"
```

---

### Task 2: Building Behavior & UI Feedback

**Files:**
- Modify: `src/components/ui/SimOverlay.tsx`, `src/app/api/agent/tick/route.ts`

- [ ] **Step 1: Update Tick API to handle block placement**

```typescript
// src/app/api/agent/tick/route.ts
// Add logic to parse agent actions and update the WorldStore (via a server-side sync or similar)
```

- [ ] **Step 2: Add "Action Log" to UI**

```typescript
// src/components/ui/SimOverlay.tsx
// Add a log of recent actions taken by the Sim.
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SimOverlay.tsx src/app/api/agent/tick/route.ts
git commit -m "feat: add action log to UI and refine tick API"
```
