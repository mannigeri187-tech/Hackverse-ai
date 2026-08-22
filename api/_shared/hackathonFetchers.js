import https from 'https';
import { normalizeLocation, normalizeMode, calculateEventStatus, parseSafeIsoDate } from './normalizer.js';

function fetchJson(url, options = {}) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HackVerseBot/2.0',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: JSON.parse(data) });
          } else {
            resolve({ success: false, status: res.statusCode });
          }
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

/**
 * 1. Fetch Real Hackathons from Unstop Public API (India Heavy)
 */
export async function fetchUnstopHackathons() {
  const items = [];
  const MAX_PAGES = 15; // Fetch up to 750 hackathons

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=${page}&per_page=50`;
    const res = await fetchJson(url);
  
    if (!res.success || !res.data?.data?.data) {
      console.error(`Unstop ingestion failed on page ${page}:`, res.error || res.status);
      break;
    }
  
    const rawList = res.data.data.data;
    if (rawList.length === 0) break;
  
    for (const item of rawList) {
      if (!item.title) continue;
  
      const locInfo = normalizeLocation(item.region || '', item.address_with_country_logo || {});
      const mode = normalizeMode(item.opportunity_type || '', locInfo.location);
      const startDate = parseSafeIsoDate(item.start_date || item.approved_date) || new Date().toISOString();
      const endDate = parseSafeIsoDate(item.end_date);
      const regDeadline = parseSafeIsoDate(item.regnRequirements?.end_regn_dt);
      const status = calculateEventStatus(startDate, endDate, regDeadline);
  
      items.push({
        title: item.title.trim(),
        organizer: item.organisation?.name || 'Unstop Partner',
        description: item.details || item.seo_details?.description || `${item.title} on Unstop`,
        start_date: startDate,
        end_date: endDate,
        registration_deadline: regDeadline,
        location: locInfo.location,
        mode: mode,
        prize: item.prizes?.[0]?.cash ? `₹${item.prizes[0].cash.toLocaleString()}` : (item.regnRequirements?.remain_days || 'Awards & Certificates'),
        team_size: item.regnRequirements?.min_team_size ? `${item.regnRequirements.min_team_size}-${item.regnRequirements.max_team_size || 4} Members` : '1-4 Members',
        eligibility: item.filters?.map(f => f.name).join(', ') || 'College Students & Developers',
        registration_url: item.seo_url ? (item.seo_url.startsWith('http') ? item.seo_url : `https://unstop.com/${item.seo_url}`) : (item.short_url || 'https://unstop.com'),
        image_url: item.logoUrl2 || item.thumb || null,
        status: status,
        source: 'unstop',
        external_id: String(item.slug || item.id)
      });
    }
  }

  return items;
}

/**
 * 2. Fetch Real Hackathons from Devfolio Public API (India/Global Top Hackathons)
 */
export async function fetchDevfolioHackathons() {
  const items = [];
  const MAX_PAGES = 5; // Up to 200 hackathons

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://api.devfolio.co/api/hackathons?filter=all&page=${page}&limit=40`;
    const res = await fetchJson(url);
  
    if (!res.success || !res.data?.result) {
      console.error(`Devfolio ingestion failed on page ${page}:`, res.error || res.status);
      break;
    }
  
    const rawList = res.data.result;
    if (rawList.length === 0) break;
  
    for (const item of rawList) {
      if (!item.name) continue;
  
      const locInfo = normalizeLocation(item.location || '', {});
      const mode = normalizeMode(item.is_online ? 'online' : 'offline', locInfo.location);
      const startDate = parseSafeIsoDate(item.starts_at) || new Date().toISOString();
      const endDate = parseSafeIsoDate(item.ends_at);
      const regDeadline = parseSafeIsoDate(item.reg_ends_at);
      const status = calculateEventStatus(startDate, endDate, regDeadline);
  
      items.push({
        title: item.name.trim(),
        organizer: item.hosted_by || 'Devfolio Community',
        description: item.tagline || item.desc || `${item.name} hosted on Devfolio`,
        start_date: startDate,
        end_date: endDate,
        registration_deadline: regDeadline,
        location: locInfo.location,
        mode: mode,
        prize: item.prizes_total ? `₹${item.prizes_total.toLocaleString()}` : 'Cash & Swag',
        team_size: item.team_size ? `1-${item.team_size} Members` : '1-4 Members',
        eligibility: item.eligibility || 'Open to all developers',
        registration_url: item.hackathon_setting?.subdomain ? `https://${item.hackathon_setting.subdomain}.devfolio.co` : (item.url || 'https://devfolio.co'),
        image_url: item.cover_img || item.logo || null,
        status: status,
        source: 'devfolio',
        external_id: String(item.slug || item.id)
      });
    }
  }

  return items;
}

/**
 * 3. Fetch Real Hackathons from HackerEarth Public API
 */
export async function fetchHackerEarthHackathons() {
  const url = 'https://www.hackerearth.com/api/events/upcoming/';
  const res = await fetchJson(url);

  if (!res.success || !res.data?.response) {
    console.error('⚠️ HackerEarth ingestion failed:', res.error || res.status);
    return [];
  }

  const rawList = res.data.response;
  const items = [];

  for (const item of rawList) {
    if (!item.title) continue;

    const startDate = parseSafeIsoDate(item.start_utc_tz || item.start_tz) || new Date().toISOString();
    const endDate = parseSafeIsoDate(item.end_utc_tz || item.end_tz);
    const status = calculateEventStatus(startDate, endDate, null);

    items.push({
      title: item.title.trim(),
      organizer: item.is_hackerearth ? 'HackerEarth' : 'Enterprise Partner',
      description: item.description || `${item.title} competition on HackerEarth`,
      start_date: startDate,
      end_date: endDate,
      registration_deadline: endDate,
      location: 'Online',
      mode: 'online',
      prize: 'Cash Prizes & Job Opportunities',
      team_size: '1-3 Members',
      eligibility: 'Students & Working Professionals',
      registration_url: item.url || item.subscribe || 'https://www.hackerearth.com',
      image_url: item.thumbnail || null,
      status: status,
      source: 'hackerearth',
      external_id: String(item.url || item.title)
    });
  }

  return items;
}
