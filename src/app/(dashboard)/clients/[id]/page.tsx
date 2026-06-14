// Brandavox Client Strategic Console
// Location: src/app/(dashboard)/clients/[id]/page.tsx

'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Activity,
  MessageSquare,
  DollarSign,
  TrendingUp,
  FileText,
  Terminal,
  Printer,
  Plus,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Mail,
  Check,
  ClipboardList,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { InvoicePrintSheet } from '@/components/clients/InvoicePrintSheet';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  health_score: number;
  revenue: number;
  status: 'onboarding' | 'active' | 'at_risk' | 'churned';
  notes: string;
  health_details?: string;
}

interface RecoveryPlan {
  id: string;
  client_id: string;
  status: string;
  risk_score: number;
  strategy: string; // JSON array
  outreach_sequence: string; // JSON array of emails
  actions: string; // JSON array of tasks
}

interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function ClientConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Core data states
  const [client, setClient] = useState<Client | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Active view tab state
  const [activeTab, setActiveTab] = useState<string>('health');

  // AI Health Diagnostics state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [healthLogs, setHealthLogs] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // AI Recovery Plan state
  const [isGeneratingRecovery, setIsGeneratingRecovery] = useState<boolean>(false);
  const [recoveryLogs, setRecoveryLogs] = useState<string[]>([]);

  // Invoice builder states
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemInput[]>([
    { description: 'Social Media Management (Monthly Retainer)', quantity: 1, unitPrice: 3500 },
  ]);
  const [itemDesc, setItemDesc] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [showInvoicePrint, setShowInvoicePrint] = useState<boolean>(false);

  // Fetch client details
  async function loadData() {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/clients/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setClient(json.data.client);
        setRecoveryPlan(json.data.recoveryPlan);
      } else {
        setFetchError(json.error || 'Failed to load client data');
      }
    } catch (err: any) {
      setFetchError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  // Run AI CRM Health Diagnostics
  const runHealthAnalysis = async () => {
    setIsAnalyzing(true);
    setHealthLogs([]);
    setAnalysisResult(null);

    const logs = [
      'Initialize Lead CRM Analyst agent...',
      'Retrieving client record notes and logs...',
      'Auditing communication logs: latency increasing...',
      'Evaluating project completion metrics...',
      'Calculating churn probability mapping...',
      'Running Gemini Flash 2.0 pipeline...',
      'Zod schema output verification...',
      'Updating database health score record...',
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < logs.length) {
        setHealthLogs((prev) => [...prev, `[CRM LOG] ${logs[idx]}`]);
        idx++;
      } else {
        clearInterval(interval);
        triggerAnalysisApi();
      }
    }, 450);

    const triggerAnalysisApi = async () => {
      try {
        setHealthLogs((prev) => [...prev, '[CRM SYSTEM] Analyzing health details...']);
        const res = await fetch(`/api/clients/${id}/analyze-health`, {
          method: 'POST',
        });
        const json = await res.json();
        if (json.success && json.data) {
          setHealthLogs((prev) => [
            ...prev,
            `[CRM SYSTEM] Analysis completed. Churn Risk: ${json.data.analysis.riskLevel.toUpperCase()}`,
            `[CRM SYSTEM] New Health Index: ${json.data.analysis.healthScore}%`,
          ]);
          setAnalysisResult(json.data.analysis);
          setClient(json.data.client);
          
          setTimeout(() => {
            setIsAnalyzing(false);
          }, 1000);
        } else {
          setHealthLogs((prev) => [...prev, `[ERROR] Analysis failed: ${json.error}`]);
          setIsAnalyzing(false);
        }
      } catch (err: any) {
        setHealthLogs((prev) => [...prev, `[ERROR] Execution exception: ${err.message}`]);
        setIsAnalyzing(false);
      }
    };
  };

  // Run AI Recovery Plan Generation
  const runRecoveryGeneration = async () => {
    setIsGeneratingRecovery(true);
    setRecoveryLogs([]);

    const logs = [
      'Initialize Client Recovery & Win-Back agent...',
      'Reading client churn health factors...',
      'Loading copywriting tone guidelines...',
      'Compiling recovery strategies (3 items)...',
      'Generating custom re-engagement email sequence...',
      'Invoking AI Provider...',
      'Saving outreach sequence to database...',
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < logs.length) {
        setRecoveryLogs((prev) => [...prev, `[RECOVERY LOG] ${logs[idx]}`]);
        idx++;
      } else {
        clearInterval(interval);
        triggerRecoveryApi();
      }
    }, 450);

    const triggerRecoveryApi = async () => {
      try {
        setRecoveryLogs((prev) => [...prev, '[SYSTEM] Saving win-back Outreach sequence...']);
        const res = await fetch(`/api/clients/${id}/generate-recovery`, {
          method: 'POST',
        });
        const json = await res.json();
        if (json.success && json.data) {
          setRecoveryLogs((prev) => [...prev, '[SYSTEM] outreach sequence persisted successfully.']);
          setRecoveryPlan(json.data);
          
          setTimeout(() => {
            setIsGeneratingRecovery(false);
          }, 1000);
        } else {
          setRecoveryLogs((prev) => [...prev, `[ERROR] Win-back failed: ${json.error}`]);
          setIsGeneratingRecovery(false);
        }
      } catch (err: any) {
        setRecoveryLogs((prev) => [...prev, `[ERROR] Execution exception: ${err.message}`]);
        setIsGeneratingRecovery(false);
      }
    };
  };

  // Invoice builder actions
  const addInvoiceItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDesc || itemQty <= 0 || itemPrice <= 0) return;
    setInvoiceItems((prev) => [
      ...prev,
      { description: itemDesc, quantity: itemQty, unitPrice: itemPrice },
    ]);
    setItemDesc('');
    setItemQty(1);
    setItemPrice(0);
  };

  const removeInvoiceItem = (idx: number) => {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== idx));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-surface animate-pulse border border-border-custom rounded" />
        <div className="h-16 w-full bg-surface animate-pulse border border-border-custom rounded" />
        <div className="h-96 w-full bg-surface animate-pulse border border-border-custom rounded" />
      </div>
    );
  }

  if (fetchError || !client) {
    return (
      <div className="space-y-4 max-w-md mx-auto py-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-md font-bold text-text-primary font-display uppercase">Load Error</h3>
        <p className="text-xs text-text-muted">{fetchError || 'Unable to retrieve client details'}</p>
        <button
          onClick={loadData}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-badge text-xs font-mono transition-colors cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Parse health details
  let healthFactors = {
    communication: 100,
    projectSuccess: 100,
    revenueGrowth: 100,
    satisfaction: 100,
  };
  if (client.health_details) {
    try {
      healthFactors = JSON.parse(client.health_details);
    } catch (e) {
      // ignore
    }
  }

  // Parse recovery plan JSON arrays
  let strategyItems: string[] = [];
  let outreachItems: any[] = [];
  let actionItems: string[] = [];

  if (recoveryPlan) {
    try {
      strategyItems = JSON.parse(recoveryPlan.strategy);
      outreachItems = JSON.parse(recoveryPlan.outreach_sequence);
      actionItems = JSON.parse(recoveryPlan.actions);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="space-y-8">
      {/* Back Link Row */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/clients')}
          className="flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Accounts</span>
        </button>
      </div>

      <PageHeader
        title={client.company}
        description={`Console profile for contact ${client.name}. Run AI diagnostic checks, upsell reports, or generate invoices.`}
      />

      {/* TABS SELECTOR */}
      <div className="border-b border-border-custom flex overflow-x-auto select-none gap-2">
        {[
          { id: 'health', label: 'CRM Diagnostics', icon: Activity },
          { id: 'recovery', label: 'Recovery Suite', icon: ShieldAlert },
          { id: 'invoice', label: 'Invoice Desk', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-accent text-text-primary bg-surface/30'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: CRM DIAGNOSTICS */}
      {activeTab === 'health' && (
        <div className="space-y-8">
          
          {/* Main diagnostics block */}
          {isAnalyzing ? (
            <div className="bg-background border border-border-custom rounded-card p-6 font-mono text-xs space-y-4 text-emerald-400">
              <div className="flex items-center justify-between border-b border-border-custom pb-3 text-text-muted uppercase tracking-wider text-[10px]">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                  CRM Analyst log stream
                </span>
                <span className="animate-pulse">EVALUATING METRICS</span>
              </div>
              <div className="space-y-1.5 h-48 overflow-y-auto pr-2 custom-scrollbar">
                {healthLogs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
                <div className="w-2 h-4 bg-emerald-400 animate-blink inline-block" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Health Score circle & breakdown */}
              <div className="space-y-6">
                
                {/* Dial card */}
                <div className="bg-surface border border-border-custom rounded-card p-6 space-y-5 text-center">
                  <span className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider block text-left">
                    Account Health Score
                  </span>
                  
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center border-4 border-border-custom rounded-full">
                    <span className="font-display font-bold text-2xl text-text-primary">
                      {client.health_score}%
                    </span>
                  </div>

                  <span className={`font-mono text-[9px] font-bold px-2.5 py-0.5 border rounded-badge uppercase inline-block ${
                    client.health_score >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : client.health_score >= 50
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                  }`}>
                    {client.health_score >= 80 ? 'Healthy Account' : client.health_score >= 50 ? 'Warning Level' : 'Critical Churn Risk'}
                  </span>

                  <button
                    onClick={runHealthAnalysis}
                    className="w-full bg-background hover:bg-surface border border-border-custom hover:border-accent text-text-primary hover:text-accent font-mono text-xs py-2 rounded-badge flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-hover" />
                    <span>Run AI Diagnostics</span>
                  </button>
                </div>

                {/* Health Factors list */}
                <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                  <h4 className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-custom pb-2">
                    Diagnostic Breakdown
                  </h4>
                  <div className="space-y-4 font-mono text-xs">
                    
                    {/* Communication */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-text-primary text-[10px]">
                        <span>Communication Response</span>
                        <span>{healthFactors.communication}%</span>
                      </div>
                      <div className="w-full h-1 bg-background border border-border-custom rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${healthFactors.communication}%` }} />
                      </div>
                    </div>

                    {/* Project Success */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-text-primary text-[10px]">
                        <span>Project Milestone Velocity</span>
                        <span>{healthFactors.projectSuccess}%</span>
                      </div>
                      <div className="w-full h-1 bg-background border border-border-custom rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: `${healthFactors.projectSuccess}%` }} />
                      </div>
                    </div>

                    {/* Revenue Growth */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-text-primary text-[10px]">
                        <span>Account Revenue Stability</span>
                        <span>{healthFactors.revenueGrowth}%</span>
                      </div>
                      <div className="w-full h-1 bg-background border border-border-custom rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400" style={{ width: `${healthFactors.revenueGrowth}%` }} />
                      </div>
                    </div>

                    {/* Satisfaction */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-text-primary text-[10px]">
                        <span>Client Satisfaction Index</span>
                        <span>{healthFactors.satisfaction}%</span>
                      </div>
                      <div className="w-full h-1 bg-background border border-border-custom rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400" style={{ width: `${healthFactors.satisfaction}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column: AI insights and metadata */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Basic client profile */}
                <div className="bg-surface border border-border-custom rounded-card p-6 grid grid-cols-2 gap-6 text-xs font-sans">
                  <div>
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block">Company Address</span>
                    <p className="font-bold text-text-primary mt-0.5">{client.company}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block">Primary Contact</span>
                    <p className="font-bold text-text-primary mt-0.5">{client.name}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block">Contact Email</span>
                    <a href={`mailto:${client.email}`} className="text-accent hover:underline font-mono mt-0.5 block">{client.email || '—'}</a>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block">Monthly Value</span>
                    <p className="font-mono font-bold text-text-primary mt-0.5">${Number(client.revenue).toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 border-t border-border-custom pt-4">
                    <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block">Manager Interactions / Notes</span>
                    <p className="text-text-primary leading-relaxed mt-1">{client.notes || 'No manager notes registered'}</p>
                  </div>
                </div>

                {/* AI CRM Analyst report outputs */}
                {analysisResult ? (
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-border-custom pb-3">
                      <span className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
                        AI Diagnostic Report
                      </span>
                      <span className="font-mono text-[9px] text-text-muted">
                        GENERATED JUST NOW
                      </span>
                    </div>

                    {/* Churn Risk */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="block text-[9px] text-text-muted uppercase">Risk Level Rating</span>
                        <span className="font-bold text-red-400 uppercase">{analysisResult.riskLevel}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-text-muted uppercase">Churn Probability</span>
                        <span className="font-bold text-text-primary">{(analysisResult.churnProbability * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Insights list */}
                    <div className="space-y-2.5">
                      <span className="font-mono text-[10px] text-text-muted uppercase block">Account Insights</span>
                      <ul className="space-y-2 pl-4 list-disc text-xs leading-relaxed text-text-primary font-sans">
                        {analysisResult.insights.map((insight: string, i: number) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations list */}
                    <div className="space-y-2.5">
                      <span className="font-mono text-[10px] text-text-muted uppercase block">Immediate Actions Recommended</span>
                      <ul className="space-y-2 pl-4 list-disc text-xs leading-relaxed text-text-primary font-sans">
                        {analysisResult.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Upsell opportunities */}
                    {analysisResult.upsellOpportunities && analysisResult.upsellOpportunities.length > 0 && (
                      <div className="space-y-3 border-t border-border-custom/50 pt-4">
                        <span className="font-mono text-[10px] text-text-muted uppercase block">Expansion Opportunities</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {analysisResult.upsellOpportunities.map((op: any, i: number) => (
                            <div key={i} className="p-3 bg-background border border-border-custom rounded space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-text-primary">{op.service}</span>
                                <span className="font-mono text-emerald-400 text-[10px] font-bold">
                                  +${op.estimatedValue.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[10px] text-text-muted font-sans leading-normal">
                                {op.rationale}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="bg-surface border border-border-custom border-dashed rounded-card p-12 text-center space-y-4">
                    <ClipboardList className="w-8 h-8 text-text-muted/60 mx-auto" />
                    <div className="space-y-1">
                      <h5 className="font-sans font-bold text-sm text-text-primary">No Diagnostic Report Compiled</h5>
                      <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                        Deploy the CRM Analyst Agent to scan manager notes, evaluate health score metrics, and audit expansion opportunities.
                      </p>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: RECOVERY SUITE */}
      {activeTab === 'recovery' && (
        <div className="space-y-8">
          
          {isGeneratingRecovery ? (
            <div className="bg-background border border-border-custom rounded-card p-6 font-mono text-xs space-y-4 text-emerald-400">
              <div className="flex items-center justify-between border-b border-border-custom pb-3 text-text-muted uppercase tracking-wider text-[10px]">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                  Win-Back Agent log stream
                </span>
                <span className="animate-pulse">COMPILING EMAILS</span>
              </div>
              <div className="space-y-1.5 h-48 overflow-y-auto pr-2 custom-scrollbar">
                {recoveryLogs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
                <div className="w-2 h-4 bg-emerald-400 animate-blink inline-block" />
              </div>
            </div>
          ) : !recoveryPlan ? (
            /* NO RECOVERY PLAN WRITTEN */
            <div className="bg-surface border border-border-custom rounded-card p-12 text-center max-w-xl mx-auto space-y-6">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center rounded-full mx-auto animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-semibold text-base text-text-primary uppercase tracking-wider">
                  Win-Back Strategy uninitialized
                </h3>
                <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                  Nova Freight Systems has a health score of 45% (Critical). Deploy the AI Client Recovery Agent to
                  draft a customized re-engagement strategy and construct outreach email sequences.
                </p>
              </div>

              <button
                onClick={runRecoveryGeneration}
                className="bg-accent hover:bg-accent-hover text-white font-mono text-xs px-6 py-3 rounded-badge inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Initialize Recovery Campaign</span>
              </button>
            </div>
          ) : (
            /* RECOVERY PLAN EXISTS */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left column: Recovery strategies */}
              <div className="space-y-6">
                
                {/* Risk metrics card */}
                <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-text-muted uppercase">Risk Index Score</span>
                    <span className="font-bold text-red-400">{recoveryPlan.risk_score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-background border border-border-custom rounded-full overflow-hidden">
                    <div className="h-full bg-red-400" style={{ width: `${recoveryPlan.risk_score}%` }} />
                  </div>
                  <p className="text-[10px] text-text-muted font-sans leading-normal leading-relaxed">
                    This recovery track runs for 14 days. Ensure re-engagement emails are transmitted on scheduled intervals.
                  </p>
                  <button
                    onClick={runRecoveryGeneration}
                    className="w-full bg-background border border-border-custom hover:border-accent font-mono text-xs py-2 rounded-badge flex items-center justify-center gap-1.5 text-text-primary hover:text-accent transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Campaign</span>
                  </button>
                </div>

                {/* Priority action list */}
                <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                  <h4 className="font-mono text-xs font-bold text-text-muted uppercase border-b border-border-custom pb-2">
                    Priority Checklist
                  </h4>
                  <div className="space-y-3 font-mono text-xs text-text-primary">
                    {actionItems.map((act, i) => (
                      <div key={i} className="p-2 bg-background border border-border-custom rounded flex items-start gap-2.5">
                        <div className="w-4 h-4 border border-red-400/40 rounded flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="font-sans text-xs leading-normal">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Win-back strategies */}
                <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                  <h4 className="font-mono text-xs font-bold text-text-muted uppercase border-b border-border-custom pb-2">
                    Win-Back Strategies
                  </h4>
                  <ul className="space-y-3 text-xs text-text-primary font-sans leading-relaxed list-decimal pl-4">
                    {strategyItems.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Right column: Outreach email sequences */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                  <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider block border-b border-border-custom pb-3">
                    Outreach Sequence Campaigns
                  </span>

                  <div className="space-y-6">
                    {outreachItems.map((email: any, i: number) => (
                      <div key={i} className="p-5 bg-background border border-border-custom rounded space-y-4 font-sans text-xs">
                        <div className="flex justify-between items-center border-b border-border-custom/50 pb-2 text-[10px] font-mono text-text-muted uppercase">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-accent" />
                            Email outreach sequence {i + 1}
                          </span>
                          <span>Send Day {email.sendDay}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="font-mono text-text-muted text-[10px] block">SUBJECT LINE</span>
                          <span className="font-bold text-text-primary">{email.subject}</span>
                        </div>
                        <div className="space-y-1 border-t border-border-custom/30 pt-3">
                          <span className="font-mono text-text-muted text-[10px] block mb-1">EMAIL BODY</span>
                          <p className="text-text-primary leading-relaxed whitespace-pre-wrap font-sans bg-surface/40 p-4 border border-border-custom/40 rounded">
                            {email.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: INVOICE DESK */}
      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: invoice settings & form builder */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-border-custom rounded-card p-6 space-y-6">
              <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider border-b border-border-custom pb-3">
                Compile Invoice
              </h4>

              <form onSubmit={addInvoiceItem} className="space-y-4">
                
                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                    Item Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Brand Positioning Strategy"
                    className="w-full bg-background border border-border-custom rounded px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                  />
                </div>

                {/* Qty & Price row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-background border border-border-custom rounded px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                      Unit Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-background border border-border-custom rounded px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none font-mono"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!itemDesc || itemQty <= 0 || itemPrice <= 0}
                  className="w-full bg-background hover:bg-surface border border-border-custom hover:border-accent text-text-primary hover:text-accent font-mono text-xs py-2 rounded-badge flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>

              </form>

              {/* Print Action trigger */}
              <div className="border-t border-border-custom pt-6">
                <button
                  onClick={() => setShowInvoicePrint(true)}
                  disabled={invoiceItems.length === 0}
                  className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs py-2.5 rounded-badge flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Compile Invoice Sheet</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Active line item list previews */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
              <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider block border-b border-border-custom pb-3">
                Active Invoice Items
              </span>

              {invoiceItems.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs font-mono">
                  No line items added yet. Add items on the left to compile an invoice.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-border-custom">
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 text-xs font-sans">
                        <div className="space-y-0.5">
                          <span className="font-bold text-text-primary block">{item.description}</span>
                          <span className="text-text-muted font-mono text-[10px]">
                            Qty {item.quantity} × ${item.unitPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-bold text-text-primary">
                            ${(item.quantity * item.unitPrice).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeInvoiceItem(idx)}
                            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-badge transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary preview */}
                  <div className="border-t border-border-custom pt-4 flex justify-end">
                    <div className="text-right space-y-1 font-sans text-xs">
                      <div className="text-text-muted">
                        Subtotal:{' '}
                        <span className="font-mono text-text-primary font-bold ml-1">
                          ${invoiceItems.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* RENDER INVOICE PRINT SHEET IF SHOW STATE IS TRUE */}
      {showInvoicePrint && (
        <InvoicePrintSheet
          clientName={client.name}
          clientCompany={client.company}
          clientEmail={client.email}
          invoiceNumber={`INV-2026-${client.id.substring(0, 4).toUpperCase()}`}
          date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          dueDate={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          items={invoiceItems}
          onClose={() => setShowInvoicePrint(false)}
        />
      )}

    </div>
  );
}
