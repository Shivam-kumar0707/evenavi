# Evenavi — Product Requirements Document (PRD)

## 1.1 Product Summary
Evenavi is a GenAI planning assistant that turns one sentence about an event into a complete, editable plan: a budget that recalculates, a deadline-driven timeline, vendor checklists with ready-to-send messages, and personalized ideas. It is built for weddings (including multi-function Indian weddings), birthdays and community events. There is no login: a plan lives at a shareable link.
Tagline: *Organise events*.

## 1.2 Problem
Event planning today runs on scattered WhatsApp groups, Excel sheets and memory. People overspend, miss booking deadlines and do not know what to ask vendors. Generic chatbots return long text that cannot be tracked, edited or shared.

## 1.3 Target Users
- **Priya, 28**: Planning her sister's 3-day wedding, ₹12L, 250 guests. Needs budget control and no missed bookings.
- **Rohan, 41**: RWA secretary organizing a society Diwali event for 400 residents, ₹1.5L. Needs permissions, volunteers, sponsors and a checklist.
- **Anita, 35**: First-time birthday planner, ₹40k, 40 guests. Needs theme ideas and a simple timeline.

## 1.4 Goals and Success Metrics
| Goal | Target |
|---|---|
| Fast first value | Plan visible in 10 seconds or less from submit; AI sections stream in independently |
| Covers the challenge | Budget, timeline, vendor checklist and personalized ideas for all 3 event types |
| Reliable for reviewers | Demo mode works with zero network; app never shows a blank error screen |
| Polished | Lighthouse 90+ for accessibility and best practices, clean 360px mobile layout, zero console errors |

## 1.5 Non-Goals
Authentication, payments, real vendor booking or marketplace, real-time multi-user editing, native apps, image generation.

## 1.6 Core Flow
Landing → New plan (describe in words or voice, or the 4-step wizard) → Generate → Workspace (Overview, Budget, Timeline, Vendors, Ideas, Quotes, Plan B, Share) → Edit, track, export → Share link.

## 1.7 Features and Acceptance Criteria
- **F1 (Smart intake)**: 4-step wizard. Free-text box with example chips and a mic button calls `parse_intake` and pre-fills the wizard. Accepts 8L, 8 lakh, 1.2 cr. Validation errors appear inline.
- **F2 (AI plan generation)**: Submit creates a plan instantly from the deterministic engines, then fills AI sections in parallel (`plan_core`, `vendor_pack`, `ideas`) with skeleton loaders. Failed sections show Retry while template content stays visible. Each section carries a badge: AI personalized or Template.
- **F3 (Budget planner)**: Donut chart plus category table. Edit total, guests or any category amount and lock categories. The remainder redistributes across unlocked categories and the sum always equals the total exactly. Per-guest cost and an affordability band are shown. An Explain changes button calls `explain_budget_change`.
- **F4 (Timeline)**: Tasks are counted back from the event date and grouped by phase. Checkbox completion, overdue highlighting, category filter. If time is short the timeline compresses and shows a Tight timeline warning.
- **F5 (Vendor checklist)**: Per-category cards with status (Not started, Shortlisted, Quoted, Booked, Paid), task checklist, questions to ask and red flags. Categories depend on event type.
- **F6 (Personalized ideas)**: 3 theme concepts with color palette swatches, decor, menu (respects diet), activities, return gifts, and invitation text in English, Hindi and Hinglish. Regenerate per section.
- **F7 (Save and share without login)**: Autosave to Firestore at `/plan/:id` with a `localStorage` mirror. A My plans list on the home page reads from `localStorage`. Share by copy link or WhatsApp link.
- **F8 (Demo mode)**: `/demo/wedding`, `/demo/birthday`, `/demo/community` load full pre-built plans with no network and no saving. Prominent Try demo plan button on the home page.
- **F9 (Export)**: `.ics` calendar file of all dated tasks, print-optimized view for Save as PDF, JSON download.
- **F10 (Quote comparison)**: User pastes 2 to 3 vendor quotes (text) for a category. AI returns a normalized comparison, hidden-cost flags, negotiation tips and a recommendation.
- **F11 (Plan B and risk alerts)**: Deterministic risk engine (budget overrun, tight timeline, peak season, monsoon with outdoor venue, must-have vendors not started) plus AI mitigation text per risk.
- **F12 (Vendor message generator)**: Per vendor: enquiry, negotiate, confirm or follow-up message in English, Hindi or Hinglish. Copy button and a Send on WhatsApp link (`wa.me`).
- **F13 (Multi-function wedding mode)**: Select functions (Engagement, Haldi, Mehendi, Sangeet, Wedding, Reception). Each has a date, guest count and budget share. Budget tab toggles By category / By function.
- **F14 (Voice input)**: Mic button uses the browser Web Speech API (`en-IN` or `hi-IN`). Feature-detected and hidden if unsupported.
- **F15 (Spend tracking)**: Enter amount paid per category. Progress bars. Overspend is flagged.
- **F16 (Extras)**: Dark mode toggle, read-only share mode, printable clean styling.
