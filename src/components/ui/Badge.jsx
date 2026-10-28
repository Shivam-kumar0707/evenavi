import React from 'react';
import { Sparkles, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function SourceBadge({ source = 'template' }) {
  const isAi = source === 'ai';
  return (
    <span
      data-testid="source-badge"
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isAi
          ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
          : 'bg-stone-100 text-stone-700 border border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'
      }`}
    >
      {isAi ? (
        <>
          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>AI Personalized</span>
        </>
      ) : (
        <>
          <FileText className="w-3 h-3 text-stone-500" />
          <span>Template</span>
        </>
      )}
    </span>
  );
}

export function SaveStatusBadge({ status = 'idle' }) {
  if (status === 'idle') return null;

  return (
    <span
      data-testid="save-status-badge"
      className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400"
    >
      {status === 'saving' && (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Saved</span>
        </>
      )}
      {status === 'offline' && (
        <>
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Saved on this device</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Failed to save</span>
        </>
      )}
    </span>
  );
}

export function AffordabilityBadge({ band = 'Comfortable' }) {
  const styles = {
    Tight: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Comfortable: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Generous: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  };

  return (
    <span
      data-testid="affordability-band-badge"
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        styles[band] || styles.Comfortable
      }`}
    >
      {band} Budget Band
    </span>
  );
}
