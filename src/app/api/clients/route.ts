// Brandavox API Route - Clients Listing & Creation
// Location: src/app/api/clients/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { readMockDb, writeMockDb, MockClient } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  company: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address').or(z.string().length(0)).optional(),
  phone: z.string().default(''),
  revenue: z.number().nonnegative('Revenue must be positive').default(0),
  notes: z.string().default(''),
});

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      return NextResponse.json({
        success: true,
        data: db.clients,
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

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .order('created_at', { ascending: false });

    if (clientsError) {
      throw clientsError;
    }

    return NextResponse.json({
      success: true,
      data: clients,
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching clients:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = clientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, company, email, phone, revenue, notes } = result.data;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const newClient: MockClient = {
        id: `client-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: 'mock-org-123',
        name,
        company,
        email: email || '',
        phone: phone || '',
        health_score: 100, // initialized to perfect health
        revenue,
        status: 'onboarding',
        notes,
        assigned_to: 'Godswill Johnson',
        health_details: JSON.stringify({
          communication: 100,
          projectSuccess: 100,
          revenueGrowth: 100,
          satisfaction: 100,
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.clients.unshift(newClient);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: newClient,
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
      .select('organization_id, full_name')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, data: null, error: 'User organization not found' },
        { status: 400 }
      );
    }

    const { data: client, error: insertError } = await supabase
      .from('clients')
      .insert({
        organization_id: userData.organization_id,
        name,
        company,
        email: email || '',
        phone: phone || '',
        health_score: 100,
        revenue,
        status: 'onboarding',
        notes,
        assigned_to: user.id,
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      data: client,
      error: null,
    });
  } catch (err: any) {
    console.error('Error creating client:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
