// src/app/api/flag/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '../../../lib/auth';
import { completionOps } from '../../../lib/database';
import crypto from 'crypto';
import dotenv from 'dotenv'

dotenv.config()


export async function GET(req: NextRequest) {
  try {
    const userAddress = await getSessionUser(req);
    if (!userAddress) {
      return unauthorizedResponse();
    }

    // Verify both phases are completed
    const hasBoth = completionOps.hasBothPhases(userAddress);
    
    if (!hasBoth) {
      return NextResponse.json({
        success: false,
        message: 'Both phases must be completed to receive the flag',
      }, { status: 403 });
    }

    // Get completion details
    const completions = completionOps.getAllCompletions(userAddress);
    
    // Generate personalized flag
    const flag = process.env.FLAG;

    return NextResponse.json({
      success: true,
      flag,
      completions,
      message: 'Congratulations! You have completed both phases of the challenge!',
    });

  } catch (error) {
    console.error('Flag retrieval error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve flag',
    }, { status: 500 });
  }
}