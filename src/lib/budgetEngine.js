/**
 * budgetEngine.js
 * Pure JavaScript, deterministic money calculations for Evenavi.
 * Guarantees that allocations always sum to the total budget with zero rounding drift.
 */

import { getAffordabilityBand } from '../data/bands.js';

export const BASELINE_PERCENTAGES = {
  wedding: [
    { id: 'venue', category: 'Venue', percent: 18 },
    { id: 'catering', category: 'Catering', percent: 28 },
    { id: 'decor', category: 'Decor & Lighting', percent: 12 },
    { id: 'photo', category: 'Photo & Video', percent: 8 },
    { id: 'attire', category: 'Attire & Jewellery', percent: 10 },
    { id: 'makeup', category: 'Makeup & Mehendi', percent: 4 },
    { id: 'entertainment', category: 'Music & Entertainment', percent: 5 },
    { id: 'invites', category: 'Invitations & Stationery', percent: 2 },
    { id: 'transport', category: 'Stay & Transport', percent: 5 },
    { id: 'rituals', category: 'Rituals & Misc', percent: 2 },
    { id: 'contingency', category: 'Contingency', percent: 6 },
  ],
  birthday: [
    { id: 'venue', category: 'Venue', percent: 20 },
    { id: 'catering', category: 'Catering', percent: 35 },
    { id: 'decor', category: 'Decor & Balloons', percent: 15 },
    { id: 'cake', category: 'Cake', percent: 7 },
    { id: 'entertainment', category: 'Entertainment', percent: 10 },
    { id: 'photo', category: 'Photography', percent: 4 },
    { id: 'gifts', category: 'Return Gifts', percent: 4 },
    { id: 'invites', category: 'Invitations', percent: 1 },
    { id: 'contingency', category: 'Contingency', percent: 4 },
  ],
  community: [
    { id: 'venue', category: 'Venue & Permissions', percent: 10 },
    { id: 'food', category: 'Food & Catering', percent: 30 },
    { id: 'stage', category: 'Stage Sound & Lights', percent: 18 },
    { id: 'decor', category: 'Decor & Banners', percent: 8 },
    { id: 'performers', category: 'Performers & Activities', percent: 12 },
    { id: 'printing', category: 'Printing & Promotion', percent: 6 },
    { id: 'volunteers', category: 'Volunteers & Logistics', percent: 6 },
    { id: 'security', category: 'Security & Safety', percent: 4 },
    { id: 'prizes', category: 'Prizes & Gifts', percent: 2 },
    { id: 'contingency', category: 'Contingency', percent: 4 },
  ],
};

export const WEDDING_FUNCTION_WEIGHTS = {
  engagement: { name: 'Engagement', weight: 8 },
  haldi: { name: 'Haldi', weight: 6 },
  mehendi: { name: 'Mehendi', weight: 8 },
  sangeet: { name: 'Sangeet', weight: 18 },
  wedding: { name: 'Wedding (Main)', weight: 38 },
  reception: { name: 'Reception', weight: 22 },
};

/**
 * Get baseline template for an event type
 * @param {'wedding'|'birthday'|'community'} eventType
 */
export function getTemplate(eventType = 'wedding') {
  const items = BASELINE_PERCENTAGES[eventType] || BASELINE_PERCENTAGES.wedding;
  return items.map(item => ({ ...item }));
}

/**
 * Largest-remainder allocation rounding to nearest ₹100 (or ₹10 if total < ₹50,000).
 * Guarantees that the sum of allocated amounts equals the total exactly.
 * @param {number} total Total budget in INR
 * @param {Array<{id: string, category: string, percent: number}>} items
 * @returns {Array<object>}
 */
export function allocate(total, items) {
  if (!items || items.length === 0) return [];
  const safeTotal = Math.max(0, Math.round(total || 0));
  if (safeTotal === 0) {
    return items.map(item => ({
      ...item,
      planned: 0,
      spent: 0,
      locked: false,
      note: '',
      source: 'template',
    }));
  }

  const unit = safeTotal < 50000 ? 10 : 100;
  const totalUnits = Math.floor(safeTotal / unit);
  const oddResidual = safeTotal % unit;

  // Normalize percentages if they don't sum to 100
  const rawSum = items.reduce((sum, it) => sum + (it.percent || 0), 0);
  const factor = rawSum > 0 ? 100 / rawSum : 1;

  const calculated = items.map((item, idx) => {
    const normalizedPercent = (item.percent || 0) * factor;
    const exactUnits = totalUnits * (normalizedPercent / 100);
    const floorUnits = Math.floor(exactUnits);
    const remainder = exactUnits - floorUnits;
    return {
      index: idx,
      item,
      normalizedPercent,
      units: floorUnits,
      remainder,
      planned: floorUnits * unit,
    };
  });

  const assignedUnits = calculated.reduce((sum, c) => sum + c.units, 0);
  let missingUnits = totalUnits - assignedUnits;

  // Distribute remaining units to items with the largest fractional remainder
  const sortedByRemainder = [...calculated].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < missingUnits && i < sortedByRemainder.length; i++) {
    sortedByRemainder[i].units += 1;
    sortedByRemainder[i].planned = sortedByRemainder[i].units * unit;
  }

  // Absorb any odd residual into top remainder category
  if (oddResidual > 0 && sortedByRemainder.length > 0) {
    sortedByRemainder[0].planned += oddResidual;
  }

  return calculated.map(c => ({
    id: c.item.id,
    category: c.item.category,
    percent: Math.round((c.planned / safeTotal) * 1000) / 10,
    planned: c.planned,
    spent: c.item.spent || 0,
    locked: Boolean(c.item.locked),
    note: c.item.note || '',
    source: c.item.source || 'template',
  }));
}

