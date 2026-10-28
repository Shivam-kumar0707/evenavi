# Evenavi — Build Plan

## Overview
This plan establishes a phased development lifecycle for Evenavi. Each phase ends with a verification step (build + test execution), error resolution, and a concise summary.

---

### Phase 1: Project Scaffolding & Configuration
- Initialize Vite + React 18 project in JavaScript (JSX).
- Configure Tailwind CSS, postcss, and custom CSS variables for theme tokens.
- Configure Vitest test runner.
- Install production dependencies: `react-router-dom`, `recharts`, `zod`, `zustand`, `date-fns`, `nanoid`, `lucide-react`, `canvas-confetti`.
- Set up project directory structure as specified in TRD Section 2.14.
- Verification: `npm run build` and `npx vitest run` exit with 0 errors.

---

### Phase 2: Deterministic Engines & Core Utilities
- **`src/lib/money.js`**: `parseMoney` (supporting `8L`, `8 lakh`, `1.2 cr`, `850000`, `₹8,50,000`), Indian currency formatting (`en-IN`).
- **`src/lib/budgetEngine.js`**: Baseline templates, largest-remainder proportional allocation (rounding to ₹100 or ₹10), lock-preserving rebalance with drift prevention, `OVER_BUDGET` detection, spend tracking, per-guest calculation, and affordability bands.
- **`src/lib/timelineEngine.js`**: Target date back-planning, phase categorization, adaptive timeline compression with warnings, deduplication of AI extra tasks.
- **`src/lib/riskEngine.js`**: Deterministic risk rules (budget overrun, tight timeline, peak season bookings, monsoon for outdoor venues, tight per-guest band).
- **`src/lib/ics.js`**: RFC 5545 `.ics` calendar generator (CRLF line endings, 75-octet line folding, proper escaping, unique UIDs).
- **Unit Tests**: Full Vitest suite for all engines and utilities (`tests/budgetEngine.test.js`, `tests/timelineEngine.test.js`, `tests/riskEngine.test.js`, `tests/money.test.js`, `tests/ics.test.js`).
- Verification: Run tests and ensure 100% pass rate.

---

### Phase 3: Schemas, Data Templates & Demo Fixtures
- **`src/lib/schemas.js`**: Complete Zod validation schemas for plans, events, budgets, timelines, vendors, ideas, risks, and quotes.
- **`src/data/templates.js`**: Baseline budget percentages, timeline templates, and phase definitions for Wedding, Birthday, and Community events.
- **`src/data/bands.js`**: Affordability tier thresholds for Tier 1, 2, 3 cities.
- **`src/data/vendorTemplates.js`**: Full vendor questions, checklists, and red flags per category and event type.
- **`src/data/demoPlans.js`**: 3 complete, rich, standalone demo plans (`wedding`, `birthday`, `community`) that require zero network calls and pass all schema validations.
- Verification: Vitest schema validation test confirming all demo fixtures and templates are valid.

---

### Phase 4: State Management & Persistence
- **`src/lib/planStore.js`**: Zustand store for state management (active plan, updates, locking, category edits, task toggling, vendor status updates, quote comparisons).
- **`src/lib/firebase.js`**: Modular Firebase v10 initialization with graceful offline fallback when environment variables are omitted.
- **`firestore.rules`**: Strict security rules allowing individual plan get/create/update with schema validation and denying list/delete.
- **`src/hooks/useDebouncedSave.js`**: 800ms debounce autosave to `localStorage` and Firestore.
- **`src/hooks/usePlan.js`**: Hook to load plans by ID or demo mode.
- Verification: Vitest unit test for store state transitions and offline persistence.

---

### Phase 5: Serverless AI Proxy & Fallback Engine
- **`api/ai.js`**: Vercel serverless proxy endpoint enforcing task allowlist, size limits, JSON-mode Groq completions, and schema validation with 1-step repair.
- **`api/health.js`**: Simple health check returning `{ ok: true }`.
- **`api/_lib/prompts.js`**: Server-side system and task prompts for all 8 AI tasks.
- **`api/_lib/schemas.js`**: Server-side Zod validation schemas.
- **`api/_lib/groq.js`**: Groq API client with timeouts and model fallback.
- **`api/_lib/rateLimit.js`**: In-memory sliding window rate limiter.
- **`src/lib/aiClient.js`**: Client-side dispatcher executing parallel tasks (`plan_core`, `vendor_pack`, `ideas`) with fallback triggers on failure.
- Verification: Test API schemas and client fallback responses.

---

### Phase 6: UI Components & Workspace Implementation
- **Layout & Routing**: `App.jsx` with React Router, lazy-loaded routes (`Landing`, `NewPlan`, `PlanWorkspace`, `Demo`, `NotFound`).
- **`src/pages/Landing.jsx`**: Hero, value propositions, Try Demo CTAs, My Plans history drawer.
- **`src/pages/NewPlan.jsx`**: Natural language intake with mic dictation, example chips, 4-step wizard, instant plan creation.
- **`src/pages/PlanWorkspace.jsx`**: Workspace shell with title, stats bar, and tabs.
- **Workspace Tabs**:
  - `OverviewTab.jsx`: Summary, key metrics, countdown, quick links.
  - `BudgetTab.jsx`: Recharts donut chart, total/guest editors, category table with locking, function view, spend tracking, Explain changes panel.
  - `TimelineTab.jsx`: Grouped phases, compression warning, task checkboxes, category filter, `.ics` export button.
  - `VendorsTab.jsx`: Category cards, status selector, task checklist, questions, red flags, vendor message generator modal (EN/HI/Hinglish) with WhatsApp link.
  - `IdeasTab.jsx`: 3 theme cards with color swatches, full menu, activities, return gifts, multi-lingual invitations.
  - `QuotesTab.jsx`: 2-3 quote input paste boxes, comparison matrix, best-value recommendation, negotiation tips.
  - `RisksTab.jsx`: Plan B risk alerts with mitigation actions.
  - `ShareTab.jsx`: Share link copy, WhatsApp share, JSON/ICS downloads, print view.
- Verification: Component rendering without runtime errors, all `data-testid` attributes present.

---

### Phase 7: Polish, Accessibility & Responsive Verification
- Verify 360px mobile viewport responsiveness (zero horizontal scrolling).
- Ensure semantic HTML tags, ARIA labels, and keyboard accessibility.
- Dark mode support using CSS variables and Tailwind classes.
- Print stylesheet for clean "Save as PDF" output.
- `vercel.json` with security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`).
- Verification: Run complete build and test suite, check for zero console warnings.

---

### Phase 8: Final Verification & Documentation
- Comprehensive smoke test covering intake, recalculation, export, demo mode, and offline resilience.
- Complete `README.md` with product overview, architecture diagram, setup instructions, and competition submission summary.
