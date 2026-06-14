'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Palette,
  Download,
  RefreshCw,
  Layout,
  Type,
  FileImage,
  AlertCircle
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

export default function DesignStudioPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Design Canvas settings
  const [selectedBrand, setSelectedBrand] = useState('');
  const [format, setFormat] = useState<'instagram' | 'youtube' | 'twitter'>('instagram');
  const [heading, setHeading] = useState('DESIGN INTEGRITY');
  const [subheading, setSubheading] = useState('Swiss modernist aesthetics built on strict desaturated grids.');
  const [ctaText, setCtaText] = useState('EXPLORE PROTOCOLS');
  const [accentColor, setAccentColor] = useState('#FF4500'); // Neon Red/Orange
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch Brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands');
        const data = await res.json();
        if (data.success && data.data) {
          setBrands(data.data);
          if (data.data.length > 0) {
            setSelectedBrand(data.data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load active brand contexts.');
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Redraw Canvas content whenever state parameters change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define dimensions based on format
    let width = 800;
    let height = 800; // default instagram
    if (format === 'youtube') {
      width = 1200;
      height = 675;
    } else if (format === 'twitter') {
      width = 1200;
      height = 630;
    }

    canvas.width = width;
    canvas.height = height;

    // Background color
    ctx.fillStyle = themeMode === 'dark' ? '#09090b' : '#fafafa';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines (Swiss layout)
    ctx.strokeStyle = themeMode === 'dark' ? '#27272a' : '#e4e4e7';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer modernist borders
    ctx.strokeStyle = themeMode === 'dark' ? '#3f3f46' : '#d4d4d8';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Draw Brand logo element
    ctx.fillStyle = accentColor;
    ctx.fillRect(40, 40, 15, 15);

    ctx.fillStyle = themeMode === 'dark' ? '#ffffff' : '#09090b';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('BRANDAVOX OPERATING CORE', 65, 52);

    // Drawing Headings
    ctx.fillStyle = themeMode === 'dark' ? '#ffffff' : '#09090b';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(heading.toUpperCase(), 40, height / 2 - 30);

    // Drawing Subheadings
    ctx.fillStyle = themeMode === 'dark' ? '#a1a1aa' : '#71717a';
    ctx.font = '16px sans-serif';
    
    // Simple line wrap for subheading
    const words = subheading.split(' ');
    let line = '';
    let yPos = height / 2 + 10;
    const maxWidth = width - 100;
    const lineHeight = 24;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 40, yPos);
        line = words[n] + ' ';
        yPos += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 40, yPos);

    // Draw CTA Button block
    ctx.fillStyle = accentColor;
    ctx.fillRect(40, height - 90, 180, 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ctaText.toUpperCase(), 130, height - 66);
    ctx.textAlign = 'left'; // reset

  }, [format, heading, subheading, ctaText, accentColor, themeMode]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `brandavox_ad_${format}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Design Studio"
        description="Configure structured layout banners, thumbnails, and visual assets inside a real-time exportable canvas."
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start gap-3 text-sm font-sans">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Editor parameters */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Palette className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Canvas Controls
            </h3>
          </div>

          <div className="space-y-4 font-sans text-xs">
            {/* Identity context */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Identity Profile Context
              </label>
              {loadingBrands ? (
                <div className="h-9 bg-background/50 border border-border-custom animate-pulse rounded-sm" />
              ) : (
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-sans"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Layout Aspect ratio */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block font-mono">
                Asset Dimensions
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'instagram', label: '1:1 IG' },
                  { id: 'youtube', label: '16:9 YT' },
                  { id: 'twitter', label: '16:9 X' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormat(type.id as any)}
                    className={`py-2 px-1 border font-mono text-[9px] uppercase rounded-sm cursor-pointer transition-colors ${
                      format === type.id
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-border-custom text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
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
                  className="flex-1 px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-mono"
                />
              </div>
            </div>

            {/* Theme Mode toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Background Contrast
              </label>
              <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-sans"
              >
                <option value="dark">Dark Theme (#09090B)</option>
                <option value="light">Light Theme (#FAFAFA)</option>
              </select>
            </div>

            {/* Heading text */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Primary Header Text
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

            {/* CTA text */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                Call to Action
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm font-sans"
              />
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Creative PNG</span>
            </button>
          </div>
        </div>

        {/* Live Canvas panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
              HTML5 Responsive Creative Canvas
            </span>

            {/* Outer Canvas centering container */}
            <div className="p-4 border border-border-custom bg-background/50 rounded-sm flex items-center justify-center overflow-auto min-h-[400px]">
              <canvas
                ref={canvasRef}
                className="border border-border-custom max-w-full h-auto bg-zinc-950"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
