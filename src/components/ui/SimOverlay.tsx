'use client';
import { useSimStore } from '@/store/useSimStore';

export default function SimOverlay() {
  const { stats, isThinking } = useSimStore();

  return (
    <div className="absolute top-4 right-4 bg-white/80 p-4 rounded shadow-lg w-64 text-black">
      <h2 className="font-bold border-b mb-2">Sim Status</h2>
      <div className="space-y-1">
        <div>Hunger: {stats.hunger}%</div>
        <div>Energy: {stats.energy}%</div>
        <div className="mt-2 italic text-sm">
          {isThinking ? "Thinking..." : "Idle"}
        </div>
      </div>
    </div>
  );
}
