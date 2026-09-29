'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
  activeCount?: number;
}

export const AppShell: React.FC<AppShellProps> = ({ children, activeCount = 26 }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('Tuesday, 24 Oct');

  useEffect(() => {
    try {
      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      setCurrentDate(today);
    } catch (e) {
      // Fallback
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isDashboard = pathname === '/dashboard';
  const isComplaints = pathname.startsWith('/complaints');
  const isResident = pathname === '/';

  return (
    <div className="bg-[#E0E5EC] min-h-screen text-[#3D4852] font-body w-full max-w-full overflow-x-clip">
      {/* ================= DESKTOP FIXED SIDEBAR (>= 1024px) ================= */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#E0E5EC] z-50 flex-col justify-between py-6 px-5 [box-shadow:6px_0_16px_rgb(163,177,198,0.5)]">
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl neu-inset-deep flex items-center justify-center text-[#6C63FF] shrink-0 group-hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-[24px]">apartment</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg text-[#3D4852] leading-tight tracking-tight group-hover:text-[#6C63FF] transition-colors">
                Society Triage
              </span>
              <span className="text-xs text-[#6B7280] font-medium mt-0.5">
                Turn complaints into action
              </span>
            </div>
          </Link>

          {/* Tactile Divider */}
          <div className="h-[2px] neu-inset-sm w-full my-1 rounded-full"></div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm ${
                isDashboard
                  ? 'neu-pressed text-[#6C63FF] font-bold'
                  : 'text-[#6B7280] hover:text-[#3D4852] hover:neu-flat-sm'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/complaints"
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm ${
                isComplaints
                  ? 'neu-pressed text-[#6C63FF] font-bold'
                  : 'text-[#6B7280] hover:text-[#3D4852] hover:neu-flat-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">inbox</span>
                <span>Complaints</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full neu-inset-sm text-[#C53030] text-xs font-bold">
                {activeCount}
              </span>
            </Link>

            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm ${
                isResident
                  ? 'neu-pressed text-[#6C63FF] font-bold'
                  : 'text-[#6B7280] hover:text-[#3D4852] hover:neu-flat-sm'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
              <span>Resident Portal</span>
            </Link>
          </nav>
        </div>

        {/* Footer Profile & Society info */}
        <div className="flex flex-col gap-4">
          <div className="neu-inset-sm rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3D4852]">Green Valley Society / Committee</span>
              <span className="w-2 h-2 rounded-full bg-[#38B2AC]"></span>
            </div>
            <span className="text-xs text-[#6B7280]">Wing A-D • 120 Flats</span>
          </div>

          <div className="neu-flat-sm p-2 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl neu-inset-deep flex items-center justify-center text-[#6C63FF] shrink-0">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#3D4852] truncate">Rajesh Mehta</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] shrink-0" title="Active"></span>
              </div>
              <span className="text-[11px] text-[#6B7280] truncate">Hon. Secretary</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE DRAWER OVERLAY (< 1024px) ================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#E0E5EC] p-6 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-6">
              {/* Drawer Top Header with Close */}
              <div className="flex items-center justify-between">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl neu-inset-deep flex items-center justify-center text-[#6C63FF] shrink-0">
                    <span className="material-symbols-outlined text-[22px]">apartment</span>
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-base text-[#3D4852] leading-tight block">
                      Society Triage
                    </span>
                    <span className="text-[11px] text-[#6B7280]">Command Center</span>
                  </div>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-[#3D4852] hover:text-[#C53030] cursor-pointer"
                  aria-label="Close navigation"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="h-[2px] neu-inset-sm w-full rounded-full"></div>

              {/* Mobile Drawer Links */}
              <nav className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${
                    isDashboard
                      ? 'neu-pressed text-[#6C63FF] font-bold'
                      : 'text-[#6B7280] hover:text-[#3D4852] hover:neu-flat-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/complaints"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-medium text-sm ${
                    isComplaints
                      ? 'neu-pressed text-[#6C63FF] font-bold'
                      : 'text-[#6B7280] hover:text-[#3D4852] hover:neu-flat-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">inbox</span>
                    <span>Complaints</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full neu-inset-sm text-[#C53030] text-xs font-bold">
                    {activeCount}
                  </span>
                </Link>

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${
                    isResident
                      ? 'neu-pressed text-[#6C63FF] font-bold'
                      : 'text-[#6B7280] hover:text-[#3D4852] hover:neu-flat-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  <span>Resident Portal</span>
                </Link>
              </nav>
            </div>

            {/* Drawer Bottom */}
            <div className="flex flex-col gap-3 pt-6">
              <div className="neu-inset-sm rounded-2xl p-3.5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3D4852]">Green Valley Society / Committee</span>
                  <span className="w-2 h-2 rounded-full bg-[#38B2AC]"></span>
                </div>
                <span className="text-[11px] text-[#6B7280]">Wing A-D • 120 Flats</span>
              </div>

              <div className="neu-flat-sm p-2 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl neu-inset-deep flex items-center justify-center text-[#6C63FF] shrink-0">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-[#3D4852] truncate">Rajesh Mehta</span>
                  <span className="text-[10px] text-[#6B7280] truncate">Hon. Secretary</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESPONSIVE TOP HEADER ================= */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 sm:h-18 bg-[#E0E5EC] z-40 px-4 sm:px-8 flex items-center justify-between [box-shadow:0_6px_16px_rgb(163,177,198,0.35)] w-full max-w-full">
        {/* Left: Hamburger (mobile/tablet) + Logo/Branding */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-[#3D4852] hover:text-[#6C63FF] shrink-0 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl neu-inset-deep flex items-center justify-center text-[#6C63FF] shrink-0">
              <span className="material-symbols-outlined text-[18px]">domain</span>
            </div>
            <span className="font-display font-bold text-xs sm:text-sm text-[#3D4852] tracking-tight truncate">
              Green Valley RWA
            </span>
          </div>

          <div className="hidden md:block h-5 w-[2px] neu-inset-sm rounded-full"></div>

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#6B7280]">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Right: AI Triage Pill + Resident Portal Link + Avatar */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-inset-sm text-xs font-semibold text-[#3D4852]">
            <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse"></span>
            <span>AI Triage Active</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span className="hidden sm:inline">Resident Portal</span>
            <span className="sm:hidden">Portal</span>
          </Link>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl neu-inset-deep flex items-center justify-center text-[#6C63FF] shrink-0">
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">person</span>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="lg:pl-64 pl-0 w-full min-w-0 max-w-full pt-16 sm:pt-18">
        {children}
      </div>
    </div>
  );
};
