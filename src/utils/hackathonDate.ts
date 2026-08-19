/**
 * Robust Dynamic Hackathon Date Parser and Upcoming Event Filter
 * Dynamically evaluates hackathons against the current runtime timestamp (Date.now()).
 * Completely dynamic with ZERO hardcoded dates, months, or years.
 */

// Month name dictionary for resilient textual date parsing
const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

export function parseHackathonDate(val: string | number | Date | null | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  try {
    let raw = String(val).trim();
    if (!raw) return null;

    // 1. Remove common text prefixes (e.g. "Deadline:", "Starts:", "Ends on:", "Apply by:")
    raw = raw
      .replace(/^(deadline|starts|ends|date|registration deadline|reg deadline|apply by|ends on|registration ends)\s*:\s*/i, '')
      .replace(/^(deadline|starts|ends|date)\s+/i, '')
      .trim();

    // 2. Remove ordinal suffixes: 1st, 2nd, 3rd, 4th -> 1, 2, 3, 4
    raw = raw.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1');

    // 3. Direct standard parsing (ISO 8601, RFC2822, etc.)
    const directDate = new Date(raw.replace(/GMT\+0530/g, '+05:30'));
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }

    // 4. Handle text month formats: "2 Aug 2026", "August 2, 2026", "02-Aug-2026", "Aug 2 2026"
    const textMonthMatch1 = raw.match(/^(\d{1,2})[\s\-\/\.]([A-Za-z]+)[\s\-\/\.](\d{4})/);
    if (textMonthMatch1) {
      const day = parseInt(textMonthMatch1[1], 10);
      const mStr = textMonthMatch1[2].toLowerCase();
      const year = parseInt(textMonthMatch1[3], 10);
      if (mStr in MONTH_MAP) {
        const d = new Date(year, MONTH_MAP[mStr], day);
        if (!isNaN(d.getTime())) return d;
      }
    }

    const textMonthMatch2 = raw.match(/^([A-Za-z]+)[\s\-\/\.](\d{1,2}),?[\s\-\/\.](\d{4})/);
    if (textMonthMatch2) {
      const mStr = textMonthMatch2[1].toLowerCase();
      const day = parseInt(textMonthMatch2[2], 10);
      const year = parseInt(textMonthMatch2[3], 10);
      if (mStr in MONTH_MAP) {
        const d = new Date(year, MONTH_MAP[mStr], day);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // 5. Handle Slash Formats: MM/DD/YYYY or DD/MM/YYYY
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const part1 = parseInt(slashMatch[1], 10);
      const part2 = parseInt(slashMatch[2], 10);
      const year = parseInt(slashMatch[3], 10);

      // Try Month/Day/Year (US style)
      if (part1 <= 12) {
        const d = new Date(year, part1 - 1, part2);
        if (!isNaN(d.getTime())) return d;
      }

      // Try Day/Month/Year (UK/India style)
      if (part2 <= 12) {
        const d = new Date(year, part2 - 1, part1);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // 6. Handle Dash Formats: YYYY-MM-DD or DD-MM-YYYY
    const dashMatch = raw.match(/^(\d{1,4})-(\d{1,2})-(\d{1,4})/);
    if (dashMatch) {
      const p1 = parseInt(dashMatch[1], 10);
      const p2 = parseInt(dashMatch[2], 10);
      const p3 = parseInt(dashMatch[3], 10);
      if (p1 > 1000) {
        // YYYY-MM-DD
        const d = new Date(p1, p2 - 1, p3);
        if (!isNaN(d.getTime())) return d;
      } else if (p3 > 1000) {
        // DD-MM-YYYY
        const d = new Date(p3, p2 - 1, p1);
        if (!isNaN(d.getTime())) return d;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export type HackathonStatus = 'UPCOMING' | 'OPEN' | 'ACTIVE' | 'CLOSED' | 'ENDED';

export interface HackathonDateFields {
  start_date?: string | number | Date | null;
  startDate?: string | number | Date | null;
  eventStartDate?: string | number | Date | null;
  event_start_date?: string | number | Date | null;
  start?: string | number | Date | null;
  date?: string | number | Date | null;

  end_date?: string | number | Date | null;
  endDate?: string | number | Date | null;
  eventEndDate?: string | number | Date | null;
  event_end_date?: string | number | Date | null;
  end?: string | number | Date | null;

  registration_deadline?: string | number | Date | null;
  registrationDeadline?: string | number | Date | null;
  deadline?: string | number | Date | null;
  reg_deadline?: string | number | Date | null;
  end_regn_dt?: string | number | Date | null;

  status?: string | null;
  event_status?: string | null;
  registration_url_status?: string | null;
}

/**
 * Extracts and parses all possible date & status fields from any hackathon object representation.
 */
export function extractHackathonDates(item: any): {
  start: Date | null;
  end: Date | null;
  deadline: Date | null;
  status: string;
} {
  if (!item || typeof item !== 'object') {
    return { start: null, end: null, deadline: null, status: '' };
  }

  const rawStart = item.startDate || item.start_date || item.eventStartDate || item.event_start_date || item.start || item.date || null;
  const rawEnd = item.endDate || item.end_date || item.eventEndDate || item.event_end_date || item.end || null;
  const rawDeadline = item.deadline || item.registrationDeadline || item.registration_deadline || item.reg_deadline || item.end_regn_dt || null;
  
  // Combine all status-like fields for comprehensive status checking
  const statusParts = [
    item.status,
    item.event_status,
    item.registration_url_status,
    typeof rawDeadline === 'string' && /closed|ended|completed/i.test(rawDeadline) ? rawDeadline : ''
  ].filter(Boolean);

  const rawStatus = statusParts.join(' ').toLowerCase().trim();

  return {
    start: parseHackathonDate(rawStart),
    end: parseHackathonDate(rawEnd),
    deadline: parseHackathonDate(rawDeadline),
    status: rawStatus,
  };
}

/**
 * Calculates normalized status for a hackathon.
 */
export function getHackathonNormalizedStatus(item: any): HackathonStatus {
  const now = new Date();
  const nowMs = now.getTime();
  const { start, end, deadline, status } = extractHackathonDates(item);

  // 1. Check if event has ended
  if (
    status.includes('completed') || 
    status.includes('ended') || 
    status.includes('expired') || 
    (end && end.getTime() < nowMs)
  ) {
    return 'ENDED';
  }

  // 2. Check if registration is closed
  if (
    status.includes('closed') || 
    status.includes('registration closed') || 
    status.includes('registration_closed') || 
    (deadline && deadline.getTime() < nowMs)
  ) {
    return 'CLOSED';
  }

  // 3. Check if currently active / ongoing
  if (start && end && nowMs >= start.getTime() && nowMs <= end.getTime()) {
    return 'ACTIVE';
  }

  // 4. If start is in the future and registration is open
  if (deadline && deadline.getTime() >= nowMs) {
    return 'OPEN';
  }

  return 'UPCOMING';
}

/**
 * Determines whether a hackathon should be displayed in the upcoming / active discovery list.
 * STRICTLY rejects past deadlines, closed registrations, completed events, and expired dates.
 * Fully dynamic against Date.now().
 */
export function isUpcomingHackathon(item: any): boolean {
  if (!item || typeof item !== 'object') return false;

  const { start, end, deadline, status } = extractHackathonDates(item);
  const now = new Date();
  const nowMs = now.getTime();

  // 1. Explicit status check: Reject closed, ended, completed, or expired events
  const normalizedStatus = String(status || '').toLowerCase().trim();
  if (
    normalizedStatus.includes('closed') ||
    normalizedStatus.includes('ended') ||
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('expired') ||
    normalizedStatus.includes('past')
  ) {
    return false;
  }

  // Helper: Get comparable timestamp with end-of-day grace period for date-only values
  const getComparableTime = (d: Date): number => {
    // If the date was parsed at exact midnight (00:00:00), treat as end of day 23:59:59.999
    if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
      const eod = new Date(d);
      eod.setHours(23, 59, 59, 999);
      return eod.getTime();
    }
    return d.getTime();
  };

  // 2. Registration Deadline check: If registration deadline has passed -> REJECT
  if (deadline && getComparableTime(deadline) < nowMs) {
    return false;
  }

  // 3. Event End Date check: If event end date has passed -> REJECT
  if (end && getComparableTime(end) < nowMs) {
    return false;
  }

  // 4. Start Date check: If no end date and no deadline exists, and start date has passed -> REJECT
  if (!end && !deadline && start && getComparableTime(start) < nowMs) {
    return false;
  }

  // 5. Must have at least one valid future/today date (deadline, end, or start)
  const hasFutureDate = (deadline && getComparableTime(deadline) >= nowMs) ||
                        (end && getComparableTime(end) >= nowMs) ||
                        (start && getComparableTime(start) >= nowMs);

  return Boolean(hasFutureDate);
}

