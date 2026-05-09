'use client';
import { useSimStore } from '@/store/useSimStore';

export default function SimOverlay() {
  const { stats, isThinking, lastThought } = useSimStore();

  return (
    <div className="absolute top-4 right-4 bg-white/90 p-4 rounded shadow-xl w-80 text-black z-50 pointer-events-auto border border-gray-200">
      <h2 className="font-bold border-b mb-2 flex justify-between items-center">
        <span>Sim Status</span>
        {isThinking && <span className="text-xs animate-pulse text-blue-600">Thinking...</span>}
      </h2>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Hunger:</span>
          <span className={stats.hunger < 30 ? 'text-red-600 font-bold' : ''}>{stats.hunger}%</span>
        </div>
        <div className="flex justify-between">
          <span>Energy:</span>
          <span>{stats.energy}%</span>
        </div>
        
        {lastThought && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <div className="font-semibold mb-1 text-gray-500 uppercase tracking-wider text-[10px]">Current Thought:</div>
            <div className="whitespace-pre-wrap leading-relaxed">{lastThought}</div>
          </div>
        )}

        {!isThinking && !lastThought && (
          <div className="mt-2 italic text-sm text-gray-400 text-center py-2">
            Idle
          </div>
        )}
      </div>
    </div>
  );
}
