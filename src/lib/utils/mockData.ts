// Brandavox High-Fidelity Dashboard Mock Data Generator
// Location: src/lib/utils/mockData.ts

export interface ActivityDataPoint {
  date: string;
  generations: number;
  campaigns: number;
  revenue: number;
}

export interface ClientHealthDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface MockAIGeneration {
  id: string;
  agent: 'brand' | 'copy' | 'content' | 'video' | 'crm' | 'recovery';
  prompt: string;
  tokensUsed: number;
  model: string;
  timestamp: string;
}

export interface MockTask {
  id: string;
  title: string;
  client: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  dueDate: string;
}

export interface MockActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timeAgo: string;
  category: 'campaign' | 'brand' | 'ai' | 'client';
}

// 1. KPI Cards data
export const kpiData = {
  revenue: {
    value: '$48,250.00',
    trend: { value: '12.4%', isPositive: true },
  },
  clients: {
    value: '38',
    trend: { value: '4.8%', isPositive: true },
  },
  campaigns: {
    value: '142',
    trend: { value: '8.2%', isPositive: true },
  },
  generations: {
    value: '1,240',
    trend: { value: '34.1%', isPositive: true },
  },
};

// 2. Activity Chart data (last 30 days)
export const generateActivityData = (): ActivityDataPoint[] => {
  const data: ActivityDataPoint[] = [];
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - 30);

  for (let i = 0; i <= 30; i++) {
    const d = new Date(startDay);
    d.setDate(d.getDate() + i);
    const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Add sinusoidal pseudo-random data
    const progress = i / 30;
    const baseGenerations = Math.floor(20 + Math.sin(progress * Math.PI * 4) * 15 + Math.random() * 10);
    const baseCampaigns = Math.floor(3 + Math.sin(progress * Math.PI * 2) * 2 + Math.random() * 2);
    const baseRevenue = Math.floor(1200 + Math.sin(progress * Math.PI * 3) * 300 + Math.random() * 200);

    data.push({
      date: dateString,
      generations: baseGenerations,
      campaigns: baseCampaigns,
      revenue: baseRevenue,
    });
  }
  return data;
};

// 3. Client Health donut chart data
export const clientHealthData: ClientHealthDataPoint[] = [
  { name: 'Healthy (>=75)', value: 28, color: '#10b981' },   // Emerald-500
  { name: 'At Risk (50-74)', value: 7, color: '#f59e0b' },    // Amber-500
  { name: 'Critical (<50)', value: 3, color: '#ef4444' },     // Red-500
];

// 4. Recent AI generations table data
export const recentGenerations: MockAIGeneration[] = [
  {
    id: 'gen-883a',
    agent: 'copy',
    prompt: 'Write a value-prop LinkedIn hook for Brandavox CRM.',
    tokensUsed: 1420,
    model: 'gemini-2.0-flash',
    timestamp: '12 minutes ago',
  },
  {
    id: 'gen-127b',
    agent: 'brand',
    prompt: 'Analyze competitor gap profiles for agency workspace.',
    tokensUsed: 8940,
    model: 'gemini-2.0-flash',
    timestamp: '45 minutes ago',
  },
  {
    id: 'gen-994c',
    agent: 'video',
    prompt: 'Generate scene script for TikTok SaaS onboarding video.',
    tokensUsed: 4320,
    model: 'gemini-2.0-flash',
    timestamp: '2 hours ago',
  },
  {
    id: 'gen-004d',
    agent: 'recovery',
    prompt: 'Generate email sequence sequence for at-risk client.',
    tokensUsed: 3200,
    model: 'gpt-4o-mini',
    timestamp: '5 hours ago',
  },
  {
    id: 'gen-551e',
    agent: 'content',
    prompt: 'Plan 7-day multi-channel calendar roadmap for retail brand.',
    tokensUsed: 12500,
    model: 'gemini-2.0-flash',
    timestamp: '1 day ago',
  },
];

// 5. Tasks Due list data
export const dueTasks: MockTask[] = [
  {
    id: 'task-102',
    title: 'Generate pitch script for client meeting',
    client: 'Acme Corp',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: 'Today, 5:00 PM',
  },
  {
    id: 'task-203',
    title: 'Review brand scores report with director',
    client: 'Starlight Tech',
    priority: 'high',
    status: 'todo',
    dueDate: 'Tomorrow, 10:00 AM',
  },
  {
    id: 'task-405',
    title: 'Publish Instagram campaign posts sequence',
    client: 'Pulse Retail',
    priority: 'medium',
    status: 'todo',
    dueDate: 'Jun 14, 2:00 PM',
  },
  {
    id: 'task-506',
    title: 'Review CRM health diagnostics report',
    client: 'Zeta Global',
    priority: 'high',
    status: 'review',
    dueDate: 'Jun 15, 11:30 AM',
  },
  {
    id: 'task-772',
    title: 'Set up autoresponder forms integration',
    client: 'Nova Logistics',
    priority: 'low',
    status: 'done',
    dueDate: 'Completed yesterday',
  },
];

// 6. Activity Logs list data
export const activityLogs: MockActivityLog[] = [
  {
    id: 'log-1',
    user: 'Godswill Johnson',
    action: 'created brand profile',
    target: 'Pulse Retail',
    timeAgo: '4 mins ago',
    category: 'brand',
  },
  {
    id: 'log-2',
    user: 'System Agent',
    action: 'flagged client at risk',
    target: 'Nova Logistics',
    timeAgo: '15 mins ago',
    category: 'client',
  },
  {
    id: 'log-3',
    user: 'AI Content Assistant',
    action: 'generated calendar assets',
    target: 'Pulse Launch Campaign',
    timeAgo: '42 mins ago',
    category: 'ai',
  },
  {
    id: 'log-4',
    user: 'Manager Sarah',
    action: 'scheduled calendar posts',
    target: 'Twitter, LinkedIn',
    timeAgo: '2 hours ago',
    category: 'campaign',
  },
  {
    id: 'log-5',
    user: 'Godswill Johnson',
    action: 'linked client contact email',
    target: 'Nova Logistics',
    timeAgo: '3 hours ago',
    category: 'client',
  },
];
