// src/lib/auth.ts
import { NextRequest } from 'next/server';
import { userOps } from './database';

export async function getSessionUser(req: NextRequest): Promise<string | null> {
  const sessionToken = req.cookies.get('session')?.value;
  
  if (!sessionToken) {
    return null;
  }

  const user = userOps.getBySessionToken(sessionToken);
  return user?.address || null;
}

export function unauthorizedResponse() {
  return Response.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}