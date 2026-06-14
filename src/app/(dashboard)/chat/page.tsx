// Location: src/app/(dashboard)/chat/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  MessageSquare,
  Hash,
  Users,
  Paperclip,
  Send,
  RefreshCw,
  AlertCircle,
  FileText,
  Sparkles,
  Info,
  Check,
  Phone,
  Video,
  X,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Monitor,
  Download,
  Copy,
  AlertTriangle,
  Play,
  Square,
  Image as ImageIcon
} from 'lucide-react';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'away';
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  recipient_id: string | null;
  content: string;
  channel_id: string;
  file_attachments: Array<{ name: string; size: string; url: string }>;
  created_at: string;
}

export default function ChatPage() {
  const [channels] = useState([
    { id: 'general', name: 'general', description: 'Workspace operational announcements and coordination.' },
    { id: 'strategy-positioning', name: 'strategy-positioning', description: 'Brand intelligence and positioning audit comments.' },
    { id: 'creative-studio', name: 'creative-studio', description: 'Visual storyboards and social drafts discussion.' },
    { id: 'crm-recovery', name: 'crm-recovery', description: 'Client warning alerts and recovery workflows.' },
  ]);

  const [activeChannelId, setActiveChannelId] = useState('general');
  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(null);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send input state
  const [inputContent, setInputContent] = useState('');
  const [sending, setSending] = useState(false);

  // Mock File upload states
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string; url: string }>>([]);
  const [attaching, setAttaching] = useState(false);

  // Autoresponder Settings Drawer state
  const [isAutoresponderDrawerOpen, setIsAutoresponderDrawerOpen] = useState(false);
  
  // Autoresponder Configuration states
  const [whatsappActive, setWhatsappActive] = useState(false);
  const [instagramActive, setInstagramActive] = useState(false);
  const [messengerActive, setMessengerActive] = useState(false);
  const [linkedinActive, setLinkedinActive] = useState(false);
  const [twitterActive, setTwitterActive] = useState(false);
  const [emulationMode, setEmulationMode] = useState(true);
  const [typingDelay, setTypingDelay] = useState(3); // seconds
  const [typoSimulation, setTypoSimulation] = useState(true);
  const [burstSplitting, setBurstSplitting] = useState(true);
  const [emojiDensity, setEmojiDensity] = useState('balanced'); // low, balanced, expressive
  const [humanStyle, setHumanStyle] = useState('casual'); // formal, corporate, warm, casual

  // Onboarding Link Generator states
  const [linkPlatform, setLinkPlatform] = useState('whatsapp');
  const [linkCustomText, setLinkCustomText] = useState('Hey! Can you set up my Brandavox AI positioning audit?');
  const [copiedLink, setCopiedLink] = useState(false);

  // Typing status indicator simulation
  const [isClientTyping, setIsClientTyping] = useState(false);

  // Conference Meeting states
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [sharedFiles, setSharedFiles] = useState<Array<{ name: string; size: string; sharedBy: string }>>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Meeting slides definitions for teaching / presentations
  const meetingSlides = [
    {
      title: "AI Strategy Launch Blueprint",
      content: "Phase 1: Position audit and vector scanning.\nPhase 2: Accent analysis and multi-model voice synthesis.\nPhase 3: High-frequency social queue calibration."
    },
    {
      title: "Vocal Persona Matrix Mapping",
      content: "Accent parameters: Nigerian (African Dialect) / UK English.\nEmotion matrices: Excited, Concerned, Humorous, Whispering.\nSpeaking tempo ranges: 0.85x to 1.35x."
    },
    {
      title: "Social Queue ROI Metrics",
      content: "Starter Tier: 500 AI credits monthly limit.\nProfessional Tier: 5,000 AI credits with team sync channels.\nAgency Tier: White-label API token directory."
    }
  ];

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/team/members');
      const data = await res.json();
      if (data.success) {
        const filtered = (data.data || []).filter((m: TeamMember) => m.id !== 'user-godswill');
        setMembers(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchMessages = async (showSpinner = false) => {
    if (showSpinner) setLoadingMessages(true);
    try {
      let url = '/api/messages';
      if (activeRecipientId) {
        url += `?recipientId=${activeRecipientId}`;
      } else {
        url += `?channelId=${activeChannelId}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
      setRefreshing(false);
    }
  };

  // On mount: fetch members and initial messages
  useEffect(() => {
    fetchMembers();
  }, []);

  // Sync messages on active channel/recipient change
  useEffect(() => {
    fetchMessages(true);

    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    pollTimerRef.current = setInterval(() => {
      fetchMessages(false);
    }, 5000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [activeChannelId, activeRecipientId]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle meeting recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, [isRecording]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages(false);
  };

  const selectChannel = (id: string) => {
    setActiveChannelId(id);
    setActiveRecipientId(null);
  };

  const selectMember = (id: string) => {
    setActiveRecipientId(id);
    setActiveChannelId('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() && attachedFiles.length === 0) return;

    setSending(true);
    setError(null);

    const userMsgContent = inputContent;

    const payload = {
      channelId: activeChannelId || undefined,
      recipientId: activeRecipientId || undefined,
      content: userMsgContent,
      fileAttachments: attachedFiles,
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      setInputContent('');
      setAttachedFiles([]);
      
      // Update message feed
      await fetchMessages(false);

      // Trigger AI Humanoid Autoresponder simulation if enabled
      const isAutoresponderEnabled = whatsappActive || instagramActive || messengerActive || linkedinActive || twitterActive;
      if (isAutoresponderEnabled && emulationMode) {
        triggerHumanoidSimulation(userMsgContent);
      }

    } catch (err: any) {
      setError(err.message || 'Error occurred while sending message.');
    } finally {
      setSending(false);
    }
  };

  // Humanoid Simulation response generator
  const triggerHumanoidSimulation = (userPrompt: string) => {
    setIsClientTyping(true);
    
    setTimeout(() => {
      setIsClientTyping(false);

      // 1. Generate text matching style
      let replyOptions = [
        "Let me inspect the strategy guidelines. We'll deliver the primary campaign updates by tomorrow afternoon.",
        "That looks perfect. I've sent the invoice over to compliance. I think the position audit is solid.",
        "Thanks for the update. Let's make sure the accent synthesizer matches our local target audience profiles.",
        "I reviewed the positioning strategy document. The positioning parameters are well balanced. Good work!"
      ];

      if (humanStyle === 'casual') {
        replyOptions = [
          "sounds cool! i'll check the campaign details and let you know what i think. catch you later.",
          "sweet, thanks! i'll pass this draft to the team and see what they say.",
          "awesome job on the script storyboard. let me run a quick pass and get back to you.",
          "great, that fits nicely. i'll update the pipeline budget in a bit."
        ];
      } else if (humanStyle === 'warm') {
        replyOptions = [
          "Hello Godswill! Thank you so much for putting this positioning checklist together. It looks wonderful.",
          "This is extremely helpful! I appreciate your quick support on the marketing assets. Talk soon.",
          "Hope you are having a great week! I'll read through the video storyboard edits this evening.",
          "Thank you! Your brand intelligence audit really helped us clarify our core positioning."
        ];
      }

      let chosenText = replyOptions[Math.floor(Math.random() * replyOptions.length)];

      // 2. Add emojis matching density
      if (emojiDensity === 'expressive') {
        chosenText += " 🔥🚀📈";
      } else if (emojiDensity === 'balanced') {
        chosenText += " 👍";
      }

      // 3. Inject human typo simulation (e.g. stratgy -> strategy*)
      if (typoSimulation) {
        const typoChance = Math.random();
        if (typoChance > 0.4) {
          chosenText = chosenText.replace(/\bstrategy\b/gi, 'stratgy');
          chosenText = chosenText.replace(/\btomorrow\b/gi, 'tomorow');
          chosenText += `\n\n*${typoChance > 0.7 ? 'strategy' : 'tomorrow'}`;
        }
      }

      // 4. Send the message to the DB to persist
      const isChannel = !!activeChannelId;
      const responderId = activeRecipientId || 'member-client';
      const responderName = activeRecipientId 
        ? members.find((m) => m.id === activeRecipientId)?.full_name || 'Client'
        : 'External Client Responder';
      const responderRole = 'client';

      const simulatedMessage: Message = {
        id: `msg-sim-${Math.random().toString(36).substr(2, 9)}`,
        sender_id: `agent-humanoid-${responderId}`,
        sender_name: `${responderName} (${activeChannelId ? 'Auto' : 'DM'})`,
        sender_role: responderRole,
        recipient_id: isChannel ? null : 'user-godswill',
        content: chosenText,
        channel_id: activeChannelId || 'general',
        file_attachments: [],
        created_at: new Date().toISOString()
      };

      // Update state locally and save to DB
      setMessages((prev) => [...prev, simulatedMessage]);

      // Trigger Webhook simulation stats update
      fetch('/api/developer/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'autoresponder.message_relayed',
          payload: { messageId: simulatedMessage.id, platform: linkPlatform, source: 'external' }
        })
      }).catch(err => console.error(err));

    }, typingDelay * 1000);
  };

  // Onboarding Lead Link Generator URL
  const getGeneratedLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://brandavox.ai';
    return `${baseUrl}/chat/join?platform=${linkPlatform}&text=${encodeURIComponent(linkCustomText)}&ref=org_godswill`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getGeneratedLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Simulate attaching a file
  const handleAttachFile = () => {
    setAttaching(true);
    setTimeout(() => {
      const mockFiles = [
        { name: 'speed_audit_report.pdf', size: '2.4MB', url: '#' },
        { name: 'social_grid_preview.png', size: '840KB', url: '#' },
        { name: 're-engagement_email_templates.txt', size: '12KB', url: '#' },
      ];
      const selectedFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
      setAttachedFiles((prev) => [...prev, selectedFile]);
      setAttaching(false);
    }, 800);
  };

  // Conference room controls
  const handleScreenshot = () => {
    const link = document.createElement('a');
    link.href = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%2318181b"/><text x="40" y="80" fill="%23ffffff" font-family="sans-serif" font-size="20">BRANDAVOX CONFERENCE SCREENSHOT</text><text x="40" y="110" fill="%23a1a1aa" font-family="monospace" font-size="12">Timestamp: ' + new Date().toLocaleString() + '</text><rect x="40" y="150" width="720" height="400" fill="%2327272a" stroke="%233f3f46" stroke-width="2"/><text x="360" y="360" fill="%23ffffff" font-family="sans-serif" font-size="14">Teaching Screen View</text></svg>';
    link.download = `brandavox_conference_screenshot_${Date.now()}.png`;
    link.click();
  };

  const handleSnapshot = () => {
    // Downloads camera photo
    const link = document.createElement('a');
    link.href = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%2309090b"/><circle cx="150" cy="150" r="100" fill="%2327272a"/><text x="120" y="160" fill="%23ffffff" font-family="monospace" font-size="14">Godswill J.</text></svg>';
    link.download = `brandavox_snapshot_${Date.now()}.jpg`;
    link.click();

    // Attach to message as well
    const fileRecord = { name: `meeting_snapshot_${Date.now()}.jpg`, size: '142KB', url: '#' };
    setAttachedFiles((prev) => [...prev, fileRecord]);
  };

  const handleToggleScreenRecord = () => {
    if (isRecording) {
      // Save/Download Recording file
      const link = document.createElement('a');
      const blob = new Blob(['Simulated Brandavox Conference Screen Recording MP4 Data'], { type: 'video/mp4' });
      link.href = URL.createObjectURL(blob);
      link.download = `brandavox_meeting_recording_${Date.now()}.mp4`;
      link.click();
      setIsRecording(false);
      alert("Screen Recording finalized. Simulated MP4 downloaded.");
    } else {
      setIsRecording(true);
    }
  };

  const handleMeetingFileUpload = () => {
    const sampleFiles = ["presentation_slide_deck.pdf", "branding_blueprint.pdf", "launch_flowchart.png"];
    const fileName = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    const newFile = { name: fileName, size: "1.8MB", sharedBy: "Godswill Johnson (You)" };
    setSharedFiles((prev) => [...prev, newFile]);

    // Also share to main group chat
    const fileMsg: Message = {
      id: `msg-file-${Math.random().toString(36).substr(2, 9)}`,
      sender_id: 'user-godswill',
      sender_name: 'Godswill Johnson',
      sender_role: 'owner',
      recipient_id: null,
      content: `📁 Shared file during conference: **${newFile.name}**`,
      channel_id: activeChannelId || 'general',
      file_attachments: [{ name: newFile.name, size: newFile.size, url: '#' }],
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, fileMsg]);
  };

  const formatRecordTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeChannelName = activeChannelId
    ? channels.find((c) => c.id === activeChannelId)?.name
    : '';
  const activeMemberName = activeRecipientId
    ? members.find((m) => m.id === activeRecipientId)?.full_name
    : '';

  return (
    <div className="space-y-6 flex flex-col h-[85vh] relative">
      {/* Page Header */}
      <div className="shrink-0 flex items-center justify-between">
        <PageHeader
          title="Collaboration Hub"
          description="Exchange real-time workspace updates, toggle platform responders, and trigger Google Meet/Zoom style teaching conferences."
        />
        <div className="flex gap-2">
          {/* Join Conference Room Button */}
          <button
            onClick={() => setIsMeetingActive(true)}
            className="px-4 py-2 border border-accent hover:bg-accent/15 text-accent text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer bg-surface select-none"
            title="Start video conference room"
          >
            <Video className="w-4 h-4" />
            <span>Start Meeting</span>
          </button>

          {/* Autoresponder Settings Trigger */}
          <button
            onClick={() => setIsAutoresponderDrawerOpen(!isAutoresponderDrawerOpen)}
            className={`px-4 py-2 border text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer select-none ${
              isAutoresponderDrawerOpen
                ? 'border-accent bg-accent text-white'
                : 'border-border-custom hover:border-accent text-text-primary bg-surface'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Autoresponder Settings</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start gap-3 text-xs font-sans shrink-0">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Main Console Split Container */}
      <div className="flex-1 flex border border-border-custom rounded-card overflow-hidden bg-surface neumorphism-card-dark min-h-0 relative">
        
        {/* Left pane: Navigation Sidebar */}
        <div className="w-60 border-r border-border-custom bg-background/25 flex flex-col justify-between shrink-0 select-none">
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 font-mono text-[10px] text-text-muted">
            
            {/* Channels block */}
            <div className="space-y-2">
              <span className="font-semibold tracking-widest uppercase px-3 block">
                CHANNELS
              </span>
              <ul className="space-y-1">
                {channels.map((chan) => {
                  const isActive = activeChannelId === chan.id;
                  return (
                    <li key={chan.id}>
                      <button
                        onClick={() => selectChannel(chan.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-badge text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'text-text-primary bg-background border-l-2 border-accent pl-2.5 font-bold'
                            : 'hover:bg-background/20 hover:text-text-primary'
                        }`}
                      >
                        <Hash className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-text-muted/60'}`} />
                        <span>{chan.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Direct messages block */}
            <div className="space-y-2">
              <span className="font-semibold tracking-widest uppercase px-3 block">
                DIRECT MESSAGES
              </span>
              {loadingMembers ? (
                <div className="px-3 py-4 text-center">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto opacity-40" />
                </div>
              ) : (
                <ul className="space-y-1">
                  {members.map((mem) => {
                    const isActive = activeRecipientId === mem.id;
                    const statusDot = {
                      online: 'bg-emerald-500',
                      away: 'bg-amber-500',
                      offline: 'bg-zinc-600',
                    };

                    return (
                      <li key={mem.id}>
                        <button
                          onClick={() => selectMember(mem.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-badge text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'text-text-primary bg-background border-l-2 border-accent pl-2.5 font-bold'
                              : 'hover:bg-background/20 hover:text-text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[mem.status]}`} />
                            <span className="truncate font-sans text-xs">{mem.full_name}</span>
                          </div>
                          <span className="text-[8px] font-bold text-zinc-500 shrink-0 uppercase tracking-widest">
                            {mem.role}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

          </div>

          {/* User profile identifier */}
          <div className="p-4 border-t border-border-custom bg-background/20 flex items-center gap-2.5 text-[10px] font-mono">
            <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center font-bold">
              GJ
            </div>
            <div>
              <div className="font-bold text-text-primary">Godswill Johnson</div>
              <div className="text-zinc-500 uppercase tracking-widest text-[8px]">Owner (you)</div>
            </div>
          </div>

        </div>

        {/* Middle pane: Chat Area */}
        <div className="flex-1 flex flex-col bg-background/5 min-w-0 relative">
          
          {/* Active Chat Header */}
          <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between bg-background/30 shrink-0 select-none">
            <div className="flex items-center gap-2">
              {activeChannelId ? (
                <>
                  <Hash className="w-4 h-4 text-accent" />
                  <span className="font-display font-bold text-sm text-text-primary uppercase tracking-wider">
                    {activeChannelName}
                  </span>
                  <span className="text-[10px] text-text-muted hidden md:inline ml-2 truncate max-w-sm">
                    {channels.find((c) => c.id === activeChannelId)?.description}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-sans font-bold text-sm text-text-primary">
                    {activeMemberName}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-zinc-500 uppercase">
                {messages.length} Messages
              </span>
              <button
                onClick={handleRefresh}
                className="p-1.5 border border-border-custom hover:border-accent text-text-muted hover:text-accent rounded transition-all cursor-pointer bg-surface"
                title="Refresh Thread"
                disabled={refreshing}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Scrollable messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-background/10">
            {loadingMessages ? (
              <div className="py-24 flex flex-col items-center justify-center gap-2 text-text-muted text-xs font-mono">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SYNCING MESSAGE STREAMS...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center text-text-muted font-sans text-xs">
                <MessageSquare className="w-12 h-12 text-zinc-800 mb-2.5" />
                <p className="font-semibold text-text-primary uppercase tracking-widest text-[10px]">
                  No message history
                </p>
                <p className="max-w-xs mt-1 text-zinc-500 text-[10px] leading-normal">
                  This conversation is empty. Type a message below or call a strategist assistant by typing `@brand`.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isAI = msg.sender_id.startsWith('agent-');
                  
                  const roleColors: Record<string, string> = {
                    owner: 'bg-accent/10 text-accent border-accent/25',
                    admin: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
                    manager: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
                    member: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
                    client: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
                    'AI Assistant': 'bg-pink-500/10 text-pink-400 border-pink-500/25 animate-pulse',
                  };

                  const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-1.5 p-4 rounded-card border transition-all max-w-[90%] md:max-w-[80%] ${
                        isAI
                          ? 'bg-accent/5 border-accent/25 ml-4 hover:border-accent/50'
                          : 'bg-surface/60 border-border-custom/50 hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[9px] text-text-muted select-none">
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans text-xs font-bold text-text-primary">
                            {msg.sender_name}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded-badge border uppercase tracking-wider text-[8px] ${
                            roleColors[msg.sender_role] || 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                          }`}>
                            {msg.sender_role}
                          </span>
                        </div>
                        <span>{formattedTime}</span>
                      </div>

                      <div className="text-xs text-text-primary leading-relaxed whitespace-pre-line font-sans">
                        {msg.content}
                      </div>

                      {msg.file_attachments && msg.file_attachments.length > 0 && (
                        <div className="pt-2 border-t border-border-custom/30 space-y-1">
                          {msg.file_attachments.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.url}
                              className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-background border border-border-custom/50 rounded-sm hover:border-accent text-[9px] font-mono text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-accent" />
                              <span>{file.name}</span>
                              <span className="opacity-60">({file.size})</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Client Typing Indicator Bubble */}
                {isClientTyping && (
                  <div className="flex flex-col space-y-1.5 p-4 rounded-card border bg-zinc-900/40 border-dashed border-accent/30 max-w-[200px] animate-pulse">
                    <span className="font-mono text-[8px] text-accent uppercase tracking-widest font-bold">Autoresponder Emulation</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[10px] text-text-muted font-sans ml-1">Client is typing...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat Footer panel */}
          <div className="p-4 border-t border-border-custom bg-surface/50 shrink-0">
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {attachedFiles.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-background border border-border-custom rounded-sm text-[9px] font-mono text-text-primary"
                  >
                    <Paperclip className="w-3 h-3 text-accent" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <button
                type="button"
                onClick={handleAttachFile}
                disabled={attaching || sending}
                className="px-3 border border-border-custom hover:border-accent text-text-muted hover:text-accent rounded-sm transition-colors flex items-center justify-center bg-background shrink-0 cursor-pointer disabled:opacity-40"
                title="Simulate file upload"
              >
                <Paperclip className={`w-4 h-4 ${attaching ? 'animate-bounce' : ''}`} />
              </button>
              
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={
                  activeRecipientId
                    ? `Message ${activeMemberName}...`
                    : `Send message in #${activeChannelName}...`
                }
                disabled={sending}
                className="flex-1 bg-background border border-border-custom px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent font-sans text-xs rounded-sm placeholder:text-text-muted/40"
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={sending || (!inputContent.trim() && attachedFiles.length === 0)}
                className="px-4 bg-accent hover:bg-accent-hover text-white rounded-sm transition-colors flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-text-muted select-none">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-accent" />
                <span>
                  Type <strong className="text-accent">@copy [brief]</strong> to write copy, or <strong className="text-accent">@brand [question]</strong> to audit guidelines.
                </span>
              </span>
              {(whatsappActive || instagramActive || messengerActive || linkedinActive || twitterActive) && (
                <span className="text-accent font-bold uppercase animate-pulse">
                  ● social autoresponder active
                </span>
              )}
            </div>

          </div>

        </div>

        {/* Right drawer: Autoresponder & Humanoid Emulation Settings */}
        {isAutoresponderDrawerOpen && (
          <div className="w-80 border-l border-border-custom bg-background/95 flex flex-col justify-between shrink-0 font-sans text-xs select-none p-5 space-y-6 overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-custom shrink-0">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-text-primary font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Autoresponder Panel</span>
              </span>
              <button
                onClick={() => setIsAutoresponderDrawerOpen(false)}
                className="p-1 border border-border-custom rounded hover:border-accent hover:text-accent cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content segments */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-1">
              
              {/* Platform Switch Toggles */}
              <div className="space-y-3">
                <span className="font-mono text-[9px] text-text-primary uppercase tracking-widest font-bold block border-b border-border-custom/30 pb-1">
                  Social Channels Responder Toggles
                </span>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-sans">WhatsApp Autoresponder</span>
                    <input
                      type="checkbox"
                      checked={whatsappActive}
                      onChange={(e) => setWhatsappActive(e.target.checked)}
                      className="w-8 h-4 bg-zinc-800 border-border-custom rounded-full cursor-pointer accent-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans">Instagram Direct messages</span>
                    <input
                      type="checkbox"
                      checked={instagramActive}
                      onChange={(e) => setInstagramActive(e.target.checked)}
                      className="w-8 h-4 bg-zinc-800 border-border-custom rounded-full cursor-pointer accent-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans">Facebook Messenger</span>
                    <input
                      type="checkbox"
                      checked={messengerActive}
                      onChange={(e) => setMessengerActive(e.target.checked)}
                      className="w-8 h-4 bg-zinc-800 border-border-custom rounded-full cursor-pointer accent-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans">LinkedIn InMail Responder</span>
                    <input
                      type="checkbox"
                      checked={linkedinActive}
                      onChange={(e) => setLinkedinActive(e.target.checked)}
                      className="w-8 h-4 bg-zinc-800 border-border-custom rounded-full cursor-pointer accent-accent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans">X / Twitter DM Responder</span>
                    <input
                      type="checkbox"
                      checked={twitterActive}
                      onChange={(e) => setTwitterActive(e.target.checked)}
                      className="w-8 h-4 bg-zinc-800 border-border-custom rounded-full cursor-pointer accent-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Onboarding Link Generator */}
              <div className="space-y-3 border-t border-border-custom/50 pt-4">
                <span className="font-mono text-[9px] text-text-primary uppercase tracking-widest font-bold block">
                  Lead Link Generator (Take client to chat)
                </span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-text-muted font-bold uppercase">Platform Destination</label>
                    <select
                      value={linkPlatform}
                      onChange={(e) => setLinkPlatform(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-background border border-border-custom text-text-primary rounded-sm"
                    >
                      <option value="whatsapp">WhatsApp Business Redirect</option>
                      <option value="instagram">Instagram Bio Link</option>
                      <option value="linkedin">LinkedIn Page Button</option>
                      <option value="custom">Generic Social Embed</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-text-muted font-bold uppercase">Preset Lead Message</label>
                    <textarea
                      value={linkCustomText}
                      onChange={(e) => setLinkCustomText(e.target.value)}
                      rows={2}
                      className="w-full p-2 bg-background border border-border-custom text-text-primary text-[10px] rounded-sm font-mono"
                    />
                  </div>

                  <div className="bg-background border border-border-custom p-2 rounded-sm font-mono text-[9px] break-all select-all flex justify-between items-start gap-2 text-zinc-400">
                    <span className="truncate max-w-[200px]">{getGeneratedLink()}</span>
                    <button
                      onClick={handleCopyLink}
                      className="p-1 border border-border-custom hover:border-accent hover:text-accent rounded shrink-0 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Realistic AI Humanoid parameters */}
              <div className="space-y-3 border-t border-border-custom/50 pt-4">
                <span className="font-mono text-[9px] text-text-primary uppercase tracking-widest font-bold block border-b border-border-custom/30 pb-1">
                  Humanoid Brain Parameters
                </span>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-semibold">Enforce Human Emulation</span>
                    <input
                      type="checkbox"
                      checked={emulationMode}
                      onChange={(e) => setEmulationMode(e.target.checked)}
                      className="w-8 h-4 bg-zinc-800 border-border-custom rounded-full cursor-pointer accent-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-text-muted font-mono uppercase font-bold">
                      <span>Typing/Pause Delay</span>
                      <span>{typingDelay}s</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={typingDelay}
                      onChange={(e) => setTypingDelay(Number(e.target.value))}
                      className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-sans">Simulate Typos & Corrections</span>
                    <input
                      type="checkbox"
                      checked={typoSimulation}
                      onChange={(e) => setTypoSimulation(e.target.checked)}
                      className="w-8 h-4 bg-zinc-800 border-border-custom rounded-full cursor-pointer accent-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-sans">Paragraph Message Splitting</span>
                    <input
                      type="checkbox"
                      checked={burstSplitting}
                      onChange={(e) => setBurstSplitting(e.target.checked)}
                      className="w-8 h-4 bg-zinc-800 border-border-custom rounded-full cursor-pointer accent-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-text-muted font-bold uppercase block">Emoji Density Matrix</label>
                    <select
                      value={emojiDensity}
                      onChange={(e) => setEmojiDensity(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-background border border-border-custom text-text-primary rounded-sm"
                    >
                      <option value="none">No Emojis (Corporate Strict)</option>
                      <option value="balanced">Balanced (1-2 natural emojis)</option>
                      <option value="expressive">Expressive (High-density marketing)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-text-muted font-bold uppercase block">Conversational Accent Style</label>
                    <select
                      value={humanStyle}
                      onChange={(e) => setHumanStyle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-background border border-border-custom text-text-primary rounded-sm"
                    >
                      <option value="corporate">Formal Corporate (Teammate)</option>
                      <option value="casual">Casual Modern (Client direct)</option>
                      <option value="warm">Warm Mentor (Instructor)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border-custom text-[8px] font-mono text-zinc-500 uppercase tracking-widest text-center shrink-0">
              Autoresponder Engine v3.2
            </div>

          </div>
        )}

      </div>

      {/* Meet / Zoom Style Fullscreen Conference Workspace Overlay */}
      {isMeetingActive && (
        <div className="absolute inset-0 bg-background z-50 flex flex-col justify-between font-sans text-xs border border-border-custom rounded-card overflow-hidden select-none">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-custom bg-surface flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="font-display font-bold text-sm tracking-wider text-text-primary uppercase">
                Collaboration meeting room — {isScreenSharing ? "Whiteboard Teaching Mode" : "Conference Mode"}
              </span>
              {isRecording && (
                <span className="px-2 py-0.5 border border-red-500/25 bg-red-500/10 text-red-500 font-mono font-bold uppercase text-[9px] rounded flex items-center gap-1.5 ml-3 animate-pulse">
                  <Square className="w-2 h-2 fill-current" />
                  <span>REC {formatRecordTime(recordSeconds)}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">
                Room ID: meet-bv-org-godswill
              </span>
              <button
                onClick={() => {
                  setIsMeetingActive(false);
                  setIsRecording(false);
                  setIsScreenSharing(false);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono font-bold uppercase tracking-wider rounded text-[9px] transition-colors cursor-pointer"
              >
                End Meeting
              </button>
            </div>
          </div>

          {/* Main workspace (Grid & Screen Share panel) */}
          <div className="flex-1 flex overflow-hidden min-h-0 bg-zinc-950 p-6 gap-6">
            
            {/* Left side: Main Camera Grid / Screen Share slides */}
            <div className="flex-1 flex flex-col min-h-0 justify-between gap-6">
              
              {isScreenSharing ? (
                // Screen Sharing Slate View
                <div className="flex-1 border border-border-custom bg-surface rounded-card p-6 flex flex-col justify-between min-h-0 relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-border-custom/50 pb-3">
                    <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-widest flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-accent" />
                      <span>PRESENTING: {meetingSlides[selectedSlide].title}</span>
                    </span>
                    <div className="flex gap-1">
                      {meetingSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlide(idx)}
                          className={`px-2.5 py-1 text-[9px] font-mono rounded border ${
                            selectedSlide === idx
                              ? 'border-accent bg-accent text-white font-bold'
                              : 'border-border-custom hover:border-accent bg-background text-text-muted'
                          }`}
                        >
                          Slide {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Presenting content wireframe */}
                  <div className="flex-1 flex flex-col justify-center items-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent animate-pulse">
                      <Monitor className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-text-primary uppercase tracking-wider">
                      {meetingSlides[selectedSlide].title}
                    </h3>
                    <p className="max-w-lg text-xs leading-relaxed text-text-muted font-mono whitespace-pre-line bg-background/50 border border-border-custom/60 p-4 rounded-card text-left">
                      {meetingSlides[selectedSlide].content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border-custom/40 flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    <span>* whiteboard drawing tools active</span>
                    <span>Brandavox Presentation Deck</span>
                  </div>
                </div>
              ) : (
                // Multi-person Camera Grid
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                  
                  {/* Block 1: Godswill Johnson (You) */}
                  <div className="border border-border-custom bg-surface rounded-card p-4 flex flex-col justify-between items-center relative overflow-hidden">
                    <div className="absolute top-3 left-3 bg-zinc-900/80 px-2 py-0.5 border border-border-custom rounded text-[9px] font-mono text-text-primary uppercase font-bold z-10">
                      Godswill Johnson (You)
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full">
                      {isCameraOn ? (
                        // Mock camera canvas outline
                        <div className="w-32 h-32 rounded-full border-2 border-accent border-dashed flex items-center justify-center relative animate-[spin_10s_linear_infinite]">
                          <div className="w-24 h-24 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent text-lg font-bold">
                            GJ
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-zinc-900 border border-border-custom flex items-center justify-center text-zinc-500 text-lg font-bold">
                          Camera Off
                        </div>
                      )}
                    </div>

                    {/* Microphone volume monitor */}
                    <div className="w-full flex items-center justify-between border-t border-border-custom/40 pt-2 shrink-0">
                      <span className="font-mono text-[9px] text-text-muted uppercase">MIC SOURCE</span>
                      {isMicOn ? (
                        <div className="flex gap-0.5 items-end h-3">
                          <div className="w-0.75 h-2 bg-accent animate-pulse" />
                          <div className="w-0.75 h-3 bg-accent animate-pulse" style={{ animationDelay: '100ms' }} />
                          <div className="w-0.75 h-1.5 bg-accent animate-pulse" style={{ animationDelay: '200ms' }} />
                          <div className="w-0.75 h-2.5 bg-accent animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <span className="text-red-500 font-mono text-[9px] uppercase font-bold flex items-center gap-1">
                          <MicOff className="w-3 h-3" />
                          <span>MUTED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Block 2: Teammate (Sarah Connor) */}
                  <div className="border border-border-custom bg-surface rounded-card p-4 flex flex-col justify-between items-center relative overflow-hidden">
                    <div className="absolute top-3 left-3 bg-zinc-900/80 px-2 py-0.5 border border-border-custom rounded text-[9px] font-mono text-text-primary uppercase font-bold z-10">
                      Sarah Connor (Creative)
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full">
                      <div className="w-32 h-32 rounded-full border-2 border-border-custom border-dashed flex items-center justify-center relative animate-[spin_15s_linear_infinite]">
                        <div className="w-24 h-24 rounded-full bg-background border border-border-custom flex items-center justify-center text-text-primary text-lg font-bold">
                          SC
                        </div>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between border-t border-border-custom/40 pt-2 shrink-0">
                      <span className="font-mono text-[9px] text-text-muted uppercase">AUDIO STREAM</span>
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-0.75 h-1.5 bg-zinc-600 animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-0.75 h-2 bg-zinc-600 animate-pulse" style={{ animationDelay: '50ms' }} />
                        <div className="w-0.75 h-1.5 bg-zinc-600 animate-pulse" style={{ animationDelay: '250ms' }} />
                      </div>
                    </div>
                  </div>

                  {/* Block 3: AI Assistant Strategist */}
                  <div className="border border-border-custom bg-surface rounded-card p-4 flex flex-col justify-between items-center relative overflow-hidden">
                    <div className="absolute top-3 left-3 bg-zinc-900/80 px-2 py-0.5 border border-border-custom rounded text-[9px] font-mono text-accent uppercase font-bold z-10">
                      AI Strategist Bot
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full">
                      <div className="w-32 h-32 rounded-full border border-accent/40 flex items-center justify-center relative bg-accent/5">
                        <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between border-t border-border-custom/40 pt-2 shrink-0">
                      <span className="font-mono text-[9px] text-accent uppercase">NEURAL LINK</span>
                      <span className="text-emerald-500 font-mono text-[9px] uppercase font-bold">listening</span>
                    </div>
                  </div>

                </div>
              )}

              {/* Toolbar Controls Panel */}
              <div className="bg-surface border border-border-custom p-4 rounded-card flex flex-wrap justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Camera toggle */}
                  <button
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={`p-2.5 rounded border transition-all cursor-pointer ${
                      isCameraOn 
                        ? 'border-border-custom hover:border-accent text-text-primary bg-background' 
                        : 'border-red-500 bg-red-500/10 text-red-500'
                    }`}
                    title={isCameraOn ? "Mute Camera" : "Unmute Camera"}
                  >
                    {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </button>

                  {/* Microphone toggle */}
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-2.5 rounded border transition-all cursor-pointer ${
                      isMicOn 
                        ? 'border-border-custom hover:border-accent text-text-primary bg-background' 
                        : 'border-red-500 bg-red-500/10 text-red-500'
                    }`}
                    title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  {/* Share Screen toggle */}
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-2.5 rounded border transition-all cursor-pointer ${
                      isScreenSharing 
                        ? 'border-accent bg-accent text-white' 
                        : 'border-border-custom hover:border-accent text-text-primary bg-background'
                    }`}
                    title={isScreenSharing ? "Stop sharing screen" : "Share screen slides"}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Take Screenshot */}
                  <button
                    onClick={handleScreenshot}
                    className="px-3.5 py-2.5 border border-border-custom hover:border-accent text-text-primary rounded bg-background text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                    title="Take meeting screenshot"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Screenshot</span>
                  </button>

                  {/* Camera Snapshot */}
                  <button
                    onClick={handleSnapshot}
                    className="px-3.5 py-2.5 border border-border-custom hover:border-accent text-text-primary rounded bg-background text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                    title="Take camera snapshot"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snapshot</span>
                  </button>

                  {/* Screen Recorder */}
                  <button
                    onClick={handleToggleScreenRecord}
                    className={`px-3.5 py-2.5 border rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all ${
                      isRecording 
                        ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' 
                        : 'border-border-custom hover:border-accent text-text-primary bg-background'
                    }`}
                  >
                    {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isRecording ? "Stop Record" : "Record Screen"}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right side: Meeting shared files directory */}
            <div className="w-72 border-l border-border-custom bg-surface rounded-card p-5 flex flex-col justify-between shrink-0 min-h-0 select-none">
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <span className="font-mono text-[9px] text-text-primary uppercase tracking-widest font-bold block border-b border-border-custom/50 pb-2">
                  Conference File Sharing
                </span>

                {/* Upload Action */}
                <div 
                  onClick={handleMeetingFileUpload}
                  className="border border-dashed border-border-custom hover:border-accent p-6 rounded-card text-center cursor-pointer bg-background/50 hover:bg-background transition-all"
                >
                  <Paperclip className="w-6 h-6 text-accent mx-auto mb-2" />
                  <span className="text-[10px] text-text-primary font-bold block">Share File to Call</span>
                  <span className="text-[8px] text-text-muted mt-1 block">PDF, PNG, MP4 up to 50MB</span>
                </div>

                {/* Files List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[8px] text-text-muted font-mono uppercase block">Shared files history</span>
                  {sharedFiles.length === 0 ? (
                    <div className="text-[9px] text-zinc-600 italic">No files shared in this conference yet.</div>
                  ) : (
                    <ul className="space-y-2">
                      {sharedFiles.map((file, idx) => (
                        <li key={idx} className="border border-border-custom p-2.5 rounded bg-background flex flex-col gap-1">
                          <span className="font-sans font-bold text-text-primary text-[10px] truncate">{file.name}</span>
                          <div className="flex justify-between items-center text-[8px] font-mono text-text-muted uppercase">
                            <span>{file.size}</span>
                            <span>By: {file.sharedBy}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border-custom text-[8px] font-mono text-zinc-500 uppercase tracking-widest text-center shrink-0">
                ZOOM/MEET INTEGRATION PROXY
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
