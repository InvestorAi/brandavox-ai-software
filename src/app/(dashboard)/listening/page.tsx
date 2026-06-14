'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Radio,
  Search,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Cpu
} from 'lucide-react';

interface Mention {
  id: string;
  source: 'twitter' | 'instagram' | 'linkedin' | 'threads';
  author: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: string;
}

export default function SocialListeningPage() {
  const [monitoredKeywords, setMonitoredKeywords] = useState<string[]>([
    'SocialFlow AI',
    'Creative Agency OS',
    'DTC brand marketing'
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [mentions, setMentions] = useState<Mention[]>([
    {
      id: 'm-1',
      source: 'twitter',
      author: '@DtcFounder',
      content: 'Migrated our agency workflows to SocialFlow AI. The Swiss modernist console is fast and desaturated grids feel extremely premium. Churn probability is down.',
      sentiment: 'positive',
      timestamp: '5m ago'
    },
    {
      id: 'm-2',
      source: 'linkedin',
      author: 'Marcus Aurelius',
      content: 'Looking for recommendations on the best multi-tenant campaign scheduler for paid social. Need something with RLS safety and local mock fallbacks.',
      sentiment: 'neutral',
      timestamp: '1h ago'
    },
    {
      id: 'm-3',
      source: 'instagram',
      author: 'beauty_brand_hq',
      content: 'Failed fetch response on standard CRM invoices from our previous SaaS. SocialFlow AI is looking like a solid upgrade candidate.',
      sentiment: 'positive',
      timestamp: '2h ago'
    },
    {
      id: 'm-4',
      source: 'twitter',
      author: '@angry_Smm',
      content: 'Spent 4 hours editing subtitles on CapCut. Creative workflows are still too fragmented.',
      sentiment: 'negative',
      timestamp: '4h ago'
    }
  ]);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || monitoredKeywords.includes(newKeyword.trim())) return;

    setMonitoredKeywords((prev) => [...prev, newKeyword.trim()]);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setMonitoredKeywords((prev) => prev.filter((k) => k !== kw));
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <PageHeader
        title="Social Listening Monitor"
        description="Monitor keyword metrics, audit target brand mentions, analyze sentiment indexes, and receive alert warnings."
      />

      {/* Sentiment Analytics Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface border border-border-custom p-5 rounded-card flex flex-col justify-between">
          <span className="text-[9px] text-text-muted font-mono block uppercase">Sentiment Index Ratio</span>
          <div className="flex items-center gap-3 pt-2">
            <span className="text-2xl font-bold text-emerald-400">82.4%</span>
            <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">POSITIVE</span>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-5 rounded-card space-y-2">
          <div className="flex justify-between text-[9px] font-mono text-emerald-400 uppercase">
            <span>Positive Mentions</span>
            <span>62%</span>
          </div>
          <div className="w-full h-1 bg-border-custom rounded-full overflow-hidden">
            <div className="w-[62%] h-full bg-emerald-400" />
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-5 rounded-card space-y-2">
          <div className="flex justify-between text-[9px] font-mono text-zinc-400 uppercase">
            <span>Neutral Mentions</span>
            <span>28%</span>
          </div>
          <div className="w-full h-1 bg-border-custom rounded-full overflow-hidden">
            <div className="w-[28%] h-full bg-zinc-400" />
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-5 rounded-card space-y-2">
          <div className="flex justify-between text-[9px] font-mono text-red-400 uppercase">
            <span>Negative Mentions</span>
            <span>10%</span>
          </div>
          <div className="w-full h-1 bg-border-custom rounded-full overflow-hidden">
            <div className="w-[10%] h-full bg-red-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Keywords Settings */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Radio className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Keyword Registry
            </h3>
          </div>

          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add keyword..."
              className="flex-1 px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-sans"
              required
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white px-3 py-2 rounded-sm cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2">
            {monitoredKeywords.map((kw) => (
              <div
                key={kw}
                className="flex items-center justify-between p-2 bg-background border border-border-custom rounded-sm"
              >
                <span className="font-mono text-text-primary">{kw}</span>
                <button
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-zinc-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mentions Stream Feed */}
        <div className="lg:col-span-2 bg-surface border border-border-custom p-6 rounded-card space-y-4">
          <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
            Real-time Mentions Stream
          </span>

          <div className="space-y-4">
            {mentions.map((mention) => (
              <div
                key={mention.id}
                className="bg-background border border-border-custom rounded-sm p-4 space-y-3 hover:border-accent/40 transition-colors font-sans"
              >
                <div className="flex justify-between items-center border-b border-border-custom/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase font-bold">
                      {mention.source}
                    </span>
                    <span className="font-bold text-text-primary">{mention.author}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 border font-mono text-[9px] uppercase font-bold rounded ${
                      mention.sentiment === 'positive'
                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                        : mention.sentiment === 'negative'
                        ? 'border-red-500/20 text-red-400 bg-red-500/5'
                        : 'border-zinc-700 text-zinc-400 bg-zinc-800/50'
                    }`}>
                      {mention.sentiment}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-500">{mention.timestamp}</span>
                  </div>
                </div>

                <p className="text-text-primary leading-relaxed italic">
                  "{mention.content}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
