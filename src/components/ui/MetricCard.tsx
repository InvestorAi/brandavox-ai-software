import React from 'react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, trend, icon, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'neumorphism-card-dark p-6 rounded-card border border-border-custom flex flex-col justify-between bg-surface',
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider font-sans">
          {title}
        </span>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-bold font-mono tracking-tight text-text-primary">
          {value}
        </span>

        {trend && (
          <span
            className={cn(
              'text-xs font-mono font-medium px-2 py-0.5 rounded-badge flex items-center gap-0.5',
              trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </span>
        )}
      </div>
    </div>
  );
}
export default MetricCard;
