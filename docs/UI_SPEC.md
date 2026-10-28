# Evenavi — UI Specification

## 1. Visual Language & Tokens
- **Font Stack**: Modern Sans (`Plus Jakarta Sans` or system `Inter`, system fallback).
- **Colors**:
  - Primary: Warm Saffron / Terracotta (`#ea580c`, `amber-600` / `orange-600`)
  - Accent: Gold / Champagne (`#d97706`, `amber-500`)
  - Background: Crisp off-white (`#fcfbf9`), Dark mode: Deep slate (`#0f172a`)
  - Card & Surfaces: Pure white (`#ffffff`), Dark mode: (`#1e293b`)
  - Semantic Borders: Subtle warm slate (`#e2e8f0` / `#334155`)
- **Responsive Breakpoints**:
  - Base: 360px (Mobile-first, strict zero horizontal scroll)
  - sm: 640px, md: 768px, lg: 1024px, xl: 1280px

## 2. Page Hierarchy
1. **Landing Page (`/`)**:
   - Hero banner with tagline: *Organise events*.
   - Value propositions (deterministic budget, back-planned timeline, vendor checklists, AI personalized ideas).
   - "Start Planning" CTA and prominent "Try Demo Plan" dropdown/chips (Wedding, Birthday, Community).
   - "My Plans" local storage history drawer/list.
2. **New Plan Wizard (`/new`)**:
   - Intake prompt with voice dictation button (Web Speech API) and 3 example scenario chips.
   - 4-step wizard with validation:
     - Step 1: Event Type, Title, Date, City, City Tier (1, 2, 3).
     - Step 2: Guest Count, Total Budget (accepts 8L, 8 lakh, 1.2 cr), Diet, Culture.
     - Step 3: Vibe, Venue Type (Indoor, Outdoor, Both), Multi-function selection (for weddings).
     - Step 4: Must-haves and Avoid items review & Submit.
3. **Workspace (`/plan/:id` and `/demo/:type`)**:
   - Header: Event Title, Date, Guest Count, Total Budget, Save status indicator, Source badge (`Template` or `AI Personalized`).
   - Sticky Navigation Tabs:
     1. Overview
     2. Budget
     3. Timeline
     4. Vendors
     5. Ideas
     6. Quotes
     7. Plan B (Risks)
     8. Share & Export

## 3. Required Data-TestId Catalog
Every interactive component and review hook must carry an exact `data-testid`:

### Landing & Navigation
- `hero-title`: Main tagline & heading
- `start-planning-btn`: Primary CTA to navigate to `/new`
- `try-demo-btn`: CTA for reviewer demo
- `demo-wedding-btn`: Direct link to `/demo/wedding`
- `demo-birthday-btn`: Direct link to `/demo/birthday`
- `demo-community-btn`: Direct link to `/demo/community`
- `my-plans-list`: Container for saved local plans
- `plan-card-{id}`: Individual plan card item

### Smart Intake Wizard
- `intake-free-text`: Natural language text area
- `intake-mic-btn`: Web Speech mic toggle button
- `intake-example-chip-{index}`: Clickable example prompt chip
- `intake-wizard-step-{stepNumber}`: Step container (1 through 4)
- `input-event-type`: Event type radio/select (`wedding` | `birthday` | `community`)
- `input-event-title`: Text input
- `input-event-date`: Date picker input (`YYYY-MM-DD`)
- `input-event-city`: City name input
- `input-city-tier`: City tier selector (1, 2, 3)
- `input-guest-count`: Numeric guest input
- `input-total-budget`: Text input accepting currency strings (`8L`, `8 lakh`, `1.2 cr`)
- `input-diet`: Diet selection (`veg` | `jain` | `nonveg` | `mixed`)
- `input-culture`: Cultural/regional specification
- `input-vibe`: Ambience/vibe text or selection
- `input-venue-type`: Venue type selection (`indoor` | `outdoor` | `both`)
- `wedding-functions-select`: Container for multi-function checkboxes
- `wizard-next-btn`: Next step button
- `wizard-prev-btn`: Previous step button
- `wizard-submit-btn`: Generate plan submission button

