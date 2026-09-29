'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Complaint, ComplaintPriority, ComplaintStatus } from '@/types/complaint';

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/complaints/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaint(data.complaint);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleUpdateStatus = async (status: ComplaintStatus) => {
    if (!complaint) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setComplaint(data.complaint);
        setSuccessMsg(`Status updated to ${status}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePriority = async (priority: ComplaintPriority) => {
    if (!complaint) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      if (res.ok) {
        const data = await res.json();
        setComplaint(data.complaint);
        setSuccessMsg(`Priority updated to ${priority}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !newNote.trim()) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
      });
      if (res.ok) {
        const data = await res.json();
        setComplaint(data.complaint);
        setNewNote('');
        setSuccessMsg('Resolution note added');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDismissDuplicate = async () => {
    if (!complaint) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duplicateResolved: true, note: 'Duplicate review verified & dismissed by committee' }),
      });
      if (res.ok) {
        const data = await res.json();
        setComplaint(data.complaint);
        setSuccessMsg('Duplicate badge cleared');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="flex items-center gap-3 font-display font-bold text-base sm:text-lg text-[#6C63FF]">
            <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
            <span>Loading complaint details...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!complaint) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#3D4852]">Complaint ticket not found</h2>
          <Link
            href="/complaints"
            className="px-5 py-2.5 rounded-2xl neu-btn-primary font-bold text-xs"
          >
            Return to Complaints Register
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6 w-full min-w-0">
        {/* Top Back Link & Feedback */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/complaints"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[#6B7280] hover:text-[#6C63FF] transition-all min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Register</span>
          </Link>

          {successMsg && (
            <div className="px-3.5 py-1.5 rounded-full neu-inset-sm text-[#38B2AC] text-xs font-bold animate-in fade-in">
              ✓ {successMsg}
            </div>
          )}
        </div>

        {/* Main Neumorphic Card */}
        <div className="neu-card p-5 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#D1D9E6]/50">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <PriorityBadge priority={complaint.priority} size="md" />
                <span className="px-3 py-1 rounded-full neu-flat-sm text-xs font-bold text-[#3D4852]">
                  {complaint.category}
                </span>
                <span className="text-xs font-bold text-[#6B7280]">Ticket #{complaint.ticketNumber}</span>
              </div>
              <h1 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-[#3D4852] tracking-tight break-words">
                {complaint.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <StatusBadge status={complaint.status} />
              {complaint.vendorPhone && (
                <a
                  href={`tel:${complaint.vendorPhone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl neu-flat hover:neu-flat-hover text-[#C53030] font-bold text-xs transition-all min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>Call Vendor</span>
                </a>
              )}
            </div>
          </div>

          {/* Duplicate review alert */}
          {complaint.possibleDuplicateTicket && (
            <div className="p-4 sm:p-5 rounded-2xl neu-inset-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl neu-inset-deep text-[#6C63FF] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">content_copy</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#3D4852]">
                    Potential Duplicate Ticket Detected
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-0.5 break-words">
                    AI marked this as similar to{' '}
                    <Link
                      href={`/complaints/${complaint.possibleDuplicateTicket.toLowerCase()}`}
                      className="text-[#6C63FF] hover:underline font-bold"
                    >
                      #{complaint.possibleDuplicateTicket}
                    </Link>{' '}
                    ({complaint.duplicateReason})
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismissDuplicate}
                disabled={updating}
                className="w-full sm:w-auto px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[#3D4852] hover:text-[#6C63FF] transition-all shrink-0 cursor-pointer min-h-[44px]"
              >
                Confirm &amp; Dismiss Duplicate
              </button>
            </div>
          )}

          {/* AI Summary and Raw Message (Stacks vertically on mobile, 2-col on md+) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="neu-inset-sm rounded-2xl p-4 sm:p-6 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#6C63FF]">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">auto_awesome</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D4852]">
                    AI Normalized Summary
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  complaint.processingMode === 'GROQ'
                    ? 'neu-flat-sm text-[#38B2AC]'
                    : 'neu-inset-sm text-[#DD6B20]'
                }`}>
                  {complaint.processingMode === 'GROQ' ? '⚡ Groq AI' : '⚙️ Local Fallback'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#3D4852] leading-relaxed break-words font-medium">{complaint.summary}</p>

              {complaint.aiReasoning && (
                <div className="p-2.5 rounded-xl bg-[#E0E5EC]/60 neu-inset-sm text-xs text-[#3D4852] break-words">
                  <span className="font-bold text-[#6C63FF] block mb-0.5">AI Rationale:</span>
                  <span className="text-[#6B7280]">{complaint.aiReasoning}</span>
                </div>
              )}

              <div className="pt-2.5 sm:pt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#6B7280] border-t border-[#D1D9E6]/40">
                <span>Language: 🗣️ {complaint.language}</span>
                <span>•</span>
                <span>Confidence: {Math.round(complaint.confidence * 100)}%</span>
              </div>
            </div>

            <div className="neu-inset-sm rounded-2xl p-4 sm:p-6 space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2 text-[#6B7280]">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">chat</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D4852]">
                  Original Resident Message
                </h3>
              </div>
              <blockquote className="italic text-xs sm:text-sm text-[#6B7280] border-l-2 border-[#6C63FF] pl-3 py-1 break-words">
                &ldquo;{complaint.rawMessage}&rdquo;
              </blockquote>
              <div className="pt-2.5 sm:pt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#6B7280] border-t border-[#D1D9E6]/40">
                <span>Resident: {complaint.residentName}</span>
                <span>•</span>
                <span>Flat {complaint.flatNumber} ({complaint.wing})</span>
              </div>
            </div>
          </div>

          {/* Committee Priority Override */}
          <div className="p-4 sm:p-6 rounded-2xl neu-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D4852]">
                Committee Priority Override
              </h3>
              <span className="text-[11px] text-[#6B7280]">
                Active: <strong className="text-[#3D4852]">{complaint.priority}</strong>
                {complaint.committeePriority && complaint.aiPriority && complaint.committeePriority !== complaint.aiPriority && (
                  <span className="text-[#6C63FF] font-semibold ml-1">(Adjusted from AI: {complaint.aiPriority})</span>
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as ComplaintPriority[]).map((pr) => (
                <button
                  key={pr}
                  type="button"
                  disabled={updating || complaint.priority === pr}
                  onClick={() => handleUpdatePriority(pr)}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    complaint.priority === pr
                      ? 'neu-pressed text-[#6C63FF] ring-2 ring-[#6C63FF] ring-offset-2 ring-offset-[#E0E5EC]'
                      : 'neu-btn text-[#3D4852] hover:text-[#6C63FF]'
                  } disabled:opacity-50`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>

          {/* Status transition controls */}
          <div className="p-4 sm:p-6 rounded-2xl neu-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D4852]">
              Update Complaint Status
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as ComplaintStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={updating || complaint.status === st}
                  onClick={() => handleUpdateStatus(st)}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                    complaint.status === st
                      ? 'neu-pressed text-[#6C63FF] ring-2 ring-[#6C63FF] ring-offset-2 ring-offset-[#E0E5EC]'
                      : 'neu-btn text-[#3D4852] hover:text-[#6C63FF]'
                  } disabled:opacity-50`}
                >
                  {st === 'IN_PROGRESS' ? 'IN PROGRESS' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Committee notes & audit log */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base sm:text-lg text-[#3D4852]">
              Committee Notes &amp; Audit Trail
            </h3>

            <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <input
                type="text"
                placeholder="Add an internal note or vendor update..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full flex-1 px-4 py-3 rounded-2xl neu-input text-xs sm:text-sm placeholder:text-[#A0AEC0] min-h-[44px]"
              />
              <button
                type="submit"
                disabled={updating || !newNote.trim()}
                className="w-full sm:w-auto px-6 py-3 neu-btn-primary text-xs font-bold disabled:opacity-40 cursor-pointer min-h-[44px] shrink-0"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-2.5 sm:space-y-3">
              {complaint.notes?.map((n, i) => (
                <div
                  key={i}
                  className="p-3 sm:p-4 rounded-2xl neu-inset-sm text-xs text-[#3D4852] flex items-start gap-2.5 sm:gap-3 break-words"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#6C63FF] mt-0.5 shrink-0">sticky_note_2</span>
                  <span className="leading-relaxed flex-1 min-w-0">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
