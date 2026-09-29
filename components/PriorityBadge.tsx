import React from 'react';
import { ComplaintPriority } from '@/types/complaint';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-error-container text-on-error-container animate-pulse ${
            size === 'sm' ? 'px-2.5 py-0.5 text-label-sm font-label-sm' : 'px-3 py-1 text-label-md font-label-md'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">warning</span>
          <span>URGENT</span>
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-secondary-fixed text-on-secondary-fixed-variant ${
            size === 'sm' ? 'px-2.5 py-0.5 text-label-sm font-label-sm' : 'px-3 py-1 text-label-md font-label-md'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>HIGH</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-surface-container-high text-on-surface ${
            size === 'sm' ? 'px-2.5 py-0.5 text-label-sm font-label-sm' : 'px-3 py-1 text-label-md font-label-md'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-surface-tint"></span>
          <span>MEDIUM</span>
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-surface-container-low text-tertiary ${
            size === 'sm' ? 'px-2.5 py-0.5 text-label-sm font-label-sm' : 'px-3 py-1 text-label-md font-label-md'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
          <span>LOW</span>
        </span>
      );
  }
};
