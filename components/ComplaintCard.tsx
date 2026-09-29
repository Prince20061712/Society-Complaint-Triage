import React from 'react';
import Link from 'next/link';
import { Complaint, ComplaintCategory } from '@/types/complaint';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { DuplicateAlert } from './DuplicateAlert';

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange?: (id: string, newStatus: any) => void;
}

function getCategoryIcon(cat: ComplaintCategory): string {
  switch (cat) {
    case 'LIFT':
      return 'elevator';
    case 'WATER':
      return 'water_drop';
    case 'ELECTRICITY':
      return 'bolt';
    case 'PARKING':
      return 'directions_car';
    case 'CLEANING':
      return 'cleaning_services';
    case 'NOISE':
      return 'volume_up';
    case 'SECURITY':
      return 'security';
    default:
      return 'help_outline';
  }
}

function getBorderAccent(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'bg-error';
    case 'HIGH':
      return 'bg-secondary-container';
    case 'MEDIUM':
      return 'bg-surface-tint';
    case 'LOW':
    default:
      return 'bg-outline';
  }
}

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onStatusChange }) => {
  const accentClass = getBorderAccent(complaint.priority);

  return (
    <div className="relative rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentClass} rounded-l-xl`}></div>

      <div className="space-y-2 max-w-3xl pl-1">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={complaint.priority} />

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-label-sm text-label-sm bg-surface-container-high text-on-surface">
            <span className="material-symbols-outlined text-[14px]">{getCategoryIcon(complaint.category)}</span>
            <span>{complaint.category}</span>
          </span>

          <span className="font-label-sm text-label-sm text-on-surface-variant">• Ticket #{complaint.ticketNumber}</span>

          {complaint.language && complaint.language !== 'ENGLISH' && (
            <span className="px-2 py-0.5 rounded bg-surface-container-low text-tertiary font-label-sm text-label-sm">
              🗣️ {complaint.language}
            </span>
          )}

          {/* DUPLICATE INDICATOR */}
          {complaint.possibleDuplicateTicket && (
            <DuplicateAlert ticketNumber={complaint.possibleDuplicateTicket} reason={complaint.duplicateReason} />
          )}
        </div>

        {/* Title and summary */}
        <div>
          <Link href={`/complaints/${complaint.id}`}>
            <h3 className="font-headline-sm text-headline-sm text-on-surface hover:text-primary transition-colors cursor-pointer">
              {complaint.title}
            </h3>
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">{complaint.summary}</p>
        </div>

        {/* Metadata footer */}
        <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
          <span className="font-medium text-on-surface bg-surface-container-low px-2 py-0.5 rounded">
            Flat {complaint.flatNumber} • {complaint.residentName}
          </span>
          <span>•</span>
          <span
            className={`flex items-center gap-1 ${
              complaint.priority === 'URGENT' ? 'text-error font-medium' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {formatTimeAgo(complaint.createdAt)}
          </span>
          <span>•</span>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 w-full lg:w-auto shrink-0">
        {complaint.priority === 'URGENT' && complaint.vendorPhone && (
          <a
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md hover:bg-error-container/80 transition-colors shadow-sm"
            href={`tel:${complaint.vendorPhone}`}
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Vendor ({complaint.vendorAlerted?.split(' ')[0] || 'Technician'})</span>
          </a>
        )}

        <Link
          href={`/complaints/${complaint.id}`}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm ${
            complaint.priority === 'URGENT'
              ? 'bg-primary-container text-on-primary-container hover:opacity-90'
              : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
          }`}
        >
          <span>View Complaint</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};
