import React from 'react';
import { cn } from '@/lib/utils/cn';

interface PlatformBadgeProps {
  platform: string;
  className?: string;
}

export const PLATFORM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  instagram: { bg: 'bg-[#E1306C]/10 border-[#E1306C]/20', text: 'text-[#E1306C]', label: 'Instagram' },
  linkedin: { bg: 'bg-[#0A66C2]/10 border-[#0A66C2]/20', text: 'text-[#0A66C2]', label: 'LinkedIn' },
  tiktok: { bg: 'bg-zinc-800/50 border-zinc-700', text: 'text-zinc-200', label: 'TikTok' },
  facebook: { bg: 'bg-[#1877F2]/10 border-[#1877F2]/20', text: 'text-[#1877F2]', label: 'Facebook' },
  youtube: { bg: 'bg-[#FF0000]/10 border-[#FF0000]/20', text: 'text-[#FF0000]', label: 'YouTube' },
  x: { bg: 'bg-zinc-900 border-zinc-800', text: 'text-zinc-100', label: 'X / Twitter' },
  twitter: { bg: 'bg-zinc-900 border-zinc-800', text: 'text-zinc-100', label: 'X / Twitter' },
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const normKey = platform.toLowerCase().trim();
  const config = PLATFORM_COLORS[normKey] || {
    bg: 'bg-zinc-500/10 border-zinc-500/20',
    text: 'text-zinc-400',
    label: platform,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-badge text-[10px] font-mono font-medium border uppercase tracking-wider',
        config.bg,
        config.text,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{config.label}</span>
    </span>
  );
}
export default PlatformBadge;
