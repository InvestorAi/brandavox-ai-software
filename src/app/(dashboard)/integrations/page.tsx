'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Plug,
  Check,
  AlertCircle,
  RefreshCw,
  Settings,
  Mail,
  Send,
  ShieldAlert,
  List,
  CheckCircle2,
  Database
} from 'lucide-react';

interface IntegrationApp {
  id: string;
  name: string;
  category: 'storage' | 'collaboration' | 'marketing' | 'ecommerce';
  description: string;
  isConnected: boolean;
}

export default function IntegrationsPage() {
  const [apps, setApps] = useState<IntegrationApp[]>([
    {
      id: 'slack',
      name: 'Slack Connection',
      category: 'collaboration',
      description: 'Stream system warnings and campaign logs directly into dedicated Slack channels.',
      isConnected: true
    },
    {
      id: 'gdrive',
      name: 'Google Drive Sync',
      category: 'storage',
      description: 'Automatically export finalized PDF strategies, brand mockups, and client bills.',
      isConnected: false
    },
    {
      id: 'notion',
      name: 'Notion Sync',
      category: 'collaboration',
      description: 'Export structured marketing campaign logs and positioning content pillars directly to databases.',
      isConnected: false
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp Relay',
      category: 'marketing',
      description: 'Synchronize CRM leads and outreach lists directly to newsletter audience segments.',
      isConnected: true
    },
    {
      id: 'shopify',
      name: 'Shopify Core',
      category: 'ecommerce',
      description: 'Sync order volumes, checkouts speeds, and client products to audit CRM health.',
      isConnected: false
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM Link',
      category: 'marketing',
      description: 'Relay client communications, meeting notes, and deal pipelines.',
      isConnected: false
    }
  ]);

  // Email Marketing provider configuration states
  const [activeSyncProvider, setActiveSyncProvider] = useState<'zeptomail' | 'aws_ses' | 'alibaba_directmail'>('aws_ses');
  const [authRoute, setAuthRoute] = useState<'zeptomail' | 'aws_ses' | 'alibaba_directmail'>('zeptomail');
  const [transactionalRoute, setTransactionalRoute] = useState<'zeptomail' | 'aws_ses' | 'alibaba_directmail'>('aws_ses');
  const [marketingRoute, setMarketingRoute] = useState<'zeptomail' | 'aws_ses' | 'alibaba_directmail'>('alibaba_directmail');
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  // Credentials states
  const [zeptoToken, setZeptoToken] = useState('zoho_zepto_live_tk_981a2');
  const [zeptoDomain, setZeptoDomain] = useState('mail.brandavox.ai');
  
  const [awsAccessKey, setAwsAccessKey] = useState('AKIAIOSFODNN7EXAMPLE');
  const [awsSecretKey, setAwsSecretKey] = useState('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  
  const [alibabaAccessId, setAlibabaAccessId] = useState('LTAI5tN8Gq3n5ZEXAMPLE');
  const [alibabaAccessSecret, setAlibabaAccessSecret] = useState('9yKjVdF9eHEXAMPLE8s9dY8z9k');
  const [alibabaAccountName, setAlibabaAccountName] = useState('sender@directmail.brandavox.ai');

  // Page Action states
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [syncingLeads, setSyncingLeads] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load configuration from API
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await fetch('/api/developer/email-config');
        const json = await res.json();
        if (json.success) {
          setActiveSyncProvider(json.data.activeSyncProvider);
          setAuthRoute(json.data.authRoute);
          setTransactionalRoute(json.data.transactionalRoute);
          setMarketingRoute(json.data.marketingRoute);
          setSyncHistory(json.data.syncHistory || []);
        } else {
          setErrorMessage(json.error || 'Failed to fetch settings from mock DB.');
        }
      } catch (err: any) {
        console.error('Error fetching email integrations config:', err);
        setErrorMessage(err.message || 'Error connecting to API settings route.');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleToggleConnect = (id: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const nextState = !app.isConnected;
          if (nextState) {
            alert(`Authorized integration connection with ${app.name} service API.`);
          }
          return { ...app, isConnected: nextState };
        }
        return app;
      })
    );
  };

  // Save Settings handler
  const handleSaveEmailConfig = async () => {
    try {
      setSavingSettings(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await fetch('/api/developer/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeSyncProvider,
          authRoute,
          transactionalRoute,
          marketingRoute
        })
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMessage('Email engine routing configurations saved successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(json.error || 'Failed to save configuration.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error updating settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Trigger manual synchronization of CRM leads to the selected provider
  const handleSyncLeadsNow = async () => {
    try {
      setSyncingLeads(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await fetch('/api/developer/email-config/sync-now', {
        method: 'POST'
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMessage(`Lead synchronization successful! Synced ${json.data.syncedCount} new contacts to ${json.data.activeSyncProvider.toUpperCase()}.`);
        
        // Reload settings to get updated logs
        const confRes = await fetch('/api/developer/email-config');
        const confJson = await confRes.json();
        if (confJson.success) {
          setSyncHistory(confJson.data.syncHistory || []);
        }
        
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(json.error || 'Manual synchronization failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error triggering manual sync route.');
    } finally {
      setSyncingLeads(false);
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs pb-16">
      <PageHeader
        title="Integrations Registry"
        description="Connect Brandavox AI to Slack, Google Drive, Notion, HubSpot, and manage multi-engine transactional email providers."
      />

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-surface border border-border-custom rounded-card p-5 space-y-4 hover:border-accent/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold rounded-sm text-accent text-[11px]">
                    {app.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-text-primary text-xs font-display">{app.name}</h4>
                </div>

                <span className={`px-2 py-0.5 border font-mono text-[9px] uppercase font-bold rounded ${
                  app.isConnected
                    ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                    : 'border-zinc-700 text-zinc-500 bg-zinc-800/30'
                }`}>
                  {app.isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>

              <p className="text-text-muted leading-relaxed text-[11px] pt-1">
                {app.description}
              </p>
            </div>

            <div className="border-t border-border-custom/40 pt-3 flex justify-between items-center">
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                Category: {app.category}
              </span>

              <button
                onClick={() => handleToggleConnect(app.id)}
                className={`py-1 px-3 border font-mono text-[9px] uppercase font-bold rounded-sm cursor-pointer transition-colors ${
                  app.isConnected
                    ? 'border-red-500/20 text-red-400 hover:bg-red-500/5'
                    : 'border-border-custom text-text-primary hover:bg-zinc-800'
                }`}
              >
                {app.isConnected ? 'Disconnect' : 'Authorize Link'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-badge flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-[10px] mb-0.5">Success Response</span>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-badge flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-[10px] mb-0.5">Error Response</span>
            <p className="font-mono">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Senior Email Provider Integrations & Routing Panel */}
      <div className="bg-surface border border-border-custom rounded-card p-6 space-y-6">
        <div className="pb-4 border-b border-border-custom flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" />
              <span>Sync on Registration & Delivery Engines</span>
            </h3>
            <p className="text-text-muted text-[11px]">
              Provision credentials and select routing endpoints for Authentication, Transactional Alerts, and Campaign outreach across ZeptoMail, Amazon SES, and Alibaba Cloud DirectMail.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSyncLeadsNow}
              disabled={syncingLeads || loading}
              className="px-4 py-2 bg-background border border-border-custom hover:border-accent text-text-primary rounded-badge font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer text-[10px]"
            >
              {syncingLeads ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing Leads...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Force Lead Sync Now</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveEmailConfig}
              disabled={savingSettings || loading}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-badge uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer text-[10px]"
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Settings className="w-3.5 h-3.5" />
                  <span>Save Config</span>
                </>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 gap-2 text-text-muted">
            <RefreshCw className="w-6 h-6 animate-spin text-accent" />
            <span className="font-mono text-[9px] uppercase tracking-widest">Loading Delivery Configurations...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Column 1 & 2: Provider Setup Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ZeptoMail Config */}
              <div className="border border-border-custom rounded p-4 bg-background/25 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border-custom/40">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[8px] font-bold text-blue-400">Z</span>
                    <h4 className="font-mono font-bold text-text-primary text-xs uppercase">ZeptoMail (Zoho)</h4>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-text-muted">Highly Secure SMTP API</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-text-muted uppercase">Send Mail Token</label>
                    <input
                      type="password"
                      value={zeptoToken}
                      onChange={(e) => setZeptoToken(e.target.value)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-text-muted uppercase">Verified Sending Domain</label>
                    <input
                      type="text"
                      value={zeptoDomain}
                      onChange={(e) => setZeptoDomain(e.target.value)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* AWS SES Config */}
              <div className="border border-border-custom rounded p-4 bg-background/25 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border-custom/40">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-[8px] font-bold text-yellow-400">A</span>
                    <h4 className="font-mono font-bold text-text-primary text-xs uppercase">Amazon SES</h4>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-text-muted">High Volume Delivery</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="font-mono text-[9px] text-text-muted uppercase">AWS Access Key ID</label>
                    <input
                      type="text"
                      value={awsAccessKey}
                      onChange={(e) => setAwsAccessKey(e.target.value)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="font-mono text-[9px] text-text-muted uppercase">AWS Secret Access Key</label>
                    <input
                      type="password"
                      value={awsSecretKey}
                      onChange={(e) => setAwsSecretKey(e.target.value)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="font-mono text-[9px] text-text-muted uppercase">AWS Region</label>
                    <input
                      type="text"
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Alibaba Cloud DirectMail Config */}
              <div className="border border-border-custom rounded p-4 bg-background/25 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border-custom/40">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[8px] font-bold text-orange-400">AL</span>
                    <h4 className="font-mono font-bold text-text-primary text-xs uppercase">Alibaba Cloud DirectMail</h4>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-text-muted">Global Enterprise routing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="font-mono text-[9px] text-text-muted uppercase">Access Key ID</label>
                    <input
                      type="text"
                      value={alibabaAccessId}
                      onChange={(e) => setAlibabaAccessId(e.target.value)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="font-mono text-[9px] text-text-muted uppercase">Access Key Secret</label>
                    <input
                      type="password"
                      value={alibabaAccessSecret}
                      onChange={(e) => setAlibabaAccessSecret(e.target.value)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="font-mono text-[9px] text-text-muted uppercase">DirectMail Account</label>
                    <input
                      type="text"
                      value={alibabaAccountName}
                      onChange={(e) => setAlibabaAccountName(e.target.value)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Sync Explanation Block */}
              <div className="border border-accent/20 bg-accent/5 p-4 rounded-badge flex gap-3 text-xs leading-relaxed text-text-muted">
                <ShieldAlert className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <span className="font-semibold text-text-primary block font-display">How Email Routing Synchronization Works</span>
                  <p>
                    On user signup, Brandavox AI filters email inputs against disposable email databases to block burners. 
                    If valid, the platform schedules an asynchronous task to synchronize the profile to the selected **Registration Sync Engine** contact list. 
                    Authentication codes, Transactional notifications, and Marketing campaigns are routed dynamically through independent credentials to avoid IP address blocklisting and maximize inbox delivery rates.
                  </p>
                </div>
              </div>

            </div>

            {/* Column 3: Active Routing Selections */}
            <div className="space-y-6">
              <div className="border border-border-custom rounded-card p-5 bg-background/25 space-y-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary pb-2 border-b border-border-custom/40">
                  Dynamic Delivery Routing
                </h4>

                <div className="space-y-4">
                  {/* Sync Provider */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-text-muted uppercase block">Registration Sync Engine</label>
                    <select
                      value={activeSyncProvider}
                      onChange={(e) => setActiveSyncProvider(e.target.value as any)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs font-mono text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="zeptomail">ZeptoMail API Relay</option>
                      <option value="aws_ses">Amazon SES Engine</option>
                      <option value="alibaba_directmail">Alibaba DirectMail</option>
                    </select>
                    <p className="text-[9px] text-text-muted pt-0.5 font-sans leading-relaxed">
                      Provider that receives new lead contact updates during registration.
                    </p>
                  </div>

                  {/* Auth Route */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-text-muted uppercase block">Authentication / OTP Route</label>
                    <select
                      value={authRoute}
                      onChange={(e) => setAuthRoute(e.target.value as any)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs font-mono text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="zeptomail">ZeptoMail API Relay</option>
                      <option value="aws_ses">Amazon SES Engine</option>
                      <option value="alibaba_directmail">Alibaba DirectMail</option>
                    </select>
                  </div>

                  {/* Transactional Route */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-text-muted uppercase block">Transactional Alerts Route</label>
                    <select
                      value={transactionalRoute}
                      onChange={(e) => setTransactionalRoute(e.target.value as any)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs font-mono text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="zeptomail">ZeptoMail API Relay</option>
                      <option value="aws_ses">Amazon SES Engine</option>
                      <option value="alibaba_directmail">Alibaba DirectMail</option>
                    </select>
                  </div>

                  {/* Marketing Route */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-text-muted uppercase block">Marketing Campaigns Route</label>
                    <select
                      value={marketingRoute}
                      onChange={(e) => setMarketingRoute(e.target.value as any)}
                      className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs font-mono text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="zeptomail">ZeptoMail API Relay</option>
                      <option value="aws_ses">Amazon SES Engine</option>
                      <option value="alibaba_directmail">Alibaba DirectMail</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="border border-border-custom rounded-card p-5 bg-background/25 space-y-3 font-mono text-[10px]">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary pb-1 border-b border-border-custom/40">
                  Telemetry Health status
                </h4>
                <div className="flex justify-between items-center py-1 border-b border-border-custom/20">
                  <span className="text-text-muted uppercase">Burner Blocker:</span>
                  <span className="font-bold text-emerald-400">ACTIVE (WAF Filter)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border-custom/20">
                  <span className="text-text-muted uppercase">Sync Queue Latency:</span>
                  <span className="font-bold text-text-primary">18ms (Async Event)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-muted uppercase">Bounce Safeguard:</span>
                  <span className="font-bold text-emerald-400">99.8% Safety Index</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Sync logs segment */}
        {!loading && (
          <div className="space-y-4 pt-6 border-t border-border-custom">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-accent" />
              <span>Email Provider Synchronization History</span>
            </h4>

            <div className="border border-border-custom rounded overflow-hidden">
              <table className="w-full border-collapse text-left font-mono text-[10px]">
                <thead>
                  <tr className="bg-background border-b border-border-custom text-text-muted select-none">
                    <th className="p-3 font-semibold uppercase">Log ID</th>
                    <th className="p-3 font-semibold uppercase">Lead Email</th>
                    <th className="p-3 font-semibold uppercase">Full Name</th>
                    <th className="p-3 font-semibold uppercase">Routed Engine</th>
                    <th className="p-3 font-semibold uppercase">Sync Status</th>
                    <th className="p-3 font-semibold uppercase text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {syncHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted italic">
                        No synchronization history logs found. Trigger a manual sync or register a user to test.
                      </td>
                    </tr>
                  ) : (
                    syncHistory.map((log) => (
                      <tr key={log.id} className="hover:bg-background/15 transition-colors">
                        <td className="p-3 font-bold text-text-muted">{log.id}</td>
                        <td className="p-3 text-text-primary">{log.email}</td>
                        <td className="p-3 text-text-muted">{log.fullName}</td>
                        <td className="p-3 text-accent uppercase font-bold">{log.provider.toUpperCase()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 border text-[9px] uppercase font-bold rounded ${
                            log.status === 'success'
                              ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                              : 'border-red-500/20 text-red-400 bg-red-500/5'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-right text-text-muted">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
