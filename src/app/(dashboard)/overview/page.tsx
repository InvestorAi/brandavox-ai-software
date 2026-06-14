'use client';

import React from 'react';
import { DollarSign, Users as UsersIcon, Megaphone, Sparkles, Plus, Play, Download } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { OverviewCharts } from '@/components/dashboard/OverviewCharts';
import { DataTable } from '@/components/ui/DataTable';
import { kpiData, recentGenerations, dueTasks, activityLogs } from '@/lib/utils/mockData';
import Link from 'next/link';

export default function OverviewPage() {
  // Pre-render cells on the server to pass to the DataTable client component
  const mappedGenerations = recentGenerations.map((row) => ({
    ...row,
    agentCell: (
      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-background border border-border-custom rounded-badge uppercase text-accent">
        {row.agent}
      </span>
    ),
    promptCell: (
      <span className="truncate max-w-xs block font-medium text-text-primary">
        {row.prompt}
      </span>
    ),
    tokensCell: (
      <span className="font-mono text-xs text-text-primary">
        {row.tokensUsed.toLocaleString()}
      </span>
    ),
    timeCell: (
      <span className="text-text-muted text-xs">
        {row.timestamp}
      </span>
    ),
  }));

  const generationColumns = [
    { key: 'agent', displayKey: 'agentCell', header: 'Agent', sortable: true },
    { key: 'prompt', displayKey: 'promptCell', header: 'Prompt Context' },
    { key: 'tokensUsed', displayKey: 'tokensCell', header: 'Tokens', sortable: true },
    { key: 'timestamp', displayKey: 'timeCell', header: 'Executed' },
  ];

  // Pre-render task cells
  const mappedTasks = dueTasks.map((row) => {
    const priorityColors = {
      urgent: 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse',
      high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      low: 'bg-zinc-500/10 text-zinc-400 border-zinc-700/20',
    };

    return {
      ...row,
      titleCell: (
        <span className="font-medium text-text-primary block max-w-[180px] truncate">
          {row.title}
        </span>
      ),
      priorityCell: (
        <span
          className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-badge uppercase border ${
            priorityColors[row.priority]
          }`}
        >
          {row.priority}
        </span>
      ),
      dueDateCell: (
        <span className="text-text-muted text-xs">{row.dueDate}</span>
      ),
    };
  });

  const taskColumns = [
    { key: 'title', displayKey: 'titleCell', header: 'Task Action' },
    { key: 'client', header: 'Client', sortable: true },
    { key: 'priority', displayKey: 'priorityCell', header: 'Priority', sortable: true },
    { key: 'dueDate', displayKey: 'dueDateCell', header: 'Due Date' },
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,KPI,Value,Trend\n" +
      `Revenue,${kpiData.revenue.value.replace(/,/g, '')},${kpiData.revenue.trend}\n` +
      `Clients,${kpiData.clients.value},${kpiData.clients.trend}\n` +
      `Campaigns,${kpiData.campaigns.value},${kpiData.campaigns.trend}\n` +
      `Generations,${kpiData.generations.value.replace(/,/g, '')},${kpiData.generations.trend}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "brandavox_kpi_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        description="Real-time agency operations, brand performance diagnostics, and campaign execution."
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-surface border border-border-custom hover:border-accent text-text-primary hover:text-accent font-sans text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/brands/new"
              className="bg-surface border border-border-custom hover:border-accent text-text-primary hover:text-accent font-sans text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Brand</span>
            </Link>
            <Link
              href="/creative"
              className="bg-accent hover:bg-accent-hover text-white font-sans text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Agent</span>
            </Link>
          </div>
        }
      />


      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue (Monthly)"
          value={kpiData.revenue.value}
          trend={kpiData.revenue.trend}
          icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
        />
        <MetricCard
          title="Active Clients"
          value={kpiData.clients.value}
          trend={kpiData.clients.trend}
          icon={<UsersIcon className="w-4 h-4 text-blue-500" />}
        />
        <MetricCard
          title="Active Campaigns"
          value={kpiData.campaigns.value}
          trend={kpiData.campaigns.trend}
          icon={<Megaphone className="w-4 h-4 text-purple-500" />}
        />
        <MetricCard
          title="AI Generations"
          value={kpiData.generations.value}
          trend={kpiData.generations.trend}
          icon={<Sparkles className="w-4 h-4 text-accent" />}
        />
      </div>

      {/* Row 2: Charts Panel */}
      <OverviewCharts />

      {/* Row 3: Operation Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent AI Generations Table */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
            Recent AI Generations
          </h3>
          <DataTable
            columns={generationColumns}
            data={mappedGenerations}
            searchKey="prompt"
            searchPlaceholder="Filter promotions / ideas..."
            pageSize={5}
          />
        </div>

        {/* Due Tasks Checklist */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
            Operational Checklist
          </h3>
          <DataTable
            columns={taskColumns}
            data={mappedTasks}
            searchKey="title"
            searchPlaceholder="Search task checklists..."
            pageSize={5}
          />
        </div>
      </div>

      {/* Row 4: Workspace Activity Log Feed */}
      <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4 neumorphism-card-dark">
        <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
          Workspace Activity Feed
        </h3>

        <div className="relative border-l border-border-custom pl-6 space-y-6 ml-3">
          {activityLogs.map((log) => (
            <div key={log.id} className="relative flex items-start justify-between text-sm">
              {/* Timeline dot */}
              <span className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-accent border-4 border-surface ring-1 ring-border-custom" />
              
              <div className="space-y-1 font-sans">
                <span className="font-bold text-text-primary">{log.user}</span>{' '}
                <span className="text-text-muted">{log.action}</span>{' '}
                <span className="font-mono text-xs text-text-primary bg-background/50 border border-border-custom px-1.5 py-0.5 rounded">
                  {log.target}
                </span>
              </div>

              <span className="font-mono text-[10px] text-text-muted shrink-0 ml-4">
                {log.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
