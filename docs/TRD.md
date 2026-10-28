# Evenavi — Technical Requirements Document (TRD)

## 2.1 Architecture
Browser (React + Vite SPA)
├─ engines: budget / timeline / risk (pure JS, deterministic)
├─ aiClient ──► POST /api/ai ──► Vercel serverless function ──► Groq chat completions
├─ planStore ──► Firestore plans/{planId} + localStorage mirror
└─ demo fixtures (no network)

## 2.2 Stack
| Area | Choice |
|---|---|
| Framework | React 18 + Vite, JavaScript (JSX) |
| Routing | react-router-dom v6, routes lazy-loaded |
| Styling | Tailwind CSS with CSS variables for theme tokens |
| Charts | Recharts (lazy-loaded in Budget tab) |
| Validation | Zod (forms, AI output, server input) |
| State | Zustand plan store |
| Dates / IDs / Icons | date-fns, nanoid, lucide-react |
| Motion | framer-motion (respects prefers-reduced-motion) |
| Tests | Vitest |
| Database | Firebase Firestore (modular web SDK v10+), no Firebase Auth |
| AI | Groq OpenAI-compatible Chat Completions API |
| Hosting | Vercel for static app and /api functions |

## 2.3 Environment Variables
- Client (`.env`):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- Server (`Vercel`):
  - `GROQ_API_KEY`
  - `GROQ_MODEL` (default: `llama-3.3-70b-versatile`)
  - `GROQ_MODEL_FALLBACK` (default: `llama-3.1-8b-instant`)
  - `ALLOWED_ORIGIN`
  - `RATE_LIMIT_PER_10MIN` (default: `20`)

## 2.4 API Specification: POST /api/ai
- Request: `{ task: string, input: object }`
- Response: `{ ok: true, task: string, data: object, meta: { model: string, latencyMs: number } }` or `{ ok: false, code: string, message: string }`
- Error codes: `BAD_REQUEST` (400), `RATE_LIMITED` (429), `UPSTREAM_ERROR` (502), `INVALID_AI_OUTPUT` (502), `TIMEOUT` (504).
- Server responsibilities:
  1. Allowlist task name (`parse_intake`, `plan_core`, `vendor_pack`, `ideas`, `explain_budget_change`, `compare_quotes`, `plan_b`, `vendor_message`).
  2. Validate input schema with Zod & enforce size limits (free text <= 1500 chars, pasted quotes <= 1200 chars each, max 3 quotes).
  3. Build prompts server-side (`api/_lib/prompts.js`). Client cannot pass prompts directly.
  4. Call Groq with JSON mode (`response_format: { type: "json_object" }`), per-task temperature & max_tokens, and 20s timeout.
  5. Validate output with Zod. On schema error, retry once with repair prompt. If second attempt fails, return `INVALID_AI_OUTPUT`.
  6. Rate-limit by IP using sliding window.
  7. Never log user text.
  8. Wrap user input in `<user_input>` tags to protect against prompt injection.

## 2.5 Data Model (Firestore `plans/{planId}`)
`planId = nanoid(10)`
```json
{
  "schemaVersion": 1,
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "event": {
    "type": "wedding",
    "title": "String",
    "date": "YYYY-MM-DD",
    "city": "String",
    "cityTier": 1,
    "guestCount": 200,
    "totalBudget": 800000,
    "currency": "INR",
    "culture": "North Indian",
    "diet": "veg",
    "vibe": "Royal & Elegant",
    "ageGroup": "All ages",
    "mustHaves": [],
    "avoid": [],
    "venueType": "both",
    "functions": []
  },
  "budget": {
    "allocations": [
      { "id": "venue", "category": "Venue", "percent": 18, "planned": 144000, "spent": 0, "locked": false, "note": "", "source": "template" }
    ],
    "summary": "String",
    "source": "template"
  },
  "timeline": [],
  "timelineMeta": { "compressed": false, "warning": "" },
  "vendors": [],
  "ideas": { "themes": [], "menu": {}, "activities": [], "returnGifts": [], "invitation": { "en": "", "hi": "", "hinglish": "" }, "source": "template" },
  "risks": [],
  "quotes": []
}
```

## 2.6 Deterministic Engines
- **Budget Engine**: Allocates exact INR using largest-remainder algorithm rounding to ₹100 (₹10 if < ₹50,000). Rebalancing retains locked categories and redistributes remainder proportionally without drift.
- **Timeline Engine**: Back-plans from target date. Calculates phases: Foundation (>120d), Booking (60-120d), Details (14-59d), Final stretch (<14d), Event day (0d), After (<0d). Automatically compresses when days are constrained.
- **Risk Engine**: Flags overspend, tight timelines, monsoon for outdoor venues, peak wedding season bookings, tight per-guest affordability.
