// Brandavox API Route - Developer API Keys Management
// Location: src/app/api/developer/keys/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readMockDb, writeMockDb, MockApiKey } from '@/lib/utils/mockDb';
import crypto from 'crypto';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      // Hide hashed keys in response for security
      const cleanKeys = db.apiKeys.map(({ hashed_key, ...rest }) => rest);
      return NextResponse.json({
        success: true,
        data: cleanKeys,
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

    const { data: keys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, last_used_at, scopes, created_at')
      .eq('organization_id', userData.organization_id)
      .order('created_at', { ascending: false });

    if (keysError) {
      throw keysError;
    }

    return NextResponse.json({
      success: true,
      data: keys,
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching API keys:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, scopes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, data: null, error: 'Key description name is required' },
        { status: 400 }
      );
    }

    // Generate Key Pair
    const randPart1 = crypto.randomBytes(12).toString('hex');
    const randPart2 = crypto.randomBytes(12).toString('hex');
    const rawKey = `bv_live_${randPart1}${randPart2}`;
    const keyPrefix = `bv_live_${randPart1.substring(0, 4)}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const newKey: MockApiKey = {
        id: `key-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: 'mock-org-123',
        name,
        hashed_key: hashedKey,
        key_prefix: keyPrefix,
        last_used_at: null,
        scopes: scopes || ['read:brands'],
        created_at: new Date().toISOString(),
      };

      db.apiKeys.unshift(newKey);
      writeMockDb(db);

      // Return the secret key ONLY once on creation
      return NextResponse.json({
        success: true,
        data: {
          ...newKey,
          secret_key: rawKey,
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

    const { data: key, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        organization_id: userData.organization_id,
        name,
        hashed_key: hashedKey,
        key_prefix: keyPrefix,
        scopes: scopes || ['read:brands'],
      })
      .select('id, name, key_prefix, last_used_at, scopes, created_at')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...key,
        secret_key: rawKey,
      },
      error: null,
    });
  } catch (err: any) {
    console.error('Error generating API key:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: 'Key ID is required for revocation' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      const initialLength = db.apiKeys.length;
      db.apiKeys = db.apiKeys.filter((k) => k.id !== id);

      if (db.apiKeys.length === initialLength) {
        return NextResponse.json(
          { success: false, data: null, error: 'API key not found' },
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
      .from('api_keys')
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
    console.error('Error revoking API key:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
