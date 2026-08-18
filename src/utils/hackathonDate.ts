/**
 * Robust Hackathon Date Parser and Upcoming Event Filter
 * Dynamically evaluates hackathon start, end, and registration deadlines
 * against the current runtime timestamp (Date.now()).
 */

export function parseHackathonDate(val: string | number | Date | null | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  try {
    const raw = String(val).trim();
    if (!raw) return null;

    // 1. Direct standard parsing (ISO 8601, RFC2822, etc.)
    const directDate = new Date(raw.replace(/GMT\+0530/g, '+05:30'));
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }

    // 2. Handle Slash Formats: MM/DD/YYYY or DD/MM/YYYY
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

    // 3. Handle Dash Formats: YYYY-MM-DD or DD-MM-YYYY
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
 * Extracts and parses all possible date fields from any hackathon object representation.
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
  const rawStatus = String(item.status || item.event_status || item.registration_url_status || '').toLowerCase().trim();

  return {
    start: parseHackathonDate(rawStart),
    end: parseHackathonDate(rawEnd),
    deadline: parseHackathonDate(rawDeadline),
    status: rawStatus,
  };
}

/**
 * Calculates normalized status for a hackathon:
 * - CLOSED: Registration deadline has passed, or status is explicitly registration closed
 * - ENDED: Event end date has passed, or status is completed
 * - ACTIVE: Currently ongoing (start <= now <= end)
 * - OPEN: Registration is active and event is in the future
 * - UPCOMING: Event is in the future
 */
export function getHackathonNormalizedStatus(item: any): HackathonStatus {
  const now = new Date();
  const nowMs = now.getTime();
  const { start, end, deadline, status } = extractHackathonDates(item);

  // 1. Check if event has ended
  if (status === 'completed' || status === 'ended' || status === 'expired' || (end && end.getTime() < nowMs)) {
    return 'ENDED';
  }

  // 2. Check if registration is closed
  if (
    status === 'registration closed' || 
    status === 'registration_closed' || 
    status === 'closed' || 
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
 * Only returns true if the hackathon is still open or upcoming in the future.
 */
export function isUpcomingHackathon(item: any): boolean {
  if (!item || typeof item !== 'object') return false;

  const { start, end, deadline, status } = extractHackathonDates(item);
  const now = new Date();
  const nowMs = now.getTime();

  // 1. Explicit status check: Reject closed/ended/completed events
  if (
    status === 'completed' || 
    status === 'ended' || 
    status === 'closed' || 
    status === 'registration closed' ||
    status === 'registration_closed' ||
    status === 'expired'
  ) {
    return false;
  }

  // 2. DATE PRIORITY 1: Prefer event END date
  // If the event has an end date, and the end date is in the past -> REJECT (Event ended)
  if (end && end.getTime() < nowMs) {
    return false;
  }

  // 3. Registration Deadline check
  // If registration deadline has strictly passed -> REJECT (Registration closed)
  if (deadline && deadline.getTime() < nowMs) {
    return false;
  }

  // 4. DATE PRIORITY 2: If no end date or deadline exists, check START date
  // If start date is in the past -> REJECT (Event already started/passed)
  if (!end && !deadline && start && start.getTime() < nowMs) {
    return false;
  }

  // 5. Must have at least one valid future date (start, end, or deadline)
  const hasFutureDate = (end && end.getTime() >= nowMs) ||
                        (start && start.getTime() >= nowMs) ||
                        (deadline && deadline.getTime() >= nowMs);

  return Boolean(hasFutureDate);
}
