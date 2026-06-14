// Brandavox API Route - Posts Listing & Creation
// Location: src/app/api/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { readMockDb, writeMockDb, MockCampaignPost } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

const postSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign ID is required'),
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'facebook']),
  content: z.string().min(1, 'Post content is required'),
  scheduled_at: z.string().min(1, 'Scheduled date is required'),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).default('scheduled'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      let posts = [...db.campaignPosts];

      if (campaignId) {
        posts = posts.filter((p) => p.campaign_id === campaignId);
      }
      if (startDate) {
        posts = posts.filter((p) => p.scheduled_at >= startDate);
      }
      if (endDate) {
        posts = posts.filter((p) => p.scheduled_at <= endDate);
      }

      posts.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

      return NextResponse.json({
        success: true,
        data: posts,
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

    let query = supabase
      .from('campaign_posts')
      .select('*')
      .eq('organization_id', userData.organization_id);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    if (startDate) {
      query = query.gte('scheduled_at', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_at', endDate);
    }

    const { data: posts, error: postsError } = await query.order('scheduled_at', { ascending: true });

    if (postsError) {
      throw postsError;
    }

    return NextResponse.json({
      success: true,
      data: posts,
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching posts:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = postSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { campaign_id, platform, content, scheduled_at, status } = result.data;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const newPost: MockCampaignPost = {
        id: `post-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: 'mock-org-123',
        campaign_id,
        platform,
        content,
        scheduled_at,
        published_at: status === 'published' ? new Date().toISOString() : null,
        status,
        performance: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.campaignPosts.push(newPost);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: newPost,
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

    const { data: post, error: insertError } = await supabase
      .from('campaign_posts')
      .insert({
        organization_id: userData.organization_id,
        campaign_id,
        platform,
        content,
        scheduled_at,
        published_at: status === 'published' ? new Date().toISOString() : null,
        status,
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      data: post,
      error: null,
    });
  } catch (err: any) {
    console.error('Error creating post:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
