/**
 * schemas.js (Server)
 * Zod validation schemas for /api/ai inputs and outputs.
 */

import { z } from 'zod';

export const ALLOWED_TASKS = [
  'parse_intake',
  'plan_core',
  'vendor_pack',
  'ideas',
  'explain_budget_change',
  'compare_quotes',
  'plan_b',
  'vendor_message',
];

// Input Schemas with size caps
export const TaskInputSchemas = {
  parse_intake: z.object({
    text: z.string().min(1).max(1500, 'Free text capped at 1500 characters'),
  }),
  plan_core: z.object({
    event: z.object({
      type: z.enum(['wedding', 'birthday', 'community']),
      title: z.string(),
      city: z.string(),
      guestCount: z.number(),
      totalBudget: z.number(),
      diet: z.string().optional(),
      culture: z.string().optional(),
      vibe: z.string().optional(),
    }),
    allocations: z.array(z.object({
      id: z.string(),
      category: z.string(),
      planned: z.number(),
      percent: z.number(),
    })),
  }),
  vendor_pack: z.object({
    event: z.object({
      type: z.enum(['wedding', 'birthday', 'community']),
      city: z.string().optional(),
      cityTier: z.number().optional(),
      diet: z.string().optional(),
    }),
    categories: z.array(z.string()).min(1),
  }),
  ideas: z.object({
    event: z.object({
      type: z.enum(['wedding', 'birthday', 'community']),
      title: z.string().optional(),
      city: z.string().optional(),
      diet: z.string().optional(),
      culture: z.string().optional(),
      vibe: z.string().optional(),
      ageGroup: z.string().optional(),
      guestCount: z.number().optional(),
      totalBudget: z.number().optional(),
    }),
  }),
  explain_budget_change: z.object({
    event: z.object({
      type: z.string(),
      totalBudget: z.number(),
    }),
    before: z.array(z.object({ id: z.string(), category: z.string(), planned: z.number() })),
    after: z.array(z.object({ id: z.string(), category: z.string(), planned: z.number() })),
    locks: z.array(z.string()).optional().default([]),
  }),
  compare_quotes: z.object({
    category: z.string(),
    event: z.object({
      type: z.string(),
      totalBudget: z.number(),
      guestCount: z.number(),
    }),
    quotes: z.array(z.string().max(1200, 'Quote capped at 1200 characters')).min(1).max(3, 'At most 3 quotes allowed'),
  }),
  plan_b: z.object({
    event: z.object({
      type: z.string(),
      totalBudget: z.number().optional(),
    }),
    risks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
    })).min(1),
  }),
  vendor_message: z.object({
    category: z.string(),
    vendorName: z.string().max(80).optional().default(''),
    intent: z.enum(['enquiry', 'negotiate', 'confirm', 'followup']),
    language: z.enum(['en', 'hi', 'hinglish']),
    event: z.object({
      type: z.string(),
      date: z.string().optional(),
      guestCount: z.number().optional(),
      city: z.string().optional(),
      totalBudget: z.number().optional(),
    }),
  }),
};

// Output Schemas
export const TaskOutputSchemas = {
  parse_intake: z.object({
    event: z.object({
      type: z.enum(['wedding', 'birthday', 'community']).optional(),
      title: z.string().optional(),
      date: z.string().optional(),
      city: z.string().optional(),
      guestCount: z.number().optional(),
      totalBudget: z.number().optional(),
      culture: z.string().optional(),
      diet: z.enum(['veg', 'jain', 'nonveg', 'mixed']).optional(),
      vibe: z.string().optional(),
      venueType: z.enum(['indoor', 'outdoor', 'both']).optional(),
      functions: z.array(z.string()).optional(),
    }),
    missing: z.array(z.string()).default([]),
  }),
  plan_core: z.object({
    summary: z.string(),
    perGuestInsight: z.string(),
    budgetNotes: z.array(z.object({
      category: z.string(),
      note: z.string(),
    })),
    extraTasks: z.array(z.object({
      title: z.string(),
      phase: z.string().optional(),
      category: z.string().optional(),
      offsetDays: z.number(),
      priority: z.enum(['must', 'should', 'nice']),
    })).optional().default([]),
  }),
  vendor_pack: z.object({
    vendors: z.array(z.object({
      category: z.string(),
      tasks: z.array(z.string()),
      questions: z.array(z.string()),
      redFlags: z.array(z.string()),
    })),
  }),
  ideas: z.object({
    themes: z.array(z.object({
      name: z.string(),
      tagline: z.string(),
      palette: z.array(z.string()).length(4),
      decor: z.array(z.string()),
      menuHighlights: z.array(z.string()),
      activity: z.string(),
    })).length(3),
    menu: z.object({
      starters: z.array(z.string()),
      mains: z.array(z.string()),
      desserts: z.array(z.string()),
      drinks: z.array(z.string()),
    }),
    activities: z.array(z.string()),
    returnGifts: z.array(z.string()),
    invitation: z.object({
      en: z.string(),
      hi: z.string(),
      hinglish: z.string(),
    }),
  }),
  explain_budget_change: z.object({
    bullets: z.array(z.string()),
    warnings: z.array(z.string()).default([]),
  }),
  compare_quotes: z.object({
    normalized: z.array(z.object({
      vendor: z.string(),
      total: z.union([z.number(), z.string()]),
      inclusions: z.array(z.string()),
      exclusions: z.array(z.string()),
      hiddenCostFlags: z.array(z.string()),
    })),
    bestValue: z.string(),
    recommendation: z.string(),
    negotiationTips: z.array(z.string()),
    confidence: z.enum(['low', 'medium', 'high']),
  }),
  plan_b: z.object({
    mitigations: z.array(z.object({
      riskId: z.string(),
      steps: z.array(z.string()),
    })),
  }),
  vendor_message: z.object({
    message: z.string(),
  }),
};
