import React, { useState } from 'react';
import { Sparkles, Utensils, Gift, Activity, Mail, Copy, Check, RefreshCw, Palette } from 'lucide-react';
import { SourceBadge } from '../ui/Badge.jsx';
import { usePlanStore } from '../../lib/planStore.js';
import { callAiTask } from '../../lib/aiClient.js';

export function IdeasTab() {
  const plan = usePlanStore((state) => state.currentPlan);
  const updateIdeas = usePlanStore((state) => state.updateIdeas);

  const [invitationLang, setInvitationLang] = useState('en'); // 'en' | 'hi' | 'hinglish'
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  if (!plan) return null;

  const { event, ideas } = plan;
  const themes = ideas?.themes || [];
  const menu = ideas?.menu || { starters: [], mains: [], desserts: [], drinks: [] };
  const activities = ideas?.activities || [];
  const returnGifts = ideas?.returnGifts || [];
  const invitation = ideas?.invitation || { en: '', hi: '', hinglish: '' };

  const handleRegenerateIdeas = async () => {
    setRegenerating(true);
    try {
      const res = await callAiTask('ideas', { event });
      if (res.data) {
        updateIdeas(res.data);
      }
    } catch {
      // fallback handles it
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyInvitation = () => {
    const text = invitation[invitationLang] || '';
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Regenerate CTA */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Personalized Ideas & Inspiration</h3>
            <SourceBadge source={ideas?.source || 'template'} />
          </div>
          <p className="text-xs text-stone-500">Curated themes, full menu, activities, and multilingual invitations.</p>
        </div>

        <button
          type="button"
          data-testid="ideas-regenerate-btn"
          onClick={handleRegenerateIdeas}
          disabled={regenerating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          <span>{regenerating ? 'Personalizing...' : 'Regenerate Ideas'}</span>
        </button>
      </div>

      {/* 1. THREE THEME CONCEPTS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-brand-600" />
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            3 Tailored Theme Concepts
          </h4>
        </div>

        <div data-testid="ideas-themes-container" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((theme, idx) => (
            <div
              key={idx}
              data-testid={`theme-card-${idx}`}
              className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h5 className="font-extrabold text-base text-stone-900 dark:text-stone-100">{theme.name}</h5>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{theme.tagline}</p>

                {/* Color Palette Swatches */}
                <div data-testid={`theme-palette-${idx}`} className="mt-4 flex items-center gap-2">
                  {(theme.palette || []).map((hex, colorIdx) => (
                    <div key={colorIdx} className="flex flex-col items-center gap-1">
                      <span
                        className="w-8 h-8 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                      <span className="text-[10px] text-stone-400 font-mono">{hex}</span>
                    </div>
                  ))}
                </div>

                {/* Decor Highlights */}
                {theme.decor && theme.decor.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                      Decor Accents
                    </span>
                    <ul className="space-y-1">
                      {theme.decor.map((d, dIdx) => (
                        <li key={dIdx} className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-1.5">
                          <span className="text-brand-500">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Menu Highlights */}
                {theme.menuHighlights && theme.menuHighlights.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                      Signature Bites ({event.diet})
                    </span>
                    <ul className="space-y-1">
                      {theme.menuHighlights.map((m, mIdx) => (
                        <li key={mIdx} className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-1.5">
                          <span className="text-amber-500">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Activity Highlight */}
              {theme.activity && (
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                    Signature Experience
                  </span>
                  <p className="text-xs text-stone-600 dark:text-stone-300 italic">{theme.activity}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. FULL CURATED MENU */}
      <div data-testid="ideas-menu-container" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Curated Banquet Menu ({event.diet?.toUpperCase()} DIET)
            </h4>
          </div>
          <span className="text-xs text-stone-400">Respects cultural preferences</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Starters */}
          <div>
            <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-stone-200 dark:border-stone-700">
              Starters & Live Counters
            </h5>
            <ul className="space-y-1.5">
              {(menu.starters || []).map((item, idx) => (
                <li key={idx} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mains */}
          <div>
            <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-stone-200 dark:border-stone-700">
              Main Course & Breads
            </h5>
            <ul className="space-y-1.5">
              {(menu.mains || []).map((item, idx) => (
                <li key={idx} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Desserts */}
          <div>
            <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-stone-200 dark:border-stone-700">
              Desserts & Mithai
            </h5>
            <ul className="space-y-1.5">
              {(menu.desserts || []).map((item, idx) => (
                <li key={idx} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Drinks */}
          <div>
            <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-stone-200 dark:border-stone-700">
              Beverages & Warm Sips
            </h5>
            <ul className="space-y-1.5">
              {(menu.drinks || []).map((item, idx) => (
                <li key={idx} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. ACTIVITIES & RETURN GIFTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activities */}
        <div data-testid="ideas-activities-container" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Signature Activities & Games
            </h4>
          </div>
          <ul className="space-y-2 mt-3">
            {(activities || []).map((act, idx) => (
              <li key={idx} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Return Gifts */}
        <div data-testid="ideas-return-gifts-container" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Thoughtful Return Gift Ideas
            </h4>
          </div>
          <ul className="space-y-2 mt-3">
            {(returnGifts || []).map((gift, idx) => (
              <li key={idx} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                  🎁
                </span>
                <span>{gift}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. MULTILINGUAL INVITATION COPY */}
      <div data-testid="ideas-invitation-container" className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-600" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Event Invitation Copy
            </h4>
          </div>

          {/* Language Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800">
            <button
              type="button"
              data-testid="invitation-lang-en"
              onClick={() => setInvitationLang('en')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                invitationLang === 'en'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              English
            </button>
            <button
              type="button"
              data-testid="invitation-lang-hi"
              onClick={() => setInvitationLang('hi')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                invitationLang === 'hi'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              type="button"
              data-testid="invitation-lang-hinglish"
              onClick={() => setInvitationLang('hinglish')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                invitationLang === 'hinglish'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>

        {/* Invitation Text Box */}
        <div className="relative p-5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
          <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans pr-10">
            {invitation[invitationLang] || 'Invitation copy is being prepared for your event.'}
          </p>

          <button
            type="button"
            onClick={handleCopyInvitation}
            className="absolute right-3 top-3 p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            title="Copy invitation text"
            aria-label="Copy invitation text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
