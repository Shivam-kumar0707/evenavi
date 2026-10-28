/**
 * timelineEngine.js
 * Pure JavaScript, deadline-driven timeline calculation for Evenavi.
 * Back-plans tasks from event date, computes phases, and adapts to compressed timelines.
 */

import { addDays, subDays, differenceInCalendarDays, parseISO, format, isValid } from 'date-fns';

export const TIMELINE_TEMPLATES = {
  wedding: [
    { offset: 270, title: 'Set total budget and draft guest list', category: 'planning', priority: 'must' },
    { offset: 240, title: 'Lock date, muhurat and venue shortlist', category: 'venue', priority: 'must' },
    { offset: 210, title: 'Book photographer and videographer', category: 'photo', priority: 'must' },
    { offset: 180, title: 'Shortlist caterers and schedule tastings', category: 'catering', priority: 'must' },
    { offset: 150, title: 'Book decorator and finalize theme', category: 'decor', priority: 'must' },
    { offset: 120, title: 'Start attire and jewellery shopping', category: 'attire', priority: 'should' },
    { offset: 120, title: 'Design invitations', category: 'invites', priority: 'should' },
    { offset: 90, title: 'Book makeup and mehendi artists', category: 'makeup', priority: 'should' },
    { offset: 90, title: 'Book DJ, band or performers', category: 'music', priority: 'should' },
    { offset: 60, title: 'Send invitations and track RSVPs', category: 'invites', priority: 'must' },
    { offset: 45, title: 'Finalize menu and arrange guest stay', category: 'catering', priority: 'must' },
    { offset: 30, title: 'Confirm final guest count with venue and caterer', category: 'venue', priority: 'must' },
    { offset: 30, title: 'Arrange pandit and ritual items', category: 'rituals', priority: 'should' },
    { offset: 14, title: 'Schedule final vendor payments and seating plan', category: 'planning', priority: 'must' },
    { offset: 7, title: 'Run rehearsal and pack an emergency kit', category: 'planning', priority: 'should' },
    { offset: 1, title: 'Confirm all vendors and share the day-of schedule', category: 'planning', priority: 'must' },
    { offset: 0, title: 'Event day: celebrate and enjoy!', category: 'planning', priority: 'must' },
    { offset: -3, title: 'Send thank-you messages and settle vendor balances', category: 'planning', priority: 'nice' },
  ],
  birthday: [
    { offset: 45, title: 'Set budget and guest list', category: 'planning', priority: 'must' },
    { offset: 40, title: 'Pick theme and book venue', category: 'venue', priority: 'must' },
    { offset: 30, title: 'Order custom cake and book entertainer/magician', category: 'cake', priority: 'must' },
    { offset: 30, title: 'Book photographer', category: 'photo', priority: 'nice' },
    { offset: 21, title: 'Send invitations and gather RSVPs', category: 'invites', priority: 'must' },
    { offset: 14, title: 'Order decor, balloons and return gifts', category: 'decor', priority: 'should' },
    { offset: 7, title: 'Confirm menu and headcount with caterer', category: 'catering', priority: 'must' },
    { offset: 3, title: 'Confirm vendors and plan the games schedule', category: 'planning', priority: 'should' },
    { offset: 0, title: 'Event day: enjoy the celebration!', category: 'planning', priority: 'must' },
    { offset: -2, title: 'Send thank-you messages and return gift delivery', category: 'planning', priority: 'nice' },
  ],
  community: [
    { offset: 75, title: 'Form committee and set budget', category: 'planning', priority: 'must' },
    { offset: 60, title: 'Get municipal permissions and book venue/ground', category: 'venue', priority: 'must' },
    { offset: 50, title: 'Find sponsors and open collections/contributions', category: 'planning', priority: 'should' },
    { offset: 40, title: 'Book stage, sound, lighting and generator', category: 'stage', priority: 'must' },
    { offset: 35, title: 'Confirm caterer or food stalls', category: 'food', priority: 'must' },
    { offset: 30, title: 'Finalize performers and cultural program schedule', category: 'performers', priority: 'must' },
    { offset: 21, title: 'Print posters, banners and start community promotion', category: 'promotion', priority: 'should' },
    { offset: 14, title: 'Recruit and brief event volunteers', category: 'volunteers', priority: 'must' },
    { offset: 7, title: 'Arrange security, first aid and crowd management plan', category: 'security', priority: 'must' },
    { offset: 2, title: 'Final walkthrough and soundcheck with vendors', category: 'planning', priority: 'must' },
    { offset: 0, title: 'Event day: festival execution!', category: 'planning', priority: 'must' },
    { offset: -3, title: 'Thank sponsors, volunteers and publish audited accounts', category: 'planning', priority: 'nice' },
  ],
};

export const PHASES = [
  { id: 'foundation', name: 'Foundation (> 120 Days)', minDays: 121, maxDays: 9999 },
  { id: 'booking', name: 'Vendor Booking (60–120 Days)', minDays: 60, maxDays: 120 },
  { id: 'details', name: 'Details & RSVPs (14–59 Days)', minDays: 14, maxDays: 59 },
  { id: 'final_stretch', name: 'Final Stretch (< 14 Days)', minDays: 1, maxDays: 13 },
  { id: 'event_day', name: 'Event Day', minDays: 0, maxDays: 0 },
  { id: 'after', name: 'After Event', minDays: -9999, maxDays: -1 },
];

