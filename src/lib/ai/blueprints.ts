interface BlueprintBlock {
  offset: [number, number, number];
  type: string;
}

export interface Blueprint {
  name: string;
  cost: Record<string, number>;
  blocks: BlueprintBlock[];
}

const wall = (length: number, height: number, material: string): BlueprintBlock[] => {
  const blocks: BlueprintBlock[] = [];
  for (let x = 0; x < length; x++) {
    for (let y = 0; y < height; y++) {
      blocks.push({ offset: [x, y, 0], type: material });
    }
  }
  return blocks;
};

export const BLUEPRINTS: Record<string, Blueprint> = {
  campfire: {
    name: 'campfire',
    cost: { wood: 3 },
    blocks: [
      { offset: [0, 0, 0], type: 'campfire' },
      { offset: [-1, 0, 0], type: 'stone' },
      { offset: [1, 0, 0], type: 'stone' },
      { offset: [0, 0, -1], type: 'stone' },
      { offset: [0, 0, 1], type: 'stone' },
    ],
  },

  shelter: {
    name: 'shelter',
    cost: { wood: 6 },
    blocks: [
      ...wall(3, 2, 'wood').map(b => ({ ...b, offset: [b.offset[0], b.offset[1], 0] as [number, number, number] })),
      ...wall(3, 2, 'wood').map(b => ({ ...b, offset: [b.offset[0], b.offset[1], 3] as [number, number, number] })),
      { offset: [0, 2, 0], type: 'wood' }, { offset: [1, 2, 0], type: 'wood' }, { offset: [2, 2, 0], type: 'wood' },
      { offset: [0, 2, 1], type: 'wood' }, { offset: [1, 2, 1], type: 'wood' }, { offset: [2, 2, 1], type: 'wood' },
      { offset: [0, 2, 2], type: 'wood' }, { offset: [1, 2, 2], type: 'wood' }, { offset: [2, 2, 2], type: 'wood' },
      { offset: [0, 2, 3], type: 'wood' }, { offset: [1, 2, 3], type: 'wood' }, { offset: [2, 2, 3], type: 'wood' },
    ],
  },

  house: {
    name: 'house',
    cost: { wood: 12, stone: 4 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 5; z++) {
          b.push({ offset: [x, 0, z], type: 'stone' });
        }
      }
      for (let y = 1; y <= 3; y++) {
        for (let x = 0; x < 5; x++) {
          b.push({ offset: [x, y, 0], type: 'wood' });
          b.push({ offset: [x, y, 4], type: 'wood' });
        }
        for (let z = 1; z < 4; z++) {
          b.push({ offset: [0, y, z], type: 'wood' });
          b.push({ offset: [4, y, z], type: 'wood' });
        }
      }
      // door opening
      b.splice(b.findIndex(bl => bl.offset[0] === 2 && bl.offset[1] === 1 && bl.offset[2] === 0), 1);
      b.splice(b.findIndex(bl => bl.offset[0] === 2 && bl.offset[1] === 2 && bl.offset[2] === 0), 1);
      for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 5; z++) {
          b.push({ offset: [x, 4, z], type: 'wood' });
        }
      }
      return b;
    })(),
  },

  tower: {
    name: 'tower',
    cost: { stone: 10, wood: 4 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 3; x++) {
          b.push({ offset: [x, y, 0], type: 'stone' });
          b.push({ offset: [x, y, 2], type: 'stone' });
        }
        b.push({ offset: [0, y, 1], type: 'stone' });
        b.push({ offset: [2, y, 1], type: 'stone' });
      }
      // door opening
      b.splice(b.findIndex(bl => bl.offset[0] === 1 && bl.offset[1] === 0 && bl.offset[2] === 0), 1);
      b.splice(b.findIndex(bl => bl.offset[0] === 1 && bl.offset[1] === 1 && bl.offset[2] === 0), 1);
      for (let x = -1; x <= 3; x++) {
        for (let z = -1; z <= 3; z++) {
          b.push({ offset: [x, 8, z], type: 'wood' });
        }
      }
      return b;
    })(),
  },

  fence: {
    name: 'fence',
    cost: { wood: 8 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      for (let i = 0; i < 8; i++) {
        b.push({ offset: [i, 0, 0], type: 'wood' });
        b.push({ offset: [i, 1, 0], type: 'wood' });
      }
      return b;
    })(),
  },

  bridge: {
    name: 'bridge',
    cost: { wood: 8, stone: 2 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      b.push({ offset: [0, 0, 0], type: 'stone' });
      b.push({ offset: [0, 1, 0], type: 'stone' });
      b.push({ offset: [7, 0, 0], type: 'stone' });
      b.push({ offset: [7, 1, 0], type: 'stone' });
      for (let x = 0; x < 8; x++) {
        b.push({ offset: [x, 2, -1], type: 'wood' });
        b.push({ offset: [x, 2, 0], type: 'wood' });
        b.push({ offset: [x, 2, 1], type: 'wood' });
      }
      b.push({ offset: [0, 3, -1], type: 'wood' });
      b.push({ offset: [0, 3, 1], type: 'wood' });
      b.push({ offset: [7, 3, -1], type: 'wood' });
      b.push({ offset: [7, 3, 1], type: 'wood' });
      return b;
    })(),
  },

  farm: {
    name: 'farm',
    cost: { wood: 4 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      for (let x = 0; x < 4; x++) {
        b.push({ offset: [x, 0, -1], type: 'wood' });
        b.push({ offset: [x, 0, 4], type: 'wood' });
      }
      for (let z = -1; z <= 4; z++) {
        b.push({ offset: [-1, 0, z], type: 'wood' });
        b.push({ offset: [4, 0, z], type: 'wood' });
      }
      for (let x = 0; x < 4; x++) {
        for (let z = 0; z < 4; z++) {
          b.push({ offset: [x, 0, z], type: 'farmland' });
        }
      }
      return b;
    })(),
  },

  well: {
    name: 'well',
    cost: { stone: 6 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      for (let y = 0; y < 2; y++) {
        b.push({ offset: [0, y, 0], type: 'stone' });
        b.push({ offset: [2, y, 0], type: 'stone' });
        b.push({ offset: [0, y, 2], type: 'stone' });
        b.push({ offset: [2, y, 2], type: 'stone' });
      }
      b.push({ offset: [1, 0, 0], type: 'stone' });
      b.push({ offset: [1, 0, 2], type: 'stone' });
      b.push({ offset: [0, 0, 1], type: 'stone' });
      b.push({ offset: [2, 0, 1], type: 'stone' });
      b.push({ offset: [1, -1, 1], type: 'water' });
      b.push({ offset: [0, 2, 0], type: 'wood' });
      b.push({ offset: [2, 2, 0], type: 'wood' });
      b.push({ offset: [0, 3, 0], type: 'wood' });
      b.push({ offset: [1, 3, 0], type: 'wood' });
      b.push({ offset: [2, 3, 0], type: 'wood' });
      return b;
    })(),
  },

  stairs: {
    name: 'stairs',
    cost: { stone: 5 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      for (let i = 0; i < 5; i++) {
        for (let y = 0; y <= i; y++) {
          b.push({ offset: [i, y, 0], type: 'stone' });
          b.push({ offset: [i, y, 1], type: 'stone' });
        }
      }
      return b;
    })(),
  },

  watchtower: {
    name: 'watchtower',
    cost: { wood: 10, stone: 6 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      b.push({ offset: [0, 0, 0], type: 'stone' });
      b.push({ offset: [4, 0, 0], type: 'stone' });
      b.push({ offset: [0, 0, 4], type: 'stone' });
      b.push({ offset: [4, 0, 4], type: 'stone' });
      for (let y = 0; y < 10; y++) {
        b.push({ offset: [0, y, 0], type: 'wood' });
        b.push({ offset: [4, y, 0], type: 'wood' });
        b.push({ offset: [0, y, 4], type: 'wood' });
        b.push({ offset: [4, y, 4], type: 'wood' });
      }
      for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 5; z++) {
          b.push({ offset: [x, 10, z], type: 'wood' });
        }
      }
      for (let x = -1; x <= 5; x++) {
        b.push({ offset: [x, 11, -1], type: 'wood' });
        b.push({ offset: [x, 11, 5], type: 'wood' });
      }
      for (let z = 0; z <= 4; z++) {
        b.push({ offset: [-1, 11, z], type: 'wood' });
        b.push({ offset: [5, 11, z], type: 'wood' });
      }
      return b;
    })(),
  },

  wall_stone: {
    name: 'wall_stone',
    cost: { stone: 8 },
    blocks: wall(8, 3, 'stone'),
  },

  wall_wood: {
    name: 'wall_wood',
    cost: { wood: 6 },
    blocks: wall(6, 3, 'wood'),
  },

  torch: {
    name: 'torch',
    cost: { wood: 1 },
    blocks: [
      { offset: [0, 0, 0], type: 'torch' },
    ],
  },

  storage: {
    name: 'storage',
    cost: { wood: 6 },
    blocks: (() => {
      const b: BlueprintBlock[] = [];
      b.push({ offset: [0, 0, 0], type: 'chest' });
      b.push({ offset: [1, 0, 0], type: 'chest' });
      for (let x = -1; x <= 2; x++) {
        b.push({ offset: [x, 0, -1], type: 'wood' });
        b.push({ offset: [x, 0, 1], type: 'wood' });
      }
      b.push({ offset: [-1, 0, 0], type: 'wood' });
      b.push({ offset: [2, 0, 0], type: 'wood' });
      b.push({ offset: [-1, 1, 0], type: 'wood' });
      b.push({ offset: [2, 1, 0], type: 'wood' });
      b.push({ offset: [0, 1, 0], type: 'wood' });
      b.push({ offset: [1, 1, 0], type: 'wood' });
      return b;
    })(),
  },
};

