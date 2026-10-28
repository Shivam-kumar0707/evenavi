import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Calculator, ShieldCheck, ArrowRight, Heart, Gift, Users, CheckCircle2, Share2, FileSpreadsheet, Zap } from 'lucide-react';
import { listLocalPlans } from '../lib/planStore.js';
import { formatCompactINR } from '../lib/money.js';

export function Landing({ onOpenMyPlans }) {
  const localPlans = listLocalPlans();

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-brand-500/15 to-amber-400/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>GenAI Event Planning for India</span>
          </div>

          <h1
            data-testid="hero-title"
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.15]"
          >
            Evenavi — <span className="bg-gradient-to-r from-brand-600 via-amber-600 to-amber-500 bg-clip-text text-transparent">Organise events</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Turn one sentence into a living, editable plan: a budget that always adds up, deadline-driven timelines, vendor checklists with ready WhatsApp messages, and curated theme concepts.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <Link
              to="/new"
              data-testid="start-planning-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Create Plan in 10s</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/demo/wedding"
              data-testid="try-demo-btn"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Explore Demo (No Network)</span>
            </Link>
          </div>

          {/* Reviewer Demo Quick Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-stone-400 font-medium mr-1">Direct Reviewer Demos:</span>
            <Link
              to="/demo/wedding"
              data-testid="demo-wedding-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:scale-105 transition-transform"
            >
              <Heart className="w-3 h-3 text-rose-500" />
              <span>3-Day Wedding (₹12L)</span>
            </Link>
            <Link
              to="/demo/birthday"
              data-testid="demo-birthday-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:scale-105 transition-transform"
            >
              <Gift className="w-3 h-3 text-amber-500" />
              <span>7th Birthday (₹40k)</span>
            </Link>
            <Link
              to="/demo/community"
              data-testid="demo-community-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform"
            >
              <Users className="w-3 h-3 text-blue-500" />
              <span>Diwali Mela (₹1.5L)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Local Plans Alert if user already has saved plans */}
      {localPlans.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full -mt-6 z-20">
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  You have {localPlans.length} active plan{localPlans.length > 1 ? 's' : ''} on this device
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Last updated: {localPlans[0].title} ({formatCompactINR(localPlans[0].totalBudget)})
                </p>
              </div>
            </div>
            <button
              onClick={onOpenMyPlans}
              className="px-3.5 py-1.5 text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg transition-colors"
            >
              View My Plans
            </button>
          </div>
        </section>
      )}

      {/* Value Pillars Grid */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
            Built for Real Events, Not Chat Dumps
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-400 text-sm max-w-xl mx-auto">
            Traditional chatbots return unformatted text blocks that cannot be edited or tracked. Evenavi gives you structured, interactive control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Numbers Always Add Up
            </h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Every rupee is computed by pure deterministic code (`budgetEngine.js`). Lock any category amount and the remainder rebalances across unlocked items with zero rounding drift.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Deadline-Driven Timeline
            </h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Tasks back-plan from your date into 6 phases. If your timeline is short, Evenavi compresses deadlines and drops non-critical tasks with tight-timeline alerts. Export directly to .ics!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Zero Login & Offline Resilient
            </h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              No passwords, no sign-up screens. Plans live at unique shareable links with instant local mirror autosave. If AI rate-limits hit, deterministic fallbacks keep the app functioning seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Target User Personas */}
      <section className="py-12 bg-stone-100/60 dark:bg-stone-900/40 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Tailored Archetypes</span>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mt-1">Designed for Indian Celebrations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center font-bold text-rose-600">
                  P
                </div>
                <div>
                  <h4 className="font-bold text-sm">Priya, 28 • Wedding</h4>
                  <p className="text-xs text-stone-500">Sister’s 3-day wedding, ₹12L, 250 pax</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Needs multi-function wedding splits (Mehendi, Sangeet, Vows), caterer tasting checklists, and WhatsApp messages in Hinglish.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center font-bold text-blue-600">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-sm">Rohan, 41 • Community</h4>
                  <p className="text-xs text-stone-500">RWA Diwali Mela, ₹1.5L, 400 pax</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Needs municipal permissions, fire safety clearance, volunteer alignment, and audited balance sheet reports.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center font-bold text-amber-600">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-sm">Anita, 35 • Birthday</h4>
                  <p className="text-xs text-stone-500">Child’s 7th Birthday, ₹40k, 40 pax</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Needs safari theme decor ideas, return gifts, eggless bakery safety, and a short 3-week planning sprint.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-stone-700 dark:text-stone-300">Evenavi</span> — Organise events. No login required.
          </div>
          <div>
            Privacy note: Evenavi collects zero personal tracking data beyond what you enter into your plan.
          </div>
        </div>
      </footer>
    </div>
  );
}
