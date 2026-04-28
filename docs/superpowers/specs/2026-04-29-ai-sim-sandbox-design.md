# Design Spec: AI Sim Sandbox

## Overview
A Next.js application featuring an autonomous AI Sim living in a 3D voxel-based "God View" simulation. The Sim uses a LangChain agent with a multi-model factory to reason and act within a sandbox world, including the ability to build structures Minecraft/Roblox style.

## Goals
- Create a functional 3D voxel world using Three.js (React Three Fiber).
- Implement an autonomous AI Sim driven by needs (Hunger, Energy, etc.).
- Build a "Model Factory" supporting Gemini, OpenAI, Azure, Claude, and Ollama.
- Use MongoDB for both state persistence and semantic memory (Vector Search).
- Implement a building system where the Sim can place/remove blocks.

## Architecture

### Frontend (Next.js + Three.js)
- **Framework:** Next.js (App Router).
- **Rendering:** `@react-three/fiber` and `@react-three/drei`.
- **Perspective:** "God View" (Top-down/Isometric) using `MapControls`.
- **World Representation:** Voxel Grid (InstancedMesh for performance).
- **State Management:** `Zustand` for client-side synchronization of Sim position and world updates.

### Backend & Intelligence
- **Database:** MongoDB (Atlas for Vector Search or local MongoDB).
- **Orchestration:** LangChain for Agentic behavior.
- **Model Factory:** A unified interface to swap LLMs (Gemini, OpenAI, Azure, Claude, Ollama).
- **Memory System:** 
  - **Short-term:** Current "Working Memory" in the Agent's prompt context.
  - **Long-term:** Semantic retrieval from MongoDB Vector Search.
- **Pathfinding:** A* algorithm on the voxel grid.

### The Sim Sandbox
- **Needs System:** Hunger, Energy, Social, etc. (Decrements over time).
- **Autonomous Loop:** 
  - Evaluation Tick -> Agent Decision -> Action Execution -> State Update.
- **Building System:** Sim can place blocks (Wood, Stone, Glass, etc.) to create shelter or structures.

## Data Models

### Sim
```json
{
  "_id": "sim_001",
  "name": "Main Sim",
  "stats": {
    "hunger": 100,
    "energy": 100,
    "happiness": 100
  },
  "position": { "x": 0, "y": 0, "z": 0 },
  "inventory": [],
  "last_thought": "I should build a house."
}
```

### World Block
```json
{
  "pos": [10, 0, 5],
  "type": "wood_plank",
  "owner": "sim_001"
}
```

### Memory Entry
```json
{
  "content": "Built a small wooden hut near the tree.",
  "embedding": [0.1, -0.2, ...],
  "timestamp": "2026-04-29T..."
}
```

## Implementation Phases

### Phase 1: Foundations
- Scaffold Next.js project.
- Setup React Three Fiber + Basic Voxel Grid.
- Implement Model Factory utility.

### Phase 2: The Agent & Memory
- Connect MongoDB.
- Implement LangChain Agent with "Tools" (move, place_block, etc.).
- Setup Semantic Memory (Vector Search).

### Phase 3: Autonomous Behavior
- Implement "Needs" state machine.
- Integrate the autonomous decision loop.
- Add pathfinding for Sim movement.

### Phase 4: Building Logic
- Refine Minecraft-style building mechanics for the AI.
- Add basic UI for tracking Sim thoughts and needs.

## Security & Performance
- Rate limiting for LLM calls.
- `InstancedMesh` for optimized voxel rendering.
- Validation layers to prevent the AI from placing blocks in invalid locations.
