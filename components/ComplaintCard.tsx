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

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  return (
    <div className="neu-card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all duration-300">
      <div className="flex items-start gap-5 max-w-3xl">
        {/* Nested Depth: Inset Deep Category Icon Well */}
        <div className="w-14 h-14 rounded-2xl neu-inset-deep flex items-center justify-center shrink-0 text-[#6C63FF]">
          <span className="material-symbols-outlined text-[26px]">{getCategoryIcon(complaint.category)}</span>
        </div>

        <div className="space-y-2">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={complaint.priority} />

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full neu-flat-sm text-xs font-bold text-[#3D4852]">
              {complaint.category}
            </span>

            <span className="text-xs font-medium text-[#6B7280]">• Ticket #{complaint.ticketNumber}</span>

            {complaint.language && complaint.language !== 'ENGLISH' && (
              <span className="px-2.5 py-0.5 rounded-full neu-inset-sm text-[#6B7280] text-xs font-medium">
                🗣️ {complaint.language}
              </span>
            )}

            {/* Duplicate indicator */}
            {complaint.possibleDuplicateTicket && (
              <DuplicateAlert ticketNumber={complaint.possibleDuplicateTicket} reason={complaint.duplicateReason} />
            )}
          </div>

          {/* Title and summary */}
          <div>
            <Link href={`/complaints/${complaint.id}`}>
              <h3 className="text-lg font-bold font-display text-[#3D4852] hover:text-[#6C63FF] transition-colors cursor-pointer tracking-tight">
                {complaint.title}
              </h3>
            </Link>
            <p className="text-sm text-[#6B7280] leading-relaxed mt-0.5">{complaint.summary}</p>
          </div>

          {/* Metadata footer */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
            <span className="font-semibold text-[#3D4852] neu-inset-sm px-2.5 py-1 rounded-xl">
              Flat {complaint.flatNumber} • {complaint.residentName}
            </span>
            <span>•</span>
            <span
              className={`flex items-center gap-1 ${
                complaint.priority === 'URGENT' ? 'text-[#C53030] font-bold' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              {formatTimeAgo(complaint.createdAt)}
            </span>
            <span>•</span>
            <StatusBadge status={complaint.status} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto shrink-0 self-end lg:self-center">
        {complaint.priority === 'URGENT' && complaint.vendorPhone && (
          <a
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl neu-flat hover:neu-flat-hover text-[#C53030] font-bold text-xs transition-all"
            href={`tel:${complaint.vendorPhone}`}
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call {complaint.vendorAlerted?.split(' ')[0] || 'Vendor'}</span>
          </a>
        )}

        <Link
          href={`/complaints/${complaint.id}`}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold transition-all ${
            complaint.priority === 'URGENT'
              ? 'neu-btn-primary'
              : 'neu-btn hover:text-[#6C63FF]'
          }`}
        >
          <span>View Ticket</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};
