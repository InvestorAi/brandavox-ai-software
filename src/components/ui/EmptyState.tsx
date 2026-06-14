import React from 'react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-custom rounded-card bg-surface/30',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full border border-border-custom flex items-center justify-center bg-surface text-text-muted mb-5">
        {icon ? icon : (
          // Default minimal fallback icon
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      <h3 className="font-display text-lg font-semibold text-text-primary mb-1">
        {title}
      </h3>
      
      <p className="text-sm text-text-muted font-sans max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <div className="flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
export default EmptyState;
