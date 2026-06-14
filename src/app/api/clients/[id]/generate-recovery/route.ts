// Brandavox API Route - Trigger CRM AI Client Recovery & Win-Back
// Location: src/app/api/clients/[id]/generate-recovery/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAgent } from '@/lib/ai/agentRouter';
import { RecoveryAgentOutput } from '@/types/ai.types';
import { readMockDb, writeMockDb, MockRecoveryPlan } from '@/lib/utils/mockDb';

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
    let clientHealthScore = 100;
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
      clientHealthScore = client.health_score;
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
      clientHealthScore = client.health_score || 100;
      clientStatus = client.status;
      organizationId = client.organization_id;
    }

    // 2. Build input parameters for Recovery Agent
    const userInput = {
      company: clientCompany,
      managerNotes: clientNotes,
      healthScore: clientHealthScore,
      status: clientStatus,
    };

    // 3. Execute Recovery Agent
    const aiResult = await runAgent<RecoveryAgentOutput>({
      organizationId,
      agent: 'recovery',
      userInput,
      clientId: id,
    });

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json(
        { success: false, data: null, error: aiResult.error || 'Failed to generate recovery plan' },
        { status: 500 }
      );
    }

    const recoveryData = aiResult.data;
    const riskScore = 100 - clientHealthScore;

    // 4. Update Database
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const planIndex = db.recoveryPlans.findIndex((rp) => rp.client_id === id);

      const updatedPlan: MockRecoveryPlan = {
        id: planIndex !== -1 ? db.recoveryPlans[planIndex].id : `plan-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: organizationId,
        client_id: id,
        status: 'active',
        risk_score: riskScore,
        strategy: JSON.stringify(recoveryData.recoveryPlan),
        outreach_sequence: JSON.stringify(recoveryData.emailSequence),
        actions: JSON.stringify(recoveryData.priorityActions),
        created_at: planIndex !== -1 ? db.recoveryPlans[planIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (planIndex !== -1) {
        db.recoveryPlans[planIndex] = updatedPlan;
      } else {
        db.recoveryPlans.push(updatedPlan);
      }

      // Automatically flag client as at-risk if they aren't already
      const clientIdx = db.clients.findIndex((c) => c.id === id);
      if (clientIdx !== -1 && db.clients[clientIdx].status === 'active') {
        db.clients[clientIdx].status = 'at_risk';
      }

      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: updatedPlan,
        error: null,
      });
    } else {
      const supabase = await createClient();

      // Upsert recovery plan
      const { data: recoveryPlan, error: upsertError } = await supabase
        .from('recovery_plans')
        .upsert({
          organization_id: organizationId,
          client_id: id,
          status: 'active',
          risk_score: riskScore,
          strategy: recoveryData.recoveryPlan,
          outreach_sequence: recoveryData.emailSequence,
          actions: recoveryData.priorityActions,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'client_id,organization_id' // Wait, in Postgres schema it might not have uniqueness. Let's check unique constraints.
          // Wait, if no unique constraint is on conflict, let's delete existing recovery plans first, and insert.
        })
        .select('*')
        .single();

      // Wait, let's write it safely: delete then insert, to avoid onConflict mismatch if there is no unique constraint index on (client_id, organization_id)
      // Let's delete and insert:
      await supabase.from('recovery_plans').delete().eq('client_id', id);
      
      const { data: newPlan, error: insertError } = await supabase
        .from('recovery_plans')
        .insert({
          organization_id: organizationId,
          client_id: id,
          status: 'active',
          risk_score: riskScore,
          strategy: recoveryData.recoveryPlan,
          outreach_sequence: recoveryData.emailSequence,
          actions: recoveryData.priorityActions,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      // Update client status to at_risk if they are active
      await supabase
        .from('clients')
        .update({ status: 'at_risk' })
        .eq('id', id)
        .eq('status', 'active');

      return NextResponse.json({
        success: true,
        data: newPlan,
        error: null,
      });
    }
  } catch (err: any) {
    console.error('Error in recovery plan generation:', err);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
