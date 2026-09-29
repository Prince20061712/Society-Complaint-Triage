import React from 'react';

interface DashboardStatsProps {
  urgent: number;
  high: number;
  medium: number;
  low: number;
  activeFilter?: string;
  onSelectPriority?: (priority: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  urgent,
  high,
  medium,
  low,
  activeFilter,
  onSelectPriority,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
      {/* URGENT Card */}
      <div
        onClick={() => onSelectPriority?.('URGENT')}
        className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
          activeFilter === 'URGENT' ? 'ring-2 ring-error' : ''
        }`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-error-container text-on-error-container">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              URGENT
            </span>
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">{urgent}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-error-container/60 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[20px]">e911_emergency</span>
          </div>
        </div>
        <div className="mt-space-md pt-space-xs flex flex-col gap-0.5">
          <span className="font-label-md text-label-md text-on-surface">Needs immediate attention</span>
          <span className="font-body-sm text-body-sm text-error font-medium">
            {urgent > 0 ? `🚨 ${urgent} Emergency issue${urgent > 1 ? 's' : ''}` : '✨ Zero emergencies'}
          </span>
        </div>
      </div>

      {/* HIGH Card */}
      <div
        onClick={() => onSelectPriority?.('HIGH')}
        className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
          activeFilter === 'HIGH' ? 'ring-2 ring-secondary-container' : ''
        }`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-container"></div>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-fixed-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              HIGH
            </span>
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">{high}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
        </div>
        <div className="mt-space-md pt-space-xs flex flex-col gap-0.5">
          <span className="font-label-md text-label-md text-on-surface">Requires attention soon</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">💧 Water &amp; Lift issues</span>
        </div>
      </div>

      {/* MEDIUM Card */}
      <div
        onClick={() => onSelectPriority?.('MEDIUM')}
        className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
          activeFilter === 'MEDIUM' ? 'ring-2 ring-surface-tint' : ''
        }`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-surface-tint"></div>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface">
              <span className="w-1.5 h-1.5 rounded-full bg-surface-tint"></span>
              MEDIUM
            </span>
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">{medium}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </div>
        </div>
        <div className="mt-space-md pt-space-xs flex flex-col gap-0.5">
          <span className="font-label-md text-label-md text-on-surface">Routine issues</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">🚗 Parking &amp; Cleanliness</span>
        </div>
      </div>

      {/* LOW Card */}
      <div
        onClick={() => onSelectPriority?.('LOW')}
        className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
          activeFilter === 'LOW' ? 'ring-2 ring-outline' : ''
        }`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-outline"></div>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-low text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
              LOW
            </span>
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">{low}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
          </div>
        </div>
        <div className="mt-space-md pt-space-xs flex flex-col gap-0.5">
          <span className="font-label-md text-label-md text-on-surface">Can be handled later</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">💡 Common light bulbs, etc.</span>
        </div>
      </div>
    </div>
  );
};
