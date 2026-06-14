'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  onMenuToggle: () => void;
  onSearchClick: () => void;
  className?: string;
}

export function Header({ onMenuToggle, onSearchClick, className }: HeaderProps) {
  const [isLightMode, setIsLightMode] = useState(false);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [isLightMode]);

  return (
    <header
      className={cn(
        'h-16 border-b border-border-custom bg-surface px-6 flex items-center justify-between shrink-0 select-none',
        className
      )}
    >
      {/* Mobile Menu Trigger & Breadcrumb spacer */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-text-muted hover:text-text-primary hover:bg-background/50 rounded-badge transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Action utilities: Search, Notifications, Theme toggle */}
      <div className="flex items-center gap-4">
        {/* Cmd+K Search trigger button */}
        <button
          onClick={onSearchClick}
          className="hidden md:flex items-center gap-3 bg-background border border-border-custom px-4 py-1.5 rounded-badge text-xs font-sans text-text-muted hover:text-text-primary hover:border-border-custom/80 transition-all cursor-pointer w-64 justify-between"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search Command...</span>
          </span>
          <kbd className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border-custom">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={onSearchClick}
          className="md:hidden p-2 text-text-muted hover:text-text-primary hover:bg-background/50 rounded-badge transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsLightMode(!isLightMode)}
          className="p-2 text-text-muted hover:text-text-primary hover:bg-background/50 rounded-badge transition-colors cursor-pointer"
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 text-text-muted hover:text-text-primary hover:bg-background/50 rounded-badge transition-colors relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
        </button>
      </div>
    </header>
  );
}
export default Header;
