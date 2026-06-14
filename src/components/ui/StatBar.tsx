import React from 'react';
import { cn } from '@/lib/utils/cn';

interface StatItem {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatBarProps {
  items: StatItem[];
  className?: string;
}

export function StatBar({ items, className }: StatBarProps) {
  return (
    <div
      className={cn(
        'w-full grid grid-cols-2 md:flex md:items-center border border-border-custom bg-surface rounded-card p-4 md:p-6 gap-6 md:gap-0 md:divide-x md:divide-border-custom',
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col justify-center flex-1 px-2 md:first:pl-0 md:last:pr-0"
        >
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest font-sans mb-1 block">
            {item.label}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-bold font-mono text-text-primary tracking-tight">
              {item.value}
            </span>
            {item.trend && (
              <span
                className={cn(
                  'text-[10px] font-mono font-medium',
                  item.trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {item.trend.isPositive ? '↑' : '↓'} {item.trend.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
export default StatBar;
