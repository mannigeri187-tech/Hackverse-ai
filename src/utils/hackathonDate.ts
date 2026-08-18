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
  end_date?: string | number | Date | null;
  registration_deadline?: string | number | Date | null;
  status?: string | null;
  registration_url_status?: string | null;
}

/**
 * Calculates normalized status for a hackathon:
 * - CLOSED: Registration deadline has passed, or status is explicitly registration closed
 * - ENDED: Event end date has passed, or status is completed
 * - ACTIVE: Currently ongoing (start <= now <= end)
 * - OPEN: Registration is active and event is in the future
 * - UPCOMING: Event is in the future
 */
export function getHackathonNormalizedStatus(item: HackathonDateFields): HackathonStatus {
  const now = new Date();
  const rawStatus = String(item.status || '').toLowerCase().trim();
  const regStatus = String(item.registration_url_status || '').toUpperCase().trim();

  const end = parseHackathonDate(item.end_date);
  const deadline = parseHackathonDate(item.registration_deadline);
  const start = parseHackathonDate(item.start_date);

  // 1. Check if event has ended
  if (rawStatus === 'completed' || rawStatus === 'ended' || (end && end.getTime() < now.getTime())) {
    return 'ENDED';
  }

  // 2. Check if registration is closed
  if (
    rawStatus === 'registration closed' || 
    rawStatus === 'closed' || 
    regStatus === 'REGISTRATION_CLOSED' ||
    (deadline && deadline.getTime() < now.getTime())
  ) {
    return 'CLOSED';
  }

  // 3. Check if currently active / ongoing
  if (start && end && now.getTime() >= start.getTime() && now.getTime() <= end.getTime()) {
    return 'ACTIVE';
  }

  // 4. If start is in the future and registration is open
  if (deadline && deadline.getTime() >= now.getTime()) {
    return 'OPEN';
  }

  return 'UPCOMING';
}

/**
 * Determines whether a hackathon should be displayed in the upcoming / active discovery list.
 * Only returns true if the hackathon is still open or upcoming in the future.
 */
export function isUpcomingHackathon(item: HackathonDateFields): boolean {
  const now = new Date();
  const nowMs = now.getTime();

  // 1. Explicit status check
  const rawStatus = String(item.status || '').toLowerCase().trim();
  const regStatus = String(item.registration_url_status || '').toUpperCase().trim();
  if (
    rawStatus === 'completed' || 
    rawStatus === 'ended' || 
    rawStatus === 'closed' || 
    rawStatus === 'registration closed' ||
    regStatus === 'REGISTRATION_CLOSED'
  ) {
    return false;
  }

  const end = parseHackathonDate(item.end_date);
  const deadline = parseHackathonDate(item.registration_deadline);
  const start = parseHackathonDate(item.start_date);

  // 2. If event has already ended
  if (end && end.getTime() < nowMs) {
    return false;
  }

  // 3. If registration deadline has strictly passed
  if (deadline && deadline.getTime() < nowMs) {
    return false;
  }

  // 4. If no end_date or deadline, but start_date is more than 24 hours in the past
  if (!end && !deadline && start && (nowMs - start.getTime() > 24 * 60 * 60 * 1000)) {
    return false;
  }

  // 5. Must have at least one valid future date
  const hasFutureDate = (start && start.getTime() >= nowMs) ||
                        (end && end.getTime() >= nowMs) ||
                        (deadline && deadline.getTime() >= nowMs);

  return Boolean(hasFutureDate);
}
