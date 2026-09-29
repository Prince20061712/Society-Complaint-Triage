import { NextRequest, NextResponse } from 'next/server';
import { getComplaintById, updateComplaint } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const complaint = getComplaintById(id);

    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, complaint });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updateComplaint(id, {
      status: body.status,
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
