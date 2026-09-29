'use client';

import React, { useState } from 'react';
import { Complaint } from '@/types/complaint';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import Link from 'next/link';

interface ComplaintFormProps {
  onSubmitted?: (complaint: Complaint) => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmitted }) => {
  const [residentName, setResidentName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Complaint | null>(null);

  // Quick preset test messages
  const presets = [
    {
      label: 'Lift Emergency (Hinglish)',
      text: 'bhai 2nd floor ki lift mein uncle phas gaye hain jaldi dekho please emergency',
      flat: 'B-204',
      name: 'Sunita Kapoor',
    },
    {
      label: 'Water Outage (Hinglish/English)',
      text: 'Wing A me paani nahi aa raha subah se, tank pump band hai kya?',
      flat: 'A-302',
      name: 'Amit Verma',
    },
    {
      label: 'Parking Blocked (English)',
      text: 'Visitor white Creta parked in slot B-105 without guest slip blocking my car',
      flat: 'B-105',
      name: 'Vikram Deshmukh',
    },
    {
      label: 'Electric Spark (Hinglish)',
      text: 'Meter room me spark ho raha hai aur bohot dhua nikal raha hai',
      flat: 'D-101',
      name: 'Mohan Lal',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentName, flatNumber, message }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      setCreatedTicket(data.complaint);
      onSubmitted?.(data.complaint);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setResidentName(p.name);
    setFlatNumber(p.flat);
    setMessage(p.text);
    setCreatedTicket(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {createdTicket ? (
        <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-md border border-outline-variant/30 space-y-space-lg animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">task_alt</span>
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-label-sm font-label-sm">
                AI TRIAGED &amp; LOGGED
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Complaint Ticket Generated</h2>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low p-space-md border border-outline-variant/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-primary font-bold">Ticket #{createdTicket.ticketNumber}</span>
                <PriorityBadge priority={createdTicket.priority} />
              </div>
              <StatusBadge status={createdTicket.status} />
            </div>

            <div>
              <h4 className="font-headline-sm text-on-surface">{createdTicket.title}</h4>
              <p className="font-body-md text-on-surface-variant mt-1">{createdTicket.summary}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-body-sm text-on-surface-variant border-t border-outline-variant/20">
              <div>
                <span className="block font-label-sm text-outline">Category</span>
                <span className="font-semibold text-on-surface">{createdTicket.category}</span>
              </div>
              <div>
                <span className="block font-label-sm text-outline">Language Detected</span>
                <span className="font-semibold text-on-surface">🗣️ {createdTicket.language}</span>
              </div>
              <div>
                <span className="block font-label-sm text-outline">Flat &amp; Wing</span>
                <span className="font-semibold text-on-surface">
                  {createdTicket.flatNumber} ({createdTicket.wing})
                </span>
              </div>
            </div>

            {createdTicket.vendorAlerted && (
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">engineering</span>
                  <span className="font-label-md text-on-surface">
                    Assigned Vendor: <strong>{createdTicket.vendorAlerted}</strong>
                  </span>
                </div>
                {createdTicket.vendorPhone && (
                  <a
                    href={`tel:${createdTicket.vendorPhone}`}
                    className="text-primary font-label-sm hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    <span>{createdTicket.vendorPhone}</span>
                  </a>
                )}
              </div>
            )}

            {createdTicket.possibleDuplicateTicket && (
              <div className="p-2.5 rounded-lg bg-error-container/40 border border-error/30 text-on-error-container text-body-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-error shrink-0">content_copy</span>
                <div>
                  <strong>Potential duplicate detected:</strong> This issue matches existing ticket{' '}
                  <strong>#{createdTicket.possibleDuplicateTicket}</strong>. The committee has been notified to group
                  them.
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                setCreatedTicket(null);
                setMessage('');
              }}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-md transition-colors text-center cursor-pointer"
            >
              Submit Another Complaint
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-primary-container text-on-primary-container hover:opacity-90 font-label-md font-semibold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>View Committee Dashboard</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-md border border-outline-variant/30 space-y-space-md"
        >
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              RESIDENT COMPLAINT DESK
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Submit a Society Complaint</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Write naturally in <strong>English, Hindi, or Hinglish</strong>. Our AI engine will auto-triage,
              categorize, and prioritize for the RWA committee.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="font-label-sm text-outline uppercase tracking-wider block">Try quick demo presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm border border-outline-variant/40 transition-colors cursor-pointer"
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-2">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Resident Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Flat Number (Wing &amp; Flat)
              </label>
              <input
                required
                type="text"
                placeholder="e.g. A-203 or B-105"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Your Complaint / Issue Details
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. 2nd floor ki lift kal se band hai senior citizens ko problem ho rahi hai..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:ring-2 focus:ring-primary focus:outline-none resize-none font-body-md"
            ></textarea>
            <span className="text-body-sm text-outline mt-1 block">
              Tip: Mention specific location (floor, wing, flat, car number) for faster automated resolution.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-primary-container text-on-primary-container hover:opacity-90 font-label-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                <span>AI Triaging &amp; Priority Analyzing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">send</span>
                <span>Submit &amp; Instant AI Triage</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
