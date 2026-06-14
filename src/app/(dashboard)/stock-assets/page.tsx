'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Music,
  Play,
  Pause,
  Download,
  Search,
  Filter,
  Film,
  Volume2,
  Sparkles,
  HelpCircle,
  Video
} from 'lucide-react';

interface StockAsset {
  id: string;
  title: string;
  category: 'sfx' | 'beats' | 'overlays';
  duration: string;
  size: string;
  type: string;
  previewUrl?: string;
}

export default function StockAssetsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'sfx' | 'beats' | 'overlays'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const assets: StockAsset[] = [
    // Sound Effects
    { id: 'ast-1', title: 'Cyber UI Click Response', category: 'sfx', duration: '0:02', size: '120 KB', type: 'WAV 24-bit' },
    { id: 'ast-2', title: 'Deep Sub Whoosh Transition', category: 'sfx', duration: '0:04', size: '280 KB', type: 'WAV 24-bit' },
    { id: 'ast-3', title: 'Fast Camera Shutter Click', category: 'sfx', duration: '0:01', size: '95 KB', type: 'MP3 320kbps' },
    { id: 'ast-4', title: 'Retro Synthetic Notification chime', category: 'sfx', duration: '0:03', size: '180 KB', type: 'WAV 24-bit' },
    
    // Background Beats
    { id: 'ast-5', title: 'Swiss Minimalist Techno Beat (Desaturated Tempo)', category: 'beats', duration: '2:15', size: '5.2 MB', type: 'MP3 320kbps' },
    { id: 'ast-6', title: 'Warm African Sunset Afrobeat (Ambient Loop)', category: 'beats', duration: '1:45', size: '4.1 MB', type: 'WAV 24-bit' },
    { id: 'ast-7', title: 'Lo-Fi Chill Hop branding narrative background', category: 'beats', duration: '3:05', size: '7.1 MB', type: 'MP3 320kbps' },
    { id: 'ast-8', title: 'High-Energy Cinematic Tech Advertisement intro', category: 'beats', duration: '1:10', size: '2.8 MB', type: 'WAV 24-bit' },

    // Video Overlays
    { id: 'ast-9', title: 'Modernist Grid Overlay Mask', category: 'overlays', duration: '0:10', size: '14.2 MB', type: 'MP4 1080p' },
    { id: 'ast-10', title: 'Desaturated Film Grain & Scratch overlay', category: 'overlays', duration: '0:15', size: '24.5 MB', type: 'MP4 4K' },
    { id: 'ast-11', title: 'Minimalist Framing Crop Lines (16:9 / 9:16)', category: 'overlays', duration: '0:05', size: '1.2 MB', type: 'PNG Master' },
    { id: 'ast-12', title: 'Fast Typography Particle Dust Loop', category: 'overlays', duration: '0:20', size: '32.1 MB', type: 'MP4 1080p' },
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesTab = activeTab === 'all' || asset.category === activeTab;
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handlePlayToggle = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // Simulate auto-stop after duration for mock player
      setTimeout(() => {
        setPlayingId((prev) => (prev === id ? null : prev));
      }, 5000);
    }
  };

  const handleDownload = (asset: StockAsset) => {
    alert(`Downloading asset: ${asset.title} (${asset.size}) successfully!`);
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <PageHeader
        title="Stock Assets Library"
        description="Browse premium, desaturated sound effects, background tracks, and video overlay assets ready for brand campaigns."
      />

      {/* Guide Toolkit */}
      <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
        <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent" />
          <span>Stock Assets Toolkit & How to Use</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-text-muted leading-relaxed">
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">1. Curate Audio / SFX</span>
            <p>Listen to sound effects (clicks, swooshes, shutter gates) and looping beats designed to hook viewer attention under 3 seconds.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">2. Layer Video Templates</span>
            <p>Download grain effects, Swiss grids, and particles to drop directly over your timeline videos for premium cinematic treatments.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">3. Production Export</span>
            <p>Click the download button next to any asset. All items are license-free and formatted in high-fidelity WAV/MP4 standards.</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface border border-border-custom p-4 rounded">
        {/* Tab Filters */}
        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { name: 'Show All', value: 'all' },
            { name: 'Sound FX', value: 'sfx' },
            { name: 'Looping Beats', value: 'beats' },
            { name: 'Video Overlays', value: 'overlays' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`py-1.5 px-3 border font-mono text-[9px] uppercase rounded-sm cursor-pointer transition-colors ${
                activeTab === tab.value
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border-custom text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-text-muted">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border-custom text-text-primary rounded-sm text-xs font-mono focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Asset Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const isSFX = asset.category === 'sfx';
          const isBeat = asset.category === 'beats';
          const isOverlay = asset.category === 'overlays';
          const isPlaying = playingId === asset.id;

          return (
            <div
              key={asset.id}
              className="bg-surface border border-border-custom p-5 rounded-card flex flex-col justify-between hover:border-accent/35 transition-colors space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[8px] font-bold text-accent uppercase px-1.5 py-0.5 bg-accent/5 border border-accent/25 rounded">
                    {asset.category === 'sfx' && 'Sound FX'}
                    {asset.category === 'beats' && 'Looping Beat'}
                    {asset.category === 'overlays' && 'Video Overlay'}
                  </span>
                  <h4 className="font-display font-bold text-text-primary text-xs leading-normal pt-1">
                    {asset.title}
                  </h4>
                </div>

                <div className="p-2 bg-background border border-border-custom rounded-sm shrink-0">
                  {isSFX && <Volume2 className="w-4 h-4 text-zinc-400" />}
                  {isBeat && <Music className="w-4 h-4 text-zinc-400" />}
                  {isOverlay && <Video className="w-4 h-4 text-zinc-400" />}
                </div>
              </div>

              {/* Dynamic preview elements */}
              {isOverlay ? (
                <div className="aspect-video w-full bg-zinc-950 border border-zinc-800 rounded-sm relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 pointer-events-none opacity-10">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div key={idx} className="border border-white" />
                    ))}
                  </div>
                  <Film className="w-8 h-8 text-zinc-700 animate-pulse" />
                  <span className="absolute bottom-2 right-2 text-[8px] font-mono text-zinc-500">
                    PREVIEW OVERLAY
                  </span>
                </div>
              ) : (
                <div className="py-2.5 px-3 bg-background border border-border-custom/60 rounded flex items-center justify-between gap-3">
                  <button
                    onClick={() => handlePlayToggle(asset.id)}
                    className="p-2 bg-zinc-900 border border-border-custom text-text-primary hover:border-accent rounded-sm shrink-0 cursor-pointer flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 text-accent fill-accent" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="w-full bg-border-custom h-1 rounded overflow-hidden">
                      <div
                        className={`h-full bg-accent transition-all duration-500 ${
                          isPlaying ? 'w-full duration-[5000ms] ease-linear' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-text-muted">
                    {asset.duration}
                  </span>
                </div>
              )}

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border-custom/50 text-[9px] font-mono text-text-muted">
                <div className="flex gap-3">
                  <span>{asset.size}</span>
                  <span>•</span>
                  <span>{asset.type}</span>
                </div>

                <button
                  onClick={() => handleDownload(asset)}
                  className="py-1 px-2.5 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary font-bold uppercase rounded-sm flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
