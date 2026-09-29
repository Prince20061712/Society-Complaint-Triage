'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Complaint, ComplaintStatus } from '@/types/complaint';

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
      <div className="bg-[#E0E5EC] min-h-screen text-[#3D4852] font-body flex items-center justify-center">
        <div className="flex items-center gap-3 font-display font-bold text-lg text-[#6C63FF]">
          <span className="material-symbols-outlined animate-spin text-[26px]">progress_activity</span>
          <span>Loading complaint details...</span>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="bg-[#E0E5EC] min-h-screen text-[#3D4852] font-body flex flex-col items-center justify-center gap-4">
        <h2 className="font-display font-extrabold text-2xl text-[#3D4852]">Complaint ticket not found</h2>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-2xl neu-btn-primary font-bold text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#E0E5EC] min-h-screen text-[#3D4852] font-body antialiased">
      <Sidebar />

      <div className="pl-64">
        <Header />

        <main className="relative pt-18 w-full min-h-screen pb-16">
          <div className="p-8 max-w-[1200px] mx-auto space-y-6">
            {/* Top Back Link & Feedback */}
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[#6B7280] hover:text-[#6C63FF] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Dashboard Queue</span>
              </Link>

              {successMsg && (
                <div className="px-4 py-1.5 rounded-full neu-inset-sm text-[#38B2AC] text-xs font-bold animate-in fade-in">
                  ✓ {successMsg}
                </div>
              )}
            </div>

            {/* Main Neumorphic Card */}
            <div className="neu-card p-8 sm:p-10 space-y-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D1D9E6]/50">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <PriorityBadge priority={complaint.priority} size="md" />
                    <span className="px-3.5 py-1 rounded-full neu-flat-sm text-xs font-bold text-[#3D4852]">
                      {complaint.category}
                    </span>
                    <span className="text-xs font-bold text-[#6B7280]">Ticket #{complaint.ticketNumber}</span>
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#3D4852] tracking-tight">
                    {complaint.title}
                  </h1>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={complaint.status} />
                  {complaint.vendorPhone && (
                    <a
                      href={`tel:${complaint.vendorPhone}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl neu-flat hover:neu-flat-hover text-[#C53030] font-bold text-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span>Call Vendor</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Duplicate review alert */}
              {complaint.possibleDuplicateTicket && (
                <div className="p-5 rounded-2xl neu-inset-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl neu-inset-deep text-[#6C63FF] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">content_copy</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#3D4852]">
                        Potential Duplicate Ticket Detected
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">
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
                    className="px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[#3D4852] hover:text-[#6C63FF] transition-all shrink-0 cursor-pointer"
                  >
                    Confirm &amp; Dismiss Duplicate
                  </button>
                </div>
              )}

              {/* AI Summary and Raw Message (Dual Inset Wells) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="neu-inset-sm rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[#6C63FF]">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D4852]">
                      AI Normalized English Summary
                    </h3>
                  </div>
                  <p className="text-sm text-[#3D4852] leading-relaxed">{complaint.summary}</p>
                  <div className="pt-3 flex items-center gap-3 text-xs text-[#6B7280] border-t border-[#D1D9E6]/40">
                    <span>Language: 🗣️ {complaint.language}</span>
                    <span>•</span>
                    <span>Confidence: {Math.round(complaint.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="neu-inset-sm rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D4852]">
                      Original Resident Message
                    </h3>
                  </div>
                  <blockquote className="italic text-sm text-[#6B7280] border-l-2 border-[#6C63FF] pl-3 py-1">
                    &ldquo;{complaint.rawMessage}&rdquo;
                  </blockquote>
                  <div className="pt-3 flex items-center gap-3 text-xs text-[#6B7280] border-t border-[#D1D9E6]/40">
                    <span>Resident: {complaint.residentName}</span>
                    <span>•</span>
                    <span>Flat {complaint.flatNumber} ({complaint.wing})</span>
                  </div>
                </div>
              </div>

              {/* Status transition controls */}
              <div className="p-6 rounded-2xl neu-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D4852]">
                  Update Complaint Status
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as ComplaintStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updating || complaint.status === st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
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
                <h3 className="font-display font-bold text-lg text-[#3D4852]">
                  Committee Notes &amp; Audit Trail
                </h3>

                <form onSubmit={handleAddNote} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Add an internal note or vendor update..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-2xl neu-input text-sm placeholder:text-[#A0AEC0]"
                  />
                  <button
                    type="submit"
                    disabled={updating || !newNote.trim()}
                    className="px-6 py-3 neu-btn-primary text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Add Note
                  </button>
                </form>

                <div className="space-y-3">
                  {complaint.notes?.map((n, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl neu-inset-sm text-xs text-[#3D4852] flex items-start gap-3"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#6C63FF] mt-0.5">sticky_note_2</span>
                      <span className="leading-relaxed">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
