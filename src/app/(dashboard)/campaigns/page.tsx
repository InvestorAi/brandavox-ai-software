'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { DataTable } from '@/components/ui/DataTable';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { Plus, Megaphone, DollarSign, Calendar, Target, AlertCircle, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  objective: string;
  budget: number;
  status: 'draft' | 'active' | 'completed';
  start_date: string;
  end_date: string;
  channels: string[];
  created_at: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    brand_id: '',
    title: '',
    objective: '',
    budget: 0,
    status: 'draft' as const,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    channels: [] as string[],
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchCampaignsAndBrands = async () => {
    try {
      setError(null);
      const [campRes, brandRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/brands'),
      ]);

      if (!campRes.ok || !brandRes.ok) {
        throw new Error('Failed to fetch campaigns or brands');
      }

      const campData = await campRes.json();
      const brandData = await brandRes.json();

      if (campData.success) {
        setCampaigns(campData.data || []);
      } else {
        throw new Error(campData.error || 'Failed to parse campaigns');
      }

      if (brandData.success) {
        setBrands(brandData.data || []);
        if (brandData.data && brandData.data.length > 0) {
          setFormData((prev) => ({ ...prev, brand_id: brandData.data[0].id }));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading content.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaignsAndBrands();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCampaignsAndBrands();
  };

  const handleCheckboxChange = (channel: string) => {
    setFormData((prev) => {
      const channels = prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!formData.brand_id) {
        throw new Error('Please select a brand');
      }
      if (!formData.title.trim()) {
        throw new Error('Campaign title is required');
      }

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      // Refresh campaigns list
      setCampaigns((prev) => [data.data, ...prev]);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        brand_id: brands[0]?.id || '',
        title: '',
        objective: '',
        budget: 0,
        status: 'draft',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        channels: [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit campaign');
    } finally {
      setSubmitting(false);
    }
  };

  // KPIs
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const channelsCovered = Array.from(new Set(campaigns.flatMap((c) => c.channels || []))).length;

  // Map campaigns to DataTable rows
  const mappedCampaigns = campaigns.map((c) => {
    const brand = brands.find((b) => b.id === c.brand_id);
    const brandName = brand ? brand.name : 'Unknown Brand';

    const statusColors = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      draft: 'bg-zinc-500/10 text-zinc-400 border-zinc-700/20',
      completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    return {
      ...c,
      brandName,
      titleCell: (
        <div>
          <span className="font-semibold text-text-primary block font-sans text-xs">
            {c.title}
          </span>
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block mt-0.5">
            {brandName}
          </span>
        </div>
      ),
      budgetCell: (
        <span className="font-mono text-xs text-text-primary">
          ${Number(c.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
      statusCell: (
        <span
          className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-badge uppercase border ${
            statusColors[c.status] || statusColors.draft
          }`}
        >
          {c.status}
        </span>
      ),
      channelsCell: (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {c.channels && c.channels.length > 0 ? (
            c.channels.map((ch) => (
              <PlatformBadge key={ch} platform={ch} />
            ))
          ) : (
            <span className="text-xs text-text-muted font-sans">—</span>
          )}
        </div>
      ),
      dateCell: (
        <div className="text-[10px] text-text-muted font-mono">
          <div>S: {new Date(c.start_date).toLocaleDateString()}</div>
          <div>E: {new Date(c.end_date).toLocaleDateString()}</div>
        </div>
      ),
      actionCell: (
        <Link
          href={`/calendar?campaignId=${c.id}`}
          className="text-xs font-mono font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
        >
          VIEW CALENDAR
        </Link>
      ),
    };
  });

  const columns = [
    { key: 'title', displayKey: 'titleCell', header: 'Campaign / Brand', sortable: true },
    { key: 'objective', header: 'Objective Context' },
    { key: 'budget', displayKey: 'budgetCell', header: 'Budget Allocation', sortable: true },
    { key: 'channels', displayKey: 'channelsCell', header: 'Channels' },
    { key: 'dates', displayKey: 'dateCell', header: 'Timeline' },
    { key: 'status', displayKey: 'statusCell', header: 'Status', sortable: true },
    { key: 'action', displayKey: 'actionCell', header: 'Action' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Campaign Manager"
        description="Organize marketing initiatives, allocate media budgets, and coordinate platform rollouts."
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="bg-surface border border-border-custom hover:border-accent text-text-primary hover:text-accent font-sans text-xs px-3 py-2.5 rounded-badge flex items-center justify-center transition-colors cursor-pointer"
              title="Refresh Campaigns"
              disabled={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-accent hover:bg-accent-hover text-white font-sans text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Campaign</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start gap-3 text-sm font-sans">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Campaigns"
          value={totalCampaigns}
          icon={<Megaphone className="w-4 h-4 text-purple-500" />}
        />
        <MetricCard
          title="Active Campaigns"
          value={activeCampaigns}
          icon={<Calendar className="w-4 h-4 text-emerald-500" />}
        />
        <MetricCard
          title="Cumulative Budget"
          value={`$${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={<DollarSign className="w-4 h-4 text-blue-500" />}
        />
        <MetricCard
          title="Channels Covered"
          value={channelsCovered}
          icon={<Target className="w-4 h-4 text-accent" />}
        />
      </div>

      {/* Campaigns Data Table */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
          Active Client Campaigns
        </h3>
        <DataTable
          columns={columns}
          data={mappedCampaigns}
          searchKey="title"
          searchPlaceholder="Search campaigns..."
          loading={loading}
          pageSize={10}
        />
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-border-custom rounded-card overflow-hidden flex flex-col neumorphism-card-dark max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-text-primary uppercase tracking-wider">
                Create Campaign Initiative
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 font-sans text-xs">
              {/* Brand Select */}
              <div className="space-y-1.5">
                <label className="text-text-muted font-semibold uppercase tracking-wider">
                  Target Brand
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent transition-colors font-sans text-xs rounded-sm"
                  required
                >
                  <option value="" disabled>Select brand profile...</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-text-muted font-semibold uppercase tracking-wider">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent transition-colors font-sans text-xs rounded-sm"
                  placeholder="e.g. Q4 Growth Catalyst Launch"
                  required
                />
              </div>

              {/* Objective */}
              <div className="space-y-1.5">
                <label className="text-text-muted font-semibold uppercase tracking-wider">
                  Objective / Brief
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent transition-colors font-sans text-xs rounded-sm resize-none"
                  placeholder="Describe target achievements, KPIs, and content focus..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Budget */}
                <div className="space-y-1.5">
                  <label className="text-text-muted font-semibold uppercase tracking-wider">
                    Allocated Budget ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget === 0 ? '' : formData.budget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent transition-colors font-mono text-xs rounded-sm"
                    placeholder="5000"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-text-muted font-semibold uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent transition-colors font-sans text-xs rounded-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="text-text-muted font-semibold uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent transition-colors font-mono text-xs rounded-sm"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="text-text-muted font-semibold uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent transition-colors font-mono text-xs rounded-sm"
                    required
                  />
                </div>
              </div>

              {/* Channels (Checkboxes) */}
              <div className="space-y-2">
                <label className="text-text-muted font-semibold uppercase tracking-wider block">
                  Media Channels
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['linkedin', 'twitter', 'instagram', 'facebook'].map((ch) => (
                    <label
                      key={ch}
                      className="flex items-center gap-2.5 p-2 bg-background/50 border border-border-custom rounded-sm cursor-pointer select-none hover:bg-background transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(ch)}
                        onChange={() => handleCheckboxChange(ch)}
                        className="accent-accent w-3.5 h-3.5 rounded-sm border-border-custom bg-background focus:ring-0"
                      />
                      <span className="font-mono text-[10px] uppercase tracking-wider">
                        {ch === 'twitter' ? 'X / Twitter' : ch}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border-custom flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent border border-border-custom hover:border-text-primary text-text-muted hover:text-text-primary font-sans text-xs px-4 py-2 rounded-sm transition-colors cursor-pointer"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-white font-sans text-xs px-5 py-2 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  disabled={submitting}
                >
                  {submitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>{submitting ? 'Creating...' : 'Register Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
