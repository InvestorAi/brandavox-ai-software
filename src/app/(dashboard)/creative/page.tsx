'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import {
  Sparkles,
  Video,
  Calendar,
  AlertCircle,
  RefreshCw,
  Check,
  ArrowRight,
  Music,
  Tv,
  Film,
  Camera,
  Layers,
  Send,
  Eye,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
}

interface Campaign {
  id: string;
  title: string;
}

interface Scene {
  sceneNumber: number;
  visual: string;
  voiceover: string;
  duration: number;
  cameraAngle: string;
  editingNote: string;
  artPrompt?: string;
}

interface VideoScriptResponse {
  hook: string;
  scenes: Scene[];
  music: string;
  editingDirections: string;
  cta: string;
}

interface GeneratedPost {
  date: string;
  platform: string;
  concept: string;
  caption: string;
  hashtags: string[];
  hook: string;
  contentType: string;
}

interface ContentPlannerResponse {
  calendar: GeneratedPost[];
  engagementHooks: string[];
  strategyNotes: string;
}

export default function CreativeStudioPage() {
  // Navigation tabs: 'video' | 'planner'
  const [activeTab, setActiveTab] = useState<'video' | 'planner'>('video');

  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Video Scriptwriter States
  const [videoBrandId, setVideoBrandId] = useState('');
  const [videoConcept, setVideoConcept] = useState('');
  const [videoDuration, setVideoDuration] = useState(30);
  const [videoPlatform, setVideoPlatform] = useState('tiktok');
  const [videoStyle, setVideoStyle] = useState('fast-paced & energetic');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoScriptResult, setVideoScriptResult] = useState<VideoScriptResponse | null>(null);

  // Batch Content Planner States
  const [plannerBrandId, setPlannerBrandId] = useState('');
  const [plannerTheme, setPlannerTheme] = useState('');
  const [plannerPlatforms, setPlannerPlatforms] = useState<string[]>(['linkedin']);
  const [plannerDays, setPlannerDays] = useState(5);
  const [generatingPlanner, setGeneratingPlanner] = useState(false);
  const [plannerResult, setPlannerResult] = useState<ContentPlannerResponse | null>(null);

  // Batch Export States
  const [exportCampaignId, setExportCampaignId] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Load active brands and campaigns context
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [brandsRes, campaignsRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/campaigns'),
        ]);

        if (!brandsRes.ok || !campaignsRes.ok) {
          throw new Error('Failed to fetch brand/campaign resources');
        }

        const brandsData = await brandsRes.json();
        const campaignsData = await campaignsRes.json();

        if (brandsData.success) {
          setBrands(brandsData.data || []);
          if (brandsData.data && brandsData.data.length > 0) {
            setVideoBrandId(brandsData.data[0].id);
            setPlannerBrandId(brandsData.data[0].id);
          }
        }
        if (campaignsData.success) {
          setCampaigns(campaignsData.data || []);
          if (campaignsData.data && campaignsData.data.length > 0) {
            setExportCampaignId(campaignsData.data[0].id);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError('Could not load workspace presets. Check backend mock database connection.');
      } finally {
        setLoadingContext(false);
      }
    };

    fetchContext();
  }, []);

  // Submit Video Storyboard request
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoBrandId) return;

    setGeneratingVideo(true);
    setVideoScriptResult(null);
    setError(null);

    try {
      const res = await fetch('/api/agents/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: videoBrandId,
          concept: videoConcept,
          duration: videoDuration,
          platform: videoPlatform,
          style: videoStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to compile video script');
      }

      setVideoScriptResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Video script generation failed.');
    } finally {
      setGeneratingVideo(false);
    }
  };

  // Submit Batch Planner request
  const handleGeneratePlanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerBrandId) return;
    if (plannerPlatforms.length === 0) {
      setError('Please select at least one platform target.');
      return;
    }

    setGeneratingPlanner(true);
    setPlannerResult(null);
    setExportSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/agents/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: plannerBrandId,
          theme: plannerTheme,
          platforms: plannerPlatforms,
          days: plannerDays,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate batch calendar');
      }

      setPlannerResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Batch calendar generation failed.');
    } finally {
      setGeneratingPlanner(false);
    }
  };

  // Export batch planner items to scheduled database queue
  const handleBatchExport = async () => {
    if (!exportCampaignId || !plannerResult) return;

    setExporting(true);
    setError(null);

    try {
      const res = await fetch('/api/agents/content/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: exportCampaignId,
          posts: plannerResult.calendar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to export content schedule');
      }

      setExportSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Batch export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handlePlatformCheckbox = (platform: string) => {
    setPlannerPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Creative Studio"
        description="Write high-converting scripts and generate multi-platform social queues via specialized AI director agents."
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start gap-3 text-sm font-sans">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Modernist Navigation Tabs */}
      <div className="flex border-b border-border-custom bg-background/25">
        <button
          onClick={() => setActiveTab('video')}
          className={`px-6 py-3 font-display font-semibold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'video'
              ? 'border-accent text-accent bg-surface/30'
              : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface/10'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>AI Video Scriptwriter</span>
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-6 py-3 font-display font-semibold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'planner'
              ? 'border-accent text-accent bg-surface/30'
              : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface/10'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Batch Calendar Planner</span>
        </button>
      </div>

      {loadingContext ? (
        <div className="py-20 flex items-center justify-center gap-3 text-text-muted text-xs font-mono">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>INITIALIZING STUDIO CONTEXTS...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Tab 1: Video Scriptwriter */}
          {activeTab === 'video' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Form Input Card */}
              <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 neumorphism-card-dark lg:col-span-1">
                <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
                  <Sparkles className="w-4 h-4 text-accent fill-current" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
                    Storyboard parameters
                  </h3>
                </div>

                <form onSubmit={handleGenerateVideo} className="space-y-4 font-sans text-xs">
                  {/* Brand select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      Identity context
                    </label>
                    <select
                      value={videoBrandId}
                      onChange={(e) => setVideoBrandId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm"
                      required
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Concept brief */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      Video idea / product brief
                    </label>
                    <textarea
                      value={videoConcept}
                      onChange={(e) => setVideoConcept(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm resize-none leading-relaxed"
                      placeholder="e.g. Audit checkout speed of an average Shopify brand. Highlight cart abandonment costs and show why merchants need Pulse log."
                      required
                    />
                  </div>

                  {/* Target Platform */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      Target Distribution Channel
                    </label>
                    <select
                      value={videoPlatform}
                      onChange={(e) => setVideoPlatform(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm"
                    >
                      <option value="tiktok">TikTok Video (9:16 Vertical)</option>
                      <option value="instagram">Instagram Reels (9:16 Vertical)</option>
                      <option value="youtube">YouTube Short (9:16 Vertical)</option>
                      <option value="facebook">Facebook Ads (16:9 Landscape)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration slider */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                        Length: {videoDuration}s
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        step="15"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(Number(e.target.value))}
                        className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>

                    {/* Style */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                        Tempo pacing
                      </label>
                      <select
                        value={videoStyle}
                        onChange={(e) => setVideoStyle(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm"
                      >
                        <option value="fast-paced & energetic">Fast & Punchy</option>
                        <option value="slow & cinematic">Slow & Aesthetic</option>
                        <option value="informative & structured">Informative (Dev logs)</option>
                      </select>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="text-[10px] text-text-muted font-mono bg-background/50 border border-border-custom/40 p-2.5 rounded-sm">
                    ⚡ Invoking `video` director agent writes visuals and copy blocks. Estimated cost: ~1,500 credits.
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent-hover text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    disabled={generatingVideo}
                  >
                    {generatingVideo ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling visual storyboard...</span>
                      </>
                    ) : (
                      <>
                        <Tv className="w-3.5 h-3.5 fill-current" />
                        <span>Generate Storyboard script</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Storyboard Script result container */}
              <div className="lg:col-span-2 space-y-6">
                {videoScriptResult ? (
                  <div className="space-y-6">
                    {/* Script Metadata header */}
                    <div className="bg-surface border border-border-custom p-6 rounded-card grid grid-cols-3 gap-6 neumorphism-card-dark font-sans text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                          <Music className="w-3 h-3 text-accent" />
                          <span>Soundtrack track</span>
                        </span>
                        <p className="font-semibold text-text-primary italic">"{videoScriptResult.music}"</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                          <Film className="w-3 h-3 text-accent" />
                          <span>Editing Tempo</span>
                        </span>
                        <p className="font-semibold text-text-primary">{videoScriptResult.editingDirections}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                          <Layers className="w-3 h-3 text-accent" />
                          <span>Call to action</span>
                        </span>
                        <p className="font-semibold text-accent">{videoScriptResult.cta}</p>
                      </div>
                    </div>

                    {/* Timeline scenes flow list */}
                    <div className="space-y-4">
                      <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <Tv className="w-4 h-4 text-accent" />
                        <span>Visual Script Timeline ({videoScriptResult.scenes.length} Scenes)</span>
                      </h4>

                      {/* Hook indicator */}
                      <div className="bg-accent/5 border border-accent/20 rounded-card p-4 text-xs font-sans flex items-start gap-3">
                        <span className="font-mono text-[9px] font-bold bg-accent/20 text-accent px-2 py-0.5 rounded uppercase mt-0.5 shrink-0 tracking-wider">
                          Hook (0-3s)
                        </span>
                        <p className="font-semibold text-text-primary italic leading-relaxed">
                          "{videoScriptResult.hook}"
                        </p>
                      </div>

                      {/* Scene Cards */}
                      <div className="space-y-4">
                        {videoScriptResult.scenes.map((scene) => (
                          <div
                            key={scene.sceneNumber}
                            className="bg-surface border border-border-custom rounded-card overflow-hidden flex flex-col font-sans text-xs hover:border-accent/40 transition-colors"
                          >
                            {/* Scene Header */}
                            <div className="bg-background/40 border-b border-border-custom px-5 py-3 flex items-center justify-between font-mono text-[10px] text-text-muted uppercase">
                              <span className="font-bold text-text-primary">Scene #{scene.sceneNumber}</span>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Camera className="w-3 h-3" />
                                  <span>{scene.cameraAngle}</span>
                                </span>
                                <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-bold">
                                  {scene.duration} Seconds
                                </span>
                              </div>
                            </div>

                            {/* Scene Body Grid */}
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed">
                              {/* Visual Instruction */}
                              <div className="space-y-1">
                                <span className="text-[9px] text-text-muted font-bold font-mono uppercase tracking-wider">
                                  Visual overlays / actions
                                </span>
                                <p className="text-text-primary font-medium">{scene.visual}</p>
                                <span className="text-[9px] text-zinc-500 font-mono block pt-1.5">
                                  Transition: {scene.editingNote}
                                </span>
                              </div>

                              {/* Spoken script */}
                              <div className="space-y-1 border-t md:border-t-0 md:border-l border-border-custom/40 pt-4 md:pt-0 md:pl-5">
                                <span className="text-[9px] text-text-muted font-bold font-mono uppercase tracking-wider">
                                  Voiceover narration
                                </span>
                                <p className="text-text-primary font-mono text-xs leading-relaxed italic bg-background/50 border border-border-custom/30 p-2.5 rounded-sm">
                                  "{scene.voiceover}"
                                </p>
                              </div>
                            </div>

                            {/* Programmatic Midjourney/DALL-E Art Prompts block */}
                            {scene.artPrompt && (
                              <div className="bg-background/20 border-t border-border-custom/30 px-5 py-2.5 flex items-center justify-between text-[10px] font-mono text-text-muted">
                                <span className="truncate max-w-[80%]">
                                  Prompt: <span className="text-zinc-400 italic">"{scene.artPrompt}"</span>
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(scene.artPrompt || '');
                                  }}
                                  className="text-accent hover:underline uppercase font-bold text-[9px] cursor-pointer"
                                >
                                  Copy prompt
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface border border-border-custom rounded-card p-12 text-center text-text-muted font-sans text-xs flex flex-col items-center justify-center min-h-[300px]">
                    <Tv className="w-12 h-12 text-zinc-700/50 mb-3" />
                    <p className="font-semibold text-text-primary uppercase tracking-wider">
                      Storyboard Preview Desk
                    </p>
                    <p className="mt-1 text-text-muted max-w-sm">
                      Input your brand voice and concept criteria, and launch the Creative Director agent to write scene transitions.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 2: Content Planner */}
          {activeTab === 'planner' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Form Input Card */}
              <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 neumorphism-card-dark lg:col-span-1">
                <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
                  <Sparkles className="w-4 h-4 text-accent fill-current" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
                    Batch parameters
                  </h3>
                </div>

                <form onSubmit={handleGeneratePlanner} className="space-y-4 font-sans text-xs">
                  {/* Brand select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      Identity context
                    </label>
                    <select
                      value={plannerBrandId}
                      onChange={(e) => setPlannerBrandId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm"
                      required
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Monthly theme / Objective */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      Monthly campaign theme / topic
                    </label>
                    <textarea
                      value={plannerTheme}
                      onChange={(e) => setPlannerTheme(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm resize-none leading-relaxed"
                      placeholder="e.g. Speed efficiency comparisons. Focus on conversion gains, latency audits, and checkout performance benchmarks."
                      required
                    />
                  </div>

                  {/* Platforms (Checkboxes) */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                      Target Networks
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['linkedin', 'twitter', 'instagram', 'facebook'].map((plat) => (
                        <label
                          key={plat}
                          className="flex items-center gap-2 p-2 bg-background/50 border border-border-custom rounded-sm cursor-pointer select-none hover:bg-background transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={plannerPlatforms.includes(plat)}
                            onChange={() => handlePlatformCheckbox(plat)}
                            className="accent-accent w-3.5 h-3.5 rounded-sm border-border-custom bg-background"
                          />
                          <span className="font-mono text-[9px] uppercase tracking-wider">
                            {plat === 'twitter' ? 'X / Twitter' : plat}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                      Generations count: {plannerDays} Posts
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      step="1"
                      value={plannerDays}
                      onChange={(e) => setPlannerDays(Number(e.target.value))}
                      className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>

                  {/* Info alert */}
                  <div className="text-[10px] text-text-muted font-mono bg-background/50 border border-border-custom/40 p-2.5 rounded-sm">
                    ⚡ Invoking `content` planner agent creates structured post ideas, hooks, and drafts in sequence.
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent-hover text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    disabled={generatingPlanner}
                  >
                    {generatingPlanner ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Planning editorial schedule...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5 fill-current" />
                        <span>Generate Calendar Draft</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Generated calendar output drafts */}
              <div className="lg:col-span-2 space-y-6">
                {plannerResult ? (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Strategy summary notes */}
                    {plannerResult.strategyNotes && (
                      <div className="bg-surface border border-border-custom p-6 rounded-card neumorphism-card-dark font-sans text-xs">
                        <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block mb-1">
                          Agent Strategy Blueprint
                        </span>
                        <p className="text-text-primary leading-relaxed italic">
                          "{plannerResult.strategyNotes}"
                        </p>
                      </div>
                    )}

                    {/* Export Console block */}
                    <div className="bg-surface border border-emerald-500/10 p-5 rounded-card flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-500/5">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">
                          Export Deliverables Queue
                        </span>
                        <p className="text-xs text-text-muted font-sans max-w-md">
                          Review drafts, select target campaign from dropdown, and export all sequential posts into the queue starting from tomorrow.
                        </p>
                      </div>

                      {exportSuccess ? (
                        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-sm flex items-center gap-2 text-xs font-mono">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>EXPORT SUCCESSFUL!</span>
                          <Link href="/calendar" className="underline hover:text-white font-bold ml-1.5 flex items-center gap-0.5">
                            GO TO CALENDAR <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 shrink-0">
                          <select
                            value={exportCampaignId}
                            onChange={(e) => setExportCampaignId(e.target.value)}
                            className="px-3 py-2 bg-background border border-border-custom text-text-primary font-sans text-xs rounded-sm focus:outline-none focus:border-accent"
                            disabled={exporting}
                          >
                            <option value="" disabled>Select campaign...</option>
                            {campaigns.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleBatchExport}
                            disabled={exporting || !exportCampaignId}
                            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-sans font-bold text-xs py-2 px-4 rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            {exporting && <RefreshCw className="w-3 h-3 animate-spin" />}
                            <span>Export Draft Schedule</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Draft Posts Deck */}
                    <div className="space-y-4">
                      <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent" />
                        <span>Editorial Deliverable Drafts ({plannerResult.calendar.length} Posts)</span>
                      </h4>

                      <div className="space-y-4">
                        {plannerResult.calendar.map((post, index) => (
                          <div
                            key={index}
                            className="bg-surface border border-border-custom rounded-card p-5 space-y-3 font-sans text-xs hover:border-accent/40 transition-colors"
                          >
                            <div className="flex items-center justify-between border-b border-border-custom/40 pb-2.5">
                              <div className="flex items-center gap-2">
                                <PlatformBadge platform={post.platform} />
                                <span className="font-mono text-[9px] text-text-muted uppercase bg-zinc-800 px-2 py-0.5 rounded font-bold">
                                  Offset Day {index + 1}
                                </span>
                              </div>
                              <span className="font-mono text-[9px] text-text-muted uppercase">
                                Format: {post.contentType || 'Text'}
                              </span>
                            </div>

                            {/* Concept outline */}
                            {post.concept && (
                              <div className="text-[10px] text-text-muted italic">
                                <span className="font-bold uppercase not-italic text-[8px] font-mono mr-1 text-zinc-500">
                                  Concept Focus:
                                </span>
                                "{post.concept}"
                              </div>
                            )}

                            {/* Hook caption */}
                            <div className="space-y-1.5 leading-relaxed bg-background/40 border border-border-custom/30 p-3.5 rounded-sm">
                              {post.hook && (
                                <p className="font-bold text-text-primary border-b border-border-custom/20 pb-1.5 mb-1.5">
                                  {post.hook}
                                </p>
                              )}
                              <p className="whitespace-pre-line text-text-primary font-sans leading-relaxed">
                                {post.caption}
                              </p>
                              {post.hashtags && post.hashtags.length > 0 && (
                                <p className="font-mono text-[9px] text-accent mt-2">
                                  {post.hashtags.map((h) => `#${h.replace(/#/g, '')}`).join(' ')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface border border-border-custom rounded-card p-12 text-center text-text-muted font-sans text-xs flex flex-col items-center justify-center min-h-[300px]">
                    <Calendar className="w-12 h-12 text-zinc-700/50 mb-3" />
                    <p className="font-semibold text-text-primary uppercase tracking-wider">
                      Batch Calendar Draft Deck
                    </p>
                    <p className="mt-1 text-text-muted max-w-sm">
                      Input your content pillars and target platforms, and launch the Content Strategic agent to compile a multi-day editorial campaign queue.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