/**
 * Determine phase ID from offset in days
 * @param {number} offset Days before event (negative = after event)
 */
export function getPhaseForOffset(offset) {
  if (offset > 120) return 'foundation';
  if (offset >= 60) return 'booking';
  if (offset >= 14) return 'details';
  if (offset > 0) return 'final_stretch';
  if (offset === 0) return 'event_day';
  return 'after';
}

/**
 * Generate a complete timeline back-planned from target date.
 * Handles compression if available time is less than maximum template offset.
 * @param {object} params
 * @param {'wedding'|'birthday'|'community'} params.eventType
 * @param {string} params.eventDate YYYY-MM-DD
 * @param {Date|string} [params.todayDate]
 * @returns {{timeline: Array<object>, timelineMeta: {compressed: boolean, warning: string}}}
 */
export function generateTimeline({ eventType = 'wedding', eventDate, todayDate = new Date() }) {
  const template = TIMELINE_TEMPLATES[eventType] || TIMELINE_TEMPLATES.wedding;

  let targetDate;
  try {
    targetDate = typeof eventDate === 'string' ? parseISO(eventDate) : eventDate;
    if (!isValid(targetDate)) targetDate = addDays(new Date(), 90);
  } catch {
    targetDate = addDays(new Date(), 90);
  }

  const today = typeof todayDate === 'string' ? parseISO(todayDate) : todayDate;
  const availableDays = differenceInCalendarDays(targetDate, today);

  const positiveOffsets = template.map(t => t.offset).filter(o => o > 0);
  const maxOffset = positiveOffsets.length > 0 ? Math.max(...positiveOffsets) : 1;

  let isCompressed = false;
  let warning = '';
  let scale = 1.0;

  if (availableDays < maxOffset) {
    isCompressed = true;
    scale = Math.max(0.05, availableDays / maxOffset);
    if (availableDays < 7) {
      warning = 'Extremely tight timeline! Only critical "Must-have" tasks are scheduled before your event.';
    } else if (availableDays < 30) {
      warning = 'Tight timeline warning: Deadlines have been accelerated to fit your event date.';
    } else {
      warning = 'Timeline compressed: Task dates are adapted to your schedule.';
    }
  }

  // Filter tasks based on compression degree
  let activeTemplate = [...template];
  if (availableDays < 7) {
    activeTemplate = activeTemplate.filter(t => t.priority === 'must' || t.offset <= 0);
  } else if (scale < 0.5) {
    activeTemplate = activeTemplate.filter(t => t.priority !== 'nice' || t.offset <= 0);
  }

  const timeline = activeTemplate.map((item, idx) => {
    let effectiveOffset = item.offset;

    if (item.offset > 0 && isCompressed) {
      effectiveOffset = Math.round(item.offset * scale);
      // Clamp so due date never falls before today
      if (effectiveOffset > availableDays) {
        effectiveOffset = Math.max(0, availableDays);
      }
    }

    const dueDateObj = effectiveOffset >= 0
      ? subDays(targetDate, effectiveOffset)
      : addDays(targetDate, Math.abs(effectiveOffset));

    const dueDate = format(dueDateObj, 'yyyy-MM-dd');
    const phase = getPhaseForOffset(effectiveOffset);

    return {
      id: `task_${idx + 1}_${item.category}`,
      title: item.title,
      phase,
      category: item.category,
      dueDate,
      priority: item.priority || 'should',
      done: false,
      note: '',
      source: 'template',
    };
  });

  return {
    timeline,
    timelineMeta: {
      compressed: isCompressed,
      warning,
    },
  };
}

/**
 * Merge AI-generated extra tasks into an existing timeline
 * Deduplicates by title and marks source as 'ai'.
 * @param {Array<object>} timeline Existing tasks
 * @param {Array<object>} extraTasks AI extra tasks
 * @param {string} eventDate
 * @returns {Array<object>}
 */
export function mergeExtraTasks(timeline = [], extraTasks = [], eventDate) {
  if (!extraTasks || extraTasks.length === 0) return timeline;

  let targetDate;
  try {
    targetDate = typeof eventDate === 'string' ? parseISO(eventDate) : eventDate;
    if (!isValid(targetDate)) targetDate = addDays(new Date(), 90);
  } catch {
    targetDate = addDays(new Date(), 90);
  }

  const existingTitles = new Set(timeline.map(t => t.title.toLowerCase().trim()));
  const merged = [...timeline];

  extraTasks.forEach((extra, idx) => {
    const title = (extra.title || '').trim();
    if (!title || existingTitles.has(title.toLowerCase())) return;

    existingTitles.add(title.toLowerCase());
    const offset = Math.max(0, Math.min(300, Number(extra.offsetDays) || 30));
    const dueDate = format(subDays(targetDate, offset), 'yyyy-MM-dd');
    const phase = extra.phase || getPhaseForOffset(offset);

    merged.push({
      id: `ai_task_${Date.now()}_${idx}`,
      title,
      phase,
      category: extra.category || 'planning',
      dueDate,
      priority: extra.priority === 'must' || extra.priority === 'should' ? extra.priority : 'nice',
      done: false,
      note: 'AI Personalized recommendation',
      source: 'ai',
    });
  });

  // Sort chronologically by dueDate
  return merged.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
