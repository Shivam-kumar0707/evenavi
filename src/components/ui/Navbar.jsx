import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Moon, Sun, ChevronDown, PlusCircle, FolderHeart, Calendar, Heart, Gift, Users } from 'lucide-react';
import { listLocalPlans } from '../../lib/planStore.js';

export function Navbar({ onOpenMyPlans }) {
  const [darkMode, setDarkMode] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [planCount, setPlanCount] = useState(0);

  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');

    const updateCount = () => setPlanCount(listLocalPlans().length);
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <nav className="print:hidden sticky top-0 z-40 bg-[#FCFBF9]/90 dark:bg-[#0C0A09]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Descriptor */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-brand-600/30 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                Evenavi
              </span>
              <span className="hidden sm:inline-flex items-center text-[11px] font-semibold tracking-wide text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full border border-brand-200/60 dark:border-brand-800/60">
                AI Event Planner
              </span>
            </div>
          </Link>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
            {/* Try Demo Menu */}
            <div className="relative">
              <button
                data-testid="try-demo-btn"
                onClick={() => setDemoOpen(!demoOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 transition-colors"
                aria-expanded={demoOpen}
                aria-label="Try demo plan menu"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden xs:inline">Try Demo</span>
                <span className="xs:hidden">Demo</span>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {demoOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-50 animate-fade-in"
                  onClick={() => setDemoOpen(false)}
                >
                  <div className="px-3.5 py-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                    Instant Demos (No Network)
                  </div>
                  <Link
                    to="/demo/wedding"
                    data-testid="demo-wedding-btn"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                      <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm">3-Day Wedding</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">Lucknow • ₹12L • 250 guests</div>
                    </div>
                  </Link>
                  <Link
                    to="/demo/birthday"
                    data-testid="demo-birthday-btn"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                      <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm">7th Birthday Party</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">Pune • ₹40k • 40 guests</div>
                    </div>
                  </Link>
                  <Link
                    to="/demo/community"
                    data-testid="demo-community-btn"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm">Society Diwali Mela</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">Bengaluru • ₹1.5L • 400 pax</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* My Plans Drawer Trigger */}
            <button
              onClick={onOpenMyPlans}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 transition-colors"
              aria-label="Open saved plans"
            >
              <FolderHeart className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="hidden sm:inline">My Plans</span>
              {planCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 font-extrabold">
                  {planCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 transition-colors shrink-0"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Prominent New Plan CTA */}
            <Link
              to="/new"
              data-testid="start-planning-btn"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">New Plan</span>
              <span className="xs:hidden">New</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
