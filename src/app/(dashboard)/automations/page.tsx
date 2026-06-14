'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  GitBranch,
  Play,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      name: 'Auto-Post on Client Approval',
      trigger: 'Client approves calendar draft',
      action: 'Schedule publication queue and notify slack channel',
      isActive: true
    },
    {
      id: 'rule-2',
      name: 'Lead Health Warning Alert',
      trigger: 'Client health score drops below 60%',
      action: 'Generate outreach recovery email and alert manager',
      isActive: true
    }
  ]);

  const [newName, setNewName] = useState('');
  const [trigger, setTrigger] = useState('Client approves calendar draft');
  const [action, setAction] = useState('Schedule publication queue and notify slack channel');
  const [showAddForm, setShowAddForm] = useState(false);
  const [simulatingLogs, setSimulatingLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newName,
      trigger: trigger,
      action: action,
      isActive: true
    };

    setRules((prev) => [newRule, ...prev]);
    setNewName('');
    setShowAddForm(false);
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleRunSimulation = (rule: AutomationRule) => {
    setIsSimulating(true);
    setSimulatingLogs([]);

    const logs = [
      `[TRIGGER] Monitoring webhook payload events...`,
      `[TRIGGER] Condition met: "${rule.trigger}"`,
      `[WORKFLOW] Routing operational task to automation handler...`,
      `[ACTION] Executing: "${rule.action}"`,
      `[WORKFLOW] Successfully updated database indices and dispatched alerts.`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setSimulatingLogs((prev) => [...prev, log]);
        if (index === logs.length - 1) {
          setIsSimulating(false);
        }
      }, (index + 1) * 350);
    });
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title="Workflow Automation"
          description="Build conditional IF-THEN triggers to automate operational scripts, Slack updates, and calendar schedule postings."
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-center bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider py-2 px-4 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workflow</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-surface border border-border-custom p-6 rounded-card max-w-xl animate-fade-in">
          <form onSubmit={handleCreateRule} className="space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
              <GitBranch className="w-4 h-4 text-accent" />
              <span className="font-bold text-xs uppercase tracking-wider text-text-primary font-display">Create Automation Rule</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Workflow Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sync slack channel on client recovery"
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">IF Event Trigger</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none"
                >
                  <option value="Client approves calendar draft">Client approves calendar draft</option>
                  <option value="Client health score drops below 60%">Client health score drops below 60%</option>
                  <option value="Paid ad campaign ROAS drops below 1.5x">Paid ad campaign ROAS drops below 1.5x</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">THEN Action Dispatched</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none"
                >
                  <option value="Schedule publication queue and notify slack channel">Schedule post and alert Slack</option>
                  <option value="Generate outreach recovery email and alert manager">Draft recovery email and alert PM</option>
                  <option value="Pause ad campaign spend and trigger warning message">Pause ad and email alert</option>
                </select>
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
                Create workflow
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main interface grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Rules column list */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
            Active Automation Rules
          </span>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-surface border p-5 rounded-card space-y-4 hover:border-accent/40 transition-colors ${
                  rule.isActive ? 'border-border-custom' : 'border-zinc-800 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border-custom/50 pb-2.5">
                  <h5 className="font-bold text-xs text-text-primary font-display">{rule.name}</h5>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(rule.id)}
                      className={`py-0.5 px-2 border font-mono text-[9px] uppercase font-bold rounded ${
                        rule.isActive
                          ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                          : 'border-zinc-700 text-zinc-500 bg-zinc-800/30'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Muted'}
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-zinc-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Node layout */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center font-mono text-[9px] text-text-muted">
                  <div className="sm:col-span-2 p-2 bg-background border border-border-custom/80 rounded-sm">
                    <span className="block text-[8px] text-zinc-500 uppercase">IF Trigger</span>
                    <span className="font-bold text-text-primary text-[10px]">{rule.trigger}</span>
                  </div>

                  <div className="text-center text-accent font-bold text-lg hidden sm:block">➔</div>

                  <div className="sm:col-span-2 p-2 bg-background border border-border-custom/80 rounded-sm">
                    <span className="block text-[8px] text-zinc-500 uppercase">THEN Dispatch</span>
                    <span className="font-bold text-text-primary text-[10px]">{rule.action}</span>
                  </div>
                </div>

                {/* Run simulation */}
                {rule.isActive && (
                  <div className="flex justify-end pt-1">
                    <button
                      disabled={isSimulating}
                      onClick={() => handleRunSimulation(rule)}
                      className="py-1 px-2.5 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[9px] font-mono font-bold uppercase rounded-sm flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Test Simulation</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Simulation Monitor log */}
        <div className="lg:col-span-1 bg-surface border border-border-custom p-6 rounded-card space-y-4 font-mono text-[10px]">
          <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
            Automation Execution monitor
          </span>

          <div className="p-4 bg-zinc-950 border border-border-custom rounded-sm space-y-1.5 min-h-[160px] text-zinc-300">
            {simulatingLogs.length > 0 ? (
              simulatingLogs.map((log, index) => {
                let logColor = 'text-zinc-300';
                if (log.includes('[TRIGGER]')) logColor = 'text-emerald-400 font-bold';
                if (log.includes('[ACTION]')) logColor = 'text-accent font-bold';
                return (
                  <div key={index} className={logColor}>
                    {log}
                  </div>
                );
              })
            ) : (
              <div className="text-zinc-600 italic">No automations are running. Trigger a mock simulation rule to monitor executions.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