/**
 * Rebalance allocations when an individual category is edited or locked.
 * - Locked/edited categories keep their amount.
 * - Remainder spreads proportionally across unlocked categories.
 * - Contingency never drops below 3% unless manually locked.
 * - Returns { error: 'OVER_BUDGET', overBy } if locked amounts exceed total.
 * @param {object} params
 * @param {Array<object>} params.allocations
 * @param {number} params.total
 * @param {{id: string, amount: number}} [params.edited]
 * @param {string} [params.eventType]
 * @returns {{allocations: Array<object>}|{error: string, overBy: number}}
 */
export function rebalance({ allocations, total, edited = null, eventType = 'wedding' }) {
  const safeTotal = Math.max(0, Math.round(total || 0));
  const current = allocations.map(a => ({ ...a }));

  if (edited) {
    const target = current.find(a => a.id === edited.id);
    if (target) {
      target.planned = Math.max(0, Math.round(edited.amount));
      target.locked = true;
    }
  }

  const lockedItems = current.filter(a => a.locked);
  const unlockedItems = current.filter(a => !a.locked);

  const lockedSum = lockedItems.reduce((sum, a) => sum + a.planned, 0);

  if (lockedSum > safeTotal) {
    return {
      error: 'OVER_BUDGET',
      overBy: lockedSum - safeTotal,
    };
  }

  if (unlockedItems.length === 0) {
    if (lockedSum !== safeTotal) {
      return {
        error: 'OVER_BUDGET',
        overBy: Math.abs(lockedSum - safeTotal),
      };
    }
    return {
      allocations: current.map(a => ({
        ...a,
        percent: safeTotal > 0 ? Math.round((a.planned / safeTotal) * 1000) / 10 : 0,
      })),
    };
  }

  const remainingBudget = safeTotal - lockedSum;
  const unit = safeTotal < 50000 ? 10 : 100;
  const remainingUnits = Math.floor(remainingBudget / unit);
  const oddResidual = remainingBudget % unit;

  const templateList = getTemplate(eventType);
  const templateMap = Object.fromEntries(templateList.map(t => [t.id, t.percent]));

  const contingencyItem = unlockedItems.find(a => a.id === 'contingency');
  let contingencyMinUnits = 0;
  if (contingencyItem && safeTotal > 0) {
    contingencyMinUnits = Math.round((safeTotal * 0.03) / unit);
  }

  const baseWeights = unlockedItems.map(item => {
    let weight = templateMap[item.id] || 5;
    return { item, weight };
  });

  const totalBaseWeight = baseWeights.reduce((sum, w) => sum + w.weight, 0);

  const allocatedUnlocked = baseWeights.map(({ item, weight }) => {
    const ratio = totalBaseWeight > 0 ? weight / totalBaseWeight : 1 / unlockedItems.length;
    let exactUnits = remainingUnits * ratio;
    let floorUnits = Math.floor(exactUnits);
    let remainder = exactUnits - floorUnits;
    return {
      item,
      units: floorUnits,
      remainder,
      planned: floorUnits * unit,
    };
  });

  let assignedUnits = allocatedUnlocked.reduce((sum, a) => sum + a.units, 0);
  let missingUnits = remainingUnits - assignedUnits;

  const sorted = [...allocatedUnlocked].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < missingUnits && i < sorted.length; i++) {
    sorted[i].units += 1;
    sorted[i].planned = sorted[i].units * unit;
  }

  if (oddResidual > 0 && sorted.length > 0) {
    sorted[0].planned += oddResidual;
  }

  const contingencyResult = allocatedUnlocked.find(a => a.item.id === 'contingency');
  if (contingencyResult && contingencyResult.units < contingencyMinUnits && remainingUnits >= contingencyMinUnits) {
    const diff = contingencyMinUnits - contingencyResult.units;
    const others = allocatedUnlocked.filter(a => a.item.id !== 'contingency').sort((a, b) => b.units - a.units);
    if (others.length > 0 && others[0].units > diff) {
      others[0].units -= diff;
      others[0].planned = others[0].units * unit;
      contingencyResult.units += diff;
      contingencyResult.planned = contingencyResult.units * unit;
    }
  }

  // Final exact residual reconciliation
  const sumUnlocked = allocatedUnlocked.reduce((sum, a) => sum + a.planned, 0);
  const diffFromTarget = remainingBudget - sumUnlocked;
  if (diffFromTarget !== 0 && allocatedUnlocked.length > 0) {
    allocatedUnlocked[0].planned += diffFromTarget;
  }

  const unlockedMap = Object.fromEntries(
    allocatedUnlocked.map(a => [a.item.id, a.planned])
  );

  const updatedAllocations = current.map(item => {
    const planned = item.locked ? item.planned : (unlockedMap[item.id] != null ? unlockedMap[item.id] : 0);
    const percent = safeTotal > 0 ? Math.round((planned / safeTotal) * 1000) / 10 : 0;
    return {
      ...item,
      planned,
      percent,
    };
  });

  return { allocations: updatedAllocations };
}

