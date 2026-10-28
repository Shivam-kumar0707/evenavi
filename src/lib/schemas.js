/**
 * schemas.js
 * Zod validation schemas for Evenavi client and server models.
 * Strictly adheres to TRD Section 2.6 Data Model.
 */

import { z } from 'zod';

export const EventFunctionSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string().optional().default(''),
  guests: z.number().int().nonnegative().optional().default(0),
  sharePercent: z.number().nonnegative().optional().default(0),
});

export const EventDetailsSchema = z.object({
  type: z.enum(['wedding', 'birthday', 'community']),
  title: z.string().min(1, 'Title is required').max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  city: z.string().min(1, 'City is required').max(80),
  cityTier: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  guestCount: z.number().int().positive().max(20000),
  totalBudget: z.number().positive(),
  currency: z.literal('INR').default('INR'),
  culture: z.string().max(80).optional().default(''),
  diet: z.enum(['veg', 'jain', 'nonveg', 'mixed']).default('veg'),
  vibe: z.string().max(80).optional().default(''),
  ageGroup: z.string().max(80).optional().default(''),
  mustHaves: z.array(z.string().max(160)).optional().default([]),
  avoid: z.array(z.string().max(160)).optional().default([]),
  venueType: z.enum(['indoor', 'outdoor', 'both']).default('indoor'),
  functions: z.array(EventFunctionSchema).optional().default([]),
});

export const AllocationSchema = z.object({
  id: z.string(),
  category: z.string(),
  percent: z.number().nonnegative(),
  planned: z.number().nonnegative(),
  spent: z.number().nonnegative().default(0),
  locked: z.boolean().default(false),
  note: z.string().optional().default(''),
  source: z.enum(['template', 'ai']).default('template'),
});

export const BudgetSchema = z.object({
  allocations: z.array(AllocationSchema),
  summary: z.string().optional().default(''),
  source: z.enum(['template', 'ai']).default('template'),
});

export const TimelineTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  phase: z.string(),
  category: z.string(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: z.enum(['must', 'should', 'nice']).default('should'),
  done: z.boolean().default(false),
  note: z.string().optional().default(''),
  source: z.enum(['template', 'ai']).default('template'),
});

export const TimelineMetaSchema = z.object({
  compressed: z.boolean().default(false),
  warning: z.string().optional().default(''),
});

export const VendorChecklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean().default(false),
});

export const VendorCardSchema = z.object({
  id: z.string(),
  category: z.string(),
  status: z.enum(['not_started', 'shortlisted', 'quoted', 'booked', 'paid']).default('not_started'),
  tasks: z.array(VendorChecklistItemSchema).default([]),
  questions: z.array(z.string()).default([]),
  redFlags: z.array(z.string()).default([]),
  notes: z.string().optional().default(''),
  source: z.enum(['template', 'ai']).default('template'),
});

export const ThemeConceptSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  palette: z.array(z.string()).length(4), // 4 hex colors
  decor: z.array(z.string()),
  menuHighlights: z.array(z.string()),
  activity: z.string(),
});

export const MenuSchema = z.object({
  starters: z.array(z.string()).default([]),
  mains: z.array(z.string()).default([]),
  desserts: z.array(z.string()).default([]),
  drinks: z.array(z.string()).default([]),
});

export const InvitationSchema = z.object({
  en: z.string().default(''),
  hi: z.string().default(''),
  hinglish: z.string().default(''),
});

export const IdeasSchema = z.object({
  themes: z.array(ThemeConceptSchema).default([]),
  menu: MenuSchema.default({ starters: [], mains: [], desserts: [], drinks: [] }),
  activities: z.array(z.string()).default([]),
  returnGifts: z.array(z.string()).default([]),
  invitation: InvitationSchema.default({ en: '', hi: '', hinglish: '' }),
  source: z.enum(['template', 'ai']).default('template'),
});

export const RiskItemSchema = z.object({
  id: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  detail: z.string(),
  mitigation: z.string(),
  source: z.enum(['engine', 'ai']).default('engine'),
});

export const QuoteItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  input: z.array(z.string()),
  result: z.object({
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
  }).optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export const PlanSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  event: EventDetailsSchema,
  budget: BudgetSchema,
  timeline: z.array(TimelineTaskSchema),
  timelineMeta: TimelineMetaSchema.default({ compressed: false, warning: '' }),
  vendors: z.array(VendorCardSchema),
  ideas: IdeasSchema,
  risks: z.array(RiskItemSchema).default([]),
  quotes: z.array(QuoteItemSchema).default([]),
});
