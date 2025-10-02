// src/app/api/verify-phase1/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PHASE1_ADDRESS, PHASE1_ABI } from '@/lib/contract';
import { getSessionUser, unauthorizedResponse } from '@/lib/auth';
import { completionOps } from '../../../lib/database';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const userAddress = await getSessionUser(req);
    if (!userAddress) {
      return unauthorizedResponse();
    }

    // Check if already verified
    const existing = completionOps.getPhaseStatus(userAddress, 1);
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Phase 1 already completed',
      });
    }

    // Call contract to verify exploitation
    const hasExploited = await publicClient.readContract({
      address: PHASE1_ADDRESS as `0x${string}`,
      abi: PHASE1_ABI,
      functionName: 'hasExploitedVulnerability',
      args: [userAddress as `0x${string}`],
    });

    if (!hasExploited) {
      return NextResponse.json({
        success: false,
        message: 'Authorization level 5 not reached or exploit not detected',
      }, { status: 400 });
    }

    // Get additional info for confirmation
    const authInfo = await publicClient.readContract({
      address: PHASE1_ADDRESS as `0x${string}`,
      abi: PHASE1_ABI,
      functionName: 'getUserAuthInfo',
      args: [userAddress as `0x${string}`],
    });

    const [isAuthorized, level, , hasExploitedFlag] = authInfo;

    if (!isAuthorized || Number(level) < 5 || !hasExploitedFlag) {
      return NextResponse.json({
        success: false,
        message: 'Exploit verification failed',
        debug: { isAuthorized, level: Number(level), hasExploited: hasExploitedFlag },
      }, { status: 400 });
    }

    // Record completion
    completionOps.recordPhase1(userAddress);

    return NextResponse.json({
      success: true,
      message: 'Phase 1 completed! You may now proceed to Phase 2.',
      level: Number(level),
    });

  } catch (error) {
    console.error('Phase 1 verification error:', error);
    return NextResponse.json({
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}