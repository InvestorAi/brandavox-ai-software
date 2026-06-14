// Brandavox AI Types Specification
// Location: src/types/ai.types.ts

export type AgentType = 'brand' | 'copy' | 'content' | 'video' | 'crm' | 'recovery';

export interface AgentResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: {
    tokensUsed: number;
    model: string;
    generationTimeMs: number;
  };
}

export interface AgentMemory {
  id?: string;
  organization_id: string;
  agent: AgentType;
  memory_type: string;
  importance_score: number;
  content: Record<string, any>;
  brand_id?: string;
  client_id?: string;
  expires_at?: string;
  created_at?: string;
}

// 1. Brand Agent Schema
export interface BrandAgentOutput {
  brandScore: number; // 0-100
  scoreBreakdown: {
    clarity: number; // 0-25
    differentiation: number; // 0-25
    resonance: number; // 0-25
    consistency: number; // 0-25
  };
  positioning: string;
  voiceProfile: {
    tone: string;
    personality: string[];
    vocabulary: string[];
    avoid: string[];
  };
  personas: {
    name: string;
    role: string;
    ageRange: string;
    painPoints: string[];
    goals: string[];
    platforms: string[];
    messagingAngle: string;
  }[];
  contentPillars: {
    name: string;
    description: string;
    contentTypes: string[];
    frequency: string;
  }[];
  competitorGaps: string[];
  growthOpportunities: string[];
  immediateActions: string[];
}

// 2. Copy Agent Schema
export interface CopyAgentOutput {
  headline: string;
  primaryCopy: string;
  cta: string;
  variations: {
    headline: string;
    primaryCopy: string;
    cta: string;
  }[];
  hashtags: string[];
  optimizationNotes: string;
}

// 3. Content Agent Schema
export interface ContentAgentOutput {
  calendar: {
    date: string;
    platform: string;
    concept: string;
    caption: string;
    hashtags: string[];
    hook: string;
    contentType: string;
  }[];
  engagementHooks: string[];
  strategyNotes: string;
}

// 4. Video Agent Schema
export interface VideoAgentOutput {
  hook: string;
  scenes: {
    sceneNumber: number;
    visual: string;
    voiceover: string;
    duration: number; // in seconds
    cameraAngle: string;
    editingNote: string;
  }[];
  music: string;
  editingDirections: string;
  cta: string;
}

// 5. CRM Agent Schema
export interface CRMAgentOutput {
  healthScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  churnProbability: number; // 0.0 - 1.0
  healthFactors: {
    communication: number; // 0-100
    projectSuccess: number; // 0-100
    revenueGrowth: number; // 0-100
    satisfaction: number; // 0-100
  };
  insights: string[];
  recommendations: string[];
  upsellOpportunities: {
    service: string;
    rationale: string;
    estimatedValue: number;
  }[];
  immediateActions: string[];
}

// 6. Recovery Agent Schema
export interface RecoveryAgentOutput {
  recoveryPlan: string[];
  emailSequence: {
    subject: string;
    body: string;
    sendDay: number;
  }[];
  priorityActions: string[];
  timeline: string;
}
