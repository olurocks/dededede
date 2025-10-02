// src/app/api/siwe-nonce/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from 'siwe';
import { userOps } from '../../../lib/database';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    const nonce = generateNonce();
    userOps.createOrUpdateNonce(address.toLowerCase(), nonce);

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}