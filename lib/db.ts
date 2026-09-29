import { Complaint, ComplaintStatus, DashboardStatsData } from '@/types/complaint';

// Global in-memory cache preserved across Next.js dev server hot-reloads
declare global {
  var __societyComplaintsDb: Complaint[] | undefined;
  var __societyNextTicketId: number | undefined;
}

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'sc-1024',
    ticketNumber: 'SC-1024',
    residentName: 'Smt. Sunita Kapoor',
    flatNumber: 'B-204',
    wing: 'Wing B',
    rawMessage: 'bhai 2nd floor ki lift mein uncle phas gaye hain jaldi dekho',
    title: 'Person trapped in second-floor lift',
    summary: 'Resident reports an elderly person is trapped in the lift between 2nd and 3rd floor. Elevator vendor Otis alerted.',
    category: 'LIFT',
    priority: 'URGENT',
    status: 'OPEN',
    language: 'HINGLISH',
    confidence: 0.98,
    vendorAlerted: 'Otis Elevators 24x7',
    vendorPhone: '+919820012345',
    notes: ['Initial emergency call received', 'Otis dispatched quick response team (ETA 12 mins)'],
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1023',
    ticketNumber: 'SC-1023',
    residentName: 'Dr. Mohan Lal',
    flatNumber: 'D-101',
    wing: 'Wing D',
    rawMessage: 'Meter room se sparking ki aawaz aa rahi hai aur jalne ki smell',
    title: 'Meter box sparking with burning smell',
    summary: 'Sparks and burning odor observed near Wing D ground floor electrical meter cabinet.',
    category: 'ELECTRICITY',
    priority: 'URGENT',
    status: 'OPEN',
    language: 'HINGLISH',
    confidence: 0.96,
    vendorAlerted: 'Society Electrician (Ramesh)',
    vendorPhone: '+919820033445',
    notes: ['Electrician Ramesh on site assessing main fuse'],
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1022',
    ticketNumber: 'SC-1022',
    residentName: 'Amit Verma',
    flatNumber: 'A-302',
    wing: 'Wing A',
    rawMessage: 'Water supply unavailable in Wing A since 9:30 AM, overhead tank seems dry',
    title: 'Water supply unavailable in Wing A',
    summary: 'Residents report main overhead tank pump trip causing complete water stoppage in Wing A since 9:30 AM.',
    category: 'WATER',
    priority: 'HIGH',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.95,
    vendorAlerted: 'Mahavir Plumbing',
    vendorPhone: '+919820098765',
    notes: ['Plumber contacted to reset starter panel'],
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1019',
    ticketNumber: 'SC-1019',
    residentName: 'Rajesh Joshi',
    flatNumber: 'A-102',
    wing: 'Wing A',
    rawMessage: 'Lift 2 in Wing A is completely dead and buttons are not responding',
    title: 'Lift 2 breakdown in Wing A',
    summary: 'Elevator 2 in Wing A stopped operating on ground floor with door sensor failure.',
    category: 'LIFT',
    priority: 'HIGH',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.94,
    notes: ['Logged in Otis portal ticket #48192'],
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1020',
    ticketNumber: 'SC-1020',
    residentName: 'Rahul Sharma',
    flatNumber: 'A-203',
    wing: 'Wing A',
    rawMessage: 'Third-floor lift not working kal se band hai senior citizens ko problem ho rahi hai',
    title: 'Third-floor lift not working',
    summary: 'Lift has been unavailable for two days. Multiple senior residents impacted.',
    category: 'LIFT',
    priority: 'HIGH',
    status: 'OPEN',
    language: 'HINGLISH',
    confidence: 0.92,
    possibleDuplicateId: 'sc-1019',
    possibleDuplicateTicket: 'SC-1019',
    duplicateReason: 'Possible duplicate of #SC-1019 (Lift 2 breakdown in Wing A)',
    notes: ['Candidate for grouping with #SC-1019'],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1018',
    ticketNumber: 'SC-1018',
    residentName: 'Vikram Deshmukh',
    flatNumber: 'B-105',
    wing: 'Wing B',
    rawMessage: 'Visitor white Creta (MH12-AB-4021) parked in slot B-105 without guest slip',
    title: 'Vehicle blocking reserved parking',
    summary: 'Visitor white Creta (MH12-AB-4021) parked in slot B-105 without guest slip.',
    category: 'PARKING',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    language: 'ENGLISH',
    confidence: 0.91,
    vendorAlerted: 'Main Gate Security Desk',
    vendorPhone: '+919820055667',
    notes: ['Security guard instructed to contact vehicle owner via MyGate directory'],
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1015',
    ticketNumber: 'SC-1015',
    residentName: 'Priya Nair',
    flatNumber: 'C-401',
    wing: 'Wing C',
    rawMessage: 'Corridor dustbin overflow near Wing C stairs housekeeping missed it',
    title: 'Corridor dustbin overflow near Wing C stairs',
    summary: 'Housekeeping missed 4th floor landing during morning round.',
    category: 'CLEANING',
    priority: 'LOW',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.89,
    notes: ['Supervisor instructed to dispatch floor sweeper'],
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1014',
    ticketNumber: 'SC-1014',
    residentName: 'Kavita Patel',
    flatNumber: 'B-301',
    wing: 'Wing B',
    rawMessage: 'Night time loud bass music playing from 5th floor flat till 1:30 AM',
    title: 'Late night noise disturbance',
    summary: 'Loud music disturbing residents past midnight in Wing B.',
    category: 'NOISE',
    priority: 'MEDIUM',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.9,
    notes: ['Warning sent to flat occupant'],
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1012',
    ticketNumber: 'SC-1012',
    residentName: 'Rohan Gupta',
    flatNumber: 'D-402',
    wing: 'Wing D',
    rawMessage: 'Staircase 3rd floor light bulb is fused completely dark',
    title: 'Staircase light bulb fused',
    summary: 'Third floor landing light in Wing D is fused and needs replacement.',
    category: 'ELECTRICITY',
    priority: 'LOW',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.95,
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
  },
];

