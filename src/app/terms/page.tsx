// Brandavox Terms of Use Page
// Location: src/app/terms/page.tsx

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Lock, Shield } from 'lucide-react';

export default function TermsOfUsePage() {
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
            <span>Registry File: ToU-01</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary uppercase tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs text-text-muted font-mono uppercase">
            Effective Date: June 11, 2026 | Document Version: 2.0.0
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-text-muted font-sans max-w-3xl">
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, installing, or provisioning API coordinates under the Brandavox application (the "Service"), you agree to be bound by these Terms of Use. If you are entering into these terms on behalf of a creative agency or corporate entity, you warrant that you possess the appropriate authorization credentials to bind the tenant directory to this covenant.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary">
              2. Multi-Tenant Directory & Security
            </h2>
            <p>
              Brandavox enforces strict logical database multi-tenant isolation via PostgreSQL Row Level Security (RLS) policies. You are solely responsible for provisioning credentials, maintaining secret API access keys (`bv_live_...`), and restricting user account permissions (`owner`, `admin`, `manager`, `member`).
            </p>
            <p className="bg-surface/50 border border-border-custom p-4 rounded font-mono text-xs text-text-muted">
              <Lock className="w-3.5 h-3.5 text-accent inline mr-1.5 -mt-0.5" />
              IMPORTANT: API secret credentials are only displayed once upon generation. You are solely responsible for caching tokens in secure environment parameter vaults.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary">
              3. AI Generation Credit & Usage Policy
            </h2>
            <p>
              The Service utilizes primary (Gemini Flash API) and secondary (OpenAI API) Large Language Model routers to generate voice guidelines, positioning strategies, target audience personas, and content calendars. Usage metrics are calculated based on tokens used and logged under your tenant directory.
            </p>
            <p>
              We maintain absolute zero copyright claim over the strategic positioning, written copies, or video storyboards generated for your client workspaces.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary">
              4. Service Level & Modifications
            </h2>
            <p>
              We reserve the right to suspend API endpoints, perform server migrations, or modify tenant subscription tiers. Offline fallback services (mock database modules) are provided as-is without programmatic warranties.
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
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
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
