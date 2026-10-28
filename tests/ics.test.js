import { describe, it, expect } from 'vitest';
import { generateIcs, foldLine, escapeIcsText } from '../src/lib/ics.js';

describe('ics.js RFC 5545 Compliance', () => {
  it('escapes commas, semicolons, backslashes and newlines', () => {
    expect(escapeIcsText('Hello, World; test\\me\nnew line')).toBe('Hello\\, World\\; test\\\\me\\nnew line');
  });

  it('folds lines exceeding 75 octets with CRLF and space', () => {
    const longLine = 'DESCRIPTION:This is an extremely long description designed specifically to exceed the seventy-five octet limit required by RFC 5545 specification for calendar objects.';
    const folded = foldLine(longLine);
    expect(folded).toContain('\r\n ');
    const lines = folded.split('\r\n');
    lines.forEach(line => {
      const bytes = new TextEncoder().encode(line).length;
      expect(bytes).toBeLessThanOrEqual(75);
    });
  });

  it('generates compliant .ics structure with CRLF endings and unique UIDs', () => {
    const tasks = [
      { id: '1', title: 'Book caterer, photographer', dueDate: '2026-11-15', priority: 'must', category: 'catering' },
      { id: '2', title: 'Send invitations; confirm RSVPs', dueDate: '2026-11-20', priority: 'should', category: 'invites' },
    ];

    const ics = generateIcs({
      eventTitle: 'Sister Wedding',
      tasks,
      planId: 'plan_xyz123',
    });

    // Check CRLF endings
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics).toContain('\r\n');
    expect(ics).not.toMatch(/[^\r]\n/); // No lone LFs!

    // Check VCALENDAR blocks
    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('END:VCALENDAR\r\n');
    expect(ics).toContain('BEGIN:VEVENT\r\n');
    expect(ics).toContain('END:VEVENT\r\n');

    // Check unique UIDs
    expect(ics).toContain('UID:plan_xyz123-1-20261115@evenavi.app');
    expect(ics).toContain('UID:plan_xyz123-2-20261120@evenavi.app');
  });
});
