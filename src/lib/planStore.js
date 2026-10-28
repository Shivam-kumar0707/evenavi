/**
 * planStore.js
 * Zustand state management for Evenavi plans with local storage mirror and deterministic engine hooks.
 */

import { create } from 'zustand';
import { rebalance, allocate, getTemplate } from './budgetEngine.js';
import { generateTimeline } from './timelineEngine.js';
import { evaluateRisks } from './riskEngine.js';

const STORAGE_INDEX_KEY = 'evenavi:plans:index';
const STORAGE_PREFIX = 'evenavi:plan:';

/**
 * List all locally saved plans from index
 * @returns {Array<{id: string, title: string, date: string, type: string, updatedAt: string}>}
 */
export function listLocalPlans() {
  try {
    const raw = localStorage.getItem(STORAGE_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save plan to localStorage mirror and update index
 * @param {string} planId
 * @param {object} plan
 */
export function saveToLocalStorage(planId, plan) {
  if (!planId || !plan) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${planId}`, JSON.stringify(plan));

    // Update index
    const index = listLocalPlans();
    const existingIdx = index.findIndex(p => p.id === planId);
    const meta = {
      id: planId,
      title: plan.event?.title || 'Untitled Event',
      date: plan.event?.date || '',
      type: plan.event?.type || 'wedding',
      totalBudget: plan.event?.totalBudget || 0,
      guestCount: plan.event?.guestCount || 0,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      index[existingIdx] = meta;
    } else {
      index.unshift(meta);
    }
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index.slice(0, 50)));
  } catch (err) {
    console.warn('LocalStorage save failed:', err.message);
  }
}

/**
 * Load plan from localStorage mirror
 * @param {string} planId
 * @returns {object|null}
 */
export function loadFromLocalStorage(planId) {
  if (!planId) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${planId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Delete plan from localStorage and index
 * @param {string} planId
 */
export function deleteFromLocalStorage(planId) {
  if (!planId) return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${planId}`);
    const index = listLocalPlans().filter(p => p.id !== planId);
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
  } catch (err) {
    console.warn('LocalStorage delete failed:', err.message);
  }
}

export const usePlanStore = create((set, get) => ({
  currentPlan: null,
  planId: null,
  isDemo: false,
  saveStatus: 'idle', // 'idle' | 'saving' | 'saved' | 'offline' | 'error'
  activeTab: 'overview', // 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'quotes' | 'risks' | 'share'
  budgetError: null,

  setPlan: (plan, planId, isDemo = false) => {
    // Automatically re-evaluate deterministic risks
    const risks = evaluateRisks(plan);
    const planWithRisks = {
      ...plan,
      risks: risks.length > 0 ? risks : (plan.risks || []),
      updatedAt: new Date().toISOString(),
    };

    set({
      currentPlan: planWithRisks,
      planId,
      isDemo,
      budgetError: null,
      saveStatus: isDemo ? 'idle' : 'saved',
    });

    if (!isDemo && planId) {
      saveToLocalStorage(planId, planWithRisks);
    }
  },

  setActiveTab: (tabId) => set({ activeTab: tabId }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  clearBudgetError: () => set({ budgetError: null }),

  updateEventDetails: (eventPartial) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const updatedEvent = { ...currentPlan.event, ...eventPartial };
    let updatedBudget = currentPlan.budget;
    let updatedTimeline = currentPlan.timeline;
    let updatedMeta = currentPlan.timelineMeta;

    // If total budget changed, rebalance allocations
    if (eventPartial.totalBudget && eventPartial.totalBudget !== currentPlan.event.totalBudget) {
      const reb = rebalance({
        allocations: currentPlan.budget.allocations,
        total: eventPartial.totalBudget,
        eventType: updatedEvent.type,
      });
      if (!reb.error) {
        updatedBudget = { ...updatedBudget, allocations: reb.allocations };
      }
    }

    // If event date changed, adjust timeline dates
    if (eventPartial.date && eventPartial.date !== currentPlan.event.date) {
      const generated = generateTimeline({
        eventType: updatedEvent.type,
        eventDate: eventPartial.date,
      });
      updatedTimeline = generated.timeline;
      updatedMeta = generated.timelineMeta;
    }

    const draftPlan = {
      ...currentPlan,
      event: updatedEvent,
      budget: updatedBudget,
      timeline: updatedTimeline,
      timelineMeta: updatedMeta,
      updatedAt: new Date().toISOString(),
    };

    const risks = evaluateRisks(draftPlan);
    set({
      currentPlan: { ...draftPlan, risks },
      saveStatus: get().isDemo ? 'idle' : 'saving',
    });
  },

  updateAllocation: (categoryId, changes) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const allocations = currentPlan.budget.allocations.map(a => {
      if (a.id === categoryId) {
        return { ...a, ...changes };
      }
      return a;
    });

    // If planned amount was changed, rebalance unlocked categories
    let finalAllocations = allocations;
    if (changes.planned != null) {
      const reb = rebalance({
        allocations,
        total: currentPlan.event.totalBudget,
        edited: { id: categoryId, amount: changes.planned },
        eventType: currentPlan.event.type,
      });

      if (reb.error) {
        set({ budgetError: `Cannot rebalance: locked amount exceeds budget by ₹${reb.overBy.toLocaleString('en-IN')}` });
        return;
      }
      finalAllocations = reb.allocations;
    }

    const updatedBudget = {
      ...currentPlan.budget,
      allocations: finalAllocations,
    };

    const draftPlan = {
      ...currentPlan,
      budget: updatedBudget,
      updatedAt: new Date().toISOString(),
    };

    const risks = evaluateRisks(draftPlan);
    set({
      currentPlan: { ...draftPlan, risks },
      budgetError: null,
      saveStatus: get().isDemo ? 'idle' : 'saving',
    });
  },

  toggleCategoryLock: (categoryId) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const updatedAllocations = currentPlan.budget.allocations.map(a => {
      if (a.id === categoryId) {
        return { ...a, locked: !a.locked };
      }
      return a;
    });

    const draftPlan = {
      ...currentPlan,
      budget: { ...currentPlan.budget, allocations: updatedAllocations },
      updatedAt: new Date().toISOString(),
    };

    set({ currentPlan: draftPlan, saveStatus: get().isDemo ? 'idle' : 'saving' });
  },

  resetBudgetToBaseline: () => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const baseline = getTemplate(currentPlan.event.type);
    const allocated = allocate(currentPlan.event.totalBudget, baseline);

    const draftPlan = {
      ...currentPlan,
      budget: { ...currentPlan.budget, allocations: allocated },
      updatedAt: new Date().toISOString(),
    };

    const risks = evaluateRisks(draftPlan);
    set({
      currentPlan: { ...draftPlan, risks },
      budgetError: null,
      saveStatus: get().isDemo ? 'idle' : 'saving',
    });
  },

  toggleTaskDone: (taskId) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const updatedTimeline = currentPlan.timeline.map(t => {
      if (t.id === taskId) {
        return { ...t, done: !t.done };
      }
      return t;
    });

    const draftPlan = {
      ...currentPlan,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString(),
    };

    const risks = evaluateRisks(draftPlan);
    set({
      currentPlan: { ...draftPlan, risks },
      saveStatus: get().isDemo ? 'idle' : 'saving',
    });
  },

  updateVendorStatus: (categoryId, status) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const updatedVendors = currentPlan.vendors.map(v => {
      if (v.id === categoryId) {
        return { ...v, status };
      }
      return v;
    });

    const draftPlan = {
      ...currentPlan,
      vendors: updatedVendors,
      updatedAt: new Date().toISOString(),
    };

    const risks = evaluateRisks(draftPlan);
    set({
      currentPlan: { ...draftPlan, risks },
      saveStatus: get().isDemo ? 'idle' : 'saving',
    });
  },

  toggleVendorTask: (categoryId, taskId) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const updatedVendors = currentPlan.vendors.map(v => {
      if (v.id === categoryId) {
        const tasks = v.tasks.map(t => (t.id === taskId ? { ...t, done: !t.done } : t));
        return { ...v, tasks };
      }
      return v;
    });

    const draftPlan = {
      ...currentPlan,
      vendors: updatedVendors,
      updatedAt: new Date().toISOString(),
    };

    set({ currentPlan: draftPlan, saveStatus: get().isDemo ? 'idle' : 'saving' });
  },

  updateVendorNotes: (categoryId, notes) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const updatedVendors = currentPlan.vendors.map(v => {
      if (v.id === categoryId) {
        return { ...v, notes };
      }
      return v;
    });

    const draftPlan = {
      ...currentPlan,
      vendors: updatedVendors,
      updatedAt: new Date().toISOString(),
    };

    set({ currentPlan: draftPlan, saveStatus: get().isDemo ? 'idle' : 'saving' });
  },

  updateIdeas: (newIdeas) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const draftPlan = {
      ...currentPlan,
      ideas: { ...currentPlan.ideas, ...newIdeas, source: 'ai' },
      updatedAt: new Date().toISOString(),
    };

    set({ currentPlan: draftPlan, saveStatus: get().isDemo ? 'idle' : 'saving' });
  },

  addQuoteComparison: (quoteData) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    const newQuotes = [
      quoteData,
      ...(currentPlan.quotes || []),
    ];

    const draftPlan = {
      ...currentPlan,
      quotes: newQuotes,
      updatedAt: new Date().toISOString(),
    };

    set({ currentPlan: draftPlan, saveStatus: get().isDemo ? 'idle' : 'saving' });
  },
}));
