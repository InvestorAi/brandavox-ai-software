// Brandavox API Route - Video Scriptwriter Agent
// Location: src/app/api/agents/video/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAgent } from '@/lib/ai/agentRouter';
import { readMockDb } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, concept, duration, platform, style } = body;

    if (!brandId) {
      return NextResponse.json(
        { success: false, data: null, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    if (!concept) {
      return NextResponse.json(
        { success: false, data: null, error: 'Video concept/idea is required' },
        { status: 400 }
      );
    }

    let brandName = '';
    let brandIndustry = '';
    let brandVoice: any = null;
    let organizationId = 'mock-org-123';

    // 1. Fetch Brand Context
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const brand = db.brands.find((b) => b.id === brandId);
      if (!brand) {
        return NextResponse.json(
          { success: false, data: null, error: 'Brand not found' },
          { status: 404 }
        );
      }
      brandName = brand.name;
      brandIndustry = brand.industry;
      try {
        brandVoice = brand.voice ? JSON.parse(brand.voice) : { tone: brand.tone };
      } catch {
        brandVoice = { tone: brand.tone };
      }
      organizationId = brand.organization_id;
    } else {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { success: false, data: null, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (brandError || !brand) {
        return NextResponse.json(
          { success: false, data: null, error: 'Brand not found' },
          { status: 404 }
        );
      }
      brandName = brand.name;
      brandIndustry = brand.industry;
      try {
        brandVoice = brand.voice ? JSON.parse(brand.voice) : { tone: brand.tone };
      } catch {
        brandVoice = { tone: brand.tone };
      }
      organizationId = brand.organization_id;
    }

    // 2. Prepare user input variables for the Video Director Agent
    const userInput = {
      brandName,
      industry: brandIndustry,
      brandVoice,
      concept,
      duration: duration || 30,
      platform: platform || 'tiktok',
      style: style || 'energetic',
      audience: brandVoice?.personas?.[0]?.name || 'General target audience',
    };

    // 3. Execute Video Scriptwriter Agent
    const aiResult = await runAgent<any>({
      organizationId,
      agent: 'video',
      userInput,
      brandId,
    });

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json(
        { success: false, data: null, error: aiResult.error || 'Failed to generate storyboard script' },
        { status: 500 }
      );
    }

    // Add generated image art prompts for Midjourney/DALL-E to each scene dynamically!
    // This answers our Open Question (visual mockup prompts) by appending them programmatically.
    const storyboardData = { ...aiResult.data };
    if (storyboardData.scenes && Array.isArray(storyboardData.scenes)) {
      storyboardData.scenes = storyboardData.scenes.map((scene: any) => {
        const platformDescriptor = platform === 'tiktok' || platform === 'reels' ? '9:16 vertical video ratio' : '16:9 widescreen cinematic ratio';
        return {
          ...scene,
          artPrompt: `A high-end, clean commercial style visual matching: ${scene.visual}. Professional studio lighting, minimal Swiss graphic overlays, shot on RED camera, ${platformDescriptor}, sleek modernist design, sharp focus.`,
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: storyboardData,
      meta: aiResult.meta,
      error: null,
    });
  } catch (err: any) {
    console.error('Error generating video storyboard:', err);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
