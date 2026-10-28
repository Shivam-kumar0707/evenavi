import React, { useState } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import { Calendar, CheckCircle2, Circle, AlertTriangle, Download, Filter, Tag, Flag } from 'lucide-react';
import { PHASES } from '../../lib/timelineEngine.js';
import { generateIcs, downloadIcsFile } from '../../lib/ics.js';
import { SourceBadge } from '../ui/Badge.jsx';
import { usePlanStore } from '../../lib/planStore.js';

export function TimelineTab() {
  const plan = usePlanStore((state) => state.currentPlan);
  const toggleTaskDone = usePlanStore((state) => state.toggleTaskDone);

  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!plan) return null;

  const { event, timeline, timelineMeta } = plan;
  const tasks = timeline || [];

  // Extract unique categories for filter
  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));

  const filteredTasks = selectedCategory === 'all'
    ? tasks
    : tasks.filter((t) => t.category === selectedCategory);

  const handleExportIcs = () => {
    const icsContent = generateIcs({
      eventTitle: event.title,
      tasks,
      planId: plan.id || 'evenavi_event',
    });
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_timeline.ics`;
    downloadIcsFile(icsContent, filename);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Filter and Action Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <label htmlFor="timeline-category-select" className="sr-only">Filter tasks by category</label>
          <select
            id="timeline-category-select"
            data-testid="timeline-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Categories ({tasks.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()} ({tasks.filter((t) => t.category === c).length})
              </option>
            ))}
          </select>
        </div>

        {/* Calendar Export Button */}
        <button
          data-testid="timeline-export-ics-btn"
          onClick={handleExportIcs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export to Calendar (.ics)</span>
        </button>
      </div>

      {/* Tight Timeline Compression Banner */}
      {timelineMeta?.compressed && (
        <div
          data-testid="timeline-tight-warning"
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              Tight Timeline Alert
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              {timelineMeta.warning || 'Deadlines have been compressed to ensure all milestones fit before your event date.'}
            </p>
          </div>
        </div>
      )}

      {/* Grouped Phases List */}
      <div className="space-y-6">
        {PHASES.map((phase) => {
          const phaseTasks = filteredTasks.filter((t) => t.phase === phase.id);
          if (phaseTasks.length === 0) return null;

          return (
            <div
              key={phase.id}
              data-testid={`timeline-phase-${phase.id}`}
              className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{phase.name}</h3>
                </div>
                <span className="text-xs font-semibold text-stone-400">
                  {phaseTasks.filter((t) => t.done).length} / {phaseTasks.length} Done
                </span>
              </div>

              <div className="space-y-2.5">
                {phaseTasks.map((task) => {
                  const isOverdue = !task.done && task.dueDate < todayStr && task.phase !== 'after';

                  return (
                    <div
                      key={task.id}
                      data-testid={`timeline-task-${task.id}`}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        task.done
                          ? 'border-stone-200 dark:border-stone-800/60 bg-stone-50/60 dark:bg-stone-800/20 opacity-70'
                          : isOverdue
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/40 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {/* Left: Checkbox & Title */}
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          data-testid={`timeline-task-checkbox-${task.id}`}
                          onClick={() => toggleTaskDone(task.id)}
                          className="mt-0.5 text-stone-400 hover:text-brand-600 transition-colors"
                          aria-label={`Mark task ${task.title} as ${task.done ? 'incomplete' : 'complete'}`}
                        >
                          {task.done ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div>
                          <p
                            className={`text-xs sm:text-sm font-medium ${
                              task.done
                                ? 'line-through text-stone-400'
                                : 'text-stone-900 dark:text-stone-100'
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                            {/* Category Tag */}
                            <span className="px-2 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300 font-semibold uppercase text-[10px]">
                              {task.category}
                            </span>

                            {/* Priority Tag */}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                task.priority === 'must'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : task.priority === 'should'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                              }`}
                            >
                              {task.priority}
                            </span>

                            {task.source === 'ai' && <SourceBadge source="ai" />}

                            {isOverdue && (
                              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Overdue</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Due Date */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
