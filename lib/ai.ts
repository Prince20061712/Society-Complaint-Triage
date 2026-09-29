import { AITriageResult, ComplaintCategory, ComplaintLanguage, ComplaintPriority } from '@/types/complaint';

interface TriageRuleMatch {
  category: ComplaintCategory;
  priority: ComplaintPriority;
  language: ComplaintLanguage;
  title: string;
  summary: string;
}

export async function analyzeComplaintWithAI(message: string, flatNumber: string): Promise<AITriageResult> {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const llmResult = await callLLM(message, flatNumber, apiKey);
      if (llmResult) {
        return llmResult;
      }
    } catch (err) {
      console.warn('External AI call failed, falling back to local NLP triage engine:', err);
    }
  }

  // Fallback to local intelligent NLP triage engine
  return localTriageEngine(message, flatNumber);
}

async function callLLM(message: string, flatNumber: string, apiKey: string): Promise<AITriageResult | null> {
  // Supports Gemini or standard OpenAI-compatible endpoints
  const isGemini = apiKey.startsWith('AIza') || process.env.AI_PROVIDER === 'gemini';

  const systemPrompt = `You are an AI complaint triage assistant for a 100-flat residential housing society committee.
Residents send complaints in English, Hindi, or Hinglish (Hindi written in Roman script).
Analyze the complaint and return a strictly valid JSON object with the following fields:
{
  "title": "Clear concise English title (max 8 words)",
  "summary": "1-2 sentence professional English summary of the issue",
  "category": "WATER" | "LIFT" | "ELECTRICITY" | "PARKING" | "CLEANING" | "NOISE" | "SECURITY" | "OTHER",
  "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW",
  "language": "ENGLISH" | "HINDI" | "HINGLISH",
  "confidence": 0.85 to 0.99
}

Priority guidelines:
- URGENT: Life safety, person trapped in lift, electrical fire/sparks, gas leak, security breach, massive flood.
- HIGH: Whole wing water outage, both lifts down, main power cut, severe water leak.
- MEDIUM: Parking blocking, loud noise, single lift working but slow, seepage, pet nuisance.
- LOW: Corridor bulb fused, dustbin overflow, gym AC remote missing, garden maintenance.`;

  if (isGemini) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nResident Flat: ${flatNumber}\nResident Message: "${message}"\nOutput JSON:` },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText);
      }
    }
  }

  return null;
}

export function localTriageEngine(message: string, flatNumber: string): AITriageResult {
  const lower = message.toLowerCase();

  // Detect Language
  let language: ComplaintLanguage = 'ENGLISH';
  const hinglishTokens = ['bhai', 'yaar', 'hai', 'hain', 'mein', 'me', 'ki', 'ka', 'ke', 'nahi', 'karo', 'band', 'paani', 'bijli', 'phas', 'gaye', 'se', 'ko', 'aur', 'bohot', 'kripya'];
  const hindiRegex = /[\u0900-\u097F]/;

  if (hindiRegex.test(message)) {
    language = 'HINDI';
  } else if (hinglishTokens.some((t) => lower.includes(` ${t} `) || lower.startsWith(`${t} `) || lower.endsWith(` ${t}`))) {
    language = 'HINGLISH';
  }

  // Detect Categories & Priorities
  let category: ComplaintCategory = 'OTHER';
  let priority: ComplaintPriority = 'MEDIUM';
  let title = 'General Resident Issue';
  let summary = `Resident from flat ${flatNumber} reported an issue: "${message.slice(0, 100)}..."`;

  // 1. Lift emergencies & issues
  if (lower.includes('lift') || lower.includes('elevator') || lower.includes('phas') || lower.includes('trapped')) {
    category = 'LIFT';
    if (lower.includes('trap') || lower.includes('phas') || lower.includes('uncle') || lower.includes('baccha') || lower.includes('child') || lower.includes('emergency')) {
      priority = 'URGENT';
      title = 'Person trapped in elevator';
      summary = `An emergency report indicates an individual is trapped inside the lift. Immediate elevator technician and security dispatch required.`;
    } else if (lower.includes('band') || lower.includes('not working') || lower.includes('down') || lower.includes('broken') || lower.includes('kal se')) {
      priority = 'HIGH';
      title = 'Lift out of service';
      summary = `Resident reports the elevator is non-functional, affecting mobility for floor residents.`;
    } else {
      priority = 'MEDIUM';
      title = 'Lift maintenance requirement';
      summary = `Resident noted abnormal noise, jerking, or light fault in the elevator.`;
    }
  }
  // 2. Water issues
  else if (lower.includes('water') || lower.includes('paani') || lower.includes('tank') || lower.includes('leak') || lower.includes('pipe') || lower.includes('pump') || lower.includes('tap') || lower.includes('flush')) {
    category = 'WATER';
    if (lower.includes('burst') || lower.includes('flood') || lower.includes('overflowing') || lower.includes('short circuit water')) {
      priority = 'URGENT';
      title = 'Major water pipe burst / flooding';
      summary = `Severe water flooding reported. Requires main valve shutoff immediately.`;
    } else if (lower.includes('band') || lower.includes('no water') || lower.includes('outage') || lower.includes('pump trip') || lower.includes('overhead')) {
      priority = 'HIGH';
      title = 'Water supply stoppage';
      summary = `Water supply outage reported affecting residents. Main supply line or overhead tank pump requires inspection.`;
    } else {
      priority = 'MEDIUM';
      title = 'Plumbing or tap leakage';
      summary = `Resident reported a minor pipe leakage or water flow inconsistency.`;
    }
  }
  // 3. Electricity / Power
  else if (lower.includes('current') || lower.includes('bijli') || lower.includes('electric') || lower.includes('spark') || lower.includes('meter') || lower.includes('wire') || lower.includes('blackout') || lower.includes('power')) {
    category = 'ELECTRICITY';
    if (lower.includes('spark') || lower.includes('fire') || lower.includes('dhua') || lower.includes('smoke') || lower.includes('shock')) {
      priority = 'URGENT';
      title = 'Electrical sparking / hazard reported';
      summary = `Dangerous electrical hazard or sparking reported in meter room or corridor. Immediate safety cutoff required.`;
    } else if (lower.includes('power cut') || lower.includes('bijli band') || lower.includes('blackout') || lower.includes('no electricity')) {
      priority = 'HIGH';
      title = 'Power outage in residential block';
      summary = `Electricity failure reported affecting multiple flats. Society electrician or state utility to be informed.`;
    } else {
      priority = 'LOW';
      title = 'Common area bulb / lighting issue';
      summary = `Common corridor tube light or staircase bulb reported fused.`;
    }
  }
  // 4. Parking
  else if (lower.includes('parking') || lower.includes('car') || lower.includes('gaadi') || lower.includes('bike') || lower.includes('slot') || lower.includes('creta') || lower.includes('scooter') || lower.includes('blocking')) {
    category = 'PARKING';
    priority = lower.includes('blocking') || lower.includes('urgent') ? 'MEDIUM' : 'LOW';
    title = 'Vehicle blocking designated parking slot';
    summary = `Resident reports an unauthorized vehicle or visitor car parked in a private or reserved parking space.`;
  }
  // 5. Cleaning & Sanitation
  else if (lower.includes('clean') || lower.includes('dustbin') || lower.includes('kachra') || lower.includes('garbage') || lower.includes('sweep') || lower.includes('smell') || lower.includes('stairs')) {
    category = 'CLEANING';
    priority = lower.includes('decay') || lower.includes('severely dirty') ? 'MEDIUM' : 'LOW';
    title = 'Garbage or housekeeping oversight';
    summary = `Dustbin overflow or unattended trash reported in the corridor or stair landing.`;
  }
  // 6. Noise
  else if (lower.includes('noise') || lower.includes('music') || lower.includes('loud') || lower.includes('sound') || lower.includes('chillar') || lower.includes('barking') || lower.includes('party')) {
    category = 'NOISE';
    priority = lower.includes('night') || lower.includes('raat') || lower.includes('2am') ? 'MEDIUM' : 'LOW';
    title = 'Noise disturbance in residential wing';
    summary = `Excessive noise, late-night music, or disturbance reported disrupting peace for neighboring flats.`;
  }
  // 7. Security
  else if (lower.includes('security') || lower.includes('guard') || lower.includes('gate') || lower.includes('theft') || lower.includes('chor') || lower.includes('stranger') || lower.includes('cctv')) {
    category = 'SECURITY';
    if (lower.includes('theft') || lower.includes('break-in') || lower.includes('chor') || lower.includes('unauthorized entry')) {
      priority = 'URGENT';
      title = 'Security breach or intruder alert';
      summary = `Security protocol violation or suspicious individuals reported inside society premises.`;
    } else {
      priority = 'HIGH';
      title = 'Security desk oversight';
      summary = `Guard post unattended or visitor logging laxity reported at society gate.`;
    }
  }

  return {
    title,
    summary,
    category,
    priority,
    language,
    confidence: 0.94,
  };
}
