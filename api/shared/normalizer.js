/**
 * Location Normalization Utility for Hackathons
 * Standardizes cities, states, and countries with high fidelity for Karnataka and India.
 */

const KARNATAKA_CITIES = [
  'bengaluru', 'bangalore', 'mysuru', 'mysore', 'mangaluru', 'mangalore',
  'hubballi', 'hubli', 'dharwad', 'belagavi', 'belgaum', 'kalaburagi',
  'gulbarga', 'davangere', 'ballari', 'bellary', 'shimoga', 'shivamogga',
  'tumakuru', 'tumkur', 'udupi', 'manipal'
];

const INDIAN_METROS = [
  'delhi', 'new delhi', 'mumbai', 'hyderabad', 'chennai', 'pune', 'kolkata',
  'ahmedabad', 'gurugram', 'gurgaon', 'noida', 'jaipur', 'kochi', 'coimbatore',
  'chandigarh', 'indore', 'bhubaneswar', 'lucknow', 'nagpur', 'patna', 'kerala', 'tamil nadu', 'maharashtra'
];

export function normalizeLocation(rawLocation = '', rawAddress = {}) {
  const locStr = String(rawLocation || '').toLowerCase().trim();
  const addressStr = String(rawAddress.address || '').toLowerCase().trim();
  const addressCity = String(rawAddress.city || '').toLowerCase().trim();
  const addressState = String(rawAddress.state || '').toLowerCase().trim();
  const addressCountry = String(rawAddress.country?.name || rawAddress.country || '').toLowerCase().trim();

  const combined = `${locStr} ${addressStr} ${addressCity} ${addressState} ${addressCountry}`;

  // 1. Check Karnataka & Bengaluru
  if (
    combined.includes('bengaluru') || 
    combined.includes('bangalore') ||
    addressCity.includes('bengaluru') || 
    addressCity.includes('bangalore')
  ) {
    return {
      location: 'Bengaluru, Karnataka, India',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      isIndia: true,
      isKarnataka: true
    };
  }

  for (const city of KARNATAKA_CITIES) {
    if (combined.includes(city) || addressCity.includes(city)) {
      const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
      return {
        location: `${formattedCity}, Karnataka, India`,
        city: formattedCity,
        state: 'Karnataka',
        country: 'India',
        isIndia: true,
        isKarnataka: true
      };
    }
  }

  if (combined.includes('karnataka') || addressState.includes('karnataka')) {
    return {
      location: 'Karnataka, India',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      isIndia: true,
      isKarnataka: true
    };
  }

  // 2. Check Other Indian Metros / States
  for (const metro of INDIAN_METROS) {
    if (combined.includes(metro) || addressCity.includes(metro) || addressState.includes(metro)) {
      const formattedMetro = metro.charAt(0).toUpperCase() + metro.slice(1);
      return {
        location: `${formattedMetro}, India`,
        city: formattedMetro,
        state: 'India',
        country: 'India',
        isIndia: true,
        isKarnataka: false
      };
    }
  }

  if (combined.includes('india') || addressCountry.includes('india') || combined.includes('ist')) {
    const cityName = addressCity ? (addressCity.charAt(0).toUpperCase() + addressCity.slice(1)) : 'India';
    return {
      location: cityName === 'India' ? 'India' : `${cityName}, India`,
      city: cityName,
      state: 'India',
      country: 'India',
      isIndia: true,
      isKarnataka: false
    };
  }

  // 3. Online / Hybrid
  if (locStr.includes('online') || locStr.includes('virtual')) {
    return {
      location: 'Online',
      city: 'Online',
      state: 'Online',
      country: 'Global',
      isIndia: false,
      isKarnataka: false
    };
  }

  // 4. Default International Location
  const fallback = rawLocation.trim() || 'Global';
  return {
    location: fallback,
    city: addressCity || fallback,
    state: addressState || 'International',
    country: addressCountry || 'International',
    isIndia: false,
    isKarnataka: false
  };
}

export function normalizeMode(rawMode = '', rawLocation = '') {
  const m = String(rawMode || '').toLowerCase();
  const loc = String(rawLocation || '').toLowerCase();

  if (m.includes('online') || m.includes('virtual') || loc.includes('online') || loc.includes('virtual')) {
    return 'online';
  }
  if (m.includes('hybrid') || loc.includes('hybrid')) {
    return 'hybrid';
  }
  return 'offline';
}

