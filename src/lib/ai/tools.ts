import { DynamicTool } from "@langchain/core/tools";

export interface AgentWorldState {
  blocks?: unknown[];
  entities?: unknown[];
  inventory?: unknown[];
  position?: unknown;
}

/**
 * Creates the set of tools available to the LangChain agent.
 * These tools allow the agent to interact with the voxel world.
 */
export const createTools = (worldState?: AgentWorldState) => [
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
    name: "cut_tree",
    description: "Cuts a tree at specified coordinates. Arguments: x, y, z. Example: cut_tree(10, 0, 5)",
    func: async (input: string) => {
      console.log(`[Agent Tool] cut_tree called with: ${input}`);
      return `ACTION: cut_tree(${input})`;
    },
  }),
  new DynamicTool({
    name: "hunt",
    description: "Hunts an entity by ID. Arguments: entity_id. Example: hunt('sheep_1')",
    func: async (input: string) => {
      console.log(`[Agent Tool] hunt called with: ${input}`);
      return `ACTION: hunt(${input})`;
    },
  }),
  new DynamicTool({
    name: "build",
    description: "Builds a structure of a certain type. Arguments: structure_type. Example: build('campfire')",
    func: async (input: string) => {
      console.log(`[Agent Tool] build called with: ${input}`);
      return `ACTION: build(${input})`;
    },
  }),
  new DynamicTool({
    name: "cook",
    description: "Cooks raw food items in inventory. No arguments. Example: cook()",
    func: async () => {
      console.log(`[Agent Tool] cook called`);
      return `ACTION: cook()`;
    },
  }),
  new DynamicTool({
    name: "eat",
    description: "Consumes food to replenish hunger. No arguments needed. Example: eat()",
    func: async () => {
      console.log(`[Agent Tool] eat called`);
      return `ACTION: eat()`;
    },
  }),
  new DynamicTool({
    name: "get_world_info",
    description: "Returns information about the current state of the world.",
    func: async () => {
      if (!worldState) {
        return "The world is a 3D voxel grid. There is a grass block at 0,0,0. You are currently at 0,1,0.";
      }
      const { blocks, entities, inventory, position } = worldState;
      const blocksStr = blocks ? JSON.stringify(blocks) : "none";
      const entitiesStr = entities ? JSON.stringify(entities) : "none";
      const inventoryStr = inventory ? JSON.stringify(inventory) : "empty";
      const positionStr = position ? JSON.stringify(position) : "unknown";
      return `Blocks: ${blocksStr}. Entities: ${entitiesStr}. Inventory: ${inventoryStr}. Current Position: ${positionStr}.`;
    },
  }),
];
