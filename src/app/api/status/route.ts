// src/app/api/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '@/lib/auth';
import { completionOps } from '../../../lib/database';

export async function GET(req: NextRequest) {
  try {
    const userAddress = await getSessionUser(req);
    if (!userAddress) {
      return unauthorizedResponse();
    }

    const phase1 = completionOps.getPhaseStatus(userAddress, 1);
    const phase2 = completionOps.getPhaseStatus(userAddress, 2);
    const bothComplete = completionOps.hasBothPhases(userAddress);

    return NextResponse.json({
      address: userAddress,
      phase1Complete: !!phase1,
      phase2Complete: !!phase2,
      bothComplete,
      completions: completionOps.getAllCompletions(userAddress),
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      error: 'Failed to get status',
    }, { status: 500 });
  }
}