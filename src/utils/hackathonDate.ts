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

/**
 * Robust Hackathon Date Parser
 * Adheres strictly to DAY/MONTH/YEAR for slash dates (e.g. 1/8/2026 = 1 August 2026)
 */
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

    // 3. Slash Formats: Strict DAY/MONTH/YEAR convention (e.g. 1/8/2026 = 1 August 2026, 5/8/2026 = 5 August 2026)
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const day = parseInt(slashMatch[1], 10);
      const month = parseInt(slashMatch[2], 10);
      const year = parseInt(slashMatch[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const d = new Date(year, month - 1, day);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // 4. Text month formats: "2 Aug 2026", "August 2, 2026", "02-Aug-2026", "Aug 2 2026"
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

    // 5. Dash Formats: YYYY-MM-DD or DD-MM-YYYY
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

    // 6. Direct standard ISO / RFC parsing
    const directDate = new Date(raw.replace(/GMT\+0530/g, '+05:30'));
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }

    return null;
  } catch {
    return null;
  }
}

export type HackathonStatus = 'UPCOMING' | 'OPEN' | 'ACTIVE' | 'CLOSED' | 'ENDED';

/**
 * Extracts and parses all possible date & status fields from any hackathon object representation.
 */
function extractHackathonDates(item: any): {
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
  const rawDeadline = item.deadline || item.registrationDeadline || item.registration_deadline || item.reg_deadline || item.registrationDate || item.registration_date || item.end_regn_dt || null;
  
  const statusParts = [
    item.status,
    item.registrationStatus,
    item.registration_status,
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

  // 4. If registration is open
  if (deadline && deadline.getTime() >= nowMs) {
    return 'OPEN';
  }

  return 'UPCOMING';
}

/**
 * Single reliable upcoming hackathon filter function
 * Returns true = SHOW, false = HIDE
 * Fully dynamic against Date.now()
 */
export function isUpcomingHackathon(hackathon: any): boolean {
  if (!hackathon || typeof hackathon !== 'object') return false;

  const now = new Date();
  const nowMs = now.getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();

  // 1. Inspect status fields: status, registrationStatus, registration_status, event_status, registration_url_status
  const statusFields = [
    hackathon.status,
    hackathon.registrationStatus,
    hackathon.registration_status,
    hackathon.event_status,
    hackathon.registration_url_status,
  ].filter(Boolean);

  const rawStatus = statusFields.join(' ').toLowerCase().trim();

  // If status contains: Ended, Completed, Closed, Registration Closed, Expired, Past -> return false
  if (
    rawStatus.includes('ended') ||
    rawStatus.includes('completed') ||
    rawStatus.includes('closed') ||
    rawStatus.includes('expired') ||
    rawStatus.includes('past') ||
    rawStatus === 'registration closed' ||
    rawStatus === 'registration_closed'
  ) {
    return false;
  }

  const rawDeadline = hackathon.registration_deadline ||
                      hackathon.registrationDeadline ||
                      hackathon.deadline ||
                      hackathon.reg_deadline ||
                      hackathon.registrationDate ||
                      hackathon.registration_date ||
                      hackathon.end_regn_dt ||
                      null;

  const rawEnd = hackathon.end_date ||
                 hackathon.endDate ||
                 hackathon.event_end_date ||
                 hackathon.eventEndDate ||
                 hackathon.end ||
                 null;

  const rawStart = hackathon.start_date ||
                   hackathon.startDate ||
                   hackathon.event_start_date ||
                   hackathon.eventStartDate ||
                   hackathon.start ||
                   hackathon.date ||
                   null;

  const deadline = parseHackathonDate(rawDeadline);
  const end = parseHackathonDate(rawEnd);
  const start = parseHackathonDate(rawStart);

  const getEndOfDayMs = (d: Date): number => {
    const copy = new Date(d);
    copy.setHours(23, 59, 59, 999);
    return copy.getTime();
  };

  // RULE 1: If deadline exists and is in the past -> REJECT (registration closed)
  if (deadline && getEndOfDayMs(deadline) < nowMs) {
    return false;
  }

  // RULE 2: If end date exists and is in the past -> REJECT (event ended)
  if (end && getEndOfDayMs(end) < nowMs) {
    return false;
  }

  // RULE 3: If start date exists and is before today -> REJECT (event already started in past e.g. 1/8/2026, 2/8/2026, 5/8/2026)
  if (start && getEndOfDayMs(start) < todayStartMs) {
    return false;
  }

  // RULE 4: Must have at least one valid future/today date (start or deadline or end)
  const hasFuture = (start && getEndOfDayMs(start) >= todayStartMs) ||
                    (deadline && getEndOfDayMs(deadline) >= nowMs) ||
                    (end && getEndOfDayMs(end) >= nowMs);

  return Boolean(hasFuture);
}

/**
 * Removes expired hackathons from any array of hackathon records.
 * Returns only verified active/upcoming hackathon records.
 */
export function removeExpiredHackathons<T = any>(hackathons: T[] | null | undefined): T[] {
  if (!Array.isArray(hackathons)) return [];
  return hackathons.filter(isUpcomingHackathon);
}
