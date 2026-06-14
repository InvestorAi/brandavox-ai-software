// Brandavox API Route - Campaigns Listing & Creation
// Location: src/app/api/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { readMockDb, writeMockDb, MockCampaign } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

const campaignSchema = z.object({
  brand_id: z.string().min(1, 'Brand is required'),
  title: z.string().min(1, 'Campaign title is required'),
  objective: z.string().default(''),
  budget: z.number().nonnegative('Budget must be positive or zero').default(0),
  status: z.enum(['draft', 'active', 'completed']).default('draft'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  channels: z.array(z.string()).default([]),
});

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      return NextResponse.json({
        success: true,
        data: db.campaigns,
        error: null,
      });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, data: null, error: 'User organization not found' },
        { status: 400 }
      );
    }

    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      throw campaignsError;
    }

    return NextResponse.json({
      success: true,
      data: campaigns,
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching campaigns:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = campaignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { brand_id, title, objective, budget, status, start_date, end_date, channels } = result.data;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const newCampaign: MockCampaign = {
        id: `camp-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: 'mock-org-123',
        brand_id,
        title,
        objective,
        budget,
        status,
        start_date,
        end_date,
        channels,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.campaigns.unshift(newCampaign);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: newCampaign,
        error: null,
      });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, data: null, error: 'User organization not found' },
        { status: 400 }
      );
    }

    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        organization_id: userData.organization_id,
        brand_id,
        title,
        objective,
        budget,
        status,
        start_date,
        end_date,
        channels,
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      data: campaign,
      error: null,
    });
  } catch (err: any) {
    console.error('Error creating campaign:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
