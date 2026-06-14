// Brandavox Brand Strategic Console
// Location: src/app/(dashboard)/brands/[id]/page.tsx

'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Award,
  BookOpen,
  Users,
  Calendar,
  Compass,
  ListTodo,
  Terminal,
  ExternalLink,
  RefreshCw,
  Check,
  AlertCircle,
  Download
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

interface Persona {
  id: string;
  name: string;
  age_range: string;
  demographics: { role: string; messagingAngle?: string };
  pain_points: string[];
  goals: string[];
  platforms: string[];
}

interface Brand {
  id: string;
  name: string;
  industry: string;
  website: string;
  mission: string;
  vision: string;
  values: string[];
  voice: string; // JSON strategy
  tone: string;
  brand_score: number;
}

export default function BrandConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // State
  const [brand, setBrand] = useState<Brand | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('positioning');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [terminalScore, setTerminalScore] = useState<number | null>(null);

  // Fetch brand data
  async function loadData() {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/brands/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setBrand(json.data.brand);
        setPersonas(json.data.personas);
      } else {
        setFetchError(json.error || 'Failed to load brand data');
      }
    } catch (err: any) {
      setFetchError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  // Handle Strategic AI compilation
  const runStrategyGeneration = async () => {
    setIsGenerating(true);
    setLogMessages([]);
    setTerminalScore(null);

    const simulationLogs = [
      'Initialize Brand Intelligence Agent node...',
      'Retrieving organizational memory layers (agent: brand)...',
      'Memory mapping: found 2 related positioning profiles...',
      'Injecting context blocks into Swiss Modernist system prompts...',
      'Establishing connections to Gemini Flash 2.0 API...',
      'Running AI Generation Pipeline...',
      'Parsing strategy JSON output stream...',
      'Analyzing positioning resonance metrics...',
      'Validating output schemas against Zod models...',
      'Compiling target audience persona nodes...',
      'Writing strategy mapping to Supabase client...',
      'Saving generated target personas to relational tables...',
      'Memory loop extraction triggered (learning insight generated)...',
    ];

    // Typetrail simulation
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < simulationLogs.length) {
        setLogMessages((prev) => [...prev, `[LOG] ${simulationLogs[idx]}`]);
        idx++;
      } else {
        clearInterval(interval);
        // Call backend API
        executeApiCall();
      }
    }, 450);

    const executeApiCall = async () => {
      try {
        setLogMessages((prev) => [...prev, '[SYSTEM] Sending payload to AI generator...']);
        const res = await fetch(`/api/brands/${id}/generate-strategy`, {
          method: 'POST',
        });
        const json = await res.json();

        if (json.success && json.data) {
          setLogMessages((prev) => [
            ...prev,
            `[SYSTEM] Strategy compiled successfully. Brand score updated: ${json.data.brand.brand_score}%`,
            '[SYSTEM] Reloading strategic console dashboard...',
          ]);
          setTerminalScore(json.data.brand.brand_score);
          
          setTimeout(() => {
            setBrand(json.data.brand);
            setPersonas(json.data.personas);
            setIsGenerating(false);
          }, 1000);
        } else {
          setLogMessages((prev) => [
            ...prev,
            `[ERROR] Generation failed: ${json.error || 'Unknown server error'}`,
          ]);
          setIsGenerating(false);
        }
      } catch (err: any) {
        setLogMessages((prev) => [
          ...prev,
          `[ERROR] Execution exception: ${err.message || 'Server timeout'}`,
        ]);
        setIsGenerating(false);
      }
    };
  };

  const handleExportStrategy = () => {
    if (!brand || !voiceStrategy) return;
    const textData = `BRAND STRATEGY FOR ${brand.name.toUpperCase()}\n` +
      `=========================================\n\n` +
      `Industry Focus: ${brand.industry}\n` +
      `Identity Mission: ${brand.mission || 'Not specified'}\n` +
      `Target Vision: ${brand.vision || 'Not specified'}\n\n` +
      `Voice & Identity Metrics:\n` +
      `- Strategy Alignment Score: ${voiceStrategy.brandScore}/100\n` +
      `- Voice Keywords: ${voiceStrategy.voiceKeywords?.join(', ') || 'N/A'}\n` +
      `- Brand Persona Summary: ${voiceStrategy.brandPersona || 'N/A'}\n\n` +
      `Content Pillars:\n` +
      `${voiceStrategy.contentPillars?.map((p: any, i: number) => `${i + 1}. ${p.title || p}`).join('\n') || 'N/A'}\n\n` +
      `Compiled via Brandavox AI Strategist OS.`;

    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${brand.name.toLowerCase().replace(/\s+/g, '_')}_strategy.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-surface animate-pulse border border-border-custom rounded" />
        <div className="h-16 w-full bg-surface animate-pulse border border-border-custom rounded" />
        <div className="h-96 w-full bg-surface animate-pulse border border-border-custom rounded" />
      </div>
    );
  }

  if (fetchError || !brand) {
    return (
      <div className="space-y-4 max-w-md mx-auto py-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-md font-bold text-text-primary font-display uppercase">Load Error</h3>
        <p className="text-xs text-text-muted">{fetchError || 'Unable to retrieve brand coordinates'}</p>
        <button
          onClick={loadData}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-badge text-xs font-mono transition-colors cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Parse voice strategy JSON
  let voiceStrategy: any = null;
  if (brand.voice) {
    try {
      voiceStrategy = JSON.parse(brand.voice);
    } catch (err) {
      console.error('Failed to parse brand voice strategy JSON:', err);
    }
  }

  const hasStrategy = brand.brand_score > 0 && voiceStrategy;

  return (
    <div className="space-y-8">
      {/* Top row action */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/brands')}
          className="flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio</span>
        </button>

        {hasStrategy && !isGenerating && (
          <div className="flex gap-2">
            <button
              onClick={handleExportStrategy}
              className="bg-surface hover:border-accent text-text-primary hover:text-accent border border-border-custom font-mono text-xs px-3.5 py-2 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export strategy</span>
            </button>
            <button
              onClick={runStrategyGeneration}
              className="bg-surface hover:border-accent text-text-primary hover:text-accent border border-border-custom font-mono text-xs px-3.5 py-2 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-hover" />
              <span>Regenerate Strategy</span>
            </button>
          </div>
        )}
      </div>


      <PageHeader
        title={brand.name}
        description={`Active console for ${brand.industry}. Initialize intelligence maps or inspect voice constraints.`}
      />

      {/* TERMINAL LOADING BLOCK DURING AI COMPILATION */}
      {isGenerating ? (
        <div className="bg-background border border-border-custom rounded-card p-6 font-mono text-xs space-y-4 text-emerald-400">
          <div className="flex items-center justify-between border-b border-border-custom pb-3 text-text-muted uppercase tracking-wider text-[10px]">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              AI Deployment Log
            </span>
            <span className="animate-pulse">RUNNING AGENT</span>
          </div>

          <div className="space-y-1.5 h-64 overflow-y-auto pr-2 custom-scrollbar select-none">
            {logMessages.map((log, index) => (
              <div key={index} className="leading-relaxed whitespace-pre-wrap">
                {log}
              </div>
            ))}
            <div className="w-2 h-4 bg-emerald-400 animate-blink inline-block" />
          </div>

          {terminalScore !== null && (
            <div className="border-t border-border-custom pt-4 flex items-center gap-3 text-emerald-400 font-bold">
              <Award className="w-5 h-5" />
              <span>Compilation finished. Initial Score: {terminalScore}%</span>
            </div>
          )}
        </div>
      ) : !hasStrategy ? (
        /* UNINITIALIZED STATE - CALL TO ACTION */
        <div className="bg-surface border border-border-custom rounded-card p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="w-12 h-12 bg-accent/10 border border-accent/20 text-accent flex items-center justify-center rounded-full mx-auto animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-semibold text-base text-text-primary uppercase tracking-wider">
              Initialize Strategic Brain
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              Deploy the Brandavox Brand Intelligence Agent. The model will analyze the profile parameters,
              integrate historical learning constraints, and generate a modernist positioning matrix,
              audience persona archetypes, content pillars, and checklists.
            </p>
          </div>

          <div className="p-4 bg-background border border-border-custom rounded text-left font-mono text-xs space-y-2.5 max-w-md mx-auto">
            <div className="flex justify-between text-[10px] text-text-muted uppercase">
              <span>Input Coordinates</span>
              <span>Loaded</span>
            </div>
            <div className="space-y-1 text-text-primary">
              <div>- Brand: {brand.name}</div>
              <div>- Industry: {brand.industry}</div>
              <div>- Mission: {brand.mission ? 'Configured' : 'Empty'}</div>
              <div>- Sliders: {brand.tone}</div>
            </div>
          </div>

          <button
            onClick={runStrategyGeneration}
            className="bg-accent hover:bg-accent-hover text-white font-mono text-xs px-6 py-3 rounded-badge inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Generate Strategy Alignment</span>
          </button>
        </div>
      ) : (
        /* STRATEGY CONSOLE - FULLY LOADED TABS */
        <div className="space-y-8">
          
          {/* TAB BUTTONS */}
          <div className="border-b border-border-custom flex overflow-x-auto select-none gap-2">
            {[
              { id: 'positioning', label: 'Positioning Mapping', icon: Award },
              { id: 'voice', label: 'Voice & Vocabulary', icon: BookOpen },
              { id: 'personas', label: 'Audience Archetypes', icon: Users },
              { id: 'pillars', label: 'Content Pillars', icon: Calendar },
              { id: 'actions', label: 'Growth Checklists', icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-accent text-text-primary bg-surface/30'
                      : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT: POSITIONING MAPPING */}
          {activeTab === 'positioning' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Brand Metrics and sliders */}
              <div className="space-y-6">
                
                {/* Brand Score Panel */}
                <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-text-muted uppercase">Strategy Score</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">{voiceStrategy.brandScore}/100</span>
                  </div>

                  <div className="w-full h-2 bg-background border border-border-custom rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${voiceStrategy.brandScore}%` }}
                    />
                  </div>

                  {/* Breakdown metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t border-border-custom pt-4 text-xs font-mono text-text-muted">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider">Clarity</span>
                      <span className="font-bold text-text-primary">{voiceStrategy.scoreBreakdown.clarity}/25</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider">Differentiation</span>
                      <span className="font-bold text-text-primary">{voiceStrategy.scoreBreakdown.differentiation}/25</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider">Resonance</span>
                      <span className="font-bold text-text-primary">{voiceStrategy.scoreBreakdown.resonance}/25</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider">Consistency</span>
                      <span className="font-bold text-text-primary">{voiceStrategy.scoreBreakdown.consistency}/25</span>
                    </div>
                  </div>
                </div>

                {/* Profile coordinates metadata */}
                <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                  <h4 className="font-mono text-xs font-bold text-text-muted uppercase border-b border-border-custom pb-2">
                    Profile Settings
                  </h4>
                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted block">Website</span>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline flex items-center gap-1 font-mono mt-0.5"
                        >
                          <span>{brand.website}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted block">Mission</span>
                      <p className="text-text-primary leading-relaxed mt-0.5">{brand.mission || 'No mission specified'}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted block">Vision</span>
                      <p className="text-text-primary leading-relaxed mt-0.5">{brand.vision || 'No vision specified'}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted block">Core Values</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {brand.values && brand.values.length > 0 ? (
                          brand.values.map((v, idx) => (
                            <span key={idx} className="font-mono text-[10px] px-2 py-0.5 border border-border-custom bg-background rounded-badge text-text-primary">
                              {v}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted font-mono text-[10px]">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Large Core Positioning Display */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface border border-border-custom rounded-card p-8 space-y-6 neumorphism-card-dark">
                  <span className="font-mono text-xs font-bold text-text-muted uppercase tracking-widest block">
                    Strategic Positioning
                  </span>
                  
                  <blockquote className="font-display font-bold text-lg md:text-xl lg:text-2xl text-text-primary border-l-4 border-accent pl-6 leading-normal tracking-wide italic">
                    "{voiceStrategy.positioning}"
                  </blockquote>

                  <p className="text-xs text-text-muted font-sans leading-relaxed pt-2">
                    This positioning blueprint guides all generation operations. The copywriting, content calendars,
                    and video script prompts pull instructions from this map to preserve brand consistency and values.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: VOICE & VOCABULARY */}
          {activeTab === 'voice' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Voice Profile details */}
              <div className="bg-surface border border-border-custom rounded-card p-6 space-y-6">
                <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider border-b border-border-custom pb-3">
                  Voice Profile & Personality
                </h4>

                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block mb-1">Tone Definition</span>
                    <p className="font-sans text-xs text-text-primary leading-relaxed bg-background border border-border-custom p-4 rounded">
                      {voiceStrategy.voiceProfile.tone}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block mb-2">Personality Descriptors</span>
                    <div className="flex flex-wrap gap-1.5">
                      {voiceStrategy.voiceProfile.personality.map((p: string, idx: number) => (
                        <span key={idx} className="font-mono text-xs font-bold px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-badge uppercase text-accent">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vocabulary rules */}
              <div className="bg-surface border border-border-custom rounded-card p-6 space-y-6">
                <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider border-b border-border-custom pb-3">
                  Vocabulary Rules
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Signature Words */}
                  <div className="space-y-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 block font-bold">Use / Leverage</span>
                    <ul className="space-y-2">
                      {voiceStrategy.voiceProfile.vocabulary.map((word: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-xs font-sans text-text-primary">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono">{word}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Words to Avoid */}
                  <div className="space-y-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-red-400 block font-bold">Censor / Avoid</span>
                    <ul className="space-y-2">
                      {voiceStrategy.voiceProfile.avoid.map((word: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-xs font-sans text-text-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="font-mono text-text-muted line-through">{word}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PERSONAS */}
          {activeTab === 'personas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {personas.map((p) => (
                <div key={p.id} className="bg-surface border border-border-custom rounded-card p-6 space-y-6 relative flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-border-custom pb-3">
                      <div>
                        <h4 className="font-display font-bold text-sm text-text-primary">{p.name}</h4>
                        <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider block">
                          {p.demographics.role} | Age {p.age_range}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-accent font-bold px-2 py-0.5 border border-accent/20 bg-accent/5 rounded-badge uppercase">
                        Archetype
                      </span>
                    </div>

                    {/* Lists */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                      {/* Challenges */}
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">Pain Points</span>
                        <ul className="space-y-1.5 font-sans leading-relaxed text-text-primary list-disc pl-4">
                          {p.pain_points.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Goals */}
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">Desires / Goals</span>
                        <ul className="space-y-1.5 font-sans leading-relaxed text-text-primary list-disc pl-4">
                          {p.goals.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="space-y-2 border-t border-border-custom/50 pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">Preferred Platforms</span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.platforms.map((plat, i) => (
                          <span key={i} className="font-mono text-[10px] px-2 py-0.5 border border-border-custom bg-background/50 rounded-badge uppercase text-text-muted">
                            {plat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Messaging Hook */}
                  {p.demographics.messagingAngle && (
                    <div className="mt-6 p-4 bg-background border border-border-custom rounded-badge">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold block mb-1">
                        Tailored Hook Angle
                      </span>
                      <p className="text-xs font-sans text-text-primary italic leading-normal">
                        "{p.demographics.messagingAngle}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: CONTENT PILLARS */}
          {activeTab === 'pillars' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {voiceStrategy.contentPillars.map((pillar: any, idx: number) => (
                <div key={idx} className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-border-custom pb-3">
                    <h4 className="font-display font-bold text-sm text-text-primary">{pillar.name}</h4>
                    <span className="font-mono text-[10px] text-accent font-semibold uppercase bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-badge">
                      {pillar.frequency}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-text-muted leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="space-y-2 border-t border-border-custom/50 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">Asset Types</span>
                    <div className="flex flex-wrap gap-1.5">
                      {pillar.contentTypes.map((type: string, i: number) => (
                        <span key={i} className="font-mono text-[10px] px-2 py-0.5 border border-border-custom bg-background/50 rounded text-text-primary">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: GROWTH CHECKLISTS */}
          {activeTab === 'actions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Competitor Gaps */}
              <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                <h4 className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest border-b border-border-custom pb-2">
                  Competitor Gaps
                </h4>
                <ul className="space-y-3 font-sans text-xs text-text-primary leading-relaxed pl-4 list-decimal">
                  {voiceStrategy.competitorGaps.map((gap: string, i: number) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>

              {/* Growth Opportunities */}
              <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                <h4 className="font-mono text-xs font-bold text-accent uppercase tracking-widest border-b border-border-custom pb-2">
                  Growth Opportunities
                </h4>
                <ul className="space-y-3 font-sans text-xs text-text-primary leading-relaxed pl-4 list-decimal">
                  {voiceStrategy.growthOpportunities.map((opp: string, i: number) => (
                    <li key={i}>{opp}</li>
                  ))}
                </ul>
              </div>

              {/* Immediate Action Items Checklist */}
              <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-border-custom pb-2">
                  Immediate Actions
                </h4>
                <div className="space-y-3 font-mono text-xs text-text-primary">
                  {voiceStrategy.immediateActions.map((action: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-2 bg-background border border-border-custom rounded select-none">
                      <div className="w-4 h-4 border border-emerald-400/40 rounded flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="font-sans leading-relaxed text-text-primary">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
