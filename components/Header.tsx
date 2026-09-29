'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const [currentDate, setCurrentDate] = useState('Tuesday, 24 Oct');

  useEffect(() => {
    try {
      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });
      setCurrentDate(today);
    } catch (e) {
      // Fallback
    }
  }, []);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/40 z-40 px-gutter-lg flex items-center justify-between">
      <div className="flex items-center gap-space-lg">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-[18px]">domain</span>
          </div>
          <span className="font-headline-sm text-sm text-on-surface font-semibold tracking-tight">
            Green Valley RWA
          </span>
        </div>

        <div className="h-4 w-px bg-outline-variant/50"></div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">calendar_today</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">{currentDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-space-lg">
        {/* AI Triage Active Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 text-on-surface-variant font-label-sm text-label-sm">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span>AI Triage Active</span>
        </div>

        {/* Resident Portal link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary hover:text-primary-container transition-colors py-1 px-2.5 rounded-lg hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          <span>Resident Portal</span>
        </Link>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
};
