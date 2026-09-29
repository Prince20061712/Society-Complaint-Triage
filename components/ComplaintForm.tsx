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
      label: 'Lift Emergency',
      text: 'bhai 2nd floor ki lift mein uncle phas gaye hain jaldi dekho please emergency',
      flat: 'B-204',
      name: 'Sunita Kapoor',
    },
    {
      label: 'Water Outage',
      text: 'Wing A me paani nahi aa raha subah se, tank pump band hai kya?',
      flat: 'A-302',
      name: 'Amit Verma',
    },
    {
      label: 'Parking Blocked',
      text: 'Visitor white Creta parked in slot B-105 without guest slip blocking my car',
      flat: 'B-105',
      name: 'Vikram Deshmukh',
    },
    {
      label: 'Electric Spark',
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
    <div className="w-full max-w-2xl mx-auto min-w-0">
      {createdTicket ? (
        <div className="neu-card p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-6 animate-in fade-in w-full overflow-hidden">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl neu-inset-deep text-[#38B2AC] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px] sm:text-[32px]">task_alt</span>
            </div>
            <div className="min-w-0">
              <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full neu-inset-sm text-[#6C63FF] text-[11px] sm:text-xs font-bold">
                AI TRIAGED &amp; LOGGED
              </span>
              <h2 className="font-display font-extrabold text-lg sm:text-2xl text-[#3D4852] mt-0.5 sm:mt-1 truncate">
                Ticket Generated
              </h2>
            </div>
          </div>

          <div className="neu-inset-sm rounded-2xl p-4 sm:p-6 space-y-3.5 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#D1D9E6]/50 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-display font-bold text-base sm:text-lg text-[#6C63FF]">
                  #{createdTicket.ticketNumber}
                </span>
                <PriorityBadge priority={createdTicket.priority} />
              </div>
              <StatusBadge status={createdTicket.status} />
            </div>

            <div>
              <h4 className="font-display font-bold text-sm sm:text-base text-[#3D4852] break-words">{createdTicket.title}</h4>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 leading-relaxed break-words">{createdTicket.summary}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3 text-xs text-[#6B7280] border-t border-[#D1D9E6]/40">
              <div>
                <span className="block font-medium text-[#A0AEC0] text-[10px] sm:text-xs">Category</span>
                <span className="font-bold text-[#3D4852] mt-0.5 block">{createdTicket.category}</span>
              </div>
              <div>
                <span className="block font-medium text-[#A0AEC0] text-[10px] sm:text-xs">Language</span>
                <span className="font-bold text-[#3D4852] mt-0.5 block truncate">🗣️ {createdTicket.language}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block font-medium text-[#A0AEC0] text-[10px] sm:text-xs">Flat &amp; Wing</span>
                <span className="font-bold text-[#3D4852] mt-0.5 block">
                  {createdTicket.flatNumber} ({createdTicket.wing})
                </span>
              </div>
            </div>

            {createdTicket.vendorAlerted && (
              <div className="p-3 sm:p-3.5 rounded-2xl neu-flat flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-[#6C63FF] shrink-0">engineering</span>
                  <span className="text-xs text-[#3D4852] truncate">
                    Assigned: <strong>{createdTicket.vendorAlerted}</strong>
                  </span>
                </div>
                {createdTicket.vendorPhone && (
                  <a
                    href={`tel:${createdTicket.vendorPhone}`}
                    className="text-[#6C63FF] hover:text-[#8B84FF] text-xs font-bold flex items-center gap-1 self-start sm:self-auto min-h-[36px]"
                  >
                    <span className="material-symbols-outlined text-[15px]">call</span>
                    <span>{createdTicket.vendorPhone}</span>
                  </a>
                )}
              </div>
            )}

            {createdTicket.possibleDuplicateTicket && (
              <div className="p-3 sm:p-3.5 rounded-2xl neu-inset-sm text-[#C53030] text-xs flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] shrink-0">content_copy</span>
                <div className="break-words">
                  <strong>Potential duplicate detected:</strong> This issue matches existing ticket{' '}
                  <strong>#{createdTicket.possibleDuplicateTicket}</strong>. The committee has been notified.
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-1">
            <button
              onClick={() => {
                setCreatedTicket(null);
                setMessage('');
              }}
              className="w-full sm:w-1/2 py-3 px-4 neu-btn text-xs font-bold text-[#3D4852] hover:text-[#6C63FF] text-center cursor-pointer min-h-[44px]"
            >
              Submit Another Complaint
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-1/2 py-3 px-4 neu-btn-primary text-xs font-bold text-center flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>View Committee Dashboard</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="neu-card p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-6 w-full overflow-hidden"
        >
          <div className="space-y-1 sm:space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold neu-inset-sm text-[#6C63FF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]"></span>
              RESIDENT COMPLAINT DESK
            </span>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#3D4852] tracking-tight">
              Submit a Society Complaint
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Write naturally in <strong>English, Hindi, or Hinglish</strong>. Our AI engine will auto-triage,
              categorize, and prioritize for the RWA committee.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
              Try quick demo presets:
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl neu-btn text-[11px] sm:text-xs font-bold text-[#3D4852] hover:text-[#6C63FF] cursor-pointer transition-all min-h-[36px]"
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 sm:p-3.5 rounded-2xl neu-inset-sm text-[#C53030] text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#3D4852] mb-1.5 sm:mb-2">Resident Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl neu-input text-xs sm:text-sm placeholder:text-[#A0AEC0] min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4852] mb-1.5 sm:mb-2">
                Flat Number (Wing &amp; Flat)
              </label>
              <input
                required
                type="text"
                placeholder="e.g. A-203 or B-105"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl neu-input text-xs sm:text-sm placeholder:text-[#A0AEC0] min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4852] mb-1.5 sm:mb-2">
              Your Complaint / Issue Details
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. 2nd floor ki lift kal se band hai senior citizens ko problem ho rahi hai..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl neu-input text-xs sm:text-sm placeholder:text-[#A0AEC0] resize-none leading-relaxed"
            ></textarea>
            <span className="text-[11px] sm:text-xs text-[#6B7280] mt-1.5 block">
              Tip: Mention specific location (floor, wing, flat, car number) for faster automated resolution.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 sm:py-4 px-6 neu-btn-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] animate-spin">progress_activity</span>
                <span>AI Triaging &amp; Priority Analyzing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">send</span>
                <span>Submit &amp; Instant AI Triage</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
