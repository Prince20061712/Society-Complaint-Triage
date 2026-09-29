import { NextRequest, NextResponse } from 'next/server';
import { DEMO_CREDENTIALS, UserRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get('role') || '').toUpperCase() as UserRole;

  if (role === 'RESIDENT') {
    return NextResponse.json({
      role: 'RESIDENT',
      email: DEMO_CREDENTIALS.RESIDENT.email,
      password: DEMO_CREDENTIALS.RESIDENT.password,
    });
  }

  if (role === 'COMMITTEE') {
    return NextResponse.json({
      role: 'COMMITTEE',
      email: DEMO_CREDENTIALS.COMMITTEE.email,
      password: DEMO_CREDENTIALS.COMMITTEE.password,
    });
  }

  return NextResponse.json({ error: 'Invalid role requested' }, { status: 400 });
}
