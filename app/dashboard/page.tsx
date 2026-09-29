'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardStats } from '@/components/DashboardStats';
import { ComplaintCard } from '@/components/ComplaintCard';
import { Complaint, ComplaintPriority, DashboardStatsData } from '@/types/complaint';

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

  // Interactive modes from user design
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
      // ALL: show active issues by default
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
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <Sidebar activeCount={activeCount} />

      <div className="pl-64">
        <Header />

        <main className="relative pt-16 w-full min-h-screen bg-background">
          <div className="flex flex-col w-full">
            <div className="p-gutter-lg space-y-gutter-lg max-w-[1440px] mx-auto w-full">
              {/* Alert notification banner if triggered */}
              {alertNotice && (
                <div className="p-space-md rounded-xl bg-primary text-white flex items-center justify-between shadow-md transition-all">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                    <span className="font-label-md">{alertNotice}</span>
                  </div>
                  <button onClick={() => setAlertNotice(null)} className="hover:opacity-80">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              )}

              {/* Header Greeting Section */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-space-sm">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                      Good morning, Committee
                    </h1>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-label-md bg-surface-container-high text-primary">
                      Green Valley RWA
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Here&apos;s what needs your attention today across Wing A, B, C &amp; D.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-space-md">
                  {/* AI Engine Status Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/30">
                    <span className="material-symbols-outlined text-[18px] text-secondary">auto_awesome</span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">AI Triage Engine: Online</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {stats.triagedThisHour} triaged this hour
                    </span>
                  </div>

                  {/* Quick Search & Actions */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                        search
                      </span>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-sm border border-outline-variant/30"
                        placeholder="Search flat, issue, or resident..."
                        type="text"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={fetchDashboardData}
                      className="p-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors shadow-sm border border-outline-variant/30 cursor-pointer"
                      title="Refresh feed"
                      type="button"
                    >
                      <span className={`material-symbols-outlined text-[20px] block ${loading ? 'animate-spin' : ''}`}>
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

              {/* Quick Stats Sparkline & AI Activity Banner */}
              <div className="rounded-xl bg-gradient-to-r from-primary-fixed via-surface-container-lowest to-surface-container-low p-space-md shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Triage Velocity: {stats.velocityPercent}% classified under 45 seconds
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Automatic vendor routing active for Otis Elevators, Mahavir Plumbing &amp; Security Desk
                    </p>
                  </div>
                </div>

                {/* Miniature resolution sparkline */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Avg SLA Response
                    </div>
                    <div className="font-headline-sm text-headline-sm text-on-surface tabular-nums">
                      {stats.avgSlaResponse}
                    </div>
                  </div>
                  <svg className="w-24 h-8 text-primary overflow-visible" fill="none" viewBox="0 0 100 30">
                    <path
                      d="M 0,22 Q 20,28 35,15 T 70,12 T 100,5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    ></path>
                    <circle className="fill-primary" cx="100" cy="5" r="3"></circle>
                  </svg>
                </div>
              </div>

              {/* 'Needs Attention' Queue Section */}
              <div className="space-y-space-md">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Needs Attention</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                      {filteredComplaints.length} Active Issue{filteredComplaints.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="flex items-center gap-space-sm">
                    {/* Triage Mode Toggle */}
                    <button
                      onClick={() => setIsFastTriage(!isFastTriage)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-label-md text-label-md shadow-sm cursor-pointer ${
                        isFastTriage
                          ? 'bg-primary-container text-on-primary-container font-semibold'
                          : 'bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed-dim'
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md cursor-pointer border border-outline-variant/30"
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
                  <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary mx-auto flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">verified</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">No urgent complaints! 🎉</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
                      All emergency items across Wing A-D are either verified resolved or with emergency services.
                      Great job keeping the community secure!
                    </p>
                    <button
                      onClick={() => setIsZeroUrgentMode(false)}
                      className="mt-2 text-primary font-label-md text-label-md hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">undo</span> Restore Full Dashboard View
                    </button>
                  </div>
                )}

                {/* Filter Controls Tray */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
                  {/* Segmented Tab Controls */}
                  <div className="inline-flex p-1 rounded-xl bg-surface-container-low overflow-x-auto shadow-sm border border-outline-variant/30">
                    <button
                      onClick={() => setSelectedTab('ALL')}
                      className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md cursor-pointer transition-all ${
                        selectedTab === 'ALL'
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      All ({activeCount})
                    </button>

                    <button
                      onClick={() => setSelectedTab('URGENT')}
                      className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1.5 cursor-pointer transition-all ${
                        selectedTab === 'URGENT'
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      Urgent ({urgentCount})
                    </button>

                    <button
                      onClick={() => setSelectedTab('HIGH')}
                      className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1.5 cursor-pointer transition-all ${
                        selectedTab === 'HIGH'
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      High ({highCount})
                    </button>

                    <button
                      onClick={() => setSelectedTab('MEDIUM')}
                      className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md cursor-pointer transition-all ${
                        selectedTab === 'MEDIUM'
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Medium ({mediumCount})
                    </button>

                    <button
                      onClick={() => setSelectedTab('LOW')}
                      className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md cursor-pointer transition-all ${
                        selectedTab === 'LOW'
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Low ({lowCount})
                    </button>

                    <button
                      onClick={() => setSelectedTab('RESOLVED')}
                      className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md cursor-pointer transition-all ${
                        selectedTab === 'RESOLVED'
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Resolved ({stats.resolvedToday})
                    </button>
                  </div>

                  {/* Secondary Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Filter */}
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-outline-variant/30">
                      <span className="text-on-surface-variant">Category:</span>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent font-semibold focus:outline-none cursor-pointer text-on-surface"
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
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-outline-variant/30">
                      <span className="text-on-surface-variant">Wing:</span>
                      <select
                        value={selectedWing}
                        onChange={(e) => setSelectedWing(e.target.value)}
                        className="bg-transparent font-semibold focus:outline-none cursor-pointer text-on-surface"
                      >
                        <option value="ALL">All Wings</option>
                        <option value="Wing A">Wing A</option>
                        <option value="Wing B">Wing B</option>
                        <option value="Wing C">Wing C</option>
                        <option value="Wing D">Wing D</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm border border-outline-variant/30">
                      <span className="text-on-surface-variant">Sort:</span>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="bg-transparent font-semibold focus:outline-none cursor-pointer text-on-surface"
                      >
                        <option value="PRIORITY">Priority (Highest first)</option>
                        <option value="NEWEST">Newest first</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Complaints Queue List */}
                <div className={`space-y-space-md ${isZeroUrgentMode ? 'opacity-90' : ''}`} id="complaints-list">
                  {filteredComplaints.length === 0 ? (
                    <div className="rounded-xl bg-surface-container-lowest p-space-2xl text-center shadow-sm border border-outline-variant/30">
                      <span className="material-symbols-outlined text-[36px] text-outline">inbox</span>
                      <p className="mt-2 font-headline-sm text-on-surface">No complaints match the filter</p>
                      <p className="text-body-sm text-on-surface-variant">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter pt-space-xs">
                <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30 flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[22px]">contacts</span>
                  </div>
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-semibold">
                      Emergency Vendor Contacts
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Otis 24x7: 1800-103-6847 • Plumber: #208
                    </div>
                  </div>
                </div>

                <div
                  onClick={handleBroadcast}
                  className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30 flex items-center gap-space-md hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-[22px]">forum</span>
                  </div>
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                      <span>Broadcast WhatsApp Alert</span>
                      <span className="material-symbols-outlined text-[14px] text-secondary">send</span>
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Push notice to Wing A regarding pump repair
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/30 flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary shrink-0">
                    <span className="material-symbols-outlined text-[22px]">history</span>
                  </div>
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-semibold">Audit Trail Logged</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Committee actions recorded with timestamp
                    </div>
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
