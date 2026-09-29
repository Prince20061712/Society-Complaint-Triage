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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/40 z-50 flex flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-space-lg">
        {/* Brand / Logo */}
        <Link href="/dashboard" className="flex items-start gap-space-md px-space-xs group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">apartment</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface leading-tight group-hover:text-primary transition-colors">
              Society Triage
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mt-0.5 tracking-normal">
              Turn complaints into action
            </span>
          </div>
        </Link>

        <div className="h-px bg-outline-variant/30 w-full my-space-xs"></div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-space-md px-3 py-2 rounded-lg transition-all ${
              isDashboard
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
              isComplaints
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-[20px]">inbox</span>
              <span>Complaints</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
              {activeCount}
            </span>
          </Link>

          <Link
            href="/"
            className={`flex items-center gap-space-md px-3 py-2 rounded-lg transition-all ${
              isResident
                ? 'bg-secondary-fixed text-on-secondary-fixed-variant font-semibold shadow-sm'
                : 'font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            <span>Resident Portal</span>
          </Link>
        </nav>
      </div>

      {/* Footer Profile & Society info */}
      <div className="flex flex-col gap-space-md">
        <div className="rounded-lg bg-surface-container-low p-space-md border border-outline-variant/30 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface font-semibold">Green Valley Society</span>
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Wing A-D • 120 Flats</span>
        </div>

        <div className="flex items-center gap-space-sm p-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-label-md text-on-surface truncate">Rajesh Mehta</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" title="Online Secretary Active"></span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">Hon. Secretary</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
