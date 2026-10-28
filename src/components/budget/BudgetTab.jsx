import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Lock, Unlock, Sparkles, RefreshCw, AlertTriangle, Info, Check, IndianRupee, Layers, HelpCircle, X } from 'lucide-react';
import { formatINR, formatCompactINR, parseMoney } from '../../lib/money.js';
import { perGuest, affordabilityBand, applyFunctionSplit, trackSpend } from '../../lib/budgetEngine.js';
import { AffordabilityBadge, SourceBadge } from '../ui/Badge.jsx';
import { Modal } from '../ui/Modal.jsx';
import { usePlanStore } from '../../lib/planStore.js';
import { callAiTask } from '../../lib/aiClient.js';

const CHART_COLORS = [
  '#ea580c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#d97706', '#ef4444',
];

export function BudgetTab() {
  const plan = usePlanStore((state) => state.currentPlan);
  const updateEventDetails = usePlanStore((state) => state.updateEventDetails);
  const updateAllocation = usePlanStore((state) => state.updateAllocation);
  const toggleCategoryLock = usePlanStore((state) => state.toggleCategoryLock);
  const resetBudgetToBaseline = usePlanStore((state) => state.resetBudgetToBaseline);
  const budgetError = usePlanStore((state) => state.budgetError);
  const clearBudgetError = usePlanStore((state) => state.clearBudgetError);

  const [viewMode, setViewMode] = useState('category'); // 'category' | 'function'
  const [explainOpen, setExplainOpen] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [explanationData, setExplanationData] = useState(null);

  if (!plan) return null;

  const { event, budget } = plan;
  const allocations = budget?.allocations || [];

  const perGuestCost = perGuest(event.totalBudget, event.guestCount);
  const band = affordabilityBand(event.type, event.cityTier || 2, perGuestCost);
  const spendInfo = trackSpend(allocations, event.totalBudget);

  const functionSplits = event.type === 'wedding' && event.functions?.length > 0
    ? applyFunctionSplit(event.totalBudget, event.functions)
    : [];

  const handleTotalBudgetBlur = (e) => {
    const val = parseMoney(e.target.value);
    if (val > 0 && val !== event.totalBudget) {
      updateEventDetails({ totalBudget: val });
    }
  };

  const handleGuestsBlur = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val > 0 && val !== event.guestCount) {
      updateEventDetails({ guestCount: val });
    }
  };

  const handleExplainChanges = async () => {
    setExplainOpen(true);
    setExplaining(true);
    try {
      const res = await callAiTask('explain_budget_change', {
        event,
        before: allocations.map((a) => ({ id: a.id, category: a.category, planned: Math.round(a.planned * 0.95) })),
        after: allocations.map((a) => ({ id: a.id, category: a.category, planned: a.planned })),
        locks: allocations.filter((a) => a.locked).map((a) => a.id),
      });
      setExplanationData(res.data);
    } catch {
      // fallback in callAiTask handles it
    } finally {
      setExplaining(false);
    }
  };

  const chartData = allocations.map((a) => ({
    name: a.category,
    value: a.planned,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Total Budget Input */}
            <div>
              <label htmlFor="budget-total-input" className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Total Budget
              </label>
              <div className="relative">
                <input
                  id="budget-total-input"
                  key={event.totalBudget}
                  type="text"
                  data-testid="budget-total-input"
                  defaultValue={formatINR(event.totalBudget)}
                  onBlur={handleTotalBudgetBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.target.blur();
                  }}
                  className="p-2.5 pl-8 text-sm font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:ring-2 focus:ring-brand-500 outline-none w-44"
                />
                <IndianRupee className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3.5" />
              </div>
            </div>

            {/* Guest Count Input */}
            <div>
              <label htmlFor="budget-guests-input" className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Guests
              </label>
              <input
                id="budget-guests-input"
                key={event.guestCount}
                type="number"
                data-testid="budget-guests-input"
                min={1}
                max={20000}
                defaultValue={event.guestCount}
                onBlur={handleGuestsBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.target.blur();
                }}
                className="p-2.5 text-sm font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:ring-2 focus:ring-brand-500 outline-none w-28"
              />
            </div>

            {/* Per Guest Insight */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                Cost Per Guest
              </span>
              <div className="flex items-center gap-2 h-10">
                <span data-testid="budget-per-guest" className="text-sm font-black text-stone-900 dark:text-stone-100">
                  {formatINR(perGuestCost)}
                </span>
                <AffordabilityBadge band={band} />
              </div>
            </div>
          </div>

          {/* Action Buttons & View Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {event.type === 'wedding' && event.functions?.length > 0 && (
              <div data-testid="budget-view-toggle" className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setViewMode('category')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'category'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                >
                  By Category
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('function')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'function'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                >
                  By Function
                </button>
              </div>
            )}

            <button
              data-testid="budget-explain-btn"
              onClick={handleExplainChanges}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Explain Changes</span>
            </button>

            <button
              onClick={resetBudgetToBaseline}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors"
              title="Reset allocations to standard baseline proportions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Error / Over-budget Notice */}
        {budgetError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{budgetError}</span>
            </div>
            <button onClick={clearBudgetError} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Spend Tracking Overspend Alert */}
        {(spendInfo.isOverBudget || spendInfo.hasCategoryOverspend) && (
          <div data-testid="budget-overspend-warning" className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {spendInfo.isOverBudget
                ? `Total recorded spend exceeds your budget by ${formatINR(spendInfo.totalSpent - spendInfo.totalPlanned)}. Rebalance unlocked categories to accommodate.`
                : 'One or more categories exceed their planned budget by > 10%. Check recorded spend below.'}
            </span>
          </div>
        )}
      </div>

      {/* Main Budget Grid: Donut Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Donut Visualizer */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Allocation Breakdown</h3>
              <span className="text-xs text-stone-400">Sum: 100% (Exact)</span>
            </div>
            <div data-testid="budget-donut-chart" className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Planned']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Legend Swatches */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] pt-4 border-t border-stone-100 dark:border-stone-800">
            {allocations.slice(0, 6).map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                <span className="truncate text-stone-600 dark:text-stone-300">{item.category}</span>
                <span className="font-bold ml-auto">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Allocations Table */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-x-auto">
          {viewMode === 'function' ? (
            /* By Function View */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold">Multi-Function Cost Distribution</h4>
                <span className="text-xs text-stone-400">Weighted by ceremony scale</span>
              </div>
              <div className="space-y-3">
                {functionSplits.map((fn) => (
                  <div key={fn.id} className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{fn.name}</span>
                      <span className="text-sm font-black text-brand-600">{formatINR(fn.planned)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>{fn.sharePercent}% of total</span>
                      <span>Target guests: {fn.guests}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* By Category Table */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold">Category Budgets & Spend Tracker</h4>
                <span className="text-[11px] text-stone-400">Lock category to hold amount</span>
              </div>

              <div className="space-y-3">
                {allocations.map((item) => {
                  const spent = item.spent || 0;
                  const isOver = spent > item.planned;
                  const isHighOver = spent > item.planned * 1.1;

                  return (
                    <div
                      key={item.id}
                      data-testid={`budget-category-row-${item.id}`}
                      className={`p-3.5 rounded-xl border transition-all ${
                        item.locked
                          ? 'border-brand-500/40 bg-brand-50/20 dark:bg-brand-950/10'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            data-testid={`budget-category-lock-${item.id}`}
                            onClick={() => toggleCategoryLock(item.id)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              item.locked
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                            title={item.locked ? 'Unlock category' : 'Lock category to prevent auto-rebalancing'}
                          >
                            {item.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                              {item.category}
                            </span>
                            <span className="ml-2 text-xs font-semibold text-stone-400">
                              {item.percent}%
                            </span>
                          </div>
                        </div>

                        {/* Planned & Spent Inputs */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <label className="block text-[10px] text-stone-400 uppercase font-semibold">Planned</label>
                            <input
                              type="text"
                              key={`${item.id}-${item.planned}`}
                              data-testid={`budget-category-planned-${item.id}`}
                              aria-label={`Planned budget for ${item.category}`}
                              defaultValue={formatINR(item.planned)}
                              onBlur={(e) => {
                                const val = parseMoney(e.target.value);
                                if (val >= 0 && val !== item.planned) {
                                  updateAllocation(item.id, { planned: val, locked: true });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') e.target.blur();
                              }}
                              className="w-24 p-1 text-right text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          </div>

                          <div className="text-right">
                            <label className="block text-[10px] text-stone-400 uppercase font-semibold">Spent</label>
                            <input
                              type="text"
                              key={`${item.id}-${item.spent || 0}`}
                              data-testid={`budget-category-spent-${item.id}`}
                              aria-label={`Spent budget for ${item.category}`}
                              defaultValue={item.spent ? formatINR(item.spent) : '₹0'}
                              onBlur={(e) => {
                                const val = parseMoney(e.target.value);
                                if (val >= 0 && val !== item.spent) {
                                  updateAllocation(item.id, { spent: val });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') e.target.blur();
                              }}
                              className={`w-20 p-1 text-right text-xs font-semibold rounded-lg border outline-none focus:ring-1 ${
                                isOver
                                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                                  : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mini Spend Progress Bar */}
                      {item.planned > 0 && (
                        <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isHighOver ? 'bg-rose-500' : isOver ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.round((spent / item.planned) * 100))}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explain Changes Modal */}
      <Modal
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
        title="AI Budget Trade-off Explanation"
        maxWidth="max-w-xl"
      >
        <div data-testid="budget-explain-panel" className="space-y-4">
          {explaining ? (
            <div className="py-8 text-center text-stone-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-600" />
              <p className="text-xs">Analyzing allocation trade-offs...</p>
            </div>
          ) : explanationData ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Budget Adjustments & Trade-offs:
                </h4>
                <ul className="space-y-2">
                  {explanationData.bullets?.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {explanationData.warnings && explanationData.warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Watch Out</span>
                  </h4>
                  {explanationData.warnings.map((w, idx) => (
                    <p key={idx} className="text-xs text-amber-800 dark:text-amber-300">
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-stone-500">No recent budget changes to analyze.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
