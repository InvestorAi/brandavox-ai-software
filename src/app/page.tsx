// Brandavox AI Swiss Modernist Landing Page
// Location: src/app/page.tsx

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Layers, 
  Activity, 
  Terminal, 
  Calendar, 
  MessageSquare, 
  ArrowRight, 
  Check, 
  Cpu, 
  Shield, 
  ExternalLink,
  Lock,
  Mic,
  Image,
  Film,
  Palette,
  Fingerprint,
  HardDrive,
  CreditCard,
  Radio,
  Bot,
  Globe,
  TrendingUp,
  Mail,
  GitBranch,
  Languages,
  Music,
  Volume2,
  Video,
  ListTodo
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Cpu className="w-5 h-5 text-accent" />,
      title: "Brand Intelligence Engine",
      description: "Map target positioning guidelines, vocabulary rules, audience personas, and voice guidelines to establish a secure multi-tenant brand brain.",
      href: "/brands"
    },
    {
      icon: <Video className="w-5 h-5 text-accent" />,
      title: "AI Viral Reels Creator",
      description: "Crop, voiceover, and color grade video reels in 4K/8K. Generate viral hashtags and dynamic caption overlays automatically.",
      href: "/viral-reels"
    },
    {
      icon: <Mic className="w-5 h-5 text-accent" />,
      title: "Voice Cloning Studio",
      description: "Clone speaker characteristics via browser mic recordings. Generate WAV/MP3 assets with advanced custom voice weights.",
      href: "/voice-cloning"
    },
    {
      icon: <Volume2 className="w-5 h-5 text-accent" />,
      title: "Emotional Voice Generator",
      description: "Synthesize script reads using global accents (including Nigerian) and customize emotion profiles for maximum engagement.",
      href: "/voice"
    },
    {
      icon: <Sparkles className="w-5 h-5 text-accent" />,
      title: "Creative Video Studio",
      description: "Auto-generate multi-scene script storyboards containing camera directions, scene durations, and Midjourney image configurations.",
      href: "/creative"
    },
    {
      icon: <Image className="w-5 h-5 text-accent" />,
      title: "4K Image Generator",
      description: "Create campaign graphics, social covers, and visual assets at up to 8K resolutions with immediate previews.",
      href: "/image"
    },
    {
      icon: <Film className="w-5 h-5 text-accent" />,
      title: "Neural Motion Ads",
      description: "Animate keyframes, preview motion timeline sequences, and compile responsive CSS ad layouts for distribution.",
      href: "/motion"
    },
    {
      icon: <Languages className="w-5 h-5 text-accent" />,
      title: "Script Translation Desk",
      description: "Translate marketing copies and scripts into global dialects or localized slang while strictly preserving the brand voice.",
      href: "/translation"
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-accent" />,
      title: "Collaboration Chat Hub",
      description: "Engage in real-time chat with inline agent mentions, AI humanoid autoresponders, and full-screen video meetings.",
      href: "/chat"
    },
    {
      icon: <HardDrive className="w-5 h-5 text-accent" />,
      title: "Secure Asset Vault",
      description: "Upload, store, and manage files, templates, and raw drafts in an isolated, multi-tenant asset vault.",
      href: "/assets"
    },
    {
      icon: <ListTodo className="w-5 h-5 text-accent" />,
      title: "Project Kanban Command",
      description: "Organize workflows, track backlogs, and manage campaign milestones on an interactive, high-contrast visual board.",
      href: "/projects"
    },
    {
      icon: <CreditCard className="w-5 h-5 text-accent" />,
      title: "Profit & Finance Hub",
      description: "Calculate expected project profits, build design proposals, track campaign budgets, and print sleek client invoices.",
      href: "/finance"
    },
    {
      icon: <Radio className="w-5 h-5 text-accent" />,
      title: "Social Listening Engine",
      description: "Track search term popularity, monitor competitor brand sentiment, and analyze changing audience trends.",
      href: "/listening"
    },
    {
      icon: <Bot className="w-5 h-5 text-accent" />,
      title: "Neural AI Assistant",
      description: "Interact with an isolated conversational chatbot that holds local memory context of your active marketing projects.",
      href: "/assistant"
    },
    {
      icon: <GitBranch className="w-5 h-5 text-accent" />,
      title: "Workflow Automations",
      description: "Build visual automation pathways with custom node triggers, database syncs, and third-party webhook receivers.",
      href: "/automations"
    },
    {
      icon: <Terminal className="w-5 h-5 text-accent" />,
      title: "Threat Sandbox Console",
      description: "Monitor rate-limit interceptions, trace security logs, and inspect burner email registration blocks.",
      href: "/developer/sandbox"
    },
    {
      icon: <Shield className="w-5 h-5 text-accent" />,
      title: "Developer API Portal",
      description: "Provision scoped access keys, configure webhook listener routes, and review audit trail logs.",
      href: "/developer"
    },
    {
      icon: <Palette className="w-5 h-5 text-accent" />,
      title: "Design Studio Canvas",
      description: "Design corporate graphics, logos, and layouts directly on a modernist canvas with high-quality SVG export.",
      href: "/design"
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Ideal for solo strategy consultants.",
      features: [
        "1 Active Brand Workspace",
        "5 CRM Clients Command",
        "500 AI Generations / mo",
        "Local MockDB Operations",
        "Core Analytics Reports"
      ],
      cta: "Launch Console",
      link: "/register?plan=starter",
      accent: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "month",
      description: "For growing boutique agencies.",
      features: [
        "10 Active Brand Workspaces",
        "50 CRM Clients Command",
        "5,000 AI Generations / mo",
        "Supabase Secure RLS",
        "CRM & Recovery Agents",
        "Team Collaboration Hub"
      ],
      cta: "Deploy Workspace",
      link: "/register?plan=professional",
      accent: true
    },
    {
      name: "Agency",
      price: "$299",
      period: "month",
      description: "Unlimited scaling and programmatic memory.",
      features: [
        "Unlimited Brand Workspaces",
        "Unlimited CRM Clients",
        "Unlimited AI Generations",
        "Developer Portal Access",
        "White-label Custom Domain",
        "Service Level Agreements"
      ],
      cta: "Scale Infrastructure",
      link: "/register?plan=agency",
      accent: false
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between font-sans selection:bg-accent selection:text-white">
      {/* 1. NAVIGATION HEADER */}
      <header className="border-b border-border-custom bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-accent" />
            <span className="font-display text-lg font-bold tracking-wider text-text-primary uppercase">BRANDAVOX AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-text-muted">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
            <a href="#infrastructure" className="hover:text-text-primary transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-xs font-mono uppercase tracking-wider text-text-primary hover:text-accent px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-accent hover:bg-accent-hover text-white text-xs font-mono uppercase tracking-wider px-4.5 py-2.5 rounded-badge transition-colors flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border-custom rounded-badge text-[10px] font-mono text-accent uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Creative Workspace</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-none tracking-tight text-text-primary">
            The All-in-One AI Studio & Marketing Hub.
          </h1>

          <p className="text-base md:text-lg text-text-muted max-w-xl leading-relaxed font-sans">
            Brandavox AI brings together voice cloning, image creation, campaign scheduling, team chats, and script writing into a single, clean workspace designed for creators and marketers.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/register" 
              className="bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider px-6 py-3.5 rounded-badge transition-colors flex items-center gap-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#features" 
              className="bg-surface hover:bg-surface/80 border border-border-custom text-text-primary font-mono text-xs uppercase tracking-wider px-6 py-3.5 rounded-badge transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Simplified Modernist Visual Preview Dashboard */}
        <div className="lg:col-span-5 bg-surface border border-border-custom rounded-card p-6 space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-border-custom pb-3 text-text-muted uppercase tracking-wider text-[10px] font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-accent" />
              Campaign Performance
            </span>
            <span className="text-accent font-bold uppercase">Live Stats</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-background border border-border-custom rounded-sm space-y-1">
                <span className="text-[9px] text-text-muted uppercase font-mono block">Active Accounts</span>
                <span className="text-lg font-bold text-text-primary">12 Brands</span>
              </div>
              <div className="p-3.5 bg-background border border-border-custom rounded-sm space-y-1">
                <span className="text-[9px] text-text-muted uppercase font-mono block">Monthly Reach</span>
                <span className="text-lg font-bold text-accent">1.2M</span>
              </div>
            </div>

            <div className="p-3.5 bg-background border border-border-custom rounded-sm space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-text-muted uppercase">
                <span>Task Completion Pacing</span>
                <span className="font-bold text-text-primary">85%</span>
              </div>
              <div className="w-full h-1.5 bg-border-custom rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-accent" />
              </div>
            </div>

            <div className="p-3.5 bg-background border border-border-custom rounded-sm space-y-2">
              <span className="text-[9px] text-text-muted uppercase font-mono block border-b border-border-custom/30 pb-1">Recent Activity</span>
              <ul className="space-y-1.5 text-[10px] text-text-muted font-mono uppercase">
                <li className="flex justify-between">
                  <span>● Voice Clone synthesized</span>
                  <span>Just now</span>
                </li>
                <li className="flex justify-between">
                  <span>● Instagram Campaign live</span>
                  <span>10m ago</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="border-t border-border-custom bg-surface/20 py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="max-w-xl space-y-3">
            <span className="font-mono text-xs text-accent uppercase tracking-widest font-semibold block">INTEGRATED MODULES</span>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Consolidated Agency Operations
            </h2>
            <p className="text-xs md:text-sm text-text-muted leading-relaxed font-sans">
              Replace fragmented tools with a unified suite tailored specifically for content strategy, customer relationships, and developer integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <Link 
                key={idx} 
                href={feat.href}
                className="group bg-surface border border-border-custom p-8 rounded-card space-y-4 hover:border-accent hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-badge bg-accent/5 border border-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                    <div className="group-hover:text-white transition-colors">
                      {feat.icon}
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed font-sans">
                    {feat.description}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-text-muted group-hover:text-accent transition-colors">
                  <span>Launch Module</span>
                  <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="border-t border-border-custom py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="max-w-xl space-y-3">
            <span className="font-mono text-xs text-accent uppercase tracking-widest font-semibold block">TRANSPARENT PRICING</span>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Operational Tiers Built for Scale
            </h2>
            <p className="text-xs md:text-sm text-text-muted leading-relaxed font-sans">
              Choose the layout that matches your agency workload. Swap tiers or pause subscriptions at any interval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx} 
                className={`bg-surface border p-8 rounded-card flex flex-col justify-between space-y-6 ${
                  tier.accent 
                    ? 'border-accent ring-1 ring-accent/30' 
                    : 'border-border-custom'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-base text-text-primary">{tier.name}</h3>
                      <p className="text-[11px] text-text-muted mt-1">{tier.description}</p>
                    </div>
                    {tier.accent && (
                      <span className="font-mono text-[9px] bg-accent/15 border border-accent/20 px-2 py-0.5 rounded text-accent uppercase font-bold shrink-0">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 py-2 border-b border-border-custom/50">
                    <span className="font-display text-4xl font-bold text-text-primary">{tier.price}</span>
                    <span className="font-mono text-xs text-text-muted">/{tier.period}</span>
                  </div>

                  <ul className="space-y-3 pt-2">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-sans text-text-primary">
                        <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href={tier.link}
                  className={`w-full font-mono text-xs uppercase tracking-wider py-3 rounded-badge font-semibold text-center transition-colors cursor-pointer ${
                    tier.accent 
                      ? 'bg-accent hover:bg-accent-hover text-white' 
                      : 'bg-background hover:bg-surface border border-border-custom text-text-primary hover:border-accent/40'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURE FOOTER SECTION */}
      <footer className="border-t border-border-custom bg-surface py-16 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-border-custom/50">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-accent" />
              <span className="font-display text-sm font-bold tracking-wider text-text-primary uppercase">BRANDAVOX AI</span>
            </div>
            <p className="leading-relaxed font-sans">
              All-in-one studio workspace designed for brands, designers, creators and marketers.
            </p>
            <div className="font-mono text-[10px] text-text-muted">
              © {new Date().getFullYear()} BRANDAVOX CORPORATIONS. ALL RIGHTS RESERVED.
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3 font-mono">
            <span className="text-[10px] text-text-primary uppercase tracking-widest font-bold block">Console</span>
            <ul className="space-y-2">
              <li><Link href="/overview" className="hover:text-text-primary transition-colors">Overview</Link></li>
              <li><Link href="/brands" className="hover:text-text-primary transition-colors">Portfolio</Link></li>
              <li><Link href="/calendar" className="hover:text-text-primary transition-colors">Scheduler</Link></li>
              <li><Link href="/creative" className="hover:text-text-primary transition-colors">AI Studio</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal Pages */}
          <div className="space-y-3 font-mono">
            <span className="text-[10px] text-text-primary uppercase tracking-widest font-bold block">Legal Registry</span>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Use</Link></li>
              <li><Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/about" className="hover:text-text-primary transition-colors">About Us</Link></li>
              <li><Link href="/return-policy" className="hover:text-text-primary transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          {/* Col 4: Corporate Coordinates */}
          <div className="space-y-3 font-mono leading-relaxed">
            <span className="text-[10px] text-text-primary uppercase tracking-widest font-bold block">Corporate HQ</span>
            <p className="font-sans">
              Brandavox Corporations Singapore<br />
              12 Marina Boulevard, Level 18<br />
              Singapore 018982<br />
              <span className="font-mono text-[10px] text-text-muted">compliance@brandavox.ai</span>
            </p>
          </div>
        </div>

        {/* Bottom Credits bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-wider">
          <div className="flex gap-4">
            <span>Tenant Directory: Isolated</span>
            <span>Security Layer: RLS Enforced</span>
            <span>Created by Brandavox Corporations</span>
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <span>Swiss Modernist design system verified</span>
            <Check className="w-3.5 h-3.5 text-accent" />
          </div>
        </div>
      </footer>
    </div>
  );
}
