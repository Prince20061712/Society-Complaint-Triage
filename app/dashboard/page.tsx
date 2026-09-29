'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardStats } from '@/components/DashboardStats';
import { ComplaintCard } from '@/components/ComplaintCard';
import { Complaint, DashboardStatsData } from '@/types/complaint';

export default function DashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStatsData>({
    totalActive: 26,
    urgent: 2,
    high: 5,
    medium: 11,
    low: 8,
    resolvedToday: 42,
    avgSlaResponse: '18m 40s',
    triagedThisHour: 4,
    velocityPercent: 94,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('ALL'); // ALL, URGENT, HIGH, MEDIUM, LOW, RESOLVED
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWing, setSelectedWing] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'PRIORITY' | 'NEWEST'>('PRIORITY');

  // Interactive modes
  const [isFastTriage, setIsFastTriage] = useState(false);
  const [isZeroUrgentMode, setIsZeroUrgentMode] = useState(false);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

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

  // Filtered and sorted complaints
  const filteredComplaints = useMemo(() => {
    let list = [...complaints];

    // Zero urgent preview simulation
    if (isZeroUrgentMode) {
      list = list.filter((c) => c.priority !== 'URGENT');
    }

    // Tab filter
    if (selectedTab === 'RESOLVED') {
      list = list.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');
    } else if (selectedTab !== 'ALL') {
      list = list.filter(
        (c) => c.priority === selectedTab && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')
      );
    } else {
      list = list.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Wing filter
    if (selectedWing !== 'ALL') {
      list = list.filter((c) => c.wing.toLowerCase().includes(selectedWing.toLowerCase()));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.ticketNumber.toLowerCase().includes(q) ||
          c.residentName.toLowerCase().includes(q) ||
          c.flatNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.rawMessage.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortOrder === 'NEWEST') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      const priorityWeight: Record<string, number> = {
        URGENT: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };
      list.sort((a, b) => {
        const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return list;
  }, [complaints, selectedTab, selectedCategory, selectedWing, searchQuery, sortOrder, isZeroUrgentMode]);

  const activeCount = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  const urgentCount = isZeroUrgentMode ? 0 : complaints.filter((c) => c.priority === 'URGENT' && c.status === 'OPEN').length;
  const highCount = complaints.filter((c) => c.priority === 'HIGH' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;
  const mediumCount = complaints.filter((c) => c.priority === 'MEDIUM' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;
  const lowCount = complaints.filter((c) => c.priority === 'LOW' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;

  const handleBroadcast = () => {
    setAlertNotice('WhatsApp alert broadcast queued to Wing A residents regarding water pump repair.');
    setTimeout(() => setAlertNotice(null), 5000);
  };

  return (
    <div className="bg-[#E0E5EC] min-h-screen text-[#3D4852] font-body antialiased">
      <Sidebar activeCount={activeCount} />

      <div className="pl-64">
        <Header />

        <main className="relative pt-18 w-full min-h-screen pb-16">
          <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">
            {/* Alert notification banner if triggered */}
            {alertNotice && (
              <div className="p-4 rounded-2xl neu-flat text-[#3D4852] flex items-center justify-between transition-all animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl neu-inset-deep flex items-center justify-center text-[#38B2AC]">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </div>
                  <span className="text-sm font-semibold">{alertNotice}</span>
                </div>
                <button onClick={() => setAlertNotice(null)} className="neu-btn p-1.5 hover:text-[#E53E3E]">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            )}

            {/* Header Greeting Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-display font-extrabold text-3xl text-[#3D4852] tracking-tight">
                    Good morning, Committee
                  </h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold neu-inset-sm text-[#6C63FF]">
                    Green Valley RWA
                  </span>
                </div>
                <p className="text-sm text-[#6B7280]">
                  Here&apos;s what needs your attention today across Wing A, B, C &amp; D.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* AI Engine Status Pill */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl neu-inset-sm">
                  <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">auto_awesome</span>
                  <span className="text-xs font-bold text-[#3D4852]">AI Triage Engine: Online</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-[#38B2AC]"></span>
                  <span className="text-xs text-[#6B7280]">
                    {stats.triagedThisHour} triaged this hour
                  </span>
                </div>

                {/* Quick Search & Actions */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0AEC0] text-[18px]">
                      search
                    </span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-68 pl-10 pr-4 py-2.5 rounded-2xl neu-input text-xs font-medium placeholder:text-[#A0AEC0] focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC]"
                      placeholder="Search flat, issue, or resident..."
                      type="text"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#3D4852]"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={fetchDashboardData}
                    className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-[#3D4852] hover:text-[#6C63FF] transition-all cursor-pointer"
                    title="Refresh feed"
                    type="button"
                  >
                    <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Priority Summary Cards (Grid of 4) */}
            <DashboardStats
              urgent={urgentCount}
              high={highCount}
              medium={mediumCount}
              low={lowCount}
              activeFilter={selectedTab}
              onSelectPriority={(p) => setSelectedTab(p === selectedTab ? 'ALL' : p)}
            />

            {/* Quick Stats Sparkline & AI Activity Banner (Sculpted Neumorphic Card) */}
            <div className="neu-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl neu-inset-deep text-[#6C63FF] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[26px]">smart_toy</span>
                </div>
                <div>
                  <span className="text-base font-bold font-display text-[#3D4852]">
                    Triage Velocity: {stats.velocityPercent}% classified under 45 seconds
                  </span>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Automatic vendor routing active for Otis Elevators, Mahavir Plumbing &amp; Security Desk
                  </p>
                </div>
              </div>

              {/* Miniature resolution sparkline */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Avg SLA Response
                  </div>
                  <div className="text-lg font-extrabold text-[#3D4852] font-display tabular-nums">
                    {stats.avgSlaResponse}
                  </div>
                </div>
                <div className="p-2 rounded-2xl neu-inset-sm flex items-center justify-center">
                  <svg className="w-24 h-7 text-[#6C63FF] overflow-visible" fill="none" viewBox="0 0 100 30">
                    <path
                      d="M 0,22 Q 20,28 35,15 T 70,12 T 100,5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    ></path>
                    <circle className="fill-[#6C63FF]" cx="100" cy="5" r="3.5"></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* 'Needs Attention' Queue Section */}
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-extrabold text-2xl text-[#3D4852] tracking-tight">
                    Needs Attention
                  </h2>
                  <span className="px-3 py-1 rounded-full neu-inset-sm text-xs font-bold text-[#C53030]">
                    {filteredComplaints.length} Active Issue{filteredComplaints.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Triage Mode Toggle */}
                  <button
                    onClick={() => setIsFastTriage(!isFastTriage)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all text-xs font-bold cursor-pointer ${
                      isFastTriage
                        ? 'neu-btn-primary'
                        : 'neu-btn text-[#6C63FF]'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isFastTriage ? 'done_all' : 'bolt'}
                    </span>
                    <span>{isFastTriage ? 'Fast-Triage Active' : 'Triage Mode'}</span>
                  </button>

                  {/* Demo Zero Urgent Button */}
                  <button
                    onClick={() => setIsZeroUrgentMode(!isZeroUrgentMode)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isZeroUrgentMode
                        ? 'neu-pressed text-[#38B2AC]'
                        : 'neu-btn text-[#3D4852]'
                    }`}
                    title="Preview zero urgent state"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">celebration</span>
                    <span>{isZeroUrgentMode ? 'Exit Zero Demo' : 'Demo Zero Urgent'}</span>
                  </button>
                </div>
              </div>

              {/* Live Zero Urgent Banner (When triggered) */}
              {isZeroUrgentMode && (
                <div className="neu-card p-8 text-center space-y-3 animate-in fade-in">
                  <div className="w-14 h-14 rounded-2xl neu-inset-deep text-[#38B2AC] mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px]">verified</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-[#3D4852]">No urgent complaints! 🎉</h3>
                  <p className="text-sm text-[#6B7280] max-w-md mx-auto">
                    All emergency items across Wing A-D are either verified resolved or with emergency services.
                    Great job keeping the community secure!
                  </p>
                  <button
                    onClick={() => setIsZeroUrgentMode(false)}
                    className="mt-2 text-[#6C63FF] hover:text-[#8B84FF] text-xs font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">undo</span> Restore Full Dashboard View
                  </button>
                </div>
              )}

              {/* Filter Controls Tray */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Segmented Tab Controls */}
                <div className="inline-flex p-1.5 rounded-2xl neu-inset-sm overflow-x-auto gap-1">
                  <button
                    onClick={() => setSelectedTab('ALL')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === 'ALL'
                        ? 'neu-flat text-[#6C63FF]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    All ({activeCount})
                  </button>

                  <button
                    onClick={() => setSelectedTab('URGENT')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedTab === 'URGENT'
                        ? 'neu-flat text-[#C53030]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#E53E3E]"></span>
                    Urgent ({urgentCount})
                  </button>

                  <button
                    onClick={() => setSelectedTab('HIGH')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedTab === 'HIGH'
                        ? 'neu-flat text-[#DD6B20]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#ED8936]"></span>
                    High ({highCount})
                  </button>

                  <button
                    onClick={() => setSelectedTab('MEDIUM')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === 'MEDIUM'
                        ? 'neu-flat text-[#6C63FF]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    Medium ({mediumCount})
                  </button>

                  <button
                    onClick={() => setSelectedTab('LOW')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === 'LOW'
                        ? 'neu-flat text-[#6B7280]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    Low ({lowCount})
                  </button>

                  <button
                    onClick={() => setSelectedTab('RESOLVED')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === 'RESOLVED'
                        ? 'neu-flat text-[#38B2AC]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    Resolved ({stats.resolvedToday})
                  </button>
                </div>

                {/* Secondary Filter Pills */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Category Filter */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl neu-flat text-xs font-bold text-[#3D4852]">
                    <span className="text-[#6B7280]">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#3D4852]"
                    >
                      <option value="ALL">All</option>
                      <option value="WATER">Water</option>
                      <option value="LIFT">Lift</option>
                      <option value="ELECTRICITY">Electricity</option>
                      <option value="PARKING">Parking</option>
                      <option value="CLEANING">Cleaning</option>
                      <option value="NOISE">Noise</option>
                      <option value="SECURITY">Security</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Wing Filter */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl neu-flat text-xs font-bold text-[#3D4852]">
                    <span className="text-[#6B7280]">Wing:</span>
                    <select
                      value={selectedWing}
                      onChange={(e) => setSelectedWing(e.target.value)}
                      className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#3D4852]"
                    >
                      <option value="ALL">All Wings</option>
                      <option value="Wing A">Wing A</option>
                      <option value="Wing B">Wing B</option>
                      <option value="Wing C">Wing C</option>
                      <option value="Wing D">Wing D</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl neu-flat text-xs font-bold text-[#3D4852]">
                    <span className="text-[#6B7280]">Sort:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#3D4852]"
                    >
                      <option value="PRIORITY">Priority (Highest first)</option>
                      <option value="NEWEST">Newest first</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Complaints Queue List */}
              <div className="space-y-5" id="complaints-list">
                {filteredComplaints.length === 0 ? (
                  <div className="neu-card p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl neu-inset-deep text-[#6B7280] mx-auto flex items-center justify-center">
                      <span className="material-symbols-outlined text-[32px]">inbox</span>
                    </div>
                    <p className="mt-4 font-display font-bold text-lg text-[#3D4852]">No complaints match the filter</p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Try switching category or clearing the search bar.
                    </p>
                  </div>
                ) : (
                  filteredComplaints.map((item) => (
                    <ComplaintCard key={item.id} complaint={item} />
                  ))
                )}
              </div>
            </div>

            {/* Estate Summary Bottom Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="neu-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl neu-inset-deep text-[#6C63FF] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">contacts</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#3D4852]">
                    Emergency Vendor Contacts
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Otis 24x7: 1800-103-6847 • Plumber: #208
                  </div>
                </div>
              </div>

              <div
                onClick={handleBroadcast}
                className="neu-card p-5 flex items-center gap-4 hover:translate-y-[-2px] transition-transform cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl neu-inset-deep text-[#38B2AC] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">forum</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#3D4852] flex items-center gap-1.5">
                    <span>Broadcast WhatsApp Alert</span>
                    <span className="material-symbols-outlined text-[14px] text-[#38B2AC]">send</span>
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Push notice to Wing A regarding pump repair
                  </div>
                </div>
              </div>

              <div className="neu-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl neu-inset-deep text-[#6B7280] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">history</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#3D4852]">Audit Trail Logged</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    Committee actions recorded with timestamp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
