# Society Complaint Triage

> Built for **Vibe Coding Event 2026 — Day 1 (29th)**
> **Problem Statement #2:** Society Complaint Triage
> **Target Persona:** Housing Society Committee Volunteers (~100 flats)

## Problem & Solution

Housing society committees receive complaints through chat messages in mixed English, Hindi, and Hinglish. Complaints about lifts, water, parking, cleaning, noise, and other issues can pile up, making urgent problems difficult to identify and track.

**Society Complaint Triage** converts messy resident complaints into structured, prioritized tickets using AI.

The system:

1. Accepts complaints in English, Hindi, or Hinglish.
2. Uses AI to understand and summarize the complaint.
3. Categorizes the complaint.
4. Assigns a priority based on the reported severity.
5. Detects possible duplicate complaints.
6. Presents the committee with a prioritized action queue.
7. Tracks complaints from open to resolved.

### Core Value

> **Instead of reading every complaint, committee members can focus on what needs attention first.**

## Constraint Addressed

The solution is designed for a society of approximately 100 flats where:

* Complaints arrive in mixed English, Hindi, and Hinglish.
* Multiple residents may report the same issue.
* Committee members have only a few minutes per day.
* Urgent issues should not get buried under routine complaints.

## MVP Features

### Resident

* Submit a complaint
* Enter name and flat number
* Write the complaint naturally in English, Hindi, or Hinglish
* Receive a complaint ticket after submission

### AI Triage

The AI extracts:

* Language
* Complaint title
* Summary
* Category
* Priority
* Confidence

Supported categories:

* Water
* Lift
* Electricity
* Parking
* Cleaning
* Noise
* Security
* Other

Supported priorities:

* Urgent
* High
* Medium
* Low

### Committee

The committee dashboard provides:

* Priority-based complaint queue
* Complaint details
* AI-generated summary
* Category and priority
* Possible duplicate detection
* Status tracking
* Resolution notes

Complaint lifecycle:

```text
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

## Core AI Architecture

### Model / Service

The application uses an LLM API for complaint understanding and structured triage.

The AI is instructed to return structured JSON containing the complaint category, priority, normalized summary, detected language, and confidence.

### Workflow

```text
Resident complaint
        ↓
Input validation
        ↓
AI language understanding
        ↓
Normalization + summary
        ↓
Category classification
        ↓
Priority classification
        ↓
Duplicate comparison
        ↓
Database ticket
        ↓
Committee dashboard
        ↓
Status tracking
```

### Duplicate Detection

New complaints are compared against unresolved complaints.

The AI identifies whether another unresolved complaint appears to describe the same issue.

Duplicates are **suggested**, not automatically merged, allowing the committee to make the final decision.

### Error Handling

If the AI service is unavailable:

* The complaint is still stored.
* The complaint is marked for manual review.
* Default classification values are used.

If the AI returns invalid structured data:

1. Validate the response.
2. Retry once.
3. Fall back to manual review if necessary.

If a complaint is unclear, the system does not invent information. It assigns `OTHER`, uses a moderate default priority, and flags the complaint for committee review.

## Architecture

```text
                 Resident
                    │
                    ▼
             Next.js Frontend
                    │
                    ▼
             Next.js API Routes
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       AI Service          PostgreSQL
          │                   │
          └─────────┬─────────┘
                    ▼
          Committee Dashboard
```

## Technology Stack

* Next.js
* TypeScript
* Tailwind CSS
* PostgreSQL
* AI/LLM API
* Prisma ORM

## Project Structure

```text
society-complaint-triage/
│
├── app/
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── complaints/
│   │   └── [id]/
│   │       └── page.tsx
│   └── api/
│       ├── complaints/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       └── dashboard/
│           └── route.ts
│
├── components/
│   ├── ComplaintForm.tsx
│   ├── ComplaintCard.tsx
│   ├── PriorityBadge.tsx
│   ├── StatusBadge.tsx
│   ├── DashboardStats.tsx
│   └── DuplicateAlert.tsx
│
├── lib/
│   ├── db.ts
│   ├── ai.ts
│   ├── triage.ts
│   ├── duplicate.ts
│   └── validation.ts
│
├── prisma/
│   └── schema.prisma
│
├── types/
│   └── complaint.ts
│
├── public/
├── .env.example
├── package.json
└── README.md
```

## Prerequisites & Installation

```bash
# 1. Clone repository
git clone <REPO_URL>

# 2. Enter directory
cd society-complaint-triage

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env.local
```

Add the required environment variables:

```env
DATABASE_URL=your_postgresql_connection_string
AI_API_KEY=your_ai_api_key
```

Initialize the database:

```bash
npx prisma generate
npx prisma migrate dev
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## API

### Create Complaint

```http
POST /api/complaints
```

```json
{
  "residentName": "Rahul Sharma",
  "flatNumber": "A-203",
  "message": "2nd floor ki lift kal se band hai"
}
```

### Get Complaints

```http
GET /api/complaints
```

Optional filters:

```text
?status=OPEN
?priority=URGENT
?category=LIFT
```

### Update Complaint

```http
PATCH /api/complaints/:id
```

```json
{
  "status": "IN_PROGRESS",
  "note": "Technician contacted"
}
```

### Dashboard

```http
GET /api/dashboard
```

## Demo Scenario

Example resident complaint:

```text
"bhai 2nd floor ki lift mein uncle phas gaye hain"
```

AI output:

```json
{
  "category": "LIFT",
  "priority": "URGENT",
  "title": "Person trapped in second-floor lift",
  "summary": "A resident reports that an elderly person is trapped in the second-floor lift.",
  "language": "HINGLISH"
}
```

The committee immediately sees the complaint at the top of the urgent queue.

## Design Principle

The product is intentionally focused on one workflow:

> **Capture → Understand → Prioritize → Detect Duplicates → Track → Resolve**

No unnecessary features are required for the MVP.

## Participant Info

* **Name:** Prince Gupta
* **College ID:** [Your ID]
* **Day:** Day 1 (29th)
