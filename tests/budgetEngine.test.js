import { describe, it, expect } from 'vitest';
import {
  allocate,
  rebalance,
  getTemplate,
  perGuest,
  affordabilityBand,
  applyFunctionSplit,
  trackSpend,
} from '../src/lib/budgetEngine.js';

describe('budgetEngine.js Deterministic Financial Calculations', () => {
  it('allocates baseline template and sums to exact total', () => {
    const total = 850000;
    const template = getTemplate('wedding');
    const allocated = allocate(total, template);
    const sum = allocated.reduce((acc, curr) => acc + curr.planned, 0);
    expect(sum).toBe(total);
  });

  it('guarantees allocations sum exactly across 200 random totals and guest counts', () => {
    const eventTypes = ['wedding', 'birthday', 'community'];

    for (let i = 0; i < 200; i++) {
      const type = eventTypes[i % eventTypes.length];
      const template = getTemplate(type);
      // Random total between ₹10,000 and ₹5,00,00,000
      const randomTotal = Math.floor(Math.random() * 49990000) + 10000;
      const randomGuests = Math.floor(Math.random() * 1500) + 10;

      const allocated = allocate(randomTotal, template);
      const sum = allocated.reduce((acc, curr) => acc + curr.planned, 0);

      expect(sum).toBe(randomTotal);

      // Verify per-guest calculation is consistent
      const pg = perGuest(randomTotal, randomGuests);
      expect(pg).toBe(Math.round(randomTotal / randomGuests));

      // Verify affordability band returns valid string
      const band = affordabilityBand(type, 1, pg);
      expect(['Tight', 'Comfortable', 'Generous']).toContain(band);
    }
  });

  it('preserves locked category amount and redistributes remaining without drift', () => {
    const total = 1000000;
    const template = getTemplate('wedding');
    const initial = allocate(total, template);

    // Edit and lock catering to 4,00,000 (initially 28% = 2,80,000)
    const result = rebalance({
      allocations: initial,
      total,
      edited: { id: 'catering', amount: 400000 },
      eventType: 'wedding',
    });

    expect(result.error).toBeUndefined();
    const updated = result.allocations;
    const cateringItem = updated.find(a => a.id === 'catering');
    expect(cateringItem.planned).toBe(400000);
    expect(cateringItem.locked).toBe(true);

    const sum = updated.reduce((acc, curr) => acc + curr.planned, 0);
    expect(sum).toBe(total);
  });

  it('detects OVER_BUDGET when locked amounts exceed total', () => {
    const total = 500000;
    const template = getTemplate('birthday');
    const initial = allocate(total, template);

    // Lock catering to 600,000 on a 500,000 budget
    const result = rebalance({
      allocations: initial,
      total,
      edited: { id: 'catering', amount: 600000 },
      eventType: 'birthday',
    });

    expect(result.error).toBe('OVER_BUDGET');
    expect(result.overBy).toBe(100000);
  });

  it('ensures contingency does not drop below 3% when unlocked', () => {
    const total = 1000000;
    const template = getTemplate('wedding');
    const initial = allocate(total, template);

    // Heavily increase venue to squeeze unlocked categories
    const result = rebalance({
      allocations: initial,
      total,
      edited: { id: 'venue', amount: 800000 },
      eventType: 'wedding',
    });

    expect(result.error).toBeUndefined();
    const contingencyItem = result.allocations.find(a => a.id === 'contingency');
    // 3% of 10,00,000 is 30,000
    expect(contingencyItem.planned).toBeGreaterThanOrEqual(30000);

    const sum = result.allocations.reduce((acc, curr) => acc + curr.planned, 0);
    expect(sum).toBe(total);
  });

  it('splits multi-function wedding budget accurately', () => {
    const total = 1200000;
    const functions = [
      { id: 'mehendi', name: 'Mehendi' },
      { id: 'sangeet', name: 'Sangeet' },
      { id: 'wedding', name: 'Wedding (Main)' },
      { id: 'reception', name: 'Reception' },
    ];

    const split = applyFunctionSplit(total, functions);
    const sum = split.reduce((acc, curr) => acc + curr.planned, 0);
    expect(sum).toBe(total);
    expect(split.length).toBe(4);
  });

  it('tracks spend and identifies overspend flags', () => {
    const total = 100000;
    const allocations = [
      { id: 'venue', category: 'Venue', planned: 50000, spent: 58000 }, // > 10% over
      { id: 'catering', category: 'Catering', planned: 50000, spent: 40000 },
    ];

    const tracking = trackSpend(allocations, total);
    expect(tracking.totalPlanned).toBe(100000);
    expect(tracking.totalSpent).toBe(98000);
    expect(tracking.remaining).toBe(2000);
    expect(tracking.isOverBudget).toBe(false);
    expect(tracking.hasCategoryOverspend).toBe(true);
    expect(tracking.categories.find(c => c.id === 'venue').isHighOverspend).toBe(true);
  });
});
