// Location: src/app/(dashboard)/viral-reels/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Video,
  Music,
  Sliders,
  Sparkles,
  Download,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Play,
  Square,
  Volume2,
  Tv,
  Layers,
  ShieldAlert,
  UserCheck,
  DollarSign,
  Cpu
} from 'lucide-react';

interface HashtagSet {
  platform: string;
  tags: string[];
}

export default function ViralReelsPage() {
  // Plan Toggle (to let user test all workflows easily)
  const [userPlan, setUserPlan] = useState<'free' | 'professional' | 'agency'>('free');
  
  // Asset upload states - pre-populated for testing
  const [sourceVideoName, setSourceVideoName] = useState<string | null>('brand_keynote_raw.mp4');
  const [voiceoverName, setVoiceoverName] = useState<string | null>('vocal_voiceover_clone_en.wav');
  const [bgMusicName, setBgMusicName] = useState<string | null>('swiss_minimalist_beats.mp3');
  const [coverPhotoName, setCoverPhotoName] = useState<string | null>('thumbnail_high_contrast.png');

  // Reel Configuration states
  const [inputLengthMin, setInputLengthMin] = useState(15); // minutes
  const [targetLengthSec, setTargetLengthSec] = useState(60); // seconds
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram']);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9' | '4:5'>('9:16');
  const [captionStyle, setCaptionStyle] = useState('kinetic-highlight'); // kinetic-highlight, minimal-block, outline-clean
  const [watermarkActive, setWatermarkActive] = useState(true);
  const [colorPreset, setColorPreset] = useState('cinematic'); // cinematic, mono, gold-hour, cyberpunk, vibrant, none
  const [exportResolution, setExportResolution] = useState<'1080p' | '4k' | '8k'>('1080p');

  // Token management simulation states
  const [dailyTokensUsed, setDailyTokensUsed] = useState(35);
  const [maxDailyTokens, setMaxDailyTokens] = useState(100);
  const [generationCost, setGenerationCost] = useState(20);

  // Playback & compilation simulation states
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [captionText, setCaptionText] = useState('Hit "Generate Viral Reel" to slice video and build subtitles.');
  const [copiedTags, setCopiedTags] = useState(false);
  
  const [showUpsellAlert, setShowUpsellAlert] = useState<string | null>(null);
  
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync watermark toggle based on plan changes
  useEffect(() => {
    if (userPlan === 'free') {
      setWatermarkActive(true);
      setMaxDailyTokens(100);
      setExportResolution('1080p');
    } else if (userPlan === 'professional') {
      setMaxDailyTokens(5000);
      if (exportResolution === '8k') setExportResolution('4k');
    } else {
      setMaxDailyTokens(999999); // Unlimited
    }
  }, [userPlan]);

  // Platform specific hashtags matrix
  const platformHashtags: Record<string, string[]> = {
    tiktok: ['#TikTokViral', '#FYP', '#ForYouPage', '#TrendingVideo', '#AICut', '#ReelGrowth'],
    instagram: ['#ReelsInstagram', '#ExplorePage', '#ViralContent', '#MarketingGrowth', '#AICreative', '#InstaReels'],
    youtube: ['#Shorts', '#YouTubeShorts', '#ViralShorts', '#AIEditing', '#TrendingShorts', '#CreatorCapital'],
    facebook: ['#FBReels', '#ReelsVideo', '#ViralFB', '#BusinessStrategy', '#CreativeReach'],
    linkedin: ['#ProfessionalGrowth', '#B2BMarketing', '#VideoStrategy', '#AIInnovation', '#Leadership']
  };

  // Preset caption sequence for live video preview
  const captionSequence = [
    "🚀 STOP SCROLLING! This 1 rule will scale your brand in 2026...",
    "📊 Most founders waste $10k monthly on generic campaign channels...",
    "💡 The secret is logical multi-tenant strategy orchestration...",
    "🔥 Synthesize voice clones, automate calendars, and win!",
    "📈 Double your conversion rates by deploying Brandavox AI now."
  ];

  // Live video playback timer simulation
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = setInterval(() => {
        setPlaybackTime((prev) => {
          const next = prev + 1;
          const slideIndex = Math.floor(next / 3) % captionSequence.length;
          setCaptionText(captionSequence[slideIndex]);
          return next;
        });
      }, 1000);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying]);

  const handleTogglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  // Mock File Upload Triggers
  const handleUploadMock = (type: 'video' | 'voiceover' | 'music' | 'cover') => {
    const mockData = {
      video: ['brand_keynote_raw.mp4', 'founder_interview_30m.mov', 'strategy_workshop_1h.mp4'],
      voiceover: ['vocal_voiceover_clone_en.wav', 'slang_pidgin_voiceover.mp3', 'narration_draft.wav'],
      music: ['swiss_minimalist_beats.mp3', 'lofi_study_loop.wav', 'corporate_hype_music.mp3'],
      cover: ['thumbnail_high_contrast.png', 'hook_face_snapshot.jpg', 'frame_extract_5s.jpg']
    };

    const files = mockData[type];
    const chosenFile = files[Math.floor(Math.random() * files.length)];

    if (type === 'video') setSourceVideoName(chosenFile);
    if (type === 'voiceover') setVoiceoverName(chosenFile);
    if (type === 'music') setBgMusicName(chosenFile);
    if (type === 'cover') setCoverPhotoName(chosenFile);
  };

  // Reel compiler logic
  const handleGenerateReel = () => {
    if (!sourceVideoName) {
      alert("Please upload a source video to analyze.");
      return;
    }

    // Check Token Limit for Free Tier
    if (userPlan === 'free' && dailyTokensUsed + generationCost > maxDailyTokens) {
      alert("Insufficient daily tokens. Upgrade your plan to unlock unlimited token capabilities.");
      return;
    }

    setIsCompiling(true);
    setCompilationProgress(0);
    setCompilationLogs([]);
    setIsPlaying(false);
    setPlaybackTime(0);

    const logs = [
      `[TRANSCRIPT] Transcribing raw video feed '${sourceVideoName}'...`,
      `[ANALYSIS] Inspecting vocal spikes and keyframe movement indicators...`,
      `[SLICE] Slicing video from ${inputLengthMin} minutes to target ${targetLengthSec}s highlight clip.`,
      `[AUDIO] Merging voiceover (${voiceoverName || 'none'}) and background music (${bgMusicName || 'none'}) tracks.`,
      `[COLOR] Injecting '${colorPreset}' color grading matrix. Scaling parameters to ${exportResolution.toUpperCase()} quality.`,
      `[CAPTIONS] Drawing kinetic caption tracks with style overlay '${captionStyle}'...`,
      userPlan === 'free' ? `[WATERMARK] Adding mandatory 'Created by Brandavox' visual overlay.` : `[WATERMARK] Bypassing watermark insertion (Premium bypass authorized).`,
      `[OUTPUT] Video compilation completed successfully. Output ready for rendering preview.`
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 12.5;
      setCompilationProgress(currentProgress);
      
      const logIdx = Math.floor(currentProgress / 12.5) - 1;
      if (logs[logIdx]) {
        setCompilationLogs((prev) => [...prev, logs[logIdx]]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsCompiling(false);
        setDailyTokensUsed((prev) => prev + generationCost);
        setIsPlaying(true);
      }
    }, 375); // 375ms * 8 = 3.0 seconds compilation duration
  };

  const handleExportReel = () => {
    // Check constraints based on user plan
    if (userPlan === 'free' && (exportResolution === '4k' || exportResolution === '8k')) {
      setShowUpsellAlert("4K and 8K video rendering is reserved for Professional and Agency tiers.");
      return;
    }
    if (userPlan === 'professional' && exportResolution === '8k') {
      setShowUpsellAlert("8K Master video exporting requires the Agency tier.");
      return;
    }
    if (userPlan === 'free' && !watermarkActive) {
      setShowUpsellAlert("Removing the 'Created by Brandavox' watermark requires a paid subscription.");
      return;
    }

    // Check aspect ratio limits by plan
    if (userPlan === 'free' && (aspectRatio === '16:9' || aspectRatio === '4:5')) {
      setShowUpsellAlert("Landscape and square layout formats are restricted to paid subscription tiers.");
      return;
    }

    alert(`Viral Reel exported successfully! Output file: brandavox_reel_${aspectRatio.replace(':', '_')}_${exportResolution}.mp4`);
  };

  // Compile active platform tags
  const getCombinedHashtags = () => {
    let tags: string[] = [];
    selectedPlatforms.forEach((platform) => {
      if (platformHashtags[platform]) {
        tags = [...tags, ...platformHashtags[platform]];
      }
    });
    // Remove duplicates
    return Array.from(new Set(tags)).join(' ');
  };

  const handleCopyTags = () => {
    navigator.clipboard.writeText(getCombinedHashtags());
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  // CSS Filter styles mapped to Color Presets
  const colorFilterStyles: Record<string, string> = {
    cinematic: 'contrast(1.25) saturate(1.15) hue-rotate(4deg)',
    mono: 'grayscale(1) contrast(1.4) brightness(0.95)',
    'gold-hour': 'sepia(0.35) saturate(1.4) contrast(1.1) hue-rotate(-6deg)',
    cyberpunk: 'hue-rotate(85deg) saturate(1.9) contrast(1.3) brightness(1.05)',
    vibrant: 'saturate(1.7) contrast(1.15) brightness(1.02)',
    none: 'none'
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <PageHeader
          title="Viral Reels & Shorts Creator"
          description="Slice raw videos of any length into high-hook viral reels, configure audio overlays, color grade in 8K, and generate trending hashtags."
        />
        {/* Plan Select Toggle Panel */}
        <div className="bg-surface border border-border-custom p-1.5 rounded flex gap-1.5 items-center font-mono text-[9px] uppercase">
          <span className="text-text-muted px-2">PLAN TIER:</span>
          {['free', 'professional', 'agency'].map((tier) => (
            <button
              key={tier}
              onClick={() => {
                setUserPlan(tier as any);
                setShowUpsellAlert(null);
              }}
              className={`px-2 py-1 border rounded-sm cursor-pointer font-bold ${
                userPlan === tier
                  ? 'border-accent bg-accent text-white'
                  : 'border-border-custom hover:border-accent text-text-primary bg-background'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {showUpsellAlert && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start justify-between gap-3 text-xs font-sans">
          <div className="flex gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase block">Plan restriction warning</span>
              <p className="mt-0.5">{showUpsellAlert}</p>
            </div>
          </div>
          <button
            onClick={() => setShowUpsellAlert(null)}
            className="p-1 border border-border-custom rounded hover:border-accent hover:text-accent cursor-pointer font-bold text-[10px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column 1: Config Drawer */}
        <div className="lg:col-span-4 bg-surface border border-border-custom p-6 rounded-card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Sliders className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
              Reel Parameters
            </h3>
          </div>

          <div className="space-y-4">
            {/* Video Input uploader */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-text-muted font-bold uppercase block">Source Video</label>
              {sourceVideoName ? (
                <div className="p-2.5 bg-background border border-emerald-500/20 text-emerald-400 font-mono text-[9px] rounded flex justify-between items-center break-all gap-2">
                  <span className="truncate">{sourceVideoName}</span>
                  <button
                    onClick={() => setSourceVideoName(null)}
                    className="text-red-400 hover:text-red-300 font-bold cursor-pointer shrink-0"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleUploadMock('video')}
                  className="border border-dashed border-border-custom hover:border-accent p-4 rounded text-center cursor-pointer bg-background/50 hover:bg-background transition-all"
                >
                  <Upload className="w-4 h-4 text-accent mx-auto mb-1.5" />
                  <span className="font-mono text-[8px] text-text-primary uppercase font-bold">Select Video File</span>
                </div>
              )}
            </div>

            {/* Target length settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase block">Input Length: {inputLengthMin}m</label>
                <input
                  type="range"
                  min="1"
                  max="180"
                  value={inputLengthMin}
                  onChange={(e) => setInputLengthMin(Number(e.target.value))}
                  className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase block">Target Reels: {targetLengthSec}s</label>
                <input
                  type="range"
                  min="5"
                  max="1800"
                  step="5"
                  value={targetLengthSec}
                  onChange={(e) => setTargetLengthSec(Number(e.target.value))}
                  className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>

            {/* Platform multi-select */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-text-muted font-bold uppercase block">Target Platforms</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'TikTok', value: 'tiktok' },
                  { name: 'Instagram', value: 'instagram' },
                  { name: 'YouTube', value: 'youtube' },
                  { name: 'Facebook', value: 'facebook' },
                  { name: 'LinkedIn', value: 'linkedin' }
                ].map((plat) => {
                  const isActive = selectedPlatforms.includes(plat.value);
                  return (
                    <button
                      key={plat.value}
                      onClick={() => handleTogglePlatform(plat.value)}
                      className={`px-2 py-1 border font-mono text-[8px] uppercase rounded-sm cursor-pointer transition-all ${
                        isActive
                          ? 'border-accent bg-accent text-white font-bold'
                          : 'border-border-custom hover:border-accent text-text-muted bg-background'
                      }`}
                    >
                      {plat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtitles & watermark configurations */}
            <div className="grid grid-cols-2 gap-3 border-t border-border-custom/50 pt-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase block">Captions Style</label>
                <select
                  value={captionStyle}
                  onChange={(e) => setCaptionStyle(e.target.value)}
                  className="w-full px-2 py-1.5 bg-background border border-border-custom text-text-primary rounded-sm"
                >
                  <option value="kinetic-highlight">Kinetic Highlight (Yellow)</option>
                  <option value="minimal-block">Minimalist Black Block</option>
                  <option value="outline-clean">Clean Monospaced Outline</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase block">Watermark</label>
                <button
                  onClick={() => {
                    if (userPlan !== 'free') {
                      setWatermarkActive(!watermarkActive);
                    } else {
                      setShowUpsellAlert("Free Plan users are required to display the Brandavox watermark.");
                    }
                  }}
                  className={`w-full py-1.5 border font-mono text-[8px] uppercase rounded-sm cursor-pointer transition-all ${
                    watermarkActive
                      ? 'border-accent bg-accent/5 text-accent font-bold'
                      : 'border-border-custom hover:border-accent text-text-muted bg-background'
                  }`}
                >
                  {watermarkActive ? "Watermark Burned" : "Bypassed"}
                </button>
              </div>
            </div>

            {/* Custom Background Music / voiceover MIX audio tracks */}
            <div className="space-y-3 border-t border-border-custom/50 pt-4">
              <span className="font-mono text-[9px] text-text-primary uppercase tracking-widest font-bold block">
                Audio & Thumbnail custom overlays
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Voiceover file */}
                <div className="space-y-1">
                  <label className="text-[8px] text-text-muted font-bold uppercase block">Voiceover file</label>
                  {voiceoverName ? (
                    <div className="p-1 bg-background border border-border-custom rounded font-mono text-[8px] text-text-primary flex justify-between items-center">
                      <span className="truncate max-w-[80px]">{voiceoverName}</span>
                      <button onClick={() => setVoiceoverName(null)} className="text-red-400 font-bold ml-1 cursor-pointer">×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadMock('voiceover')}
                      className="w-full py-1 bg-background border border-border-custom hover:border-accent rounded text-[8px] font-mono text-text-primary cursor-pointer uppercase font-bold"
                    >
                      Upload Voice
                    </button>
                  )}
                </div>

                {/* Background music */}
                <div className="space-y-1">
                  <label className="text-[8px] text-text-muted font-bold uppercase block">Background music</label>
                  {bgMusicName ? (
                    <div className="p-1 bg-background border border-border-custom rounded font-mono text-[8px] text-text-primary flex justify-between items-center">
                      <span className="truncate max-w-[80px]">{bgMusicName}</span>
                      <button onClick={() => setBgMusicName(null)} className="text-red-400 font-bold ml-1 cursor-pointer">×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadMock('music')}
                      className="w-full py-1 bg-background border border-border-custom hover:border-accent rounded text-[8px] font-mono text-text-primary cursor-pointer uppercase font-bold"
                    >
                      Upload Music
                    </button>
                  )}
                </div>

                {/* Cover photo */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[8px] text-text-muted font-bold uppercase block">Cover Photo / Thumbnail</label>
                  {coverPhotoName ? (
                    <div className="p-1.5 bg-background border border-border-custom rounded font-mono text-[8px] text-text-primary flex justify-between items-center">
                      <span className="truncate">{coverPhotoName}</span>
                      <button onClick={() => setCoverPhotoName(null)} className="text-red-400 font-bold cursor-pointer">×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadMock('cover')}
                      className="w-full py-1.5 bg-background border border-border-custom hover:border-accent rounded text-[8px] font-mono text-text-primary cursor-pointer uppercase font-bold"
                    >
                      Upload Cover Thumbnail
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Color grading presets & Resolution locks */}
            <div className="grid grid-cols-2 gap-3 border-t border-border-custom/50 pt-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase block">AI Color Grade</label>
                <select
                  value={colorPreset}
                  onChange={(e) => setColorPreset(e.target.value)}
                  className="w-full px-2 py-1.5 bg-background border border-border-custom text-text-primary rounded-sm"
                >
                  <option value="cinematic">Cinematic Teal & Orange</option>
                  <option value="mono">Swiss Monochrome (High Contrast)</option>
                  <option value="gold-hour">Golden Hour Warmth</option>
                  <option value="cyberpunk">Cyberpunk Neon</option>
                  <option value="vibrant">Vibrant Creative</option>
                  <option value="none">Raw Original Feed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-text-muted font-bold uppercase block">Export Resolution</label>
                <select
                  value={exportResolution}
                  onChange={(e) => setExportResolution(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-background border border-border-custom text-text-primary rounded-sm"
                >
                  <option value="1080p">1080p HD</option>
                  <option value="4k">4K Ultra HD (Pro)</option>
                  <option value="8k">8K Master Quality (Agency)</option>
                </select>
              </div>
            </div>

            {/* Layout Aspect ratio selectors */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[9px] text-text-muted font-bold uppercase block">Video Ratio Dimensions</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-background border border-border-custom text-text-primary rounded-sm"
              >
                <option value="9:16">9:16 Portrait (Reels/TikTok/Shorts)</option>
                <option value="1:1">1:1 Square Layout (Instagram Grid)</option>
                <option value="16:9">16:9 Landscape Layout (Widescreen)</option>
                <option value="4:5">4:5 Vertical Portrait (Facebook/LinkedIn)</option>
              </select>
            </div>

            {/* Main compile button */}
            <button
              onClick={handleGenerateReel}
              disabled={isCompiling || !sourceVideoName}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider font-bold rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Slicing Highlight {compilationProgress.toFixed(0)}%...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Viral Reel (20 Tokens)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Column 2: Video Preview slate & logs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main video preview viewport */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider">
                Video Preview monitor — {aspectRatio} ratio
              </span>
              {isPlaying && (
                <span className="text-[9px] text-accent font-mono font-bold animate-pulse uppercase">
                  ● SIMULATED PLAYBACK (Filter: {colorPreset})
                </span>
              )}
            </div>

            {/* Viewport Frame mapping aspect ratios */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden flex items-center justify-center relative min-h-[360px] aspect-video">
              
              {/* Dynamic canvas grid based on aspect ratio */}
              <div 
                style={{ filter: colorFilterStyles[colorPreset] }}
                className={`transition-all bg-zinc-900 border border-zinc-800 relative flex flex-col justify-between p-4 overflow-hidden duration-300 ${
                  aspectRatio === '9:16' ? 'aspect-[9/16] h-[340px]' :
                  aspectRatio === '1:1' ? 'aspect-square h-[300px]' :
                  aspectRatio === '4:5' ? 'aspect-[4/5] h-[320px]' :
                  'w-full aspect-video h-[300px]'
                }`}
              >
                {/* Real abstract video background playing loop */}
                {isPlaying && (
                  <video
                    src="https://assets.mixkit.co/videos/preview/mixkit-geometric-shapes-of-orange-and-blue-colors-43093-large.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen pointer-events-none"
                  />
                )}
                {/* Simulated frame particles */}
                <div className="absolute inset-0 opacity-15 pointer-events-none grid grid-cols-6 grid-rows-6">
                  {Array.from({ length: 36 }).map((_, idx) => (
                    <div key={idx} className="border-[0.5px] border-zinc-500 border-dashed" />
                  ))}
                </div>

                {/* Header indicators */}
                <div className="flex justify-between items-center z-10 font-mono text-[8px] text-zinc-400">
                  <span>00:{playbackTime < 10 ? `0${playbackTime}` : playbackTime} / {targetLengthSec}s</span>
                  {watermarkActive && (
                    <span className="bg-zinc-950/70 px-1.5 py-0.5 border border-border-custom rounded text-accent font-bold uppercase text-[7px]">
                      Created by Brandavox
                    </span>
                  )}
                </div>

                {/* Middle vector graphic representing human speech focus */}
                <div className="flex-1 flex items-center justify-center z-10">
                  {isPlaying ? (
                    <div className="flex gap-1.5 items-end justify-center h-8">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-accent rounded-full animate-bounce"
                          style={{
                            height: `${Math.sin(playbackTime * i) * 20 + 24}px`,
                            animationDelay: `${i * 80}ms`,
                            animationDuration: '0.6s'
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Tv className="w-12 h-12 text-zinc-700 animate-pulse" />
                  )}
                </div>

                {/* Captions burns */}
                <div className="w-full text-center pb-2 z-10 px-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-sans font-bold leading-normal text-center shadow-lg ${
                    captionStyle === 'kinetic-highlight' ? 'bg-yellow-400 text-black' :
                    captionStyle === 'minimal-block' ? 'bg-zinc-950 text-white border border-border-custom' :
                    'bg-transparent text-white border-2 border-accent uppercase'
                  }`}>
                    {captionText}
                  </span>
                </div>
              </div>

            </div>

            {/* Playback action controls bar */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <button
                  disabled={isCompiling || !sourceVideoName}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-zinc-900 border border-border-custom text-text-primary hover:border-accent rounded-sm shrink-0 cursor-pointer flex items-center justify-center disabled:opacity-40"
                >
                  {isPlaying ? <Square className="w-3.5 h-3.5 fill-current text-accent" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
                <span className="text-[9px] font-mono text-text-muted">
                  {isPlaying ? '● Preview Playing' : '■ Preview Paused'}
                </span>
              </div>

              <button
                disabled={isCompiling || !sourceVideoName}
                onClick={handleExportReel}
                className="py-1.5 px-3 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Video ({exportResolution})</span>
              </button>
            </div>
          </div>

          {/* Platform specific generated tags & copy box */}
          {selectedPlatforms.length > 0 && (
            <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
              <div className="flex items-center justify-between border-b border-border-custom pb-3">
                <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>AI Generated Platform Hashtags</span>
                </span>
                <button
                  onClick={handleCopyTags}
                  className="py-1 px-2 border border-border-custom hover:border-accent text-text-primary rounded-sm font-mono text-[9px] uppercase flex items-center gap-1 cursor-pointer transition-all"
                >
                  {copiedTags ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTags ? 'Copied' : 'Copy hashtags'}</span>
                </button>
              </div>
              <div className="p-3 bg-background border border-border-custom rounded-sm font-mono text-[10px] text-zinc-300 leading-normal whitespace-pre-wrap select-all">
                {getCombinedHashtags()}
              </div>
            </div>
          )}

          {/* Token telemetry and compiler logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Daily Token meter panel */}
            <div className="bg-surface border border-border-custom p-5 rounded-card space-y-4">
              <span className="font-mono text-[9px] text-text-primary uppercase tracking-widest font-bold block border-b border-border-custom/30 pb-1.5">
                Token Usage Telemetry
              </span>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start font-mono text-[10px]">
                  <div>
                    <span className="font-bold text-text-primary block">Daily Token Balance</span>
                    <span className="text-[8px] text-text-muted">Usage limits refresh every 24 hours</span>
                  </div>
                  <span className="font-bold text-accent">
                    {dailyTokensUsed} / {userPlan === 'agency' ? 'Unlimited' : maxDailyTokens}
                  </span>
                </div>

                <div className="w-full h-2 bg-border-custom rounded-full overflow-hidden">
                  <div 
                    style={{ width: userPlan === 'agency' ? '10%' : `${(dailyTokensUsed / maxDailyTokens) * 100}%` }}
                    className="h-full bg-accent transition-all duration-500" 
                  />
                </div>

                <div className="bg-background/50 border border-border-custom/40 p-2.5 rounded text-[9px] font-mono text-text-muted space-y-1.5 leading-normal">
                  <div className="flex justify-between">
                    <span>Active Plan Status:</span>
                    <span className="font-bold text-text-primary uppercase">{userPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reel Compile Cost:</span>
                    <span>{generationCost} Tokens</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Neural compile logs */}
            <div className="bg-surface border border-border-custom p-5 rounded-card font-mono text-[9px] space-y-3">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border-custom/60">
                <Cpu className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-wider font-mono">AI Compilation Logs</span>
              </div>

              <div className="space-y-1.5 text-zinc-400 max-h-[90px] overflow-y-auto pr-1">
                {compilationLogs.length > 0 ? (
                  compilationLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed font-mono">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-600 italic font-mono">
                    Waiting to compile video highlights...
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
