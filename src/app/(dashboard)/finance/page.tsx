'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  CreditCard,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';

interface Proposal {
  id: string;
  clientName: string;
  projectTitle: string;
  budget: number;
  status: 'draft' | 'sent' | 'signed' | 'declined';
}

export default function FinanceHubPage() {
  const [proposals, setProposals] = useState<Proposal[]>([
    { id: 'prop-1', clientName: 'Pulse Retail', projectTitle: 'Q3 Social Launch', budget: 4500, status: 'signed' },
    { id: 'prop-2', clientName: 'Shopify Merchant', projectTitle: 'Checkout Speed Campaign', budget: 3200, status: 'sent' },
    { id: 'prop-3', clientName: 'Alpha Tech', projectTitle: 'Developer Brand positioning', budget: 7500, status: 'draft' }
  ]);

  const [newClient, setNewClient] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBudget, setNewBudget] = useState(1500);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newTitle.trim()) return;

    const newProp: Proposal = {
      id: `prop-${Date.now()}`,
      clientName: newClient,
      projectTitle: newTitle,
      budget: newBudget,
      status: 'draft'
    };

    setProposals((prev) => [newProp, ...prev]);
    setNewClient('');
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateStatus = (id: string, nextStatus: 'draft' | 'sent' | 'signed') => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title="Finance & Proposals"
          description="Track monthly recurring revenues, register itemized marketing campaigns budgets, and configure client contract proposals."
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-center bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider py-2 px-4 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      {/* Financial Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface border border-border-custom p-5 rounded-card space-y-1">
          <span className="text-[9px] text-text-muted font-mono block uppercase">Monthly Recurring (MRR)</span>
          <span className="text-xl font-bold text-text-primary">$15,200.00</span>
        </div>
        <div className="bg-surface border border-border-custom p-5 rounded-card space-y-1">
          <span className="text-[9px] text-text-muted font-mono block uppercase">Total Gross Pipeline</span>
          <span className="text-xl font-bold text-accent">$32,450.00</span>
        </div>
        <div className="bg-surface border border-border-custom p-5 rounded-card space-y-1">
          <span className="text-[9px] text-text-muted font-mono block uppercase">Monthly Expenses</span>
          <span className="text-xl font-bold text-text-primary">$4,120.00</span>
        </div>
        <div className="bg-surface border border-border-custom p-5 rounded-card space-y-1">
          <span className="text-[9px] text-text-muted font-mono block uppercase">Average Contract Value</span>
          <span className="text-xl font-bold text-emerald-400">$5,075.00</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Proposal List Desk */}
        <div className="lg:col-span-2 space-y-6">
          
          {showAddForm && (
            <div className="bg-surface border border-border-custom p-6 rounded-card animate-fade-in">
              <form onSubmit={handleCreateProposal} className="space-y-4 font-sans text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
                  <CreditCard className="w-4 h-4 text-accent" />
                  <span className="font-bold text-xs uppercase tracking-wider text-text-primary font-display">Create Quote Proposal</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Client Entity</label>
                    <input
                      type="text"
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      placeholder="e.g. Pulse Retail"
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Campaign Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Social Launch"
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Budget Amount ($)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-mono"
                    required
                  />
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
                    Generate Proposal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Proposals queue */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
              Active Proposals Pipeline
            </span>

            <div className="space-y-3 font-sans">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-background border border-border-custom rounded-sm p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-accent/40 transition-colors"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-text-primary">{prop.projectTitle}</h5>
                    <div className="flex gap-3 text-[10px] text-text-muted font-mono uppercase">
                      <span>Client: {prop.clientName}</span>
                      <span>Budget: ${prop.budget.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 border font-mono text-[9px] uppercase font-bold rounded ${
                      prop.status === 'signed'
                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                        : prop.status === 'sent'
                        ? 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                        : 'border-zinc-700 text-zinc-400 bg-zinc-800/50'
                    }`}>
                      {prop.status}
                    </span>

                    {/* Controls */}
                    <div className="flex gap-1">
                      {prop.status === 'draft' && (
                        <button
                          onClick={() => handleUpdateStatus(prop.id, 'sent')}
                          className="py-1 px-2.5 bg-zinc-900 border border-border-custom hover:border-accent font-mono text-[9px] uppercase font-bold text-text-primary rounded-sm cursor-pointer"
                        >
                          Dispatch
                        </button>
                      )}
                      {prop.status === 'sent' && (
                        <button
                          onClick={() => handleUpdateStatus(prop.id, 'signed')}
                          className="py-1 px-2.5 bg-accent hover:bg-accent-hover font-mono text-[9px] uppercase font-bold text-white rounded-sm cursor-pointer"
                        >
                          Accept Sign
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Quote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Expense Analysis */}
        <div className="lg:col-span-1 bg-surface border border-border-custom p-6 rounded-card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Expenses Breakdown
            </h3>
          </div>

          {/* Swiss Modernist Chart Bar Blocks */}
          <div className="space-y-4 font-mono text-[10px] text-text-muted">
            {[
              { name: 'AI Generation APIs', amount: '$1,200', pct: '29.1%' },
              { name: 'Cloud Server node', amount: '$420', pct: '10.2%' },
              { name: 'Paid Ads margins', amount: '$1,800', pct: '43.7%' },
              { name: 'Legal Registries', amount: '$700', pct: '17.0%' }
            ].map((exp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-text-primary">
                  <span className="font-bold">{exp.name}</span>
                  <span>{exp.amount} ({exp.pct})</span>
                </div>
                <div className="w-full h-2 bg-background border border-border-custom/50 rounded-sm overflow-hidden">
                  <div style={{ width: exp.pct }} className="h-full bg-accent" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border-custom/60 pt-4 flex gap-2 font-mono text-[9px] text-zinc-500 bg-background/35 p-3 rounded-sm">
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-accent" />
            <span>Outbound payments synced to Stripe and Paystack nodes successfully.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
