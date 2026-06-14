import { NextRequest, NextResponse } from 'next/server';
import { readMockDb, writeMockDb } from '@/lib/utils/mockDb';
import { createClient } from '@/lib/supabase/server';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function POST(request: NextRequest) {
  try {
    let logsDeleted = 0;
    let reclaimedBytes = 0;
    let remainingLogsCount = 0;

    if (!isSupabaseConfigured()) {
      // 1. Mock DB Pruning Flow
      const db = readMockDb();
      const initialLogsCount = db.webhookLogs?.length || 0;
      
      // Keep only logs from the last 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const filteredLogs = db.webhookLogs.filter(log => {
        const timestamp = new Date(log.created_at).getTime();
        return timestamp >= sevenDaysAgo;
      });

      logsDeleted = initialLogsCount - filteredLogs.length;
      db.webhookLogs = filteredLogs;
      writeMockDb(db);

      // Estimate 1.2 KB per deleted log payload
      reclaimedBytes = logsDeleted * 1240;
      remainingLogsCount = filteredLogs.length;
    } else {
      // 2. Real Supabase Database Pruning Flow
      const supabase = await createClient();
      const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Delete old logs
      const { data, count, error } = await supabase
        .from('webhook_logs')
        .delete({ count: 'exact' })
        .lt('created_at', sevenDaysAgoIso);

      if (error) {
        return NextResponse.json(
          { success: false, error: `Supabase delete failed: ${error.message}` },
          { status: 500 }
        );
      }

      logsDeleted = count || 0;
      reclaimedBytes = logsDeleted * 1240; // Simulated scale estimate

      // Get remaining count
      const { count: remainingCount } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: true });
        
      remainingLogsCount = remainingCount || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        logsDeleted,
        reclaimedBytes,
        remainingLogsCount,
        timestamp: new Date().toISOString(),
      },
      error: null
    });
  } catch (err: any) {
    console.error('Database pruning error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'An internal error occurred during database pruning' },
      { status: 500 }
    );
  }
}
