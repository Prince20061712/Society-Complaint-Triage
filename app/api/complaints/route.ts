import { NextRequest, NextResponse } from 'next/server';
import { getAllComplaints, resetDatabaseToDemoData, saveComplaint } from '@/lib/db';
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

    const complaints = await getAllComplaints({ status, priority, category, wing, search });

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

    const allExisting = await getAllComplaints();
    const triagedData = await processComplaintTriage(validation.cleaned, allExisting);
    const saved = await saveComplaint(triagedData);

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

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-key') || request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET;

    // In production on Vercel, guard against unrestricted public resets
    if (process.env.NODE_ENV === 'production' && (!adminSecret || authHeader !== `Bearer ${adminSecret}`)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Demo database reset is restricted in production.' },
        { status: 403 }
      );
    }

    const resetList = await resetDatabaseToDemoData();
    return NextResponse.json({
      success: true,
      message: 'Complaints database reset to curated demo dataset',
      count: resetList.length,
      complaints: resetList,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
