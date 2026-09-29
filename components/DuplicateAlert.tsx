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
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-inset-sm text-[#3D4852] text-xs">
      <span className="material-symbols-outlined text-[16px] text-[#6C63FF]">content_copy</span>
      <span>
        Possible duplicate of <strong className="text-[#3D4852]">#{ticketNumber}</strong>
      </span>
      {onReview ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReview();
          }}
          className="ml-1 text-[#6C63FF] hover:text-[#8B84FF] font-bold cursor-pointer transition-colors"
          type="button"
        >
          Review
        </button>
      ) : (
        <Link
          href={`/complaints/${ticketNumber.toLowerCase()}`}
          className="ml-1 text-[#6C63FF] hover:text-[#8B84FF] font-bold transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Review
        </Link>
      )}
    </div>
  );
};
