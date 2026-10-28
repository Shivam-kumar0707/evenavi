import React, { useState } from 'react';
import { Share2, Copy, Check, Send, Download, Printer, FileJson, Calendar, Lock } from 'lucide-react';
import { generateIcs, downloadIcsFile } from '../../lib/ics.js';
import { usePlanStore } from '../../lib/planStore.js';

export function ShareTab() {
  const plan = usePlanStore((state) => state.currentPlan);
  const planId = usePlanStore((state) => state.planId);
  const [copied, setCopied] = useState(false);

  if (!plan) return null;

  const { event, timeline } = plan;
  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Hey! Here is our complete event plan for ${event.title} on Evenavi: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportIcs = () => {
    const icsContent = generateIcs({
      eventTitle: event.title,
      tasks: timeline || [],
      planId: planId || 'evenavi',
    });
    downloadIcsFile(icsContent, `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_calendar.ics`);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Share Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="w-5 h-5 text-brand-600" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Share Plan with Co-Planners</h3>
        </div>
        <p className="text-xs text-stone-500 mb-5">
          Evenavi operates without logins. Anyone with this unique link can view and collaborate on the plan.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono text-stone-600 dark:text-stone-300 truncate">
            {shareUrl}
          </div>

          <button
            type="button"
            data-testid="share-copy-link-btn"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            data-testid="share-whatsapp-btn"
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Calendar .ics Export */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">Calendar Schedule (.ics)</h4>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Export all dated milestone tasks directly to Apple Calendar, Google Calendar, or Outlook with alert reminders.
            </p>
          </div>
          <button
            type="button"
            data-testid="export-ics-btn"
            onClick={handleExportIcs}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download .ics</span>
          </button>
        </div>

        {/* Print / Save as PDF */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">Print / Save as PDF</h4>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Generate a clean, print-optimized document ready to save as PDF or print for offline family review.
            </p>
          </div>
          <button
            type="button"
            data-testid="export-print-btn"
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print or PDF</span>
          </button>
        </div>

        {/* JSON Export */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-3">
              <FileJson className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">Raw JSON Backup</h4>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Download the complete structured plan JSON file for full data portability and archiving.
            </p>
          </div>
          <button
            type="button"
            data-testid="export-json-btn"
            onClick={handleExportJson}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
