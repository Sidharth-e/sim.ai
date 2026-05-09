'use client';
import { useEffect } from 'react';
import { useSimStore } from '@/store/useSimStore';
import { useWorldStore } from '@/store/useWorldStore';

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

      // 1. Decay stats slower (1% every 5s instead of 5%)
      const newHunger = Math.max(0, stats.hunger - 1);
      updateStats({ hunger: newHunger });

      // Random spawning of entities
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

      // 2. If hungry and not thinking, trigger agent
      if (newHunger < 95 && !isThinking) {
        setThinking(true);
        try {
          console.log('[SimLoop] Triggering agent tick...');
          
          const worldState = {
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
              worldState
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
                  const cur = useSimStore.getState().stats.hunger;
                  updateStats({ hunger: Math.min(100, cur + 30) });
                  break;
                }
                case 'move_to': {
                  const parts = args.replace(/[\[\]]/g, '').split(',').map(Number);
                  if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
                    setPosition([parts[0], parts[1], parts[2]]);
                  }
                  break;
                }
                case 'place_block': {
                  const parts = args.replace(/[\[\]]/g, '').split(',');
                  const x = Number(parts[0]), y = Number(parts[1]), z = Number(parts[2]);
                  const type = parts[3]?.trim().replace(/['"]/g, '') || 'wood';
                  if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                    addBlock([x, y, z], type);
                  }
                  break;
                }
                case 'cut_tree': {
                  const parts = args.replace(/[\[\]]/g, '').split(',').map(Number);
                  if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
                    removeBlock([parts[0], parts[1], parts[2]]);
                    addToInventory('wood', 1);
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
                  const inv = useSimStore.getState().inventory;
                  if ((inv.wood || 0) >= 1) {
                    removeFromInventory('wood', 1);
                    const pos = useSimStore.getState().position;
                    addBlock([Math.round(pos[0]) + 1, Math.round(pos[1]), Math.round(pos[2])], type);
                  }
                  break;
                }
                case 'cook': {
                  const inv = useSimStore.getState().inventory;
                  const hasCampfire = useWorldStore.getState().blocks.some(b => b.type === 'campfire');
                  if ((inv.raw_meat || 0) >= 1 && hasCampfire) {
                    removeFromInventory('raw_meat', 1);
                    const cur = useSimStore.getState().stats.hunger;
                    updateStats({ hunger: Math.min(100, cur + 30) });
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
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [updateStats, setThinking]);

  return null;
}
