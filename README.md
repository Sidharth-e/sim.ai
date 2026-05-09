# SIM.AI

Autonomous AI agent living in a 3D voxel world. The agent survives, builds, learns, and evolves through persistent memory — all decisions made by AI, no human input required.

## What It Does

A simulated AI character dropped into a procedurally generated voxel world. Every few seconds it observes, thinks, and acts — gathering resources, building structures, hunting, crafting, and adapting strategies based on past experiences saved as markdown files.

### Core Systems

- **Autonomous Agent Loop** — AI decides its own goals and priorities each tick based on needs (hunger, energy, happiness) and accumulated knowledge
- **Persistent Memory** — experiences saved as `.md` files in `memories/`. Knowledge base grows over time as agent discovers patterns and strategies
- **3D Voxel World** — interactive terrain with blocks, trees, animals, and buildable structures rendered with Three.js
- **Blueprints & Crafting** — 14 building blueprints (houses, towers, farms, bridges) and 7 crafting recipes
- **Resource Gathering** — mining, woodcutting, hunting, farming with real inventory management

### Tech Stack

- **Next.js 16** + React 19
- **Three.js** via React Three Fiber for 3D rendering
- **LangChain / LangGraph** for AI agent orchestration
- **Multi-provider LLM support** — Anthropic, OpenAI, Azure OpenAI, Google Gemini, Ollama
- **Zustand** for state management
- **MongoDB** for vector-based memory search
- **TypeScript** throughout

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your LLM API key(s)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to watch the sim live.

## Project Structure

```
src/
  app/                  # Next.js app router
    api/agent/tick/     # Agent tick API endpoint
  components/
    sim/SimLoop.tsx     # Main simulation loop + action execution
    world/VoxelWorld.tsx# 3D world renderer
    ui/SimOverlay.tsx   # HUD overlay (stats, inventory, thoughts)
  lib/ai/
    agent.ts            # LangGraph ReAct agent with memory injection
    blueprints.ts       # Building blueprints + crafting recipes
    tools.ts            # Agent tools (build, gather, craft, hunt, etc.)
    memory-manager.ts   # File-based .md memory system
    memory.ts           # MongoDB vector memory (semantic search)
    model-factory.ts    # Multi-provider LLM factory
  store/
    useSimStore.ts      # Sim state (stats, inventory, position)
    useWorldStore.ts    # World state (blocks, entities)
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
