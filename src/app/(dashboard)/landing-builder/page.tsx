'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Globe,
  Plus,
  RefreshCw,
  Layout,
  Sliders,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';

export default function LandingBuilderPage() {
  const [template, setTemplate] = useState<'lead-gen' | 'webinar' | 'sales'>('lead-gen');
  const [heading, setHeading] = useState('THE OPERATING PROTOCOLS');
  const [subheading, setSubheading] = useState('Consolidate creative resources and scale marketing initiatives.');
  const [buttonText, setButtonText] = useState('DOWNLOAD BLUEPRINT');
  const [accentColor, setAccentColor] = useState('#FF4500');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeployedUrl(null);
    setTimeout(() => {
      setIsDeploying(false);
      setDeployedUrl(`https://socialflow.ai/sites/p-${Math.floor(Math.random() * 10000)}`);
    }, 1500);
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <PageHeader
        title="Landing Page Builder"
        description="Construct landing page wireframes and marketing funnels styled in desaturated Swiss layout grids."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Parameters Controls */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Layout className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Template Controls
            </h3>
          </div>

          <div className="space-y-4">
            {/* Template selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Funnel Objective
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent"
              >
                <option value="lead-gen">Lead Generation (Simple Form)</option>
                <option value="webinar">Webinar Registration (Date/Time)</option>
                <option value="sales">Product Sales Page (CTA Button)</option>
              </select>
            </div>

            {/* Accent Color picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Accent Highlight Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-9 h-9 border border-border-custom rounded-sm cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-mono text-xs"
                />
              </div>
            </div>

            {/* Heading text */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Primary Header
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-sans"
              />
            </div>

            {/* Subheading text */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Subheading Description
              </label>
              <textarea
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-sans resize-none"
              />
            </div>

            {/* Button text */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                CTA Button Text
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-sans"
              />
            </div>

            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Deploying wireframe funnel...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Deploy Live Landing Page</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Mockup centering container */}
        <div className="lg:col-span-2 space-y-6">
          
          {deployedUrl && (
            <div className="bg-surface border border-emerald-500/15 p-4 rounded-card bg-emerald-500/5 flex items-center justify-between gap-4 font-mono text-[10px]">
              <div className="space-y-0.5">
                <span className="text-emerald-400 font-bold uppercase block">Deploy Success!</span>
                <span className="text-text-muted">{deployedUrl}</span>
              </div>
              <a
                href={deployedUrl}
                target="_blank"
                rel="noreferrer"
                className="py-1 px-3 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary rounded-sm flex items-center gap-1 font-bold uppercase text-[9px]"
              >
                <span>Preview live</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Swiss Mockup frame */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
              Landing Wireframe Mockup Preview
            </span>

            {/* Inner responsive frame */}
            <div className="border border-border-custom bg-background rounded-sm min-h-[400px] flex flex-col justify-between p-8 font-sans relative overflow-hidden select-none">
              
              {/* Wireframe header grid line layout */}
              <div className="flex justify-between items-center border-b border-border-custom/50 pb-4">
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: accentColor }} className="w-3.5 h-3.5" />
                  <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-text-primary">
                    SITE CORE
                  </span>
                </div>
                <div className="flex gap-4 text-[9px] font-mono text-text-muted uppercase">
                  <span>PROTOCOLS</span>
                  <span>NETWORK</span>
                </div>
              </div>

              {/* Central text block */}
              <div className="my-12 max-w-xl mx-auto text-center space-y-5">
                <h2 className="text-2xl font-bold tracking-tight text-text-primary font-display leading-none">
                  {heading.toUpperCase()}
                </h2>
                <p className="text-xs text-text-muted leading-relaxed font-sans max-w-sm mx-auto">
                  {subheading}
                </p>

                {/* Form fields based on template */}
                {template === 'lead-gen' && (
                  <div className="max-w-xs mx-auto flex gap-2 pt-2">
                    <input
                      type="email"
                      placeholder="Enter organizational email..."
                      className="flex-1 px-3 py-1.5 bg-background border border-border-custom/80 text-[10px] text-text-primary rounded-sm focus:outline-none"
                      disabled
                    />
                    <button
                      style={{ backgroundColor: accentColor }}
                      className="px-4 text-[9px] font-mono font-bold text-white rounded-sm"
                    >
                      SUBMIT
                    </button>
                  </div>
                )}

                {template === 'webinar' && (
                  <div className="max-w-xs mx-auto border border-border-custom/60 rounded p-3 bg-background/50 font-mono text-[9px] text-text-muted space-y-2">
                    <span className="font-bold text-text-primary block text-[10px] uppercase">UPCOMING LIVE WEBINAR</span>
                    <span>Date: 2026-06-25 | Time: 18:00 GMT</span>
                  </div>
                )}

                {/* Main CTA button */}
                <div className="pt-2">
                  <button
                    style={{ backgroundColor: accentColor }}
                    className="px-6 py-2.5 font-mono text-[10px] font-bold text-white uppercase rounded-sm"
                  >
                    {buttonText}
                  </button>
                </div>

              </div>

              {/* Footer grids */}
              <div className="border-t border-border-custom/50 pt-4 flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase">
                <span>© SOCIALFLOW MEDIA SITE</span>
                <span>SECURED CORE CONNECTION</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
