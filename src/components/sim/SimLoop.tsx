'use client';
import { useEffect } from 'react';
import { useSimStore } from '@/store/useSimStore';
import { useWorldStore } from '@/store/useWorldStore';
import { BLUEPRINTS, CRAFTABLE_ITEMS, GATHERABLE_RESOURCES } from '@/lib/ai/blueprints';

function parseNumbers(args: string): number[] {
  return args.replace(/[\[\]'"]/g, '').split(',').map(s => Number(s.trim()));
}

function hasResources(inventory: Record<string, number>, cost: Record<string, number>): boolean {
  return Object.entries(cost).every(([item, amount]) => (inventory[item] || 0) >= amount);
}

export default function SimLoop() {
  const {
    updateStats,
    setThinking,
    setLastThought,
    setPosition,
    addToInventory,
    removeFromInventory
  } = useSimStore();
  const { addBlock, removeBlock, addEntity, removeEntity } = useWorldStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      const state = useSimStore.getState();
      const { stats, isThinking } = state;

      const newHunger = Math.max(0, stats.hunger - 1);
      updateStats({ hunger: newHunger });

      const worldState = useWorldStore.getState();
      if (worldState.entities.length < 5 && Math.random() < 0.3) {
        const simPos = state.position;
        addEntity({
          id: Math.random().toString(36).substring(2, 9),
          type: 'animal',
          pos: [
            simPos[0] + (Math.random() - 0.5) * 10,
            1,
            simPos[2] + (Math.random() - 0.5) * 10
          ],
          health: 100
        });
      }

      if (newHunger < 95 && !isThinking) {
        setThinking(true);
        try {
          console.log('[SimLoop] Triggering agent tick...');

          const tickWorldState = {
            blocks: useWorldStore.getState().blocks,
            entities: useWorldStore.getState().entities,
            inventory: state.inventory,
            position: state.position,
            stats: { ...state.stats, hunger: newHunger }
          };

          const res = await fetch('/api/agent/tick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `I am a Sim in a voxel world. My hunger is ${newHunger}%. I need to find food or build a shelter. I can move and place blocks. What should I do?`,
              worldState: tickWorldState
            })
          });
          const data = await res.json();
          if (data.success) {
            setLastThought(data.thought || '');

            const actions: { tool: string; args: string }[] = data.actions || [];
            for (const action of actions) {
              const args = action.args;
              console.log(`[SimLoop] Processing action: ${action.tool}(${args})`);

              switch (action.tool) {
                case 'eat': {
                  const inv = useSimStore.getState().inventory;
                  const cur = useSimStore.getState().stats.hunger;
                  if ((inv.cooked_meat || 0) >= 1) {
                    removeFromInventory('cooked_meat', 1);
                    updateStats({ hunger: Math.min(100, cur + 30) });
                  } else if ((inv.bread || 0) >= 1) {
                    removeFromInventory('bread', 1);
                    updateStats({ hunger: Math.min(100, cur + 20) });
                  } else if ((inv.raw_meat || 0) >= 1) {
                    removeFromInventory('raw_meat', 1);
                    updateStats({ hunger: Math.min(100, cur + 10) });
                  }
                  break;
                }

                case 'move_to': {
                  const parts = parseNumbers(args);
                  if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
                    setPosition([parts[0], parts[1], parts[2]]);
                  }
                  break;
                }

                case 'place_block': {
                  const rawParts = args.replace(/[\[\]]/g, '').split(',');
                  const x = Number(rawParts[0]), y = Number(rawParts[1]), z = Number(rawParts[2]);
                  const type = rawParts[3]?.trim().replace(/['"]/g, '') || 'wood';
                  if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                    addBlock([x, y, z], type);
                  }
                  break;
                }

                case 'remove_block': {
                  const parts = parseNumbers(args);
                  if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
                    removeBlock([parts[0], parts[1], parts[2]]);
                  }
                  break;
                }

                case 'cut_tree': {
                  const parts = parseNumbers(args);
                  if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
                    const tx = parts[0], ty = parts[1], tz = parts[2];
                    const ws = useWorldStore.getState();
                    const treeBlocks = ws.blocks.filter(b =>
                      (b.type === 'wood' || b.type === 'leaves') &&
                      Math.abs(b.pos[0] - tx) <= 1 &&
                      Math.abs(b.pos[2] - tz) <= 1 &&
                      b.pos[1] >= ty
                    );
                    let woodCount = 0;
                    for (const b of treeBlocks) {
                      removeBlock(b.pos);
                      if (b.type === 'wood') woodCount++;
                    }
                    addToInventory('wood', Math.max(woodCount, 1));
                  }
                  break;
                }

                case 'hunt': {
                  const id = args.trim().replace(/['"]/g, '');
                  removeEntity(id);
                  addToInventory('raw_meat', 1);
                  break;
                }

                case 'build': {
                  const type = args.trim().replace(/['"]/g, '');
                  const blueprint = BLUEPRINTS[type];
                  if (!blueprint) break;

                  const inv = useSimStore.getState().inventory;
                  if (!hasResources(inv, blueprint.cost)) break;

                  for (const [item, amount] of Object.entries(blueprint.cost)) {
                    removeFromInventory(item, amount);
                  }

                  const pos = useSimStore.getState().position;
                  const baseX = Math.round(pos[0]) + 2;
                  const baseY = Math.round(pos[1]);
                  const baseZ = Math.round(pos[2]);

                  for (const block of blueprint.blocks) {
                    addBlock([
                      baseX + block.offset[0],
                      baseY + block.offset[1],
                      baseZ + block.offset[2],
                    ], block.type);
                  }
                  break;
                }

                case 'craft': {
                  const rawParts = args.split(',').map(s => s.trim().replace(/['"]/g, ''));
                  const itemName = rawParts[0];
                  const qty = rawParts[1] ? parseInt(rawParts[1]) : 1;
                  const recipe = CRAFTABLE_ITEMS[itemName];
                  if (!recipe) break;

                  const inv = useSimStore.getState().inventory;
                  const scaledCost: Record<string, number> = {};
                  for (const [k, v] of Object.entries(recipe.cost)) {
                    scaledCost[k] = v * qty;
                  }
                  if (!hasResources(inv, scaledCost)) break;

                  for (const [item, amount] of Object.entries(scaledCost)) {
                    removeFromInventory(item, amount);
                  }
                  for (const [item, amount] of Object.entries(recipe.yields)) {
                    addToInventory(item, amount * qty);
                  }
                  break;
                }

                case 'gather': {
                  const rawParts = args.replace(/[\[\]'"]/g, '').split(',').map(s => s.trim());
                  const gatherType = rawParts[0];
                  const gx = Number(rawParts[1]), gy = Number(rawParts[2]), gz = Number(rawParts[3]);
                  const resource = GATHERABLE_RESOURCES[gatherType];
                  if (!resource || isNaN(gx) || isNaN(gy) || isNaN(gz)) break;

                  const ws = useWorldStore.getState();
                  const targetBlock = ws.blocks.find(b =>
                    b.pos[0] === gx && b.pos[1] === gy && b.pos[2] === gz &&
                    b.type === resource.blockType
                  );
                  if (!targetBlock) break;

                  removeBlock([gx, gy, gz]);
                  for (const [item, amount] of Object.entries(resource.yields)) {
                    addToInventory(item, amount);
                  }
                  break;
                }

                case 'demolish': {
                  const parts = parseNumbers(args);
                  if (parts.length < 6 || parts.some(n => isNaN(n))) break;
                  const [x1, y1, z1, x2, y2, z2] = parts;
                  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
                  const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
                  const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);

                  const ws = useWorldStore.getState();
                  const toRemove = ws.blocks.filter(b =>
                    b.pos[0] >= minX && b.pos[0] <= maxX &&
                    b.pos[1] >= minY && b.pos[1] <= maxY &&
                    b.pos[2] >= minZ && b.pos[2] <= maxZ
                  );
                  for (const b of toRemove) {
                    removeBlock(b.pos);
                    if (b.type === 'wood' || b.type === 'stone') {
                      addToInventory(b.type, 1);
                    }
                  }
                  break;
                }

                case 'terraform': {
                  const rawParts = args.replace(/[\[\]'"]/g, '').split(',').map(s => s.trim());
                  const op = rawParts[0];
                  const tx1 = Number(rawParts[1]), tz1 = Number(rawParts[2]);
                  const tx2 = Number(rawParts[3]), tz2 = Number(rawParts[4]);
                  const param = rawParts[5];
                  if (isNaN(tx1) || isNaN(tz1) || isNaN(tx2) || isNaN(tz2)) break;

                  const mnX = Math.min(tx1, tx2), mxX = Math.max(tx1, tx2);
                  const mnZ = Math.min(tz1, tz2), mxZ = Math.max(tz1, tz2);

                  switch (op) {
                    case 'flatten': {
                      const targetY = Number(param);
                      if (isNaN(targetY)) break;
                      const ws = useWorldStore.getState();
                      const inRange = ws.blocks.filter(b =>
                        b.pos[0] >= mnX && b.pos[0] <= mxX &&
                        b.pos[2] >= mnZ && b.pos[2] <= mxZ
                      );
                      for (const b of inRange) {
                        if (b.pos[1] > targetY) removeBlock(b.pos);
                      }
                      for (let x = mnX; x <= mxX; x++) {
                        for (let z = mnZ; z <= mxZ; z++) {
                          const hasBlock = ws.blocks.some(b =>
                            b.pos[0] === x && b.pos[1] === targetY && b.pos[2] === z
                          );
                          if (!hasBlock) addBlock([x, targetY, z], 'dirt');
                        }
                      }
                      break;
                    }
                    case 'raise': {
                      const ws = useWorldStore.getState();
                      for (let x = mnX; x <= mxX; x++) {
                        for (let z = mnZ; z <= mxZ; z++) {
                          const col = ws.blocks
                            .filter(b => b.pos[0] === x && b.pos[2] === z)
                            .sort((a, b) => b.pos[1] - a.pos[1]);
                          const topY = col.length > 0 ? col[0].pos[1] + 1 : 0;
                          addBlock([x, topY, z], 'dirt');
                        }
                      }
                      break;
                    }
                    case 'dig': {
                      const ws = useWorldStore.getState();
                      for (let x = mnX; x <= mxX; x++) {
                        for (let z = mnZ; z <= mxZ; z++) {
                          const col = ws.blocks
                            .filter(b => b.pos[0] === x && b.pos[2] === z)
                            .sort((a, b) => b.pos[1] - a.pos[1]);
                          if (col.length > 0) {
                            removeBlock(col[0].pos);
                            addToInventory('dirt', 1);
                          }
                        }
                      }
                      break;
                    }
                    case 'fill': {
                      const fillType = param || 'dirt';
                      for (let x = mnX; x <= mxX; x++) {
                        for (let z = mnZ; z <= mxZ; z++) {
                          addBlock([x, 0, z], fillType);
                        }
                      }
                      break;
                    }
                  }
                  break;
                }

                case 'cook': {
                  const inv = useSimStore.getState().inventory;
                  const hasCampfire = useWorldStore.getState().blocks.some(b => b.type === 'campfire');
                  if ((inv.raw_meat || 0) >= 1 && hasCampfire) {
                    removeFromInventory('raw_meat', 1);
                    addToInventory('cooked_meat', 1);
                  }
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to trigger agent tick:', error);
        } finally {
          setThinking(false);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [updateStats, setThinking]);

  return null;
}
