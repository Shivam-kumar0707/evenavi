import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Moon, Sun, ChevronDown, PlusCircle, FolderHeart, Calendar, Heart, Gift, Users } from 'lucide-react';
import { listLocalPlans } from '../../lib/planStore.js';

export function Navbar({ onOpenMyPlans }) {
  const [darkMode, setDarkMode] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [planCount, setPlanCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') ||
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
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-stone-900 to-stone-700 dark:from-white dark:to-stone-300 bg-clip-text text-transparent">
                Evenavi
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                Organise events
              </span>
            </div>
          </Link>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Try Demo Menu */}
            <div className="relative">
              <button
                data-testid="try-demo-btn"
                onClick={() => setDemoOpen(!demoOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors"
                aria-expanded={demoOpen}
                aria-label="Try demo plan menu"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Try Demo</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {demoOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-1.5 z-50 animate-fade-in"
                  onClick={() => setDemoOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Instant Demo Plans (No Network)
                  </div>
                  <Link
                    to="/demo/wedding"
                    data-testid="demo-wedding-btn"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-medium">3-Day Wedding</div>
                      <div className="text-xs text-stone-400">Lucknow • ₹12L • 250 guests</div>
                    </div>
                  </Link>
                  <Link
                    to="/demo/birthday"
                    data-testid="demo-birthday-btn"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 transition-colors"
                  >
                    <Gift className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="font-medium">7th Birthday Party</div>
                      <div className="text-xs text-stone-400">Pune • ₹40k • 40 guests</div>
                    </div>
                  </Link>
                  <Link
                    to="/demo/community"
                    data-testid="demo-community-btn"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 transition-colors"
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Society Diwali Mela</div>
                      <div className="text-xs text-stone-400">Bengaluru • ₹1.5L • 400 pax</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* My Plans Drawer Trigger */}
            <button
              onClick={onOpenMyPlans}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors"
              aria-label="Open saved plans"
            >
              <FolderHeart className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span className="hidden sm:inline">My Plans</span>
              {planCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 font-bold">
                  {planCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* New Plan CTA */}
            <Link
              to="/new"
              data-testid="start-planning-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Plan</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