const MONTH_MAP = {
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

export function parseSafeIsoDate(dateString) {
  if (!dateString) return null;
  try {
    let raw = String(dateString).trim();
    if (!raw) return null;

    // 1. Remove text prefixes
    raw = raw
      .replace(/^(deadline|starts|ends|date|registration deadline|reg deadline|apply by|ends on|registration ends)\s*:\s*/i, '')
      .replace(/^(deadline|starts|ends|date)\s+/i, '')
      .trim();

    // 2. Remove ordinal suffixes
    raw = raw.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1');

    // 3. Slash Formats: Strict DAY/MONTH/YEAR convention
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const day = parseInt(slashMatch[1], 10);
      const month = parseInt(slashMatch[2], 10);
      const year = parseInt(slashMatch[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const d = new Date(year, month - 1, day);
        if (!isNaN(d.getTime())) return d.toISOString();
      }
    }

    // 4. Text month formats: "2 Aug 2026", "August 2, 2026"
    const textMonthMatch1 = raw.match(/^(\d{1,2})[\s\-\/\.]([A-Za-z]+)[\s\-\/\.](\d{4})/);
    if (textMonthMatch1) {
      const day = parseInt(textMonthMatch1[1], 10);
      const mStr = textMonthMatch1[2].toLowerCase();
      const year = parseInt(textMonthMatch1[3], 10);
      if (mStr in MONTH_MAP) {
        const testD = new Date(year, MONTH_MAP[mStr], day);
        if (!isNaN(testD.getTime())) return testD.toISOString();
      }
    }

    const textMonthMatch2 = raw.match(/^([A-Za-z]+)[\s\-\/\.](\d{1,2}),?[\s\-\/\.](\d{4})/);
    if (textMonthMatch2) {
      const mStr = textMonthMatch2[1].toLowerCase();
      const day = parseInt(textMonthMatch2[2], 10);
      const year = parseInt(textMonthMatch2[3], 10);
      if (mStr in MONTH_MAP) {
        const testD = new Date(year, MONTH_MAP[mStr], day);
        if (!isNaN(testD.getTime())) return testD.toISOString();
      }
    }

    // 5. Dash parsing YYYY-MM-DD or DD-MM-YYYY
    const dashMatch = raw.match(/^(\d{1,4})-(\d{1,2})-(\d{1,4})/);
    if (dashMatch) {
      const p1 = parseInt(dashMatch[1], 10);
      const p2 = parseInt(dashMatch[2], 10);
      const p3 = parseInt(dashMatch[3], 10);
      if (p1 > 1000) {
        const testD = new Date(p1, p2 - 1, p3);
        if (!isNaN(testD.getTime())) return testD.toISOString();
      } else if (p3 > 1000) {
        const testD = new Date(p3, p2 - 1, p1);
        if (!isNaN(testD.getTime())) return testD.toISOString();
      }
    }

    // 6. Direct standard parsing
    const cleaned = raw.replace(/GMT\+0530/g, '+05:30');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }

    return null;
  } catch {
    return null;
  }
}

export function isUpcomingEvent(startDateStr, endDateStr, regDeadlineStr, rawStatus) {
  const now = new Date();
  const nowMs = now.getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();
  const statusStr = String(rawStatus || '').toLowerCase().trim();

  // 1. Explicit status check: Reject closed, ended, completed, or expired events
  if (
    statusStr.includes('closed') ||
    statusStr.includes('ended') ||
    statusStr.includes('completed') ||
    statusStr.includes('expired') ||
    statusStr.includes('past') ||
    statusStr === 'registration closed' ||
    statusStr === 'registration_closed'
  ) {
    return false;
  }

  const startIso = parseSafeIsoDate(startDateStr);
  const endIso = parseSafeIsoDate(endDateStr);
  const deadlineIso = parseSafeIsoDate(regDeadlineStr);

  const start = startIso ? new Date(startIso) : null;
  const end = endIso ? new Date(endIso) : null;
  const deadline = deadlineIso ? new Date(deadlineIso) : null;

  const getEndOfDayMs = (d) => {
    if (!d) return 0;
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

  // RULE 3: If start date exists and is before today -> REJECT (event started in past e.g. 1/8/2026, 2/8/2026, 5/8/2026)
  if (start && getEndOfDayMs(start) < todayStartMs) {
    return false;
  }

  // RULE 4: Must have at least one valid future/today date (start or deadline or end)
  const hasFuture = (start && getEndOfDayMs(start) >= todayStartMs) ||
                    (deadline && getEndOfDayMs(deadline) >= nowMs) ||
                    (end && getEndOfDayMs(end) >= nowMs);

  return Boolean(hasFuture);
}

export function calculateEventStatus(startDateStr, endDateStr, regDeadlineStr) {
  const now = new Date();
  const nowMs = now.getTime();

  const startIso = parseSafeIsoDate(startDateStr);
  const endIso = parseSafeIsoDate(endDateStr);
  const deadlineIso = parseSafeIsoDate(regDeadlineStr);

  const start = startIso ? new Date(startIso) : null;
  const end = endIso ? new Date(endIso) : null;
  const deadline = deadlineIso ? new Date(deadlineIso) : null;

  if (end && nowMs > end.getTime()) {
    return 'completed';
  }
  if (deadline && nowMs > deadline.getTime()) {
    return 'completed';
  }
  if (start && end && nowMs >= start.getTime() && nowMs <= end.getTime()) {
    return 'active';
  }
  return 'upcoming';
}

