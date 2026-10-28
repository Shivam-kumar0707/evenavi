import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarX, ArrowLeft, Home, PlusCircle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center shadow-lg">
        <CalendarX className="w-14 h-14 text-brand-600 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100">Page Not Found</h2>
        <p className="text-xs text-stone-500 mt-2 mb-6 leading-relaxed">
          The event plan or URL you requested does not exist. Evenavi plans live at unique shareable links.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            to="/new"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Plan</span>
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
