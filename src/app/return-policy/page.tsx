// Location: src/app/return-policy/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, DollarSign, Clock, HelpCircle, FileText } from 'lucide-react';

export default function ReturnPolicyPage() {
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
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 space-y-12">
        {/* Title Block */}
        <div className="space-y-4 border-b border-border-custom pb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-surface border border-border-custom rounded-badge text-[10px] font-mono text-accent uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>Registry File: REF-03</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary uppercase tracking-tight">
            Return & Refund Policy
          </h1>
          <p className="text-xs text-text-muted font-mono uppercase">
            Effective Date: June 11, 2026 | Document Version: 1.0.0
          </p>
        </div>

        {/* Narrative / Context */}
        <div className="space-y-8 text-sm leading-relaxed text-text-muted font-sans max-w-3xl">
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary flex items-center gap-2">
              <DollarSign className="w-4.5 h-4.5 text-accent" />
              <span>1. Subscription Payments</span>
            </h2>
            <p>
              Brandavox AI runs on a subscription model (Starter, Professional, Agency tiers) billed monthly or annually. All subscription payments are processed securely through our gateway integrations. 
            </p>
            <p>
              Because our system provisions active API tokens and dedicated neural compute cycles (Gemini Flash, ElevenLabs, and Pollinations.ai API calls) immediately upon subscription, we operate on a strict refund covenant.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-accent" />
              <span>2. 14-Day Refund Window</span>
            </h2>
            <p>
              If you are dissatisfied with your subscription plan within the first **14 calendar days** of registration, you are eligible to request a full refund, subject to the credit usage limit below.
            </p>
            <p className="bg-surface/50 border border-border-custom p-4 rounded font-mono text-xs text-text-muted">
              <FileText className="w-3.5 h-3.5 text-accent inline mr-1.5 -mt-0.5" />
              CRITICAL LIMIT: Accounts that have consumed more than **100 AI generation credits** or synthesized over **10 voice clones** within the 14-day window are ineligible for refund options.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-accent" />
              <span>3. Cancellations & Terminations</span>
            </h2>
            <p>
              You can cancel your subscription plan at any time through the billing dashboard. Upon cancellation, your tenant workspace, API keys, and campaign schedules remain active until the end of the current billing cycle. No pro-rated refunds are issued for mid-cycle cancellations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-accent" />
              <span>4. Enterprise SLA & Custom Solutions</span>
            </h2>
            <p>
              Custom agency agreements under the Agency tier are subject to specific Service Level Agreements (SLAs) signed by Brandavox Corporations and the partner company. These contracts override standard public return policies.
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
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-text-primary transition-colors">About Us</Link>
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
