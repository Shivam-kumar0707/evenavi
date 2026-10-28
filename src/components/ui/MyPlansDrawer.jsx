import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Users, IndianRupee, Trash2, ArrowRight, FolderOpen } from 'lucide-react';
import { listLocalPlans, deleteFromLocalStorage } from '../../lib/planStore.js';
import { formatCompactINR } from '../../lib/money.js';

export function MyPlansDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const plans = listLocalPlans();

  if (!isOpen) return null;

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Remove this plan from your saved list?')) {
      deleteFromLocalStorage(id);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleOpen = (id) => {
    onClose();
    navigate(`/plan/${id}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800 animate-slide-left">
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">My Saved Plans</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Close saved plans"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5" data-testid="my-plans-list">
          {plans.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40 text-stone-400" />
              <p className="font-medium text-stone-600 dark:text-stone-300">No saved plans found</p>
              <p className="text-xs text-stone-400 mt-1">
                Create a new plan or explore a demo to see it listed here.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/new');
                }}
                className="mt-5 px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                Create Your First Plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  data-testid={`plan-card-${p.id}`}
                  onClick={() => handleOpen(p.id)}
                  className="group p-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-brand-500/50 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-white dark:hover:bg-stone-800 cursor-pointer transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 mb-1.5">
                        {p.type || 'Event'}
                      </span>
                      <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {p.title}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete plan"
                      aria-label={`Delete ${p.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-stone-500 dark:text-stone-400">
                    {p.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {p.date}
                      </span>
                    )}
                    {p.totalBudget > 0 && (
                      <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-200">
                        {formatCompactINR(p.totalBudget)}
                      </span>
                    )}
                    {p.guestCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        {p.guestCount} guests
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