### Workspace Global & Overview
- `workspace-header`: Header container
- `workspace-title`: Editable or displayed title
- `workspace-tabs`: Tab navigation container
- `tab-{tabId}`: Tab buttons (`tab-overview`, `tab-budget`, `tab-timeline`, `tab-vendors`, `tab-ideas`, `tab-quotes`, `tab-risks`, `tab-share`)
- `save-status-badge`: Displays saving/saved/offline status
- `source-badge`: Displays "AI Personalized" or "Template"
- `overview-summary`: Plan AI/template summary card
- `overview-stats`: Grid of key stats (Budget, Guests, Days Left, Per Guest)

### Budget Planner Tab
- `budget-total-input`: Total budget edit input
- `budget-guests-input`: Guest count edit input
- `budget-per-guest`: Per-guest calculation display
- `affordability-band-badge`: Tight / Comfortable / Generous badge
- `budget-donut-chart`: Recharts donut chart container
- `budget-view-toggle`: Toggle between "By Category" and "By Function"
- `budget-category-row-{categoryId}`: Category table row
- `budget-category-planned-{categoryId}`: Planned amount input / display
- `budget-category-spent-{categoryId}`: Spent amount input
- `budget-category-lock-{categoryId}`: Category lock toggle button
- `budget-explain-btn`: "Explain changes" trigger button
- `budget-explain-panel`: AI explanation drawer or modal
- `budget-overspend-warning`: Alert banner when category or total is exceeded

### Timeline Tab
- `timeline-tight-warning`: Tight timeline alert badge
- `timeline-category-filter`: Category dropdown filter
- `timeline-phase-{phaseId}`: Phase accordion/group container
- `timeline-task-{taskId}`: Task item container
- `timeline-task-checkbox-{taskId}`: Task completion checkbox
- `timeline-export-ics-btn`: Direct `.ics` export button

### Vendor Checklist Tab
- `vendor-category-card-{categoryId}`: Category vendor card
- `vendor-status-select-{categoryId}`: Status selector (`not_started`, `shortlisted`, `quoted`, `booked`, `paid`)
- `vendor-task-item-{taskId}`: Vendor checklist item
- `vendor-questions-list-{categoryId}`: Recommended questions list
- `vendor-redflags-list-{categoryId}`: Red flags warning list
- `vendor-message-btn-{categoryId}`: "Draft message" button
- `vendor-message-modal`: Message generator modal
- `vendor-message-copy-btn`: Copy text button
- `vendor-message-whatsapp-btn`: WhatsApp wa.me trigger link

### Ideas Tab
- `ideas-themes-container`: 3-theme concept grid
- `theme-card-{index}`: Individual theme card
- `theme-palette-{index}`: Color swatches container
- `ideas-menu-container`: Curated menu container (Starters, Mains, Desserts, Drinks)
- `ideas-activities-container`: Signature activities container
- `ideas-return-gifts-container`: Return gifts suggestions
- `ideas-invitation-container`: Invitation copy container
- `invitation-lang-{en|hi|hinglish}`: Language selector buttons
- `ideas-regenerate-btn`: Refresh ideas button

### Quote Comparison Tab
- `quote-input-1`, `quote-input-2`, `quote-input-3`: Text areas for quote text
- `quote-compare-btn`: Compare quotes trigger button
- `quote-results-container`: Comparison table & card container
- `quote-recommendation`: Best value recommendation card
- `quote-negotiation-tips`: Negotiation bullet points

### Plan B (Risks) Tab
- `risk-alert-{riskId}`: Risk alert container
- `risk-mitigation-{riskId}`: Recommended mitigation steps container

### Share & Export
- `share-copy-link-btn`: Copy share link button
- `share-whatsapp-btn`: Share on WhatsApp button
- `export-ics-btn`: Export calendar `.ics`
- `export-json-btn`: Export plan data as JSON
- `export-print-btn`: Print / Save as PDF button

### Demo Mode
- `demo-banner`: Banner notifying that the viewer is in read-only demo mode with a "Create My Plan" button.
