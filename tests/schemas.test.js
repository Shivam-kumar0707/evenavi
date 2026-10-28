import { describe, it, expect } from 'vitest';
import { PlanSchema } from '../src/lib/schemas.js';
import { DEMO_PLANS } from '../src/data/demoPlans.js';

describe('schemas.js & Demo Fixture Validation', () => {
  it('validates the wedding demo plan against PlanSchema without errors', () => {
    const weddingPlan = DEMO_PLANS.wedding;
    const parsed = PlanSchema.parse(weddingPlan);
    expect(parsed.event.type).toBe('wedding');
    expect(parsed.budget.allocations.length).toBeGreaterThan(5);
    expect(parsed.timeline.length).toBeGreaterThan(5);
    expect(parsed.ideas.themes.length).toBe(3);
    expect(parsed.ideas.themes[0].palette.length).toBe(4);
  });

  it('validates the birthday demo plan against PlanSchema without errors', () => {
    const birthdayPlan = DEMO_PLANS.birthday;
    const parsed = PlanSchema.parse(birthdayPlan);
    expect(parsed.event.type).toBe('birthday');
    expect(parsed.event.guestCount).toBe(40);
    expect(parsed.ideas.themes.length).toBe(3);
  });

  it('validates the community demo plan against PlanSchema without errors', () => {
    const communityPlan = DEMO_PLANS.community;
    const parsed = PlanSchema.parse(communityPlan);
    expect(parsed.event.type).toBe('community');
    expect(parsed.event.totalBudget).toBe(150000);
    expect(parsed.ideas.themes.length).toBe(3);
  });

  it('rejects invalid plan schemas with clear Zod error details', () => {
    const invalidPlan = {
      event: {
        type: 'invalid_type', // not wedding/birthday/community
        title: '',
      },
    };

    expect(() => PlanSchema.parse(invalidPlan)).toThrow();
  });
});