/**
 * Per-guest cost calculation
 * @param {number} total
 * @param {number} guests
 * @returns {number}
 */
export function perGuest(total = 0, guests = 1) {
  const g = Math.max(1, Math.round(guests || 1));
  return Math.round((total || 0) / g);
}

/**
 * Affordability band wrapper
 * @param {'wedding'|'birthday'|'community'} eventType
 * @param {1|2|3} cityTier
 * @param {number} perGuestAmount
 * @returns {'Tight'|'Comfortable'|'Generous'}
 */
export function affordabilityBand(eventType = 'wedding', cityTier = 2, perGuestAmount = 0) {
  return getAffordabilityBand(eventType, cityTier, perGuestAmount);
}

/**
 * Multi-function wedding split calculation
 * Normalizes weights across the selected functions and distributes total budget.
 * @param {number} totalBudget
 * @param {Array<{id: string, name?: string, guests?: number, sharePercent?: number}>} functions
 * @returns {Array<object>}
 */
export function applyFunctionSplit(totalBudget, functions = []) {
  if (!functions || functions.length === 0) return [];
  const safeTotal = Math.max(0, Math.round(totalBudget || 0));

  const weightedFunctions = functions.map(f => {
    const defaultMeta = WEDDING_FUNCTION_WEIGHTS[f.id] || { name: f.name || f.id, weight: 15 };
    const weight = f.sharePercent != null ? f.sharePercent : defaultMeta.weight;
    return {
      ...f,
      name: f.name || defaultMeta.name,
      weight,
    };
  });

  const totalWeight = weightedFunctions.reduce((sum, f) => sum + f.weight, 0);
  const unit = safeTotal < 50000 ? 10 : 100;
  const totalUnits = Math.floor(safeTotal / unit);
  const oddResidual = safeTotal % unit;

  const calculated = weightedFunctions.map(f => {
    const ratio = totalWeight > 0 ? f.weight / totalWeight : 1 / functions.length;
    const exactUnits = totalUnits * ratio;
    const floorUnits = Math.floor(exactUnits);
    return {
      functionMeta: f,
      units: floorUnits,
      remainder: exactUnits - floorUnits,
      planned: floorUnits * unit,
    };
  });

  const assigned = calculated.reduce((s, c) => s + c.units, 0);
  let missing = totalUnits - assigned;

  const sorted = [...calculated].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < missing && i < sorted.length; i++) {
    sorted[i].units += 1;
    sorted[i].planned = sorted[i].units * unit;
  }

  if (oddResidual > 0 && sorted.length > 0) {
    sorted[0].planned += oddResidual;
  }

  return calculated.map(c => {
    const planned = c.planned;
    const percent = safeTotal > 0 ? Math.round((planned / safeTotal) * 1000) / 10 : 0;
    return {
      id: c.functionMeta.id,
      name: c.functionMeta.name,
      date: c.functionMeta.date || '',
      guests: c.functionMeta.guests || 0,
      sharePercent: percent,
      planned,
    };
  });
}

/**
 * Track spend per category and across total plan
 * @param {Array<object>} allocations
 * @param {number} totalBudget
 * @returns {object}
 */
export function trackSpend(allocations = [], totalBudget = 0) {
  let totalPlanned = 0;
  let totalSpent = 0;
  const categoryStatus = [];
  let hasCategoryOverspend = false;

  for (const item of allocations) {
    const planned = item.planned || 0;
    const spent = item.spent || 0;
    totalPlanned += planned;
    totalSpent += spent;

    const remaining = planned - spent;
    const percentSpent = planned > 0 ? Math.round((spent / planned) * 100) : 0;
    const isOver = spent > planned;
    const isHighOverspend = spent > planned * 1.1; // > 10% over

    if (isHighOverspend) hasCategoryOverspend = true;

    categoryStatus.push({
      id: item.id,
      category: item.category,
      planned,
      spent,
      remaining,
      percentSpent,
      isOver,
      isHighOverspend,
    });
  }

  const overallRemaining = (totalBudget || totalPlanned) - totalSpent;
  const isTotalOver = totalSpent > (totalBudget || totalPlanned);

  return {
    totalPlanned: totalBudget || totalPlanned,
    totalSpent,
    remaining: overallRemaining,
    isOverBudget: isTotalOver,
    hasCategoryOverspend,
    categories: categoryStatus,
  };
}
