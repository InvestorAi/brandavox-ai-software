// Brandavox Central Agent Router
// Location: src/lib/ai/agentRouter.ts

import { z } from 'zod';
import { AgentResponse, AgentType } from '@/types/ai.types';
import { getAIProvider, GeminiProvider, OpenAIProvider } from './provider';
import { retrieveMemories, buildMemoryContext, extractAndStoreMemories } from './memoryEngine';
import { createServiceClient } from '@/lib/supabase/service';

// Import prompt builders
import brandPrompt from './prompts/brand';
import copyPrompt from './prompts/copy';
import contentPrompt from './prompts/content';
import videoPrompt from './prompts/video';
import crmPrompt from './prompts/crm';
import recoveryPrompt from './prompts/recovery';

const promptBuilders: Record<AgentType, (memoryContext: string) => string> = {
  brand: brandPrompt,
  copy: copyPrompt,
  content: contentPrompt,
  video: videoPrompt,
  crm: crmPrompt,
  recovery: recoveryPrompt,
};

// ==========================================
// ZOD SCHEMAS FOR AGENT OUTPUT VALIDATION
// ==========================================

export const brandAgentSchema = z.object({
  brandScore: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    clarity: z.number().min(0).max(25),
    differentiation: z.number().min(0).max(25),
    resonance: z.number().min(0).max(25),
    consistency: z.number().min(0).max(25),
  }),
  positioning: z.string(),
  voiceProfile: z.object({
    tone: z.string(),
    personality: z.array(z.string()),
    vocabulary: z.array(z.string()),
    avoid: z.array(z.string()),
  }),
  personas: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      ageRange: z.string(),
      painPoints: z.array(z.string()),
      goals: z.array(z.string()),
      platforms: z.array(z.string()),
      messagingAngle: z.string(),
    })
  ),
  contentPillars: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      contentTypes: z.array(z.string()),
      frequency: z.string(),
    })
  ),
  competitorGaps: z.array(z.string()),
  growthOpportunities: z.array(z.string()),
  immediateActions: z.array(z.string()),
});

export const copyAgentSchema = z.object({
  headline: z.string(),
  primaryCopy: z.string(),
  cta: z.string(),
  variations: z.array(
    z.object({
      headline: z.string(),
      primaryCopy: z.string(),
      cta: z.string(),
    })
  ),
  hashtags: z.array(z.string()),
  optimizationNotes: z.string(),
});

export const contentAgentSchema = z.object({
  calendar: z.array(
    z.object({
      date: z.string(),
      platform: z.string(),
      concept: z.string(),
      caption: z.string(),
      hashtags: z.array(z.string()),
      hook: z.string(),
      contentType: z.string(),
    })
  ),
  engagementHooks: z.array(z.string()),
  strategyNotes: z.string(),
});

export const videoAgentSchema = z.object({
  hook: z.string(),
  scenes: z.array(
    z.object({
      sceneNumber: z.number(),
      visual: z.string(),
      voiceover: z.string(),
      duration: z.number(),
      cameraAngle: z.string(),
      editingNote: z.string(),
    })
  ),
  music: z.string(),
  editingDirections: z.string(),
  cta: z.string(),
});

export const crmAgentSchema = z.object({
  healthScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  churnProbability: z.number().min(0).max(1),
  healthFactors: z.object({
    communication: z.number().min(0).max(100),
    projectSuccess: z.number().min(0).max(100),
    revenueGrowth: z.number().min(0).max(100),
    satisfaction: z.number().min(0).max(100),
  }),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  upsellOpportunities: z.array(
    z.object({
      service: z.string(),
      rationale: z.string(),
      estimatedValue: z.number(),
    })
  ),
  immediateActions: z.array(z.string()),
});

export const recoveryAgentSchema = z.object({
  recoveryPlan: z.array(z.string()),
  emailSequence: z.array(
    z.object({
      subject: z.string(),
      body: z.string(),
      sendDay: z.number(),
    })
  ),
  priorityActions: z.array(z.string()),
  timeline: z.string(),
});

