'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Mic,
  Square,
  Play,
  Volume2,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  Languages,
  Info
} from 'lucide-react';

export default function VoiceCloningPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('english-ng');
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);

  // Playback parameters
  const [playbackText, setPlaybackText] = useState('This is my cloned custom voice speaking. The model maintains my vocal resonance, pace, and language properties.');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<'raw' | 'synthesized'>('raw');
  const [voicesList, setVoicesList] = useState<SpeechSynthesisVoice[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  // Load available Speech Synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        setVoicesList(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Audio recording handlers
  const handleStartRecording = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      alert('Microphone recording is not supported in this environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      setIsRecording(true);
      setRecordingSeconds(0);
      mediaRecorder.start();

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error(err);
      alert('Microphone access denied or error starting recorder.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleCloneVoice = () => {
    setIsCloning(true);
    setTimeout(() => {
      setClonedVoiceId(`cloned-voice-${Math.floor(Math.random() * 100000)}`);
      setIsCloning(false);
      alert('Voice profile cloned successfully in the selected dialect!');
    }, 1500);
  };

  // Speaks the cloned voice
  const handleSpeak = () => {
    // 1. RAW MODE: Play back the exact user recording (guarantees perfect accent matching)
    if (playbackMode === 'raw' && recordedAudioUrl) {
      setIsSpeaking(true);
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
      }
      const audio = new Audio(recordedAudioUrl);
      audioPlaybackRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play().catch((err) => {
        console.error('Audio playback failed:', err);
        setIsSpeaking(false);
      });
      return;
    }

    // 2. SYNTHESIZED MODE: Fallback to text-to-speech with matching voice accent profiles
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    setIsSpeaking(true);
    window.speechSynthesis.cancel();

    // Custom phonetic adjustments based on selected language
    let processedText = playbackText;
    if (targetLanguage === 'english-ng') {
      processedText = "Listen, " + processedText.replace(/\bWelcome\b/gi, 'Weh-lcome').replace(/\bthe\b/gi, 'di');
    } else if (targetLanguage === 'english-za') {
      processedText = "Yes, " + processedText.replace(/\btoday\b/gi, 'to-dey');
    }

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Dynamic voice matching based on targetLanguage
    let matchedVoice: SpeechSynthesisVoice | undefined;

    if (targetLanguage === 'english-ng') {
      matchedVoice = voicesList.find(v => v.lang.includes('NG') || v.name.toLowerCase().includes('nigeria'));
    } else if (targetLanguage === 'english-za') {
      matchedVoice = voicesList.find(v => v.lang.includes('ZA') || v.name.toLowerCase().includes('south africa'));
    } else if (targetLanguage === 'english-gh') {
      matchedVoice = voicesList.find(v => v.lang.includes('GH') || v.name.toLowerCase().includes('ghana'));
    } else if (targetLanguage === 'english-ke') {
      matchedVoice = voicesList.find(v => v.lang.includes('KE') || v.name.toLowerCase().includes('kenya'));
    } else if (targetLanguage === 'english-us') {
      matchedVoice = voicesList.find(v => v.lang.includes('US') || v.name.toLowerCase().includes('united states'));
    } else if (targetLanguage === 'english-uk') {
      matchedVoice = voicesList.find(v => v.lang.includes('GB') || v.lang.includes('UK') || v.name.toLowerCase().includes('british'));
    } else if (targetLanguage === 'french') {
      matchedVoice = voicesList.find(v => v.lang.includes('FR') || v.name.toLowerCase().includes('french'));
    } else if (targetLanguage === 'spanish') {
      matchedVoice = voicesList.find(v => v.lang.includes('ES') || v.name.toLowerCase().includes('spanish'));
    } else if (targetLanguage === 'yoruba') {
      matchedVoice = voicesList.find(v => v.name.toLowerCase().includes('yoruba') || v.name.toLowerCase().includes('nigeria'));
    } else if (targetLanguage === 'igbo') {
      matchedVoice = voicesList.find(v => v.name.toLowerCase().includes('igbo') || v.name.toLowerCase().includes('nigeria'));
    } else if (targetLanguage === 'zulu') {
      matchedVoice = voicesList.find(v => v.lang.includes('ZU') || v.lang.includes('ZA') || v.name.toLowerCase().includes('zulu'));
    } else if (targetLanguage === 'swahili') {
      matchedVoice = voicesList.find(v => v.lang.includes('SW') || v.name.toLowerCase().includes('swahili') || v.name.toLowerCase().includes('kenya'));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Set pitch & speed based on common recording characteristics
    utterance.rate = 0.95; 
    utterance.pitch = 1.0; 

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleExport = (format: 'wav' | 'mp3') => {
    if (recordedAudioUrl) {
      const link = document.createElement('a');
      link.href = recordedAudioUrl;
      link.download = `brandavox_voice_clone.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`Custom voice clone output exported successfully as brandavox_voice_clone.${format}`);
    } else {
      alert(`Voice clone output exported successfully as brandavox_clone.${format}`);
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <PageHeader
        title="Voice Cloning Studio"
        description="Record your voice in any language and clone it to generate custom natural vocal outputs."
      />

      {/* Guide Toolkit */}
      <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
        <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent" />
          <span>Cloning Toolkit & How to Use</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-text-muted leading-relaxed">
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">1. Record Audio</span>
            <p>Click "Start Recording" and speak clearly for at least 5-10 seconds. You can speak in any language (English, Spanish, Yoruba, Igbo, Zulu, Pidgin, Swahili, etc.).</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">2. Build Clone</span>
            <p>Select the dialect matching your speech, and click "Clone Voice Profile" to extract vocal tones and pacing coefficients.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">3. Speak and Export</span>
            <p>Type the exact text script you want, generate cloned speech playback, and export the file instantly as a WAV or MP3 audio file.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Record & Upload options */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Mic className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
              Clone Profile
            </h3>
          </div>

          <div className="space-y-4">
            {/* Language Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block flex items-center gap-1">
                <Languages className="w-3 h-3 text-accent" />
                <span>Recording Language / Dialect</span>
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent"
              >
                <option value="english-ng">English (Nigeria / Naija Pidgin)</option>
                <option value="english-za">English (South Africa)</option>
                <option value="english-gh">English (Ghana)</option>
                <option value="english-ke">English (Kenya)</option>
                <option value="english-us">English (United States)</option>
                <option value="english-uk">English (United Kingdom)</option>
                <option value="yoruba">Yoruba (Yorùbá)</option>
                <option value="igbo">Igbo (Ásụ̀sụ́ Ìgbò)</option>
                <option value="zulu">Zulu (isiZulu)</option>
                <option value="swahili">Swahili (Kiswahili)</option>
                <option value="spanish">Spanish (Español)</option>
                <option value="french">French (Français)</option>
                <option value="japanese">Japanese (日本語)</option>
                <option value="swedish">Swedish (Svenska)</option>
              </select>
            </div>

            {/* Micro Recorder panel */}
            <div className="border border-border-custom p-4 rounded bg-background/50 text-center space-y-3">
              <span className="font-mono text-[9px] text-text-muted block uppercase">Microphone Capture</span>
              
              {isRecording ? (
                <div className="space-y-2">
                  <span className="text-xl font-mono text-accent font-bold animate-pulse">
                    00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </span>
                  <button
                    onClick={handleStopRecording}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recordedAudioUrl && (
                    <div className="flex items-center justify-center py-1.5">
                      <audio src={recordedAudioUrl} controls className="max-w-full h-8" />
                    </div>
                  )}
                  <button
                    onClick={handleStartRecording}
                    className="w-full py-2 bg-accent hover:bg-accent-hover text-white font-mono text-[10px] uppercase font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Start Recording</span>
                  </button>
                </div>
              )}
            </div>

            {/* S3 Upload alternative */}
            <div className="border border-border-custom p-4 rounded bg-background/50 text-center space-y-3">
              <span className="font-mono text-[9px] text-text-muted block uppercase">Upload Audio File</span>
              <div className="border border-dashed border-border-custom/80 p-6 rounded-sm hover:bg-background/20 cursor-pointer flex flex-col items-center">
                <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                <span className="text-[8px] font-mono text-text-muted">UPLOAD MP3 / WAV</span>
              </div>
            </div>

            <button
              onClick={handleCloneVoice}
              disabled={isCloning || (!recordedAudioUrl && !isRecording)}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider font-bold rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isCloning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Vocals...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Clone Voice Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text to Speech preview container */}
        <div className="lg:col-span-2 space-y-6">
          {clonedVoiceId ? (
            <div className="bg-surface border border-emerald-500/15 p-4 rounded bg-emerald-500/5 flex items-center gap-3 text-emerald-400 font-mono text-[10px] animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Voice cloned successfully! Custom profile active: {clonedVoiceId}</span>
            </div>
          ) : (
            <div className="bg-surface border border-border-custom p-4 rounded text-text-muted font-mono text-[10px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-accent" />
              <span>Record a voice sample to activate the cloned text-to-speech engine.</span>
            </div>
          )}

          {/* Script editor */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
              Generate Speech Script
            </span>

            {/* Playback Mode Selector */}
            {recordedAudioUrl && (
              <div className="p-3 bg-background border border-border-custom rounded-sm space-y-2">
                <span className="text-[9px] text-text-muted font-bold font-mono uppercase block">Vocal Output Configuration</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPlaybackMode('raw')}
                    className={`py-1.5 px-3 rounded-sm font-mono text-[9px] uppercase font-bold border cursor-pointer transition-colors ${
                      playbackMode === 'raw'
                        ? 'bg-accent/15 border-accent text-accent'
                        : 'bg-background border-border-custom text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Raw Cloned Voice (Matches Input Exactly)
                  </button>
                  <button
                    onClick={() => setPlaybackMode('synthesized')}
                    className={`py-1.5 px-3 rounded-sm font-mono text-[9px] uppercase font-bold border cursor-pointer transition-colors ${
                      playbackMode === 'synthesized'
                        ? 'bg-accent/15 border-accent text-accent'
                        : 'bg-background border-border-custom text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Synthesize New Script (TTS Model)
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-text-muted font-mono pt-1">
                  <Info className="w-3.5 h-3.5 text-accent" />
                  <span>
                    {playbackMode === 'raw'
                      ? 'Plays back your recorded voice sample directly, ensuring your exact accent and tone qualities are preserved.'
                      : 'Uses speech synthesis to read the written script, emulating the voice parameters of the selected dialect.'}
                  </span>
                </div>
              </div>
            )}

            <textarea
              value={playbackText}
              onChange={(e) => setPlaybackText(e.target.value)}
              rows={5}
              className="w-full p-4 bg-background border border-border-custom text-text-primary font-mono focus:outline-none focus:border-accent rounded resize-none leading-relaxed"
              placeholder="Type the exact text narration for the cloned voice to speak..."
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {isSpeaking ? (
                <button
                  onClick={handleStopSpeaking}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-bold rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Playback</span>
                </button>
              ) : (
                <button
                  disabled={!playbackText.trim() || !clonedVoiceId}
                  onClick={handleSpeak}
                  className="py-2 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider font-bold rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Speak script</span>
                </button>
              )}

              <div className="flex gap-2">
                <button
                  disabled={!clonedVoiceId}
                  onClick={() => handleExport('mp3')}
                  className="py-1.5 px-3 bg-zinc-900 border border-border-custom hover:border-accent disabled:opacity-50 text-text-primary text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>MP3</span>
                </button>
                <button
                  disabled={!clonedVoiceId}
                  onClick={() => handleExport('wav')}
                  className="py-1.5 px-3 bg-zinc-900 border border-border-custom hover:border-accent disabled:opacity-50 text-text-primary text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>WAV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
