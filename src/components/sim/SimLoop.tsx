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
      if (worldState.entities.length < 3 && Math.random() < 0.1) {
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
      if (newHunger < 85 && !isThinking) {
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
            const output = data.output;
            setLastThought(output);

            // Matches ACTION: eat()
            if (output.includes('ACTION: eat()')) {
              const currentHunger = useSimStore.getState().stats.hunger;
              updateStats({ hunger: Math.min(100, currentHunger + 30) });
            }

            // Simple Action Parser
            // Matches ACTION: move_to(x, y, z)
            const moveMatch = output.match(/ACTION: move_to\(([^)]+)\)/);
            if (moveMatch) {
              const [x, y, z] = moveMatch[1].split(',').map(Number);
              if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                setPosition([x, y, z]);
              }
            }

            // Matches ACTION: place_block(x, y, z, type)
            const blockMatch = output.match(/ACTION: place_block\(([^)]+)\)/);
            if (blockMatch) {
              const parts = blockMatch[1].split(',');
              const x = Number(parts[0]);
              const y = Number(parts[1]);
              const z = Number(parts[2]);
              const type = parts[3]?.trim().replace(/['"]/g, '') || 'wood';
              if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                addBlock([x, y, z], type);
              }
            }

            // Matches ACTION: cut_tree(x, y, z)
            const cutTreeMatch = output.match(/ACTION: cut_tree\(([^)]+)\)/);
            if (cutTreeMatch) {
              const [x, y, z] = cutTreeMatch[1].split(',').map(Number);
              if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                removeBlock([x, y, z]);
                addToInventory('wood', 1);
              }
            }

            // Matches ACTION: hunt(id)
            const huntMatch = output.match(/ACTION: hunt\(([^)]+)\)/);
            if (huntMatch) {
              const id = huntMatch[1].trim().replace(/['"]/g, '');
              removeEntity(id);
              addToInventory('raw_meat', 1);
            }

            // Matches ACTION: build(type)
            const buildMatch = output.match(/ACTION: build\(([^)]+)\)/);
            if (buildMatch) {
              const type = buildMatch[1].trim().replace(/['"]/g, '');
              const inv = useSimStore.getState().inventory;
              if ((inv.wood || 0) >= 1) {
                removeFromInventory('wood', 1);
                const pos = useSimStore.getState().position;
                addBlock([Math.round(pos[0]) + 1, Math.round(pos[1]), Math.round(pos[2])], type);
              }
            }

            // Matches ACTION: cook()
            if (output.includes('ACTION: cook()')) {
              const inv = useSimStore.getState().inventory;
              const hasCampfire = useWorldStore.getState().blocks.some(b => b.type === 'campfire');
              if ((inv.raw_meat || 0) >= 1 && hasCampfire) {
                removeFromInventory('raw_meat', 1);
                const currentHunger = useSimStore.getState().stats.hunger;
                updateStats({ hunger: Math.min(100, currentHunger + 30) });
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
