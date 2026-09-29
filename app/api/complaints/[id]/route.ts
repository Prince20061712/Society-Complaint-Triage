import { NextRequest, NextResponse } from 'next/server';
import { getComplaintById, updateComplaint } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const complaint = await getComplaintById(id);

    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    if (session.role === 'RESIDENT') {
      const isOwner =
        (session.flatNumber && complaint.flatNumber?.toLowerCase() === session.flatNumber.toLowerCase()) ||
        (session.name && complaint.residentName?.toLowerCase() === session.name.toLowerCase());
      if (!isOwner) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Residents may only view their own complaints' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, complaint });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        { success: false, error: 'Forbidden: Only committee members can update complaints' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await updateComplaint(id, {
      status: body.status,
      priority: body.priority,
      note: body.note,
      duplicateResolved: body.duplicateResolved,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

