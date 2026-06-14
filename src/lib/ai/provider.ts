// AI Provider Abstraction Layer
// Location: src/lib/ai/provider.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

export interface ProviderResponse {
  content: string;
  tokensUsed: number;
}

export interface AIProvider {
  generate(systemPrompt: string, userPrompt: string): Promise<ProviderResponse>;
}

// 1. GEMINI PROVIDER IMPLEMENTATION (gemini-2.0-flash)
export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<ProviderResponse> {
    try {
      // Create client using the official Google Gen AI SDK
      const ai = new GoogleGenerativeAI(this.apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Input:\n${userPrompt}` }] }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const response = await result.response;
      const content = response.text();
      
      // Extract tokens from metadata
      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

      return {
        content: content || '{}',
        tokensUsed,
      };
    } catch (err: any) {
      throw new Error(`Gemini Provider generation error: ${err.message}`);
    }
  }
}

// 2. OPENAI PROVIDER IMPLEMENTATION (gpt-4o-mini fallback)
export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<ProviderResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content || '{}';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        content,
        tokensUsed,
      };
    } catch (err: any) {
      throw new Error(`OpenAI Provider generation error: ${err.message}`);
    }
  }
}

// 3. MOCK PROVIDER FOR LOCAL DEVELOPMENT (Bypasses active credential checks)
export class MockAIProvider implements AIProvider {
  async generate(systemPrompt: string, userPrompt: string): Promise<ProviderResponse> {
    // Determine the agent type from the system prompt keywords
    let content = '{}';
    
    if (systemPrompt.includes('Brand Intelligence Agent')) {
      content = JSON.stringify({
        brandScore: 84,
        scoreBreakdown: { clarity: 21, differentiation: 22, resonance: 20, consistency: 21 },
        positioning: "The premium digital operating standard for scaling direct-to-consumer lifestyle brands.",
        voiceProfile: {
          tone: "Authoritative, precise, minimalist, and highly confident.",
          personality: ["Expert", "Sleek", "Swiss-Modernist", "Data-driven"],
          vocabulary: ["leveraged", "optimization", "precision", "intelligence"],
          avoid: ["lorem ipsum", "disruptive", "synergistic", "game-changing"]
        },
        personas: [
          {
            name: "Eco-Conscious Millennial Founder",
            role: "Founder & Creative Director",
            ageRange: "28-40",
            painPoints: ["Scaling digital presence without diluting brand value", "High acquisition costs on paid social"],
            goals: ["Build organic community", "Increase repeat customer rates"],
            platforms: ["Instagram", "Pinterest", "LinkedIn"],
            messagingAngle: "Direct focus on raw supply-chain transparency and modernist design aesthetics."
          }
        ],
        contentPillars: [
          {
            name: "Process Integrity",
            description: "Deep dives into how the products are designed and sourced.",
            contentTypes: ["Video reels", "Carousel blueprints"],
            frequency: "2x weekly"
          }
        ],
        competitorGaps: ["Lack of clear aesthetic consistency in active competitor ads."],
        growthOpportunities: ["Build custom community email channels around design stories."],
        immediateActions: ["Audit current Instagram grid for typographic consistency.", "Publish first supply chain thread."]
      });
    } else if (systemPrompt.includes('Copywriting Specialist Agent')) {
      content = JSON.stringify({
        headline: "Aesthetic Precision Meets Performance.",
        primaryCopy: "Stop chasing algorithms. Start building brand memory. Brandavox is the command center designed for modern digital agencies to streamline strategies, creative assets, and client metrics under a single Swiss Modernist dashboard interface.",
        cta: "Request Workspace Access",
        variations: [
          {
            headline: "Your Agency, Structured.",
            primaryCopy: "Combine brand intelligence, content planning, and CRM metrics. Build a secure, multi-tenant home for client campaign management.",
            cta: "Initialize Command Center"
          }
        ],
        hashtags: ["AgencyLife", "SwissDesign", "AICreative", "BrandIntelligence"],
        optimizationNotes: "Copy is formatted using short, punchy paragraphs. Leverages authority-driven hooks to filter out casual seekers."
      });
    } else if (systemPrompt.includes('Content Strategy Planner Agent')) {
      content = JSON.stringify({
        calendar: [
          {
            date: "Day 1",
            platform: "linkedin",
            concept: "Why agency workspaces fail without organizational memory",
            caption: "Most agencies bleed client intelligence. When team members leave, campaign history leaves with them. Here is how we build a central operational brain...",
            hashtags: ["AgencyOperations", "FutureOfWork"],
            hook: "Your agency is leaking intelligence.",
            contentType: "text"
          },
          {
            date: "Day 3",
            platform: "instagram",
            concept: "Swiss modernist agency layout concept reveal",
            caption: "Design is not just decoration. It is structural clarity. Sneak peek into the Brandavox UI command shell layout...",
            hashtags: ["MinimalistDesign", "UIUX"],
            hook: "Bloomberg Terminal meets Linear.",
            contentType: "carousel"
          }
        ],
        engagementHooks: ["Ask founders to share their single biggest operational leakage.", "Poll on dark vs light mode design defaults."],
        strategyNotes: "Ensure high visual contrast on Instagram slides. Cross-post LinkedIn text highlights to personal handles."
      });
    } else if (systemPrompt.includes('Creative Video Director Agent')) {
      content = JSON.stringify({
        hook: "Show a Bloomberg Terminal screenshot, then cut instantly to a sleek, dark code dashboard.",
        scenes: [
          {
            sceneNumber: 1,
            visual: "Hands typing code on a mechanical keyboard. High contrast lighting.",
            voiceover: "They told you to use another generic SaaS. So we built this instead.",
            duration: 5,
            cameraAngle: "Extreme close-up macro lens",
            editingNote: "Fast cut, whip pan transition"
          }
        ],
        music: "Subtle, ambient industrial synth beat",
        editingDirections: "Fast, rhythmic editing tempo. Keep colors desaturated with warm orange highlights.",
        cta: "Click the link to initialize your workspace today."
      });
    } else if (systemPrompt.includes('Lead CRM Analyst Agent')) {
      content = JSON.stringify({
        healthScore: 68,
        riskLevel: "medium",
        churnProbability: 0.35,
        healthFactors: {
          communication: 55,
          projectSuccess: 80,
          revenueGrowth: 75,
          satisfaction: 62
        },
        insights: ["Client response times have slowed by 40% over the last 30 days.", "Project deliverables are 100% on schedule, but client reviews are delayed."],
        recommendations: ["Initiate a sync call to align on review cycles.", "Present upcoming expansion strategy to re-engage director."],
        upsellOpportunities: [
          {
            service: "AI Content Automation Engine",
            rationale: "Client has expressed pain points around post writing speed.",
            estimatedValue: 1200.00
          }
        ],
        immediateActions: ["Schedule account review sequence.", "Send turnaround survey link."]
      });
    } else if (systemPrompt.includes('Client Recovery & Win-Back Agent')) {
      content = JSON.stringify({
        recoveryPlan: ["Establish communication parity", "Deliver quick-win design assets", "Re-contract under performance deliverables"],
        emailSequence: [
          {
            subject: "Realigning our strategy for Pulse Retail",
            body: "Hi Team,\n\nI noticed our communication has slowed, and I want to ensure we are fully aligned on the creative strategy for this quarter. We've drafted 3 new visual direction hooks that address your paid social acquisition challenges.\n\nLet's do a quick 10-minute sync tomorrow.",
            sendDay: 1
          }
        ],
        priorityActions: ["Draft email win-back template.", "Prepare custom video campaign draft."],
        timeline: "14-day recovery track"
      });
    }

    return {
      content,
      tokensUsed: 1250, // mock count
    };
  }
}

// 4. PROVIDER SELECTOR UTILITY
export function getAIProvider(): AIProvider {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Verify if they are placeholders or missing
  const isValid = (key: string | undefined) => {
    return key && key.trim() !== '' && !key.includes('your-');
  };

  if (isValid(geminiKey)) {
    return new GeminiProvider(geminiKey!);
  } else if (isValid(openaiKey)) {
    return new OpenAIProvider(openaiKey!);
  }

  // Fallback to Mock Provider for local development
  return new MockAIProvider();
}
