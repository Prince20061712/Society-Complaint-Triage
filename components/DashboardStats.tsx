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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* URGENT Card */}
      <div
        onClick={() => onSelectPriority?.('URGENT')}
        className={`neu-card p-6 cursor-pointer flex flex-col justify-between group ${
          activeFilter === 'URGENT' ? 'neu-pressed ring-2 ring-[#E53E3E] ring-offset-4 ring-offset-[#E0E5EC]' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold neu-inset-sm text-[#C53030]">
              <span className="w-2 h-2 rounded-full bg-[#E53E3E] animate-pulse"></span>
              URGENT
            </span>
            <div className="text-4xl font-extrabold text-[#3D4852] font-display tabular-nums tracking-tight mt-2">
              {urgent}
            </div>
          </div>
          {/* Nested Inset Deep Icon Well */}
          <div className="w-12 h-12 rounded-2xl neu-inset-deep flex items-center justify-center text-[#E53E3E] group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-[24px]">e911_emergency</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#D1D9E6]/40 flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#3D4852]">Needs immediate attention</span>
          <span className="text-xs font-medium text-[#C53030]">
            {urgent > 0 ? `🚨 ${urgent} Emergency issue${urgent > 1 ? 's' : ''}` : '✨ Zero emergencies'}
          </span>
        </div>
      </div>

      {/* HIGH Card */}
      <div
        onClick={() => onSelectPriority?.('HIGH')}
        className={`neu-card p-6 cursor-pointer flex flex-col justify-between group ${
          activeFilter === 'HIGH' ? 'neu-pressed ring-2 ring-[#DD6B20] ring-offset-4 ring-offset-[#E0E5EC]' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold neu-inset-sm text-[#DD6B20]">
              <span className="w-2 h-2 rounded-full bg-[#ED8936]"></span>
              HIGH
            </span>
            <div className="text-4xl font-extrabold text-[#3D4852] font-display tabular-nums tracking-tight mt-2">
              {high}
            </div>
          </div>
          {/* Nested Inset Deep Icon Well */}
          <div className="w-12 h-12 rounded-2xl neu-inset-deep flex items-center justify-center text-[#DD6B20] group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#D1D9E6]/40 flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#3D4852]">Requires attention soon</span>
          <span className="text-xs font-medium text-[#6B7280]">💧 Water &amp; Lift issues</span>
        </div>
      </div>

      {/* MEDIUM Card */}
      <div
        onClick={() => onSelectPriority?.('MEDIUM')}
        className={`neu-card p-6 cursor-pointer flex flex-col justify-between group ${
          activeFilter === 'MEDIUM' ? 'neu-pressed ring-2 ring-[#6C63FF] ring-offset-4 ring-offset-[#E0E5EC]' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold neu-inset-sm text-[#6C63FF]">
              <span className="w-2 h-2 rounded-full bg-[#6C63FF]"></span>
              MEDIUM
            </span>
            <div className="text-4xl font-extrabold text-[#3D4852] font-display tabular-nums tracking-tight mt-2">
              {medium}
            </div>
          </div>
          {/* Nested Inset Deep Icon Well */}
          <div className="w-12 h-12 rounded-2xl neu-inset-deep flex items-center justify-center text-[#6C63FF] group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-[24px]">schedule</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#D1D9E6]/40 flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#3D4852]">Routine issues</span>
          <span className="text-xs font-medium text-[#6B7280]">🚗 Parking &amp; Cleanliness</span>
        </div>
      </div>

      {/* LOW Card */}
      <div
        onClick={() => onSelectPriority?.('LOW')}
        className={`neu-card p-6 cursor-pointer flex flex-col justify-between group ${
          activeFilter === 'LOW' ? 'neu-pressed ring-2 ring-[#6B7280] ring-offset-4 ring-offset-[#E0E5EC]' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold neu-inset-sm text-[#6B7280]">
              <span className="w-2 h-2 rounded-full bg-[#A0AEC0]"></span>
              LOW
            </span>
            <div className="text-4xl font-extrabold text-[#3D4852] font-display tabular-nums tracking-tight mt-2">
              {low}
            </div>
          </div>
          {/* Nested Inset Deep Icon Well */}
          <div className="w-12 h-12 rounded-2xl neu-inset-deep flex items-center justify-center text-[#6B7280] group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#D1D9E6]/40 flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#3D4852]">Can be handled later</span>
          <span className="text-xs font-medium text-[#6B7280]">💡 Lighting, garbage, etc.</span>
        </div>
      </div>
    </div>
  );
};
