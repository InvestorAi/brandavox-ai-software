// Brandavox Developer Console Page
// Location: src/app/(dashboard)/developer/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Webhook, 
  Activity, 
  Code, 
  Copy, 
  Plus, 
  Trash2, 
  Play, 
  Check, 
  ExternalLink, 
  Shield, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  RefreshCw,
  FileCode,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function DeveloperConsolePage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'docs' | 'storage'>('keys');
  
  // Data State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  
  // Storage Footprint States
  const [dbStorageUsed, setDbStorageUsed] = useState(156400); // 156.4 KB
  const [pruning, setPruning] = useState(false);
  const [pruneSuccessInfo, setPruneSuccessInfo] = useState<any>(null);
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [submittingKey, setSubmittingKey] = useState(false);
  const [submittingWebhook, setSubmittingWebhook] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  
  // Forms & Modal states
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['read:brands']);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<any>(null);
  const [copiedKeyText, setCopiedKeyText] = useState(false);
  const [copiedCodeText, setCopiedCodeText] = useState<string | null>(null);
  
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['campaign.published']);
  
  const [selectedLogPayload, setSelectedLogPayload] = useState<any>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [copiedPayloadText, setCopiedPayloadText] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Snippets active language
  const [snippetLang, setSnippetLang] = useState<'curl' | 'node' | 'python'>('curl');

  // Fetch credentials and webhooks on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        // Load API Keys
        const keysRes = await fetch('/api/developer/keys');
        const keysJson = await keysRes.json();
        
        // Load Webhooks & Logs
        const webhooksRes = await fetch('/api/developer/webhooks');
        const webhooksJson = await webhooksRes.json();
        
        if (keysJson.success) {
          setApiKeys(keysJson.data || []);
        } else {
          setErrorMsg(keysJson.error || 'Failed to fetch API keys');
        }
        
        if (webhooksJson.success) {
          setWebhooks(webhooksJson.data.webhooks || []);
          setWebhookLogs(webhooksJson.data.logs || []);
        } else if (!errorMsg) {
          setErrorMsg(webhooksJson.error || 'Failed to fetch webhooks');
        }
      } catch (err: any) {
        console.error('Error loading developer console:', err);
        setErrorMsg(err.message || 'Connection error');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Handle DB Prune API request
  const handlePruneLogs = async () => {
    try {
      setPruning(true);
      setErrorMsg(null);
      setPruneSuccessInfo(null);
      
      const res = await fetch('/api/developer/db-prune', { method: 'POST' });
      const json = await res.json();
      
      if (json.success) {
        setPruneSuccessInfo(json.data);
        // Reduce the database storage footprint telemetry accordingly
        setDbStorageUsed((prev) => Math.max(25000, prev - json.data.reclaimedBytes));
        
        // Reload webhook logs which might have been pruned
        const webhooksRes = await fetch('/api/developer/webhooks');
        const webhooksJson = await webhooksRes.json();
        if (webhooksJson.success) {
          setWebhookLogs(webhooksJson.data.logs || []);
        }
      } else {
        setErrorMsg(json.error || 'Database storage pruning failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error triggering database prune');
    } finally {
      setPruning(false);
    }
  };

  // Handle API Key Creation
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    try {
      setSubmittingKey(true);
      setErrorMsg(null);
      
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          scopes: newKeyScopes,
        }),
      });
      
      const json = await res.json();
      if (json.success) {
        setNewlyCreatedKey(json.data);
        setShowKeyModal(true);
        // Refresh list (apiKeys GET returns everything without secret keys)
        const updatedRes = await fetch('/api/developer/keys');
        const updatedJson = await updatedRes.json();
        if (updatedJson.success) {
          setApiKeys(updatedJson.data);
        }
        // Reset form
        setNewKeyName('');
        setNewKeyScopes(['read:brands']);
      } else {
        setErrorMsg(json.error || 'Failed to create API key');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating API key');
    } finally {
      setSubmittingKey(false);
    }
  };

  // Handle Key Revocation
  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Any active connections using it will fail immediately.')) {
      return;
    }
    
    try {
      setErrorMsg(null);
      const res = await fetch(`/api/developer/keys?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setApiKeys(apiKeys.filter((k) => k.id !== id));
      } else {
        setErrorMsg(json.error || 'Failed to revoke key');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error revoking API key');
    }
  };

  // Handle Webhook Registration
  const handleRegisterWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;
    
    try {
      setSubmittingWebhook(true);
      setErrorMsg(null);
      
      const res = await fetch('/api/developer/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newWebhookUrl,
          events: newWebhookEvents,
        }),
      });
      
      const json = await res.json();
      if (json.success) {
        // Reload webhooks
        const webhooksRes = await fetch('/api/developer/webhooks');
        const webhooksJson = await webhooksRes.json();
        if (webhooksJson.success) {
          setWebhooks(webhooksJson.data.webhooks || []);
          setWebhookLogs(webhooksJson.data.logs || []);
        }
        // Reset form
        setNewWebhookUrl('');
        setNewWebhookEvents(['campaign.published']);
      } else {
        setErrorMsg(json.error || 'Failed to register webhook');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating webhook subscription');
    } finally {
      setSubmittingWebhook(false);
    }
  };

  // Handle Simulated Webhook Testing Trigger
  const handleTestWebhook = async (webhookId: string, event: string) => {
    try {
      setTestingWebhookId(webhookId);
      setErrorMsg(null);
      
      const res = await fetch('/api/developer/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookId,
          event,
        }),
      });
      
      const json = await res.json();
      if (json.success) {
        // Prepend new log
        setWebhookLogs((prev) => [json.data, ...prev]);
      } else {
        setErrorMsg(json.error || 'Test delivery simulation failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error dispatching webhook test');
    } finally {
      setTestingWebhookId(null);
    }
  };

  // Helper copy text
  const copyToClipboard = (text: string, type: 'key' | 'code' | 'payload') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKeyText(true);
      setTimeout(() => setCopiedKeyText(false), 2000);
    } else if (type === 'payload') {
      setCopiedPayloadText(true);
      setTimeout(() => setCopiedPayloadText(false), 2000);
    } else {
      setCopiedCodeText(text);
      setTimeout(() => setCopiedCodeText(null), 2000);
    }
  };

  // Calculate Metrics from state
  const activeKeysCount = apiKeys.length;
  const webhooksCount = webhooks.length;
  const avgLatency = webhookLogs.length > 0 
    ? Math.round(webhookLogs.reduce((acc, log) => acc + log.latency_ms, 0) / webhookLogs.length)
    : 0;
  const successRate = webhookLogs.length > 0
    ? Math.round((webhookLogs.filter((log) => log.status_code >= 200 && log.status_code < 300).length / webhookLogs.length) * 100)
    : 100;

  // Toggle checklist selection helper
  const handleScopeToggle = (scope: string) => {
    if (newKeyScopes.includes(scope)) {
      setNewKeyScopes(newKeyScopes.filter((s) => s !== scope));
    } else {
      setNewKeyScopes([...newKeyScopes, scope]);
    }
  };

  const handleEventToggle = (event: string) => {
    if (newWebhookEvents.includes(event)) {
      setNewWebhookEvents(newWebhookEvents.filter((e) => e !== event));
    } else {
      setNewWebhookEvents([...newWebhookEvents, event]);
    }
  };

  // Code snippets data templates
  const activeKeySample = apiKeys.length > 0 ? `${apiKeys[0].key_prefix}...` : 'bv_live_your_secret_key';
  
  const snippets = {
    curl: `curl -X GET "https://api.brandavox.ai/v1/brands" \\
  -H "Authorization: Bearer ${newlyCreatedKey?.secret_key || activeKeySample}" \\
  -H "Content-Type: application/json"`,
    node: `const fetch = require('node-fetch');

async function getBrands() {
  const response = await fetch('https://api.brandavox.ai/v1/brands', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ${newlyCreatedKey?.secret_key || activeKeySample}',
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log(data);
}

getBrands().catch(console.error);`,
    python: `import requests

url = "https://api.brandavox.ai/v1/brands"
headers = {
    "Authorization": "Bearer ${newlyCreatedKey?.secret_key || activeKeySample}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Page Header */}
      <PageHeader
        title="Developer Console"
        description="Provision programmatic API access keys, coordinate custom webhook listeners, and audit outgoing payload delivery logs."
      />

      {/* Error Message banner */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-badge flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold uppercase tracking-wider block mb-0.5">Operation Failure</span>
            <p className="font-mono">{errorMsg}</p>
          </div>
          <button 
            onClick={() => setErrorMsg(null)}
            className="text-red-400 hover:text-red-300 font-mono text-[10px] uppercase cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-text-muted font-display uppercase tracking-wider font-semibold">Active Key Credentials</span>
            <Key className="w-4 h-4 text-accent" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-display font-bold text-text-primary">
              {loading ? '...' : activeKeysCount}
            </div>
            <p className="text-[10px] text-text-muted uppercase font-mono">Total API Keys Provisioned</p>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-text-muted font-display uppercase tracking-wider font-semibold">Webhook Endpoints</span>
            <Webhook className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-display font-bold text-text-primary">
              {loading ? '...' : webhooksCount}
            </div>
            <p className="text-[10px] text-text-muted uppercase font-mono">Outbound Listeners Configured</p>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-text-muted font-display uppercase tracking-wider font-semibold">Avg Webhook Latency</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-display font-bold text-text-primary">
              {loading ? '...' : `${avgLatency}ms`}
            </div>
            <p className="text-[10px] text-text-muted uppercase font-mono">Response Duration Audit</p>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-text-muted font-display uppercase tracking-wider font-semibold">Delivery Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-display font-bold text-text-primary">
              {loading ? '...' : `${successRate}%`}
            </div>
            <p className="text-[10px] text-text-muted uppercase font-mono">Green Node callback ratio</p>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="border-b border-border-custom flex gap-1 bg-surface/40 p-1 rounded-badge">
        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-badge text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
            activeTab === 'keys'
              ? 'bg-surface text-accent border border-border-custom'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Access Keys</span>
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-badge text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
            activeTab === 'webhooks'
              ? 'bg-surface text-accent border border-border-custom'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          <span>Webhooks & Delivery</span>
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-badge text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-surface text-accent border border-border-custom'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Integration SDKs</span>
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-badge text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
            activeTab === 'storage'
              ? 'bg-surface text-accent border border-border-custom'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Storage Optimization</span>
        </button>
      </div>

      {/* Panel Views */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin rounded-full"></div>
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">Syncing Developer Registry...</span>
          </div>
        ) : (
          <>
            {/* Panel 1: API Keys */}
            {activeTab === 'keys' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Keys registry */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-surface border border-border-custom rounded-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-custom bg-background/20 flex justify-between items-center">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Provisioned API Credentials
                      </h3>
                      <span className="font-mono text-[9px] bg-background border border-border-custom px-2 py-0.5 rounded text-text-muted uppercase">
                        Active Tenant
                      </span>
                    </div>

                    {apiKeys.length === 0 ? (
                      <div className="p-8 text-center space-y-3">
                        <Lock className="w-8 h-8 mx-auto text-text-muted/40" />
                        <p className="text-xs text-text-muted font-sans">No API credentials have been provisioned for this organization yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border-custom">
                        {apiKeys.map((key) => (
                          <div key={key.id} className="p-6 hover:bg-background/10 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-semibold text-sm text-text-primary">{key.name}</span>
                                <span className="font-mono text-[10px] px-2 py-0.5 bg-background border border-border-custom rounded-badge text-text-muted">
                                  {key.key_prefix}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {key.scopes.map((scope: string) => (
                                  <span key={scope} className="font-mono text-[9px] px-1.5 py-0.5 bg-accent/5 border border-accent/15 rounded text-accent">
                                    {scope}
                                  </span>
                                ))}
                              </div>
                              <div className="text-[10px] text-text-muted font-mono pt-1">
                                Created: {new Date(key.created_at).toLocaleDateString()} | 
                                Last Used: {key.last_used_at ? new Date(key.last_used_at).toLocaleTimeString() : 'Never'}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-border-custom hover:border-red-500/20 px-3 py-1.5 rounded-badge text-[10px] font-mono uppercase flex items-center gap-1.5 transition-all w-fit cursor-pointer"
                              title="Revoke and delete API Key"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Key Generation Form & Tenant details */}
                <div className="space-y-6">
                  {/* Generation Card */}
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Provision API Key
                      </h3>
                      <p className="text-[11px] text-text-muted">
                        Generate new access tokens to authenticate client requests to our campaign and studio endpoints.
                      </p>
                    </div>

                    <form onSubmit={handleCreateKey} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-text-muted uppercase">Description Name</label>
                        <input
                          type="text"
                          required
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="e.g. Acme Hub Integration"
                          className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs font-sans text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/30 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-mono text-[10px] text-text-muted uppercase block">Select Scopes</label>
                        <div className="space-y-2 bg-background/40 p-3 border border-border-custom rounded-badge">
                          {[
                            { value: 'read:brands', label: 'Read Brands data' },
                            { value: 'read:clients', label: 'Read Client diagnostics' },
                            { value: 'write:posts', label: 'Write Campaign scheduling' },
                            { value: 'write:messages', label: 'Write Channel messages' },
                          ].map((sc) => (
                            <label key={sc.value} className="flex items-center gap-2 cursor-pointer text-xs text-text-primary select-none">
                              <input
                                type="checkbox"
                                checked={newKeyScopes.includes(sc.value)}
                                onChange={() => handleScopeToggle(sc.value)}
                                className="accent-accent border-border-custom cursor-pointer"
                              />
                              <span className="font-mono text-[10px] text-text-muted bg-background px-1.5 py-0.5 border border-border-custom rounded shrink-0">
                                {sc.value}
                              </span>
                              <span className="text-[11px]">{sc.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingKey || !newKeyName.trim()}
                        className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-badge text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {submittingKey ? 'Generating...' : 'Generate API Credentials'}
                      </button>
                    </form>
                  </div>

                  {/* Tenant Details Card */}
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-border-custom">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Credentials Info
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-[10px]">
                      <div className="space-y-1">
                        <span className="text-text-muted uppercase">Organization ID (Tenant)</span>
                        <div className="bg-background border border-border-custom p-2 rounded flex justify-between items-center text-text-primary font-mono">
                          <span>mock-org-123</span>
                          <button
                            onClick={() => copyToClipboard('mock-org-123', 'code')}
                            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-text-muted uppercase">Base API Endpoint</span>
                        <div className="bg-background border border-border-custom p-2 rounded flex justify-between items-center text-text-primary font-mono text-[9px] truncate">
                          <span>https://api.brandavox.ai/v1</span>
                          <button
                            onClick={() => copyToClipboard('https://api.brandavox.ai/v1', 'code')}
                            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer ml-1"
                          >
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 bg-accent/5 border border-accent/15 text-text-muted rounded leading-relaxed text-[9px]">
                        <Info className="w-3 h-3 text-accent inline mr-1 -mt-0.5" />
                        Ensure header key values are passed as <code className="text-accent">Authorization: Bearer bv_live_...</code>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 2: Webhooks */}
            {activeTab === 'webhooks' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side webhooks form and config list */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Registered Webhooks Card */}
                  <div className="bg-surface border border-border-custom rounded-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-custom bg-background/20">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Outbound Listener URLs
                      </h3>
                    </div>

                    {webhooks.length === 0 ? (
                      <div className="p-8 text-center space-y-3">
                        <Webhook className="w-8 h-8 mx-auto text-text-muted/40" />
                        <p className="text-xs text-text-muted font-sans">No webhook listeners registered.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border-custom">
                        {webhooks.map((wh) => (
                          <div key={wh.id} className="p-6 hover:bg-background/10 transition-colors flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-text-primary truncate">{wh.url}</span>
                                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                                  wh.status === 'active' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                }`}>
                                  {wh.status}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {wh.events.map((evt: string) => (
                                  <span key={evt} className="font-mono text-[9px] px-1.5 py-0.5 bg-blue-500/5 border border-blue-500/15 rounded text-blue-400">
                                    {evt}
                                  </span>
                                ))}
                              </div>
                              <p className="text-[10px] text-text-muted font-mono pt-1">
                                Registered: {new Date(wh.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Actions panel */}
                            <div className="flex items-center gap-2">
                              {wh.events.map((evt: string) => (
                                <button
                                  key={evt}
                                  disabled={testingWebhookId === wh.id}
                                  onClick={() => handleTestWebhook(wh.id, evt)}
                                  className="bg-background border border-border-custom hover:border-accent text-text-primary hover:text-accent font-mono text-[9px] uppercase px-2.5 py-1.5 rounded-badge flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {testingWebhookId === wh.id ? 'Sending...' : `Test ${evt.split('.')[0]}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Webhook Delivery Logs audit table */}
                  <div className="bg-surface border border-border-custom rounded-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-custom bg-background/20 flex justify-between items-center">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Webhook Delivery Logs
                      </h3>
                      <span className="font-mono text-[9px] text-text-muted uppercase">
                        Auditing past deliveries
                      </span>
                    </div>

                    {webhookLogs.length === 0 ? (
                      <div className="p-8 text-center text-text-muted text-xs font-sans">
                        No delivery activities logged yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse font-mono text-xs">
                          <thead>
                            <tr className="border-b border-border-custom bg-background/25">
                              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-text-muted">Event Type</th>
                              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-text-muted">Status</th>
                              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-text-muted">Latency</th>
                              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-text-muted">Date</th>
                              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-text-muted text-right">Payload</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-custom">
                            {webhookLogs.map((log) => {
                              const isSuccess = log.status_code >= 200 && log.status_code < 300;
                              return (
                                <tr key={log.id} className="hover:bg-background/20 transition-colors">
                                  <td className="px-6 py-3 text-text-primary font-bold">
                                    {log.event_type}
                                  </td>
                                  <td className="px-6 py-3">
                                    <span className={`px-2 py-0.5 rounded border text-[10px] ${
                                      isSuccess 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                      {log.status_code} {isSuccess ? 'OK' : 'Error'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-text-muted">
                                    {log.latency_ms}ms
                                  </td>
                                  <td className="px-6 py-3 text-text-muted">
                                    {new Date(log.created_at).toLocaleTimeString()}
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <button
                                      onClick={() => {
                                        setSelectedLogPayload(log);
                                        setShowLogModal(true);
                                      }}
                                      className="text-accent hover:text-accent-hover hover:underline cursor-pointer flex items-center justify-end gap-1 ml-auto"
                                    >
                                      <span>Inspect</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side webhook subscription form */}
                <div className="space-y-6">
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Configure Webhook
                      </h3>
                      <p className="text-[11px] text-text-muted">
                        Configure an outbound HTTPS url. We will send JSON payloads whenever actions are triggered.
                      </p>
                    </div>

                    <form onSubmit={handleRegisterWebhook} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-text-muted uppercase">Target Listener URL</label>
                        <input
                          type="url"
                          required
                          value={newWebhookUrl}
                          onChange={(e) => setNewWebhookUrl(e.target.value)}
                          placeholder="https://yourdomain.com/webhooks"
                          className="w-full bg-background border border-border-custom px-3 py-2 rounded-badge text-xs font-sans text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/30 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-mono text-[10px] text-text-muted uppercase block">Select Trigger Events</label>
                        <div className="space-y-2 bg-background/40 p-3 border border-border-custom rounded-badge">
                          {[
                            { value: 'campaign.published', label: 'Post Published' },
                            { value: 'client.at_risk', label: 'Client At-Risk Health' },
                            { value: 'memory.created', label: 'Strategy Memory Created' },
                          ].map((ev) => (
                            <label key={ev.value} className="flex items-center gap-2 cursor-pointer text-xs text-text-primary select-none">
                              <input
                                type="checkbox"
                                checked={newWebhookEvents.includes(ev.value)}
                                onChange={() => handleEventToggle(ev.value)}
                                className="accent-accent border-border-custom cursor-pointer"
                              />
                              <span className="font-mono text-[10px] text-text-muted bg-background px-1.5 py-0.5 border border-border-custom rounded shrink-0">
                                {ev.value}
                              </span>
                              <span className="text-[11px]">{ev.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingWebhook || !newWebhookUrl.trim()}
                        className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-badge text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {submittingWebhook ? 'Saving...' : 'Register Webhook Endpoint'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 3: SDK / Documentation */}
            {activeTab === 'docs' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Code snippets and integration tabs */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-surface border border-border-custom rounded-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-custom bg-background/20 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-accent" />
                        <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                          Integration Code Snippets
                        </h3>
                      </div>
                      
                      {/* Snippet language selector */}
                      <div className="flex bg-background border border-border-custom rounded p-0.5 text-[10px] font-mono">
                        <button
                          onClick={() => setSnippetLang('curl')}
                          className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            snippetLang === 'curl' ? 'bg-surface text-accent' : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          cURL
                        </button>
                        <button
                          onClick={() => setSnippetLang('node')}
                          className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            snippetLang === 'node' ? 'bg-surface text-accent' : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          Node.js
                        </button>
                        <button
                          onClick={() => setSnippetLang('python')}
                          className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            snippetLang === 'python' ? 'bg-surface text-accent' : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          Python
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-background/45 relative group">
                      <button
                        onClick={() => copyToClipboard(snippets[snippetLang], 'code')}
                        className="absolute right-4 top-4 p-1.5 bg-surface border border-border-custom rounded text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1 text-[10px] font-mono"
                        title="Copy code to clipboard"
                      >
                        {copiedCodeText === snippets[snippetLang] ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <pre className="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre p-2 leading-relaxed">
                        {snippets[snippetLang]}
                      </pre>
                    </div>
                  </div>

                  {/* Quickstart API Guide */}
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                    <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                      Quickstart Integration Flow
                    </h3>
                    
                    <div className="space-y-4 text-xs leading-relaxed text-text-muted font-sans">
                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-mono text-[10px] font-bold shrink-0">1</span>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-text-primary">Create strategy positions via API key</h4>
                          <p>
                            Use the POST `/v1/brands` endpoint to push position attributes. Brandavox AI will generate voice strategy profiles matching these parameters.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-mono text-[10px] font-bold shrink-0">2</span>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-text-primary">Subscribe to Campaign publication signals</h4>
                          <p>
                            Configure a Webhook listening URL targeted to `campaign.published`. As soon as your posts launch, we'll hit your endpoint with performance stats.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-mono text-[10px] font-bold shrink-0">3</span>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-text-primary">Handle At-Risk client alerts</h4>
                          <p>
                            Build custom notification pathways. If a client health score falls below 50, retrieve the auto-generated outreach sequence to trigger recovery workflows.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side documentation parameters */}
                <div className="space-y-6 font-mono text-[10px]">
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-border-custom">
                      <Layers className="w-4 h-4 text-accent" />
                      <span className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Endpoint Schema
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-text-muted uppercase font-bold">GET /v1/brands</span>
                        <p className="text-text-muted leading-relaxed font-sans text-[11px]">
                          List all creative brands positioned under the active tenant directory.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-text-muted uppercase font-bold">POST /v1/brands</span>
                        <p className="text-text-muted leading-relaxed font-sans text-[11px]">
                          Initialize positioning coordinates for strategy generation.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-text-muted uppercase font-bold">GET /v1/clients/:id</span>
                        <p className="text-text-muted leading-relaxed font-sans text-[11px]">
                          Fetch specific details, invoices, and diagnostic health profiles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 4: Storage Optimization */}
            {activeTab === 'storage' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Storage Telemetry */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-6">
                    <div className="pb-3 border-b border-border-custom flex justify-between items-center">
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Supabase Database Storage Footprint
                      </h3>
                      <span className="font-mono text-[9px] bg-background border border-border-custom px-2 py-0.5 rounded text-text-muted uppercase">
                        Limit: 1.00 GB
                      </span>
                    </div>

                    {/* Progress footprint bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-text-muted">Database Storage Used:</span>
                        <span className="font-bold text-text-primary">
                          {(dbStorageUsed / 1024).toFixed(1)} KB / 1,024,000 KB ({(dbStorageUsed / (1024 * 1024 * 1024) * 100).toFixed(4)}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-background border border-border-custom rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-500" 
                          style={{ width: `${Math.max(1, (dbStorageUsed / (1024 * 1024 * 1024)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Tables space breakdown grid */}
                    <div className="space-y-3">
                      <h4 className="font-mono text-[10px] text-text-muted uppercase tracking-wider block">
                        Space Breakdown by Table Schema
                      </h4>
                      <div className="border border-border-custom rounded overflow-hidden divide-y divide-border-custom font-mono text-[10px]">
                        {[
                          { name: 'webhook_logs', desc: 'Outbound testing delivery audits', size: `${(dbStorageUsed * 0.75 / 1024).toFixed(1)} KB`, records: `${webhookLogs.length} logs` },
                          { name: 'agent_memories', desc: 'AI strategic learnings database', size: '18.4 KB', records: '12 records' },
                          { name: 'messages', desc: 'Transient collaboration conversations', size: '12.2 KB', records: '15 items' },
                          { name: 'organizations', desc: 'Tenant account listings', size: '4.0 KB', records: '1 record' },
                          { name: 'other_meta', desc: 'Feature flags and api key hashes', size: '3.1 KB', records: '5 records' },
                        ].map((tbl) => (
                          <div key={tbl.name} className="p-3 bg-background/25 flex justify-between items-center hover:bg-background/40 transition-colors">
                            <div className="space-y-0.5">
                              <span className="font-bold text-text-primary">{tbl.name}</span>
                              <span className="text-text-muted block text-[8px] font-sans leading-none">{tbl.desc}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-text-primary block font-bold">{tbl.size}</span>
                              <span className="text-[8px] text-text-muted block leading-none">{tbl.records}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Pruning Action controls */}
                <div className="space-y-6">
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                    <div className="pb-3 border-b border-border-custom flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-accent" />
                      <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Pruning & Purge Controls
                      </h3>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed font-sans">
                      Supabase automatically bills or restricts database schemas once they exceed the **1GB storage boundary**. 
                      Pruning deletes transient webhook logs older than 7 days to keep your storage footprint minimal.
                    </p>

                    {pruneSuccessInfo && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-badge text-[10px] font-mono leading-relaxed space-y-1">
                        <span className="font-bold block uppercase tracking-wider">✓ Reclaimed Success</span>
                        <div>Deleted Logs: {pruneSuccessInfo.logsDeleted}</div>
                        <div>Storage Reclaimed: {(pruneSuccessInfo.reclaimedBytes / 1024).toFixed(2)} KB</div>
                        <div>Remaining: {pruneSuccessInfo.remainingLogsCount} logs</div>
                      </div>
                    )}

                    <button
                      onClick={handlePruneLogs}
                      disabled={pruning}
                      className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-badge text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {pruning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Purging Logs...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Prune Webhook Logs</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Auto-Prune Policy Card */}
                  <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-border-custom font-mono">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-xs font-display font-semibold uppercase tracking-wider text-text-primary">
                        Auto-Pruning Policy
                      </span>
                    </div>

                    <div className="space-y-3 text-xs text-text-muted font-sans leading-relaxed">
                      <p>
                        Our background scheduler is currently set to run daily. Any webhook logs or activity streams exceeding 7 days are automatically pruned at 00:00 UTC.
                      </p>
                      <p>
                        This keeps our Supabase database size hovering safely under 200 KB, completely bypassing the 1GB threshold.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL 1: Display raw secret key */}
      {showKeyModal && newlyCreatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border-custom max-w-lg w-full p-6 rounded-modal space-y-6 relative">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-bold uppercase tracking-wider text-text-primary">
                API Key Credentials Provisioned
              </h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                Please copy your secret key now. For your security, this key is only displayed <strong className="text-accent">once</strong> and cannot be recovered if closed.
              </p>
            </div>

            {/* Secret key box */}
            <div className="bg-background border border-border-custom p-4 rounded-badge flex justify-between items-center gap-4">
              <code className="font-mono text-xs text-accent select-all break-all pr-2">
                {newlyCreatedKey.secret_key}
              </code>
              <button
                onClick={() => copyToClipboard(newlyCreatedKey.secret_key, 'key')}
                className="bg-surface border border-border-custom hover:border-accent p-2 rounded text-text-muted hover:text-text-primary transition-all shrink-0 cursor-pointer flex items-center gap-1 text-[10px] font-mono uppercase"
              >
                {copiedKeyText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Warnings warning note */}
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-badge text-[10px] font-mono leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-400 inline mr-1.5 -mt-0.5 shrink-0" />
              DO NOT share this token in public code repositories, frontend client scripts, or static builds.
            </div>

            <button
              onClick={() => {
                setShowKeyModal(false);
                setNewlyCreatedKey(null);
              }}
              className="w-full bg-surface border border-border-custom hover:border-accent text-text-primary font-semibold uppercase tracking-wider py-2.5 rounded-badge text-xs transition-colors cursor-pointer"
            >
              I Have Saved This Key
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: View Log payload JSON */}
      {showLogModal && selectedLogPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border-custom max-w-2xl w-full p-6 rounded-modal space-y-6 relative flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-border-custom pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-primary">
                  Webhook Payload Inspector
                </h3>
                <p className="font-mono text-[9px] text-text-muted">
                  Log ID: {selectedLogPayload.id} | Outbound Code: {selectedLogPayload.status_code}
                </p>
              </div>
              
              <button
                onClick={() => copyToClipboard(selectedLogPayload.payload, 'payload')}
                className="bg-background border border-border-custom hover:border-accent px-3 py-1.5 rounded-badge text-[10px] font-mono uppercase flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedPayloadText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* Code view */}
            <div className="flex-1 bg-background/55 border border-border-custom rounded-badge p-4 overflow-y-auto max-h-[50vh]">
              <pre className="font-mono text-xs text-blue-400 whitespace-pre-wrap leading-relaxed select-all">
                {selectedLogPayload.payload}
              </pre>
            </div>

            <button
              onClick={() => {
                setShowLogModal(false);
                setSelectedLogPayload(null);
              }}
              className="w-full bg-surface border border-border-custom hover:border-accent text-text-primary font-semibold uppercase tracking-wider py-2.5 rounded-badge text-xs transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
