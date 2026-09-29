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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full max-w-full">
      {/* URGENT Card */}
      <div
        onClick={() => onSelectPriority?.('URGENT')}
        className={`neu-card p-3.5 sm:p-6 cursor-pointer flex flex-col justify-between group transition-all ${
          activeFilter === 'URGENT' ? 'neu-pressed ring-2 ring-[#E53E3E] ring-offset-2 sm:ring-offset-4 ring-offset-[#E0E5EC]' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="space-y-1 min-w-0">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold neu-inset-sm text-[#C53030]">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E53E3E] animate-pulse"></span>
              URGENT
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-[#3D4852] font-display tabular-nums tracking-tight mt-1 sm:mt-2">
              {urgent}
            </div>
          </div>
          {/* Nested Inset Deep Icon Well */}
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl neu-inset-deep flex items-center justify-center text-[#E53E3E] group-hover:scale-105 transition-transform duration-300 shrink-0">
            <span className="material-symbols-outlined text-[18px] sm:text-[24px]">e911_emergency</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#D1D9E6]/40 flex flex-col gap-0.5">
          <span className="text-xs sm:text-sm font-semibold text-[#3D4852] truncate">Needs immediate attention</span>
          <span className="text-[10px] sm:text-xs font-medium text-[#C53030] truncate">
            {urgent > 0 ? `🚨 ${urgent} Emergency issue${urgent > 1 ? 's' : ''}` : '✨ Zero emergencies'}
          </span>
        </div>
      </div>

      {/* HIGH Card */}
      <div
        onClick={() => onSelectPriority?.('HIGH')}
        className={`neu-card p-3.5 sm:p-6 cursor-pointer flex flex-col justify-between group transition-all ${
          activeFilter === 'HIGH' ? 'neu-pressed ring-2 ring-[#DD6B20] ring-offset-2 sm:ring-offset-4 ring-offset-[#E0E5EC]' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="space-y-1 min-w-0">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold neu-inset-sm text-[#DD6B20]">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ED8936]"></span>
              HIGH
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-[#3D4852] font-display tabular-nums tracking-tight mt-1 sm:mt-2">
              {high}
            </div>
          </div>
          {/* Nested Inset Deep Icon Well */}
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl neu-inset-deep flex items-center justify-center text-[#DD6B20] group-hover:scale-105 transition-transform duration-300 shrink-0">
            <span className="material-symbols-outlined text-[18px] sm:text-[24px]">warning</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#D1D9E6]/40 flex flex-col gap-0.5">
          <span className="text-xs sm:text-sm font-semibold text-[#3D4852] truncate">Requires attention soon</span>
          <span className="text-[10px] sm:text-xs font-medium text-[#6B7280] truncate">💧 Water &amp; Lift issues</span>
        </div>
      </div>

      {/* MEDIUM Card */}
      <div
        onClick={() => onSelectPriority?.('MEDIUM')}
        className={`neu-card p-3.5 sm:p-6 cursor-pointer flex flex-col justify-between group transition-all ${
          activeFilter === 'MEDIUM' ? 'neu-pressed ring-2 ring-[#6C63FF] ring-offset-2 sm:ring-offset-4 ring-offset-[#E0E5EC]' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="space-y-1 min-w-0">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold neu-inset-sm text-[#6C63FF]">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#6C63FF]"></span>
              MEDIUM
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-[#3D4852] font-display tabular-nums tracking-tight mt-1 sm:mt-2">
              {medium}
            </div>
          </div>
          {/* Nested Inset Deep Icon Well */}
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl neu-inset-deep flex items-center justify-center text-[#6C63FF] group-hover:scale-105 transition-transform duration-300 shrink-0">
            <span className="material-symbols-outlined text-[18px] sm:text-[24px]">schedule</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#D1D9E6]/40 flex flex-col gap-0.5">
          <span className="text-xs sm:text-sm font-semibold text-[#3D4852] truncate">Routine issues</span>
          <span className="text-[10px] sm:text-xs font-medium text-[#6B7280] truncate">🚗 Parking &amp; Cleanliness</span>
        </div>
      </div>

      {/* LOW Card */}
      <div
        onClick={() => onSelectPriority?.('LOW')}
        className={`neu-card p-3.5 sm:p-6 cursor-pointer flex flex-col justify-between group transition-all ${
          activeFilter === 'LOW' ? 'neu-pressed ring-2 ring-[#6B7280] ring-offset-2 sm:ring-offset-4 ring-offset-[#E0E5EC]' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="space-y-1 min-w-0">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold neu-inset-sm text-[#6B7280]">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#A0AEC0]"></span>
              LOW
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-[#3D4852] font-display tabular-nums tracking-tight mt-1 sm:mt-2">
              {low}
            </div>
          </div>
          {/* Nested Inset Deep Icon Well */}
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl neu-inset-deep flex items-center justify-center text-[#6B7280] group-hover:scale-105 transition-transform duration-300 shrink-0">
            <span className="material-symbols-outlined text-[18px] sm:text-[24px]">assignment_turned_in</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#D1D9E6]/40 flex flex-col gap-0.5">
          <span className="text-xs sm:text-sm font-semibold text-[#3D4852] truncate">Can be handled later</span>
          <span className="text-[10px] sm:text-xs font-medium text-[#6B7280] truncate">💡 Lighting, garbage, etc.</span>
        </div>
      </div>
    </div>
  );
};
