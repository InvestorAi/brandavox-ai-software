// Brandavox API Route - Trigger CRM AI Health Diagnostics
// Location: src/app/api/clients/[id]/analyze-health/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAgent } from '@/lib/ai/agentRouter';
import { CRMAgentOutput } from '@/types/ai.types';
import { readMockDb, writeMockDb } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    let clientCompany = '';
    let clientNotes = '';
    let clientRevenue = 0;
    let clientStatus = '';
    let organizationId = '';

    // 1. Fetch Client Profile
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const client = db.clients.find((c) => c.id === id);
      if (!client) {
        return NextResponse.json(
          { success: false, data: null, error: 'Client not found' },
          { status: 404 }
        );
      }
      clientCompany = client.company;
      clientNotes = client.notes;
      clientRevenue = client.revenue;
      clientStatus = client.status;
      organizationId = client.organization_id;
    } else {
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
      clientCompany = client.company;
      clientNotes = client.notes || '';
      clientRevenue = Number(client.revenue) || 0;
      clientStatus = client.status;
      organizationId = client.organization_id;
    }

    // 2. Build input parameters for CRM Agent
    const userInput = {
      company: clientCompany,
      managerNotes: clientNotes,
      revenue: clientRevenue,
      status: clientStatus,
    };

    // 3. Execute CRM Agent
    const aiResult = await runAgent<CRMAgentOutput>({
      organizationId,
      agent: 'crm',
      userInput,
      clientId: id,
    });

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json(
        { success: false, data: null, error: aiResult.error || 'Failed to analyze health' },
        { status: 500 }
      );
    }

    const diagnosis = aiResult.data;

    // Determine target client status based on risk level
    let targetStatus: 'active' | 'at_risk' | 'churned' | 'onboarding' = 'active';
    if (diagnosis.riskLevel === 'critical') {
      targetStatus = 'at_risk'; // or churned
    } else if (diagnosis.riskLevel === 'high') {
      targetStatus = 'at_risk';
    } else {
      targetStatus = 'active';
    }

    // 4. Update Database
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const clientIdx = db.clients.findIndex((c) => c.id === id);

      if (clientIdx === -1) {
        return NextResponse.json(
          { success: false, data: null, error: 'Client not found during save' },
          { status: 404 }
        );
      }

      db.clients[clientIdx].health_score = diagnosis.healthScore;
      db.clients[clientIdx].status = targetStatus;
      db.clients[clientIdx].health_details = JSON.stringify(diagnosis.healthFactors);
      db.clients[clientIdx].updated_at = new Date().toISOString();

      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: {
          client: db.clients[clientIdx],
          analysis: diagnosis,
        },
        error: null,
      });
    } else {
      const supabase = await createClient();

      const { data: updatedClient, error: updateError } = await supabase
        .from('clients')
        .update({
          health_score: diagnosis.healthScore,
          status: targetStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: {
          client: updatedClient,
          analysis: diagnosis,
        },
        error: null,
      });
    }
  } catch (err: any) {
    console.error('Error in CRM analysis:', err);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
