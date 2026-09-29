import { Complaint, ComplaintCategory, ComplaintLanguage, ComplaintPriority, ComplaintStatus, DashboardStatsData } from '@/types/complaint';
import { neon } from '@neondatabase/serverless';

// Global in-memory cache preserved across Next.js dev server hot-reloads (fallback when no DATABASE_URL)
declare global {
  var __societyComplaintsDb: Complaint[] | undefined;
  var __societyNextTicketId: number | undefined;
}

export const INITIAL_COMPLAINTS: Complaint[] = [
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
    aiPriority: 'URGENT',
    status: 'OPEN',
    language: 'HINGLISH',
    confidence: 0.98,
    aiReasoning: 'Person trapped in elevator presents an immediate life safety emergency requiring urgent technician dispatch.',
    processingMode: 'GROQ',
    vendorAlerted: 'Otis Elevators 24x7',
    vendorPhone: '+919820012345',
    notes: ['Initial emergency call received', 'Otis dispatched quick response team (ETA 12 mins)'],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
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
    aiPriority: 'URGENT',
    status: 'OPEN',
    language: 'HINGLISH',
    confidence: 0.96,
    aiReasoning: 'Electrical sparks and burning smell in meter room represent active fire hazard requiring urgent isolation.',
    processingMode: 'GROQ',
    vendorAlerted: 'Society Electrician (Ramesh)',
    vendorPhone: '+919820033445',
    notes: ['Electrician Ramesh on site assessing main circuit fuse'],
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1022',
    ticketNumber: 'SC-1022',
    residentName: 'Amit Verma',
    flatNumber: 'A-302',
    wing: 'Wing A',
    rawMessage: 'Water supply unavailable in Wing A since 9:30 AM, overhead tank seems dry',
    title: 'Water supply unavailable in Wing A',
    summary: 'Residents report main overhead tank pump trip causing complete water stoppage in Wing A.',
    category: 'WATER',
    priority: 'HIGH',
    aiPriority: 'HIGH',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.95,
    aiReasoning: 'Wing-wide water outage disrupts essential domestic utilities for multiple households.',
    processingMode: 'GROQ',
    vendorAlerted: 'Mahavir Plumbing',
    vendorPhone: '+919820098765',
    notes: ['Plumber contacted to reset starter panel and check borewell pump'],
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1021',
    ticketNumber: 'SC-1021',
    residentName: 'राधा शर्मा',
    flatNumber: 'A-304',
    wing: 'Wing A',
    rawMessage: 'दूसरी मंज़िल पर सुबह से पानी नहीं आ रहा है, कृपया मोटर चालू करवाइए',
    title: 'Water supply stopped in Wing A',
    summary: 'Resident reports water not coming since morning on second/third floor in Wing A.',
    category: 'WATER',
    priority: 'HIGH',
    aiPriority: 'HIGH',
    status: 'OPEN',
    language: 'HINDI',
    confidence: 0.94,
    aiReasoning: 'Water outage on residential floor affecting daily living essentials.',
    processingMode: 'GROQ',
    possibleDuplicateId: 'sc-1022',
    possibleDuplicateTicket: 'SC-1022',
    duplicateReason: 'Similar issue reported regarding water (Water supply unavailable in Wing A)',
    notes: ['Flagged as duplicate of #SC-1022 (Wing A water stoppage)'],
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1019',
    ticketNumber: 'SC-1019',
    residentName: 'Rajesh Joshi',
    flatNumber: 'C-102',
    wing: 'Wing C',
    rawMessage: 'Main passenger lift 1 in Wing C is completely dead and buttons are not responding',
    title: 'Lift 1 breakdown in Wing C',
    summary: 'Elevator 1 in Wing C stopped operating on ground floor with door sensor failure.',
    category: 'LIFT',
    priority: 'HIGH',
    aiPriority: 'HIGH',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.94,
    aiReasoning: 'Primary elevator out of service causing mobility barrier for 8-floor wing.',
    processingMode: 'GROQ',
    vendorAlerted: 'Otis Elevators 24x7',
    vendorPhone: '+919820012345',
    notes: ['Logged in Otis portal ticket #48192'],
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1020',
    ticketNumber: 'SC-1020',
    residentName: 'Rahul Sharma',
    flatNumber: 'C-203',
    wing: 'Wing C',
    rawMessage: 'Wing C ki lift 1 kal se band hai senior citizens ko stair chalna pad raha hai',
    title: 'Lift 1 not working in Wing C',
    summary: 'Lift 1 in Wing C unavailable since yesterday. Senior residents having difficulty.',
    category: 'LIFT',
    priority: 'HIGH',
    aiPriority: 'HIGH',
    status: 'OPEN',
    language: 'HINGLISH',
    confidence: 0.93,
    aiReasoning: 'Passenger lift failure recurring report affecting elderly residents.',
    processingMode: 'GROQ',
    possibleDuplicateId: 'sc-1019',
    possibleDuplicateTicket: 'SC-1019',
    duplicateReason: 'Similar issue reported regarding lift (Lift 1 breakdown in Wing C)',
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
    title: 'Vehicle blocking reserved parking slot B-105',
    summary: 'Visitor white Creta (MH12-AB-4021) parked in slot B-105 without guest slip.',
    category: 'PARKING',
    priority: 'MEDIUM',
    aiPriority: 'MEDIUM',
    status: 'IN_PROGRESS',
    language: 'ENGLISH',
    confidence: 0.91,
    aiReasoning: 'Reserved parking slot encroachment causing access obstruction.',
    processingMode: 'GROQ',
    vendorAlerted: 'Main Gate Security Desk',
    vendorPhone: '+919820055667',
    notes: ['Security guard instructed to contact vehicle owner via MyGate directory'],
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1017',
    ticketNumber: 'SC-1017',
    residentName: 'Alok Nath',
    flatNumber: 'B-106',
    wing: 'Wing B',
    rawMessage: 'White car parked in slot B-105 is also blocking my car turning space',
    title: 'Car in slot B-105 blocking driveway',
    summary: 'Resident reports vehicle in B-105 is encroaching driveway turning radius.',
    category: 'PARKING',
    priority: 'MEDIUM',
    aiPriority: 'MEDIUM',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.92,
    aiReasoning: 'Driveway access inconvenience linked to parking violation.',
    processingMode: 'GROQ',
    possibleDuplicateId: 'sc-1018',
    possibleDuplicateTicket: 'SC-1018',
    duplicateReason: 'Similar issue reported regarding parking (Vehicle blocking reserved parking slot B-105)',
    notes: ['Related to active parking ticket #SC-1018'],
    createdAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1016',
    ticketNumber: 'SC-1016',
    residentName: 'Rohan Gupta',
    flatNumber: 'D-402',
    wing: 'Wing D',
    rawMessage: 'Corridor light fixture broken and hanging near 4th floor landing Wing D',
    title: 'Corridor light fixture broken on 4th floor',
    summary: 'Fourth floor landing light fixture in Wing D is hanging loose and needs repair.',
    category: 'ELECTRICITY',
    priority: 'MEDIUM',
    aiPriority: 'MEDIUM',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.93,
    aiReasoning: 'Damaged common area fixture creates visibility and mild electrical safety concern.',
    processingMode: 'GROQ',
    vendorAlerted: 'Society Electrician (Ramesh)',
    vendorPhone: '+919820033445',
    notes: ['Work order assigned to Ramesh electrician'],
    createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1015',
    ticketNumber: 'SC-1015',
    residentName: 'Priya Nair',
    flatNumber: 'C-401',
    wing: 'Wing C',
    rawMessage: 'Garbage chute jammed and corridor dustbin overflow near Wing C stairs',
    title: 'Garbage chute jammed and dustbin overflow',
    summary: 'Corridor waste chute blocked on 4th floor landing with bin overflowing.',
    category: 'CLEANING',
    priority: 'MEDIUM',
    aiPriority: 'MEDIUM',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.9,
    aiReasoning: 'Sanitation concern on common corridor requiring housekeeping clearing.',
    processingMode: 'GROQ',
    notes: ['Supervisor instructed to dispatch floor sweeper team'],
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
    priority: 'LOW',
    aiPriority: 'LOW',
    status: 'OPEN',
    language: 'ENGLISH',
    confidence: 0.91,
    aiReasoning: 'Routine residential noise concern without physical hazard.',
    processingMode: 'GROQ',
    notes: ['Courtesy notice sent to flat occupant'],
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
  },
  {
    id: 'sc-1011',
    ticketNumber: 'SC-1011',
    residentName: 'Sanjay Deshpande',
    flatNumber: 'C-104',
    wing: 'Wing C',
    rawMessage: 'Garden sprinkler head broken near children park, water flooding walkway',
    title: 'Garden sprinkler repair near walkway',
    summary: 'Sprinkler head replaced and ground drain unclogged by society gardener.',
    category: 'WATER',
    priority: 'LOW',
    aiPriority: 'LOW',
    status: 'RESOLVED',
    language: 'ENGLISH',
    confidence: 0.93,
    aiReasoning: 'Minor landscaping maintenance issue with low severity.',
    processingMode: 'GROQ',
    notes: ['Gardener completed nozzle replacement and cleared pathway'],
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
];

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

