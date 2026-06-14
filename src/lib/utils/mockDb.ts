// Brandavox Local Mock DB Utility
// Location: src/lib/utils/mockDb.ts

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/lib/utils/mockDb.json');

export interface MockBrand {
  id: string;
  organization_id: string;
  name: string;
  industry: string;
  mission: string;
  vision: string;
  values: string[];
  voice: string; // Strategy JSON string
  tone: string;  // Tone sliders description
  brand_score: number;
  logo_url: string | null;
  website: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MockPersona {
  id: string;
  organization_id: string;
  brand_id: string;
  name: string;
  age_range: string;
  demographics: any;
  pain_points: string[];
  goals: string[];
  platforms: string[];
  created_at: string;
  updated_at: string;
}

export interface MockClient {
  id: string;
  organization_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  health_score: number;
  revenue: number;
  status: 'onboarding' | 'active' | 'at_risk' | 'churned';
  notes: string;
  assigned_to: string | null;
  health_details: string; // JSON containing communication, projectSuccess, revenueGrowth, satisfaction
  created_at: string;
  updated_at: string;
}

export interface MockRecoveryPlan {
  id: string;
  organization_id: string;
  client_id: string;
  status: string;
  risk_score: number;
  strategy: string; // JSON array
  outreach_sequence: string; // JSON array of emails
  actions: string; // JSON array of tasks
  created_at: string;
  updated_at: string;
}

export interface MockCampaign {
  id: string;
  organization_id: string;
  brand_id: string;
  title: string;
  objective: string;
  budget: number;
  status: 'draft' | 'active' | 'completed';
  start_date: string;
  end_date: string;
  channels: string[]; // JSON array in db, string[] here
  created_at: string;
  updated_at: string;
}

export interface MockCampaignPost {
  id: string;
  organization_id: string;
  campaign_id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook';
  content: string;
  scheduled_at: string;
  published_at: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  performance: any; // JSON
  created_at: string;
  updated_at: string;
}

export interface MockTeamMember {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'client';
  avatar_url: string | null;
  status: 'online' | 'offline' | 'away';
  created_at: string;
}

export interface MockMessage {
  id: string;
  organization_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  recipient_id: string | null;
  content: string;
  file_attachments: any[]; // JSON array
  channel_id: string;
  created_at: string;
}

export interface MockApiKey {
  id: string;
  organization_id: string;
  name: string;
  hashed_key: string;
  key_prefix: string;
  last_used_at: string | null;
  scopes: string[];
  created_at: string;
}

export interface MockWebhook {
  id: string;
  organization_id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

export interface MockWebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  status_code: number;
  latency_ms: number;
  payload: string; // JSON string
  created_at: string;
}

export interface MockSecurityStats {
  rateLimitBlocks: number;
  burnerEmailIntercepts: number;
}

export interface MockEmailMarketingConfig {
  activeSyncProvider: 'zeptomail' | 'aws_ses' | 'alibaba_directmail';
  authRoute: 'zeptomail' | 'aws_ses' | 'alibaba_directmail';
  transactionalRoute: 'zeptomail' | 'aws_ses' | 'alibaba_directmail';
  marketingRoute: 'zeptomail' | 'aws_ses' | 'alibaba_directmail';
  syncHistory: Array<{
    id: string;
    email: string;
    fullName: string;
    provider: string;
    status: 'success' | 'failed';
    timestamp: string;
  }>;
}

interface MockDataPayload {
  brands: MockBrand[];
  personas: MockPersona[];
  clients: MockClient[];
  recoveryPlans: MockRecoveryPlan[];
  campaigns: MockCampaign[];
  campaignPosts: MockCampaignPost[];
  teamMembers: MockTeamMember[];
  messages: MockMessage[];
  apiKeys: MockApiKey[];
  webhooks: MockWebhook[];
  webhookLogs: MockWebhookLog[];
  securityStats?: MockSecurityStats;
  emailMarketingConfig?: MockEmailMarketingConfig;
}

const defaultData: MockDataPayload = {
  securityStats: {
    rateLimitBlocks: 42,
    burnerEmailIntercepts: 18
  },
  emailMarketingConfig: {
    activeSyncProvider: 'aws_ses',
    authRoute: 'zeptomail',
    transactionalRoute: 'aws_ses',
    marketingRoute: 'alibaba_directmail',
    syncHistory: [
      {
        id: 'sync-1',
        email: 'd.miller@novafreight.com',
        fullName: 'David Miller',
        provider: 'aws_ses',
        status: 'success',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'sync-2',
        email: 'sjenkins@acmepaper.com',
        fullName: 'Sarah Jenkins',
        provider: 'zeptomail',
        status: 'success',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  brands: [
    {
      id: 'brand-pulse',
      organization_id: 'mock-org-123',
      name: 'Pulse Retail',
      industry: 'Modern E-commerce Logistics',
      mission: 'To streamline D2C checkout experiences through technical modernist transparency.',
      vision: 'A unified standard for friction-free trade.',
      values: ['Design clarity', 'Data integrity', 'Speed optimization'],
      voice: JSON.stringify({
        positioning: "The premium checkout and operations layer for high-volume consumer brands.",
        voiceProfile: {
          tone: "Authoritative, technical, clear, and highly focused on raw numbers.",
          personality: ["Expert", "Reliable", "Sleek", "Performance-centric"],
          vocabulary: ["latency", "friction-free", "throughput", "conversion"],
          avoid: ["disruptive", "empower", "synergy", "game-changer"]
        },
        contentPillars: [
          {
            name: "Performance Benchmarks",
            description: "Deep dive statistics comparing page loading speeds with conversions.",
            contentTypes: ["LinkedIn PDF reports", "Case study blueprints"],
            frequency: "1x weekly"
          },
          {
            name: "Friction Audits",
            description: "Analyses of typical conversion leaks on checkout pages and how to fix them.",
            contentTypes: ["Video breakdowns", "Twitter threads"],
            frequency: "2x weekly"
          }
        ],
        competitorGaps: ["Competitors focus on marketing fluff instead of page latency analytics."],
        growthOpportunities: ["Build custom API performance benchmarks to run on user sites."],
        immediateActions: ["Run speed audits on the top 50 D2C Shopify brands.", "Publish latency vs conversion chart."]
      }),
      tone: 'Highly technical, formal, reserved',
      brand_score: 82,
      logo_url: null,
      website: 'https://pulseretail.co',
      status: 'active',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  personas: [
    {
      id: 'persona-1',
      organization_id: 'mock-org-123',
      brand_id: 'brand-pulse',
      name: 'Stevie, E-comm Operations Director',
      age_range: '30-45',
      demographics: { role: 'VP of Operations', businessSize: '$10M-$50M ARR' },
      pain_points: ['High cart abandonment rates', 'Legacy checkout systems slowing load times'],
      goals: ['Boost checkout conversion by 2%', 'Integrate modern fast payment rails'],
      platforms: ['LinkedIn', 'Twitter'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  clients: [
    {
      id: 'client-acme',
      organization_id: 'mock-org-123',
      name: 'Sarah Jenkins',
      company: 'Acme Global Manufacturing',
      email: 'sjenkins@acmepaper.com',
      phone: '+1-555-0122',
      health_score: 92,
      revenue: 14500.00,
      status: 'active',
      notes: 'Strategic account, completely satisfied. Deliverables consistently submitted ahead of schedule. Expressed minor interest in expansion.',
      assigned_to: 'Godswill Johnson',
      health_details: JSON.stringify({
        communication: 95,
        projectSuccess: 90,
        revenueGrowth: 90,
        satisfaction: 92
      }),
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'client-nova',
      organization_id: 'mock-org-123',
      name: 'David Miller',
      company: 'Nova Freight Systems',
      email: 'd.miller@novafreight.com',
      phone: '+1-555-0178',
      health_score: 45,
      revenue: 9800.00,
      status: 'at_risk',
      notes: 'Communication has slowed significantly over the past 14 days. Feedback delay has increased by 40% on design revisions.',
      assigned_to: 'Godswill Johnson',
      health_details: JSON.stringify({
        communication: 35,
        projectSuccess: 70,
        revenueGrowth: 50,
        satisfaction: 25
      }),
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  recoveryPlans: [
    {
      id: 'plan-nova',
      organization_id: 'mock-org-123',
      client_id: 'client-nova',
      status: 'active',
      risk_score: 55,
      strategy: JSON.stringify([
        "Establish email communication frequency parity",
        "Deliver 3 quick-win social hooks to restore creative alignment",
        "Re-contract deliverables under a performance revenue sharing framework"
      ]),
      outreach_sequence: JSON.stringify([
        {
          subject: "Realigning operations for Nova Freight Systems",
          body: "Hi David,\n\nI noticed our communication has slowed over the past week, and I want to make sure we are fully aligned on the target logistics strategy. We've compiled 3 new creative directions that address the friction points on social conversion.\n\nDo you have 10 minutes for a quick alignment sync tomorrow?\n\nBest,\nGodswill",
          sendDay: 1
        }
      ]),
      actions: JSON.stringify([
        "Draft re-engagement email sequence",
        "Schedule internal creative brief review",
        "Generate performance agreement proposal"
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  campaigns: [
    {
      id: 'camp-latency',
      organization_id: 'mock-org-123',
      brand_id: 'brand-pulse',
      title: 'Q3 Latency Benchmark Launch',
      objective: 'Establish Pulse Retail as the thought leader in e-commerce site performance benchmarks.',
      budget: 5000.00,
      status: 'active',
      start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      channels: ['linkedin', 'twitter'],
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  campaignPosts: [
    {
      id: 'post-1',
      organization_id: 'mock-org-123',
      campaign_id: 'camp-latency',
      platform: 'linkedin',
      content: 'Did you know that a 100ms delay in mobile checkout load times can reduce conversion rates by up to 7%? Here is a breakdown of page load latency benchmarks across the top 50 Shopify sites.',
      scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      published_at: null,
      status: 'scheduled',
      performance: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'post-2',
      organization_id: 'mock-org-123',
      campaign_id: 'camp-latency',
      platform: 'twitter',
      content: 'E-commerce speed matters. We audited 50 top Shopify stores and mapped out exactly where checkout friction occurs. Spoiler: it is mostly image weights and script bloat. Full thread coming tomorrow.',
      scheduled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published',
      performance: { impressions: 1420, engagements: 88 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'post-3',
      organization_id: 'mock-org-123',
      campaign_id: 'camp-latency',
      platform: 'linkedin',
      content: 'Site performance is not just a dev metric; it is a direct driver of revenue. Optimize your checkouts or lose conversions to those who do.',
      scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      published_at: null,
      status: 'scheduled',
      performance: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  teamMembers: [
    {
      id: 'user-godswill',
      organization_id: 'mock-org-123',
      email: 'gjohnson@brandavox.co',
      full_name: 'Godswill Johnson',
      role: 'owner',
      avatar_url: null,
      status: 'online',
      created_at: new Date().toISOString()
    },
    {
      id: 'user-elena',
      organization_id: 'mock-org-123',
      email: 'erostova@brandavox.co',
      full_name: 'Elena Rostova',
      role: 'manager',
      avatar_url: null,
      status: 'online',
      created_at: new Date().toISOString()
    },
    {
      id: 'user-marcus',
      organization_id: 'mock-org-123',
      email: 'maurelius@brandavox.co',
      full_name: 'Marcus Aurelius',
      role: 'member',
      avatar_url: null,
      status: 'away',
      created_at: new Date().toISOString()
    },
    {
      id: 'user-sarah',
      organization_id: 'mock-org-123',
      email: 'sjenkins@acmepaper.com',
      role: 'client',
      full_name: 'Sarah Jenkins',
      avatar_url: null,
      status: 'offline',
      created_at: new Date().toISOString()
    }
  ],
  messages: [
    {
      id: 'msg-1',
      organization_id: 'mock-org-123',
      sender_id: 'user-marcus',
      sender_name: 'Marcus Aurelius',
      sender_role: 'member',
      recipient_id: null,
      content: 'Hey team, did you review the latest latency benchmarks for Pulse Retail? Checkout page speed is looking stellar.',
      file_attachments: [],
      channel_id: 'general',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'msg-2',
      organization_id: 'mock-org-123',
      sender_id: 'user-elena',
      sender_name: 'Elena Rostova',
      sender_role: 'manager',
      recipient_id: null,
      content: 'I saw that! Visuals for the campaign are also ready. I will drop the visual storyboard draft in `#creative-studio` shortly.',
      file_attachments: [],
      channel_id: 'general',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'msg-3',
      organization_id: 'mock-org-123',
      sender_id: 'user-godswill',
      sender_name: 'Godswill Johnson',
      sender_role: 'owner',
      recipient_id: null,
      content: 'Stellar work team. Let us review the storyboard and export the calendar deliverables.',
      file_attachments: [],
      channel_id: 'general',
      created_at: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      id: 'msg-4',
      organization_id: 'mock-org-123',
      sender_id: 'user-elena',
      sender_name: 'Elena Rostova',
      sender_role: 'manager',
      recipient_id: null,
      content: 'Draft scene flow is compiled. Check the attached files.',
      file_attachments: [
        { name: 'pulse_checkout_storyboard.pdf', size: '1.2MB', url: '#' }
      ],
      channel_id: 'creative-studio',
      created_at: new Date(Date.now() - 3600000 * 0.5).toISOString()
    }
  ],
  apiKeys: [
    {
      id: 'key-1',
      organization_id: 'mock-org-123',
      name: 'Production Sync Integration',
      hashed_key: 'mock_hash_live_4f3c_xyz',
      key_prefix: 'bv_live_4f3c',
      last_used_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      scopes: ['read:brands', 'read:clients', 'write:posts'],
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
    }
  ],
  webhooks: [
    {
      id: 'web-1',
      organization_id: 'mock-org-123',
      url: 'https://api.acme.co/webhooks/brandavox',
      events: ['campaign.published', 'client.at_risk'],
      status: 'active',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  webhookLogs: [
    {
      id: 'log-1',
      webhook_id: 'web-1',
      event_type: 'campaign.published',
      status_code: 200,
      latency_ms: 240,
      payload: JSON.stringify({
        event: 'campaign.published',
        campaign_id: 'camp-latency',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      }, null, 2),
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'log-2',
      webhook_id: 'web-1',
      event_type: 'client.at_risk',
      status_code: 200,
      latency_ms: 185,
      payload: JSON.stringify({
        event: 'client.at_risk',
        client_id: 'client-nova',
        risk_score: 55,
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      }, null, 2),
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ]
};

export function readMockDb(): MockDataPayload {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    
    // Ensure backwards compatibility for files created before this change
    if (!parsed.clients) parsed.clients = defaultData.clients;
    if (!parsed.recoveryPlans) parsed.recoveryPlans = defaultData.recoveryPlans;
    if (!parsed.campaigns) parsed.campaigns = defaultData.campaigns;
    if (!parsed.campaignPosts) parsed.campaignPosts = defaultData.campaignPosts;
    if (!parsed.teamMembers) parsed.teamMembers = defaultData.teamMembers;
    if (!parsed.messages) parsed.messages = defaultData.messages;
    if (!parsed.apiKeys) parsed.apiKeys = defaultData.apiKeys;
    if (!parsed.webhooks) parsed.webhooks = defaultData.webhooks;
    if (!parsed.webhookLogs) parsed.webhookLogs = defaultData.webhookLogs;
    if (!parsed.securityStats) parsed.securityStats = defaultData.securityStats;
    if (!parsed.emailMarketingConfig) parsed.emailMarketingConfig = defaultData.emailMarketingConfig;
    
    return parsed;
  } catch (err) {
    console.error('Error reading mock DB file:', err);
    return defaultData;
  }
}

export function writeMockDb(data: MockDataPayload): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing mock DB file:', err);
  }
}
