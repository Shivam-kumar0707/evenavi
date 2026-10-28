/**
 * Affordability band thresholds per guest in INR.
 * Labelled in the UI as rough planning guidance estimates, not exact market prices.
 * Starting assumptions:
 * - Wedding: ₹2,500 (Tight) and ₹6,000 (Generous)
 * - Birthday: ₹800 (Tight) and ₹2,000 (Generous)
 * - Community: ₹150 (Tight) and ₹500 (Generous)
 * Multiplied by 1.4 for Tier 1 cities, 1.0 for Tier 2, 0.8 for Tier 3.
 */

export const CITY_TIER_MULTIPLIERS = {
  1: 1.4,
  2: 1.0,
  3: 0.8,
};

export const BASELINE_BANDS = {
  wedding: {
    tightMax: 2500,
    comfortableMax: 6000,
  },
  birthday: {
    tightMax: 800,
    comfortableMax: 2000,
  },
  community: {
    tightMax: 150,
    comfortableMax: 500,
  },
};

/**
 * Determine affordability band based on perGuest cost, event type, and city tier.
 * @param {'wedding'|'birthday'|'community'} eventType
 * @param {1|2|3} cityTier
 * @param {number} perGuestAmount
 * @returns {'Tight'|'Comfortable'|'Generous'}
 */
export function getAffordabilityBand(eventType = 'wedding', cityTier = 2, perGuestAmount = 0) {
  const bands = BASELINE_BANDS[eventType] || BASELINE_BANDS.wedding;
  const mult = CITY_TIER_MULTIPLIERS[cityTier] || 1.0;

  const tightThreshold = Math.round(bands.tightMax * mult);
  const comfortableThreshold = Math.round(bands.comfortableMax * mult);

  if (perGuestAmount < tightThreshold) {
    return 'Tight';
  } else if (perGuestAmount <= comfortableThreshold) {
    return 'Comfortable';
  } else {
    return 'Generous';
  }
}
