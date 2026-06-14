'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Cpu,
  FileText,
  Sliders,
  Scissors,
  AudioLines,
  Sparkles,
  RefreshCw,
  Upload,
  AlertCircle
} from 'lucide-react';

export default function NeuralUtilsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'transcribe' | 'summarize' | 'autocut'>('transcribe');

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);

  // Summarizer states
  const [rawText, setRawText] = useState('We are launching a new operating model designed to automate creative agency workflows. Using an integrated, desaturated grid based on Swiss Modernist design values, Brandavox operates at low latency and isolates data on Supabase tables to keep customer campaigns safe and secure.');
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Auto-cutter states
  const [isCutting, setIsCutting] = useState(false);
  const [cutterLogs, setCutterLogs] = useState<string[]>([]);

  const handleTranscribe = () => {
    setIsTranscribing(true);
    setTranscriptionResult(null);

    setTimeout(() => {
      setTranscriptionResult(
        "[00:02 - 00:08] Welcome back to the Brandavox agency overview.\n[00:09 - 00:15] Today we are reviewing the modular strategy dashboards.\n[00:16 - 00:24] Our client retention rates expanded by twelve percent since migrating workflows."
      );
      setIsTranscribing(false);
    }, 1500);
  };

  const handleSummarize = () => {
    setIsSummarizing(true);
    setSummaryResult(null);

    setTimeout(() => {
      setSummaryResult(
        "⚡ HOOK VARIATIONS:\n1. Stop manual client dashboard management. Brandavox automated workflows are here.\n2. Scale client retention by 12% with secure Swiss Modernist workspaces."
      );
      setIsSummarizing(false);
    }, 1200);
  };

  const handleAutocut = () => {
    setIsCutting(true);
    setCutterLogs([]);

    const logs = [
      `[CUTTER] Analyzing video metadata and frame variations...`,
      `[CUTTER] Scanning audio transients for speech hooks...`,
      `[CUTTER] Partitioning timeline offsets (Offset #1: 0-15s, Offset #2: 15-30s)...`,
      `[CUTTER] Exporting 9:16 vertical short cuts complete.`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setCutterLogs((prev) => [...prev, log]);
        if (index === logs.length - 1) {
          setIsCutting(false);
          alert('Video chopped successfully! 3 high-converting short clips compiled.');
        }
      }, (index + 1) * 350);
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Neural Utilities"
        description="Access secondary agency automation tools: audio transcription logs, reels auto-cutters, and prompt summarizers."
      />

      {/* Sub tabs */}
      <div className="flex border-b border-border-custom bg-background/25">
        <button
          onClick={() => setActiveSubTab('transcribe')}
          className={`px-6 py-3 font-display font-semibold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'transcribe'
              ? 'border-accent text-accent bg-surface/30'
              : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface/10'
          }`}
        >
          <AudioLines className="w-3.5 h-3.5" />
          <span>Smart Transcription</span>
        </button>
        <button
          onClick={() => setActiveSubTab('summarize')}
          className={`px-6 py-3 font-display font-semibold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'summarize'
              ? 'border-accent text-accent bg-surface/30'
              : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface/10'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Hook Summarizer</span>
        </button>
        <button
          onClick={() => setActiveSubTab('autocut')}
          className={`px-6 py-3 font-display font-semibold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'autocut'
              ? 'border-accent text-accent bg-surface/30'
              : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface/10'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Reels Auto-Cutter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Tab Content 1: Transcribe */}
        {activeSubTab === 'transcribe' && (
          <>
            <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
                <AudioLines className="w-4 h-4 text-accent" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
                  Audio Upload
                </h3>
              </div>

              <div className="border-2 border-dashed border-border-custom rounded-sm p-8 text-center flex flex-col items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                <span className="text-[10px] font-mono font-bold text-text-primary uppercase">UPLOAD MP3 / WAV</span>
                <span className="text-[9px] text-text-muted mt-1">Maximum file size: 50MB</span>
              </div>

              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-sans font-semibold text-xs rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isTranscribing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting transcript...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Transcribe Audio File</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2 bg-surface border border-border-custom p-6 rounded-card space-y-4">
              <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
                Transcription Output Log
              </span>
              <div className="p-4 bg-background border border-border-custom text-xs font-mono rounded-sm leading-relaxed whitespace-pre-line min-h-[160px]">
                {transcriptionResult ? (
                  <span className="text-text-primary">{transcriptionResult}</span>
                ) : (
                  <span className="text-zinc-600 italic">No transcript logs generated. Upload audio and run transcription.</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab Content 2: Summarize */}
        {activeSubTab === 'summarize' && (
          <>
            <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
                <FileText className="w-4 h-4 text-accent" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
                  Summarizer Source
                </h3>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm resize-none leading-relaxed font-sans"
                  placeholder="Paste long marketing copywriting here..."
                />
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing || !rawText.trim()}
                  className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isSummarizing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing hooks...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Summarize Hook Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-surface border border-border-custom p-6 rounded-card space-y-4">
              <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
                Summarized Hook Matrix
              </span>
              <div className="p-4 bg-background border border-border-custom text-xs font-mono rounded-sm leading-relaxed whitespace-pre-line min-h-[160px]">
                {summaryResult ? (
                  <span className="text-text-primary">{summaryResult}</span>
                ) : (
                  <span className="text-zinc-600 italic">Input body copy and run the summarizer to extract hook variants.</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab Content 3: Auto-cut */}
        {activeSubTab === 'autocut' && (
          <>
            <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
                <Scissors className="w-4 h-4 text-accent" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
                  Source Video Upload
                </h3>
              </div>

              <div className="border-2 border-dashed border-border-custom rounded-sm p-8 text-center flex flex-col items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                <span className="text-[10px] font-mono font-bold text-text-primary uppercase">UPLOAD SOURCE MP4</span>
                <span className="text-[9px] text-text-muted mt-1">Maximum file size: 200MB</span>
              </div>

              <button
                onClick={handleAutocut}
                disabled={isCutting}
                className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-sans font-semibold text-xs rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isCutting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing timelines...</span>
                  </>
                ) : (
                  <>
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Run Auto-Cutter</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2 bg-surface border border-border-custom p-6 rounded-card space-y-4 font-mono text-[10px]">
              <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
                Cutter Operations Monitor
              </span>
              <div className="p-4 bg-background border border-border-custom rounded-sm space-y-1.5 min-h-[160px]">
                {cutterLogs.length > 0 ? (
                  cutterLogs.map((log, index) => (
                    <div key={index} className="text-zinc-400 font-mono">{log}</div>
                  ))
                ) : (
                  <span className="text-zinc-600 italic font-mono">No cutter runs detected. Upload video and initialize auto-cutter.</span>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
