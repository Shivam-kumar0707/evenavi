import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Calendar, CheckSquare, MessageSquare, Lightbulb, Lock, ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../lib/money.js';

export function InteractiveProductPreview() {
  const [activeTab, setActiveTab] = useState('budget');

  return (
    <div className="w-full rounded-2xl md:rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl shadow-stone-200/50 dark:shadow-none overflow-hidden transition-all">
      {/* Window Title Bar */}
      <div className="px-4 py-3 bg-stone-100/70 dark:bg-stone-800/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="ml-2 text-[11px] font-semibold text-stone-500 dark:text-stone-400 truncate">
            Sample Event Blueprint • Lucknow Wedding
          </span>
        </div>
        <Link
          to="/demo/wedding"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors"
        >
          <span>Open Full Demo</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Plan Header Info */}
      <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800/80 bg-[#FAF9F5] dark:bg-stone-900/40">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                Wedding
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">3-Day Celebration</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              Priya & Kabir's Wedding
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Lucknow (Tier 2) • 250 Guests
            </p>
          </div>

          <div className="text-left xs:text-right">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Budget</div>
            <div className="text-base sm:text-lg font-black text-brand-700 dark:text-brand-400 font-mono">
              ₹12,00,000
            </div>
            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              ₹4,800 / guest
            </div>
          </div>
        </div>

        {/* Mini Preview Tab Strip */}
        <div className="flex items-center gap-1 mt-4 border-t border-stone-200/60 dark:border-stone-800 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'budget'
                ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Budget</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'timeline'
                ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'vendors'
                ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Vendors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'theme'
                ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-5 min-h-[220px]">
        {/* BUDGET TAB */}
        {activeTab === 'budget' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Visual allocation bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                <span>Deterministic Category Split</span>
                <span className="font-mono text-brand-700 dark:text-brand-400">100% Balanced</span>
              </div>
              <div className="h-3 w-full rounded-full bg-stone-100 dark:bg-stone-800 flex overflow-hidden">
                <div style={{ width: '35%' }} className="bg-amber-500" title="Catering 35%" />
                <div style={{ width: '25%' }} className="bg-orange-600" title="Venue 25%" />
                <div style={{ width: '15%' }} className="bg-rose-500" title="Decor 15%" />
                <div style={{ width: '12%' }} className="bg-blue-500" title="Photography 12%" />
                <div style={{ width: '10%' }} className="bg-emerald-500" title="Attire 10%" />
                <div style={{ width: '3%' }} className="bg-stone-500" title="Contingency 3%" />
              </div>
            </div>

            {/* Category Rows with Lock Indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 font-bold text-stone-900 dark:text-stone-100">
                    <span>Catering</span>
                    <Lock className="w-3 h-3 text-brand-600" />
                  </div>
                  <div className="text-[10px] text-stone-500">Awadhi Tasting Menu</div>
                </div>
                <div className="text-right font-mono font-bold text-stone-800 dark:text-stone-200">
                  ₹4,20,000
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">Venue & Lawns</div>
                  <div className="text-[10px] text-stone-500">3 Days Multi-Courtyard</div>
                </div>
                <div className="text-right font-mono font-bold text-stone-800 dark:text-stone-200">
                  ₹3,00,000
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">Decor & Lights</div>
                  <div className="text-[10px] text-stone-500">Marigold & Brass Setup</div>
                </div>
                <div className="text-right font-mono font-bold text-stone-800 dark:text-stone-200">
                  ₹1,80,000
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">Emergency Fund</div>
                  <div className="text-[10px] text-stone-500">3% Floor Protected</div>
                </div>
                <div className="text-right font-mono font-bold text-stone-800 dark:text-stone-200">
                  ₹36,000
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Lock any item and the budget recalculates instantly with ₹0 arithmetic error.</span>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="space-y-2.5 animate-fade-in">
            <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
              Upcoming Milestones • Back-planned from Wedding Date
            </div>

            <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-rose-500" />
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Book Sangeet Choreographer
                  </div>
                  <div className="text-[10px] text-stone-500">Phase 2: Vendor Commitments</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Must Have
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Finalize Awadhi Tasting Menu
                  </div>
                  <div className="text-[10px] text-stone-500">Phase 3: Detail Lock</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Must Have
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Send WhatsApp Digital Invites
                  </div>
                  <div className="text-[10px] text-stone-500">Phase 4: Guest Alignment</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Should Have
              </span>
            </div>
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div className="space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
              <span>Vendor Progress</span>
              <span className="text-brand-600 font-bold">3 of 7 Booked</span>
            </div>

            <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Catering Team</div>
                <div className="text-[10px] text-stone-500">Live Counter Tasting Checklist Included</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Shortlisted
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Traditional Shehnai & DJ</div>
                <div className="text-[10px] text-stone-500">WhatsApp Inquiry Ready (Hinglish)</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Message Ready
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Floral & Mandap Decor</div>
                <div className="text-[10px] text-stone-500">3 Red Flags Identified for Monsoon Safety</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Audited
              </span>
            </div>
          </div>
        )}

        {/* THEME TAB */}
        {activeTab === 'theme' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Concept: Royal Awadhi Jasmine
                </span>
                <span className="text-[10px] font-semibold text-brand-600">AI Tailored</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 italic mb-2.5">
                "Fragrant mogra, warm antique brass lamps, and gentle sitar harmonies."
              </p>

              {/* Palette */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Palette:</span>
                <div className="flex gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-stone-300" style={{ backgroundColor: '#8B0000' }} title="Deep Crimson #8B0000" />
                  <div className="w-5 h-5 rounded-full border border-stone-300" style={{ backgroundColor: '#D4AF37' }} title="Royal Gold #D4AF37" />
                  <div className="w-5 h-5 rounded-full border border-stone-300" style={{ backgroundColor: '#FFF8DC' }} title="Ivory Cream #FFF8DC" />
                  <div className="w-5 h-5 rounded-full border border-stone-300" style={{ backgroundColor: '#2E8B57' }} title="Mogra Green #2E8B57" />
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-[11px] text-stone-600 dark:text-stone-400">
              <strong className="text-stone-900 dark:text-stone-100">Signature Menu:</strong> Galouti Kebabs, Lucknowi Dum Biryani, Shahi Tukda & Jasmine Thandai
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
