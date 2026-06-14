// Brandavox API Route - Brand Details & Deletion
// Location: src/app/api/brands/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readMockDb, writeMockDb } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const brand = db.brands.find((b) => b.id === id);

      if (!brand) {
        return NextResponse.json(
          { success: false, data: null, error: 'Brand not found' },
          { status: 404 }
        );
      }

      const personas = db.personas.filter((p) => p.brand_id === id);

      return NextResponse.json({
        success: true,
        data: {
          brand,
          personas,
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

    // Fetch brand
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

    // Fetch linked personas
    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('*')
      .eq('brand_id', id);

    if (personasError) {
      throw personasError;
    }

    return NextResponse.json({
      success: true,
      data: {
        brand,
        personas: personas || [],
      },
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching brand details:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const initialLength = db.brands.length;
      
      db.brands = db.brands.filter((b) => b.id !== id);
      db.personas = db.personas.filter((p) => p.brand_id !== id);

      if (db.brands.length === initialLength) {
        return NextResponse.json(
          { success: false, data: null, error: 'Brand not found' },
          { status: 404 }
        );
      }

      writeMockDb(db);

      return NextResponse.json({
        success: true,
        data: { id },
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

    const { error: deleteError } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err: any) {
    console.error('Error deleting brand:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
