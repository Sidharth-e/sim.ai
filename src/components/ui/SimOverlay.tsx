'use client';

import { useSimStore } from '@/store/useSimStore';
import { useTimeStore } from '@/store/useTimeStore';
import { Heart, Zap, Smile, Sun, Moon, Sunrise, Sunset, Package, Crosshair, Brain } from 'lucide-react';
import StatBar from './StatBar';

function TimeIcon({ hour }: { hour: number }) {
  if (hour >= 6 && hour < 8) return <Sunrise className="w-5 h-5 text-warning shrink-0" />;
  if (hour >= 8 && hour < 18) return <Sun className="w-5 h-5 text-warning shrink-0" />;
  if (hour >= 18 && hour < 20) return <Sunset className="w-5 h-5 text-warning shrink-0" />;
  return <Moon className="w-5 h-5 text-info shrink-0" />;
}

function formatHour(h: number): string {
  const hh = h % 12 || 12;
  const mm = '00';
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hh}:${mm} ${ampm}`;
}

function formatThought(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

export default function SimOverlay() {
  const { stats, isThinking, lastThought, inventory, triggerFocusCamera } = useSimStore();
  const { hour, day, year, getMonthName, getTimeString, getSunrise, getSunset } = useTimeStore();

  const sunriseStr = formatHour(Math.round(getSunrise()));
  const sunsetStr = formatHour(Math.round(getSunset()));

  return (
    <>
      <div className="absolute top-14 left-4 hud-panel p-3.5 w-60 z-50 pointer-events-auto">
        <div className="flex items-center gap-2 mb-1.5">
          <TimeIcon hour={hour} />
          <span className="text-base font-mono font-bold text-hud-foreground">
            {getTimeString()}
          </span>
        </div>

        <div className="text-xs text-hud-muted font-mono font-medium">
          {getMonthName()} {day}, Year {year}
        </div>

        <div className="flex gap-4 mt-2 pt-2 border-t border-hud-border text-xs text-hud-muted font-mono">
          <span className="flex items-center gap-1">
            <Sunrise className="w-3.5 h-3.5 text-warning" />
            <span className="text-hud-foreground">{sunriseStr}</span>
          </span>
          <span className="flex items-center gap-1">
            <Sunset className="w-3.5 h-3.5 text-warning" />
            <span className="text-hud-foreground">{sunsetStr}</span>
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 hud-panel p-4 w-80 sm:w-96 z-50 pointer-events-auto space-y-3.5 max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center pb-2 border-b border-hud-border">
          <div className="flex items-center gap-2">
            <span className="hud-title">SIM STATUS</span>
            <button
              onClick={triggerFocusCamera}
              className="px-2 py-0.5 rounded bg-hud-track hover:bg-hud-border text-[11px] font-mono text-hud-foreground flex items-center gap-1 transition-colors"
              title="Center camera on Sim"
            >
              <Crosshair className="w-3 h-3 text-primary" />
              <span>Center Sim</span>
            </button>
          </div>

          {isThinking && (
            <span className="text-xs font-mono font-semibold text-info flex items-center gap-1.5 animate-pulse bg-info/10 px-2 py-0.5 rounded-full border border-info/30">
              <span className="w-1.5 h-1.5 bg-info rounded-full" />
              Thinking
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          <StatBar
            label="Hunger"
            value={stats.hunger}
            variant="error"
            icon={<Heart className="w-4 h-4 text-error" />}
          />
          <StatBar
            label="Energy"
            value={stats.energy}
            variant="warning"
            icon={<Zap className="w-4 h-4 text-warning" />}
          />
          <StatBar
            label="Happiness"
            value={stats.happiness}
            variant="success"
            icon={<Smile className="w-4 h-4 text-success" />}
          />
        </div>

        <div className="pt-2 border-t border-hud-border flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-hud-muted font-semibold">
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span>AI Stream of Thought</span>
          </div>

          {lastThought ? (
            <div className="p-3 bg-hud-tag rounded-lg border border-hud-border overflow-y-auto max-h-48 text-xs text-hud-foreground leading-relaxed">
              {formatThought(lastThought)}
            </div>
          ) : (
            <div className="p-3 bg-hud-tag rounded-lg border border-hud-border text-xs text-hud-muted italic text-center">
              {isThinking ? 'Evaluating surroundings and planning actions...' : 'Idle, observing the world.'}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-50 pointer-events-auto max-w-[90vw] overflow-x-auto p-1.5 hud-panel">
        {Object.entries(inventory)
          .filter(([, count]) => count > 0)
          .map(([item, count]) => (
            <div
              key={item}
              className="min-w-14 h-14 px-2 bg-hud-tag border border-hud-border rounded-md flex flex-col items-center justify-center gap-0.5"
            >
              <Package className="w-4 h-4 text-primary" />
              <span className="text-[9px] text-hud-muted font-mono leading-none capitalize">
                {item.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-hud-foreground font-mono font-bold leading-none">
                {count}
              </span>
            </div>
          ))}
      </div>
    </>
  );
}
