// Brandavox API Route - Batch Export Posts to Content Schedule
// Location: src/app/api/agents/content/batch-import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readMockDb, writeMockDb, MockCampaignPost } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, posts } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, data: null, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { success: false, data: null, error: 'No posts provided for batch import' },
        { status: 400 }
      );
    }

    // 1. Verify Campaign and retrieve organization context
    let organizationId = 'mock-org-123';

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const campaign = db.campaigns.find((c) => c.id === campaignId);
      if (!campaign) {
        return NextResponse.json(
          { success: false, data: null, error: 'Campaign not found' },
          { status: 404 }
        );
      }
      organizationId = campaign.organization_id;

      // Map and insert posts sequentially
      const newPosts: MockCampaignPost[] = posts.map((post: any, idx: number) => {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 1 + idx); // starting tomorrow
        scheduledDate.setHours(12, 0, 0, 0); // default to 12:00 PM

        const hashtagsStr = post.hashtags && Array.isArray(post.hashtags)
          ? post.hashtags.map((h: string) => `#${h.replace(/#/g, '')}`).join(' ')
          : '';

        const fullContent = `${post.hook ? `${post.hook}\n\n` : ''}${post.caption}${hashtagsStr ? `\n\n${hashtagsStr}` : ''}`;

        return {
          id: `post-${Math.random().toString(36).substr(2, 9)}-${idx}`,
          organization_id: organizationId,
          campaign_id: campaignId,
          platform: post.platform.toLowerCase(),
          content: fullContent,
          scheduled_at: scheduledDate.toISOString(),
          published_at: null,
          status: 'scheduled',
          performance: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      db.campaignPosts.push(...newPosts);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: { count: newPosts.length },
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

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('organization_id')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, data: null, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    organizationId = campaign.organization_id;

    // Prepare batch rows
    const postsToInsert = posts.map((post: any, idx: number) => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1 + idx);
      scheduledDate.setHours(12, 0, 0, 0);

      const hashtagsStr = post.hashtags && Array.isArray(post.hashtags)
        ? post.hashtags.map((h: string) => `#${h.replace(/#/g, '')}`).join(' ')
        : '';

      const fullContent = `${post.hook ? `${post.hook}\n\n` : ''}${post.caption}${hashtagsStr ? `\n\n${hashtagsStr}` : ''}`;

      return {
        organization_id: organizationId,
        campaign_id: campaignId,
        platform: post.platform.toLowerCase(),
        content: fullContent,
        scheduled_at: scheduledDate.toISOString(),
        status: 'scheduled',
        performance: {},
      };
    });

    const { data: inserted, error: insertError } = await supabase
      .from('campaign_posts')
      .insert(postsToInsert)
      .select('*');

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      data: { count: inserted.length },
      error: null,
    });
  } catch (err: any) {
    console.error('Error batch importing posts:', err);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
