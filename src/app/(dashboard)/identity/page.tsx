'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Fingerprint,
  RefreshCw,
  Sparkles,
  Check,
  Copy,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface ColorSwatch {
  name: string;
  hex: string;
}

interface IdentityMatrix {
  fontPairing: {
    primary: string;
    mono: string;
  };
  palette: ColorSwatch[];
  logoSvg: string;
  voiceAdjectives: string[];
  descriptors: string[];
}

export default function BrandIdentityPage() {
  const [brandName, setBrandName] = useState('Pulse Retail');
  const [industry, setIndustry] = useState('DTC Logistics');
  const [mood, setMood] = useState<'classic' | 'cyber' | 'editorial'>('classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [matrix, setMatrix] = useState<IdentityMatrix | null>({
    fontPairing: {
      primary: 'Space Grotesk (Sans-serif)',
      mono: 'JetBrains Mono (Monospace)'
    },
    palette: [
      { name: 'Swiss Accent', hex: '#FF4500' },
      { name: 'Core Dark', hex: '#09090B' },
      { name: 'Secondary Ash', hex: '#27272A' },
      { name: 'Desaturated Slate', hex: '#A1A1AA' },
      { name: 'Swiss Contrast', hex: '#FAFAFA' }
    ],
    voiceAdjectives: ['Minimalist', 'Direct', 'Uncompromising', 'Foresightful'],
    descriptors: [
      'High-contrast layouts built around tight typography alignments.',
      'Sleek structural aesthetics communicating security and terminal-like velocity.'
    ],
    logoSvg: `<svg viewBox="0 0 100 100" class="w-24 h-24 stroke-accent fill-none" stroke-width="2.5">
      <rect x="15" y="15" width="70" height="70" />
      <line x1="15" y1="15" x2="85" y2="85" />
      <circle cx="50" cy="50" r="15" class="fill-accent/10" />
    </svg>`
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let fontPairing = { primary: 'Space Grotesk', mono: 'JetBrains Mono' };
      let palette: ColorSwatch[] = [];
      let logoSvg = '';
      let voiceAdjectives: string[] = [];
      let descriptors: string[] = [];

      if (mood === 'cyber') {
        fontPairing = { primary: 'Outfit (Sans-serif)', mono: 'Fira Code (Monospace)' };
        palette = [
          { name: 'Cyber Neon', hex: '#00FFCC' },
          { name: 'Neural Black', hex: '#0D0D11' },
          { name: 'Matrix Grey', hex: '#1E1E24' },
          { name: 'Desaturated Green', hex: '#66FFB2' },
          { name: 'High Bright', hex: '#EAEAEA' }
        ];
        voiceAdjectives = ['Bold', 'Algorithmic', 'Hyper-focused', 'Technical'];
        descriptors = [
          'Industrial layout elements borrowing from hacker consoles.',
          'Saturated highlights on pitch-dark foundations emphasizing next-gen performance.'
        ];
        logoSvg = `<svg viewBox="0 0 100 100" class="w-24 h-24 stroke-accent fill-none" stroke-width="2.5">
          <polygon points="50,15 85,80 15,80" />
          <line x1="50" y1="15" x2="50" y2="80" />
          <circle cx="50" cy="55" r="10" class="fill-accent/15" />
        </svg>`;
      } else if (mood === 'editorial') {
        fontPairing = { primary: 'Outfit (Sans-serif)', mono: 'DM Sans (Sans-serif)' };
        palette = [
          { name: 'Warm Crimson', hex: '#8B0000' },
          { name: 'Editorial Sand', hex: '#FDFBF7' },
          { name: 'Deep Earth', hex: '#2F2F2F' },
          { name: 'Sage Accents', hex: '#7A8B7B' },
          { name: 'Aesthetic White', hex: '#FFFFFF' }
        ];
        voiceAdjectives = ['Cerebral', 'Deliberate', 'Sophisticated', 'Artistic'];
        descriptors = [
          'High typographic margins and asymmetrical layout offsets.',
          'Warm tones celebrating designer integrity and editorial legacy.'
        ];
        logoSvg = `<svg viewBox="0 0 100 100" class="w-24 h-24 stroke-accent fill-none" stroke-width="2">
          <circle cx="50" cy="50" r="35" />
          <line x1="15" y1="50" x2="85" y2="50" />
          <line x1="50" y1="15" x2="50" y2="85" />
        </svg>`;
      } else {
        // classic Swiss
        fontPairing = { primary: 'Space Grotesk (Sans-serif)', mono: 'JetBrains Mono (Monospace)' };
        palette = [
          { name: 'Swiss Accent', hex: '#FF4500' },
          { name: 'Core Dark', hex: '#09090B' },
          { name: 'Secondary Ash', hex: '#27272A' },
          { name: 'Desaturated Slate', hex: '#A1A1AA' },
          { name: 'Swiss Contrast', hex: '#FAFAFA' }
        ];
        voiceAdjectives = ['Minimalist', 'Direct', 'Uncompromising', 'Foresightful'];
        descriptors = [
          'High-contrast layouts built around tight typography alignments.',
          'Sleek structural aesthetics communicating security and terminal-like velocity.'
        ];
        logoSvg = `<svg viewBox="0 0 100 100" class="w-24 h-24 stroke-accent fill-none" stroke-width="2.5">
          <rect x="15" y="15" width="70" height="70" />
          <line x1="15" y1="15" x2="85" y2="85" />
          <circle cx="50" cy="50" r="15" class="fill-accent/10" />
        </svg>`;
      }

      setMatrix({ fontPairing, palette, voiceAdjectives, descriptors, logoSvg });
      setIsGenerating(false);
    }, 1000);
  };

  const handleCopyHex = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Brand Identity Generator"
        description="Compile brand identity design systems (typographic hierarchies, desaturated modernist palettes, and custom vector logos) in real-time."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Generator Controls */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Fingerprint className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Identity Parameters
            </h3>
          </div>

          <div className="space-y-4 font-sans text-xs">
            {/* Brand Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Brand Entity Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-sans"
              />
            </div>

            {/* Industry Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Industry Core
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-sans"
              />
            </div>

            {/* Design Mood */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block font-mono">
                Visual Art Mood
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'classic', label: 'Classic Swiss' },
                  { id: 'cyber', label: 'Tech Cyber' },
                  { id: 'editorial', label: 'Warm Book' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setMood(type.id as any)}
                    className={`py-2 px-1 border font-mono text-[9px] uppercase rounded-sm cursor-pointer transition-colors ${
                      mood === type.id
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-border-custom text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !brandName.trim()}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Brand Brain...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Identity Matrix</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {matrix ? (
            <div className="space-y-6 animate-fade-in font-sans text-xs leading-relaxed">
              
              {/* Logo Symbol & Fonts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Logo concept */}
                <div className="bg-surface border border-border-custom p-6 rounded-card flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">
                    Identity Symbol Concept
                  </span>
                  <div className="w-28 h-28 border border-border-custom bg-background/50 rounded-sm flex items-center justify-center" dangerouslySetInnerHTML={{ __html: matrix.logoSvg }} />
                </div>

                {/* Typography specs */}
                <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4 md:col-span-2 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block border-b border-border-custom/50 pb-2">
                      Typeface Standards
                    </span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Primary Header:</span>
                        <span className="font-bold text-text-primary font-display text-sm">{matrix.fontPairing.primary}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Monospaced Code:</span>
                        <span className="font-mono text-text-primary text-xs">{matrix.fontPairing.mono}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-background border border-border-custom/50 rounded-sm font-mono text-[9px] text-zinc-500">
                    💡 CSS Standard: `font-family: var(--font-space-grotesk), monospace;`
                  </div>
                </div>
              </div>

              {/* Color swatches */}
              <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block border-b border-border-custom/50 pb-2">
                  Desaturated Swiss Swatches
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {matrix.palette.map((color, index) => (
                    <div
                      key={index}
                      onClick={() => handleCopyHex(color.hex, index)}
                      className="border border-border-custom/70 rounded-sm overflow-hidden bg-background p-2.5 text-center cursor-pointer group hover:border-accent transition-colors"
                    >
                      <div
                        style={{ backgroundColor: color.hex }}
                        className="w-full h-12 rounded-sm border border-black/10"
                      />
                      <div className="pt-2 text-left">
                        <span className="font-bold text-text-primary text-[10px] block truncate">{color.name}</span>
                        <span className="font-mono text-[9px] text-zinc-500 flex items-center justify-between pt-0.5">
                          <span>{color.hex}</span>
                          {copiedIndex === index ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 group-hover:text-accent transition-colors" />
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archetypes and directions */}
              <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block border-b border-border-custom/50 pb-2">
                  Tone Directive Profile
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Adjectives */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-muted font-bold block">Voice Signature Vocabs</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matrix.voiceAdjectives.map((adj) => (
                        <span key={adj} className="px-2.5 py-1 border border-border-custom font-mono text-[10px] bg-background/50 rounded-sm text-text-primary">
                          {adj}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Positioning directions */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-text-muted font-bold block">Layout Philosophy</span>
                    <ul className="space-y-1.5 text-text-muted">
                      {matrix.descriptors.map((desc, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-accent shrink-0" />
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-surface border border-border-custom rounded-card p-12 text-center text-text-muted font-sans text-xs flex flex-col items-center justify-center min-h-[300px]">
              <ShieldCheck className="w-12 h-12 text-zinc-700/50 mb-3" />
              <p className="font-semibold text-text-primary uppercase tracking-wider">
                Identity Matrix Output
              </p>
              <p className="mt-1 text-text-muted max-w-sm">
                Enter details of your organization and launch the Identity generation agent to produce color grids and SVG icons.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
