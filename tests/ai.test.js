import { describe, it, expect } from 'vitest';
import { getDeterministicFallback } from '../src/lib/aiClient.js';
import { TaskInputSchemas, TaskOutputSchemas } from '../api/_lib/schemas.js';

describe('aiClient.js & Server Schemas', () => {
  it('parses intake deterministically via fallback when AI is unavailable', () => {
    const text = "Planning sister's wedding in Lucknow with 200 guests, 8 lakh budget, pure veg food.";
    const result = getDeterministicFallback('parse_intake', { text });

    expect(result.event.type).toBe('wedding');
    expect(result.event.guestCount).toBe(200);
    expect(result.event.totalBudget).toBe(800000);
    expect(result.event.city).toBe('Lucknow');
    expect(result.event.diet).toBe('veg');
  });

  it('generates multi-lingual vendor messages in English, Hindi, and Hinglish', () => {
    const event = { type: 'wedding', date: '2026-12-18', city: 'Lucknow', guestCount: 250 };

    const enMsg = getDeterministicFallback('vendor_message', {
      category: 'Catering',
      vendorName: 'Royal Caterers',
      intent: 'enquiry',
      language: 'en',
      event,
    });
    expect(enMsg.message).toContain('Royal Caterers');
    expect(enMsg.message).toContain('Lucknow');

    const hiMsg = getDeterministicFallback('vendor_message', {
      category: 'Venue',
      vendorName: 'शादी लॉन',
      intent: 'enquiry',
      language: 'hi',
      event,
    });
    expect(hiMsg.message).toContain('नमस्ते');
    expect(hiMsg.message).toContain('कोटेशन');

    const hinglishMsg = getDeterministicFallback('vendor_message', {
      category: 'Photo & Video',
      vendorName: 'Studio Kabir',
      intent: 'negotiate',
      language: 'hinglish',
      event,
    });
    expect(hinglishMsg.message).toContain('tight');
    expect(hinglishMsg.message).toContain('quote');
  });

  it('explains budget changes deterministically with category diff bullets', () => {
    const before = [{ id: 'venue', category: 'Venue', planned: 200000 }, { id: 'contingency', category: 'Contingency', planned: 50000 }];
    const after = [{ id: 'venue', category: 'Venue', planned: 250000 }, { id: 'contingency', category: 'Contingency', planned: 20000 }];
    const event = { type: 'wedding', totalBudget: 1000000 };

    const explanation = getDeterministicFallback('explain_budget_change', { before, after, event });
    expect(explanation.bullets.length).toBeGreaterThan(0);
    expect(explanation.bullets.some(b => b.includes('Venue planned budget increased by ₹50,000'))).toBe(true);
    expect(explanation.warnings.length).toBeGreaterThan(0);
  });

  it('validates server input schemas for size limits and types', () => {
    // Free text under 1500 chars passes
    const validIntake = { text: 'Planning a birthday party for 50 people' };
    expect(TaskInputSchemas.parse_intake.safeParse(validIntake).success).toBe(true);

    // Free text exceeding 1500 chars fails
    const invalidIntake = { text: 'a'.repeat(1501) };
    expect(TaskInputSchemas.parse_intake.safeParse(invalidIntake).success).toBe(false);

    // More than 3 quotes fails
    const invalidQuotes = {
      category: 'Catering',
      event: { type: 'wedding', totalBudget: 500000, guestCount: 100 },
      quotes: ['Quote 1', 'Quote 2', 'Quote 3', 'Quote 4'],
    };
    expect(TaskInputSchemas.compare_quotes.safeParse(invalidQuotes).success).toBe(false);
  });
});
