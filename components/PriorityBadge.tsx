import React from 'react';
import { ComplaintPriority } from '@/types/complaint';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const isSm = size === 'sm';
  const paddingClass = isSm ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';

  switch (priority) {
    case 'URGENT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold neu-inset-sm text-[#C53030] ${paddingClass}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#E53E3E] animate-pulse"></span>
          <span>URGENT</span>
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold neu-inset-sm text-[#DD6B20] ${paddingClass}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#ED8936]"></span>
          <span>HIGH</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold neu-inset-sm text-[#6C63FF] ${paddingClass}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#6C63FF]"></span>
          <span>MEDIUM</span>
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold neu-inset-sm text-[#6B7280] ${paddingClass}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#A0AEC0]"></span>
          <span>LOW</span>
        </span>
      );
  }
};
