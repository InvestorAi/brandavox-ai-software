// Brandavox API Route - Webhooks Testing Simulation
// Location: src/app/api/developer/webhooks/test/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readMockDb, writeMockDb, MockWebhookLog } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookId, event } = body;

    if (!webhookId) {
      return NextResponse.json(
        { success: false, data: null, error: 'Webhook ID is required for testing' },
        { status: 400 }
      );
    }

    const eventType = event || 'campaign.published';
    const latency = Math.floor(Math.random() * 200) + 100; // 100ms - 300ms
    const timestamp = new Date().toISOString();

    // Construct a simulated event payload
    let payloadObj: any = {};
    if (eventType === 'campaign.published') {
      payloadObj = {
        event: 'campaign.published',
        webhook_id: webhookId,
        timestamp,
        data: {
          campaign_id: 'camp-pulse-promo',
          title: 'Summer Pulse Launch',
          status: 'published',
          published_posts_count: 5,
        },
      };
    } else if (eventType === 'client.at_risk') {
      payloadObj = {
        event: 'client.at_risk',
        webhook_id: webhookId,
        timestamp,
        data: {
          client_id: 'client-nova',
          company: 'Nova Freight Systems',
          health_score: 45,
          assigned_analyst: 'Godswill Johnson',
        },
      };
    } else {
      payloadObj = {
        event: eventType,
        webhook_id: webhookId,
        timestamp,
        data: {
          message: `Simulated trigger for event: ${eventType}`,
        },
      };
    }

    const payloadString = JSON.stringify(payloadObj, null, 2);

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const webhook = db.webhooks.find((w) => w.id === webhookId);

      if (!webhook) {
        return NextResponse.json(
          { success: false, data: null, error: 'Webhook subscription not found' },
          { status: 404 }
        );
      }

      const newLog: MockWebhookLog = {
        id: `log-${Math.random().toString(36).substr(2, 9)}`,
        webhook_id: webhookId,
        event_type: eventType,
        status_code: 200,
        latency_ms: latency,
        payload: payloadString,
        created_at: timestamp,
      };

      db.webhookLogs.unshift(newLog);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: newLog,
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
      // Fetch webhook to confirm ownership
      const { data: webhook, error: webhookQueryError } = await supabase
        .from('webhooks')
        .select('id')
        .eq('id', webhookId)
        .eq('organization_id', userData.organization_id)
        .single();

      if (webhookQueryError || !webhook) {
        return NextResponse.json(
          { success: false, data: null, error: 'Webhook subscription not found' },
          { status: 404 }
        );
      }

      // Write test log to database
      const { data: log, error: insertError } = await supabase
        .from('webhook_logs')
        .insert({
          organization_id: userData.organization_id,
          webhook_id: webhookId,
          event_type: eventType,
          status_code: 200,
          latency_ms: latency,
          payload: payloadString,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        data: log,
        error: null,
      });
    } catch (dbErr: any) {
      // Database query failed or table doesn't exist, fall back to mockDb
      console.warn('Webhook logging falling back to mockDb:', dbErr.message);
      
      const db = readMockDb();
      const newLog: MockWebhookLog = {
        id: `log-${Math.random().toString(36).substr(2, 9)}`,
        webhook_id: webhookId,
        event_type: eventType,
        status_code: 200,
        latency_ms: latency,
        payload: payloadString,
        created_at: timestamp,
      };

      db.webhookLogs.unshift(newLog);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: newLog,
        error: null,
      });
    }
  } catch (err: any) {
    console.error('Error running simulated webhook test:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
