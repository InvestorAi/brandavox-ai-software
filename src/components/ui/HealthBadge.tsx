import React from 'react';
import { cn } from '@/lib/utils/cn';

export type HealthStatus = 'healthy' | 'at_risk' | 'critical';

interface HealthBadgeProps {
  status?: HealthStatus;
  score?: number;
  className?: string;
}

export function HealthBadge({ status, score, className }: HealthBadgeProps) {
  // Determine status from numeric score if provided
  let activeStatus: HealthStatus = 'healthy';
  if (score !== undefined) {
    if (score >= 75) activeStatus = 'healthy';
    else if (score >= 50) activeStatus = 'at_risk';
    else activeStatus = 'critical';
  } else if (status) {
    activeStatus = status;
  }

  const statusConfig = {
    healthy: {
      label: 'Healthy',
      classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      dotClasses: 'bg-emerald-400',
    },
    at_risk: {
      label: 'At Risk',
      classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      dotClasses: 'bg-amber-400 animate-pulse',
    },
    critical: {
      label: 'Critical',
      classes: 'bg-red-500/10 text-red-400 border border-red-500/20',
      dotClasses: 'bg-red-500 animate-ping',
    },
  };

  const config = statusConfig[activeStatus];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-badge text-xs font-mono font-medium',
        config.classes,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {activeStatus === 'critical' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', config.dotClasses)}></span>
      </span>
      <span>{config.label}</span>
      {score !== undefined && <span className="opacity-80">({score})</span>}
    </div>
  );
}
export default HealthBadge;
