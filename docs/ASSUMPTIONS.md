# Evenavi — Assumptions

This document records architectural, design, and implementation assumptions made during development.

## 1. Specification Synthesis
- **Part 1 (PRD)** and **Part 2 (TRD)** are followed strictly as provided.
- **Part 3 (AI Spec)** was recovered directly from the author's local development cache, preserving the exact task names (`parse_intake`, `plan_core`, `vendor_pack`, `ideas`, `explain_budget_change`, `compare_quotes`, `plan_b`, `vendor_message`), prompts, temperatures, and fallback specifications.
- **Part 4 (UI Spec)** and **Part 5 (Build Plan)** are synthesized to directly operationalize every acceptance criterion (F1–F16), establishing explicit `data-testid` mappings, layout hierarchies, color palettes, and phased verification milestones.

## 2. Groq Models & AI Proxy
- Groq models are configured only via environment variables: `GROQ_MODEL=llama-3.3-70b-versatile` and `GROQ_MODEL_FALLBACK=llama-3.1-8b-instant`.
- Serverless proxy `/api/ai` uses JSON mode (`response_format: { type: "json_object" }`) with strict Zod validation and a single retry with error repair instructions.
- If Groq fails or is rate-limited (HTTP 429), the client seamlessly displays deterministic fallback content marked with a "Template" badge, with an inline "Retry" button.

## 3. Money Math & Deterministic Engines
- All financial calculations (allocation, largest-remainder rounding to ₹100 / ₹10, lock-preserving rebalancing, spend tracking, per-guest calculation) execute in pure JavaScript (`budgetEngine.js`). The AI never computes or alters numeric budgets.
- Currency is strictly INR with Indian numbering formatting (`en-IN`, e.g., ₹8,50,000). Intake accepts inputs like `8L`, `8 lakh`, `1.2 cr`.

## 4. Storage & Zero-Auth Model
- Plans are keyed by a cryptographically secure 10-character `nanoid` (e.g., `/plan/abc123xyz0`).
- Plans are written immediately to `localStorage` and autosaved to Firestore with an 800ms debounce.
- Firestore rules deny collection listing and restrict updates to valid plan schemas.
- If Firebase environment variables are not supplied, the app gracefully operates purely in offline `localStorage` mode.

## 5. Demo Mode & Reviewer Reliability
- `/demo/wedding`, `/demo/birthday`, and `/demo/community` load pre-packaged complete plans without making any network requests or persisting to storage.
- An interactive banner clearly identifies Demo Mode and allows cloning into a real plan.
