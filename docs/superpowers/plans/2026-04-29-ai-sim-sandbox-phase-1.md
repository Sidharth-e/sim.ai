# AI Sim Sandbox Implementation Plan - Phase 1: Foundations & Intelligence

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the 3D voxel world, the Multi-Model Factory for AI reasoning, and the persistence/memory layer with MongoDB.

**Architecture:** Next.js App Router for the backend/frontend split. React Three Fiber for the 3D world. LangChain for agentic logic. MongoDB for state and semantic memory.

**Tech Stack:** Next.js, Three.js, @react-three/fiber, Zustand, LangChain, MongoDB, Tailwind CSS.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `.env.example`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`
- Test: `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --use-pnpm --src-dir --no-import-alias`
Expected: Project scaffolded.

- [ ] **Step 2: Install dependencies**

Run: `pnpm add three @types/three @react-three/fiber @react-three/drei zustand langchain @langchain/openai @langchain/google-genai @langchain/community @langchain/core mongodb mongoose lucide-react`
Expected: Dependencies installed.

- [ ] **Step 3: Setup environment variables**

Create `.env.local`:
```bash
MONGODB_URI=mongodb://localhost:27011/sim-ai
MODEL_PROVIDER=ollama # or gemini, openai
OLLAMA_BASE_URL=http://localhost:11434
GOOGLE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: scaffold project and install dependencies"
```

---

### Task 2: Multi-Model Factory

**Files:**
- Create: `src/lib/ai/model-factory.ts`
- Test: `src/lib/ai/__tests__/model-factory.test.ts`

- [ ] **Step 1: Write the failing test for Model Factory**

```typescript
import { ModelFactory } from '../model-factory';

describe('ModelFactory', () => {
  it('should return an Ollama model when provider is ollama', () => {
    const model = ModelFactory.createModel('ollama');
    expect(model._modelType()).toBe('chat_models');
  });
});
```

- [ ] **Step 2: Implement Model Factory**

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export class ModelFactory {
  static createModel(provider?: string): BaseChatModel {
    const selectedProvider = provider || process.env.MODEL_PROVIDER || 'ollama';

    switch (selectedProvider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: "gpt-4-turbo-preview",
          apiKey: process.env.OPENAI_API_KEY,
        });
      case 'gemini':
        return new ChatGoogleGenerativeAI({
          modelName: "gemini-pro",
          apiKey: process.env.GOOGLE_API_KEY,
        });
      case 'ollama':
        return new ChatOllama({
          baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
          model: "llama3",
        });
      default:
        throw new Error(`Unsupported provider: ${selectedProvider}`);
    }
  }
}
```

- [ ] **Step 3: Run test and verify it passes**

Run: `npx jest src/lib/ai/__tests__/model-factory.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai/model-factory.ts
git commit -m "feat: implement multi-model factory"
```

---

### Task 3: Voxel World Component (R3F)

**Files:**
- Create: `src/components/world/VoxelWorld.tsx`, `src/store/useWorldStore.ts`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Zustand Store for World State**

```typescript
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
```

- [ ] **Step 2: Create VoxelWorld Component**

```typescript
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Grid } from '@react-three/drei';
import { useWorldStore } from '@/store/useWorldStore';

export default function VoxelWorld() {
  const blocks = useWorldStore((state) => state.blocks);

  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Grid infiniteGrid fadeDistance={50} cellColor="#222" sectionColor="#444" />
      {blocks.map((block, i) => (
        <Box key={i} position={block.pos}>
          <meshStandardMaterial color={block.type === 'grass' ? 'green' : 'brown'} />
        </Box>
      ))}
    </Canvas>
  );
}
```

- [ ] **Step 3: Update Home page to show VoxelWorld**

```typescript
import VoxelWorld from '@/components/world/VoxelWorld';

export default function Home() {
  return (
    <main className="h-screen w-screen bg-black">
      <VoxelWorld />
      <div className="absolute top-4 left-4 text-white p-4 bg-black/50 rounded">
        AI Sim Sandbox
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/world/VoxelWorld.tsx src/store/useWorldStore.ts src/app/page.tsx
git commit -m "feat: basic voxel world rendering with Three.js"
```

---

### Task 4: MongoDB & Vector Store Utility

**Files:**
- Create: `src/lib/db/mongodb.ts`, `src/lib/ai/memory.ts`

- [ ] **Step 1: Implement MongoDB Client**

```typescript
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let client: MongoClient;

export async function connectDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db('sim-ai');
}
```

- [ ] **Step 2: Implement Simple Memory Store (Semantic)**

```typescript
import { connectDB } from '../db/mongodb';

export async function saveMemory(content: string, embedding: number[]) {
  const db = await connectDB();
  await db.collection('memories').insertOne({
    content,
    embedding,
    timestamp: new Date(),
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/mongodb.ts src/lib/ai/memory.ts
git commit -m "feat: mongodb and memory storage foundation"
```

---

### Task 5: LangChain Agent & Tools

**Files:**
- Create: `src/lib/ai/agent.ts`, `src/app/api/agent/tick/route.ts`

- [ ] **Step 1: Implement Agent Tools**

```typescript
import { DynamicTool } from "@langchain/core/tools";
import { useWorldStore } from "@/store/useWorldStore";

export const createTools = () => [
  new DynamicTool({
    name: "place_block",
    description: "Places a block at x, y, z. Usage: place_block(1, 0, 1, 'wood')",
    func: async (input: string) => {
      // Logic to update store (will need to bridge to client)
      return `Requested to place block: ${input}`;
    },
  }),
];
```

- [ ] **Step 2: Implement Agent Runner**

```typescript
import { ModelFactory } from "./model-factory";
import { createTools } from "./tools";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { PullPromptFromHub } from "langchain/hub";

export async function runAgentCycle(input: string) {
  const model = ModelFactory.createModel();
  const tools = createTools();
  // Simplified for now
  const response = await model.invoke(input);
  return response.content;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/agent.ts
git commit -m "feat: initial langchain agent setup"
```
