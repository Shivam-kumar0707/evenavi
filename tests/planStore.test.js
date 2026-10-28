import { describe, it, expect, beforeEach } from 'vitest';
import { usePlanStore, saveToLocalStorage, loadFromLocalStorage, listLocalPlans, deleteFromLocalStorage } from '../src/lib/planStore.js';
import { DEMO_PLANS } from '../src/data/demoPlans.js';

describe('planStore.js State Management & Local Storage', () => {
  beforeEach(() => {
    localStorage.clear();
    usePlanStore.getState().setPlan(DEMO_PLANS.birthday, 'test_bday_1', false);
  });

  it('initializes plan state and updates active tab', () => {
    const store = usePlanStore.getState();
    expect(store.currentPlan.event.title).toContain('Aarav');
    expect(store.planId).toBe('test_bday_1');

    store.setActiveTab('budget');
    expect(usePlanStore.getState().activeTab).toBe('budget');
  });

  it('updates category allocation and triggers rebalance without drift', () => {
    const store = usePlanStore.getState();
    const initialTotal = store.currentPlan.event.totalBudget;

    // Change venue to 10000 (was 8000)
    store.updateAllocation('venue', { planned: 10000 });

    const updated = usePlanStore.getState().currentPlan;
    const venueItem = updated.budget.allocations.find(a => a.id === 'venue');
    expect(venueItem.planned).toBe(10000);
    expect(venueItem.locked).toBe(true);

    const sum = updated.budget.allocations.reduce((acc, curr) => acc + curr.planned, 0);
    expect(sum).toBe(initialTotal);
  });

  it('toggles timeline tasks and vendor tasks', () => {
    const store = usePlanStore.getState();
    const firstTask = store.currentPlan.timeline[0];
    const initialDone = firstTask.done;

    store.toggleTaskDone(firstTask.id);
    const toggled = usePlanStore.getState().currentPlan.timeline.find(t => t.id === firstTask.id);
    expect(toggled.done).toBe(!initialDone);
  });

  it('updates vendor status properly', () => {
    const store = usePlanStore.getState();
    store.updateVendorStatus('cake', 'paid');
    const cakeVendor = usePlanStore.getState().currentPlan.vendors.find(v => v.id === 'cake');
    expect(cakeVendor.status).toBe('paid');
  });

  it('persists and retrieves from local storage index', () => {
    saveToLocalStorage('plan_abc', DEMO_PLANS.community);
    const loaded = loadFromLocalStorage('plan_abc');
    expect(loaded).toBeDefined();
    expect(loaded.event.title).toContain('Diwali');

    const list = listLocalPlans();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some(p => p.id === 'plan_abc')).toBe(true);

    deleteFromLocalStorage('plan_abc');
    expect(loadFromLocalStorage('plan_abc')).toBeNull();
  });
});
