export type ComplaintCategory =
  | 'WATER'
  | 'LIFT'
  | 'ELECTRICITY'
  | 'PARKING'
  | 'CLEANING'
  | 'NOISE'
  | 'SECURITY'
  | 'OTHER';

export type ComplaintPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type ComplaintLanguage = 'ENGLISH' | 'HINDI' | 'HINGLISH';

export interface ComplaintInput {
  residentName: string;
  flatNumber: string;
  message: string;
}

export interface DuplicateMatch {
  isDuplicate: boolean;
  duplicateOfId?: string;
  duplicateOfTicket?: string;
  reason?: string;
  confidence?: number;
}

export interface AITriageResult {
  title: string;
  summary: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  language: ComplaintLanguage;
  confidence: number;
  aiReasoning?: string;
  processingMode?: 'GROQ' | 'LOCAL_FALLBACK';
  duplicateMatch?: DuplicateMatch;
}

export interface Complaint {
  id: string;
  ticketNumber: string; // e.g. "SC-1024"
  residentName: string;
  flatNumber: string;
  wing: string;
  rawMessage: string;
  title: string;
  summary: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  aiPriority?: ComplaintPriority;
  committeePriority?: ComplaintPriority;
  status: ComplaintStatus;
  language: ComplaintLanguage;
  confidence: number;
  aiReasoning?: string;
  processingMode?: 'GROQ' | 'LOCAL_FALLBACK';
  possibleDuplicateId?: string;
  possibleDuplicateTicket?: string;
  duplicateReason?: string;
  vendorAlerted?: string;
  vendorPhone?: string;
  notes?: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface DashboardStatsData {
  totalActive: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
  open: number;
  inProgress: number;
  resolved: number;
}
