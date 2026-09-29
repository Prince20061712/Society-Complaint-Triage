import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Attempt to load .env.local if present and not already loaded
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('❌ Error: Neither DATABASE_URL nor POSTGRES_URL environment variable is set.');
  console.error('👉 Please configure DATABASE_URL in your .env.local file or Vercel project environment.');
  process.exit(1);
}

const sql = neon(databaseUrl);

const DEMO_COMPLAINTS = [
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

async function seed() {
  console.log('🌱 Connecting to database and running schema migrations...');

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

  console.log('✅ Table "complaints" is ready.');
  console.log(`📦 Seeding ${DEMO_COMPLAINTS.length} curated demonstration complaints...`);

  let insertedCount = 0;
  for (const c of DEMO_COMPLAINTS) {
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
      )
      ON CONFLICT (id) DO UPDATE SET
        ticket_number = EXCLUDED.ticket_number,
        resident_name = EXCLUDED.resident_name,
        flat_number = EXCLUDED.flat_number,
        wing = EXCLUDED.wing,
        raw_message = EXCLUDED.raw_message,
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        category = EXCLUDED.category,
        priority = EXCLUDED.priority,
        ai_priority = EXCLUDED.ai_priority,
        status = EXCLUDED.status,
        language = EXCLUDED.language,
        confidence = EXCLUDED.confidence,
        ai_reasoning = EXCLUDED.ai_reasoning,
        processing_mode = EXCLUDED.processing_mode,
        possible_duplicate_id = EXCLUDED.possible_duplicate_id,
        possible_duplicate_ticket = EXCLUDED.possible_duplicate_ticket,
        duplicate_reason = EXCLUDED.duplicate_reason,
        notes = EXCLUDED.notes;
    `;
    insertedCount++;
  }

  console.log(`🎉 Database successfully seeded with ${insertedCount} demo complaints!`);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
