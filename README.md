# Evenavi — Organise events

> **GenAI-powered event planning assistant for Indian weddings, birthdays, and community celebrations.**  
> Built for the Google PromptWars Hack2skill competition (36,000+ participants).  
> **Tagline:** *Organise events*

---

## 🚀 Live Demo & Quick Links

- **Instant Zero-Network Demos:**
  - 💍 [3-Day Royal Wedding (Lucknow, ₹12L, 250 guests)](https://evenavi.vercel.app/demo/wedding)
  - 🎂 [7th Birthday Safari Adventure (Pune, ₹40k, 40 guests)](https://evenavi.vercel.app/demo/birthday)
  - 🪔 [Society Grand Diwali Mela (Bengaluru, ₹1.5L, 400 residents)](https://evenavi.vercel.app/demo/community)
- **Zero Authentication:** No sign-up, no login screens, no paywalls. Every plan lives at a cryptographically unique shareable link (e.g. `/plan/:id`).

---

## 🌟 Why Evenavi Stands Out

1. **A Living Plan, Not a Chat Dump**  
   Generic chatbots return unformatted text blocks that cannot be edited, rebalanced, or tracked. Evenavi renders structured, interactive widgets: an editable donut chart, checkbox timeline, vendor checklist, and quote comparison matrix.

2. **Code Owns the Numbers, AI Writes the Language**  
   All money calculations (largest-remainder proportional allocation, locked category rebalance, per-guest cost, spend tracking) run in **100% deterministic JavaScript** (`budgetEngine.js`). The AI writes text and personalization only—never numbers that must add up. Sums always equal the total budget exactly.

3. **Built for Indian Events**  
   - Native support for Indian number notations (`8L`, `8 lakh`, `1.2 cr`, `45k`, `₹8,50,000`).
   - Multi-function wedding coordination (Engagement, Haldi, Mehendi, Sangeet, Wedding, Reception) with dynamic budget weight splitting.
   - Multilingual invitations and vendor WhatsApp messages in **English**, **Hindi (Devanagari)**, and **Hinglish**.

4. **100% Reliable for Reviewers**  
   - Every AI capability has a client-side deterministic fallback. If Groq hits a rate limit (HTTP 429) or is unavailable, the app seamlessly falls back to curated template content with an inline Retry button. The app **never** shows a blank error screen.
   - Dedicated `/demo/*` routes load pre-built fixtures with zero network calls.

5. **Practical Real-World Utilities**  
   - **Quote Comparison**: Normalizes 2–3 vendor text quotes, unmasks hidden overtime/tax costs, and provides negotiation tips.
   - **Vendor WhatsApp Generator**: Ready-to-send messages for enquiries, negotiations, confirmations, or follow-ups with one-click `wa.me` links.
   - **Calendar Export**: Generates RFC 5545 compliant `.ics` calendar files with alarm reminders.
   - **Print Optimization**: Clean styling ready for "Save as PDF".

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Browser ["Client: React 18 + Vite SPA"]
        UI["UI Layer (Tailwind CSS, Lucide Icons)"]
        Engines["Deterministic Engines: budgetEngine / timelineEngine / riskEngine"]
        Store["State Management: Zustand Plan Store"]
        LocalStorage[("localStorage Mirror")]
        DemoFixtures[("Demo Fixtures (Zero Network)")]
        AiClient["aiClient.js (Parallel Fetching + Fallback Engine)"]
    end

    subgraph Backend ["Serverless Layer: Vercel Edge / Node.js"]
        Proxy["POST /api/ai Proxy"]
        RateLimit["Sliding Window Rate Limiter"]
        PromptBuilder["Prompt Builder (Injection Defense)"]
        OutputValidator["Zod Output Validator (1-Step Repair)"]
    end

    subgraph External ["External Services"]
        Groq["Groq API (Llama 3.3 70B & 3.1 8B JSON Mode)"]
        Firestore[("Firebase Firestore (Zero-Auth / Unguessable IDs)")]
    end

    UI --> Store
    Store <--> Engines
    Store <--> LocalStorage
    UI -.-> DemoFixtures

    Store -.->|800ms Debounce| Firestore
    UI --> AiClient
    AiClient -->|Fetch| Proxy
    AiClient -.->|On Failure / 429| Engines

    Proxy --> RateLimit
    Proxy --> PromptBuilder
    PromptBuilder --> Groq
    Groq --> OutputValidator
    OutputValidator --> Proxy
```

---

## 🛠️ Tech Stack

| Layer | Choice | Details |
|---|---|---|
| **Framework** | React 18 + Vite | JavaScript (JSX), Fast Refresh |
| **Styling** | Tailwind CSS | Mobile-first (360px), CSS variable tokens, dark mode |
| **Routing** | React Router v6 | Lazy-loaded routes with `React.lazy` and `Suspense` |
| **Charts** | Recharts | Lazy-loaded interactive Donut charts |
| **Validation** | Zod | Client data model and serverless request validation |
| **State** | Zustand | Single source of truth with local storage mirror |
| **Dates & IDs** | `date-fns`, `nanoid` | RFC-compliant date math and 10-char unguessable plan IDs |
| **Calendar** | Pure JS RFC 5545 | CRLF line endings, 75-octet folding, comma/semicolon escaping |
| **AI Engine** | Groq API | `llama-3.3-70b-versatile` (primary) + `llama-3.1-8b-instant` (fallback) in JSON Mode |
| **Database** | Firebase Firestore v10 | Document storage for `/plan/:id` (modular web SDK, no Firebase Auth) |
| **Testing** | Vitest | 41 unit tests covering all math, schemas, and engines |

---

## 📦 Getting Started Locally

### 1. Clone & Install
```bash
git clone https://github.com/your-username/evenavi.git
cd evenavi
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Firebase configuration is optional for local development—Evenavi seamlessly falls back to `localStorage` mode if Firebase variables are omitted).*

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Unit Tests & Build
```bash
# Run complete test suite (41 tests)
npm run test

# Production build & chunk analysis
npm run build
```

---

## 🔒 Security & Privacy

- **Groq Key Safety**: `GROQ_API_KEY` lives **only** on the serverless proxy. The client bundle never includes or exposes any LLM API keys.
- **Strict Firestore Rules**: Collection listing (`list`) and document deletion (`delete`) are blocked. Only valid plan documents with integer guest counts and positive budgets can be created or updated.
- **Prompt Injection Defense**: User input is wrapped in `<user_input>` XML tags with system instructions explicitly treating it as data, not instructions.
- **No Personal Data Collection**: No user tracking, cookies, or account sign-ups.

---

## 📄 Documentation Index

- [PRD — Product Requirements Document](docs/PRD.md)
- [TRD — Technical Requirements Document](docs/TRD.md)
- [AI Spec — Groq Prompts, Schemas & Fallbacks](docs/AI_SPEC.md)
- [UI Spec — Layout, Design Tokens & Reviewer TestIDs](docs/UI_SPEC.md)
- [Build Plan — Phased Implementation & Verification Plan](docs/BUILD_PLAN.md)
- [Assumptions — Engineering Decisions & Specifications](docs/ASSUMPTIONS.md)

---

## 🏆 Competition Submission Notes

- **Challenge Addressed**: Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.
- **Coverage**: All three event categories supported with dedicated templates, demos, and multi-function wedding modes.
- **Lighthouse Performance**: Optimized under 95 kB initial JavaScript bundle (29 kB gzipped), displaying instantaneous first paint without blocking on AI calls.
