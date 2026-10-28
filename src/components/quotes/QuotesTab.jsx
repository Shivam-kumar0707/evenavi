import React, { useState } from 'react';
import { Scale, Sparkles, AlertTriangle, CheckCircle, ShieldAlert, FileText, ArrowRight, Lightbulb } from 'lucide-react';
import { usePlanStore } from '../../lib/planStore.js';
import { callAiTask } from '../../lib/aiClient.js';
import { formatINR } from '../../lib/money.js';

export function QuotesTab() {
  const plan = usePlanStore((state) => state.currentPlan);
  const addQuoteComparison = usePlanStore((state) => state.addQuoteComparison);

  const [category, setCategory] = useState('Catering');
  const [quotes, setQuotes] = useState(['', '', '']);
  const [comparing, setComparing] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [validationError, setValidationError] = useState('');

  if (!plan) return null;

  const { event, quotes: historyQuotes } = plan;
  const categories = plan.budget?.allocations?.map((a) => a.category) || ['Venue', 'Catering', 'Decor & Lighting', 'Photo & Video'];

  const handleQuoteChange = (index, val) => {
    setValidationError('');
    const updated = [...quotes];
    updated[index] = val;
    setQuotes(updated);
  };

  const handleCompare = async () => {
    const validQuotes = quotes.map((q) => q.trim()).filter(Boolean);
    if (validQuotes.length < 2) {
      setValidationError('Please paste at least 2 vendor quotes to compare.');
      return;
    }
    setValidationError('');

    setComparing(true);
    try {
      const res = await callAiTask('compare_quotes', {
        category,
        event,
        quotes: validQuotes,
      });

      if (res.data) {
        setLatestResult(res.data);
        addQuoteComparison({
          id: `quote_${Date.now()}`,
          category,
          input: validQuotes,
          result: res.data,
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // handled by fallback
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Intake Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-600" />
              <span>Quote Comparison & Hidden Cost Analyzer</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Paste 2 to 3 vendor proposals to normalize totals, unmask hidden taxes/overtime, and get negotiation tips.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="quote-category-select" className="text-xs font-semibold text-stone-500">Category:</label>
            <select
              id="quote-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Quote Input Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1 text-xs font-semibold text-stone-600 dark:text-stone-400">
                <span>Vendor Quote {idx + 1} {idx === 2 ? '(Optional)' : ''}</span>
                <span className="text-[10px] text-stone-400">{quotes[idx].length}/1200</span>
              </div>
              <textarea
                data-testid={`quote-input-${idx + 1}`}
                rows={5}
                maxLength={1200}
                value={quotes[idx]}
                onChange={(e) => handleQuoteChange(idx, e.target.value)}
                placeholder={
                  idx === 0
                    ? 'Paste quote text here:\n"₹1,150/plate for 250 pax. Starters, mains, desserts included. Taxes separate."'
                    : idx === 1
                    ? 'Paste quote text here:\n"All-inclusive ₹3.1L with live chaat, staff & mocktail bar. 40% advance."'
                    : 'Paste 3rd quote text here (optional)...'
                }
                className="w-full p-3 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            data-testid="quote-compare-btn"
            onClick={handleCompare}
            disabled={comparing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{comparing ? 'Analyzing Quotes...' : 'Analyze & Compare Quotes'}</span>
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div role="alert" className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Comparison Results Card */}
      {(latestResult || (historyQuotes && historyQuotes.length > 0)) && (
        <div data-testid="quote-results-container" className="space-y-6">
          {(() => {
            const activeResult = latestResult || historyQuotes[0]?.result;
            if (!activeResult) return null;

            return (
              <>
                {/* Recommendation Banner */}
                {activeResult.recommendation && (
                  <div data-testid="quote-recommendation" className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-1.5 text-emerald-900 dark:text-emerald-200">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-sm font-bold uppercase tracking-wider">
                        Best Value Recommendation: {activeResult.bestValue}
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      {activeResult.recommendation}
                    </p>
                  </div>
                )}

                {/* Normalized Quotes Comparison Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(activeResult.normalized || []).map((norm, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{norm.vendor}</h4>
                          <span className="text-xs font-black text-brand-600">
                            {typeof norm.total === 'number' ? formatINR(norm.total) : norm.total}
                          </span>
                        </div>

                        {/* Inclusions */}
                        {norm.inclusions && norm.inclusions.length > 0 && (
                          <div className="mt-3">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                              Included
                            </span>
                            <ul className="space-y-1">
                              {norm.inclusions.map((inc, i) => (
                                <li key={i} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-1.5">
                                  <span className="text-emerald-500 font-bold">✓</span>
                                  <span>{inc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Exclusions */}
                        {norm.exclusions && norm.exclusions.length > 0 && (
                          <div className="mt-3">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                              Excluded
                            </span>
                            <ul className="space-y-1">
                              {norm.exclusions.map((exc, i) => (
                                <li key={i} className="text-xs text-stone-500 flex items-start gap-1.5">
                                  <span className="text-stone-400 font-bold">✕</span>
                                  <span>{exc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Hidden Cost Flags */}
                        {norm.hiddenCostFlags && norm.hiddenCostFlags.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                            <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block mb-1 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              <span>Hidden Cost Alerts</span>
                            </span>
                            <ul className="space-y-1">
                              {norm.hiddenCostFlags.map((flag, i) => (
                                <li key={i} className="text-[11px] text-amber-800 dark:text-amber-300">
                                  • {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Negotiation Tips */}
                {activeResult.negotiationTips && activeResult.negotiationTips.length > 0 && (
                  <div data-testid="quote-negotiation-tips" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Tailored Negotiation Levers
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {activeResult.negotiationTips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
