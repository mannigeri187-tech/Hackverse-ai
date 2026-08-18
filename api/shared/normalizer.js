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

export function parseSafeIsoDate(dateString) {
  if (!dateString) return null;
  try {
    const raw = String(dateString).trim();
    if (!raw) return null;

    // 1. Direct parsing
    const cleaned = raw.replace(/GMT\+0530/g, '+05:30');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }

    // 2. Slash parsing MM/DD/YYYY or DD/MM/YYYY
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const p1 = parseInt(slashMatch[1], 10);
      const p2 = parseInt(slashMatch[2], 10);
      const yr = parseInt(slashMatch[3], 10);
      if (p1 <= 12) {
        const testD = new Date(yr, p1 - 1, p2);
        if (!isNaN(testD.getTime())) return testD.toISOString();
      }
      if (p2 <= 12) {
        const testD = new Date(yr, p2 - 1, p1);
        if (!isNaN(testD.getTime())) return testD.toISOString();
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function isUpcomingEvent(startDateStr, endDateStr, regDeadlineStr, rawStatus) {
  const now = new Date();
  const nowMs = now.getTime();
  const statusStr = String(rawStatus || '').toLowerCase().trim();

  if (statusStr === 'completed' || statusStr === 'ended' || statusStr === 'closed' || statusStr === 'registration closed') {
    return false;
  }

  const startIso = parseSafeIsoDate(startDateStr);
  const endIso = parseSafeIsoDate(endDateStr);
  const deadlineIso = parseSafeIsoDate(regDeadlineStr);

  const start = startIso ? new Date(startIso) : null;
  const end = endIso ? new Date(endIso) : null;
  const deadline = deadlineIso ? new Date(deadlineIso) : null;

  if (end && end.getTime() < nowMs) return false;
  if (deadline && deadline.getTime() < nowMs) return false;
  if (!end && !deadline && start && (nowMs - start.getTime() > 24 * 60 * 60 * 1000)) return false;

  const hasFuture = (start && start.getTime() >= nowMs) ||
                    (end && end.getTime() >= nowMs) ||
                    (deadline && deadline.getTime() >= nowMs);

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
