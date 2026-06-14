// Brandavox API Route - Client Detail Fetching & Updates
// Location: src/app/api/clients/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { readMockDb, writeMockDb } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

const updateClientSchema = z.object({
  status: z.enum(['onboarding', 'active', 'at_risk', 'churned']).optional(),
  notes: z.string().optional(),
  revenue: z.number().nonnegative().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const client = db.clients.find((c) => c.id === id);

      if (!client) {
        return NextResponse.json(
          { success: false, data: null, error: 'Client not found' },
          { status: 404 }
        );
      }

      const recoveryPlan = db.recoveryPlans.find((rp) => rp.client_id === id);

      return NextResponse.json({
        success: true,
        data: {
          client,
          recoveryPlan: recoveryPlan || null,
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

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, data: null, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Fetch recovery plan if any
    const { data: recoveryPlan } = await supabase
      .from('recovery_plans')
      .select('*')
      .eq('client_id', id)
      .eq('status', 'active')
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        client,
        recoveryPlan: recoveryPlan || null,
      },
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching client details:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = updateClientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData = result.data;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const clientIndex = db.clients.findIndex((c) => c.id === id);

      if (clientIndex === -1) {
        return NextResponse.json(
          { success: false, data: null, error: 'Client not found' },
          { status: 404 }
        );
      }

      // Merge values
      db.clients[clientIndex] = {
        ...db.clients[clientIndex],
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: db.clients[clientIndex],
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

    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: updatedClient,
      error: null,
    });
  } catch (err: any) {
    console.error('Error updating client:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