function getStore(): Complaint[] {
  if (!global.__societyComplaintsDb) {
    global.__societyComplaintsDb = [...INITIAL_COMPLAINTS];
  }
  return global.__societyComplaintsDb;
}

export function getAllComplaints(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  wing?: string;
  search?: string;
}): Complaint[] {
  let list = [...getStore()];

  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter((c) => c.status.toUpperCase() === filters.status?.toUpperCase());
  }

  if (filters?.priority && filters.priority !== 'ALL') {
    list = list.filter((c) => c.priority.toUpperCase() === filters.priority?.toUpperCase());
  }

  if (filters?.category && filters.category !== 'ALL') {
    list = list.filter((c) => c.category.toUpperCase() === filters.category?.toUpperCase());
  }

  if (filters?.wing && filters.wing !== 'ALL' && filters.wing !== 'All Wings') {
    list = list.filter((c) => c.wing.toLowerCase().includes(filters.wing!.toLowerCase()));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.ticketNumber.toLowerCase().includes(q) ||
        c.residentName.toLowerCase().includes(q) ||
        c.flatNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.rawMessage.toLowerCase().includes(q)
    );
  }

  // Priority sorting: URGENT -> HIGH -> MEDIUM -> LOW, then newest first
  const priorityWeight: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  list.sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return list;
}

export function getComplaintById(id: string): Complaint | undefined {
  const store = getStore();
  const normalized = id.toLowerCase();
  return store.find((c) => c.id.toLowerCase() === normalized || c.ticketNumber.toLowerCase() === normalized);
}

export function saveComplaint(data: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): Complaint {
  const store = getStore();
  global.__societyNextTicketId = (global.__societyNextTicketId || 1025) + 1;
  const ticketNumber = `SC-${global.__societyNextTicketId}`;
  const id = `sc-${global.__societyNextTicketId}`;
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    ...data,
    id,
    ticketNumber,
    createdAt: now,
    updatedAt: now,
  };

  store.unshift(newComplaint);
  return newComplaint;
}

export function updateComplaint(
  id: string,
  updates: { status?: ComplaintStatus; note?: string; duplicateResolved?: boolean }
): Complaint | null {
  const store = getStore();
  const normalized = id.toLowerCase();
  const index = store.findIndex((c) => c.id.toLowerCase() === normalized || c.ticketNumber.toLowerCase() === normalized);

  if (index === -1) return null;

  const current = store[index];
  const now = new Date().toISOString();

  const updatedNotes = [...(current.notes || [])];
  if (updates.note) {
    updatedNotes.push(`[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${updates.note}`);
  }

  if (updates.status && updates.status !== current.status) {
    updatedNotes.push(`Status changed from ${current.status} to ${updates.status}`);
  }

  const updatedComplaint: Complaint = {
    ...current,
    status: updates.status || current.status,
    notes: updatedNotes,
    possibleDuplicateId: updates.duplicateResolved ? undefined : current.possibleDuplicateId,
    possibleDuplicateTicket: updates.duplicateResolved ? undefined : current.possibleDuplicateTicket,
    updatedAt: now,
  };

  store[index] = updatedComplaint;
  return updatedComplaint;
}

export function getDashboardStats(): DashboardStatsData {
  const store = getStore();
  const active = store.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS');

  return {
    totalActive: active.length,
    urgent: active.filter((c) => c.priority === 'URGENT').length,
    high: active.filter((c) => c.priority === 'HIGH').length,
    medium: active.filter((c) => c.priority === 'MEDIUM').length,
    low: active.filter((c) => c.priority === 'LOW').length,
    resolvedToday: 42,
    avgSlaResponse: '18m 40s',
    triagedThisHour: 4,
    velocityPercent: 94,
  };
}
