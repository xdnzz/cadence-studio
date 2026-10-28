import { NextResponse } from 'next/server';
import { MAX_TRANSCRIPTIONS_PER_DAY } from '@/lib/usagePolicy';
import { transcriptionsRemaining } from '@/lib/usageQuota';

export async function GET() {
  const remaining = await transcriptionsRemaining();
  return NextResponse.json({
    remaining,
    limit: MAX_TRANSCRIPTIONS_PER_DAY,
  });
}
