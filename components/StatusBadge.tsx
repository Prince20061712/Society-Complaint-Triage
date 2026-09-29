import React from 'react';
import { ComplaintStatus } from '@/types/complaint';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium">
          OPEN
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
          IN PROGRESS
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold">
          RESOLVED
        </span>
      );
    case 'CLOSED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-outline font-label-sm text-label-sm">
          CLOSED
        </span>
      );
    default:
      return null;
  }
};
