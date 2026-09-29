'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { DashboardStats } from '@/components/DashboardStats';
import { ComplaintCard } from '@/components/ComplaintCard';
import { Complaint, DashboardStatsData } from '@/types/complaint';

export default function DashboardCommandCenterPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStatsData>({
    totalActive: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isFastTriage, setIsFastTriage] = useState(false);
  const [isZeroUrgentMode, setIsZeroUrgentMode] = useState(false);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ online: boolean; label: string; sublabel: string; provider: string }>({
    online: true,
    label: 'AI Triage Online',
    sublabel: 'Powered by Groq',
    provider: 'Groq',
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resComplaints, resStats] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/dashboard'),
      ]);

      if (resComplaints.ok) {
        const data = await resComplaints.json();
        if (data.complaints) {
          setComplaints(data.complaints);
        }
      }

      if (resStats.ok) {
        const data = await resStats.json();
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.aiStatus) {
          setAiStatus(data.aiStatus);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Focused "Needs Attention Right Now" queue: top critical tickets
  const needsAttentionQueue = useMemo(() => {
    let active = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS');

    if (isZeroUrgentMode) {
      active = active.filter((c) => c.priority !== 'URGENT');
    }

    const priorityWeight: Record<string, number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    active.sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return active.slice(0, 4);
  }, [complaints, isZeroUrgentMode]);

  const activeCount = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  const urgentCount = isZeroUrgentMode ? 0 : complaints.filter((c) => c.priority === 'URGENT' && c.status === 'OPEN').length;
  const highCount = complaints.filter((c) => c.priority === 'HIGH' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;
  const mediumCount = complaints.filter((c) => c.priority === 'MEDIUM' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;
  const lowCount = complaints.filter((c) => c.priority === 'LOW' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  const handleBroadcast = () => {
    setAlertNotice('Demo Simulation: WhatsApp alert broadcast queued to Wing A residents regarding water pump repair.');
    setTimeout(() => setAlertNotice(null), 5000);
  };

  return (
    <AppShell activeCount={activeCount}>
      <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1440px] mx-auto w-full min-w-0">
        {/* Alert notification banner */}
        {alertNotice && (
          <div className="p-3.5 sm:p-4 rounded-2xl neu-flat text-[#3D4852] flex items-center justify-between transition-all animate-in fade-in">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl neu-inset-deep flex items-center justify-center text-[#38B2AC] shrink-0">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold truncate">{alertNotice}</span>
            </div>
            <button onClick={() => setAlertNotice(null)} className="neu-btn p-1.5 hover:text-[#E53E3E] shrink-0 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Header Greeting & Command Center Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#3D4852] tracking-tight">
                Committee Command Center
              </h1>
              <span className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold neu-inset-sm text-[#6C63FF]">
                Active Triage
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              What needs attention right now across Green Valley Society (Wing A, B, C &amp; D).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* AI Engine Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl neu-inset-sm text-xs">
              <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-[#6C63FF]">auto_awesome</span>
              <span className="font-bold text-[#3D4852]">{aiStatus.label}</span>
              <span className={`inline-block w-2 h-2 rounded-full ${aiStatus.online ? 'bg-[#38B2AC] animate-pulse' : 'bg-[#DD6B20]'}`}></span>
              <span className="text-[#6B7280] hidden sm:inline">
                {aiStatus.sublabel}
              </span>
            </div>

            {/* Refresh and View Register Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchDashboardData}
                className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-[#3D4852] hover:text-[#6C63FF] transition-all cursor-pointer shrink-0"
                title="Refresh command center"
                type="button"
              >
                <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>

              <Link
                href="/complaints"
                className="px-3.5 sm:px-4 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-all flex items-center gap-1.5 shrink-0 min-h-[44px]"
              >
                <span className="material-symbols-outlined text-[18px]">inbox</span>
                <span>Full Register ({activeCount})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Priority Summary Cards (Grid of 2 on mobile, 4 on desktop) */}
        <DashboardStats
          urgent={urgentCount}
          high={highCount}
          medium={mediumCount}
          low={lowCount}
        />

        {/* Concise 'Needs Attention Right Now' Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#3D4852] tracking-tight">
                Needs Attention Right Now
              </h2>
              <span className="px-2.5 py-0.5 rounded-full neu-inset-sm text-xs font-bold text-[#C53030]">
                Top Priority
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Triage Mode Toggle (Clearly marked demo) */}
              <button
                onClick={() => setIsFastTriage(!isFastTriage)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl transition-all text-xs font-bold cursor-pointer min-h-[44px] ${isFastTriage
                    ? 'neu-btn-primary'
                    : 'neu-btn text-[#6C63FF]'
                  }`}
                type="button"
                title="Demo simulation toggle for fast triage"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                  {isFastTriage ? 'done_all' : 'bolt'}
                </span>
                <span>{isFastTriage ? 'Fast-Triage (Demo)' : 'Triage Mode: Review'}</span>
              </button>

              {/* Demo Zero Urgent Button (Clearly marked demo) */}
              <button
                onClick={() => setIsZeroUrgentMode(!isZeroUrgentMode)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${isZeroUrgentMode
                    ? 'neu-pressed text-[#38B2AC]'
                    : 'neu-btn text-[#3D4852]'
                  }`}
                title="Simulated preview of zero-urgent state"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">celebration</span>
                <span>{isZeroUrgentMode ? 'Exit Demo Preview' : 'Demo Preview: Zero-Urgent'}</span>
              </button>

              {/* View All Complaints link */}
              <Link
                href="/complaints"
                className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl neu-btn text-xs font-bold text-[#3D4852] hover:text-[#6C63FF] transition-all min-h-[44px]"
              >
                <span>Full Register</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Live Zero Urgent Banner (When triggered) */}
          {isZeroUrgentMode && (
            <div className="neu-card p-6 sm:p-8 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl neu-inset-deep text-[#38B2AC] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] sm:text-[32px]">verified</span>
              </div>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#3D4852]">No urgent complaints! 🎉</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto">
                All emergency items across Wing A-D are either verified resolved or with emergency services.
                Great job keeping the community secure!
              </p>
              <button
                onClick={() => setIsZeroUrgentMode(false)}
                className="mt-2 text-[#6C63FF] hover:text-[#8B84FF] text-xs font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">undo</span> Restore Command Queue
              </button>
            </div>
          )}

          {/* Focused Priority Action Queue */}
          <div className="space-y-3 sm:space-y-4">
            {needsAttentionQueue.length === 0 ? (
              <div className="neu-card p-6 sm:p-10 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl neu-inset-deep text-[#38B2AC] mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px] sm:text-[28px]">done_all</span>
                </div>
                <p className="mt-3 font-display font-bold text-sm sm:text-base text-[#3D4852]">
                  No urgent or high-priority complaints pending right now.
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Check the full register for routine or in-progress tickets.
                </p>
                <Link
                  href="/complaints"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[#6C63FF] min-h-[44px]"
                >
                  <span>Browse Full Register</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            ) : (
              needsAttentionQueue.map((item) => (
                <ComplaintCard key={item.id} complaint={item} />
              ))
            )}
          </div>

          {/* Bottom Jump-to-Register Banner */}
          <div className="neu-card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl neu-inset-deep text-[#6C63FF] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-[#3D4852]">Looking for other complaints?</h4>
                <p className="text-[11px] sm:text-xs text-[#6B7280] truncate sm:whitespace-normal">
                  Search and manage all {activeCount} active and {resolvedCount} resolved complaints with category, status, and wing filters.
                </p>
              </div>
            </div>

            <Link
              href="/complaints"
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-all flex items-center justify-center gap-1.5 shrink-0 min-h-[44px]"
            >
              <span>Open Complaints Register</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Estate Summary Bottom Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          <div className="neu-card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset-deep text-[#6C63FF] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">contacts</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#3D4852]">Emergency Vendor Contacts</div>
              <div className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 truncate">
                Otis 24x7: 1800-103-6847 • Plumber: #208
              </div>
            </div>
          </div>

          <div
            onClick={handleBroadcast}
            className="neu-card p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:translate-y-[-2px] transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset-deep text-[#38B2AC] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">forum</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#3D4852] flex items-center gap-1.5">
                <span>Broadcast WhatsApp Alert</span>
                <span className="material-symbols-outlined text-[14px] text-[#38B2AC]">send</span>
              </div>
              <div className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 truncate">
                Push notice to Wing A regarding pump repair
              </div>
            </div>
          </div>

          <div className="neu-card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset-deep text-[#6B7280] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">history</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#3D4852]">Audit Trail Logged</div>
              <div className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 truncate">
                Committee actions recorded with timestamp
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
