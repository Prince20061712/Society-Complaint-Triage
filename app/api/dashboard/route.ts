import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    if (session.role !== 'COMMITTEE') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Committee access required' },
        { status: 403 }
      );
    }

    const stats = await getDashboardStats();
    const isGroqConfigured = Boolean(process.env.GROQ_API_KEY);
    return NextResponse.json({
      success: true,
      stats,
      aiStatus: {
        online: isGroqConfigured,
        provider: isGroqConfigured ? 'Groq' : 'Local Fallback',
        label: isGroqConfigured ? 'AI Triage Online' : 'AI Fallback Mode',
        sublabel: isGroqConfigured ? 'Powered by Groq' : 'Local triage active',
        model: isGroqConfigured ? (process.env.GROQ_MODEL || 'openai/gpt-oss-20b') : 'Local Rule Engine',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

