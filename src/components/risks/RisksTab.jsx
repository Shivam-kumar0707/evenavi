import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Sparkles, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { usePlanStore } from '../../lib/planStore.js';
import { callAiTask } from '../../lib/aiClient.js';

export function RisksTab() {
  const plan = usePlanStore((state) => state.currentPlan);
  const setPlan = usePlanStore((state) => state.setPlan);

  const [enriching, setEnriching] = useState(false);

  if (!plan) return null;

  const { event, risks } = plan;

  const handleEnrichPlanB = async () => {
    if (!risks || risks.length === 0) return;
    setEnriching(true);
    try {
      const res = await callAiTask('plan_b', {
        event,
        risks: risks.map((r) => ({ id: r.id, title: r.title, detail: r.detail })),
      });

      if (res.data?.mitigations) {
        const enrichedRisks = risks.map((r) => {
          const m = res.data.mitigations.find((item) => item.riskId === r.id);
          if (m && m.steps?.length) {
            return {
              ...r,
              mitigation: m.steps.join(' • '),
              source: 'ai',
            };
          }
          return r;
        });

        const updatedPlan = {
          ...plan,
          risks: enrichedRisks,
          updatedAt: new Date().toISOString(),
        };
        setPlan(updatedPlan, plan.id || 'plan_current', plan.isDemo);
      }
    } catch {
      // fallback handles it
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Plan B & Contingency Risk Engine</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time evaluation of budget overruns, compressed timelines, weather, and peak season demand.
          </p>
        </div>

        {risks && risks.length > 0 && (
          <button
            type="button"
            onClick={handleEnrichPlanB}
            disabled={enriching}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 border border-brand-200 dark:border-brand-800 disabled:opacity-50 transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${enriching ? 'animate-spin' : ''}`} />
            <span>{enriching ? 'Enriching...' : 'AI Plan B Enrich'}</span>
          </button>
        )}
      </div>

      {/* Risks List */}
      {!risks || risks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">All Clear — Zero Critical Risks Detected</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Your event timeline is well-paced, budget allocations are within comfortable bands, and essential vendor bookings are progressing on track.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {risks.map((risk) => {
            const isHigh = risk.severity === 'high';
            return (
              <div
                key={risk.id}
                data-testid={`risk-alert-${risk.id}`}
                className={`p-6 rounded-2xl border transition-all ${
                  isHigh
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/10'
                    : 'border-amber-300 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${isHigh ? 'text-rose-600' : 'text-amber-600'}`} />
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{risk.title}</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isHigh
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {risk.severity} Severity
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4 pl-7">
                  {risk.detail}
                </p>

                {/* Mitigation Steps Box */}
                <div
                  data-testid={`risk-mitigation-${risk.id}`}
                  className="ml-7 p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                    Plan B Recommended Action:
                  </span>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    {risk.mitigation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
