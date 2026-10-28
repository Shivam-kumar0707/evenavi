import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Heart,
  Gift,
  Users,
  CheckCircle2,
  Share2,
  Zap,
  MessageSquare,
  Lightbulb,
  FileText,
  Clock,
  Layers,
  CheckSquare,
  Lock,
  Compass,
  Building2,
  PartyPopper
} from 'lucide-react';
import { listLocalPlans } from '../lib/planStore.js';
import { formatCompactINR, formatINR } from '../lib/money.js';
import { InteractiveProductPreview } from '../components/landing/InteractiveProductPreview.jsx';

export function Landing({ onOpenMyPlans }) {
  const localPlans = listLocalPlans();

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-100 transition-colors">
      {/* A. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-stone-200/70 dark:border-stone-800/70">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-brand-500/10 dark:bg-brand-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-10 w-[300px] h-[250px] bg-amber-500/10 dark:bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Value Prop & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-bold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>AI-Powered Event Planning</span>
              </div>

              {/* Main Headline */}
              <h1
                data-testid="hero-title"
                className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-stone-900 dark:text-white leading-[1.12]"
              >
                Your celebration,{' '}
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600 bg-clip-text text-transparent">
                  perfectly planned.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Turn one sentence into a complete, editable event plan. Smart budgets that always add up, deadline-driven timelines, vendor checklists with ready WhatsApp messages, and personalized Indian celebration themes.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/new"
                  data-testid="start-planning-btn"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Create My Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/demo/wedding"
                  data-testid="try-demo-btn"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Explore Demo</span>
                </Link>
              </div>

              {/* Trust Statement */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  No login or account required
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Instant & 100% free
                </span>
              </div>
            </div>

            {/* Right Column: Realistic Interactive Product Preview */}
            <div className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none">
              <InteractiveProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Local Plans Alert if user already has saved plans on this browser */}
      {localPlans.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6 z-20">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-brand-200/80 dark:border-brand-800/80 shadow-lg shadow-brand-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  You have {localPlans.length} active plan{localPlans.length > 1 ? 's' : ''} on this device
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Last updated: <span className="font-semibold">{localPlans[0].title}</span> ({formatCompactINR(localPlans[0].totalBudget)})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                to={`/plan/${localPlans[0].id}`}
                className="flex-1 sm:flex-none text-center px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors"
              >
                Resume Plan
              </Link>
              <button
                type="button"
                onClick={onOpenMyPlans}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition-colors"
              >
                View All
              </button>
            </div>
          </div>
        </section>
      )}

      {/* C. QUICK DEMO SELECTION */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Zero-Network Demos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            Explore Pre-Built Event Blueprints
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Open any demo with zero network delay. Test real-time budget rebalancing, milestone tracking, and WhatsApp message generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Demo 1: Wedding */}
          <div className="rounded-2xl p-6 bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-rose-900/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Wedding
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-600 transition-colors">
                3-Day Indian Wedding
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                <span className="text-rose-600 dark:text-rose-400">₹12,00,000</span>
                <span>•</span>
                <span>250 Guests</span>
                <span>•</span>
                <span>Lucknow (Tier 2)</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                Multi-function breakdown across Sangeet, Mehendi, and Vows. Includes Awadhi catering checklists, photographer question guides, and Hinglish vendor templates.
              </p>
            </div>
            <Link
              to="/demo/wedding"
              data-testid="demo-wedding-btn"
              className="mt-6 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800 transition-colors"
            >
              <span>Explore Wedding Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Demo 2: Birthday */}
          <div className="rounded-2xl p-6 bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-amber-900/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Birthday
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                7th Birthday Party
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                <span className="text-amber-600 dark:text-amber-400">₹40,000</span>
                <span>•</span>
                <span>40 Guests</span>
                <span>•</span>
                <span>Pune (Tier 2)</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                Jungle Safari theme concept with balloon decor, eggless bakery safety checklists, kids party games, return gift budgeting, and a fast 3-week sprint.
              </p>
            </div>
            <Link
              to="/demo/birthday"
              data-testid="demo-birthday-btn"
              className="mt-6 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200 dark:border-amber-800 transition-colors"
            >
              <span>Explore Birthday Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Demo 3: Community */}
          <div className="rounded-2xl p-6 bg-white dark:bg-stone-900 border border-blue-200/80 dark:border-blue-900/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Community
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-blue-600 transition-colors">
                Society Diwali Mela
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                <span className="text-blue-600 dark:text-blue-400">₹1,50,000</span>
                <span>•</span>
                <span>400 Guests</span>
                <span>•</span>
                <span>Bengaluru (Tier 1)</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                RWA community mela with food stall layouts, sound generator rentals, fire authority safety protocols, volunteer task assignments, and balance sheet reporting.
              </p>
            </div>
            <Link
              to="/demo/community"
              data-testid="demo-community-btn"
              className="mt-6 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <span>Explore Community Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* D. FEATURE HIGHLIGHTS */}
      <section className="py-16 md:py-24 bg-stone-100/60 dark:bg-stone-900/30 border-y border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Complete Planning Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
              Built for Real Events, Not Chat Dumps
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Traditional chatbots produce uneditable text walls. Evenavi creates living, interactive plans where every number, deadline, and checklist is structured and actionable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                1. Smart Budget Planner
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                All arithmetic runs in deterministic JavaScript (<code className="font-mono text-brand-600 text-xs">budgetEngine.js</code>). Lock any category amount, and the remainder rebalances proportionally with zero rounding error and a protected 3% emergency floor.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                2. Deadline-Driven Timeline
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Tasks back-plan from your event date across 6 distinct phases. If your timeline is short, deadlines scale down automatically and tight-timeline warnings flag urgent priorities. Sync directly to Apple or Google Calendar via <code className="font-mono text-brand-600 text-xs">.ics</code>.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                3. Vendor Coordination
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Actionable checklists, vendor interview questions, and red flags for caterers, decorators, and venues. Generate ready-to-send inquiry and negotiation messages formatted for WhatsApp in English, Hindi, and Hinglish.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                4. Personalized Event Ideas
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Get 3 tailored theme concepts with 4-hex color palettes, decor guidance, curated regional menus (pure veg, Jain, mixed), return gift recommendations, and customized digital invitation scripts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                5. AI With Reliable Fallbacks
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Groq serverless completions with prompt-injection defense. If the AI service is rate-limited or unavailable, Evenavi automatically serves rich deterministic fallbacks marked with a <span className="font-semibold text-stone-700 dark:text-stone-300">"Template"</span> badge so the app never crashes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                6. Shareable & Exportable
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Share plans instantly via unique URLs without requiring co-planners to log in. Real-time debounced autosave protects changes. Generate full multi-page PDF dossiers or download raw JSON backups with a click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* E. PRODUCT WORKFLOW (3-Step Visual Stepper) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            How Evenavi Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
            From One Sentence to a Finished Blueprint
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Three simple steps to plan your entire event without spreadsheets or guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative p-6 sm:p-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm shadow-brand-600/30">
              1
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
              Describe your event
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Speak or type one natural sentence like <em>"Priya's wedding in Lucknow next November for 250 guests with ₹15L budget"</em>. Evenavi extracts city, budget, guest count, and dates automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 sm:p-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm shadow-brand-600/30">
              2
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
              Customize budget & timeline
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Lock fixed categories (like venue deposit), adjust headcounts, and watch the budget rebalance smoothly. Check your back-planned deadlines and tailor themes to your family's preferences.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 sm:p-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm shadow-brand-600/30">
              3
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
              Track tasks & coordinate
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Send one-click WhatsApp inquiries to caterers, sync milestone dates to your mobile calendar, and print a formatted PDF dossier for offline family review.
            </p>
          </div>
        </div>
      </section>

      {/* F. DESIGNED FOR INDIAN CELEBRATIONS */}
      <section className="py-16 md:py-24 bg-stone-100/60 dark:bg-stone-900/40 border-y border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Cultural Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
              Purpose-Built for Indian Celebrations
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Generic global event tools fail to account for multi-day functions, regional pricing tiers, and Indian vendor dynamics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Multi-day Weddings */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 font-bold">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Multi-Day Weddings</h3>
                  <p className="text-[11px] text-stone-500">Sangeet, Mehendi, Haldi & Reception</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Pre-calibrated allocation weights tailored for multi-function Indian weddings. Distribute budgets across distinct functions, coordinate multiple outfits, and manage overlapping caterer schedules.
              </p>
            </div>

            {/* Card 2: Birthdays & Family Milestones */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Family & Milestone Birthdays</h3>
                  <p className="text-[11px] text-stone-500">Fast 3–4 week planning sprints</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Focused timelines designed for fast execution. Includes eggless bakery requirements, theme decor coordination, activity entertainment, and return gift budgeting.
              </p>
            </div>

            {/* Card 3: Community & Festivals */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Society & Festive Melas</h3>
                  <p className="text-[11px] text-stone-500">Diwali, Navratri, Ganesh Utsav</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Support for large guest counts and community governance. Checklists for RWA permissions, power generator backups, volunteer roster assignments, and safety audits.
              </p>
            </div>
          </div>

          {/* Indian-Specific Engineering Chips */}
          <div className="mt-8 p-4 rounded-2xl bg-white/60 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-600 dark:text-stone-300">
            <span className="font-bold text-stone-900 dark:text-stone-100">Indian Native Features:</span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono text-[11px]">
              Lakh/Crore Parsing (8L, 15 lakh, 1.2 cr)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono text-[11px]">
              Tier 1/2/3 City Multipliers (1.4x / 1.0x / 0.8x)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono text-[11px]">
              Jain & Pure-Veg Catering Logic
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono text-[11px]">
              Hinglish WhatsApp Vendor Prompts
            </span>
          </div>
        </div>
      </section>

      {/* G. FINAL CALL TO ACTION */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-transparent via-brand-50/40 to-brand-100/30 dark:via-brand-950/10 dark:to-brand-950/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tight">
            Your next celebration starts with a plan.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
            No accounts to create, no credit cards, no login screens. Turn your ideas into an interactive, budget-accurate event blueprint in seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/new"
              data-testid="final-cta-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/25 transition-all hover:scale-105 active:scale-95 text-base"
            >
              <span>Create Your Event Plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/demo/wedding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Try a Demo Plan</span>
            </Link>
          </div>
        </div>
      </section>

      {/* H. FOOTER */}
      <footer className="mt-auto py-12 border-t border-stone-200 dark:border-stone-800 bg-[#FAF9F5] dark:bg-[#0A0908] text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-200/80 dark:border-stone-800/80">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-stone-900 dark:text-stone-100">Evenavi</span>
                <span className="text-[11px] font-medium text-stone-400">• Organise events</span>
              </div>
              <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                Intelligent, deterministic event planning assistant for Indian celebrations. Accessible without logins.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <Link to="/demo/wedding" className="hover:text-brand-600 transition-colors">
                Wedding Demo
              </Link>
              <Link to="/demo/birthday" className="hover:text-brand-600 transition-colors">
                Birthday Demo
              </Link>
              <Link to="/demo/community" className="hover:text-brand-600 transition-colors">
                Community Demo
              </Link>
              <Link to="/new" className="hover:text-brand-600 transition-colors">
                Start New Plan
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400 dark:text-stone-500">
            <div>
              © {new Date().getFullYear()} Evenavi. Built for competition review with zero-login accessibility.
            </div>
            <div>
              Price guidance and vendor rates are estimates based on regional city tiers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
