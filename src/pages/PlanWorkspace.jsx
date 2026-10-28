import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, IndianRupee, Sparkles, MapPin, Eye, ArrowRight, LayoutDashboard, Calculator, CheckSquare, MessageSquare, Lightbulb, Scale, ShieldAlert, Share2, AlertCircle } from 'lucide-react';
import { usePlan } from '../hooks/usePlan.js';
import { useDebouncedSave } from '../hooks/useDebouncedSave.js';
import { usePlanStore } from '../lib/planStore.js';
import { formatINR, formatCompactINR } from '../lib/money.js';
import { SourceBadge, SaveStatusBadge } from '../components/ui/Badge.jsx';

import { OverviewTab } from '../components/overview/OverviewTab.jsx';
import { BudgetTab } from '../components/budget/BudgetTab.jsx';
import { TimelineTab } from '../components/timeline/TimelineTab.jsx';
import { VendorsTab } from '../components/vendors/VendorsTab.jsx';
import { IdeasTab } from '../components/ideas/IdeasTab.jsx';
import { QuotesTab } from '../components/quotes/QuotesTab.jsx';
import { RisksTab } from '../components/risks/RisksTab.jsx';
import { ShareTab } from '../components/share/ShareTab.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget', icon: Calculator },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'vendors', label: 'Vendors', icon: MessageSquare },
  { id: 'ideas', label: 'Ideas & Themes', icon: Lightbulb },
  { id: 'quotes', label: 'Quote Comparison', icon: Scale },
  { id: 'risks', label: 'Plan B', icon: ShieldAlert },
  { id: 'share', label: 'Share & Export', icon: Share2 },
];

export function PlanWorkspace({ isDemoRoute = false }) {
  const { id, type } = useParams();
  const { plan, loading, notFound, isDemo } = usePlan({
    planId: isDemoRoute ? null : id,
    demoType: isDemoRoute ? type : null,
  });

  // Enable debounced autosave
  useDebouncedSave();

  const activeTab = usePlanStore((state) => state.activeTab);
  const setActiveTab = usePlanStore((state) => state.setActiveTab);
  const saveStatus = usePlanStore((state) => state.saveStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-500">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (notFound || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Plan Not Found</h2>
          <p className="text-xs text-stone-500 mt-2 mb-6">
            The link you opened may have expired or is invalid. Start a new plan or explore one of our pre-built demos.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              to="/new"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white transition-colors"
            >
              Start New Plan
            </Link>
            <Link
              to="/demo/wedding"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Explore Wedding Demo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event } = plan;

  return (
    <div className="min-h-screen bg-[#FCFBF9] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-100 pb-16 transition-colors">
      {/* Demo Banner for Reviewers */}
      {isDemo && (
        <div
          data-testid="demo-banner"
          className="sticky top-16 z-30 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-2 max-w-2xl">
            <Eye className="w-4 h-4 shrink-0" />
            <span>
              <strong>Reviewer Demo Mode:</strong> Viewing full pre-built plan with zero network calls. Edits are simulated and won't overwrite saved data.
            </span>
          </div>
          <Link
            to="/new"
            className="shrink-0 px-3 py-1 rounded-lg bg-white text-stone-900 text-[11px] font-bold hover:bg-stone-100 transition-colors ml-2"
          >
            Create My Plan
          </Link>
        </div>
      )}

      {/* Workspace Header */}
      <header
        data-testid="workspace-header"
        className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {event.type}
                </span>
                <SaveStatusBadge status={saveStatus} />
                <SourceBadge source={plan.budget?.source || 'template'} />
              </div>

              <h1
                data-testid="workspace-title"
                className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight"
              >
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {event.city} (Tier {event.cityTier || 2})
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  {event.guestCount} guests
                </span>
                <span className="flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {formatINR(event.totalBudget)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-testid="workspace-tabs"
            className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 border-t border-stone-100 dark:border-stone-800"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-200 dark:border-brand-800'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace Tab View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'timeline' && <TimelineTab />}
        {activeTab === 'vendors' && <VendorsTab />}
        {activeTab === 'ideas' && <IdeasTab />}
        {activeTab === 'quotes' && <QuotesTab />}
        {activeTab === 'risks' && <RisksTab />}
        {activeTab === 'share' && <ShareTab />}
      </main>
    </div>
  );
}
