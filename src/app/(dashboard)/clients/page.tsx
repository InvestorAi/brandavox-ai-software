// Brandavox CRM Dashboard - Clients Listing
// Location: src/app/(dashboard)/clients/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Users,
  Sparkles,
  AlertCircle,
  Plus,
  ChevronRight,
  DollarSign,
  X,
  Check
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  health_score: number;
  revenue: number;
  status: 'onboarding' | 'active' | 'at_risk' | 'churned';
  assigned_to: string;
}

const clientSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  company: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address').or(z.string().length(0)),
  phone: z.string(),
  revenue: z.coerce.number().nonnegative('Revenue must be positive'),
  notes: z.string(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      revenue: 0,
      notes: '',
    },
  });

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients');
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
      } else {
        setError(json.error || 'Failed to fetch clients');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit = async (values: ClientFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        reset();
        fetchClients(); // refresh list
      } else {
        setSubmitError(json.error || 'Failed to save client');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute metrics
  const totalClients = clients.length;
  const avgHealth = totalClients
    ? Math.round(clients.reduce((acc, curr) => acc + curr.health_score, 0) / totalClients)
    : 0;
  const totalMonthlyRevenue = clients.reduce((acc, curr) => acc + Number(curr.revenue), 0);
  const atRiskCount = clients.filter((c) => c.status === 'at_risk' || c.health_score < 50).length;

  // Pre-render cells for the DataTable
  const mappedClients = clients.map((row) => {
    let healthColor = 'text-text-muted';
    let healthBg = 'bg-background border-border-custom';
    if (row.health_score >= 80) {
      healthColor = 'text-emerald-400';
      healthBg = 'bg-emerald-500/10 border-emerald-500/20';
    } else if (row.health_score >= 50) {
      healthColor = 'text-amber-400';
      healthBg = 'bg-amber-500/10 border-amber-500/20';
    } else if (row.health_score > 0) {
      healthColor = 'text-red-400';
      healthBg = 'bg-red-500/10 border-red-500/20';
    }

    const statusColors = {
      onboarding: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      at_risk: 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse',
      churned: 'bg-zinc-500/10 text-zinc-400 border-zinc-700/20',
    };

    return {
      ...row,
      companyCell: (
        <span className="font-sans font-bold text-text-primary block text-sm">
          {row.company}
        </span>
      ),
      contactCell: (
        <div className="flex flex-col">
          <span className="text-text-primary text-xs font-semibold">{row.name}</span>
          {row.email && <span className="text-text-muted text-[10px] font-mono">{row.email}</span>}
        </div>
      ),
      statusCell: (
        <span
          className={`font-mono text-[9px] font-semibold tracking-wider px-2 py-0.5 border rounded-badge uppercase ${
            statusColors[row.status] || 'bg-background border-border-custom'
          }`}
        >
          {row.status}
        </span>
      ),
      revenueCell: (
        <span className="font-mono text-xs text-text-primary font-medium">
          ${Number(row.revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
      healthCell: (
        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 border rounded-badge ${healthBg} ${healthColor}`}
        >
          {row.health_score}%
        </span>
      ),
      actionCell: (
        <div className="flex justify-end">
          <Link
            href={`/clients/${row.id}`}
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
    { key: 'company', displayKey: 'companyCell', header: 'Client Accounts', sortable: true },
    { key: 'name', displayKey: 'contactCell', header: 'Contact Person', sortable: true },
    { key: 'status', displayKey: 'statusCell', header: 'Status' },
    { key: 'revenue', displayKey: 'revenueCell', header: 'Monthly Value', sortable: true },
    { key: 'health_score', displayKey: 'healthCell', header: 'Health Index', sortable: true },
    { key: 'actions', displayKey: 'actionCell', header: '' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Client Accounts"
        description="Monitor portfolio health levels, run AI CRM diagnostics, and access recovery outreach pipelines."
        actions={
          <button
            onClick={() => {
              reset();
              setIsModalOpen(true);
            }}
            className="bg-accent hover:bg-accent-hover text-white font-sans text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Client</span>
          </button>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <MetricCard
          title="Total Portfolio Value"
          value={isLoading ? '...' : `$${totalMonthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo`}
          icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
        />
        <MetricCard
          title="Active Accounts"
          value={isLoading ? '...' : totalClients.toString()}
          icon={<Users className="w-4 h-4 text-blue-500" />}
        />
        <MetricCard
          title="Portfolio Health Avg"
          value={isLoading ? '...' : `${avgHealth}%`}
          icon={<Sparkles className="w-4 h-4 text-accent" />}
        />
        <MetricCard
          title="At-Risk Alerts"
          value={isLoading ? '...' : atRiskCount.toString()}
          trend={atRiskCount > 0 ? { value: `${atRiskCount} warning`, isPositive: false } : undefined}
          icon={<AlertCircle className={`w-4 h-4 ${atRiskCount > 0 ? 'text-red-500 animate-pulse' : 'text-text-muted'}`} />}
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
          <span className="font-sans text-sm font-medium">Error loading accounts: {error}</span>
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          title="No registered clients"
          description="Build out your client lists to track accounts values, execute CRM health diagnostics, and generate invoice reports."
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-accent hover:bg-accent-hover text-white font-sans text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Client</span>
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
            Active Accounts
          </h3>
          <DataTable
            columns={columns}
            data={mappedClients}
            searchKey="company"
            searchPlaceholder="Filter clients by company..."
            pageSize={10}
          />
        </div>
      )}

      {/* FLOATING MODAL OVERLAY: REGISTER CLIENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-custom rounded-card w-full max-w-lg overflow-hidden flex flex-col animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
              <span className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">
                Register New Client
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              
              {/* Company Name */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nova Freight Systems"
                  className="w-full bg-background border border-border-custom rounded px-3.5 py-2 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                  {...register('company')}
                />
                {errors.company && (
                  <p className="text-xs font-mono text-red-400 mt-1">{errors.company.message}</p>
                )}
              </div>

              {/* Contact Name */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                  Contact Person *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stevie Nicks"
                  className="w-full bg-background border border-border-custom rounded px-3.5 py-2 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs font-mono text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                  Contact Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. stevie@novafreight.com"
                  className="w-full bg-background border border-border-custom rounded px-3.5 py-2 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs font-mono text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone & Value row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1-555-0144"
                    className="w-full bg-background border border-border-custom rounded px-3.5 py-2 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                    {...register('phone')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                    Monthly Revenue ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5000"
                    className="w-full bg-background border border-border-custom rounded px-3.5 py-2 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                    {...register('revenue')}
                  />
                  {errors.revenue && (
                    <p className="text-xs font-mono text-red-400 mt-1">{errors.revenue.message}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                  Manager Notes / Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide general client details, active payment status, communication details, or project challenges."
                  className="w-full bg-background border border-border-custom rounded px-3.5 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65 resize-none font-sans"
                  {...register('notes')}
                />
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded">
                  Error: {submitError}
                </div>
              )}

              {/* Actions footer */}
              <div className="flex justify-end gap-3 border-t border-border-custom pt-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-background hover:bg-surface border border-border-custom text-text-muted hover:text-text-primary font-mono text-xs px-4 py-2.5 rounded-badge transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-white disabled:opacity-50 font-mono text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Create Profile</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
