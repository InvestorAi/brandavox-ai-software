// Brandavox API Route - Content Strategy Planner Agent
// Location: src/app/api/agents/content/route.ts

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
    const { brandId, theme, platforms, days } = body;

    if (!brandId) {
      return NextResponse.json(
        { success: false, data: null, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    if (!theme) {
      return NextResponse.json(
        { success: false, data: null, error: 'Content theme/brief is required' },
        { status: 400 }
      );
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { success: false, data: null, error: 'At least one target platform is required' },
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

    // 2. Prepare user input variables for the Content Planner Agent
    const userInput = {
      brandName,
      industry: brandIndustry,
      brandVoice,
      theme,
      platforms,
      days: days || 5,
      audience: brandVoice?.personas?.[0]?.name || 'General target audience',
    };

    // 3. Execute Content Strategy Agent
    const aiResult = await runAgent<any>({
      organizationId,
      agent: 'content',
      userInput,
      brandId,
    });

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json(
        { success: false, data: null, error: aiResult.error || 'Failed to generate content calendar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: aiResult.data,
      meta: aiResult.meta,
      error: null,
    });
  } catch (err: any) {
    console.error('Error generating batch content:', err);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
