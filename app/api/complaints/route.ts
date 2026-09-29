import { NextRequest, NextResponse } from 'next/server';
import { getAllComplaints, resetDatabaseToDemoData, saveComplaint } from '@/lib/db';
import { processComplaintTriage } from '@/lib/triage';
import { validateComplaintInput } from '@/lib/validation';
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const category = searchParams.get('category') || undefined;
    const wing = searchParams.get('wing') || undefined;
    const search = searchParams.get('search') || undefined;

    let complaints = await getAllComplaints({ status, priority, category, wing, search });

    // Resident only sees their own complaints
    if (session.role === 'RESIDENT') {
      complaints = complaints.filter(
        (c) =>
          (session.flatNumber && c.flatNumber?.toLowerCase() === session.flatNumber.toLowerCase()) ||
          (session.name && c.residentName?.toLowerCase() === session.name.toLowerCase())
      );
    }

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
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

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
    const session = await getAuthSession(request);
    const authHeader = request.headers.get('x-admin-key') || request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET;

    const hasAdminKey = Boolean(adminSecret && authHeader === `Bearer ${adminSecret}`);
    const isDev = process.env.NODE_ENV !== 'production';

    // In production, require ADMIN_SECRET. In development, require either ADMIN_SECRET or COMMITTEE role.
    if (!hasAdminKey && !(isDev && session?.role === 'COMMITTEE')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Demo database reset is restricted to authorized administrators.' },
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

