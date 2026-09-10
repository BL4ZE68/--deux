import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getNotifications } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
  }

  return NextResponse.json({ notifications: await getNotifications(user.id) });
}
