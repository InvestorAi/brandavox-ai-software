'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LayoutDashboard, Target, Users, Megaphone, Calendar, Sparkles, MessageSquare, Code2, Key } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  name: string;
  category: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const commands: CommandItem[] = [
  { name: 'Dashboard Overview', category: 'Navigation', href: '/overview', icon: LayoutDashboard },
  { name: 'Brands Hub', category: 'Navigation', href: '/brands', icon: Target },
  { name: 'Add New Brand', category: 'Intelligence', href: '/brands/new', icon: Target },
  { name: 'Client CRM Directory', category: 'Navigation', href: '/clients', icon: Users },
  { name: 'Campaigns Dashboard', category: 'Navigation', href: '/campaigns', icon: Megaphone },
  { name: 'Content Calendar Planner', category: 'Navigation', href: '/calendar', icon: Calendar },
  { name: 'Creative Studio AI Generators', category: 'Navigation', href: '/creative', icon: Sparkles },
  { name: 'Collaboration Hub (Chat)', category: 'Navigation', href: '/chat', icon: MessageSquare },
  { name: 'Developer Portal API Keys', category: 'Navigation', href: '/developer', icon: Code2 },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter commands by query
  const filtered = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle arrow key and Enter navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          router.push(filtered[selectedIndex].href);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, router, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 md:px-0 select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full max-w-lg bg-surface border border-border-custom rounded-modal shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-10"
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 border-b border-border-custom h-14 bg-background/30">
              <Search className="w-5 h-5 text-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full h-full bg-transparent border-0 text-text-primary text-sm font-sans placeholder:text-text-muted/50 focus:outline-none focus:ring-0"
                placeholder="Search routing commands..."
              />
              <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 border border-border-custom rounded bg-background">
                ESC
              </span>
            </div>

            {/* Results list */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-text-muted font-sans">
                  No commands found matching "{query}"
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {filtered.map((cmd, index) => {
                    const Icon = cmd.icon;
                    const isSelected = index === selectedIndex;

                    return (
                      <li key={cmd.name}>
                        <button
                          onClick={() => {
                            router.push(cmd.href);
                            onClose();
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2.5 rounded-badge text-left text-sm font-sans transition-all duration-75 cursor-pointer',
                            isSelected
                              ? 'bg-accent/10 border border-accent/20 text-text-primary'
                              : 'bg-transparent border border-transparent text-text-muted hover:text-text-primary hover:bg-background/20'
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className={cn('w-4 h-4 shrink-0', isSelected ? 'text-accent' : 'text-text-muted')} />
                            <span className="font-medium">{cmd.name}</span>
                          </span>
                          <span className="text-[10px] font-mono font-medium text-text-muted bg-background/50 border border-border-custom px-1.5 py-0.5 rounded uppercase">
                            {cmd.category}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            {/* Help tip bar */}
            <div className="bg-background/40 px-4 py-2.5 border-t border-border-custom flex items-center justify-between text-[10px] font-mono text-text-muted">
              <span>Use ↑↓ keys to navigate, ENTER to select</span>
              <span>BRANDAVOX CLI v2.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default CommandPalette;
