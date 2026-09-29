'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ComplaintForm } from '@/components/ComplaintForm';
import { ComplaintCard } from '@/components/ComplaintCard';
import { Complaint } from '@/types/complaint';

export default function ResidentPortalPage() {
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; flatNumber?: string } | null>(null);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);

  const fetchRecent = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        if (data.complaints) {
          setRecentComplaints(data.complaints.slice(0, 6));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecent();

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setCurrentUser(d.user);
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('denied') === 'committee_access_required') {
        setAccessNotice('Committee access required. You have been directed to your Resident Portal.');
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  const handleNewSubmission = (newComp: Complaint) => {
    setRecentComplaints((prev) => [newComp, ...prev.slice(0, 5)]);
  };

  return (
    <div className="min-h-screen bg-[#E0E5EC] text-[#3D4852] font-body antialiased w-full max-w-full overflow-x-clip">
      {/* Top Soft Header */}
      <header className="h-16 sm:h-18 bg-[#E0E5EC] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 [box-shadow:0_6px_16px_rgb(163,177,198,0.35)] w-full">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl neu-inset-deep flex items-center justify-center p-1.5 shrink-0">
            <img src="/logo.png" alt="Society Triage Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-extrabold text-sm sm:text-base text-[#3D4852] tracking-tight truncate block">
              Green Valley Society
            </span>
            <span className="text-[10px] sm:text-xs text-[#6B7280]">
              Resident Portal • Wing A-D
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {currentUser?.role === 'COMMITTEE' && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 neu-btn text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-all min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">dashboard</span>
              <span className="hidden sm:inline">Committee Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          )}

          {currentUser?.role === 'RESIDENT' && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-inset-sm text-xs font-bold text-[#3D4852]">
              <span className="material-symbols-outlined text-[16px] text-[#38B2AC]">home</span>
              <span>Resident {currentUser.flatNumber ? `(${currentUser.flatNumber})` : ''}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 neu-btn text-xs font-bold text-[#E53E3E] hover:text-[#C53030] transition-all min-h-[44px] cursor-pointer"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Access Denied Notice if redirected from Committee route */}
      {accessNotice && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-2xl neu-inset-sm text-xs font-semibold text-[#DD6B20] bg-[#FFFAF0]/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>{accessNotice}</span>
            </div>
            <button
              onClick={() => setAccessNotice(null)}
              className="text-[#6B7280] hover:text-[#3D4852] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-10 w-full min-w-0">
        <div className="text-center space-y-2.5 sm:space-y-3">
          <span className="inline-block px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full neu-inset-sm text-[11px] sm:text-xs font-bold text-[#6C63FF]">
            COMMUNITY FIRST RESIDENT DESK
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#3D4852] tracking-tight">
            Society Complaint Triage
          </h1>
          <p className="text-xs sm:text-base text-[#6B7280] max-w-xl mx-auto leading-relaxed">
            Report any residential maintenance issue in <strong>English, Hindi, or Hinglish</strong>. The AI triage
            engine immediately routes urgent problems to vendors &amp; committee volunteers.
          </p>
        </div>

        {/* Neumorphic Complaint Form */}
        <ComplaintForm onSubmitted={handleNewSubmission} />

        {/* Complaints Queue */}
        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl neu-inset-deep flex items-center justify-center text-[#6C63FF] shrink-0">
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                  {currentUser?.role === 'RESIDENT' ? 'assignment' : 'dynamic_feed'}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#3D4852] tracking-tight">
                {currentUser?.role === 'RESIDENT' ? 'Your Submitted Tickets & Status' : 'Recent Society Complaints'}
              </h3>
            </div>
            {currentUser?.role === 'COMMITTEE' && (
              <Link
                href="/complaints"
                className="text-[#6C63FF] hover:text-[#8B84FF] text-xs font-bold flex items-center gap-1 transition-colors self-start sm:self-auto min-h-[36px]"
              >
                <span>View all on Complaints Register</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentComplaints.length === 0 ? (
              <div className="p-6 rounded-2xl neu-inset-sm text-center text-xs text-[#6B7280]">
                No complaints recorded yet for your flat. Submit your first issue above!
              </div>
            ) : (
              recentComplaints.map((c) => <ComplaintCard key={c.id} complaint={c} />)
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 sm:mt-16 py-6 sm:py-8 text-center text-[11px] sm:text-xs text-[#6B7280]">
        Green Valley Resident Welfare Association • Molded Soft UI Complaint System
      </footer>
    </div>
  );
}

