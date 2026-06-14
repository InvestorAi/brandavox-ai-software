import { NextRequest, NextResponse } from 'next/server';
import { readMockDb, writeMockDb } from '@/lib/utils/mockDb';

export async function POST() {
  try {
    const db = readMockDb();
    const clients = db.clients || [];
    const config = db.emailMarketingConfig || {
      activeSyncProvider: 'aws_ses',
      authRoute: 'zeptomail',
      transactionalRoute: 'aws_ses',
      marketingRoute: 'alibaba_directmail',
      syncHistory: []
    };

    // Sync all current clients who are not synced yet
    const newLogs: any[] = [];
    clients.forEach((client) => {
      const alreadySynced = config.syncHistory.some(
        (log) => log.email === client.email && log.provider === config.activeSyncProvider
      );

      if (!alreadySynced) {
        const syncLog = {
          id: `sync-${Math.random().toString(36).substring(2, 9)}`,
          email: client.email,
          fullName: client.name,
          provider: config.activeSyncProvider,
          status: 'success' as const,
          timestamp: new Date().toISOString()
        };
        newLogs.push(syncLog);
      }
    });

    config.syncHistory = [...newLogs, ...(config.syncHistory || [])].slice(0, 50);
    db.emailMarketingConfig = config;
    writeMockDb(db);

    return NextResponse.json({
      success: true,
      data: {
        syncedCount: newLogs.length,
        logs: newLogs,
        activeSyncProvider: config.activeSyncProvider
      },
      error: null
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to trigger synchronization' },
      { status: 500 }
    );
  }
}
