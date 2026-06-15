// Location: src/app/about/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Eye, Shield, Users, Award, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between font-sans selection:bg-accent selection:text-white">
      {/* HEADER */}
      <header className="border-b border-border-custom bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono text-xs text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-accent" />
            <span className="font-display text-sm font-bold tracking-wider text-text-primary uppercase">BRANDAVOX</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 space-y-16">
        {/* Title Block */}
        <div className="space-y-4 border-b border-border-custom pb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-surface border border-border-custom rounded-badge text-[10px] font-mono text-accent uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" />
            <span>Organization File: CORP-01</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary uppercase tracking-tight">
            About Brandavox
          </h1>
          <p className="text-xs text-text-muted font-mono uppercase">
            ESTABLISHED 2026 | BRANDAVOX CORPORATIONS DIRECTORY
          </p>
        </div>

        {/* Brand Narrative Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 space-y-2">
            <span className="font-mono text-[10px] text-text-primary uppercase tracking-widest font-bold block">OUR ORIGIN</span>
            <h3 className="font-display text-xl font-bold uppercase text-text-primary">
              Swiss Precision. AI Execution.
            </h3>
          </div>
          <div className="md:col-span-8 space-y-4 text-sm leading-relaxed text-text-muted">
            <p>
              Brandavox Corporations was established in 2026 to bridge the gap between complex generative AI research and everyday brand operations. Our mission is to build software that operates with absolute security, exceptional user experience, and structural engineering precision.
            </p>
            <p>
              From our global headquarters in Aba, Abia State, Nigeria, we deliver multi-tenant agency solutions enabling high-fidelity speech synthesis, neural image generators, and autonomous client responders that fit seamlessly into corporate marketing workflows.
            </p>
          </div>
        </div>

        {/* Corporate Objectives */}
        <div className="space-y-6">
          <span className="font-mono text-[10px] text-text-primary uppercase tracking-widest font-bold block border-b border-border-custom/50 pb-2">
            CORE INFRASTRUCTURE PILLARS
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border-custom p-6 rounded-card space-y-3">
              <div className="w-8 h-8 rounded-badge bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-display font-semibold text-xs text-text-primary uppercase tracking-wider">
                Logical Isolation
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                All strategy databases are isolated at the schema level using PostgreSQL Row Level Security (RLS) policies, guaranteeing tenant data secrecy.
              </p>
            </div>

            <div className="bg-surface border border-border-custom p-6 rounded-card space-y-3">
              <div className="w-8 h-8 rounded-badge bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="font-display font-semibold text-xs text-text-primary uppercase tracking-wider">
                Humanoid Autonomy
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                We design AI agents to adapt, converse, and clone vocal patterns with realistic emotional dynamics that respect brand constraints.
              </p>
            </div>

            <div className="bg-surface border border-border-custom p-6 rounded-card space-y-3">
              <div className="w-8 h-8 rounded-badge bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
                <Eye className="w-4 h-4" />
              </div>
              <h4 className="font-display font-semibold text-xs text-text-primary uppercase tracking-wider">
                Modernist Design
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                We believe in high-contrast desaturated Swiss grids, layout grid lines, and typography scaling rather than colorful noise.
              </p>
            </div>
          </div>
        </div>

        {/* Singapore Registry Details */}
        <div className="bg-surface/50 border border-border-custom p-6 rounded font-mono text-[10px] text-text-muted space-y-4">
          <div className="flex items-center gap-2 text-text-primary border-b border-border-custom/50 pb-2 uppercase font-bold">
            <Users className="w-4 h-4 text-accent" />
            <span>GLOBAL REGISTRY & COMPLIANCE DIRECTORY</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="font-bold text-text-primary block">BRANDAVOX CORPORATIONS</span>
              <span>RC Number: RC-99887722</span>
              <span>Corporate Affairs Commission (CAC) Nigeria Registry</span>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-text-primary block">OFFICE LOCATION</span>
              <span>Aba, Abia State, Nigeria</span>
              <span>Contact: compliance@brandavox.ai</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border-custom bg-surface py-8 text-xs text-text-muted shrink-0">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[10px]">
            © {new Date().getFullYear()} BRANDAVOX CORPORATIONS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/return-policy" className="hover:text-text-primary transition-colors">Return Policy</Link>
            <Link href="/" className="hover:text-text-primary transition-colors">Home Portal</Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-4 text-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-t border-border-custom/30 mt-4">
          Created by Brandavox Corporations
        </div>
      </footer>
    </div>
  );
}
