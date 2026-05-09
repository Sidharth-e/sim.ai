import { DynamicTool } from "@langchain/core/tools";

/**
 * Creates the set of tools available to the LangChain agent.
 * These tools allow the agent to interact with the voxel world.
 */
export const createTools = () => [
  new DynamicTool({
    name: "place_block",
    description: "Places a block at specified coordinates. Arguments: x, y, z, type. Example: place_block(1, 0, 1, 'wood')",
    func: async (input: string) => {
      console.log(`[Agent Tool] place_block called with: ${input}`);
      return `ACTION: place_block(${input})`;
    },
  }),
  new DynamicTool({
    name: "move_to",
    description: "Moves the Sim to specified coordinates. Arguments: x, y, z. Example: move_to(2, 0, 2)",
    func: async (input: string) => {
      console.log(`[Agent Tool] move_to called with: ${input}`);
      return `ACTION: move_to(${input})`;
    },
  }),
  new DynamicTool({
    name: "get_world_info",
    description: "Returns information about the current state of the world.",
    func: async () => {
      return "The world is a 3D voxel grid. There is a grass block at 0,0,0. You are currently at 0,1,0.";
    },
  }),
];
