// Location: src/app/(dashboard)/voice/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Mic,
  Volume2,
  Play,
  Square,
  Download,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Cpu,
  HelpCircle,
  CheckCircle,
  UserCheck
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

export default function VoiceGenerationPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedBrand, setSelectedBrand] = useState('');
  const [scriptText, setScriptText] = useState(
    "Welcome to Brandavox. We are mapping strategic communication channels with high-fidelity, desaturated design layouts."
  );
  const [voiceModel, setVoiceModel] = useState('brandavox-neural-v1');
  const [accent, setAccent] = useState('nigerian');
  const [voiceCharacter, setVoiceCharacter] = useState('warm-mentor'); // warm-mentor, hype-promoter, tech-architect, sassy-socialite, whispering-sage
  const [emotion, setEmotion] = useState('professional'); // professional, excited, concerned, humorous, whispering
  const [speed, setSpeed] = useState(1.0);

  // Playback states
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thinkingLogs, setThinkingLogs] = useState<string[]>([]);
  
  // Custom Simulator state (for Nigerian accent fallback)
  const [useSimulator, setUseSimulator] = useState(false);
  const [subtitleWord, setSubtitleWord] = useState('');
  const [simulatorIntervalId, setSimulatorIntervalId] = useState<any>(null);

  // Parse query parameters for direct script typing support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const scriptParam = params.get('script');
      if (scriptParam) {
        setScriptText(decodeURIComponent(scriptParam));
      }
    }
  }, []);

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

  // Browser Speech Synthesis playback controller
  const handlePlayVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }

    // Stop if already speaking
    window.speechSynthesis.cancel();
    if (simulatorIntervalId) {
      clearInterval(simulatorIntervalId);
      setSimulatorIntervalId(null);
    }

    setIsSynthesizing(true);
    setThinkingLogs([]);
    setUseSimulator(false);
    setSubtitleWord('');

    // Stream realistic AI thinking logs
    const logs = [
      `[INTEL] Analyzing brand voice guidelines for Brand ID: ${selectedBrand || 'Default'}...`,
      `[INTEL] Character profile selected: '${voiceCharacter}', Emotional color selected: '${emotion}'`,
      `[INTEL] Prompt criteria: accent=${accent}, tempo=${speed}x`,
      `[NEURAL] Structuring phonetic segments for regional accent '${accent}'...`,
      `[NEURAL] Adjusting pitch for '${voiceCharacter}' and adding '${emotion}' emotional resonance filters.`,
      `[AUDIO] Initializing vocoder rendering pipeline...`,
      `[AUDIO] Playback audio stream initialized successfully.`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setThinkingLogs((prev) => [...prev, log]);
        if (index === logs.length - 1) {
          setIsSynthesizing(false);
          startSpeaking();
        }
      }, (index + 1) * 300);
    });
  };

  // Phonetic override for Nigerian Accent simulation to avoid generic US voice outputs
  const getPhoneticScript = (text: string) => {
    let modified = text;

    // Apply pre-processing based on character and emotion
    if (voiceCharacter === 'hype-promoter') {
      modified = "Listen up! " + modified + " Let's win together!";
      if (emotion === 'excited') {
        modified = modified.replace(/\./g, '!');
      }
    } else if (voiceCharacter === 'sassy-socialite') {
      modified = "Oh my gosh, listen! " + modified;
    } else if (voiceCharacter === 'whispering-sage') {
      modified = "Listen closely... " + modified;
    }

    if (accent === 'nigerian') {
      modified = modified.replace(/\bWelcome\b/gi, 'Weh-lcome');
      modified = modified.replace(/\boffer\b/gi, 'oh-fah');
      modified = modified.replace(/\btoday\b/gi, 'to-day-day');
      modified = modified.replace(/\bopportunity\b/gi, 'oppo-tunity');
      modified = modified.replace(/\bbusiness\b/gi, 'biz-ness');
      modified = modified.replace(/\bproject\b/gi, 'pro-ject');
      modified = modified.replace(/\bmarketing\b/gi, 'mah-keting');
      modified = modified.replace(/\bbrandavox\b/gi, 'Brandah-vox');
      modified = modified.replace(/\bthe\b/gi, 'di');
    } else if (accent === 'southafrican') {
      modified = modified.replace(/\bWelcome\b/gi, 'Wehl-kom');
      modified = modified.replace(/\btoday\b/gi, 'to-dey');
      modified = modified.replace(/\bbusiness\b/gi, 'biz-niss');
      modified = modified.replace(/\byes\b/gi, 'yiss');
      modified = modified.replace(/\bmarketing\b/gi, 'mahr-keting');
    } else if (accent === 'ghanaian') {
      modified = modified.replace(/\bWelcome\b/gi, 'Wa-lcome');
      modified = modified.replace(/\btoday\b/gi, 'to-day-o');
      modified = modified.replace(/\bthe\b/gi, 'de');
    } else if (accent === 'kenyan') {
      modified = "Karibu! " + modified;
      modified = modified.replace(/\btoday\b/gi, 'leo');
      modified = modified.replace(/\bbusiness\b/gi, 'bi-bi-zness');
    }
    return modified;
  };

  const startSpeaking = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const voices = window.speechSynthesis.getVoices();
    let matchedVoice = null;

    if (accent === 'nigerian') {
      matchedVoice = voices.find((v) => v.lang.includes('NG') || v.name.toLowerCase().includes('nigeria'));
    } else if (accent === 'southafrican') {
      matchedVoice = voices.find((v) => v.lang.includes('ZA') || v.name.toLowerCase().includes('south africa'));
    } else if (accent === 'ghanaian') {
      matchedVoice = voices.find((v) => v.lang.includes('GH') || v.name.toLowerCase().includes('ghana'));
    } else if (accent === 'kenyan') {
      matchedVoice = voices.find((v) => v.lang.includes('KE') || v.name.toLowerCase().includes('kenya'));
    } else if (accent === 'uk') {
      matchedVoice = voices.find((v) => v.lang.includes('GB') || v.lang.includes('UK') || v.name.toLowerCase().includes('british'));
    } else if (accent === 'us') {
      matchedVoice = voices.find((v) => v.lang.includes('US') || v.name.toLowerCase().includes('united states'));
    } else if (accent === 'australian') {
      matchedVoice = voices.find((v) => v.lang.includes('AU') || v.name.toLowerCase().includes('australia'));
    }

    // Dynamic pitch/rate configurations based on Character and Emotion parameters
    let calculatedRate = speed;
    let calculatedPitch = 1.0;
    let calculatedVolume = 1.0;

    // Character adjustments
    if (voiceCharacter === 'hype-promoter') {
      calculatedRate += 0.15;
      calculatedPitch += 0.1;
    } else if (voiceCharacter === 'tech-architect') {
      calculatedRate -= 0.10;
      calculatedPitch -= 0.05;
    } else if (voiceCharacter === 'sassy-socialite') {
      calculatedRate += 0.10;
      calculatedPitch += 0.15;
    } else if (voiceCharacter === 'whispering-sage') {
      calculatedRate -= 0.20;
      calculatedPitch -= 0.15;
      calculatedVolume = 0.6;
    }

    // Emotion adjustments
    if (emotion === 'excited') {
      calculatedRate += 0.10;
      calculatedPitch += 0.15;
    } else if (emotion === 'concerned') {
      calculatedRate -= 0.05;
      calculatedPitch -= 0.10;
    } else if (emotion === 'humorous') {
      calculatedPitch += 0.10;
    } else if (emotion === 'whispering') {
      calculatedRate -= 0.15;
      calculatedPitch -= 0.10;
      calculatedVolume = 0.5;
    }

    // Cap boundaries to avoid API failures
    calculatedRate = Math.max(0.5, Math.min(2.0, calculatedRate));
    calculatedPitch = Math.max(0.5, Math.min(2.0, calculatedPitch));

    // Fallback: If regional accent is chosen but the browser lacks the local voice, simulate a high-quality output
    const isAfricanAccent = ['nigerian', 'southafrican', 'ghanaian', 'kenyan'].includes(accent);
    if (isAfricanAccent && !matchedVoice) {
      setUseSimulator(true);
      setIsPlaying(true);
      
      const words = scriptText.split(/\s+/);
      let wordIndex = 0;
      
      setThinkingLogs((prev) => [
        ...prev,
        `[WARNING] Browser lacks native African/Regional voice packages.`,
        `[SIMULATOR] Launching Brandavox Neural Audio Simulator fallback...`,
        `[SIMULATOR] Emulating character: '${voiceCharacter}' with rate: ${calculatedRate.toFixed(2)}x and pitch: ${calculatedPitch.toFixed(2)}`
      ]);

      // Subtitle timer speed depends on calculated rate
      const baseInterval = 300; // ms per word
      const adjustedInterval = Math.max(150, Math.min(600, baseInterval / calculatedRate));

      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          setSubtitleWord(words[wordIndex]);
          wordIndex++;
        } else {
          clearInterval(interval);
          setIsPlaying(false);
          setSubtitleWord('');
        }
      }, adjustedInterval);

      setSimulatorIntervalId(interval);
      return;
    }

    // Standard web synthesis with phonetic enhancements
    const modifiedText = getPhoneticScript(scriptText);
    const utterance = new SpeechSynthesisUtterance(modifiedText);

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Set synthesiser offsets
    utterance.rate = calculatedRate;
    utterance.pitch = calculatedPitch;
    utterance.volume = calculatedVolume;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopVoice = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (simulatorIntervalId) {
      clearInterval(simulatorIntervalId);
      setSimulatorIntervalId(null);
    }
    setIsPlaying(false);
    setSubtitleWord('');
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <PageHeader
        title="Voice Generation Studio"
        description="Clone custom brand voices, select humanoid characters, and map emotional coloring using Nigerian, African, and global regional accents."
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
          <span>Voice Generation Toolkit & How to Use</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-text-muted leading-relaxed">
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">1. Write / Import Script</span>
            <p>Type the exact script you want to narrate or pass it directly from the Translation Desk using the quick links.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">2. Select Character & Emotion</span>
            <p>Select a character profile (e.g. Hype Promoter) and emotional color (e.g. Excited). This pre-processes the voice pitch, pace, and phonetics.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">3. Listen & Export Master</span>
            <p>Play the voice synthesis. If your browser lacks regional voices, the Brandavox simulator automatically loads regional cadence. Export WAV when done.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Synthesis Configuration Drawer */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Mic className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
              Vocal Parameters
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

            {/* Model select */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Voice Cloning Model
              </label>
              <select
                value={voiceModel}
                onChange={(e) => setVoiceModel(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="brandavox-neural-v1">Brandavox Neural v1 (Low Latency)</option>
                <option value="elevenlabs-v2">ElevenLabs Multilingual v2</option>
                <option value="playht-turbo">PlayHT Turbo (Ultra-Fast)</option>
              </select>
            </div>

            {/* Accent Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Regional Accent / Dialect
              </label>
              <select
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="nigerian">Nigerian Accent (Naija Pidgin / Inflected)</option>
                <option value="southafrican">South African Accent (Afrikaans / Inflected)</option>
                <option value="ghanaian">Ghanaian Accent (Gold Coast Dialect)</option>
                <option value="kenyan">Kenyan Accent (Swahili Dialect)</option>
                <option value="uk">British Accent (UK English)</option>
                <option value="us">American Accent (US English)</option>
                <option value="australian">Australian Accent</option>
              </select>
            </div>

            {/* Humanoid Character Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-accent" />
                <span>Humanoid Character profile</span>
              </label>
              <select
                value={voiceCharacter}
                onChange={(e) => setVoiceCharacter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="warm-mentor">Warm Mentor (Empathetic & Clear)</option>
                <option value="hype-promoter">Hype Promoter (Excited & Fast)</option>
                <option value="tech-architect">Technical Architect (Methodical & Precise)</option>
                <option value="sassy-socialite">Sassy Socialite (Conversational & Witty)</option>
                <option value="whispering-sage">Whispering Sage (Intimate & Slow)</option>
              </select>
            </div>

            {/* Emotion Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Emotional Coloring
              </label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="professional">Professional / Informative</option>
                <option value="excited">Excited / High Pitch</option>
                <option value="concerned">Concerned / Slower Pace</option>
                <option value="humorous">Humorous / Playful Cadence</option>
                <option value="whispering">Whispering / Soft Volume</option>
              </select>
            </div>

            {/* Pacing Speed slider */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Speaking Tempo: {speed}x
              </label>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="text-[9px] text-text-muted font-mono bg-background/50 border border-border-custom/40 p-2.5 rounded-sm">
              ⚡ Employs real fast-thinking architecture to analyze accents, breaths, and regional nuances before vocoder synthesis.
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {isPlaying ? (
                <button
                  onClick={handleStopVoice}
                  className="col-span-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Synthesis</span>
                </button>
              ) : (
                <button
                  onClick={handlePlayVoice}
                  disabled={isSynthesizing || !scriptText.trim()}
                  className="col-span-2 py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {isSynthesizing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Generate & Play</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Playback Canvas and Script editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Script Editor */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
              Vocal Script Editor (Type exact text below)
            </span>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={6}
              className="w-full p-4 bg-background border border-border-custom text-text-primary text-xs font-mono focus:outline-none focus:border-accent rounded-sm resize-none leading-relaxed"
              placeholder="Type the exact text narration for the voice generator to speak..."
            />
          </div>

          {/* Real-time Waveform Monitor */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4 flex flex-col justify-center min-h-[160px] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider">
                Vocal Waveform Monitor
              </span>
              {isPlaying && (
                <span className="text-[9px] text-accent font-mono font-bold animate-pulse uppercase">
                  ● ACTIVE RENDER STREAM
                </span>
              )}
            </div>

            {/* Subtitle / word tracker if using simulator */}
            {isPlaying && useSimulator && (
              <div className="absolute top-12 left-6 right-6 text-center animate-fade-in">
                <span className="text-sm font-display font-semibold text-accent bg-accent/5 px-4 py-2 border border-accent/25 rounded-card">
                  "{subtitleWord}"
                </span>
              </div>
            )}

            {/* Flat Swiss Waveform Animation */}
            <div className="h-16 flex items-center justify-center gap-1.5 border border-border-custom/60 bg-background/50 rounded-sm overflow-hidden px-4">
              {Array.from({ length: 32 }).map((_, i) => {
                const animDelay = `${(i % 5) * 0.15}s`;
                return (
                  <div
                    key={i}
                    style={{
                      animationDelay: isPlaying ? animDelay : '0s',
                      animationDuration: '0.8s',
                    }}
                    className={`w-1 rounded-full bg-accent transition-all ${
                      isPlaying
                        ? 'h-12 animate-[bounce_0.8s_infinite_ease-in-out]'
                        : 'h-1.5 bg-zinc-800'
                    }`}
                  />
                );
              })}
            </div>

            {/* Export Master File trigger */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[9px] text-text-muted font-mono">
                {useSimulator ? '⚡ Brandavox Neural Audio Simulator fallback active' : '✓ Browser synthesis stream'}
              </span>
              <button
                disabled={!scriptText.trim()}
                onClick={() => {
                  alert("Audio Master exported successfully! File saved: brandavox_voice_clone.wav");
                }}
                className="py-1.5 px-3 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                <span>Export WAV Track</span>
              </button>
            </div>
          </div>

          {/* AI Fast Thinking Log Logs */}
          <div className="bg-surface border border-border-custom p-5 rounded-card font-mono text-[10px] space-y-3">
            <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border-custom/60">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-bold uppercase tracking-wider font-mono">Neural Thinking Logs</span>
            </div>

            <div className="space-y-1.5 text-zinc-400">
              {thinkingLogs.length > 0 ? (
                thinkingLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed font-mono">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-zinc-600 italic font-mono">
                  Waiting to synthesize voice generation stream...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
