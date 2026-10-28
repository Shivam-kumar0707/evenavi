import React, { useState } from 'react';
import { MessageSquare, CheckSquare, Square, AlertOctagon, HelpCircle, Copy, Send, Check, PhoneCall, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { SourceBadge } from '../ui/Badge.jsx';
import { usePlanStore } from '../../lib/planStore.js';
import { callAiTask } from '../../lib/aiClient.js';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { value: 'quoted', label: 'Quoted', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  { value: 'booked', label: 'Booked', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  { value: 'paid', label: 'Paid in Full', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
];

export function VendorsTab() {
  const plan = usePlanStore((state) => state.currentPlan);
  const updateVendorStatus = usePlanStore((state) => state.updateVendorStatus);
  const toggleVendorTask = usePlanStore((state) => state.toggleVendorTask);

  const [activeVendorModal, setActiveVendorModal] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [intent, setIntent] = useState('enquiry');
  const [language, setLanguage] = useState('en');
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!plan) return null;

  const { event, vendors } = plan;

  const handleOpenMessageModal = async (vendor) => {
    setActiveVendorModal(vendor);
    setVendorName('');
    setIntent('enquiry');
    setLanguage('en');
    setCopied(false);
    fetchMessage(vendor.category, '', 'enquiry', 'en');
  };

  const fetchMessage = async (category, vName, itnt, lang) => {
    setGeneratingMessage(true);
    try {
      const res = await callAiTask('vendor_message', {
        category,
        vendorName: vName,
        intent: itnt,
        language: lang,
        event,
      });
      setGeneratedMessage(res.data?.message || '');
    } catch {
      // fallback handles it
    } finally {
      setGeneratingMessage(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Vendor Management & Checklists</h3>
          <p className="text-xs text-stone-500">Track milestones, what to ask, and generate WhatsApp-ready messages.</p>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(vendors || []).map((vendor) => (
          <div
            key={vendor.id}
            data-testid={`vendor-category-card-${vendor.id}`}
            className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Card Header: Category & Status */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {vendor.category}
                  </h4>
                  {vendor.source === 'ai' && <SourceBadge source="ai" />}
                </div>

                <label htmlFor={`vendor-status-select-${vendor.id}`} className="sr-only">Status for {vendor.category}</label>
                <select
                  id={`vendor-status-select-${vendor.id}`}
                  data-testid={`vendor-status-select-${vendor.id}`}
                  value={vendor.status}
                  onChange={(e) => updateVendorStatus(vendor.id, e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tasks Checklist */}
              {vendor.tasks && vendor.tasks.length > 0 && (
                <div className="mb-4">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    Action Checklist
                  </span>
                  <div className="space-y-1.5">
                    {vendor.tasks.map((task) => (
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={task.done}
                        key={task.id}
                        data-testid={`vendor-task-item-${task.id}`}
                        onClick={() => toggleVendorTask(vendor.id, task.id)}
                        className="w-full text-left flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 p-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {task.done ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                        )}
                        <span className={task.done ? 'line-through text-stone-400' : ''}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions to Ask */}
              {vendor.questions && vendor.questions.length > 0 && (
                <div data-testid={`vendor-questions-list-${vendor.id}`} className="mb-4 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-2">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Questions to Ask</span>
                  </span>
                  <ul className="space-y-1.5">
                    {vendor.questions.map((q, idx) => (
                      <li key={idx} className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags to Watch */}
              {vendor.redFlags && vendor.redFlags.length > 0 && (
                <div data-testid={`vendor-redflags-list-${vendor.id}`} className="mb-4 p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200 mb-2">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    <span>Red Flags</span>
                  </span>
                  <ul className="space-y-1.5">
                    {vendor.redFlags.map((rf, idx) => (
                      <li key={idx} className="text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2">
                        <span className="text-rose-500 font-bold">⚠</span>
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions: Draft Message Button */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                data-testid={`vendor-message-btn-${vendor.id}`}
                onClick={() => handleOpenMessageModal(vendor)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Draft Vendor WhatsApp Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message Generator Modal */}
      {activeVendorModal && (
        <Modal
          isOpen={Boolean(activeVendorModal)}
          onClose={() => setActiveVendorModal(null)}
          title={`Draft WhatsApp Message (${activeVendorModal.category})`}
          maxWidth="max-w-xl"
        >
          <div data-testid="vendor-message-modal" className="space-y-4">
            {/* Vendor Name */}
            <div>
              <label htmlFor="modal-vendor-name" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Vendor Name (Optional)
              </label>
              <input
                id="modal-vendor-name"
                type="text"
                value={vendorName}
                onChange={(e) => {
                  setVendorName(e.target.value);
                  fetchMessage(activeVendorModal.category, e.target.value, intent, language);
                }}
                placeholder="e.g. Royal Caterers / Rohit Sharma"
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Intent & Language Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="modal-vendor-intent" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Message Purpose
                </label>
                <select
                  id="modal-vendor-intent"
                  value={intent}
                  onChange={(e) => {
                    setIntent(e.target.value);
                    fetchMessage(activeVendorModal.category, vendorName, e.target.value, language);
                  }}
                  className="w-full p-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="enquiry">Initial Enquiry & Packages</option>
                  <option value="negotiate">Price Negotiation</option>
                  <option value="confirm">Confirm Booking</option>
                  <option value="followup">Follow-up on Quote</option>
                </select>
              </div>

              <div>
                <label htmlFor="modal-vendor-language" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Language
                </label>
                <select
                  id="modal-vendor-language"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    fetchMessage(activeVendorModal.category, vendorName, intent, e.target.value);
                  }}
                  className="w-full p-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="en">English (Professional)</option>
                  <option value="hi">Hindi (Devanagari)</option>
                  <option value="hinglish">Hinglish (Natural)</option>
                </select>
              </div>
            </div>

            {/* Message Box */}
            <div className="relative">
              <label htmlFor="modal-generated-message" className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Generated Message (Under 90 words):
              </label>
              <textarea
                id="modal-generated-message"
                rows={4}
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed font-sans"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                data-testid="vendor-message-copy-btn"
                onClick={handleCopyMessage}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                data-testid="vendor-message-whatsapp-btn"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send on WhatsApp</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
