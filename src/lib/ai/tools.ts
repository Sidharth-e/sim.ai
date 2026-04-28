import { DynamicTool } from "@langchain/core/tools";

/**
 * Creates the set of tools available to the LangChain agent.
 * These tools allow the agent to interact with the voxel world.
 */
export const createTools = () => [
  new DynamicTool({
    name: "place_block",
    description: "Places a block at specified coordinates. Usage: place_block(x, y, z, type). Example: place_block(1, 0, 1, 'wood')",
    func: async (input: string) => {
      // In a real scenario, this would persist to a DB or send a message to a websocket/SSE stream
      // For Task 5, we return a success message that will be part of the agent's response.
      console.log(`[Agent Tool] place_block called with: ${input}`);
      return `Successfully requested to place block: ${input}`;
    },
  }),
  new DynamicTool({
    name: "get_world_info",
    description: "Returns information about the current state of the world.",
    func: async () => {
      // Placeholder for getting world state
      return "The world is a 3D voxel grid. Currently, it contains a few grass blocks at the origin.";
    },
  }),
];
