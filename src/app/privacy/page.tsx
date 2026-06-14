// Brandavox Privacy Policy Page
// Location: src/app/privacy/page.tsx

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Lock, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between font-sans">
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

      {/* MAIN LEGAL CONTENT */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 space-y-12">
        <div className="space-y-3 border-b border-border-custom pb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-surface border border-border-custom rounded-badge text-[10px] font-mono text-accent uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>Registry File: PP-02</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary">
            Privacy Policy
          </h1>
          <p className="text-xs text-text-muted font-mono uppercase">
            Effective Date: June 11, 2026 | Document Version: 2.0.0
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-text-muted font-sans max-w-3xl">
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary">
              1. Information Collection and Scopes
            </h2>
            <p>
              We collect user profiles credentials (emails, passwords, names), organization attributes (agency industry, size), positioned brand coordinates, and client CRM data. We log outgoing webhook payloads and security events for delivery audits.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary">
              2. Data Isolation and Storage
            </h2>
            <p>
              All customer database profiles, brand strategy settings, calendars, and channels chat dialogues are stored within segregated tables protected by PostgreSQL Row Level Security. We do not inspect, sell, or train external LLM foundation models on your tenant's strategy files, client positioning assets, or custom brand memory matrices.
            </p>
            <p className="bg-surface/50 border border-border-custom p-4 rounded font-mono text-xs text-text-muted">
              <Lock className="w-3.5 h-3.5 text-accent inline mr-1.5 -mt-0.5" />
              Note: Offline data generated while Supabase environment configurations are missing resides locally inside your browser/system directory (`mockDb.json`) and is never uploaded.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary">
              3. AI Providers and Processing
            </h2>
            <p>
              Strategic prompts, captions briefs, and storyboard concepts are sent securely to primary (Google Gemini) and secondary (OpenAI) developer endpoints. These requests are governed under strict API privacy regulations—meaning your data is processed dynamically without being retained for training models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary">
              4. Webhook Security
            </h2>
            <p>
              Custom webhooks dispatch operational events (e.g. `campaign.published`, `client.at_risk`) to target listener URLs. Ensure your listener endpoints use secure HTTPS protocols and handle incoming payloads with token validation checks.
            </p>
          </section>
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
            <Link href="/about" className="hover:text-text-primary transition-colors">About Us</Link>
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
