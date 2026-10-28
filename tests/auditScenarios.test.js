import { describe, it, expect } from 'vitest';
import { allocate, rebalance, getTemplate } from '../src/lib/budgetEngine.js';
import { generateTimeline } from '../src/lib/timelineEngine.js';
import { evaluateRisks } from '../src/lib/riskEngine.js';
import { getDeterministicFallback } from '../src/lib/aiClient.js';
import { getVendorTemplates } from '../src/data/vendorTemplates.js';
import { parseMoney, formatINR, formatCompactINR } from '../src/lib/money.js';

describe('Audit: End-to-End Core Logic & Failure Scenarios', () => {
  it('verifies deterministic budget allocation for all 3 event types', () => {
    const testCases = [
      { type: 'wedding', budget: 1200000, guests: 250 },
      { type: 'birthday', budget: 40000, guests: 40 },
      { type: 'community', budget: 150000, guests: 400 },
      { type: 'wedding', budget: 854321, guests: 180 }, // odd rupee test
    ];

    testCases.forEach(({ type, budget, guests }) => {
      const template = getTemplate(type);
      const allocations = allocate(budget, template);

      const sum = allocations.reduce((s, a) => s + a.planned, 0);
      expect(sum).toBe(budget);

      // Verify each item has positive allocation
      allocations.forEach((a) => {
        expect(a.planned).toBeGreaterThan(0);
        expect(a.percent).toBeGreaterThan(0);
      });
    });
  });

  it('guarantees exact reconciliation on rebalance with multiple locks and odd residuals', () => {
    const total = 500123;
    const template = getTemplate('wedding');
    let allocations = allocate(total, template);

    // Lock venue to ₹1,50,000
    const rebalance1 = rebalance({
      allocations,
      total,
      edited: { id: 'venue', amount: 150000 },
      eventType: 'wedding',
    });

    expect(rebalance1.error).toBeUndefined();
    const sum1 = rebalance1.allocations.reduce((s, a) => s + a.planned, 0);
    expect(sum1).toBe(total);

    const venueItem = rebalance1.allocations.find((a) => a.id === 'venue');
    expect(venueItem.locked).toBe(true);
    expect(venueItem.planned).toBe(150000);

    // Lock decor to ₹80,000 as well
    const rebalance2 = rebalance({
      allocations: rebalance1.allocations,
      total,
      edited: { id: 'decor', amount: 80000 },
      eventType: 'wedding',
    });

    expect(rebalance2.error).toBeUndefined();
    const sum2 = rebalance2.allocations.reduce((s, a) => s + a.planned, 0);
    expect(sum2).toBe(total);

    const decorItem = rebalance2.allocations.find((a) => a.id === 'decor');
    expect(decorItem.locked).toBe(true);
    expect(decorItem.planned).toBe(80000);
  });

  it('returns OVER_BUDGET error when locked allocations exceed total budget', () => {
    const total = 100000;
    const template = getTemplate('birthday');
    const allocations = allocate(total, template);

    const result = rebalance({
      allocations,
      total,
      edited: { id: 'venue', amount: 150000 }, // exceeds total by 50,000
      eventType: 'birthday',
    });

    expect(result.error).toBe('OVER_BUDGET');
    expect(result.overBy).toBe(50000);
  });

  it('compresses timeline gracefully and flags tight timeline warning for near-term events', () => {
    // Event is in 7 days
    const nearDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { timeline, timelineMeta } = generateTimeline({
      eventType: 'birthday',
      eventDate: nearDate,
    });

    expect(timelineMeta.compressed).toBe(true);
    expect(timelineMeta.warning).toBeTruthy();
    expect(timeline.length).toBeGreaterThan(0);

    // Verify all tasks are scheduled on or before event date
    timeline.forEach((task) => {
      if (task.phase !== 'after') {
        expect(task.dueDate <= nearDate).toBe(true);
      }
    });
  });

  it('evaluates risks deterministically across critical triggers', () => {
    const mockPlan = {
      event: {
        type: 'wedding',
        date: '2026-12-15', // peak season
        cityTier: 1,
        totalBudget: 100000,
        guestCount: 500, // per guest ₹200 -> tight band
        venueType: 'outdoor',
      },
      budget: {
        allocations: [
          { id: 'venue', category: 'Venue', planned: 20000, spent: 30000 }, // overspend
        ],
      },
      timeline: [],
      timelineMeta: { compressed: true },
      vendors: [
        { id: 'catering', category: 'Catering', status: 'not_started' },
      ],
    };

    const risks = evaluateRisks(mockPlan);
    expect(risks.length).toBeGreaterThanOrEqual(3);

    const riskTitles = risks.map((r) => r.title.toLowerCase());
    expect(riskTitles.some((t) => t.includes('budget') || t.includes('overspend'))).toBe(true);
    expect(riskTitles.some((t) => t.includes('timeline') || t.includes('compressed'))).toBe(true);
  });

  it('verifies deterministic fallbacks for all 8 AI tasks', () => {
    const mockEvent = {
      type: 'wedding',
      title: 'Priya Wedding',
      date: '2026-11-20',
      city: 'Lucknow',
      guestCount: 250,
      totalBudget: 1200000,
      diet: 'veg',
    };

    // 1. parse_intake
    const intake = getDeterministicFallback('parse_intake', { text: 'wedding in lucknow for 250 guests with 12L budget' });
    expect(intake.event.type).toBe('wedding');
    expect(intake.event.totalBudget).toBe(1200000);

    // 2. plan_core
    const core = getDeterministicFallback('plan_core', { event: mockEvent, allocations: [] });
    expect(core.summary).toBeTruthy();
    expect(core.perGuestInsight).toBeTruthy();

    // 3. vendor_pack
    const vendors = getDeterministicFallback('vendor_pack', { event: mockEvent, categories: ['Catering', 'Venue'] });
    expect(vendors.vendors.length).toBeGreaterThanOrEqual(2);

    // 4. ideas
    const ideas = getDeterministicFallback('ideas', { event: mockEvent });
    expect(ideas.themes.length).toBe(3);
    expect(ideas.invitation.en).toBeTruthy();
    expect(ideas.invitation.hi).toBeTruthy();
    expect(ideas.invitation.hinglish).toBeTruthy();

    // 5. explain_budget_change
    const explain = getDeterministicFallback('explain_budget_change', { before: [], after: [], event: mockEvent });
    expect(explain.bullets.length).toBeGreaterThan(0);

    // 6. compare_quotes
    const quotes = getDeterministicFallback('compare_quotes', {
      category: 'Catering',
      quotes: ['Quote 1: 5L all inclusive', 'Quote 2: 4.5L plus taxes'],
    });
    expect(quotes.normalized.length).toBe(2);
    expect(quotes.bestValue).toBeTruthy();

    // 7. plan_b
    const planB = getDeterministicFallback('plan_b', {
      event: mockEvent,
      risks: [{ id: 'risk_1', title: 'Monsoon Rain', detail: 'Outdoor lawn' }],
    });
    expect(planB.mitigations.length).toBe(1);

    // 8. vendor_message
    const msg = getDeterministicFallback('vendor_message', {
      category: 'Catering',
      vendorName: 'Royal Awadh',
      intent: 'enquiry',
      language: 'hinglish',
      event: mockEvent,
    });
    expect(msg.message).toBeTruthy();
  });

  it('validates money string parser across natural language variations', () => {
    expect(parseMoney('12L')).toBe(1200000);
    expect(parseMoney('12 lakh')).toBe(1200000);
    expect(parseMoney('1.5 cr')).toBe(15000000);
    expect(parseMoney('45k')).toBe(45000);
    expect(parseMoney('₹8,50,000')).toBe(850000);
    expect(parseMoney('invalid')).toBe(0);
  });
});
