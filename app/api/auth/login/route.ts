import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, createSessionToken, DEMO_CREDENTIALS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    let matchedUser = null;

    if (
      email === DEMO_CREDENTIALS.RESIDENT.email.toLowerCase() &&
      password === DEMO_CREDENTIALS.RESIDENT.password
    ) {
      matchedUser = DEMO_CREDENTIALS.RESIDENT;
    } else if (
      email === DEMO_CREDENTIALS.COMMITTEE.email.toLowerCase() &&
      password === DEMO_CREDENTIALS.COMMITTEE.password
    ) {
      matchedUser = DEMO_CREDENTIALS.COMMITTEE;
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please select a demo role or check your username/password.' },
        { status: 401 }
      );
    }

    const flatNumber = matchedUser.role === 'RESIDENT' ? DEMO_CREDENTIALS.RESIDENT.flatNumber : undefined;

    const token = await createSessionToken({
      userId: matchedUser.role === 'RESIDENT' ? 'usr-resident-01' : 'usr-committee-01',
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
      flatNumber,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const destination = matchedUser.role === 'COMMITTEE' ? '/dashboard' : '/';

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
        flatNumber,
      },
      destination,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Authentication error' }, { status: 500 });
  }
}
