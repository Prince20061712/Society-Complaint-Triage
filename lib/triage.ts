import { analyzeComplaintWithAI } from './ai';
import { detectDuplicate } from './duplicate';
import { Complaint, ComplaintCategory, ComplaintInput } from '@/types/complaint';

export function extractWing(flatNumber: string): string {
  const match = flatNumber.match(/^([A-Za-z])/);
  if (match) {
    return `Wing ${match[1].toUpperCase()}`;
  }
  return 'Wing A';
}

export function getVendorForCategory(category: ComplaintCategory): { name: string; phone: string } | undefined {
  switch (category) {
    case 'LIFT':
      return { name: 'Otis Elevators 24x7', phone: '+919820012345' };
    case 'WATER':
      return { name: 'Mahavir Plumbing', phone: '+919820098765' };
    case 'ELECTRICITY':
      return { name: 'Society Electrician (Ramesh)', phone: '+919820033445' };
    case 'SECURITY':
      return { name: 'Main Gate Security Desk', phone: '+919820055667' };
    default:
      return undefined;
  }
}

export async function processComplaintTriage(
  input: { residentName: string; flatNumber: string; message: string },
  existingComplaints: Complaint[]
): Promise<Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>> {
  const aiResult = await analyzeComplaintWithAI(input.message, input.flatNumber);
  const dupCheck = detectDuplicate(input.message, aiResult.category, existingComplaints);
  const wing = extractWing(input.flatNumber);
  const vendor = getVendorForCategory(aiResult.category);

  const isGroq = aiResult.processingMode === 'GROQ';
  const triageNote = isGroq
    ? `Groq AI triage executed: classified as ${aiResult.category} (${aiResult.priority}) in ${aiResult.language}`
    : `Local fallback triage executed: classified as ${aiResult.category} (${aiResult.priority}) in ${aiResult.language}`;

  return {
    residentName: input.residentName,
    flatNumber: input.flatNumber,
    wing,
    rawMessage: input.message,
    title: aiResult.title,
    summary: aiResult.summary,
    category: aiResult.category,
    priority: aiResult.priority,
    aiPriority: aiResult.priority,
    status: 'OPEN',
    language: aiResult.language,
    confidence: aiResult.confidence,
    aiReasoning: aiResult.aiReasoning,
    processingMode: aiResult.processingMode || 'GROQ',
    possibleDuplicateId: dupCheck.isDuplicate ? dupCheck.duplicateOfId : undefined,
    possibleDuplicateTicket: dupCheck.isDuplicate ? dupCheck.duplicateOfTicket : undefined,
    duplicateReason: dupCheck.isDuplicate ? dupCheck.reason : undefined,
    vendorAlerted: vendor?.name,
    vendorPhone: vendor?.phone,
    notes: [triageNote],
  };
}
