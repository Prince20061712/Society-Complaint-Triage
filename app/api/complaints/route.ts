import { NextRequest, NextResponse } from 'next/server';
import { getAllComplaints, saveComplaint } from '@/lib/db';
import { processComplaintTriage } from '@/lib/triage';
import { validateComplaintInput } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const category = searchParams.get('category') || undefined;
    const wing = searchParams.get('wing') || undefined;
    const search = searchParams.get('search') || undefined;

    const complaints = getAllComplaints({ status, priority, category, wing, search });

    return NextResponse.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateComplaintInput(body);

    if (!validation.isValid || !validation.cleaned) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const allExisting = getAllComplaints();
    const triagedData = await processComplaintTriage(validation.cleaned, allExisting);
    const saved = saveComplaint(triagedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Complaint submitted and AI triaged successfully',
        complaint: saved,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
