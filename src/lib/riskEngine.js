/**
 * riskEngine.js
 * Pure JavaScript, deterministic risk analysis and mitigation generation for Evenavi.
 */

import { differenceInCalendarDays, parseISO, isValid } from 'date-fns';
import { trackSpend } from './budgetEngine.js';
import { getAffordabilityBand } from '../data/bands.js';

/**
 * Evaluate plan risks deterministically according to TRD rules.
 * @param {object} plan
 * @param {Date|string} [todayDate]
 * @returns {Array<{id: string, severity: 'high'|'medium'|'low', title: string, detail: string, mitigation: string, source: string}>}
 */
export function evaluateRisks(plan, todayDate = new Date()) {
  if (!plan || !plan.event) return [];

  const risks = [];
  const { event, budget, timeline, timelineMeta, vendors } = plan;
  const today = typeof todayDate === 'string' ? parseISO(todayDate) : todayDate;

  let eventDateObj;
  try {
    eventDateObj = typeof event.date === 'string' ? parseISO(event.date) : event.date;
  } catch {
    eventDateObj = null;
  }

  const daysLeft = eventDateObj && isValid(eventDateObj)
    ? differenceInCalendarDays(eventDateObj, today)
    : 90;

  const eventMonth = eventDateObj && isValid(eventDateObj)
    ? eventDateObj.getMonth() + 1 // 1 = Jan, 12 = Dec
    : 11;

  // RULE 1: Overspend Check (Severity: HIGH)
  // Sum of spent is over total budget, or any category is overspent by more than 10 percent
  const spendInfo = trackSpend(budget?.allocations || [], event.totalBudget);
  if (spendInfo.isOverBudget) {
    const overAmt = spendInfo.totalSpent - spendInfo.totalPlanned;
    risks.push({
      id: 'risk_over_budget',
      severity: 'high',
      title: 'Total Budget Overrun',
      detail: `Your recorded spending exceeds the total planned budget by ₹${overAmt.toLocaleString('en-IN')}.`,
      mitigation: 'Freeze non-essential expenses immediately. Rebalance unlocked categories in the Budget tab to trim buffer areas or increase the total ceiling.',
      source: 'engine',
    });
  }
  if (spendInfo.hasCategoryOverspend) {
    const overCategories = spendInfo.categories.filter(c => c.isHighOverspend).map(c => c.category);
    risks.push({
      id: 'risk_category_overspend',
      severity: 'high',
      title: 'High Category Overspend',
      detail: `Specific categories (${overCategories.join(', ')}) exceed their planned allocation by more than 10%.`,
      mitigation: 'Lock these categories with current spend in the Budget tab to let Evenavi automatically rebalance remaining funds across other areas.',
      source: 'engine',
    });
  }

  // RULE 2: Timeline Compressed or Near-Term Open Must Tasks (Severity: HIGH)
  const openMustTasks = (timeline || []).filter(t => t.priority === 'must' && !t.done);
  if (timelineMeta?.compressed) {
    risks.push({
      id: 'risk_compressed_timeline',
      severity: 'high',
      title: 'Compressed Preparation Timeline',
      detail: 'The planning window is shorter than typical benchmarks. Task deadlines have been accelerated.',
      mitigation: 'Focus strictly on "Must-have" tasks first. Delegate invitation delivery and vendor follow-ups to close family or co-planners.',
      source: 'engine',
    });
  } else if (daysLeft <= 14 && openMustTasks.length > 0) {
    risks.push({
      id: 'risk_imminent_must_tasks',
      severity: 'high',
      title: 'Critical Tasks Pending (< 14 Days)',
      detail: `You have ${openMustTasks.length} critical "Must-have" tasks incomplete with under two weeks left.`,
      mitigation: 'Convene a priority review today. Confirm day-of vendor arrivals and finalize payments to prevent service disruptions.',
      source: 'engine',
    });
  }

  // RULE 3: Peak Wedding Season Vendor Availability (Severity: MEDIUM)
  // Peak wedding season: Nov (11), Dec (12), Jan (1), Feb (2)
  const isPeakSeason = [11, 12, 1, 2].includes(eventMonth);
  if (event.type === 'wedding' && isPeakSeason) {
    const venueVendor = (vendors || []).find(v => v.category?.toLowerCase().includes('venue'));
    const photoVendor = (vendors || []).find(v => v.category?.toLowerCase().includes('photo'));
    const venueBooked = venueVendor && ['booked', 'paid'].includes(venueVendor.status);
    const photoBooked = photoVendor && ['booked', 'paid'].includes(photoVendor.status);

    if (!venueBooked || !photoBooked) {
      risks.push({
        id: 'risk_peak_season',
        severity: 'medium',
        title: 'Peak Wedding Season Demand',
        detail: 'Your wedding falls between November and February when venues and premier photographers get booked 6+ months in advance.',
        mitigation: 'Expedite quotes and book your venue and photographer immediately, or consider flexible morning/weekday slots to secure top talent.',
        source: 'engine',
      });
    }
  }

  // RULE 4: Monsoon with Outdoor Venue (Severity: MEDIUM)
  // Outdoor or both venue and event month is June (6) to Sept (9)
  const isMonsoon = [6, 7, 8, 9].includes(eventMonth);
  const isOutdoor = event.venueType === 'outdoor' || event.venueType === 'both';
  if (isMonsoon && isOutdoor) {
    risks.push({
      id: 'risk_monsoon_outdoor',
      severity: 'medium',
      title: 'Monsoon Weather Risk for Outdoor Venue',
      detail: 'Your event date falls during the monsoon period (June–September) with an outdoor venue setup.',
      mitigation: 'Ensure waterproof German hanger or canopy tents are included in the decor contract, and negotiate an indoor banquet backup hall.',
      source: 'engine',
    });
  }

  // RULE 5: Tight Per-Guest Affordability Band (Severity: MEDIUM)
  const perGuestCost = Math.round((event.totalBudget || 0) / Math.max(1, event.guestCount || 1));
  const band = getAffordabilityBand(event.type, event.cityTier || 2, perGuestCost);
  if (band === 'Tight') {
    risks.push({
      id: 'risk_tight_budget',
      severity: 'medium',
      title: 'Tight Per-Guest Budget Band',
      detail: `At ₹${perGuestCost.toLocaleString('en-IN')} per guest in a Tier-${event.cityTier || 2} city, margins for premium catering and decor are lean.`,
      mitigation: 'Opt for set buffet menus with regional specialties rather than multi-cuisine live counters, and focus decor on key photo backdrops.',
      source: 'engine',
    });
  }

  // RULE 6: Vendor Onboarding Latency (Severity: MEDIUM)
  // Fewer than 3 vendor categories moved past 'not_started' when event < 60 days
  if (daysLeft < 60 && (vendors || []).length > 0) {
    const progressed = (vendors || []).filter(v => v.status && v.status !== 'not_started');
    if (progressed.length < 3) {
      risks.push({
        id: 'risk_vendor_delay',
        severity: 'medium',
        title: 'Low Vendor Engagement (< 60 Days)',
        detail: `Only ${progressed.length} vendor categories are past the initial stage with under 60 days remaining.`,
        mitigation: 'Use the ready-to-send WhatsApp messages in the Vendors tab to send 3 vendor enquiries today.',
        source: 'engine',
      });
    }
  }

  return risks;
}
