# Society Complaint Triage

> **Live Deployment:** [https://society-complaint-triage.vercel.app](https://society-complaint-triage.vercel.app)  
> Built for **Vibe Coding Event 2026 — Day 1 (29th)**  
> **Problem Statement #2:** Society Complaint Triage  
> **Target Persona:** Housing Society Committee Volunteers (~100 flats)

## Problem & Solution

How might we take messy resident complaints and use AI to sort, prioritise, and track them until they are resolved?

In a typical 100-flat housing society, resident complaints arrive through noisy WhatsApp chats, calls, and informal messages in mixed English, Hindi, and Hinglish. Critical emergencies (such as senior citizens trapped in lifts, electrical sparking, or water tank overflows) get buried under routine parking or noise complaints. Committee volunteers—who have only a few minutes a day—are overwhelmed trying to decipher, organize, and follow up on issues.

**Society Complaint Triage** automates the entire intake, comprehension, prioritization, duplicate clustering, and resolution lifecycle into a streamlined volunteer dashboard and resident portal.

### Constraint Addressed

There are around 100 flats, complaints come in mixed English and Hindi, and committee members can spare only a few minutes a day.

* **Multilingual Understanding:** Understands raw colloquial English, Hindi, and Hinglish complaints directly without requiring residents to structure their thoughts.
* **Triage in Under 60 Seconds:** Automatically assigns severity priorities (`URGENT`, `HIGH`, `MEDIUM`, `LOW`) and routes emergency issues to pre-assigned vendor hotlines.
* **Duplicate Detection:** Prevents repeated complaints about the same breakdown (e.g., multiple flats reporting "Lift 1 not working") from cluttering the committee queue.
* **Zero Overhead for Volunteers:** Committee members can review the urgent queue, verify AI decisions with human-in-the-loop overrides, and update resolution statuses in seconds.

---

## Core AI Architecture

- **Model / Service:**
  - **Primary Engine:** Groq Cloud LLM (`openai/gpt-oss-20b` / `llama-3.3-70b-versatile`) utilizing strict server-side JSON schema generation for deterministic structured output.
  - **Local Heuristic Rule Engine (Zero-Downtime Fallback):** Built-in multilingual keyword and regex classifier that operates instantly if cloud APIs experience rate limits, network outages, or key misconfigurations.

- **Workflow:**
  1. **Intake & Normalization:** Resident submits an unstructured complaint via the Resident Portal in natural English, Hindi, or Hinglish.
  2. **Multilingual Processing:** The server-side AI pipeline identifies the source language, produces an executive English title, generates a concise one-sentence summary, and classifies the category (`WATER`, `LIFT`, `ELECTRICITY`, `PARKING`, `CLEANING`, `SECURITY`, `NOISE`, `MAINTENANCE`).
  3. **Priority & Life-Safety Scoring:** Evaluates life-safety risks, structural damage potential, and active disruptions to score severity (`URGENT`, `HIGH`, `MEDIUM`, `LOW`) accompanied by transparent AI reasoning.
  4. **Emergency Vendor Routing:** Pre-assigns verified vendor contacts (e.g., Otis Elevators, society electrician, emergency plumber) for critical tickets.
  5. **Duplicate Clustering:** Compares incoming complaints against active tickets using category matching, flat/wing proximity, and semantic similarity to flag duplicates before action is taken.
  6. **Durable Persistence:** Persists tickets into Neon Serverless PostgreSQL with full audit notes.
  7. **Volunteer Action:** Committee reviews prioritized cards on the Neumorphic Dashboard, executes human-in-the-loop priority overrides, appends notes, and tracks status (`OPEN` → `IN_PROGRESS` → `RESOLVED`).

- **Error Handling:**
  - **Graceful Fallback:** If the external LLM call fails or times out, the system automatically falls back to the deterministic local rule engine without crashing or interrupting the user.
  - **Unclear or Ambiguous Inputs:** Unclear reports are tagged with lower confidence scores, assigned a `LOW` or `MEDIUM` triage baseline, and flagged with an advisory reasoning note directing committee members to seek clarification.
  - **Input Validation:** Strict server-side schema validation guards against empty text, malformed payloads, or cross-tenant injection attempts.

---

## Prerequisites & Installation

```bash
# 1. Clone repository
git clone https://github.com/Prince20061712/Society-Complaint-Triage.git
cd Society-Complaint-Triage

# 2. Install dependencies
npm install

# 3. Environment variables
# Copy template and add your credentials to .env.local:
cp .env.example .env.local

# Required keys in .env.local:
# GROQ_API_KEY=your_groq_api_key_here
# DATABASE_URL=your_postgresql_connection_string

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001`) in your browser.

---

## Demo Credentials (Competition Evaluation)

The application includes a role-based login screen with one-touch demo credential buttons:

| Role | Demo Username / Email | Demo Password | Starting Destination |
|---|---|---|---|
| **Resident** | `resident@greenvalley.demo` | `Resident@123` | Resident Portal (`/`) |
| **Committee** | `committee@greenvalley.demo` | `Committee@123` | Committee Dashboard (`/dashboard`) |

> *Clicking `[ Resident ]` or `[ Committee ]` on the login page autofills the demo credentials. Press **"Sign In"** to authenticate via secure HTTP-only cookie sessions.*

---

## Participant Info

- **Name:** Prince Gupta
- **College ID:** princegupta09372@gmail.com

- **Day:** Day 1 (29th)
