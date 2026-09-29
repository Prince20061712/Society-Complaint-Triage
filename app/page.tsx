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
    <div className="min-h-screen bg-[#E0E5EC] text-[#3D4852] font-body antialiased">
      {/* Top Soft Header */}
      <header className="h-18 bg-[#E0E5EC] px-8 flex items-center justify-between sticky top-0 z-40 [box-shadow:0_6px_16px_rgb(163,177,198,0.35)]">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl neu-inset-deep flex items-center justify-center text-[#6C63FF]">
            <span className="material-symbols-outlined text-[24px]">apartment</span>
          </div>
          <div>
            <span className="font-display font-extrabold text-base text-[#3D4852] tracking-tight">
              Green Valley Society
            </span>
            <span className="hidden sm:inline-block ml-3 px-3 py-0.5 rounded-full neu-inset-sm text-[#6B7280] text-xs font-semibold">
              Wing A-D • 120 Flats
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 neu-btn text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Committee Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full neu-inset-sm text-xs font-bold text-[#6C63FF]">
            COMMUNITY FIRST RESIDENT DESK
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#3D4852] tracking-tight">
            Society Complaint Triage
          </h1>
          <p className="text-base text-[#6B7280] max-w-xl mx-auto leading-relaxed">
            Report any residential maintenance issue in <strong>English, Hindi, or Hinglish</strong>. The AI triage
            engine immediately routes urgent problems to vendors &amp; committee volunteers.
          </p>
        </div>

        {/* Neumorphic Complaint Form */}
        <ComplaintForm onSubmitted={handleNewSubmission} />

        {/* Recent Society Queue */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl neu-inset-deep flex items-center justify-center text-[#6C63FF]">
                <span className="material-symbols-outlined text-[20px]">dynamic_feed</span>
              </div>
              <h3 className="font-display font-bold text-xl text-[#3D4852] tracking-tight">
                Recent Society Complaints
              </h3>
            </div>
            <Link
              href="/complaints"
              className="text-[#6C63FF] hover:text-[#8B84FF] text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <span>View all on Complaints Register</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-4">
            {recentComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 text-center text-xs text-[#6B7280]">
        Green Valley Resident Welfare Association • Molded Soft UI Complaint System
      </footer>
    </div>
  );
}
