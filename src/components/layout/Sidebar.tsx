'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Users,
  Megaphone,
  Calendar,
  Sparkles,
  MessageSquare,
  Code2,
  LogOut,
  ChevronUp,
  Mic,
  Image,
  Cpu,
  Film,
  Palette,
  Fingerprint,
  Terminal,
  ListTodo,
  HardDrive,
  CreditCard,
  Radio,
  Bot,
  Globe,
  TrendingUp,
  Mail,
  GitBranch,
  Plug,
  Languages,
  Music,
  Volume2,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const sections: NavSection[] = [
    {
      title: 'COMMAND',
      items: [
        { name: 'Overview', href: '/overview', icon: LayoutDashboard },
        { name: 'Project Studios', href: '/projects', icon: ListTodo },
        { name: 'File Vault', href: '/assets', icon: HardDrive },
        { name: 'Finance Hub', href: '/finance', icon: CreditCard },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'Brands', href: '/brands', icon: Target },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Voice Cloning', href: '/voice-cloning', icon: Mic },
        { name: 'Voice Generation', href: '/voice', icon: Volume2 },
        { name: 'Image Generator', href: '/image', icon: Image },
        { name: 'Brand Identity', href: '/identity', icon: Fingerprint },
        { name: 'Script Translation', href: '/translation', icon: Languages },
        { name: 'Stock Assets', href: '/stock-assets', icon: Music },
        { name: 'Social Listening', href: '/listening', icon: Radio },
        { name: 'Neural Assistant', href: '/assistant', icon: Bot },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Creative Studio', href: '/creative', icon: Sparkles },
        { name: 'Motion Ads', href: '/motion', icon: Film },
        { name: 'Viral Reels AI', href: '/viral-reels', icon: Video },
        { name: 'Design Studio', href: '/design', icon: Palette },
        { name: 'Landing Builder', href: '/landing-builder', icon: Globe },
        { name: 'Paid Ads Center', href: '/ads', icon: TrendingUp },
        { name: 'Email Marketing', href: '/email', icon: Mail },
        { name: 'Workflow Automation', href: '/automations', icon: GitBranch },
        { name: 'Neural Utils', href: '/utils', icon: Cpu },
      ],
    },
    {
      title: 'TEAM',
      items: [
        { name: 'Collaboration', href: '/chat', icon: MessageSquare },
      ],
    },
    {
      title: 'DEVELOPER',
      items: [
        { name: 'API Settings', href: '/developer', icon: Code2 },
        { name: 'Threat Sandbox', href: '/developer/sandbox', icon: Terminal },
        { name: 'Integrations', href: '/integrations', icon: Plug },
      ],
    },
  ];

  const handleLogout = async () => {
    // For now, simple client side redirect to login. We will fully clear the Supabase cookies.
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <aside
      className={cn(
        'w-70 h-screen bg-surface border-r border-border-custom flex flex-col justify-between select-none shrink-0 overflow-y-auto',
        className
      )}
    >
      {/* Top Brand Logo */}
      <div className="p-6 border-b border-border-custom flex items-center gap-3">
        <div className="w-3.5 h-3.5 bg-accent shrink-0" />
        <span className="font-display text-lg font-bold tracking-wider text-text-primary">
          BRANDAVOX AI
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <span className="text-[10px] font-semibold text-text-muted font-mono tracking-widest px-3">
              {section.title}
            </span>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-badge text-sm font-sans font-medium transition-all duration-150',
                        isActive
                          ? 'text-text-primary bg-background border-l-2 border-accent pl-2.5'
                          : 'text-text-muted hover:text-text-primary hover:bg-background/40'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-accent' : '')} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Area - AI usage progress & Profile */}
      <div className="p-4 border-t border-border-custom space-y-4 bg-background/20">
        {/* AI Progress Tracker */}
        <div className="p-3 bg-background border border-border-custom rounded-card space-y-2">
          <div className="flex justify-between text-[10px] font-mono font-medium text-text-muted uppercase">
            <span>AI Credits Used</span>
            <span>1,240 / 5,000</span>
          </div>
          <div className="w-full h-1 bg-border-custom rounded-full overflow-hidden">
            <div className="w-[24.8%] h-full bg-accent" />
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-card hover:bg-background/40 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mock User Initial Avatar */}
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center font-mono text-sm font-bold shrink-0">
              GJ
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-semibold text-text-primary truncate leading-tight font-sans">
                Godswill Johnson
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono font-medium">
                Workspace Owner
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-badge transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
export default Sidebar;
