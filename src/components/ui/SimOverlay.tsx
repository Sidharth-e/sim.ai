'use client';
import { useSimStore } from '@/store/useSimStore';
import { useTimeStore } from '@/store/useTimeStore';
import { Heart, Zap, Smile, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

const ITEM_CONFIG: Record<string, { bg: string; label: string }> = {
  wood: { bg: '#6b4226', label: 'Wood' },
  raw_meat: { bg: '#991b1b', label: 'Raw' },
  cooked_meat: { bg: '#c2410c', label: 'Cooked' },
};

function StatBar({
  value,
  color,
  icon,
}: {
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <div className="flex-1 h-2.5 bg-black/50 rounded-sm overflow-hidden border border-white/10">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] w-7 text-right font-mono text-gray-300">
        {value}
      </span>
    </div>
  );
}

function TimeIcon({ hour }: { hour: number }) {
  if (hour >= 6 && hour < 8) return <Sunrise className="w-4 h-4 text-orange-400" />;
  if (hour >= 8 && hour < 18) return <Sun className="w-4 h-4 text-yellow-400" />;
  if (hour >= 18 && hour < 20) return <Sunset className="w-4 h-4 text-orange-500" />;
  return <Moon className="w-4 h-4 text-blue-300" />;
}

function formatHour(h: number): string {
  const hh = h % 12 || 12;
  const mm = '00';
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hh}:${mm} ${ampm}`;
}

export default function SimOverlay() {
  const { stats, isThinking, lastThought, inventory } = useSimStore();
  const { hour, minute, day, year, getMonthName, getTimeString, getSunrise, getSunset, isDaytime } = useTimeStore();

  const sunriseStr = formatHour(Math.round(getSunrise()));
  const sunsetStr = formatHour(Math.round(getSunset()));

  return (
    <>
      {/* Time panel */}
      <div className="absolute top-14 left-4 bg-gray-950/80 backdrop-blur-sm p-3 rounded-lg text-white z-50 pointer-events-auto border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <TimeIcon hour={hour} />
          <span className="text-sm font-mono font-semibold">{getTimeString()}</span>
        </div>
        <div className="text-[11px] text-gray-400 font-mono">
          {getMonthName()} {day}, Year {year}
        </div>
        <div className="flex gap-3 mt-1.5 text-[10px] text-gray-500 font-mono">
          <span className="flex items-center gap-1">
            <Sunrise className="w-3 h-3 text-orange-400/60" />
            {sunriseStr}
          </span>
          <span className="flex items-center gap-1">
            <Sunset className="w-3 h-3 text-orange-500/60" />
            {sunsetStr}
          </span>
        </div>
      </div>

      {/* Status panel */}
      <div className="absolute top-4 right-4 bg-gray-950/80 backdrop-blur-sm p-3.5 rounded-lg w-64 text-white z-50 pointer-events-auto border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            Status
          </span>
          {isThinking && (
            <span className="text-[11px] animate-pulse text-cyan-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              Thinking
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <StatBar
            value={stats.hunger}
            color="#ef4444"
            icon={<Heart className="w-4 h-4 text-red-400" />}
          />
          <StatBar
            value={stats.energy}
            color="#eab308"
            icon={<Zap className="w-4 h-4 text-yellow-400" />}
          />
          <StatBar
            value={stats.happiness}
            color="#22c55e"
            icon={<Smile className="w-4 h-4 text-green-400" />}
          />
        </div>

        {lastThought && (
          <div className="mt-2.5 p-2 bg-black/40 rounded text-[11px] border border-white/5 leading-relaxed text-gray-300">
            {lastThought}
          </div>
        )}

        {!isThinking && !lastThought && (
          <div className="mt-2 text-[11px] text-gray-600 text-center italic">
            Idle
          </div>
        )}
      </div>

      {/* Inventory hotbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-50 pointer-events-auto">
        {Object.entries(inventory).map(([item, count]) => {
          const cfg = ITEM_CONFIG[item] || { bg: '#555', label: item };
          return (
            <div
              key={item}
              className="w-14 h-14 bg-gray-950/80 border border-white/10 rounded-md flex flex-col items-center justify-center gap-0.5 backdrop-blur-sm"
            >
              <div
                className="w-6 h-6 rounded-sm"
                style={{ backgroundColor: cfg.bg }}
              />
              <span className="text-[9px] text-gray-400 font-mono leading-none">
                {cfg.label} {count}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