function getNeonClient() {
  const url = getDatabaseUrl();
  if (!url) return null;
  return neon(url);
}

let isTableInitialized = false;

export async function ensureTableExists(): Promise<void> {
  if (isTableInitialized) return;
  const sql = getNeonClient();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        ticket_number TEXT NOT NULL,
        resident_name TEXT NOT NULL,
        flat_number TEXT NOT NULL,
        wing TEXT NOT NULL,
        raw_message TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        ai_priority TEXT,
        committee_priority TEXT,
        status TEXT NOT NULL DEFAULT 'OPEN',
        language TEXT NOT NULL DEFAULT 'ENGLISH',
        confidence NUMERIC NOT NULL DEFAULT 0.95,
        ai_reasoning TEXT,
        processing_mode TEXT DEFAULT 'GROQ',
        possible_duplicate_id TEXT,
        possible_duplicate_ticket TEXT,
        duplicate_reason TEXT,
        vendor_alerted TEXT,
        vendor_phone TEXT,
        notes JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Check if table is empty; if so, populate initial demo complaints once
    const countRes = await sql`SELECT COUNT(*)::int as count FROM complaints`;
    if (countRes[0]?.count === 0) {
      for (const c of INITIAL_COMPLAINTS) {
        await sql`
          INSERT INTO complaints (
            id, ticket_number, resident_name, flat_number, wing, raw_message,
            title, summary, category, priority, ai_priority, committee_priority,
            status, language, confidence, ai_reasoning, processing_mode,
            possible_duplicate_id, possible_duplicate_ticket, duplicate_reason,
            vendor_alerted, vendor_phone, notes, created_at, updated_at
          ) VALUES (
            ${c.id}, ${c.ticketNumber}, ${c.residentName}, ${c.flatNumber}, ${c.wing}, ${c.rawMessage},
            ${c.title}, ${c.summary}, ${c.category}, ${c.priority}, ${c.aiPriority || c.priority}, ${c.committeePriority || null},
            ${c.status}, ${c.language}, ${c.confidence}, ${c.aiReasoning || null}, ${c.processingMode || 'GROQ'},
            ${c.possibleDuplicateId || null}, ${c.possibleDuplicateTicket || null}, ${c.duplicateReason || null},
            ${c.vendorAlerted || null}, ${c.vendorPhone || null}, ${JSON.stringify(c.notes || [])}, ${c.createdAt}, ${c.updatedAt}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    isTableInitialized = true;
  } catch (err) {
    console.warn('[DB] Failed to ensure Postgres table:', err);
  }
}

function mapRowToComplaint(row: any): Complaint {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    residentName: row.resident_name,
    flatNumber: row.flat_number,
    wing: row.wing,
    rawMessage: row.raw_message,
    title: row.title,
    summary: row.summary,
    category: row.category as ComplaintCategory,
    priority: row.priority as ComplaintPriority,
    aiPriority: (row.ai_priority as ComplaintPriority) || (row.priority as ComplaintPriority),
    committeePriority: row.committee_priority as ComplaintPriority | undefined,
    status: row.status as ComplaintStatus,
    language: (row.language as ComplaintLanguage) || 'ENGLISH',
    confidence: Number(row.confidence) || 0.95,
    aiReasoning: row.ai_reasoning || undefined,
    processingMode: (row.processing_mode as 'GROQ' | 'LOCAL_FALLBACK') || 'GROQ',
    possibleDuplicateId: row.possible_duplicate_id || undefined,
    possibleDuplicateTicket: row.possible_duplicate_ticket || undefined,
    duplicateReason: row.duplicate_reason || undefined,
    vendorAlerted: row.vendor_alerted || undefined,
    vendorPhone: row.vendor_phone || undefined,
    notes: Array.isArray(row.notes) ? row.notes : typeof row.notes === 'string' ? JSON.parse(row.notes) : [],
    createdAt: typeof row.created_at === 'string' ? row.created_at : new Date(row.created_at).toISOString(),
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : new Date(row.updated_at).toISOString(),
  };
}

function getMemoryStore(): Complaint[] {
  if (!global.__societyComplaintsDb) {
    global.__societyComplaintsDb = JSON.parse(JSON.stringify(INITIAL_COMPLAINTS));
  }
  return global.__societyComplaintsDb as Complaint[];
}

export async function getAllComplaints(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  wing?: string;
  search?: string;
}): Promise<Complaint[]> {
  const sql = getNeonClient();

  let list: Complaint[] = [];

  if (sql) {
    try {
      await ensureTableExists();
      const rows = await sql`SELECT * FROM complaints ORDER BY created_at DESC`;
      list = rows.map(mapRowToComplaint);
    } catch (e) {
      console.warn('[DB] Postgres query failed, falling back to memory store:', e);
      list = [...getMemoryStore()];
    }
  } else {
    list = [...getMemoryStore()];
  }

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

export async function getComplaintById(id: string): Promise<Complaint | undefined> {
  const sql = getNeonClient();

  if (sql) {
    try {
      await ensureTableExists();
      const normalized = id.toLowerCase();
      const rows = await sql`
        SELECT * FROM complaints 
        WHERE LOWER(id) = ${normalized} OR LOWER(ticket_number) = ${normalized} 
        LIMIT 1
      `;
      if (rows.length > 0) {
        return mapRowToComplaint(rows[0]);
      }
      return undefined;
    } catch (e) {
      console.warn('[DB] getComplaintById failed, using memory store:', e);
    }
  }

  const store = getMemoryStore();
  const normalized = id.toLowerCase();
  return store.find((c) => c.id.toLowerCase() === normalized || c.ticketNumber.toLowerCase() === normalized);
}

export async function saveComplaint(
  data: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>
): Promise<Complaint> {
  const sql = getNeonClient();

  if (sql) {
    try {
      await ensureTableExists();
      const rows = await sql`SELECT ticket_number FROM complaints ORDER BY created_at DESC LIMIT 100`;
      let maxTicketNum = 1024;
      for (const r of rows) {
        const match = String(r.ticket_number || '').match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxTicketNum) maxTicketNum = num;
        }
      }
      const nextId = maxTicketNum + 1;
      const id = `sc-${nextId}`;
      const ticketNumber = `SC-${nextId}`;
      const now = new Date().toISOString();

      await sql`
        INSERT INTO complaints (
          id, ticket_number, resident_name, flat_number, wing, raw_message,
          title, summary, category, priority, ai_priority, committee_priority,
          status, language, confidence, ai_reasoning, processing_mode,
          possible_duplicate_id, possible_duplicate_ticket, duplicate_reason,
          vendor_alerted, vendor_phone, notes, created_at, updated_at
        ) VALUES (
          ${id}, ${ticketNumber}, ${data.residentName}, ${data.flatNumber}, ${data.wing}, ${data.rawMessage},
          ${data.title}, ${data.summary}, ${data.category}, ${data.priority}, ${data.aiPriority || data.priority}, ${data.committeePriority || null},
          ${data.status || 'OPEN'}, ${data.language || 'ENGLISH'}, ${data.confidence || 0.95}, ${data.aiReasoning || null}, ${data.processingMode || 'GROQ'},
          ${data.possibleDuplicateId || null}, ${data.possibleDuplicateTicket || null}, ${data.duplicateReason || null},
          ${data.vendorAlerted || null}, ${data.vendorPhone || null}, ${JSON.stringify(data.notes || [])}, ${now}, ${now}
        )
      `;

      return {
        ...data,
        id,
        ticketNumber,
        createdAt: now,
        updatedAt: now,
      };
    } catch (e) {
      console.warn('[DB] saveComplaint to Postgres failed, saving to memory store:', e);
    }
  }

  const store = getMemoryStore();
  const nextTicketId = (global.__societyNextTicketId || 1024) + 1;
  global.__societyNextTicketId = nextTicketId;

  const id = `sc-${nextTicketId}`;
  const ticketNumber = `SC-${nextTicketId}`;
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

export async function updateComplaint(
  id: string,
  updates: { status?: ComplaintStatus; priority?: ComplaintPriority; note?: string; duplicateResolved?: boolean }
): Promise<Complaint | null> {
  const sql = getNeonClient();

  if (sql) {
    try {
      await ensureTableExists();
      const current = await getComplaintById(id);
      if (!current) return null;

      const now = new Date().toISOString();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const updatedNotes = [...(current.notes || [])];
      if (updates.note) {
        updatedNotes.push(`[${timeStr}] ${updates.note}`);
      }
      if (updates.status && updates.status !== current.status) {
        updatedNotes.push(`[${timeStr}] Status changed from ${current.status} to ${updates.status}`);
      }
      const hasPriorityChange = updates.priority && updates.priority !== current.priority;
      if (hasPriorityChange) {
        updatedNotes.push(`[${timeStr}] Committee override priority from ${current.priority} to ${updates.priority}`);
      }

      const newStatus = updates.status || current.status;
      const newPriority = updates.priority || current.priority;
      const newCommitteePriority = hasPriorityChange ? updates.priority : current.committeePriority;
      const newPossibleDupId = updates.duplicateResolved ? null : (current.possibleDuplicateId || null);
      const newPossibleDupTicket = updates.duplicateResolved ? null : (current.possibleDuplicateTicket || null);

      await sql`
        UPDATE complaints SET
          status = ${newStatus},
          priority = ${newPriority},
          committee_priority = ${newCommitteePriority || null},
          notes = ${JSON.stringify(updatedNotes)},
          possible_duplicate_id = ${newPossibleDupId},
          possible_duplicate_ticket = ${newPossibleDupTicket},
          updated_at = ${now}
        WHERE LOWER(id) = LOWER(${current.id})
      `;

      return {
        ...current,
        status: newStatus,
        priority: newPriority,
        committeePriority: newCommitteePriority,
        notes: updatedNotes,
        possibleDuplicateId: newPossibleDupId || undefined,
        possibleDuplicateTicket: newPossibleDupTicket || undefined,
        updatedAt: now,
      };
    } catch (e) {
      console.warn('[DB] updateComplaint in Postgres failed, updating memory store:', e);
    }
  }

  const store = getMemoryStore();
  const normalized = id.toLowerCase();
  const index = store.findIndex((c) => c.id.toLowerCase() === normalized || c.ticketNumber.toLowerCase() === normalized);

  if (index === -1) return null;

  const current = store[index];
  const now = new Date().toISOString();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updatedNotes = [...(current.notes || [])];
  if (updates.note) {
    updatedNotes.push(`[${timeStr}] ${updates.note}`);
  }

  if (updates.status && updates.status !== current.status) {
    updatedNotes.push(`[${timeStr}] Status changed from ${current.status} to ${updates.status}`);
  }

  const hasPriorityChange = updates.priority && updates.priority !== current.priority;
  if (hasPriorityChange) {
    updatedNotes.push(`[${timeStr}] Committee override priority from ${current.priority} to ${updates.priority}`);
  }

  const updatedComplaint: Complaint = {
    ...current,
    status: updates.status || current.status,
    priority: updates.priority || current.priority,
    aiPriority: current.aiPriority || current.priority,
    committeePriority: hasPriorityChange ? updates.priority : current.committeePriority,
    notes: updatedNotes,
    possibleDuplicateId: updates.duplicateResolved ? undefined : current.possibleDuplicateId,
    possibleDuplicateTicket: updates.duplicateResolved ? undefined : current.possibleDuplicateTicket,
    updatedAt: now,
  };

  store[index] = updatedComplaint;
  return updatedComplaint;
}

export async function resetDatabaseToDemoData(): Promise<Complaint[]> {
  const sql = getNeonClient();

  if (sql) {
    try {
      await ensureTableExists();
      await sql`DELETE FROM complaints`;
      for (const c of INITIAL_COMPLAINTS) {
        await sql`
          INSERT INTO complaints (
            id, ticket_number, resident_name, flat_number, wing, raw_message,
            title, summary, category, priority, ai_priority, committee_priority,
            status, language, confidence, ai_reasoning, processing_mode,
            possible_duplicate_id, possible_duplicate_ticket, duplicate_reason,
            vendor_alerted, vendor_phone, notes, created_at, updated_at
          ) VALUES (
            ${c.id}, ${c.ticketNumber}, ${c.residentName}, ${c.flatNumber}, ${c.wing}, ${c.rawMessage},
            ${c.title}, ${c.summary}, ${c.category}, ${c.priority}, ${c.aiPriority || c.priority}, ${c.committeePriority || null},
            ${c.status}, ${c.language}, ${c.confidence}, ${c.aiReasoning || null}, ${c.processingMode || 'GROQ'},
            ${c.possibleDuplicateId || null}, ${c.possibleDuplicateTicket || null}, ${c.duplicateReason || null},
            ${c.vendorAlerted || null}, ${c.vendorPhone || null}, ${JSON.stringify(c.notes || [])}, ${c.createdAt}, ${c.updatedAt}
          );
        `;
      }
      return [...INITIAL_COMPLAINTS];
    } catch (e) {
      console.warn('[DB] resetDatabaseToDemoData failed, resetting memory store:', e);
    }
  }

  global.__societyComplaintsDb = JSON.parse(JSON.stringify(INITIAL_COMPLAINTS));
  global.__societyNextTicketId = 1025;
  return global.__societyComplaintsDb as Complaint[];
}

export async function getDashboardStats(): Promise<DashboardStatsData> {
  const all = await getAllComplaints();
  const active = all.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
  const resolved = all.filter((c) => c.status === 'RESOLVED');

  return {
    totalActive: active.length,
    urgent: active.filter((c) => c.priority === 'URGENT').length,
    high: active.filter((c) => c.priority === 'HIGH').length,
    medium: active.filter((c) => c.priority === 'MEDIUM').length,
    low: active.filter((c) => c.priority === 'LOW').length,
    open: all.filter((c) => c.status === 'OPEN').length,
    inProgress: all.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: resolved.length,
  };
}
