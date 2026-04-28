'use client';
import { useEffect } from 'react';
import { useSimStore } from '@/store/useSimStore';

export default function SimLoop() {
  const { stats, updateStats, setThinking, isThinking } = useSimStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      // 1. Decay stats
      updateStats({ hunger: Math.max(0, stats.hunger - 1) });

      // 2. If hungry and not thinking, trigger agent
      if (stats.hunger < 80 && !isThinking) {
        setThinking(true);
        try {
          await fetch('/api/agent/tick', { 
            method: 'POST', 
            body: JSON.stringify({ stats }) 
          });
        } catch (error) {
          console.error('Failed to trigger agent tick:', error);
        } finally {
          setThinking(false);
        }
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [stats, isThinking, updateStats, setThinking]);

  return null;
}
