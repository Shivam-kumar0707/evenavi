import { describe, it, expect } from 'vitest';
import { addDays, format } from 'date-fns';
import { generateTimeline, mergeExtraTasks, getPhaseForOffset } from '../src/lib/timelineEngine.js';

describe('timelineEngine.js Back-planning & Compression', () => {
  it('correctly maps offsets to phases', () => {
    expect(getPhaseForOffset(150)).toBe('foundation');
    expect(getPhaseForOffset(90)).toBe('booking');
    expect(getPhaseForOffset(30)).toBe('details');
    expect(getPhaseForOffset(5)).toBe('final_stretch');
    expect(getPhaseForOffset(0)).toBe('event_day');
    expect(getPhaseForOffset(-3)).toBe('after');
  });

  it('generates standard timeline when planning window is abundant', () => {
    const today = new Date();
    const eventDate = format(addDays(today, 300), 'yyyy-MM-dd');

    const result = generateTimeline({
      eventType: 'wedding',
      eventDate,
      todayDate: today,
    });

    expect(result.timelineMeta.compressed).toBe(false);
    expect(result.timelineMeta.warning).toBe('');
    expect(result.timeline.length).toBeGreaterThan(10);

    // Verify tasks are ordered properly and have dueDates
    result.timeline.forEach(task => {
      expect(task.dueDate).toBeDefined();
      expect(task.priority).toBeDefined();
    });
  });

  it('compresses timeline when planning window is short and clamps past dates', () => {
    const today = new Date();
    // 40 days for a wedding where standard max offset is 270 days
    const eventDate = format(addDays(today, 40), 'yyyy-MM-dd');

    const result = generateTimeline({
      eventType: 'wedding',
      eventDate,
      todayDate: today,
    });

    expect(result.timelineMeta.compressed).toBe(true);
    expect(result.timelineMeta.warning).toContain('compressed');

    const todayStr = format(today, 'yyyy-MM-dd');
    result.timeline.forEach(task => {
      if (task.priority !== 'nice' || task.dueDate >= eventDate) {
        // Due date must be >= today
        expect(task.dueDate >= todayStr).toBe(true);
      }
    });
  });

  it('retains only must tasks in extreme compression (< 7 days)', () => {
    const today = new Date();
    const eventDate = format(addDays(today, 5), 'yyyy-MM-dd');

    const result = generateTimeline({
      eventType: 'wedding',
      eventDate,
      todayDate: today,
    });

    expect(result.timelineMeta.compressed).toBe(true);
    expect(result.timelineMeta.warning).toContain('Extremely tight');

    // All pre-event tasks should be must tasks
    const preEventTasks = result.timeline.filter(t => t.dueDate <= eventDate);
    preEventTasks.forEach(task => {
      expect(task.priority).toBe('must');
    });
  });

  it('merges and deduplicates AI extra tasks', () => {
    const today = new Date();
    const eventDate = format(addDays(today, 60), 'yyyy-MM-dd');
    const { timeline } = generateTimeline({ eventType: 'wedding', eventDate, todayDate: today });

    const extraTasks = [
      { title: 'Arrange Welcome Dhol Players', offsetDays: 10, priority: 'should', category: 'music' },
      { title: 'Set total budget and draft guest list', offsetDays: 200, priority: 'must', category: 'planning' }, // Duplicate
    ];

    const merged = mergeExtraTasks(timeline, extraTasks, eventDate);
    const dholTask = merged.find(t => t.title === 'Arrange Welcome Dhol Players');
    expect(dholTask).toBeDefined();
    expect(dholTask.source).toBe('ai');

    // Duplicate should not appear twice
    const duplicates = merged.filter(t => t.title === 'Set total budget and draft guest list');
    expect(duplicates.length).toBe(1);
  });
});
