// Brandavox Memory Engine
// Location: src/lib/ai/memoryEngine.ts

import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { AgentMemory, AgentType } from '@/types/ai.types';
import { getAIProvider } from './provider';

interface RetrieveParams {
  organizationId: string;
  agent: AgentType;
  brandId?: string;
  clientId?: string;
  limit?: number;
}

interface StoreParams {
  organizationId: string;
  agent: AgentType;
  memoryType: string;
  content: Record<string, any>;
  importanceScore?: number;
  brandId?: string;
  clientId?: string;
  ttlDays?: number;
}

interface ExtractParams {
  organizationId: string;
  agent: AgentType;
  generationOutput: Record<string, any>;
  brandId?: string;
  clientId?: string;
}

// Check if Supabase env vars are active placeholders
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

// 1. RETRIEVE MEMORIES
export async function retrieveMemories({
  organizationId,
  agent,
  brandId,
  clientId,
  limit = 5,
}: RetrieveParams): Promise<AgentMemory[]> {
  if (!isSupabaseConfigured()) {
    return getMockMemories(agent, brandId, clientId).slice(0, limit);
  }

  try {
    // Use service role client to retrieve organizational memory securely
    const supabase = createServiceClient();
    
    let query = supabase
      .from('agent_memories')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('agent', agent)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query
      .order('importance_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data as AgentMemory[]) || [];
  } catch (err) {
    console.warn('Memory Engine retrieval error, falling back to mock memories:', err);
    return getMockMemories(agent, brandId, clientId).slice(0, limit);
  }
}

// 2. STORE MEMORIES
export async function storeMemory({
  organizationId,
  agent,
  memoryType,
  content,
  importanceScore = 5,
  brandId,
  clientId,
  ttlDays,
}: StoreParams): Promise<boolean> {
  const expiresAt = ttlDays
    ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  if (!isSupabaseConfigured()) {
    console.log(`[Mock Memory Store] Agent: ${agent} | Type: ${memoryType} | Importance: ${importanceScore}`);
    console.log('Content:', content);
    return true;
  }

  try {
    const supabase = createServiceClient();

    const { error } = await supabase.from('agent_memories').insert({
      organization_id: organizationId,
      agent,
      memory_type: memoryType,
      importance_score: importanceScore,
      content,
      brand_id: brandId,
      client_id: clientId,
      expires_at: expiresAt,
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Memory Engine store error:', err);
    return false;
  }
}

// 3. BUILD TEXT-BASED MEMORY CONTEXT FOR PROMPTS
export function buildMemoryContext(memories: AgentMemory[]): string {
  if (memories.length === 0) {
    return 'No relevant historical learnings found.';
  }

  // Group by memory_type
  const grouped: Record<string, string[]> = {};
  memories.forEach((mem) => {
    const type = mem.memory_type.replace(/_/g, ' ').toUpperCase();
    if (!grouped[type]) {
      grouped[type] = [];
    }
    
    // Convert memory content record to readable strings
    const contentStrings = Object.entries(mem.content).map(([key, val]) => {
      const formattedKey = key.replace(/_/g, ' ');
      return `- ${formattedKey}: ${val}`;
    });
    
    grouped[type].push(...contentStrings);
  });

  // Build context string block
  return Object.entries(grouped)
    .map(([type, lines]) => `[${type} MEMORIES]\n${lines.join('\n')}`)
    .join('\n\n');
}

// 4. EXTRACT AND STORE NEW STRATEGIC MEMORIES
export async function extractAndStoreMemories({
  organizationId,
  agent,
  generationOutput,
  brandId,
  clientId,
}: ExtractParams): Promise<void> {
  try {
    const provider = getAIProvider();

    const systemPrompt = `You are a meta-learning extraction agent for the Brandavox OS. Your role is to analyze the generated strategy output of a '${agent}' agent and extract exactly 2-3 high-level strategic insights or lessons that should be saved to the agency's organizational memory.

These memories will guide future runs. We want to extract what worked, formatting constraints, tone adjustments, or specific client recommendations.

Always return ONLY a valid JSON array matching the schema below. Do not include markdown codeblocks, backticks, or preamble.

=== JSON RESPONSE SCHEMA ===
[
  {
    "memoryType": "string (e.g. voice_profile_adjustment, content_performance, client_preference)",
    "content": {
      "insight": "string (the lesson learned or strategy note)",
      "impact": "string (the strategic impact of this lesson)"
    },
    "importanceScore": number (1-10 rating, 10 being critical)
  }
]
=======================`;

    const userPrompt = `Generation Output to analyze:\n${JSON.stringify(generationOutput, null, 2)}`;

    const { content } = await provider.generate(systemPrompt, userPrompt);
    
    // Parse the JSON array
    const memoriesToStore = JSON.parse(content.trim());

    if (Array.isArray(memoriesToStore)) {
      for (const mem of memoriesToStore) {
        await storeMemory({
          organizationId,
          agent,
          memoryType: mem.memoryType,
          content: mem.content,
          importanceScore: mem.importanceScore,
          brandId,
          clientId,
        });
      }
    }
  } catch (err) {
    console.error('Failed to extract and store memories:', err);
  }
}

// --- MOCK DATABASE FALLBACK DATA ---
function getMockMemories(agent: AgentType, brandId?: string, clientId?: string): AgentMemory[] {
  const defaultOrgId = 'mock-org-123';
  const defaultCreatedAt = new Date().toISOString();

  const mockData: Record<AgentType, AgentMemory[]> = {
    brand: [
      {
        organization_id: defaultOrgId,
        agent: 'brand',
        memory_type: 'positioning_preference',
        importance_score: 8,
        content: {
          insight: 'Founder prefers structural Swiss Modernist positioning over SaaS startup tropes.',
          impact: 'Avoid using words like "disruptive", "synergistic", or "ecosystem".'
        },
        created_at: defaultCreatedAt
      },
      {
        organization_id: defaultOrgId,
        agent: 'brand',
        memory_type: 'audience_demographic',
        importance_score: 7,
        content: {
          insight: 'Core target persona has high aesthetic standards and values supply transparency.',
          impact: 'Structure messaging copy around design blue-prints and supply audits.'
        },
        created_at: defaultCreatedAt
      }
    ],
    copy: [
      {
        organization_id: defaultOrgId,
        agent: 'copy',
        memory_type: 'copy_performance',
        importance_score: 9,
        content: {
          insight: 'LinkedIn posts structured with double-line spacing and data hooks outperform by 3x.',
          impact: 'Mandate spacing format and open with statistical metrics.'
        },
        created_at: defaultCreatedAt
      }
    ],
    content: [
      {
        organization_id: defaultOrgId,
        agent: 'content',
        memory_type: 'platform_scheduling',
        importance_score: 7,
        content: {
          insight: 'Instagram carousel posts published on Tuesdays at 2:00 PM see 40% higher saves.',
          impact: 'Prioritize design-heavy assets on mid-week calendars.'
        },
        created_at: defaultCreatedAt
      }
    ],
    video: [
      {
        organization_id: defaultOrgId,
        agent: 'video',
        memory_type: 'visual_style',
        importance_score: 8,
        content: {
          insight: 'Whip-pan cuts and desaturated color grading yield 20% higher completion rates on Reels.',
          impact: 'Inject fast camera angles and ambient sound notes into video editing specs.'
        },
        created_at: defaultCreatedAt
      }
    ],
    crm: [
      {
        organization_id: defaultOrgId,
        agent: 'crm',
        memory_type: 'client_risk_warning',
        importance_score: 9,
        content: {
          insight: 'Client contact slowing past 14 days is a high predictor of upcoming churn.',
          impact: 'Flag account as Amber risk status immediately if communication cycles drop.'
        },
        created_at: defaultCreatedAt
      }
    ],
    recovery: [
      {
        organization_id: defaultOrgId,
        agent: 'recovery',
        memory_type: 'win_back_outcome',
        importance_score: 8,
        content: {
          insight: 'Turnaround emails offering 3 quick-win creative assets see a 70% reply rate.',
          impact: 'Include ready-to-run marketing hook drafts in outreach sequence day 1.'
        },
        created_at: defaultCreatedAt
      }
    ]
  };

  return mockData[agent] || [];
}
