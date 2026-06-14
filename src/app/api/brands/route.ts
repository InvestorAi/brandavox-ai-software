// Brandavox API Route - Brands Listing & Creation
// Location: src/app/api/brands/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { readMockDb, writeMockDb, MockBrand } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  website: z.string().url('Invalid website URL').or(z.string().length(0)).optional(),
  industry: z.string().min(1, 'Industry is required'),
  mission: z.string().default(''),
  vision: z.string().default(''),
  values: z.array(z.string()).default([]),
  tone: z.string().default('Neutral tone'),
});

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      return NextResponse.json({
        success: true,
        data: db.brands,
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

    // Resolve user's organization_id
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

    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .order('created_at', { ascending: false });

    if (brandsError) {
      throw brandsError;
    }

    return NextResponse.json({
      success: true,
      data: brands,
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching brands:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = brandSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, website, industry, mission, vision, values, tone } = result.data;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const newBrand: MockBrand = {
        id: `brand-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: 'mock-org-123',
        name,
        industry,
        mission,
        vision,
        values,
        voice: '', // Strategy starts empty
        tone,
        brand_score: 0,
        logo_url: null,
        website: website || '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.brands.unshift(newBrand);
      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: newBrand,
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

    const { data: brand, error: insertError } = await supabase
      .from('brands')
      .insert({
        organization_id: userData.organization_id,
        name,
        website: website || '',
        industry,
        mission,
        vision,
        values,
        tone,
        voice: '',
        brand_score: 0,
        status: 'active',
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      data: brand,
      error: null,
    });
  } catch (err: any) {
    console.error('Error creating brand:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
