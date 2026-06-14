// Brandavox API Route - Trigger AI Brand Strategy Generation
// Location: src/app/api/brands/[id]/generate-strategy/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAgent } from '@/lib/ai/agentRouter';
import { BrandAgentOutput } from '@/types/ai.types';
import { readMockDb, writeMockDb, MockBrand, MockPersona } from '@/lib/utils/mockDb';

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

    let brandName = '';
    let brandIndustry = '';
    let brandMission = '';
    let brandVision = '';
    let brandValues: string[] = [];
    let brandTone = '';
    let organizationId = '';

    // 1. Fetch the brand profile
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const brand = db.brands.find((b) => b.id === id);
      if (!brand) {
        return NextResponse.json(
          { success: false, data: null, error: 'Brand not found' },
          { status: 404 }
        );
      }
      brandName = brand.name;
      brandIndustry = brand.industry;
      brandMission = brand.mission;
      brandVision = brand.vision;
      brandValues = brand.values;
      brandTone = brand.tone;
      organizationId = brand.organization_id;
    } else {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { success: false, data: null, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();

      if (brandError || !brand) {
        return NextResponse.json(
          { success: false, data: null, error: 'Brand not found' },
          { status: 404 }
        );
      }
      brandName = brand.name;
      brandIndustry = brand.industry;
      brandMission = brand.mission;
      brandVision = brand.vision;
      brandValues = brand.values || [];
      brandTone = brand.tone || '';
      organizationId = brand.organization_id;
    }

    // 2. Prepare user input variables for the brand intelligence agent
    const userInput = {
      name: brandName,
      industry: brandIndustry,
      mission: brandMission,
      vision: brandVision,
      values: brandValues,
      tone: brandTone,
    };

    // 3. Execute AI Strategy generation
    const aiResult = await runAgent<BrandAgentOutput>({
      organizationId,
      agent: 'brand',
      userInput,
      brandId: id,
    });

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json(
        { success: false, data: null, error: aiResult.error || 'Failed to generate strategy' },
        { status: 500 }
      );
    }

    const strategy = aiResult.data;

    // 4. Update the database with the generated strategy and create personas
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const brandIndex = db.brands.findIndex((b) => b.id === id);

      if (brandIndex === -1) {
        return NextResponse.json(
          { success: false, data: null, error: 'Brand not found during write' },
          { status: 404 }
        );
      }

      // Update brand fields
      db.brands[brandIndex].brand_score = strategy.brandScore;
      db.brands[brandIndex].voice = JSON.stringify(strategy);
      db.brands[brandIndex].updated_at = new Date().toISOString();

      // Drop old personas and write new ones
      db.personas = db.personas.filter((p) => p.brand_id !== id);

      const insertedPersonas: MockPersona[] = strategy.personas.map((p, idx) => {
        const newPersona: MockPersona = {
          id: `persona-${Math.random().toString(36).substr(2, 9)}-${idx}`,
          organization_id: organizationId,
          brand_id: id,
          name: p.name,
          age_range: p.ageRange,
          demographics: { role: p.role, messagingAngle: p.messagingAngle },
          pain_points: p.painPoints,
          goals: p.goals,
          platforms: p.platforms,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        db.personas.push(newPersona);
        return newPersona;
      });

      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: {
          brand: db.brands[brandIndex],
          personas: insertedPersonas,
        },
        error: null,
      });
    } else {
      const supabase = await createClient();

      // Update brand details
      const { data: updatedBrand, error: updateError } = await supabase
        .from('brands')
        .update({
          brand_score: strategy.brandScore,
          voice: JSON.stringify(strategy),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      // Drop old personas
      const { error: deleteError } = await supabase
        .from('personas')
        .delete()
        .eq('brand_id', id);

      if (deleteError) throw deleteError;

      // Insert new personas
      const personasToInsert = strategy.personas.map((p) => ({
        brand_id: id,
        organization_id: organizationId,
        name: p.name,
        age_range: p.ageRange,
        demographics: { role: p.role, messagingAngle: p.messagingAngle },
        pain_points: p.painPoints,
        goals: p.goals,
        platforms: p.platforms,
      }));

      const { data: insertedPersonas, error: insertError } = await supabase
        .from('personas')
        .insert(personasToInsert)
        .select('*');

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        data: {
          brand: updatedBrand,
          personas: insertedPersonas || [],
        },
        error: null,
      });
    }
  } catch (err: any) {
    console.error('Error generating strategy:', err);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
