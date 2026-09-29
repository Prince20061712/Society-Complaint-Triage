'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ComplaintForm } from '@/components/ComplaintForm';
import { ComplaintCard } from '@/components/ComplaintCard';
import { Complaint } from '@/types/complaint';

export default function ResidentPortalPage() {
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);

  const fetchRecent = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        if (data.complaints) {
          setRecentComplaints(data.complaints.slice(0, 4));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleNewSubmission = (newComp: Complaint) => {
    setRecentComplaints((prev) => [newComp, ...prev.slice(0, 3)]);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Top Header */}
      <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/40 px-gutter-lg flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-space-md">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            <span className="material-symbols-outlined text-[20px]">apartment</span>
          </div>
          <div>
            <span className="font-headline-sm text-sm sm:text-base font-semibold text-on-surface">
              Green Valley Society
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-surface-container-low text-tertiary text-label-sm font-label-sm">
              Wing A-D • 120 Flats
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-md">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-md font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Committee Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-headline-xl text-on-surface tracking-tight">Society Complaint Triage</h1>
          <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
            Report any residential maintenance issue in <strong>English, Hindi, or Hinglish</strong>. The AI triage
            engine immediately routes urgent problems to vendors &amp; committee volunteers.
          </p>
        </div>

        {/* Complaint Form */}
        <ComplaintForm onSubmitted={handleNewSubmission} />

        {/* Recent Society Queue */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">dynamic_feed</span>
              <h3 className="font-headline-sm text-on-surface">Recent Society Complaints</h3>
            </div>
            <Link href="/dashboard" className="text-primary font-label-md hover:underline flex items-center gap-1">
              <span>View all on Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-3">
            {recentComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-16 py-6 border-t border-outline-variant/30 text-center font-body-sm text-on-surface-variant">
        Green Valley Resident Welfare Association • AI Complaint Triage System
      </footer>
    </div>
  );
}
