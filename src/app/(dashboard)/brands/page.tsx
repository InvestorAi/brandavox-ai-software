// Brandavox Brands Dashboard Index
// Location: src/app/(dashboard)/brands/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Sparkles, AlertCircle, Plus, Eye, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';

interface Brand {
  id: string;
  name: string;
  industry: string;
  website: string;
  brand_score: number;
  status: string;
  created_at: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch('/api/brands');
        const json = await res.json();
        if (json.success) {
          setBrands(json.data);
        } else {
          setError(json.error || 'Failed to fetch brands');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBrands();
  }, []);

  // Compute metrics
  const totalBrands = brands.length;
  const avgScore = totalBrands
    ? Math.round(brands.reduce((acc, curr) => acc + curr.brand_score, 0) / totalBrands)
    : 0;
  const strategicCompleted = brands.filter((b) => b.brand_score > 0).length;

  // Pre-render cells for the DataTable
  const mappedBrands = brands.map((row) => {
    let scoreColor = 'text-text-muted';
    let scoreBg = 'bg-background border-border-custom';
    if (row.brand_score >= 80) {
      scoreColor = 'text-emerald-400';
      scoreBg = 'bg-emerald-500/10 border-emerald-500/20';
    } else if (row.brand_score >= 50) {
      scoreColor = 'text-amber-400';
      scoreBg = 'bg-amber-500/10 border-amber-500/20';
    } else if (row.brand_score > 0) {
      scoreColor = 'text-red-400';
      scoreBg = 'bg-red-500/10 border-red-500/20';
    }

    return {
      ...row,
      nameCell: (
        <span className="font-sans font-bold text-text-primary block text-sm">
          {row.name}
        </span>
      ),
      industryCell: (
        <span className="text-text-muted text-xs font-medium">{row.industry}</span>
      ),
      websiteCell: row.website ? (
        <a
          href={row.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline font-mono text-xs"
        >
          {row.website.replace(/^https?:\/\/(www\.)?/, '')}
        </a>
      ) : (
        <span className="text-text-muted text-xs font-mono">—</span>
      ),
      scoreCell: (
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 border rounded-badge ${scoreBg} ${scoreColor}`}
          >
            {row.brand_score > 0 ? `${row.brand_score}%` : 'Uninitialized'}
          </span>
        </div>
      ),
      statusCell: (
        <span className="font-mono text-[10px] font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-badge">
          {row.status}
        </span>
      ),
      actionCell: (
        <div className="flex justify-end">
          <Link
            href={`/brands/${row.id}`}
            className="flex items-center gap-1 font-mono text-xs text-text-muted hover:text-accent border border-border-custom hover:border-accent bg-surface px-2.5 py-1 rounded-badge transition-colors cursor-pointer"
          >
            <span>Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    };
  });

  const columns = [
    { key: 'name', displayKey: 'nameCell', header: 'Brand Name', sortable: true },
    { key: 'industry', displayKey: 'industryCell', header: 'Industry', sortable: true },
    { key: 'website', displayKey: 'websiteCell', header: 'Website' },
    { key: 'brand_score', displayKey: 'scoreCell', header: 'Brand Score', sortable: true },
    { key: 'status', displayKey: 'statusCell', header: 'Status' },
    { key: 'actions', displayKey: 'actionCell', header: '' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Brands Portfolio"
        description="Configure target audiences, define brand voice systems, and map organizational identities."
        actions={
          <Link
            href="/brands/new"
            className="bg-accent hover:bg-accent-hover text-white font-sans text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Brand</span>
          </Link>
        }
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Total Registered Brands"
          value={isLoading ? '...' : totalBrands.toString()}
          icon={<Target className="w-4 h-4 text-accent" />}
        />
        <MetricCard
          title="Avg Strategy Score"
          value={isLoading ? '...' : `${avgScore}%`}
          icon={<Sparkles className="w-4 h-4 text-amber-500" />}
        />
        <MetricCard
          title="Strategic Alignments"
          value={isLoading ? '...' : `${strategicCompleted} / ${totalBrands}`}
          icon={<AlertCircle className="w-4 h-4 text-emerald-500" />}
        />
      </div>

      {/* Main Table Panel */}
      {isLoading ? (
        <div className="bg-surface border border-border-custom rounded-card p-8 space-y-4">
          <div className="h-6 w-48 bg-background border border-border-custom animate-pulse rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 w-full bg-background border border-border-custom/50 animate-pulse rounded" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-surface border border-red-500/20 text-red-400 rounded-card p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-sans text-sm font-medium">Error loading portfolio: {error}</span>
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          title="No registered brands"
          description="To run copywriting audits, social calendars, or campaign creations, you must first register a brand identity."
          action={
            <Link
              href="/brands/new"
              className="bg-accent hover:bg-accent-hover text-white font-sans text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Brand</span>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
            Brand Records
          </h3>
          <DataTable
            columns={columns}
            data={mappedBrands}
            searchKey="name"
            searchPlaceholder="Filter brands by name..."
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
}
