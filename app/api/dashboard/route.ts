import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';

export async function GET() {
  try {
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
