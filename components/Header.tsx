'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const [currentDate, setCurrentDate] = useState('Tuesday, 24 Oct');
  const [aiStatus, setAiStatus] = useState<{
    online: boolean;
    label: string;
    sublabel: string;
  }>({
    online: true,
    label: 'Groq AI Active',
    sublabel: 'Groq LLM Active',
  });

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

    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data?.aiStatus) {
          setAiStatus({
            online: Boolean(data.aiStatus.online),
            label: data.aiStatus.label || 'Groq AI Active',
            sublabel: data.aiStatus.sublabel || 'Groq LLM Active',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-18 bg-[#E0E5EC] z-40 px-4 sm:px-8 flex items-center justify-between [box-shadow:0_6px_16px_rgb(163,177,198,0.35)]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl neu-inset-deep flex items-center justify-center text-[#6C63FF]">
            <span className="material-symbols-outlined text-[20px]">domain</span>
          </div>
          <span className="font-display font-bold text-sm text-[#3D4852] tracking-tight">
            Green Valley RWA
          </span>
        </div>

        <div className="h-5 w-[2px] neu-inset-sm rounded-full"></div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          <span>{currentDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* AI Triage Active Pill */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-inset-sm text-xs font-semibold text-[#3D4852]"
          title={aiStatus.sublabel}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus.online ? 'bg-[#38B2AC] animate-pulse' : 'bg-[#ED8936]'
            }`}
          ></span>
          <span>{aiStatus.label}</span>
        </div>

        {/* Resident Portal link button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          <span>Resident Portal</span>
        </Link>

        {/* User avatar */}
        <div className="w-10 h-10 rounded-2xl neu-inset-deep flex items-center justify-center text-[#6C63FF]">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
      </div>
    </header>
  );
};
