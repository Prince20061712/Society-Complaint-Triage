import { Complaint, ComplaintCategory, DuplicateMatch } from '@/types/complaint';

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

export function detectDuplicate(
  newText: string,
  category: ComplaintCategory,
  activeComplaints: Complaint[]
): DuplicateMatch {
  // Only compare against unresolved complaints in the same or related category
  const candidates = activeComplaints.filter(
    (c) => (c.status === 'OPEN' || c.status === 'IN_PROGRESS') && (c.category === category || category === 'OTHER')
  );

  if (candidates.length === 0) {
    return { isDuplicate: false };
  }

  const newWords = new Set(normalizeText(newText));

  let bestMatch: Complaint | null = null;
  let highestScore = 0;
  let matchReason = '';

  for (const c of candidates) {
    const candidateWords = normalizeText(`${c.title} ${c.summary} ${c.rawMessage}`);
    let commonCount = 0;

    for (const w of candidateWords) {
      if (newWords.has(w)) {
        commonCount++;
      }
    }

    const similarity = candidateWords.length > 0 ? (commonCount * 2) / (newWords.size + candidateWords.length) : 0;

    // Check specific critical keywords: "lift", "pump", "water", "tank", "gate", "parking"
    const isSameCategory = c.category === category;
    const sameWing = newText.toLowerCase().includes(c.wing.toLowerCase());

    let finalScore = similarity;
    if (isSameCategory) finalScore += 0.25;
    if (sameWing) finalScore += 0.2;

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = c;
      matchReason = `Similar issue reported regarding ${c.category.toLowerCase()} (${c.title})`;
    }
  }

  if (bestMatch && highestScore >= 0.55) {
    return {
      isDuplicate: true,
      duplicateOfId: bestMatch.id,
      duplicateOfTicket: bestMatch.ticketNumber,
      reason: matchReason,
      confidence: Math.min(0.98, Math.round(highestScore * 100) / 100),
    };
  }

  return { isDuplicate: false };
}
