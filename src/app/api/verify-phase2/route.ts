// src/app/api/verify-phase2/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { PHASE2_ADDRESS, PHASE2_ABI } from '../../../lib/contract';
import { getSessionUser, unauthorizedResponse } from '../../../lib/auth';
import { completionOps } from '../../../lib/database';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export async function POST(req: NextRequest) {
  try {
    const userAddress = await getSessionUser(req);
    if (!userAddress) {
      return unauthorizedResponse();
    }

    // Check Phase 1 completion
    const phase1Complete = completionOps.getPhaseStatus(userAddress, 1);
    if (!phase1Complete) {
      return NextResponse.json({
        success: false,
        message: 'Phase 1 must be completed first',
      }, { status: 403 });
    }

    // Check if already verified
    const existing = completionOps.getPhaseStatus(userAddress, 2);
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Phase 2 already completed',
      });
    }

    const { contractAddress, txHash } = await req.json();

    // Validate inputs
    if (!contractAddress || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid contract address',
      }, { status: 400 });
    }

    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid transaction hash',
      }, { status: 400 });
    }

    // 1. Verify the transaction exists and get deployer
    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    });

    if (!tx) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found',
      }, { status: 400 });
    }

    // 2. Verify the connected wallet deployed the contract
    if (tx.from.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json({
        success: false,
        message: 'Contract was not deployed by your wallet',
      }, { status: 400 });
    }

    // 3. Verify it's a contract deployment (to is null)
    if (tx.to !== null) {
      return NextResponse.json({
        success: false,
        message: 'Transaction is not a contract deployment',
      }, { status: 400 });
    }

    // 4. Get the transaction receipt to verify contract address
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt || !receipt.contractAddress) {
      return NextResponse.json({
        success: false,
        message: 'Contract deployment failed or address not found',
      }, { status: 400 });
    }

    if (receipt.contractAddress.toLowerCase() !== contractAddress.toLowerCase()) {
      return NextResponse.json({
        success: false,
        message: 'Contract address mismatch',
      }, { status: 400 });
    }

    // 5. Check if the contract exploited the vulnerability
    const hasExploited = await publicClient.readContract({
      address: PHASE2_ADDRESS as `0x${string}`,
      abi: PHASE2_ABI,
      functionName: 'checkIfExploited',
      args: [contractAddress as `0x${string}`],
    });

    if (!hasExploited) {
      return NextResponse.json({
        success: false,
        message: 'Contract has not exploited the vulnerability',
      }, { status: 400 });
    }

    // 6. Record completion
    completionOps.recordPhase2(userAddress, txHash, contractAddress.toLowerCase());

    return NextResponse.json({
      success: true,
      message: 'Phase 2 completed! Congratulations!',
    });

  } catch (error) {
    console.error('Phase 2 verification error:', error);
    return NextResponse.json({
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}