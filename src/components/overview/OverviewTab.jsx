import React from 'react';
import { differenceInCalendarDays, parseISO, isValid } from 'date-fns';
import { Calendar, Users, IndianRupee, MapPin, Calculator, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { formatINR, formatCompactINR } from '../../lib/money.js';
import { SourceBadge, AffordabilityBadge } from '../ui/Badge.jsx';
import { perGuest, affordabilityBand } from '../../lib/budgetEngine.js';
import { usePlanStore } from '../../lib/planStore.js';

export function OverviewTab() {
  const plan = usePlanStore((state) => state.currentPlan);
  const setActiveTab = usePlanStore((state) => state.setActiveTab);

  if (!plan) return null;

  const { event, budget, timeline, vendors, risks } = plan;

  let daysLeft = 0;
  try {
    const d = parseISO(event.date);
    if (isValid(d)) {
      daysLeft = differenceInCalendarDays(d, new Date());
    }
  } catch {
    daysLeft = 0;
  }

  const perGuestCost = perGuest(event.totalBudget, event.guestCount);
  const band = affordabilityBand(event.type, event.cityTier || 2, perGuestCost);

  const completedTasks = (timeline || []).filter((t) => t.done).length;
  const bookedVendors = (vendors || []).filter((v) => ['booked', 'paid'].includes(v.status)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Plan Summary Card */}
      <div
        data-testid="overview-summary"
        className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Executive Summary</h3>
          </div>
          <SourceBadge source={budget.source || 'template'} />
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
          {budget.summary || 'A structured event plan designed to coordinate your celebration efficiently.'}
        </p>

        {event.functions && event.functions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              Functions Planned ({event.functions.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {event.functions.map((fn) => (
                <span
                  key={fn.id}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                >
                  {fn.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div data-testid="overview-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Planned Budget</span>
            <IndianRupee className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            {formatINR(event.totalBudget)}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            {formatCompactINR(event.totalBudget)} allocated
          </div>
        </div>

        {/* Guest Count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Guest Count</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            {event.guestCount}
          </div>
          <div className="text-xs text-stone-500 mt-1 capitalize">
            {event.diet} menu • {event.city}
          </div>
        </div>

        {/* Days Left / Countdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Countdown</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            {daysLeft >= 0 ? `${daysLeft} Days` : 'Completed'}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Target: {event.date}
          </div>
        </div>

        {/* Per-Guest Affordability */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Per Guest</span>
            <Calculator className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            {formatINR(perGuestCost)}
          </div>
          <div className="mt-1">
            <AffordabilityBadge band={band} />
          </div>
        </div>
      </div>

      {/* Progress & Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Planning Progress */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4">Milestone Progress</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Timeline Tasks Completed</span>
                <span>{completedTasks} / {(timeline || []).length}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-500"
                  style={{ width: `${timeline?.length ? (completedTasks / timeline.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Vendor Categories Booked</span>
                <span>{bookedVendors} / {(vendors || []).length}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${vendors?.length ? (bookedVendors / vendors.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {risks && risks.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{risks.length} potential risk{risks.length > 1 ? 's' : ''} flagged</span>
                </div>
                <button
                  onClick={() => setActiveTab('risks')}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  View Plan B <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Workspace Shortcuts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">Explore Workspace</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              Everything in this plan recalculates dynamically without needing to start over.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('budget')}
              className="p-3 text-left rounded-xl border border-stone-200 dark:border-stone-800 hover:border-brand-500 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all"
            >
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Rebalance Budget</div>
              <div className="text-[11px] text-stone-400">Lock & redistribute funds</div>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className="p-3 text-left rounded-xl border border-stone-200 dark:border-stone-800 hover:border-brand-500 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all"
            >
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">View Timeline</div>
              <div className="text-[11px] text-stone-400">Export calendar (.ics)</div>
            </button>

            <button
              onClick={() => setActiveTab('vendors')}
              className="p-3 text-left rounded-xl border border-stone-200 dark:border-stone-800 hover:border-brand-500 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all"
            >
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Vendor Messages</div>
              <div className="text-[11px] text-stone-400">Send on WhatsApp</div>
            </button>

            <button
              onClick={() => setActiveTab('ideas')}
              className="p-3 text-left rounded-xl border border-stone-200 dark:border-stone-800 hover:border-brand-500 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all"
            >
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Themes & Menu</div>
              <div className="text-[11px] text-stone-400">Palettes & invitations</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
