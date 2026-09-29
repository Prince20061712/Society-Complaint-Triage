import React from 'react';
import Link from 'next/link';

interface DuplicateAlertProps {
  ticketNumber?: string;
  reason?: string;
  onReview?: () => void;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({ ticketNumber, reason, onReview }) => {
  if (!ticketNumber) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
      <span className="material-symbols-outlined text-[15px] text-secondary">content_copy</span>
      <span>
        Possible duplicate of <strong>#{ticketNumber}</strong>
      </span>
      {onReview ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReview();
          }}
          className="ml-1 text-primary underline hover:text-primary-container font-semibold cursor-pointer"
          type="button"
        >
          Review
        </button>
      ) : (
        <Link
          href={`/complaints/${ticketNumber.toLowerCase()}`}
          className="ml-1 text-primary underline hover:text-primary-container font-semibold"
          onClick={(e) => e.stopPropagation()}
        >
          Review
        </Link>
      )}
    </div>
  );
};
