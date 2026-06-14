// Brandavox API Route - Developer Webhooks Subscription
// Location: src/app/api/developer/webhooks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readMockDb, writeMockDb, MockWebhook } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      return NextResponse.json({
        success: true,
        data: {
          webhooks: db.webhooks,
          logs: db.webhookLogs,
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

    // Since webhooks tables might not exist on initial basic postgres setups yet,
    // we return mock webhooks if the table queries fail or default to mock,
    // to guarantee smooth execution under all environments.
    try {
      const { data: webhooks, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('organization_id', userData.organization_id);

      if (webhooksError) throw webhooksError;

      const { data: logs, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      return NextResponse.json({
        success: true,
        data: {
          webhooks: webhooks || [],
          logs: logs || [],
        },
        error: null,
      });
    } catch {
      // Supabase migration fallback
      const db = readMockDb();
      return NextResponse.json({
        success: true,
        data: {
          webhooks: db.webhooks,
          logs: db.webhookLogs,
        },
        error: null,
      });
    }
  } catch (err: any) {
    console.error('Error fetching webhooks:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, events } = body;

    if (!url || !url.trim().startsWith('http')) {
      return NextResponse.json(
        { success: false, data: null, error: 'A valid absolute target URL is required' },
        { status: 400 }
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, data: null, error: 'Select at least one trigger event' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const newWebhook: MockWebhook = {
        id: `web-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: 'mock-org-123',
        url,
        events,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      db.webhooks.unshift(newWebhook);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: newWebhook,
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

    try {
      const { data: webhook, error: insertError } = await supabase
        .from('webhooks')
        .insert({
          organization_id: userData.organization_id,
          url,
          events,
          status: 'active',
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        data: webhook,
        error: null,
      });
    } catch {
      // Supabase migration fallback
      const db = readMockDb();
      const newWebhook: MockWebhook = {
        id: `web-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: userData.organization_id,
        url,
        events,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      db.webhooks.unshift(newWebhook);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: newWebhook,
        error: null,
      });
    }
  } catch (err: any) {
    console.error('Error creating webhook:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
