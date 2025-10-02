// src/app/api/siwe-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { userOps } from '../../../lib/database';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      );
    }

    // Parse and verify SIWE message
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (!fields.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const address = siweMessage.address.toLowerCase();

    // Verify nonce matches
    const user = userOps.getNonce(address);
    if (!user || user.siwe_nonce !== siweMessage.nonce) {
      return NextResponse.json(
        { error: 'Invalid nonce' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    userOps.setSessionToken(address, sessionToken);

    // Set session cookie
    const response = NextResponse.json({ 
      success: true,
      address 
    });

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('SIWE login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}