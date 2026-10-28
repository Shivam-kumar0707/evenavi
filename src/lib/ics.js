/**
 * ics.js
 * RFC 5545 compliant iCalendar generator for Evenavi timeline tasks.
 * Conforms strictly to:
 * - CRLF (\r\n) line endings
 * - 75 octet line folding
 * - Comma, semicolon, backslash escaping
 * - Globally unique UIDs
 */

/**
 * Escape text for iCalendar per RFC 5545
 * @param {string} str
 * @returns {string}
 */
export function escapeIcsText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

/**
 * Fold lines longer than 75 octets per RFC 5545
 * Each folded line begins with CRLF followed by a single whitespace.
 * @param {string} line
 * @returns {string}
 */
export function foldLine(line) {
  const MAX_OCTETS = 75;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(line);

  if (bytes.length <= MAX_OCTETS) return line;

  let result = '';
  let currentLine = '';
  let currentBytes = 0;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const charBytes = encoder.encode(char).length;

    if (currentBytes + charBytes > (result === '' ? MAX_OCTETS : MAX_OCTETS - 1)) {
      result += (result === '' ? '' : '\r\n ') + currentLine;
      currentLine = char;
      currentBytes = charBytes;
    } else {
      currentLine += char;
      currentBytes += charBytes;
    }
  }

  if (currentLine) {
    result += (result === '' ? '' : '\r\n ') + currentLine;
  }

  return result;
}

/**
 * Convert YYYY-MM-DD string to iCalendar DATE format (YYYYMMDD)
 * @param {string} dateStr
 * @returns {string}
 */
export function formatIcsDate(dateStr) {
  if (!dateStr) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, '').slice(0, 8);
  }
  return dateStr.replace(/-/g, '').slice(0, 8);
}

/**
 * Generate complete .ics calendar string from an array of tasks.
 * @param {object} params
 * @param {string} params.eventTitle Title of the plan
 * @param {Array<object>} params.tasks Array of timeline tasks { id, title, dueDate, priority, category }
 * @param {string} [params.planId]
 * @returns {string} RFC 5545 calendar string with CRLF line breaks
 */
export function generateIcs({ eventTitle = 'Evenavi Event', tasks = [], planId = 'evenavi' }) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Evenavi//Event Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(`Evenavi — ${eventTitle}`)}`,
  ];

  (tasks || []).forEach((task, idx) => {
    if (!task.dueDate) return;

    const dtDate = formatIcsDate(task.dueDate);
    const uid = `${planId}-${task.id || idx}-${dtDate}@evenavi.app`;
    const summary = `${task.priority === 'must' ? '⚡ ' : ''}${task.title}`;
    const description = `Category: ${task.category || 'General'} | Priority: ${task.priority || 'standard'} | Status: ${task.done ? 'Completed' : 'Pending'}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${dtDate}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `STATUS:${task.done ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  // Fold every line to 75 octets and join with CRLF
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/**
 * Trigger browser download of .ics file
 * @param {string} icsContent
 * @param {string} filename
 */
export function downloadIcsFile(icsContent, filename = 'evenavi-timeline.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
