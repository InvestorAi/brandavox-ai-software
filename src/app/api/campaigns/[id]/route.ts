// Brandavox API Route - Campaign Details & Deletion
// Location: src/app/api/campaigns/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readMockDb, writeMockDb } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const campaign = db.campaigns.find((c) => c.id === id);

      if (!campaign) {
        return NextResponse.json(
          { success: false, data: null, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const posts = db.campaignPosts.filter((p) => p.campaign_id === id);

      return NextResponse.json({
        success: true,
        data: {
          campaign,
          posts,
        },
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

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, data: null, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Fetch linked campaign posts
    const { data: posts, error: postsError } = await supabase
      .from('campaign_posts')
      .select('*')
      .eq('campaign_id', id)
      .order('scheduled_at', { ascending: true });

    if (postsError) {
      throw postsError;
    }

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        posts: posts || [],
      },
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching campaign details:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const initialLength = db.campaigns.length;

      db.campaigns = db.campaigns.filter((c) => c.id !== id);
      db.campaignPosts = db.campaignPosts.filter((p) => p.campaign_id !== id);

      if (db.campaigns.length === initialLength) {
        return NextResponse.json(
          { success: false, data: null, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: { id },
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

    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err: any) {
    console.error('Error deleting campaign:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
