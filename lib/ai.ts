import { AITriageResult, ComplaintCategory, ComplaintLanguage, ComplaintPriority } from '@/types/complaint';

const VALID_CATEGORIES: ComplaintCategory[] = [
  'WATER',
  'LIFT',
  'ELECTRICITY',
  'PARKING',
  'CLEANING',
  'NOISE',
  'SECURITY',
  'OTHER',
];

const VALID_PRIORITIES: ComplaintPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
const VALID_LANGUAGES: ComplaintLanguage[] = ['ENGLISH', 'HINDI', 'HINGLISH'];

export async function analyzeComplaintWithAI(message: string, flatNumber: string): Promise<AITriageResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
    try {
      const llmResult = await callGroqLLM(message, flatNumber, apiKey);
      if (llmResult) {
        return llmResult;
      }
    } catch (err: any) {
      console.warn('Groq AI call failed, falling back to local NLP triage engine:', err?.message || err);
    }
  }

  // Fallback to local intelligent NLP triage engine
  return localTriageEngine(message, flatNumber);
}

async function callGroqLLM(message: string, flatNumber: string, apiKey: string): Promise<AITriageResult | null> {
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

  const systemPrompt = `You are an AI complaint triage assistant for a 100-flat residential housing society committee.
Residents send complaints in English, Hindi, or Hinglish (Hindi written in Roman script).
Analyze the complaint and return a strictly valid JSON object with the following fields:
{
  "title": "Clear concise English title (max 8 words)",
  "summary": "1-2 sentence professional English summary of the issue",
  "category": "WATER" | "LIFT" | "ELECTRICITY" | "PARKING" | "CLEANING" | "NOISE" | "SECURITY" | "OTHER",
  "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW",
  "language": "ENGLISH" | "HINDI" | "HINGLISH",
  "confidence": 0.85 to 0.99,
  "aiReasoning": "1 concise factual sentence explaining why this category and priority were determined based on severity, safety risk, and resident impact"
}

Priority guidelines:
- URGENT: Life safety hazards, person trapped in elevator, electrical sparks/fire hazard, gas leak, security breach/intruder, major burst pipe flooding.
- HIGH: Whole wing water supply stoppage, both lifts down, residential power cut, severe active pipe leak.
- MEDIUM: Parking slot blockage, loud noise disturbance, single lift working but slow/jerking, minor seepage, pet nuisance.
- LOW: Corridor bulb fused, dustbin overflow, gym AC remote missing, garden maintenance, minor cosmetic issues.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second safety timeout

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Resident Flat: ${flatNumber}\nResident Message: "${message}"\nOutput JSON:` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Groq API returned HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return null;
    }

    const parsed = JSON.parse(rawContent);

    // Validate structured output fields
    const category: ComplaintCategory = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'OTHER';
    const priority: ComplaintPriority = VALID_PRIORITIES.includes(parsed.priority) ? parsed.priority : 'MEDIUM';
    const language: ComplaintLanguage = VALID_LANGUAGES.includes(parsed.language) ? parsed.language : 'ENGLISH';
    const confidence =
      typeof parsed.confidence === 'number' && parsed.confidence >= 0.5 && parsed.confidence <= 1
        ? parsed.confidence
        : 0.95;

    const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : 'Resident Issue';
    const summary = typeof parsed.summary === 'string' && parsed.summary.trim() ? parsed.summary.trim() : message;
    const aiReasoning =
      typeof parsed.aiReasoning === 'string' && parsed.aiReasoning.trim()
        ? parsed.aiReasoning.trim()
        : `Classified as ${category} (${priority}) based on reported resident issue.`;

    return {
      title,
      summary,
      category,
      priority,
      language,
      confidence,
      aiReasoning,
      processingMode: 'GROQ',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Groq completion error:', err?.message || err);
    return null;
  }
}

