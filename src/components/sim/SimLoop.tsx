'use client';
import { useEffect } from 'react';
import { useSimStore } from '@/store/useSimStore';
import { useWorldStore } from '@/store/useWorldStore';

export default function SimLoop() {
  const { updateStats, setThinking, setLastThought, setPosition } = useSimStore();
  const { addBlock } = useWorldStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      const state = useSimStore.getState();
      const { stats, isThinking } = state;

      // 1. Decay stats faster for demo
      updateStats({ hunger: Math.max(0, stats.hunger - 5) });

      // 2. If hungry and not thinking, trigger agent
      if (stats.hunger < 85 && !isThinking) {
        setThinking(true);
        try {
          console.log('[SimLoop] Triggering agent tick...');
          const res = await fetch('/api/agent/tick', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: `I am a Sim in a voxel world. My hunger is ${stats.hunger}%. I need to find food or build a shelter. I can move and place blocks. What should I do?` 
            }) 
          });
          const data = await res.json();
          if (data.success) {
            const output = data.output;
            setLastThought(output);

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
