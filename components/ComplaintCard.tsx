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
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  return (
    <div className="neu-card p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 transition-all duration-300 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex items-start gap-3 sm:gap-5 w-full min-w-0">
        {/* Category Icon Well */}
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl neu-inset-deep flex items-center justify-center shrink-0 text-[#6C63FF]">
          <span className="material-symbols-outlined text-[20px] sm:text-[26px]">
            {getCategoryIcon(complaint.category)}
          </span>
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <PriorityBadge priority={complaint.priority} />

            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full neu-flat-sm text-[11px] sm:text-xs font-bold text-[#3D4852]">
              {complaint.category}
            </span>

            <span className="text-[11px] sm:text-xs font-medium text-[#6B7280]">
              • #{complaint.ticketNumber}
            </span>

            {complaint.language && complaint.language !== 'ENGLISH' && (
              <span className="px-2 py-0.5 rounded-full neu-inset-sm text-[#6B7280] text-[10px] sm:text-xs font-medium">
                🗣️ {complaint.language}
              </span>
            )}

            {/* Duplicate indicator */}
            {complaint.possibleDuplicateTicket && (
              <DuplicateAlert ticketNumber={complaint.possibleDuplicateTicket} reason={complaint.duplicateReason} />
            )}
          </div>

          {/* Title and summary */}
          <div className="min-w-0">
            <Link href={`/complaints/${complaint.id}`} className="block">
              <h3 className="text-base sm:text-lg font-bold font-display text-[#3D4852] hover:text-[#6C63FF] transition-colors cursor-pointer tracking-tight break-words">
                {complaint.title}
              </h3>
            </Link>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mt-0.5 break-words line-clamp-2 sm:line-clamp-none">
              {complaint.summary}
            </p>
          </div>

          {/* Metadata footer */}
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] sm:text-xs text-[#6B7280] pt-1">
            <span className="font-semibold text-[#3D4852] neu-inset-sm px-2 py-0.5 rounded-lg truncate max-w-[180px] sm:max-w-none">
              Flat {complaint.flatNumber} • {complaint.residentName}
            </span>
            <span>•</span>
            <span
              className={`flex items-center gap-1 ${
                complaint.priority === 'URGENT' ? 'text-[#C53030] font-bold' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[13px] sm:text-[15px]">schedule</span>
              {formatTimeAgo(complaint.createdAt)}
            </span>
            <span>•</span>
            <StatusBadge status={complaint.status} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row sm:flex-row lg:flex-col items-center sm:items-center lg:items-end gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t border-[#D1D9E6]/30 lg:border-t-0">
        {complaint.priority === 'URGENT' && complaint.vendorPhone && (
          <a
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl neu-flat hover:neu-flat-hover text-[#C53030] font-bold text-xs transition-all min-h-[44px]"
            href={`tel:${complaint.vendorPhone}`}
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Vendor</span>
          </a>
        )}

        <Link
          href={`/complaints/${complaint.id}`}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all min-h-[44px] ${
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
