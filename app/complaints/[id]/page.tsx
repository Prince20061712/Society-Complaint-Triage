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
      <div className="bg-background min-h-screen text-on-surface antialiased flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary font-headline-sm">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span>Loading complaint details...</span>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="bg-background min-h-screen text-on-surface antialiased flex flex-col items-center justify-center gap-4">
        <h2 className="font-headline-md">Complaint ticket not found</h2>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <Sidebar />

      <div className="pl-64">
        <Header />

        <main className="relative pt-16 w-full min-h-screen bg-background">
          <div className="p-gutter-lg max-w-[1200px] mx-auto space-y-6">
            {/* Top Breadcrumbs & Back */}
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Dashboard Queue</span>
              </Link>

              {successMsg && (
                <div className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-label-sm font-semibold animate-in fade-in">
                  ✓ {successMsg}
                </div>
              )}
            </div>

            {/* Main Details Card */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm border border-outline-variant/30 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={complaint.priority} size="md" />
                    <span className="px-2.5 py-0.5 rounded-md font-label-sm text-label-sm bg-surface-container-high text-on-surface font-semibold">
                      {complaint.category}
                    </span>
                    <span className="font-label-md text-on-surface-variant">Ticket #{complaint.ticketNumber}</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface mt-1">{complaint.title}</h1>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={complaint.status} />
                  {complaint.vendorPhone && (
                    <a
                      href={`tel:${complaint.vendorPhone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md hover:bg-error-container/80 transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span>Call Vendor</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Duplicate review alert */}
              {complaint.possibleDuplicateTicket && (
                <div className="p-4 rounded-xl bg-secondary-fixed/50 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[24px]">content_copy</span>
                    <div>
                      <h4 className="font-label-md font-semibold text-on-surface">
                        Potential Duplicate Ticket Detected
                      </h4>
                      <p className="font-body-sm text-on-surface-variant">
                        AI marked this as similar to{' '}
                        <Link
                          href={`/complaints/${complaint.possibleDuplicateTicket.toLowerCase()}`}
                          className="text-primary underline font-bold"
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
                    className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high text-label-sm font-semibold transition-colors border border-outline-variant/40 shrink-0 cursor-pointer"
                  >
                    Confirm &amp; Dismiss Duplicate
                  </button>
                </div>
              )}

              {/* AI Summary and Raw Message */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-surface-container-low p-space-md border border-outline-variant/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <h3 className="font-label-md font-semibold text-on-surface">AI Normalized English Summary</h3>
                  </div>
                  <p className="font-body-md text-on-surface leading-relaxed">{complaint.summary}</p>
                  <div className="pt-2 flex items-center gap-3 text-label-sm text-outline border-t border-outline-variant/30">
                    <span>Language: 🗣️ {complaint.language}</span>
                    <span>•</span>
                    <span>Triage Confidence: {Math.round(complaint.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-low p-space-md border border-outline-variant/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <h3 className="font-label-md font-semibold text-on-surface">Original Resident Message</h3>
                  </div>
                  <blockquote className="italic font-body-md text-on-surface-variant border-l-2 border-primary pl-3 py-1">
                    &ldquo;{complaint.rawMessage}&rdquo;
                  </blockquote>
                  <div className="pt-2 flex items-center gap-3 text-label-sm text-outline border-t border-outline-variant/30">
                    <span>Resident: {complaint.residentName}</span>
                    <span>•</span>
                    <span>Flat {complaint.flatNumber} ({complaint.wing})</span>
                  </div>
                </div>
              </div>

              {/* Status transition controls */}
              <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
                <h3 className="font-label-md font-semibold text-on-surface">Update Complaint Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as ComplaintStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updating || complaint.status === st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-4 py-2 rounded-xl font-label-md transition-all cursor-pointer ${
                        complaint.status === st
                          ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                          : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                      } disabled:opacity-50`}
                    >
                      {st === 'IN_PROGRESS' ? 'IN PROGRESS' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Committee notes & audit log */}
              <div className="space-y-4">
                <h3 className="font-headline-sm text-on-surface">Committee Notes &amp; Audit Trail</h3>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an internal note or vendor update..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:ring-2 focus:ring-primary focus:outline-none font-body-sm"
                  />
                  <button
                    type="submit"
                    disabled={updating || !newNote.trim()}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-label-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                  >
                    Add Note
                  </button>
                </form>

                <div className="space-y-2">
                  {complaint.notes?.map((n, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-surface-container-low text-body-sm text-on-surface flex items-start gap-2 border border-outline-variant/20"
                    >
                      <span className="material-symbols-outlined text-[16px] text-tertiary mt-0.5">sticky_note_2</span>
                      <span>{n}</span>
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
