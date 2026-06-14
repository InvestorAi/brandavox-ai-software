'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Film,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  Settings,
  Download,
  AlertCircle,
  HelpCircle,
  Eye
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

interface Keyframe {
  time: string;
  label: string;
  camera: string;
  focus: string;
}

export default function MotionAdsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration states
  const [selectedBrand, setSelectedBrand] = useState('');
  const [productPreset, setProductPreset] = useState('soda-can');
  const [motionPreset, setMotionPreset] = useState('orbital-spin');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  
  // Custom Timeline states
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('0s');

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

  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          alert('Render complete! Motion asset compiled as 4K MP4 (H.264/AAC).');
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  // Timeline Keyframes list
  const keyframes: Keyframe[] = [
    { time: '0s', label: 'Intro hook wide', camera: 'Orbit Entrance', focus: 'Product Contour' },
    { time: '2s', label: 'Rotation reveal', camera: '360 Spin', focus: 'Nutrition Grid' },
    { time: '4s', label: 'Macro details', camera: 'Extreme Zoom', focus: 'Brand Emblem' },
    { time: '6s', label: 'Physics splash', camera: 'Exploded View', focus: 'Sub Assembly' },
    { time: '8s', label: 'Cinema angle', camera: 'Low Tilt Up', focus: 'Fluid Splash' },
    { time: '10s', label: 'Call to action', camera: 'Static Frontal', focus: 'Final Packaging' },
  ];

  // Helper to render thumbnails matching preset & timeline selection
  const renderThumbnail = (time: string, scaleClass = 'scale-90') => {
    let styleClass = '';
    if (time === '0s') styleClass = 'rotate-12 translate-y-2';
    if (time === '2s') styleClass = '-rotate-6';
    if (time === '4s') styleClass = 'scale-125';
    if (time === '6s') styleClass = 'translate-x-1 translate-y-3';
    if (time === '8s') styleClass = 'rotate-[35deg] translate-y-4 scale-90';
    if (time === '10s') styleClass = 'rotate-0 translate-y-0 scale-100';

    if (productPreset === 'soda-can') {
      return (
        <div className={`w-8 h-14 border border-zinc-700 bg-zinc-800 rounded flex flex-col justify-between p-1 transition-transform duration-300 relative ${styleClass} ${scaleClass}`}>
          <div className="w-full h-1 bg-zinc-600 rounded-full" />
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="w-2.5 h-2.5 bg-accent rounded-full mb-0.5" />
            <span className="text-[5px] font-mono text-zinc-500 uppercase">CAN</span>
          </div>
          <div className="w-full h-0.5 bg-zinc-600 rounded-full" />
        </div>
      );
    } else if (productPreset === 'burger') {
      return (
        <div className={`w-12 h-10 flex flex-col justify-center items-center gap-0.5 transition-transform duration-300 relative ${styleClass} ${scaleClass}`}>
          <div className="w-8 h-2 bg-amber-700 rounded-t-full" />
          <div className="w-10 h-0.5 bg-emerald-600 rounded-full" />
          <div className="w-9 h-0.5 bg-yellow-500 rounded-sm" />
          <div className="w-8 h-1.5 bg-amber-950 rounded-md" />
          <div className="w-8 h-1 bg-amber-700 rounded-b-md" />
        </div>
      );
    } else if (productPreset === 'smart-watch') {
      return (
        <div className={`w-10 h-10 flex items-center justify-center relative transition-transform duration-300 ${styleClass} ${scaleClass}`}>
          <div className="absolute w-3 h-12 bg-zinc-900 border border-zinc-800 rounded-sm" />
          <div className="w-7 h-7 bg-zinc-950 border border-zinc-700 rounded-full z-10 p-0.5 flex flex-col items-center justify-center">
            <div className="w-5 h-5 border border-accent/25 rounded-full" />
          </div>
        </div>
      );
    } else {
      return (
        <div className={`w-6 h-12 border border-zinc-700 bg-zinc-900 rounded-sm flex flex-col justify-between p-1 transition-transform duration-300 relative ${styleClass} ${scaleClass}`}>
          <div className="w-3 h-2 bg-zinc-800 border border-zinc-700 self-center rounded-sm" />
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <span className="text-[5px] font-mono text-accent">SRM</span>
          </div>
        </div>
      );
    }
  };

  // Preset Visual Map for main simulation canvas
  const renderProductElement = () => {
    let animationClass = '';
    if (isPlaying) {
      if (motionPreset === 'orbital-spin') {
        animationClass = 'animate-[spin_4s_infinite_linear]';
      } else if (motionPreset === 'exploded-assembly') {
        animationClass = 'animate-[pulse_2s_infinite_ease-in-out]';
      } else if (motionPreset === 'macro-zoom') {
        animationClass = 'animate-[ping_3s_infinite_cubic-bezier(0,0,0.2,1)]';
      } else if (motionPreset === 'gravity-splash') {
        animationClass = 'animate-[bounce_2s_infinite]';
      }
    } else {
      // Apply static pose depending on clicked timeline keyframe
      if (selectedTimeFrame === '0s') animationClass = 'rotate-12 translate-y-4';
      if (selectedTimeFrame === '2s') animationClass = '-rotate-[15deg] scale-105';
      if (selectedTimeFrame === '4s') animationClass = 'scale-[1.6]';
      if (selectedTimeFrame === '6s') animationClass = 'translate-y-8 skew-y-6';
      if (selectedTimeFrame === '8s') animationClass = 'rotate-[30deg] scale-95';
      if (selectedTimeFrame === '10s') animationClass = 'rotate-0 translate-y-0';
    }

    if (productPreset === 'soda-can') {
      return (
        <div className={`w-32 h-56 border border-zinc-700 bg-zinc-800 rounded-2xl flex flex-col justify-between p-4 transition-transform duration-500 relative ${animationClass}`}>
          <div className="w-full h-4 bg-zinc-600 rounded-full border border-zinc-700 self-center" />
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 bg-accent rounded-full mb-2 flex items-center justify-center font-bold text-white text-[10px]">B</div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">SPARKLING</span>
            <span className="font-display text-xs font-bold text-text-primary">PULSE</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-600 rounded-full" />
        </div>
      );
    } else if (productPreset === 'burger') {
      return (
        <div className={`w-44 h-44 flex flex-col justify-center items-center gap-1.5 transition-transform duration-500 relative ${animationClass}`}>
          <div className="w-32 h-10 bg-amber-700 border border-amber-800 rounded-t-full" />
          <div className="w-36 h-2.5 bg-emerald-600 rounded-full" />
          <div className="w-34 h-2 bg-yellow-500 rounded-sm" />
          <div className="w-32 h-6 bg-amber-950 border border-zinc-900 rounded-md" />
          <div className="w-30 h-6 bg-amber-700 border border-amber-800 rounded-b-md" />
        </div>
      );
    } else if (productPreset === 'smart-watch') {
      return (
        <div className={`w-40 h-40 flex items-center justify-center relative transition-transform duration-500 ${animationClass}`}>
          <div className="absolute w-12 h-48 bg-zinc-900 border border-zinc-800 rounded-md" />
          <div className="w-28 h-28 bg-zinc-950 border border-zinc-700 rounded-full z-10 p-3 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 border border-accent/25 rounded-full flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono text-accent font-bold">10:45 AM</span>
              <span className="text-[8px] font-mono text-zinc-500">84 BPM</span>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={`w-24 h-48 border border-zinc-700 bg-zinc-900 rounded-sm flex flex-col justify-between p-3 transition-transform duration-500 relative ${animationClass}`}>
          <div className="w-10 h-8 bg-zinc-800 border border-zinc-700 self-center rounded-sm" />
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <span className="font-mono text-[8px] text-text-muted uppercase tracking-widest">NIGHT REPAIR</span>
            <span className="font-display text-[11px] font-bold text-accent">SERUM</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <PageHeader
        title="Neural Motion Ads"
        description="Compile product layouts into dynamic cinematic commercial advertisements and 4K social motion assets."
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start gap-3 text-sm font-sans">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Guide Toolkit */}
      <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
        <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent" />
          <span>Motion Ads Toolkit & How to Use</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-text-muted leading-relaxed">
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">1. Choose Product Preset</span>
            <p>Select your DTC template (can, burger, watch, serum). The engine configures rendering physics parameters dynamically.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">2. Sequence Timelines</span>
            <p>Review the timeline keyframe cards showing previews at different frames. Click any frame to manually inspect camera angles.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">3. Render & Download ad</span>
            <p>Run simulator playbacks to preview movement loops. Render high resolution commercial ad files for campaign releases.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Setup Parameters */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Film className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
              Motion Parameters
            </h3>
          </div>

          <div className="space-y-4">
            {/* Identity context */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Identity Profile Context
              </label>
              {loadingBrands ? (
                <div className="h-9 bg-background/50 border border-border-custom animate-pulse rounded-sm" />
              ) : (
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Product Preset select */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Product Preset Layout
              </label>
              <select
                value={productPreset}
                onChange={(e) => setProductPreset(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="soda-can">Soda Can (DTC Beverage)</option>
                <option value="burger">Classic Burger (Fast Food)</option>
                <option value="smart-watch">Smart Watch (Hardware Tech)</option>
                <option value="cosmetics">Cosmetics Dropper (Skincare)</option>
              </select>
            </div>

            {/* Motion preset path */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Camera Motion Path
              </label>
              <select
                value={motionPreset}
                onChange={(e) => setMotionPreset(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="orbital-spin">Orbital Spin (360° View)</option>
                <option value="exploded-assembly">Exploded Assembly (Gravity-Free)</option>
                <option value="macro-zoom">Macro Zoom Transition</option>
                <option value="gravity-splash">Gravity Splash Sequence</option>
              </select>
            </div>

            {/* Simulated controls */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  setSelectedTimeFrame('10s'); // Reset static focus
                }}
                className={`flex-1 py-2 px-3 border font-semibold rounded-sm text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  isPlaying
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-border-custom text-text-primary hover:bg-zinc-800'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Sim</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Sim</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-border-custom pt-4 space-y-3">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Production Settings
              </label>
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                  <span>FPS: 60.00</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-zinc-500" />
                  <span>RES: 4K UHD</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartRender}
              disabled={isRendering}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isRendering ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling commercial ({renderProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Render commercial ad</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live CSS simulation player */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider">
                Simulated 3D Engine Preview Canvas
              </span>
              <span className="font-mono text-[9px] text-accent font-bold bg-accent/5 px-2 py-0.5 border border-accent/25 rounded uppercase">
                {isPlaying ? 'ACTIVE STREAM' : 'PAUSED PREVIEW'}
              </span>
            </div>

            {/* Outer player canvas */}
            <div className="relative aspect-video bg-zinc-950 border border-border-custom rounded-sm overflow-hidden flex items-center justify-center group">
              {/* Layout grid overlay lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-20">
                {Array.from({ length: 24 }).map((_, idx) => (
                  <div key={idx} className="border-[0.5px] border-zinc-800" />
                ))}
              </div>

              {/* Focus crosshairs */}
              <div className="absolute w-6 h-6 border-t-2 border-l-2 border-zinc-700 top-4 left-4" />
              <div className="absolute w-6 h-6 border-t-2 border-r-2 border-zinc-700 top-4 right-4" />
              <div className="absolute w-6 h-6 border-b-2 border-l-2 border-zinc-700 bottom-4 left-4" />
              <div className="absolute w-6 h-6 border-b-2 border-r-2 border-zinc-700 bottom-4 right-4" />

              {/* Rendered product element */}
              <div className="z-10 flex items-center justify-center p-8">
                {renderProductElement()}
              </div>

              {/* Status footer overlays */}
              <div className="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-500 flex items-center gap-3">
                <span>ZOOM: {selectedTimeFrame === '4s' ? '1.60x' : '1.00x'}</span>
                <span>TIME: {isPlaying ? 'LOOPING' : selectedTimeFrame}</span>
                <span>PRESET: {productPreset.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Timeline Visual Preview Frames */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider">
                Timeline Visual Keyframes (Click to jump preview camera)
              </span>
              <span className="text-[8px] text-text-muted font-mono uppercase">
                Length: 10 Seconds
              </span>
            </div>

            {/* Horizontal timeline previews row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
              {keyframes.map((kf) => {
                const isActive = !isPlaying && selectedTimeFrame === kf.time;
                return (
                  <div
                    key={kf.time}
                    onClick={() => {
                      setIsPlaying(false);
                      setSelectedTimeFrame(kf.time);
                    }}
                    className={`bg-background border rounded p-2 flex flex-col items-center justify-between cursor-pointer hover:border-accent/40 transition-all text-center space-y-3 ${
                      isActive ? 'border-accent ring-1 ring-accent bg-accent/5' : 'border-border-custom'
                    }`}
                  >
                    <span className="font-mono text-[8px] text-text-muted font-bold block">
                      {kf.time}
                    </span>
                    
                    {/* Frame Visual Sketch */}
                    <div className="w-14 h-16 bg-zinc-950 rounded border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {renderThumbnail(kf.time, isActive ? 'scale-105' : 'scale-90')}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[8px] text-text-primary block font-medium truncate w-full max-w-[70px]">
                        {kf.label}
                      </span>
                      <span className="text-[6px] text-text-muted block font-mono tracking-wider truncate w-full max-w-[70px]">
                        {kf.camera}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
