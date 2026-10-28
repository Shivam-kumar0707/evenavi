import { describe, it, expect } from 'vitest';
import { evaluateRisks } from '../src/lib/riskEngine.js';

describe('riskEngine.js Deterministic Rules', () => {
  it('triggers budget overrun and category overspend risks', () => {
    const plan = {
      event: { type: 'wedding', totalBudget: 100000, guestCount: 50, date: '2026-12-15' },
      budget: {
        allocations: [
          { id: 'venue', category: 'Venue', planned: 50000, spent: 65000 }, // over by > 10%
          { id: 'catering', category: 'Catering', planned: 50000, spent: 40000 },
        ],
      },
      timeline: [],
      vendors: [],
    };

    const risks = evaluateRisks(plan, '2026-08-01');
    const categoryRisk = risks.find(r => r.id === 'risk_category_overspend');
    expect(categoryRisk).toBeDefined();
    expect(categoryRisk.severity).toBe('high');
  });

  it('triggers monsoon risk for outdoor venues in July', () => {
    const plan = {
      event: {
        type: 'wedding',
        totalBudget: 1000000,
        guestCount: 200,
        date: '2026-07-20',
        venueType: 'outdoor',
        cityTier: 2,
      },
      budget: { allocations: [] },
      timeline: [],
      vendors: [
        { category: 'Venue', status: 'booked' },
        { category: 'Photo & Video', status: 'booked' },
        { category: 'Catering', status: 'booked' },
      ],
    };

    const risks = evaluateRisks(plan, '2026-05-01');
    const monsoonRisk = risks.find(r => r.id === 'risk_monsoon_outdoor');
    expect(monsoonRisk).toBeDefined();
    expect(monsoonRisk.severity).toBe('medium');
  });

  it('triggers peak season risk for unbooked December wedding', () => {
    const plan = {
      event: {
        type: 'wedding',
        totalBudget: 1500000,
        guestCount: 250,
        date: '2026-12-10',
        venueType: 'indoor',
        cityTier: 1,
      },
      budget: { allocations: [] },
      timeline: [],
      vendors: [
        { category: 'Venue', status: 'not_started' },
        { category: 'Photo & Video', status: 'not_started' },
      ],
    };

    const risks = evaluateRisks(plan, '2026-08-01');
    const peakRisk = risks.find(r => r.id === 'risk_peak_season');
    expect(peakRisk).toBeDefined();
    expect(peakRisk.severity).toBe('medium');
  });

  it('triggers tight budget band risk when per-guest is very low', () => {
    const plan = {
      event: {
        type: 'wedding',
        totalBudget: 100000,
        guestCount: 300, // ₹333 per guest for a wedding!
        date: '2026-11-15',
        venueType: 'indoor',
        cityTier: 2,
      },
      budget: { allocations: [] },
      timeline: [],
      vendors: [],
    };

    const risks = evaluateRisks(plan, '2026-08-01');
    const tightRisk = risks.find(r => r.id === 'risk_tight_budget');
    expect(tightRisk).toBeDefined();
    expect(tightRisk.severity).toBe('medium');
  });

  it('triggers vendor delay risk when fewer than 3 vendors started under 60 days', () => {
    const plan = {
      event: {
        type: 'birthday',
        totalBudget: 50000,
        guestCount: 40,
        date: '2026-09-10',
        cityTier: 2,
      },
      budget: { allocations: [] },
      timeline: [],
      vendors: [
        { category: 'Venue', status: 'not_started' },
        { category: 'Catering', status: 'not_started' },
        { category: 'Cake', status: 'shortlisted' },
      ],
    };

    const risks = evaluateRisks(plan, '2026-08-01'); // 40 days left, only 1 progressed
    const delayRisk = risks.find(r => r.id === 'risk_vendor_delay');
    expect(delayRisk).toBeDefined();
    expect(delayRisk.severity).toBe('medium');
  });
});
