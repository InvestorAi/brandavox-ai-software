import { NextResponse } from 'next/server';
import { readMockDb } from '@/lib/utils/mockDb';

export async function GET() {
  try {
    const db = readMockDb();
    const stats = db.securityStats || {
      rateLimitBlocks: 42,
      burnerEmailIntercepts: 18
    };

    return NextResponse.json({
      success: true,
      data: stats,
      error: null
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch security stats' },
      { status: 500 }
    );
  }
}
