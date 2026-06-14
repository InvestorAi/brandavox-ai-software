'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Mail,
  Plus,
  Send,
  Trash2,
  RefreshCw,
  Users,
  Eye,
  MousePointerClick
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  subject: string;
  recipientsCount: number;
  status: 'draft' | 'sent';
  openRate?: string;
  clickRate?: string;
  sentAt?: string;
}

export default function EmailMarketingPage() {
  const [subscribers, setSubscribers] = useState(1240);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([
    {
      id: 'email-1',
      subject: 'Introducing the SocialFlow Agency OS',
      recipientsCount: 1200,
      status: 'sent',
      openRate: '48.2%',
      clickRate: '12.4%',
      sentAt: '2026-06-10 14:00'
    },
    {
      id: 'email-2',
      subject: 'How to scale marketing retention ratios',
      recipientsCount: 1240,
      status: 'sent',
      openRate: '52.1%',
      clickRate: '14.8%',
      sentAt: '2026-06-08 09:30'
    },
    {
      id: 'email-3',
      subject: 'Weekly strategy briefings: desaturated grids',
      recipientsCount: 0,
      status: 'draft'
    }
  ]);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('Type your newsletter body contents here...');
  const [isSending, setIsSending] = useState(false);

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const newDraft: EmailCampaign = {
      id: `email-${Date.now()}`,
      subject: subject,
      recipientsCount: 0,
      status: 'draft'
    };

    setCampaigns((prev) => [newDraft, ...prev]);
    setSubject('');
    setBodyText('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setCampaigns((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSendCampaign = (id: string) => {
    setIsSending(true);
    setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'sent',
                recipientsCount: subscribers,
                openRate: '0.0%',
                clickRate: '0.0%',
                sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
              }
            : c
        )
      );
      setIsSending(false);
      alert('Newsletter campaign sent to all active subscribers!');
    }, 1200);
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title="Email Marketing Suite"
          description="Build subscriber list newsletters campaigns, set up drip sequences automations, and track email parameters."
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-center bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider py-2 px-4 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Newsletter</span>
        </button>
      </div>

      {/* Stats header widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface border border-border-custom p-5 rounded-card flex items-center gap-3">
          <Users className="w-8 h-8 text-accent shrink-0" />
          <div>
            <span className="text-[9px] text-text-muted font-mono block uppercase">Total Subscribers</span>
            <span className="text-sm font-bold text-text-primary">{subscribers.toLocaleString()} Contacts</span>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-5 rounded-card flex items-center gap-3">
          <Eye className="w-8 h-8 text-blue-400 shrink-0" />
          <div>
            <span className="text-[9px] text-text-muted font-mono block uppercase">Average Open Rate</span>
            <span className="text-sm font-bold text-text-primary">50.15%</span>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-5 rounded-card flex items-center gap-3">
          <MousePointerClick className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[9px] text-text-muted font-mono block uppercase">Average Click Rate</span>
            <span className="text-sm font-bold text-text-primary">13.60%</span>
          </div>
        </div>

        <div className="bg-surface border border-border-custom p-5 rounded-card flex items-center gap-3">
          <Mail className="w-8 h-8 text-zinc-500 shrink-0" />
          <div>
            <span className="text-[9px] text-text-muted font-mono block uppercase">Total Emails Sent</span>
            <span className="text-sm font-bold text-text-primary">2,440 Campaigns</span>
          </div>
        </div>
      </div>

      {/* Newsletter Creator block */}
      {showAddForm && (
        <div className="bg-surface border border-border-custom p-6 rounded-card max-w-xl animate-fade-in">
          <form onSubmit={handleCreateDraft} className="space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-border-custom">
              <Mail className="w-4 h-4 text-accent" />
              <span className="font-bold text-xs uppercase tracking-wider text-text-primary font-display">Create Newsletter Campaign</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Email Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Critical brand performance parameters..."
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Body copy</label>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none resize-none font-sans"
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
                Save Draft
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns Listing Panel */}
      <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
        <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
          Newsletter Dispatch Logs
        </span>

        <div className="space-y-4 font-sans text-xs">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-background border border-border-custom rounded-sm p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-accent/40 transition-colors"
            >
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-text-primary">{camp.subject}</h5>
                <div className="flex gap-3 text-[10px] text-text-muted font-mono uppercase">
                  <span>Recipients: {camp.recipientsCount}</span>
                  {camp.sentAt && <span>Sent: {camp.sentAt}</span>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {camp.status === 'sent' ? (
                  <div className="flex gap-4 text-[9px] font-mono text-text-muted uppercase">
                    <div>
                      <span>Opens: </span>
                      <span className="font-bold text-emerald-400">{camp.openRate}</span>
                    </div>
                    <div>
                      <span>Clicks: </span>
                      <span className="font-bold text-accent">{camp.clickRate}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendCampaign(camp.id)}
                    disabled={isSending}
                    className="py-1 px-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-mono text-[9px] uppercase font-bold rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Send className="w-3 h-3 fill-current" />
                    <span>Send Campaign</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(camp.id)}
                  className="text-zinc-500 hover:text-red-400 cursor-pointer"
                  title="Remove Campaign"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
