// Brandavox API Route - Team Members Listing
// Location: src/app/api/team/members/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readMockDb } from '@/lib/utils/mockDb';

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
        data: db.teamMembers,
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

    const { data: members, error: membersError } = await supabase
      .from('users')
      .select('id, email, full_name, role, avatar_url')
      .eq('organization_id', userData.organization_id);

    if (membersError) {
      throw membersError;
    }

    // Append mock status for Supabase since status column is not present in sql schema
    const membersWithStatus = (members || []).map((m) => ({
      ...m,
      status: m.id === user.id ? 'online' : (Math.random() > 0.5 ? 'online' : 'away'),
    }));

    return NextResponse.json({
      success: true,
      data: membersWithStatus,
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching team members:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
