'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ComplaintCard } from '@/components/ComplaintCard';
import { Complaint } from '@/types/complaint';

export default function ComplaintsRegisterPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('ALL'); // ALL, URGENT, HIGH, MEDIUM, LOW, RESOLVED, CLOSED
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWing, setSelectedWing] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'PRIORITY' | 'NEWEST' | 'OLDEST'>('PRIORITY');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        if (data.complaints) {
          setComplaints(data.complaints);
        }
      }
    } catch (err) {
      console.error('Failed to load complaints register:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const counts = useMemo(() => {
    return {
      all: complaints.length,
      urgent: complaints.filter((c) => c.priority === 'URGENT' && c.status !== 'RESOLVED' && c.status !== 'CLOSED').length,
      high: complaints.filter((c) => c.priority === 'HIGH' && c.status !== 'RESOLVED' && c.status !== 'CLOSED').length,
      medium: complaints.filter((c) => c.priority === 'MEDIUM' && c.status !== 'RESOLVED' && c.status !== 'CLOSED').length,
      low: complaints.filter((c) => c.priority === 'LOW' && c.status !== 'RESOLVED' && c.status !== 'CLOSED').length,
      resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
      closed: complaints.filter((c) => c.status === 'CLOSED').length,
      unresolvedTotal: complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length,
    };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    let list = [...complaints];

    // Tab filter
    if (selectedTab === 'RESOLVED') {
      list = list.filter((c) => c.status === 'RESOLVED');
    } else if (selectedTab === 'CLOSED') {
      list = list.filter((c) => c.status === 'CLOSED');
    } else if (selectedTab !== 'ALL') {
      list = list.filter((c) => c.priority === selectedTab);
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      list = list.filter((c) => c.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Wing filter
    if (selectedWing !== 'ALL') {
      list = list.filter((c) => c.wing.toLowerCase().includes(selectedWing.toLowerCase()));
    }

    // Search query
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
    } else if (sortOrder === 'OLDEST') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
  }, [complaints, selectedTab, selectedStatus, selectedCategory, selectedWing, searchQuery, sortOrder]);

  return (
    <div className="bg-[#E0E5EC] min-h-screen text-[#3D4852] font-body antialiased">
      <Sidebar activeCount={counts.unresolvedTotal} />

      <div className="pl-64">
        <Header />

        <main className="relative pt-18 w-full min-h-screen pb-16">
          <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-display font-extrabold text-3xl text-[#3D4852] tracking-tight">
                    Complaints Register
                  </h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold neu-inset-sm text-[#6C63FF]">
                    Full Repository
                  </span>
                </div>
                <p className="text-sm text-[#6B7280]">
                  Complete society complaint history, logs, duplicate indicators, and resolution tracking.
                </p>
              </div>

              {/* Action and Search */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0AEC0] text-[18px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-72 pl-10 pr-4 py-2.5 rounded-2xl neu-input text-xs font-medium placeholder:text-[#A0AEC0] focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC]"
                    placeholder="Search ticket #, flat, name, keyword..."
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
                  onClick={fetchComplaints}
                  className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-[#3D4852] hover:text-[#6C63FF] transition-all cursor-pointer"
                  title="Refresh register"
                  type="button"
                >
                  <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                </button>

                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>Command Center</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                onClick={() => setSelectedTab('ALL')}
                className={`neu-card p-4 text-center cursor-pointer transition-all ${
                  selectedTab === 'ALL' ? 'neu-pressed ring-2 ring-[#6C63FF] ring-offset-2 ring-offset-[#E0E5EC]' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Total Complaints</div>
                <div className="font-display font-extrabold text-2xl text-[#3D4852] mt-1">{counts.all}</div>
              </div>

              <div
                onClick={() => setSelectedTab('URGENT')}
                className={`neu-card p-4 text-center cursor-pointer transition-all ${
                  selectedTab === 'URGENT' ? 'neu-pressed ring-2 ring-[#E53E3E] ring-offset-2 ring-offset-[#E0E5EC]' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-[#E53E3E] uppercase tracking-wider">Active Urgent</div>
                <div className="font-display font-extrabold text-2xl text-[#E53E3E] mt-1">{counts.urgent}</div>
              </div>

              <div
                onClick={() => setSelectedTab('HIGH')}
                className={`neu-card p-4 text-center cursor-pointer transition-all ${
                  selectedTab === 'HIGH' ? 'neu-pressed ring-2 ring-[#DD6B20] ring-offset-2 ring-offset-[#E0E5EC]' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-[#DD6B20] uppercase tracking-wider">Active High</div>
                <div className="font-display font-extrabold text-2xl text-[#DD6B20] mt-1">{counts.high}</div>
              </div>

              <div
                onClick={() => setSelectedTab('MEDIUM')}
                className={`neu-card p-4 text-center cursor-pointer transition-all ${
                  selectedTab === 'MEDIUM' ? 'neu-pressed ring-2 ring-[#6C63FF] ring-offset-2 ring-offset-[#E0E5EC]' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-[#6C63FF] uppercase tracking-wider">Medium / Routine</div>
                <div className="font-display font-extrabold text-2xl text-[#3D4852] mt-1">{counts.medium}</div>
              </div>

              <div
                onClick={() => setSelectedTab('LOW')}
                className={`neu-card p-4 text-center cursor-pointer transition-all ${
                  selectedTab === 'LOW' ? 'neu-pressed ring-2 ring-[#6B7280] ring-offset-2 ring-offset-[#E0E5EC]' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Low Severity</div>
                <div className="font-display font-extrabold text-2xl text-[#3D4852] mt-1">{counts.low}</div>
              </div>

              <div
                onClick={() => setSelectedTab('RESOLVED')}
                className={`neu-card p-4 text-center cursor-pointer transition-all ${
                  selectedTab === 'RESOLVED' ? 'neu-pressed ring-2 ring-[#38B2AC] ring-offset-2 ring-offset-[#E0E5EC]' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-[#38B2AC] uppercase tracking-wider">Resolved</div>
                <div className="font-display font-extrabold text-2xl text-[#38B2AC] mt-1">{counts.resolved}</div>
              </div>
            </div>

            {/* Filter Controls Tray */}
            <div className="space-y-4">
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
                    All ({counts.all})
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
                    Urgent
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
                    High
                  </button>

                  <button
                    onClick={() => setSelectedTab('MEDIUM')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === 'MEDIUM'
                        ? 'neu-flat text-[#6C63FF]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    Medium
                  </button>

                  <button
                    onClick={() => setSelectedTab('LOW')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === 'LOW'
                        ? 'neu-flat text-[#6B7280]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    Low
                  </button>

                  <button
                    onClick={() => setSelectedTab('RESOLVED')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === 'RESOLVED'
                        ? 'neu-flat text-[#38B2AC]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    Resolved ({counts.resolved})
                  </button>

                  <button
                    onClick={() => setSelectedTab('CLOSED')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTab === 'CLOSED'
                        ? 'neu-flat text-[#6B7280]'
                        : 'text-[#6B7280] hover:text-[#3D4852]'
                    }`}
                  >
                    Closed
                  </button>
                </div>

                {/* Secondary Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Dropdown */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl neu-flat text-xs font-bold text-[#3D4852]">
                    <span className="text-[#6B7280]">Status:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#3D4852]"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  {/* Category Dropdown */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl neu-flat text-xs font-bold text-[#3D4852]">
                    <span className="text-[#6B7280]">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#3D4852]"
                    >
                      <option value="ALL">All Categories</option>
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

                  {/* Wing Dropdown */}
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
                      <option value="PRIORITY">Priority First</option>
                      <option value="NEWEST">Newest First</option>
                      <option value="OLDEST">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint List Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B7280] px-2">
                <span>Displaying {filteredComplaints.length} complaint tickets</span>
                {filteredComplaints.length > 0 && (
                  <span>Sorted by {sortOrder === 'PRIORITY' ? 'Priority severity' : sortOrder === 'NEWEST' ? 'Most recent' : 'Oldest'}</span>
                )}
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="neu-card p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl neu-inset-deep text-[#6B7280] mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px]">inbox</span>
                  </div>
                  <p className="mt-4 font-display font-bold text-lg text-[#3D4852]">No complaints found</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Try clearing the search query or resetting the filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTab('ALL');
                      setSelectedStatus('ALL');
                      setSelectedCategory('ALL');
                      setSelectedWing('ALL');
                    }}
                    className="mt-4 px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredComplaints.map((item) => (
                  <ComplaintCard key={item.id} complaint={item} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