const agentSchemas: Record<AgentType, z.ZodSchema<any>> = {
  brand: brandAgentSchema,
  copy: copyAgentSchema,
  content: contentAgentSchema,
  video: videoAgentSchema,
  crm: crmAgentSchema,
  recovery: recoveryAgentSchema,
};

// Helper to strip markdown code fences from LLM responses if any
function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    // Strip leading code block syntax
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '');
    // Strip trailing code block syntax
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

interface RunAgentParams {
  organizationId: string;
  userId?: string;
  agent: AgentType;
  brandId?: string;
  clientId?: string;
  userInput: any;
}

export async function runAgent<T>({
  organizationId,
  userId,
  agent,
  brandId,
  clientId,
  userInput,
}: RunAgentParams): Promise<AgentResponse<T>> {
  const startTime = Date.now();

  try {
    // 1. Retrieve historical organizational learnings for context
    const memories = await retrieveMemories({
      organizationId,
      agent,
      brandId,
      clientId,
    });

    const memoryContext = buildMemoryContext(memories);

    // 2. Fetch specific agent prompt template & build system prompt
    const promptBuilder = promptBuilders[agent];
    if (!promptBuilder) {
      throw new Error(`Unsupported agent type: '${agent}'`);
    }

    const systemPrompt = promptBuilder(memoryContext);

    // 3. Prepare user input variables
    const userPrompt = typeof userInput === 'string'
      ? userInput
      : JSON.stringify(userInput, null, 2);

    // 4. Resolve AI Provider (Gemini Flash primary, OpenAI fallback, Mock local development fallback)
    const provider = getAIProvider();
    
    let modelName = 'mock-provider';
    if (provider instanceof GeminiProvider) {
      modelName = 'gemini-2.0-flash';
    } else if (provider instanceof OpenAIProvider) {
      modelName = 'gpt-4o-mini';
    }

    // 5. Execute generation
    const { content, tokensUsed } = await provider.generate(systemPrompt, userPrompt);
    const durationMs = Date.now() - startTime;

    // 6. Clean and parse JSON response
    let parsedData: any;
    try {
      const cleaned = cleanJsonResponse(content);
      parsedData = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error(`JSON parse failure for agent '${agent}':`, parseErr.message);
      console.debug('Raw generation output was:', content);
      return {
        success: false,
        data: null,
        error: `Invalid JSON returned by AI provider: ${parseErr.message}`,
        meta: {
          tokensUsed,
          model: modelName,
          generationTimeMs: durationMs,
        },
      };
    }

    // 7. Validate output against formal schemas
    const schema = agentSchemas[agent];
    if (schema) {
      const validationResult = schema.safeParse(parsedData);
      if (!validationResult.success) {
        console.warn(`Schema validation failure for agent '${agent}':`, validationResult.error.message);
        return {
          success: false,
          data: null,
          error: `Output validation failed: ${validationResult.error.message}`,
          meta: {
            tokensUsed,
            model: modelName,
            generationTimeMs: durationMs,
          },
        };
      }
      parsedData = validationResult.data;
    }

    // 8. Log generation telemetry to database if Supabase is initialized
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServiceClient();
        const { error } = await supabase.from('ai_generations').insert({
          organization_id: organizationId,
          user_id: userId || null,
          agent,
          prompt: userPrompt,
          response: parsedData,
          tokens_used: tokensUsed,
          generation_time_ms: durationMs,
          model: modelName,
        });

        if (error) throw error;
      } catch (dbErr) {
        console.error('Failed to log AI generation metrics to database:', dbErr);
      }
    }

    // 9. Execute background meta-learning memory extraction (awaited for serverless safety)
    await extractAndStoreMemories({
      organizationId,
      agent,
      generationOutput: parsedData,
      brandId,
      clientId,
    });

    return {
      success: true,
      data: parsedData as T,
      error: null,
      meta: {
        tokensUsed,
        model: modelName,
        generationTimeMs: durationMs,
      },
    };

  } catch (err: any) {
    console.error(`Agent execution failed for type '${agent}':`, err);
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      data: null,
      error: err.message || 'Unknown internal agent execution error',
      meta: {
        tokensUsed: 0,
        model: 'failed',
        generationTimeMs: durationMs,
      },
    };
  }
}
