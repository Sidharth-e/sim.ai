'use client';

import { ReactNode } from 'react';

interface StatBarProps {
  label: string;
  value: number;
  variant: 'error' | 'warning' | 'success' | 'primary' | 'secondary';
  icon: ReactNode;
}

const VARIANT_BAR_CLASSES: Record<StatBarProps['variant'], string> = {
  error: 'bg-error',
  warning: 'bg-warning',
  success: 'bg-success',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
};

export default function StatBar({ label, value, variant, icon }: StatBarProps) {
  const barClass = VARIANT_BAR_CLASSES[variant];
  const boundedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className="space-y-1"
      role="progressbar"
      aria-label={label}
      aria-valuenow={boundedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 text-hud-foreground font-medium">
          <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
            {icon}
          </span>
          <span>{label}</span>
        </div>
        <span className="font-mono text-xs font-bold text-hud-foreground">
          {boundedValue}%
        </span>
      </div>

      <div className="w-full h-2.5 bg-hud-track rounded-full overflow-hidden border border-hud-border">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${barClass}`}
          style={{ width: `${boundedValue}%` }}
        />
      </div>
    </div>
  );
}
