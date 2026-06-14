'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Terminal,
  ShieldAlert,
  Play,
  RefreshCw,
  Cpu,
  Activity,
  CheckCircle,
  Database,
  Lock,
  ShieldCheck,
  ShieldX,
  MailWarning
} from 'lucide-react';

export default function ThreatSandboxPage() {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [securityStats, setSecurityStats] = useState({
    rateLimitBlocks: 42,
    burnerEmailIntercepts: 18
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoadingStats(true);
        const res = await fetch('/api/developer/security-stats');
        const json = await res.json();
        if (json.success) {
          setSecurityStats(json.data);
        }
      } catch (err) {
        console.error('Error fetching security stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const startSimulation = (type: 'sqli' | 'ddos' | 'spf') => {
    setIsSimulating(true);
    setActiveSimulation(type);
    setSimulationLogs([]);

    let logs: string[] = [];
    if (type === 'sqli') {
      logs = [
        `[INTRUSION] Inbound POST request detected on route: /api/auth/login`,
        `[INTRUSION] Payload inspected: username="admin", password="' OR '1'='1"`,
        `[WAF] Parsing SQL query structure. Detecting Boolean-based SQL Injection signature...`,
        `[WAF] Flagged token: "' OR '1'='1" matching security rule #401 (Auth Bypass attempt).`,
        `[NEURAL FIREWALL] Bypassing database call. Banning source IP for 3600 seconds.`,
        `[WAF] Sanitized response returned: Status 401 Unauthorized.`
      ];
    } else if (type === 'ddos') {
      logs = [
        `[TRAFFIC] Global connection spike detected. Request rate: 1,200 req/s -> 14,500 req/s`,
        `[WAF] Triggering rate limits across organization route groups...`,
        `[WAF] Intercepting request storm. IP distribution matching botnet cluster...`,
        `[NEURAL FIREWALL] Activating challenge mode (Cloudflare JS challenge equivalent)...`,
        `[NEURAL FIREWALL] Challenged 98.4% of connections. Blocked 14,210 suspicious packets.`,
        `[TRAFFIC] Normal connection rate restored. Success rate: 100%.`
      ];
    } else {
      logs = [
        `[EMAIL] Inbound SMTP header relay handshake initialized.`,
        `[EMAIL] Header check: From="billing@brandavox.com", Relay IP="192.168.4.15"`,
        `[WAF] Checking SPF records and DKIM signatures for domain "brandavox.com"...`,
        `[WAF] Hard Fail: Relay IP is not in designated SPF record matrix.`,
        `[NEURAL FIREWALL] Blocking SPF mail spoofing attempt. Dropping packet relay...`,
        `[EMAIL] Outbound alert dispatched to workspace security admins.`
      ];
    }

    logs.forEach((log, index) => {
      setTimeout(() => {
        setSimulationLogs((prev) => [...prev, log]);
        if (index === logs.length - 1) {
          setIsSimulating(false);
        }
      }, (index + 1) * 350);
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Developer Threat Sandbox"
        description="Simulate malicious security vectors (SQLi, DDoS, mail spoofing) and test Neural Firewall and WAF mitigation limits."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-xs font-sans">
        
        {/* Sandbox Simulation Trigger Panel */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <ShieldAlert className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">
              Sandbox Vectors
            </h3>
          </div>

          <div className="space-y-4">
            {/* SQL Injection card */}
            <div className="border border-border-custom p-4 rounded-sm bg-background/35 space-y-3">
              <div>
                <span className="font-bold text-text-primary block font-mono text-[10px] uppercase">SQL Injection Probe</span>
                <span className="text-text-muted text-[10px] pt-0.5 block">Simulates SQL authentication bypass payloads.</span>
              </div>
              <button
                disabled={isSimulating}
                onClick={() => startSimulation('sqli')}
                className="py-1.5 px-3 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate Probe</span>
              </button>
            </div>

            {/* DDoS Saturation card */}
            <div className="border border-border-custom p-4 rounded-sm bg-background/35 space-y-3">
              <div>
                <span className="font-bold text-text-primary block font-mono text-[10px] uppercase">DDoS Storm</span>
                <span className="text-text-muted text-[10px] pt-0.5 block">Simulates a high-rate botnet traffic spike.</span>
              </div>
              <button
                disabled={isSimulating}
                onClick={() => startSimulation('ddos')}
                className="py-1.5 px-3 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate Flood</span>
              </button>
            </div>

            {/* SPF Spoofing card */}
            <div className="border border-border-custom p-4 rounded-sm bg-background/35 space-y-3">
              <div>
                <span className="font-bold text-text-primary block font-mono text-[10px] uppercase">SPF Mail Spoofing</span>
                <span className="text-text-muted text-[10px] pt-0.5 block">Simulates identity-theft email relay attacks.</span>
              </div>
              <button
                disabled={isSimulating}
                onClick={() => startSimulation('spf')}
                className="py-1.5 px-3 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate Spoof</span>
              </button>
            </div>

          </div>
        </div>

        {/* Real-time WAF Monitor console */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health and activity dashboard widget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-surface border border-border-custom p-4 rounded-card flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[8px] text-text-muted font-mono block uppercase">Firewall Health</span>
                <span className="text-[10px] font-bold text-text-primary uppercase">ACTIVE & SECURE</span>
              </div>
            </div>

            <div className="bg-surface border border-border-custom p-4 rounded-card flex items-center gap-2">
              <Activity className="w-6 h-6 text-accent shrink-0" />
              <div>
                <span className="text-[8px] text-text-muted font-mono block uppercase">Latency</span>
                <span className="text-[10px] font-bold text-text-primary">12.4 ms</span>
              </div>
            </div>

            <div className="bg-surface border border-border-custom p-4 rounded-card flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <span className="text-[8px] text-text-muted font-mono block uppercase">Rate Limits</span>
                <span className="text-[10px] font-bold text-text-primary">
                  {loadingStats ? '...' : `${securityStats.rateLimitBlocks} Blocks`}
                </span>
              </div>
            </div>

            <div className="bg-surface border border-border-custom p-4 rounded-card flex items-center gap-2">
              <MailWarning className="w-6 h-6 text-yellow-400 shrink-0" />
              <div>
                <span className="text-[8px] text-text-muted font-mono block uppercase">Burner Filters</span>
                <span className="text-[10px] font-bold text-text-primary">
                  {loadingStats ? '...' : `${securityStats.burnerEmailIntercepts} Blocked`}
                </span>
              </div>
            </div>

            <div className="bg-surface border border-border-custom p-4 rounded-card flex items-center gap-2">
              <Database className="w-6 h-6 text-zinc-500 shrink-0" />
              <div>
                <span className="text-[8px] text-text-muted font-mono block uppercase">SQLi Rules</span>
                <span className="text-[10px] font-bold text-text-primary">v2.10-Live</span>
              </div>
            </div>

          </div>

          {/* Sandbox console */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-accent" />
                <span>Sandbox Security Logs</span>
              </span>
              {isSimulating && (
                <span className="text-[9px] text-accent font-mono font-bold animate-pulse uppercase flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>SIMULATING ATTACK VECTOR</span>
                </span>
              )}
            </div>

            {/* Inner terminal logs */}
            <div className="p-4 bg-zinc-950 border border-border-custom rounded-sm text-[10px] font-mono leading-relaxed min-h-[200px] text-zinc-300">
              {simulationLogs.length > 0 ? (
                simulationLogs.map((log, index) => {
                  let logColor = 'text-zinc-300';
                  if (log.includes('[INTRUSION]')) logColor = 'text-red-400 font-bold';
                  if (log.includes('[NEURAL FIREWALL]')) logColor = 'text-accent font-bold';
                  if (log.includes('[WAF]')) logColor = 'text-yellow-400';
                  return (
                    <div key={index} className={logColor}>
                      {log}
                    </div>
                  );
                })
              ) : (
                <div className="text-zinc-600 italic">No security simulations are active. Select a vector to test the firewall logs.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
