import { NextRequest, NextResponse } from 'next/server';
import { readMockDb, writeMockDb } from '@/lib/utils/mockDb';

export async function GET() {
  try {
    const db = readMockDb();
    const config = db.emailMarketingConfig || {
      activeSyncProvider: 'aws_ses',
      authRoute: 'zeptomail',
      transactionalRoute: 'aws_ses',
      marketingRoute: 'alibaba_directmail',
      syncHistory: []
    };

    return NextResponse.json({
      success: true,
      data: config,
      error: null
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch email settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activeSyncProvider, authRoute, transactionalRoute, marketingRoute } = body;

    const db = readMockDb();
    const config = db.emailMarketingConfig || {
      activeSyncProvider: 'aws_ses',
      authRoute: 'zeptomail',
      transactionalRoute: 'aws_ses',
      marketingRoute: 'alibaba_directmail',
      syncHistory: []
    };

    // Update settings
    config.activeSyncProvider = activeSyncProvider || config.activeSyncProvider;
    config.authRoute = authRoute || config.authRoute;
    config.transactionalRoute = transactionalRoute || config.transactionalRoute;
    config.marketingRoute = marketingRoute || config.marketingRoute;

    db.emailMarketingConfig = config;
    writeMockDb(db);

    return NextResponse.json({
      success: true,
      data: config,
      error: null
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save email settings' },
      { status: 500 }
    );
  }
}
