// Brandavox API Route - Generate Post Caption with Copywriting Agent
// Location: src/app/api/posts/generate-caption/route.ts

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
    const { brandId, brief, platform } = body;

    if (!brandId) {
      return NextResponse.json(
        { success: false, data: null, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    if (!brief) {
      return NextResponse.json(
        { success: false, data: null, error: 'Content brief is required' },
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

    // 2. Prepare user input variables for the Copywriter Agent
    const userInput = {
      brandName,
      industry: brandIndustry,
      brandVoice,
      platform: platform || 'linkedin',
      brief,
      audience: brandVoice?.personas?.[0]?.name || 'General target audience',
    };

    // 3. Execute Copywriter Agent
    const aiResult = await runAgent<any>({
      organizationId,
      agent: 'copy',
      userInput,
      brandId,
    });

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json(
        { success: false, data: null, error: aiResult.error || 'Failed to generate copy' },
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
    console.error('Error generating post caption:', err);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
