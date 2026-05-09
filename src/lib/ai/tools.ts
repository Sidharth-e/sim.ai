import { DynamicTool } from "@langchain/core/tools";
import { BLUEPRINTS, CRAFTABLE_ITEMS, GATHERABLE_RESOURCES } from "./blueprints";

export interface AgentWorldState {
  blocks?: { pos: number[]; type: string }[];
  entities?: { id: string; type: string; pos: number[]; health: number }[];
  inventory?: Record<string, number>;
  position?: number[];
  stats?: { hunger: number; energy: number; happiness: number };
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
    name: "check_self",
    description: "Check your current status: hunger, energy, happiness, position, and inventory. Always do this first to understand your needs.",
    func: async () => {
      if (!worldState) return "Hunger: 100% | Energy: 100% | Happiness: 100%\nPosition: [0, 0, 0]\nInventory: empty";
      const s = worldState.stats || { hunger: 100, energy: 100, happiness: 100 };
      const pos = worldState.position || [0, 0, 0];
      const inv = worldState.inventory || {};
      const invStr = Object.entries(inv).filter(([, v]) => v > 0).map(([k, v]) => `${k}: ${v}`).join(', ') || 'empty';
      return `Hunger: ${s.hunger}% | Energy: ${s.energy}% | Happiness: ${s.happiness}%\nPosition: [${pos.join(', ')}]\nInventory: ${invStr}`;
    },
  }),
  new DynamicTool({
    name: "look_around",
    description: "Survey your surroundings. Returns summary of nearby block types and any visible creatures. Use to get a general sense of the area.",
    func: async () => {
      if (!worldState) return "You see a flat grass world stretching in all directions. Nothing notable nearby.";
      const blocks = worldState.blocks || [];
      const entities = worldState.entities || [];

      const blockCounts: Record<string, number> = {};
      for (const b of blocks) blockCounts[b.type] = (blockCounts[b.type] || 0) + 1;
      const terrain = Object.entries(blockCounts).map(([t, c]) => `${t}: ${c}`).join(', ') || 'barren';

      const creatures = entities.length > 0
        ? entities.slice(0, 8).map(e => `${e.type}(${e.id}) at [${e.pos.map(n => Math.round(n)).join(', ')}]`).join('\n  ')
        : 'none visible';

      const hasCampfire = blocks.some(b => b.type === 'campfire');
      const hasWater = blocks.some(b => b.type === 'water');
      const landmarks = [hasCampfire && 'campfire', hasWater && 'water source'].filter(Boolean).join(', ');

      return `Terrain: ${terrain}\nCreatures:\n  ${creatures}\nLandmarks: ${landmarks || 'none'}`;
    },
  }),
  new DynamicTool({
    name: "search",
    description: "Search for something specific nearby. Arguments: target — e.g. 'tree', 'animal', 'stone', 'water', 'food', 'campfire', 'wood', 'grass'. Returns locations if found. Example: search('tree')",
    func: async (input: string) => {
      const target = input.trim().replace(/['"]/g, '').toLowerCase();
      if (!worldState) return `No ${target} found nearby.`;
      const blocks = worldState.blocks || [];
      const entities = worldState.entities || [];

      if (target === 'animal' || target === 'animals' || target === 'creature') {
        if (entities.length === 0) return 'No animals found nearby. Try moving to a new area.';
        return 'Animals found:\n' + entities.slice(0, 10).map(e =>
          `- ${e.type}(${e.id}) at [${e.pos.map(n => Math.round(n)).join(', ')}]`
        ).join('\n');
      }

      if (target === 'tree' || target === 'trees') {
        const woodBlocks = blocks.filter(b => b.type === 'wood');
        if (woodBlocks.length === 0) return 'No trees found nearby. Try exploring further.';
        const treeRoots: number[][] = [];
        for (const b of woodBlocks) {
          if (!treeRoots.find(p => Math.abs(p[0] - b.pos[0]) <= 1 && Math.abs(p[2] - b.pos[2]) <= 1)) {
            treeRoots.push(b.pos);
          }
        }
        return `Found ${treeRoots.length} tree(s):\n` + treeRoots.slice(0, 10).map(p =>
          `- Tree at [${p.join(', ')}]`
        ).join('\n');
      }

      if (target === 'food') {
        const inv = worldState.inventory || {};
        const foods = ['cooked_meat', 'bread', 'raw_meat', 'wheat'].filter(f => (inv[f] || 0) > 0);
        if (foods.length === 0) return 'No food in inventory. Hunt animals or harvest crops to get food.';
        return 'Food in inventory: ' + foods.map(f => `${f}: ${inv[f]}`).join(', ');
      }

      const matching = blocks.filter(b => b.type === target);
      if (matching.length === 0) return `No ${target} found nearby.`;
      return `Found ${matching.length} ${target} block(s):\n` + matching.slice(0, 8).map(b =>
        `- [${b.pos.join(', ')}]`
      ).join('\n');
    },
  }),
  new DynamicTool({
    name: "save_learning",
    description: "Save an important learning or insight to your permanent knowledge base. Use when you discover something useful: effective strategies, resource locations, failed approaches to avoid, patterns about the world. Arguments: a short learning statement. Example: save_learning('cooking meat requires a campfire nearby')",
    func: async (input: string) => {
      console.log(`[Agent Tool] save_learning called with: ${input}`);
      return `LEARNING SAVED: ${input}`;
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
