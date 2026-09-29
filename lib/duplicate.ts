import { Complaint, ComplaintCategory, DuplicateMatch } from '@/types/complaint';

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2);
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
    const candidateCombinedWords = normalizeText(`${c.title} ${c.summary} ${c.rawMessage}`);
    const candidateRawWords = normalizeText(c.rawMessage);

    let commonCombined = 0;
    for (const w of candidateCombinedWords) {
      if (newWords.has(w)) commonCombined++;
    }

    let commonRaw = 0;
    for (const w of candidateRawWords) {
      if (newWords.has(w)) commonRaw++;
    }

    const similarityCombined =
      candidateCombinedWords.length > 0 ? (commonCombined * 2) / (newWords.size + candidateCombinedWords.length) : 0;
    const similarityRaw =
      candidateRawWords.length > 0 ? (commonRaw * 2) / (newWords.size + candidateRawWords.length) : 0;

    const baseSimilarity = Math.max(similarityCombined, similarityRaw);

    const isSameCategory = c.category === category;
    const sameWing = newText.toLowerCase().includes(c.wing.toLowerCase());

    let finalScore = baseSimilarity;
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
