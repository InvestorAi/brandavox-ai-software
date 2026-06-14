'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  Send,
  Calendar as CalendarIcon,
  MessageSquare
} from 'lucide-react';

interface Campaign {
  id: string;
  brand_id: string;
  title: string;
}

interface Post {
  id: string;
  campaign_id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook';
  content: string;
  scheduled_at: string;
  published_at: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  performance?: any;
}

interface AIResponse {
  headline: string;
  primaryCopy: string;
  cta: string;
  hashtags: string[];
  optimizationNotes: string;
  variations?: Array<{ headline: string; primaryCopy: string; cta: string }>;
}

function CalendarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Date State (Defaults to current month/year)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Filter Campaign ID from search query
  const campaignFilter = searchParams.get('campaignId') || '';

  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Editor Form States
  const [formCampaignId, setFormCampaignId] = useState('');
  const [formPlatform, setFormPlatform] = useState<'linkedin' | 'twitter' | 'instagram' | 'facebook'>('linkedin');
  const [formContent, setFormContent] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'scheduled' | 'published' | 'failed'>('scheduled');

  // AI Prompt Assistant States
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiBrief, setAiBrief] = useState('');
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [generatedAIResult, setGeneratedAIResult] = useState<AIResponse | null>(null);

  const [savingPost, setSavingPost] = useState(false);

  // Fetch campaigns and posts
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch campaigns
      const campaignsRes = await fetch('/api/campaigns');
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) {
        setCampaigns(campaignsData.data || []);
      }

      // Fetch posts (with date range of current month +- 15 days)
      const startDate = new Date(currentYear, currentMonth - 1, 15).toISOString();
      const endDate = new Date(currentYear, currentMonth + 1, 15).toISOString();
      
      let postsUrl = `/api/posts?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      if (campaignFilter) {
        postsUrl += `&campaignId=${campaignFilter}`;
      }

      const postsRes = await fetch(postsUrl);
      const postsData = await postsRes.json();
      if (postsData.success) {
        setPosts(postsData.data || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch calendar assets. Please check backend databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentYear, currentMonth, campaignFilter]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Open modal to schedule post or edit existing post
  const openNewPostEditor = (dateStr: string) => {
    setSelectedPost(null);
    setSelectedDateStr(dateStr);
    
    // Autofill initial date + time (default to 12:00 PM)
    const initialTime = '12:00';
    setFormScheduledAt(`${dateStr}T${initialTime}`);
    
    // Set default campaign ID if filtered or default to first campaign
    setFormCampaignId(campaignFilter || (campaigns[0]?.id || ''));
    setFormPlatform('linkedin');
    setFormContent('');
    setFormStatus('scheduled');

    // Reset AI panel
    setShowAIAssistant(false);
    setAiBrief('');
    setGeneratedAIResult(null);

    setIsEditorOpen(true);
  };

  const openExistingPostEditor = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering day cell click
    setSelectedPost(post);
    setSelectedDateStr(null);

    setFormCampaignId(post.campaign_id);
    setFormPlatform(post.platform);
    setFormContent(post.content);
    // Format date string to local datetime-local input format
    const localDate = new Date(post.scheduled_at);
    const tzOffset = localDate.getTimezoneOffset() * 60000;
    const formatted = new Date(localDate.getTime() - tzOffset).toISOString().slice(0, 16);
    setFormScheduledAt(formatted);
    setFormStatus(post.status);

    // Reset AI panel
    setShowAIAssistant(false);
    setAiBrief('');
    setGeneratedAIResult(null);

    setIsEditorOpen(true);
  };

  // Submit edits or create new post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCampaignId) {
      setError('Please select a campaign for this post.');
      return;
    }

    setSavingPost(true);
    setError(null);

    try {
      const payload = {
        campaign_id: formCampaignId,
        platform: formPlatform,
        content: formContent,
        scheduled_at: new Date(formScheduledAt).toISOString(),
        status: formStatus,
      };

      let res;
      if (selectedPost) {
        // Update / Reschedule post
        res = await fetch(`/api/posts/${selectedPost.id}/reschedule`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new post
        res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save scheduled post');
      }

      // Close modal and refresh data
      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error occurred during save operations.');
    } finally {
      setSavingPost(false);
    }
  };

  // Trigger Copywriter Agent Generation
  const handleAIGeneration = async () => {
    if (!aiBrief.trim()) return;
    setGeneratingCopy(true);
    setError(null);

    try {
      // Find Brand ID from campaign ID selection
      const campaign = campaigns.find((c) => c.id === formCampaignId);
      if (!campaign) {
        throw new Error('Please select a campaign first to resolve the brand voice settings.');
      }

      const res = await fetch('/api/posts/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: campaign.brand_id,
          brief: aiBrief,
          platform: formPlatform,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to execute copywriting agent');
      }

      setGeneratedAIResult(data.data);
    } catch (err: any) {
      setError(err.message || 'AI generation failed.');
    } finally {
      setGeneratingCopy(false);
    }
  };

  // Copy AI output into post text body
  const applyAICopy = (result: AIResponse) => {
    const formatted = `${result.headline}\n\n${result.primaryCopy}\n\n${result.cta}\n\n${result.hashtags.map((t) => `#${t.replace(/#/g, '')}`).join(' ')}`;
    setFormContent(formatted);
    setShowAIAssistant(false);
  };

  // Calendar calculations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 6 = Sat

  // Grid layout days list
  const daysArray: Array<{ dayNum: number | null; dateStr: string | null }> = [];

  // Pad previous month offset days
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push({ dayNum: null, dateStr: null });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push({ dayNum: d, dateStr });
  }

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Content Calendar"
        description="Schedule, optimize, and organize social content deliverables across multiple networks."
        actions={
          <div className="flex items-center gap-3">
            {campaignFilter && (
              <button
                onClick={() => {
                  router.push('/calendar');
                }}
                className="bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-text-muted hover:text-text-primary font-mono text-[10px] px-3 py-2 rounded-badge transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                Clear Filter <X className="w-3 h-3" />
              </button>
            )}

            {/* Campaign Selector Filter */}
            <select
              value={campaignFilter}
              onChange={(e) => {
                const val = e.target.value;
                router.push(val ? `/calendar?campaignId=${val}` : '/calendar');
              }}
              className="bg-surface border border-border-custom text-text-primary font-sans text-xs px-3 py-2.5 rounded-badge focus:outline-none focus:border-accent"
            >
              <option value="">All Active Campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start gap-3 text-sm font-sans">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Calendar Shell Grid */}
      <div className="bg-surface border border-border-custom rounded-card overflow-hidden neumorphism-card-dark flex flex-col">
        {/* Month Header controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom bg-background/30">
          <div className="flex items-center gap-1.5">
            <h2 className="font-display font-bold text-lg text-text-primary uppercase tracking-wider">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            {campaignFilter && (
              <span className="font-mono text-[9px] bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded-badge tracking-widest uppercase">
                Filtered
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 border border-border-custom bg-surface hover:bg-background/80 hover:text-text-primary text-text-muted rounded-sm cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
              }}
              className="px-3 py-2 border border-border-custom bg-surface hover:bg-background/80 text-text-primary font-mono text-[10px] uppercase rounded-sm tracking-wider cursor-pointer transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 border border-border-custom bg-surface hover:bg-background/80 hover:text-text-primary text-text-muted rounded-sm cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of the Week headers */}
        <div className="grid grid-cols-7 bg-background/50 border-b border-border-custom">
          {weekdays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-[10px] font-bold font-mono tracking-widest text-text-muted border-r last:border-r-0 border-border-custom/50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Main Grid Calendar */}
        {loading ? (
          <div className="py-24 flex items-center justify-center gap-3 text-text-muted text-xs font-sans">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading scheduled social content...</span>
          </div>
        ) : (
          <div className="grid grid-cols-7 bg-background/5">
            {daysArray.map((cell, idx) => {
              const hasDate = cell.dayNum !== null && cell.dateStr !== null;
              
              // Filter posts that fall on this day
              const dayPosts = hasDate
                ? posts.filter((p) => {
                    const postDate = new Date(p.scheduled_at).toISOString().split('T')[0];
                    return postDate === cell.dateStr;
                  })
                : [];

              const isDayToday =
                hasDate &&
                cell.dayNum === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              return (
                <div
                  key={idx}
                  onClick={() => hasDate && openNewPostEditor(cell.dateStr!)}
                  className={`min-h-[140px] border-r border-b border-border-custom/50 flex flex-col justify-between p-2.5 transition-colors relative ${
                    hasDate
                      ? 'hover:bg-surface/30 cursor-pointer bg-surface/10'
                      : 'bg-background/10 cursor-default'
                  } ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                >
                  {/* Day number header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold leading-none ${
                        isDayToday
                          ? 'text-accent border border-accent bg-accent/10 px-1.5 py-0.5 rounded-sm'
                          : hasDate
                          ? 'text-text-primary'
                          : 'text-text-muted/20'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {hasDate && (
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-accent font-bold hover:underline transition-opacity">
                        + ADD
                      </span>
                    )}
                  </div>

                  {/* Scheduled posts list on this day */}
                  <div className="flex-1 mt-2.5 space-y-1.5 overflow-y-auto max-h-[90px] no-scrollbar">
                    {dayPosts.map((post) => {
                      const postTime = new Date(post.scheduled_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });

                      const platformStyles = {
                        linkedin: 'border-l-2 border-l-[#0A66C2] bg-[#0A66C2]/5 text-[#a8d0f7]',
                        twitter: 'border-l-2 border-l-white bg-zinc-900 text-zinc-100',
                        instagram: 'border-l-2 border-l-[#E1306C] bg-[#E1306C]/5 text-[#ffcddc]',
                        facebook: 'border-l-2 border-l-[#1877F2] bg-[#1877F2]/5 text-[#cce2ff]'
                      };

                      return (
                        <div
                          key={post.id}
                          onClick={(e) => openExistingPostEditor(post, e)}
                          className={`p-1.5 rounded-sm border border-border-custom/20 text-[9px] font-sans truncate leading-normal transition-all hover:bg-background ${
                            platformStyles[post.platform] || platformStyles.linkedin
                          }`}
                          title={`[${post.platform.toUpperCase()}] ${post.content}`}
                        >
                          <div className="flex items-center justify-between font-mono text-[8px] opacity-75 mb-0.5 uppercase">
                            <span>{post.platform}</span>
                            <span>{postTime}</span>
                          </div>
                          <div className="truncate font-medium">{post.content}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor & AI copywriting Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-surface border border-border-custom rounded-card overflow-hidden flex flex-col neumorphism-card-dark max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-text-primary uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-accent" />
                <span>{selectedPost ? 'Edit Scheduled Social Post' : 'Schedule Content Deliverable'}</span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split panel layout: Form on left, AI Agent on right */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Form panel */}
              <form
                onSubmit={handleSavePost}
                className="flex-1 p-6 space-y-4 overflow-y-auto border-r border-border-custom font-sans text-xs"
              >
                {/* Campaign Link */}
                <div className="space-y-1.5">
                  <label className="text-text-muted font-semibold uppercase tracking-wider">
                    Associated Campaign
                  </label>
                  <select
                    value={formCampaignId}
                    onChange={(e) => setFormCampaignId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm"
                    required
                  >
                    <option value="" disabled>Select parent campaign...</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Platform selection */}
                  <div className="space-y-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider">
                      Target Network
                    </label>
                    <select
                      value={formPlatform}
                      onChange={(e) => setFormPlatform(e.target.value as any)}
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm"
                    >
                      <option value="linkedin">LinkedIn Profile</option>
                      <option value="twitter">X / Twitter Feed</option>
                      <option value="instagram">Instagram Grid</option>
                      <option value="facebook">Facebook Page</option>
                    </select>
                  </div>

                  {/* Scheduled date/time */}
                  <div className="space-y-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider">
                      Publish Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formScheduledAt}
                      onChange={(e) => setFormScheduledAt(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-mono text-xs rounded-sm"
                      required
                    />
                  </div>
                </div>

                {/* Content text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-text-muted font-semibold uppercase tracking-wider">
                      Post Content Caption
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAIAssistant(!showAIAssistant)}
                      className="text-accent hover:text-accent-hover font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-accent/5 border border-accent/20 px-2 py-0.5 rounded"
                    >
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>{showAIAssistant ? 'Hide AI Writer' : 'Write with AI Agent'}</span>
                    </button>
                  </div>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm resize-none leading-relaxed"
                    placeholder="Enter copy, links, hashtags, and formatting tags..."
                    required
                  />
                </div>

                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-text-muted font-semibold uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm"
                  >
                    <option value="draft">Draft (Backlog)</option>
                    <option value="scheduled">Scheduled (Queue)</option>
                    <option value="published">Published (Mock callback)</option>
                    <option value="failed">Failed</option>
                  </select>
                  {formStatus === 'published' && (
                    <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-sm mt-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Simulated social publication activity will be logged to database history.</span>
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-border-custom flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="bg-transparent border border-border-custom hover:border-text-primary text-text-muted hover:text-text-primary font-sans text-xs px-4 py-2 rounded-sm transition-colors cursor-pointer"
                    disabled={savingPost}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-hover text-white font-sans text-xs px-5 py-2 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    disabled={savingPost}
                  >
                    {savingPost && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <span>{selectedPost ? 'Save Updates' : 'Queue Deliverable'}</span>
                  </button>
                </div>
              </form>

              {/* AI Copywriter panel (visible when showAIAssistant === true) */}
              {showAIAssistant && (
                <div className="w-full md:w-[380px] bg-background/30 p-6 flex flex-col overflow-y-auto space-y-4 border-t md:border-t-0 md:border-l border-border-custom">
                  <div className="flex items-center justify-between pb-2 border-b border-border-custom">
                    <h4 className="font-display font-bold text-xs text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent fill-current" />
                      <span>AI Copywriter Specialist</span>
                    </h4>
                    <span className="font-mono text-[9px] text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.2 rounded uppercase tracking-wider">
                      copy agent
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">
                      Copywriting brief / objective
                    </label>
                    <textarea
                      value={aiBrief}
                      onChange={(e) => setAiBrief(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm resize-none leading-relaxed"
                      placeholder="e.g. Write a post about our checkout speed upgrades. Emphasize conversion benefits and target Stevie, the Ops Director persona."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAIGeneration}
                    disabled={generatingCopy || !aiBrief.trim()}
                    className="w-full bg-accent hover:bg-accent-hover text-white font-sans font-semibold text-xs py-2 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {generatingCopy ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Consulting voice rules...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Generate Caption</span>
                      </>
                    )}
                  </button>

                  {/* AI Output Result Box */}
                  {generatedAIResult && (
                    <div className="space-y-3.5 border border-border-custom/50 bg-surface/50 p-4 rounded-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-[10px] text-text-primary uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-accent" />
                          <span>Generated Assets</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => applyAICopy(generatedAIResult)}
                          className="bg-accent text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded hover:bg-accent-hover transition-colors cursor-pointer uppercase"
                        >
                          Use this copy
                        </button>
                      </div>

                      <div className="space-y-2 font-sans text-xs border-t border-border-custom/30 pt-3 text-text-primary">
                        <div>
                          <span className="font-bold text-[9px] text-text-muted uppercase block font-mono">Hook Headline</span>
                          <p className="font-semibold text-text-primary">{generatedAIResult.headline}</p>
                        </div>
                        <div>
                          <span className="font-bold text-[9px] text-text-muted uppercase block font-mono">Caption Body</span>
                          <p className="whitespace-pre-line text-text-primary leading-relaxed">{generatedAIResult.primaryCopy}</p>
                        </div>
                        <div>
                          <span className="font-bold text-[9px] text-text-muted uppercase block font-mono">Call to Action</span>
                          <p className="text-accent font-semibold">{generatedAIResult.cta}</p>
                        </div>
                        {generatedAIResult.hashtags && generatedAIResult.hashtags.length > 0 && (
                          <div>
                            <span className="font-bold text-[9px] text-text-muted uppercase block font-mono">Suggested Tags</span>
                            <div className="flex flex-wrap gap-1 mt-1 font-mono text-[9px] text-text-muted">
                              {generatedAIResult.hashtags.map((h, i) => (
                                <span key={i} className="bg-background px-1 rounded border border-border-custom/50">
                                  #{h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {generatedAIResult.optimizationNotes && (
                          <div className="border-t border-border-custom/30 pt-2.5 mt-2.5">
                            <span className="font-bold text-[9px] text-text-muted uppercase block font-mono">Agent Notes</span>
                            <p className="text-[10px] text-text-muted leading-normal italic font-serif">
                              "{generatedAIResult.optimizationNotes}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="py-24 flex items-center justify-center gap-3 text-text-muted text-xs font-sans">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Loading Social Content Calendar...</span>
      </div>
    }>
      <CalendarContent />
    </Suspense>
  );
}
