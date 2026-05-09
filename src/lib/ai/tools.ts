import { DynamicTool } from "@langchain/core/tools";
import { BLUEPRINTS, CRAFTABLE_ITEMS, GATHERABLE_RESOURCES } from "./blueprints";

export interface AgentWorldState {
  blocks?: unknown[];
  entities?: unknown[];
  inventory?: unknown[];
  position?: unknown;
}

const structureList = Object.keys(BLUEPRINTS).join(', ');
const craftableList = Object.entries(CRAFTABLE_ITEMS)
  .map(([name, r]) => `${name} (needs: ${Object.entries(r.cost).map(([k, v]) => `${v} ${k}`).join(', ')})`)
  .join('; ');
const gatherList = Object.entries(GATHERABLE_RESOURCES)
  .map(([name, r]) => `${name} → ${Object.entries(r.yields).map(([k, v]) => `${v} ${k}`).join(', ')} (from ${r.blockType})`)
  .join('; ');

export const createTools = (worldState?: AgentWorldState) => [
  new DynamicTool({
    name: "place_block",
    description: "Places a single block at specified coordinates. Arguments: x, y, z, type. Available types: wood, stone, dirt, sand, grass, snow, leaves, campfire, torch, chest, farmland, water, brick, cobblestone, glass, iron, gold. Example: place_block(1, 0, 1, 'stone')",
    func: async (input: string) => {
      const cleanInput = input.replace(/[\[\]]/g, '');
      console.log(`[Agent Tool] place_block called with: ${cleanInput}`);
      return `ACTION: place_block(${cleanInput})`;
    },
  }),
  new DynamicTool({
    name: "remove_block",
    description: "Removes a block at specified coordinates. Arguments: x, y, z. Example: remove_block(5, 1, 3)",
    func: async (input: string) => {
      const cleanInput = input.replace(/[\[\]]/g, '');
      console.log(`[Agent Tool] remove_block called with: ${cleanInput}`);
      return `ACTION: remove_block(${cleanInput})`;
    },
  }),
  new DynamicTool({
    name: "move_to",
    description: "Moves the Sim to specified coordinates. Arguments: x, y, z. Example: move_to(2, 0, 2)",
    func: async (input: string) => {
      const cleanInput = input.replace(/[\[\]]/g, '');
      console.log(`[Agent Tool] move_to called with: ${cleanInput}`);
      return `ACTION: move_to(${cleanInput})`;
    },
  }),
  new DynamicTool({
    name: "cut_tree",
    description: "Cuts a tree at specified coordinates, yields wood. Arguments: x, y, z. Example: cut_tree(10, 0, 5)",
    func: async (input: string) => {
      const cleanInput = input.replace(/[\[\]]/g, '');
      console.log(`[Agent Tool] cut_tree called with: ${cleanInput}`);
      return `ACTION: cut_tree(${cleanInput})`;
    },
  }),
  new DynamicTool({
    name: "hunt",
    description: "Hunts an entity by ID, yields raw_meat. Arguments: entity_id. Example: hunt('sheep_1')",
    func: async (input: string) => {
      console.log(`[Agent Tool] hunt called with: ${input}`);
      return `ACTION: hunt(${input})`;
    },
  }),
  new DynamicTool({
    name: "build",
    description: `Builds a multi-block structure near current position. Requires materials in inventory. Available structures: ${structureList}. Arguments: structure_type. Example: build('house')`,
    func: async (input: string) => {
      const type = input.trim().replace(/['"]/g, '');
      if (!BLUEPRINTS[type]) {
        return `ERROR: Unknown structure '${type}'. Available: ${structureList}`;
      }
      const bp = BLUEPRINTS[type];
      const costStr = Object.entries(bp.cost).map(([k, v]) => `${v} ${k}`).join(', ');
      console.log(`[Agent Tool] build called with: ${type} (costs: ${costStr})`);
      return `ACTION: build(${type})`;
    },
  }),
  new DynamicTool({
    name: "craft",
    description: `Crafts items from materials in inventory. Available recipes: ${craftableList}. Arguments: item_name, quantity (default 1). Example: craft('plank', 2)`,
    func: async (input: string) => {
      const parts = input.split(',').map(s => s.trim().replace(/['"]/g, ''));
      const item = parts[0];
      const qty = parts[1] ? parseInt(parts[1]) : 1;
      if (!CRAFTABLE_ITEMS[item]) {
        return `ERROR: Unknown recipe '${item}'. Available: ${Object.keys(CRAFTABLE_ITEMS).join(', ')}`;
      }
      console.log(`[Agent Tool] craft called with: ${item} x${qty}`);
      return `ACTION: craft(${item}, ${qty})`;
    },
  }),
  new DynamicTool({
    name: "gather",
    description: `Gathers resources from nearby blocks. Available: ${gatherList}. Arguments: gather_type, x, y, z. Example: gather('mine_stone', 5, 0, 3)`,
    func: async (input: string) => {
      const cleanInput = input.replace(/[\[\]]/g, '');
      const parts = cleanInput.split(',').map(s => s.trim().replace(/['"]/g, ''));
      const gatherType = parts[0];
      if (!GATHERABLE_RESOURCES[gatherType]) {
        return `ERROR: Unknown gather type '${gatherType}'. Available: ${Object.keys(GATHERABLE_RESOURCES).join(', ')}`;
      }
      console.log(`[Agent Tool] gather called with: ${cleanInput}`);
      return `ACTION: gather(${cleanInput})`;
    },
  }),
  new DynamicTool({
    name: "demolish",
    description: "Demolishes all blocks in a rectangular area. Arguments: x1, y1, z1, x2, y2, z2 (two corners). Some materials recovered to inventory. Example: demolish(0, 0, 0, 4, 3, 4)",
    func: async (input: string) => {
      const cleanInput = input.replace(/[\[\]]/g, '');
      console.log(`[Agent Tool] demolish called with: ${cleanInput}`);
      return `ACTION: demolish(${cleanInput})`;
    },
  }),
  new DynamicTool({
    name: "terraform",
    description: "Reshapes terrain in an area. Operations: 'flatten' (level to y), 'raise' (add layer), 'dig' (remove layer), 'fill' (fill with block type). Arguments: operation, x1, z1, x2, z2, [param]. Examples: terraform('flatten', -5, -5, 5, 5, 2), terraform('fill', 0, 0, 3, 3, 'stone')",
    func: async (input: string) => {
      const cleanInput = input.replace(/[\[\]]/g, '');
      console.log(`[Agent Tool] terraform called with: ${cleanInput}`);
      return `ACTION: terraform(${cleanInput})`;
    },
  }),
  new DynamicTool({
    name: "cook",
    description: "Cooks raw food items in inventory. Requires campfire nearby. No arguments. Example: cook()",
    func: async () => {
      console.log(`[Agent Tool] cook called`);
      return `ACTION: cook()`;
    },
  }),
  new DynamicTool({
    name: "eat",
    description: "Consumes food to replenish hunger (+30). Prefers cooked_meat, then bread, then raw food. No arguments. Example: eat()",
    func: async () => {
      console.log(`[Agent Tool] eat called`);
      return `ACTION: eat()`;
    },
  }),
  new DynamicTool({
    name: "get_world_info",
    description: "Returns information about the current state of the world including nearby blocks, entities, inventory, and position.",
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
  new DynamicTool({
    name: "list_blueprints",
    description: "Lists all available building blueprints with their material costs. No arguments.",
    func: async () => {
      const lines = Object.entries(BLUEPRINTS).map(([key, bp]) => {
        const cost = Object.entries(bp.cost).map(([k, v]) => `${v} ${k}`).join(', ');
        return `${key}: costs ${cost} (${bp.blocks.length} blocks)`;
      });
      return `Available blueprints:\n${lines.join('\n')}`;
    },
  }),
];