export function localTriageEngine(message: string, flatNumber: string): AITriageResult {
  const lower = message.toLowerCase();

  // Detect Language
  let language: ComplaintLanguage = 'ENGLISH';
  const hinglishTokens = [
    'bhai',
    'yaar',
    'hai',
    'hain',
    'mein',
    'me',
    'ki',
    'ka',
    'ke',
    'nahi',
    'karo',
    'band',
    'paani',
    'bijli',
    'phas',
    'gaye',
    'se',
    'ko',
    'aur',
    'bohot',
    'kripya',
    'jaldi',
    'atak',
  ];
  const hindiRegex = /[\u0900-\u097F]/;

  if (hindiRegex.test(message)) {
    language = 'HINDI';
  } else if (hinglishTokens.some((t) => lower.includes(` ${t} `) || lower.startsWith(`${t} `) || lower.endsWith(` ${t}`))) {
    language = 'HINGLISH';
  }

  // Detect Categories & Priorities with English, Hinglish, and Devanagari Hindi keywords
  let category: ComplaintCategory = 'OTHER';
  let priority: ComplaintPriority = 'MEDIUM';
  let title = 'General Resident Issue';
  let summary = `Resident from flat ${flatNumber} reported an issue: "${message.slice(0, 100)}..."`;
  let aiReasoning = 'Classified via local fallback heuristics.';

  // 1. Lift emergencies & issues
  if (
    lower.includes('lift') ||
    lower.includes('elevator') ||
    lower.includes('phas') ||
    lower.includes('trapped') ||
    lower.includes('atak') ||
    message.includes('लिफ्ट') ||
    message.includes('फंस') ||
    message.includes('अटक')
  ) {
    category = 'LIFT';
    if (
      lower.includes('trap') ||
      lower.includes('phas') ||
      lower.includes('uncle') ||
      lower.includes('baccha') ||
      lower.includes('child') ||
      lower.includes('emergency') ||
      message.includes('फंस') ||
      message.includes('बच्चा')
    ) {
      priority = 'URGENT';
      title = 'Person trapped in elevator';
      summary = 'An emergency report indicates an individual is trapped inside the lift. Immediate elevator technician and security dispatch required.';
      aiReasoning = 'Person trapped in lift presents an immediate life-safety hazard, requiring emergency response.';
    } else if (
      lower.includes('band') ||
      lower.includes('not working') ||
      lower.includes('down') ||
      lower.includes('broken') ||
      lower.includes('kal se') ||
      lower.includes('atak') ||
      message.includes('बंद') ||
      message.includes('खराब') ||
      message.includes('अटक')
    ) {
      priority = 'HIGH';
      title = 'Lift out of service';
      summary = 'Resident reports the elevator is non-functional, affecting mobility for floor residents.';
      aiReasoning = 'Elevator breakdown impacts building mobility and vertical access for residents.';
    } else {
      priority = 'MEDIUM';
      title = 'Lift maintenance requirement';
      summary = 'Resident noted abnormal noise, jerking, or light fault in the elevator.';
      aiReasoning = 'Lift operational fault reported without immediate safety entrapment.';
    }
  }
  // 2. Water issues
  else if (
    lower.includes('water') ||
    lower.includes('paani') ||
    lower.includes('tank') ||
    lower.includes('leak') ||
    lower.includes('pipe') ||
    lower.includes('pump') ||
    lower.includes('tap') ||
    lower.includes('flush') ||
    message.includes('पानी') ||
    message.includes('टंकी') ||
    message.includes('पाइप') ||
    message.includes('नल')
  ) {
    category = 'WATER';
    if (lower.includes('burst') || lower.includes('flood') || lower.includes('overflowing') || message.includes('बाढ़')) {
      priority = 'URGENT';
      title = 'Major water pipe burst / flooding';
      summary = 'Severe water flooding reported. Requires main valve shutoff immediately.';
      aiReasoning = 'Major pipe burst causes property damage and electrical hazard risk.';
    } else if (
      lower.includes('band') ||
      lower.includes('no water') ||
      lower.includes('outage') ||
      lower.includes('pump trip') ||
      lower.includes('overhead') ||
      lower.includes('nahi aa raha') ||
      message.includes('नहीं आ रहा') ||
      message.includes('बंद')
    ) {
      priority = 'HIGH';
      title = 'Water supply stoppage';
      summary = 'Water supply outage reported affecting residents. Main supply line or overhead tank pump requires inspection.';
      aiReasoning = 'Essential water utility disruption affecting flats requires high-priority resolution.';
    } else {
      priority = 'MEDIUM';
      title = 'Plumbing or tap leakage';
      summary = 'Resident reported a pipe leakage or water flow inconsistency.';
      aiReasoning = 'Routine plumbing or fixture maintenance required.';
    }
  }
  // 3. Electricity / Power
  else if (
    lower.includes('current') ||
    lower.includes('bijli') ||
    lower.includes('electric') ||
    lower.includes('spark') ||
    lower.includes('meter') ||
    lower.includes('wire') ||
    lower.includes('blackout') ||
    lower.includes('power') ||
    message.includes('बिजली') ||
    message.includes('करंट') ||
    message.includes('स्पार्क') ||
    message.includes('मीटर')
  ) {
    category = 'ELECTRICITY';
    if (lower.includes('spark') || lower.includes('fire') || lower.includes('dhua') || lower.includes('smoke') || lower.includes('shock') || message.includes('धुआं') || message.includes('आग')) {
      priority = 'URGENT';
      title = 'Electrical sparking / hazard reported';
      summary = 'Dangerous electrical hazard or sparking reported in meter room or corridor. Immediate safety cutoff required.';
      aiReasoning = 'Electrical sparking poses an active fire hazard and threat to life safety.';
    } else if (lower.includes('power cut') || lower.includes('bijli band') || lower.includes('blackout') || lower.includes('no electricity') || message.includes('कटौती')) {
      priority = 'HIGH';
      title = 'Power outage in residential block';
      summary = 'Electricity failure reported affecting multiple flats. Society electrician or state utility to be informed.';
      aiReasoning = 'Power loss interrupts essential services for residential occupants.';
    } else {
      priority = 'LOW';
      title = 'Common area bulb / lighting issue';
      summary = 'Common corridor tube light or staircase bulb reported fused.';
      aiReasoning = 'Minor fixture replacement needed with low immediate risk.';
    }
  }
  // 4. Parking
  else if (
    lower.includes('parking') ||
    lower.includes('car') ||
    lower.includes('gaadi') ||
    lower.includes('bike') ||
    lower.includes('slot') ||
    lower.includes('creta') ||
    lower.includes('scooter') ||
    lower.includes('blocking') ||
    message.includes('पार्किंग') ||
    message.includes('गाड़ी')
  ) {
    category = 'PARKING';
    priority = lower.includes('blocking') || lower.includes('urgent') || message.includes('रोका') ? 'MEDIUM' : 'LOW';
    title = 'Vehicle blocking designated parking slot';
    summary = 'Resident reports an unauthorized vehicle or visitor car parked in a private or reserved parking space.';
    aiReasoning = 'Unauthorized parking causes resident inconvenience but no physical hazard.';
  }
  // 5. Cleaning & Sanitation
  else if (
    lower.includes('clean') ||
    lower.includes('dustbin') ||
    lower.includes('kachra') ||
    lower.includes('garbage') ||
    lower.includes('sweep') ||
    lower.includes('smell') ||
    lower.includes('stairs') ||
    message.includes('सफाई') ||
    message.includes('कचरा') ||
    message.includes('कूड़ा')
  ) {
    category = 'CLEANING';
    priority = lower.includes('decay') || lower.includes('severely dirty') ? 'MEDIUM' : 'LOW';
    title = 'Garbage or housekeeping oversight';
    summary = 'Dustbin overflow or unattended trash reported in the corridor or stair landing.';
    aiReasoning = 'Sanitation issue affecting common area hygiene.';
  }
  // 6. Noise
  else if (
    lower.includes('noise') ||
    lower.includes('music') ||
    lower.includes('loud') ||
    lower.includes('sound') ||
    lower.includes('chillar') ||
    lower.includes('barking') ||
    lower.includes('party') ||
    message.includes('शोर') ||
    message.includes('आवाज़') ||
    message.includes('गाना')
  ) {
    category = 'NOISE';
    priority = lower.includes('night') || lower.includes('raat') || lower.includes('2am') ? 'MEDIUM' : 'LOW';
    title = 'Noise disturbance in residential wing';
    summary = 'Excessive noise, late-night music, or disturbance reported disrupting peace for neighboring flats.';
    aiReasoning = 'Noise disturbance disrupting residential tranquility.';
  }
  // 7. Security
  else if (
    lower.includes('security') ||
    lower.includes('guard') ||
    lower.includes('gate') ||
    lower.includes('theft') ||
    lower.includes('chor') ||
    lower.includes('stranger') ||
    lower.includes('cctv') ||
    message.includes('सुरक्षा') ||
    message.includes('गार्ड') ||
    message.includes('चोर')
  ) {
    category = 'SECURITY';
    if (lower.includes('theft') || lower.includes('break-in') || lower.includes('chor') || lower.includes('unauthorized entry') || message.includes('चोरी')) {
      priority = 'URGENT';
      title = 'Security breach or intruder alert';
      summary = 'Security protocol violation or suspicious individuals reported inside society premises.';
      aiReasoning = 'Reported theft or intruder breach threatens resident safety and property.';
    } else {
      priority = 'HIGH';
      title = 'Security desk oversight';
      summary = 'Guard post unattended or visitor logging laxity reported at society gate.';
      aiReasoning = 'Gate security lapses need immediate guard supervisor attention.';
    }
  }

  return {
    title,
    summary,
    category,
    priority,
    language,
    confidence: 0.94,
    aiReasoning,
    processingMode: 'LOCAL_FALLBACK',
  };
}
