# SIM.AI

Autonomous AI agent living in a 3D voxel world. The agent survives, builds, learns, and evolves through persistent memory — all decisions made by AI, no human input required.

## What It Does

A simulated AI character dropped into a procedurally generated voxel world. Every few seconds it observes, thinks, and acts — gathering resources, building structures, hunting, crafting, and adapting strategies based on past experiences saved as markdown files.

### Core Systems

- **Autonomous Agent Loop** — AI decides its own goals and priorities each tick based on needs (hunger, energy, happiness) and accumulated knowledge.
- **Persistent Memory** — Experiences saved as `.md` files in `memories/`. Knowledge base grows over time as agent discovers patterns and strategies. Semantic search powered by MongoDB Vector Search.
- **Dynamic 3D World** — Procedurally generated voxel terrain with biomes (Plains, Forest, Mountain, Water). Features a custom animated Sim character and low-poly animal models.
- **Day/Night Cycle** — Real-time clock with dynamic lighting, seasonal day-length variation, and sunrise/sunset effects.
- **Blueprints & Crafting** — Building blueprints (houses, towers, farms, bridges) and crafting recipes (tools, food, materials).
- **Expanded Action Set** — Agent can move, gather, hunt, build, craft, terraform, cook, and learn autonomously.

### Tech Stack

- **Next.js 16** + React 19
- **Three.js** via React Three Fiber for high-performance 3D rendering using `InstancedMesh`.
- **LangChain / LangGraph** for AI agent orchestration with a 100-step recursion limit.
- **Multi-provider LLM support** — Anthropic, OpenAI, Azure OpenAI, Google Gemini, Ollama.
- **Zustand** for global client-side state management (Simulation, World, Time).
- **MongoDB** for persistent storage and vector-based memory search.
- **TypeScript** for end-to-end type safety.

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your LLM API key(s) and MongoDB URI

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to watch the sim live.

## Project Structure

```
src/
  app/                  # Next.js app router
    api/agent/tick/     # Agent tick API endpoint
  components/
    sim/SimLoop.tsx     # Main simulation loop + action execution
    world/VoxelWorld.tsx# 3D world renderer with custom models & lighting
    ui/SimOverlay.tsx   # HUD overlay (stats, inventory, thoughts, date/time)
  lib/ai/
    agent.ts            # LangGraph ReAct agent with memory injection
    blueprints.ts       # Building blueprints + crafting recipes
    tools.ts            # Agent tools (build, gather, craft, hunt, terraform, etc.)
    memory-manager.ts   # File-based .md memory system
    memory.ts           # MongoDB vector memory (semantic search)
    model-factory.ts    # Multi-provider LLM factory
  store/
    useSimStore.ts      # Sim state (stats, inventory, position)
    useWorldStore.ts    # World state (blocks, entities)
    useTimeStore.ts     # Game time state (hour, day, month, year)
memories/
  knowledge.md          # Agent's accumulated learnings
  experiences/          # Per-tick experience logs
```

## How Memory Works

Each tick:
1. Agent receives its last 5 experiences + full knowledge base in the prompt
2. Agent thinks, decides actions, optionally calls `save_learning` for important insights
3. Experience (thought + actions + state) auto-saved as `.md` file
4. Action outcomes (success/failure) fed back next tick

The agent builds a growing `knowledge.md` over time — strategies, resource locations, failed approaches to avoid. Old experience files pruned at 50 max.

## License

[MIT](LICENSE)