export const CRAFTABLE_ITEMS: Record<string, { cost: Record<string, number>; yields: Record<string, number> }> = {
  plank: { cost: { wood: 1 }, yields: { plank: 4 } },
  stick: { cost: { wood: 1 }, yields: { stick: 4 } },
  stone_tool: { cost: { stone: 2, stick: 1 }, yields: { stone_tool: 1 } },
  rope: { cost: { plant_fiber: 3 }, yields: { rope: 1 } },
  torch_item: { cost: { stick: 1, coal: 1 }, yields: { torch_item: 1 } },
  bread: { cost: { wheat: 3 }, yields: { bread: 1 } },
  cooked_meat: { cost: { raw_meat: 1 }, yields: { cooked_meat: 1 } },
};

export const GATHERABLE_RESOURCES: Record<string, { blockType: string; yields: Record<string, number> }> = {
  mine_stone: { blockType: 'stone', yields: { stone: 2 } },
  dig_dirt: { blockType: 'dirt', yields: { dirt: 1 } },
  collect_sand: { blockType: 'sand', yields: { sand: 2 } },
  pick_flowers: { blockType: 'grass', yields: { plant_fiber: 1 } },
  mine_coal: { blockType: 'stone', yields: { coal: 1 } },
  harvest_wheat: { blockType: 'farmland', yields: { wheat: 2 } },
};
