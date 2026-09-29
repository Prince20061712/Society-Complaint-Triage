import React from 'react';
import { ComplaintStatus } from '@/types/complaint';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full neu-flat-sm text-[#3D4852] text-xs font-semibold">
          OPEN
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full neu-flat-sm text-[#6C63FF] text-xs font-bold">
          IN PROGRESS
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full neu-flat-sm text-[#38B2AC] text-xs font-bold">
          RESOLVED
        </span>
      );
    case 'CLOSED':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full neu-inset-sm text-[#6B7280] text-xs font-medium">
          CLOSED
        </span>
      );
    default:
      return null;
  }
};
