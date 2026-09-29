'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  activeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeCount = 26 }) => {
  const pathname = usePathname();

  const isDashboard = pathname === '/dashboard';
  const isComplaints = pathname.startsWith('/complaints');
  const isResident = pathname === '/';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#E0E5EC] z-50 flex flex-col justify-between py-6 px-5 [box-shadow:6px_0_16px_rgb(163,177,198,0.5)]">
      <div className="flex flex-col gap-6">
        {/* Brand / Logo with Neumorphic Inset Well */}
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

        {/* Navigation */}
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
            href="/dashboard"
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
        {/* Society details card */}
        <div className="neu-inset-sm rounded-2xl p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3D4852]">Green Valley Society</span>
            <span className="w-2 h-2 rounded-full bg-[#38B2AC]"></span>
          </div>
          <span className="text-xs text-[#6B7280]">Wing A-D • 120 Flats</span>
        </div>

        {/* Secretary Profile Pill */}
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
  );
};
