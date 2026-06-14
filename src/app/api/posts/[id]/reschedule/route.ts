// Brandavox API Route - Post Rescheduling
// Location: src/app/api/posts/[id]/reschedule/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { readMockDb, writeMockDb } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

const rescheduleSchema = z.object({
  scheduled_at: z.string().min(1, 'Scheduled date is required'),
  content: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = rescheduleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { scheduled_at, content, status } = result.data;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const postIndex = db.campaignPosts.findIndex((p) => p.id === id);

      if (postIndex === -1) {
        return NextResponse.json(
          { success: false, data: null, error: 'Post not found' },
          { status: 404 }
        );
      }

      const post = db.campaignPosts[postIndex];
      db.campaignPosts[postIndex] = {
        ...post,
        scheduled_at,
        content: content !== undefined ? content : post.content,
        status: status !== undefined ? status : post.status,
        published_at: status === 'published' ? new Date().toISOString() : post.published_at,
        updated_at: new Date().toISOString(),
      };

      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: db.campaignPosts[postIndex],
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

    const updates: any = {
      scheduled_at,
      updated_at: new Date().toISOString(),
    };

    if (content !== undefined) updates.content = content;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published') {
        updates.published_at = new Date().toISOString();
      }
    }

    const { data: post, error: updateError } = await supabase
      .from('campaign_posts')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: post,
      error: null,
    });
  } catch (err: any) {
    console.error('Error rescheduling post:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
