# sim.ai - Project Instructions

Autonomous AI Sim living in a 3D voxel-based "God View" simulation.

## Project Overview

`sim.ai` is a Next.js application featuring an AI Sim sandbox. The Sim uses a LangChain agent with a multi-model factory to reason and act within a 3D world, including the ability to move and build structures.

### Tech Stack

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Three.js](https://threejs.org/) (via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)), [Tailwind CSS 4](https://tailwindcss.com/), [Zustand](https://zustand-demo.pmnd.rs/).
- **AI Logic:** [LangChain](https://js.langchain.com/), [LangGraph](https://langchain-ai.github.io/langgraphjs/), Model Factory for LLM abstraction (Gemini, OpenAI, Azure, Claude, Ollama).
- **Database:** [MongoDB](https://www.mongodb.com/) (Persistence & Semantic Memory with Vector Search).
- **State Management:** Zustand for client-side state; MongoDB for server-side persistence.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file with the following:

```env
MONGODB_URI=mongodb://localhost:27017/sim-ai
MODEL_PROVIDER=ollama # gemini, openai, azure, anthropic, ollama
# API Keys as needed for selected provider
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:14b
```

### Development Commands

- `pnpm dev`: Start the development server at [http://localhost:3000](http://localhost:3000).
- `pnpm build`: Build the production application.
- `pnpm start`: Start the production server.
- `pnpm lint`: Run ESLint.
- `pnpm test`: Run Jest tests.

## Development Conventions

### General Rules

- **Package Manager:** Use **only** `pnpm`.
- **Styling:** Use **only** Tailwind CSS 4. No inline styles or custom CSS unless strictly necessary.
- **State Management:** Use Zustand for client-side global state. Keep it strictly separated from server state (handled by MongoDB).
- **API Requests:** Use Axios for HTTP and API requests (standardized in project).
- **TypeScript:** Use strict TypeScript. Avoid `any` and unsafe assertions.

### AI & Agentic Behavior

- **Model Factory:** Always use `ModelFactory.createModel()` in `src/lib/ai/model-factory.ts` to instantiate LLMs.
- **Tools:** Define agent tools in `src/lib/ai/tools.ts`.
- **Orchestration:** Use LangGraph (specifically `createReactAgent`) for agent execution in `src/lib/ai/agent.ts`.
- **Tick Loop:** The autonomous cycle is triggered via `POST /api/agent/tick`.

### 3D & World

- **Voxel World:** Managed in `src/components/world/VoxelWorld.tsx` using `InstancedMesh` for performance.
- **Pathfinding:** Use the A* implementation in `src/lib/world/pathfinding.ts`.

## Project Structure

- `src/app/`: Next.js App Router (pages and API routes).
- `src/components/`: React components (UI and 3D world).
- `src/lib/`: Core logic, utilities, AI agent, and database models.
- `src/store/`: Zustand state stores.
- `docs/`: Design specs and planning documents.

## Testing

- **Framework:** Jest.
- **Location:** Colocated with source code in `__tests__` directories (e.g., `src/lib/ai/__tests__/`).
- **Convention:** Always add a new test case or reproduction script before applying a fix or adding a feature.
