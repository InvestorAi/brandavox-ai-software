'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  TrendingUp,
  Megaphone,
  Percent,
  Plus,
  Trash2,
  AlertCircle,
  Activity,
  DollarSign
} from 'lucide-react';

interface AdCampaign {
  id: string;
  name: string;
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin';
  budget: number;
  spend: number;
  revenue: number;
  status: 'active' | 'paused' | 'completed';
}

export default function PaidAdsCenterPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    {
      id: 'ad-1',
      name: 'DTC Summer Sunglasses Launch',
      platform: 'meta',
      budget: 5000,
      spend: 2300,
      revenue: 8400,
      status: 'active'
    },
    {
      id: 'ad-2',
      name: 'Search Brand Keywords Capture',
      platform: 'google',
      budget: 3000,
      spend: 1200,
      revenue: 4100,
      status: 'active'
    },
    {
      id: 'ad-3',
      name: 'Short Reels Viral Hook test',
      platform: 'tiktok',
      budget: 2000,
      spend: 2000,
      revenue: 1950,
      status: 'completed'
    }
  ]);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPlatform, setNewPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');
  const [newBudget, setNewBudget] = useState(1000);

  // ROAS Calculator states
  const [calcSpend, setCalcSpend] = useState(1000);
  const [calcRevenue, setCalcRevenue] = useState(3500);

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newAd: AdCampaign = {
      id: `ad-${Date.now()}`,
      name: newName,
      platform: newPlatform,
      budget: newBudget,
      spend: 0,
      revenue: 0,
      status: 'active'
    };

    setCampaigns((prev) => [newAd, ...prev]);
    setNewName('');
    setShowAddForm(false);
  };

  const handleDeleteAd = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus: Record<string, 'active' | 'paused'> = {
            active: 'paused',
            paused: 'active'
          };
          return { ...c, status: nextStatus[c.status] || 'active' };
        }
        return c;
      })
    );
  };

  // ROAS Calculation helper
  const calculateRoas = (revenue: number, spend: number) => {
    if (spend <= 0) return 0;
    return Number((revenue / spend).toFixed(2));
  };

  const currentRoas = calculateRoas(calcRevenue, calcSpend);
  let roasColor = 'text-red-400 border-red-500/20 bg-red-500/5';
  if (currentRoas >= 3.0) {
    roasColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  } else if (currentRoas >= 1.5) {
    roasColor = 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
  }

  return (
    <div className="space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title="Paid Advertising Center"
          description="Manage campaign spend matrices across Meta, Google, and TikTok. Audit click acquisitions rates and track conversions."
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-center bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider py-2 px-4 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Ad Campaign</span>
        </button>
      </div>

      {/* Campaign Creation form */}
      {showAddForm && (
        <div className="bg-surface border border-border-custom p-6 rounded-card max-w-xl animate-fade-in">
          <form onSubmit={handleCreateAd} className="space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
              <Megaphone className="w-4 h-4 text-accent" />
              <span className="font-bold text-xs uppercase tracking-wider text-text-primary font-display">Deploy Ad Campaign</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Campaign Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Summer Q3 Funnel"
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Target Network</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-sans"
                >
                  <option value="meta">Meta Ads (Instagram / FB)</option>
                  <option value="google">Google Ads (Search / PPC)</option>
                  <option value="tiktok">TikTok Ads (Shorts)</option>
                  <option value="linkedin">LinkedIn Ads (B2B)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Allocation Budget ($)</label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-border-custom text-text-primary rounded-sm hover:bg-zinc-800 uppercase font-mono tracking-wider font-bold text-[10px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm uppercase font-mono tracking-wider font-bold text-[10px]"
              >
                Deploy campaign
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Ads Registry Pipeline */}
        <div className="lg:col-span-2 bg-surface border border-border-custom p-6 rounded-card space-y-4">
          <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
            Ad Operations Registry
          </span>

          <div className="space-y-4 font-sans text-xs">
            {campaigns.map((ad) => {
              const roasVal = calculateRoas(ad.revenue, ad.spend);
              return (
                <div
                  key={ad.id}
                  className="bg-background border border-border-custom rounded-sm p-4 space-y-3 hover:border-accent/40 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase font-bold">
                        {ad.platform}
                      </span>
                      <h5 className="font-bold text-xs text-text-primary pt-1">{ad.name}</h5>
                    </div>

                    <span className={`px-2 py-0.5 border font-mono text-[9px] uppercase font-bold rounded ${
                      ad.status === 'active'
                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                        : 'border-zinc-700 text-zinc-400 bg-zinc-800/50'
                    }`}>
                      {ad.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-border-custom/40 pt-3 font-mono text-[9px] text-text-muted">
                    <div>
                      <span className="block uppercase text-[8px] text-zinc-500">Allocated Budget</span>
                      <span className="font-bold text-text-primary text-xs">${ad.budget.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block uppercase text-[8px] text-zinc-500">Acquisition Spend</span>
                      <span className="font-bold text-text-primary text-xs">${ad.spend.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block uppercase text-[8px] text-zinc-500">ROAS Performance</span>
                      <span className="font-bold text-accent text-xs">{roasVal}x</span>
                    </div>
                  </div>

                  <div className="border-t border-border-custom/40 pt-3 flex justify-between items-center">
                    <button
                      onClick={() => handleToggleStatus(ad.id)}
                      className="py-1 px-2.5 bg-zinc-900 border border-border-custom hover:border-accent font-mono text-[9px] uppercase font-bold text-text-primary rounded-sm cursor-pointer"
                    >
                      {ad.status === 'active' ? 'Pause Ad' : 'Resume Ad'}
                    </button>
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="text-zinc-500 hover:text-red-400 cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROAS Calculator Panel */}
        <div className="lg:col-span-1 bg-surface border border-border-custom p-6 rounded-card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <Percent className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary animate-fade-in">
              ROAS Calculator
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">Ad Spend ($)</label>
              <input
                type="number"
                value={calcSpend}
                onChange={(e) => setCalcSpend(Number(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">Generated Revenue ($)</label>
              <input
                type="number"
                value={calcRevenue}
                onChange={(e) => setCalcRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-mono"
              />
            </div>

            {/* Calculated Output Display Box */}
            <div className={`border p-4 rounded-sm text-center flex flex-col justify-center gap-1.5 transition-all ${roasColor}`}>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Calculated ROAS Ratio</span>
              <span className="text-2xl font-bold font-mono">{currentRoas}x</span>
              <span className="font-mono text-[8px] uppercase font-bold text-zinc-500">
                {currentRoas >= 3.0
                  ? 'Highly Profitable (Scale budget)'
                  : currentRoas >= 1.5
                  ? 'Break-Even (Audit parameters)'
                  : 'Unprofitable (Restructure copy)'}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
