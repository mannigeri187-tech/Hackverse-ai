import { supabase } from './supabase.js';
import { 
  fetchUnstopHackathons, 
  fetchDevfolioHackathons, 
  fetchHackerEarthHackathons 
} from './hackathonFetchers.js';
import { validateUrlsInBatches, LINK_STATUS } from './linkValidator.js';
import { clearSearchCache } from './redis.js';

function normalizeTitleForDeduplication(title = '') {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Executes full idempotent hackathon ingestion pipeline with registration link validation
 */
export async function runHackathonIngestion() {
  const startTime = Date.now();
  console.log('🚀 Starting HackVerse AI Real Hackathon Ingestion Pipeline...');

  // 1. Fetch from all verified public sources concurrently
  const [unstopResults, devfolioResults, hackerEarthResults] = await Promise.allSettled([
    fetchUnstopHackathons(),
    fetchDevfolioHackathons(),
    fetchHackerEarthHackathons()
  ]);

  const rawUnstop = unstopResults.status === 'fulfilled' ? unstopResults.value : [];
  const rawDevfolio = devfolioResults.status === 'fulfilled' ? devfolioResults.value : [];
  const rawHackerEarth = hackerEarthResults.status === 'fulfilled' ? hackerEarthResults.value : [];

  const totalFetched = rawUnstop.length + rawDevfolio.length + rawHackerEarth.length;
  console.log(`📥 Total records collected from sources: ${totalFetched} (Unstop: ${rawUnstop.length}, Devfolio: ${rawDevfolio.length}, HackerEarth: ${rawHackerEarth.length})`);

  const combined = [...rawUnstop, ...rawDevfolio, ...rawHackerEarth];

  // 2. Fetch existing records from Supabase to prevent duplicates
  const { data: existingDbRecords } = await supabase
    .from('hackathons')
    .select('id, title, registration_url, location');

  const seenTitles = new Set();
  const seenUrls = new Set();

  (existingDbRecords || []).forEach(record => {
    if (record.title) seenTitles.add(normalizeTitleForDeduplication(record.title));
    if (record.registration_url) seenUrls.add(record.registration_url.toLowerCase().trim());
  });

  const candidates = [];
  let duplicatesCount = 0;
  let rejectedCount = 0;

  // 3. Deduplicate
  for (const item of combined) {
    if (!item.title || item.title.length < 3) {
      rejectedCount++;
      continue;
    }

    const normTitle = normalizeTitleForDeduplication(item.title);
    const normUrl = item.registration_url ? item.registration_url.toLowerCase().trim() : '';

    if (seenTitles.has(normTitle) || (normUrl && seenUrls.has(normUrl))) {
      duplicatesCount++;
      continue;
    }

    seenTitles.add(normTitle);
    if (normUrl) seenUrls.add(normUrl);

    candidates.push(item);
  }

  // 4. Validate Registration URLs before inserting into database
  const validatedCandidates = await validateUrlsInBatches(candidates, 10);
  const validRecordsToUpsert = [];

  for (const item of validatedCandidates) {
    const isBroken = item.validation?.status === LINK_STATUS.BROKEN;
    const finalRegUrl = isBroken ? null : (item.validation?.finalUrl || item.registration_url);

    const eventStatus = item.validation?.status === LINK_STATUS.REGISTRATION_CLOSED
      ? 'completed'
      : (item.status || 'upcoming');

    validRecordsToUpsert.push({
      title: item.title,
      organizer: item.organizer || 'Hackathon Host',
      description: item.description || item.title,
      start_date: item.start_date,
      end_date: item.end_date,
      registration_deadline: item.registration_deadline,
      location: item.location || 'Online',
      mode: item.mode || 'online',
      prize: item.prize || 'Awards',
      team_size: item.team_size || '1-4',
      eligibility: item.eligibility || 'Open',
      registration_url: finalRegUrl,
      image_url: item.image_url,
      status: eventStatus
    });
  }

  // 5. Batch Upsert to Supabase
  let insertedCount = 0;
  if (validRecordsToUpsert.length > 0) {
    const BATCH_SIZE = 20;
    for (let i = 0; i < validRecordsToUpsert.length; i += BATCH_SIZE) {
      const batch = validRecordsToUpsert.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from('hackathons')
        .insert(batch)
        .select('id');

      if (error) {
        console.error('⚠️ Supabase insert batch error:', error.message);
      } else {
        insertedCount += (data ? data.length : batch.length);
      }
    }
  }

  // 5.5 Delete expired hackathons
  try {
    const nowIso = new Date().toISOString();
    const { error: deleteError } = await supabase
      .from('hackathons')
      .delete()
      .lt('end_date', nowIso);
    if (deleteError) console.error('Error deleting expired hackathons:', deleteError.message);
    else console.log('Deleted expired hackathons successfully.');
  } catch(err) {
    console.error('Failed to cleanup expired hackathons', err);
  }

  // 6. Invalidate Search Cache in Redis and L1 RAM
  await clearSearchCache();

  // 7. Regional Count Calculation
  const { data: allHackathons } = await supabase
    .from('hackathons')
    .select('id, title, location, mode, registration_url');

  let indiaCount = 0;
  let karnatakaCount = 0;
  let bengaluruCount = 0;

  (allHackathons || []).forEach(h => {
    const loc = String(h.location || '').toLowerCase();
    if (loc.includes('india') || loc.includes('karnataka') || loc.includes('bengaluru') || loc.includes('bangalore')) {
      indiaCount++;
    }
    if (loc.includes('karnataka') || loc.includes('bengaluru') || loc.includes('bangalore')) {
      karnatakaCount++;
    }
    if (loc.includes('bengaluru') || loc.includes('bangalore')) {
      bengaluruCount++;
    }
  });

  const durationMs = Date.now() - startTime;
  console.log(`✅ Ingestion completed in ${durationMs}ms: Imported=${insertedCount}, DuplicatesSkipped=${duplicatesCount}, Rejected=${rejectedCount}`);

  return {
    success: true,
    totalFetched,
    importedCount: insertedCount,
    duplicatesSkipped: duplicatesCount,
    rejectedCount: rejectedCount,
    totalInDb: allHackathons?.length || 0,
    regionalCounts: {
      india: indiaCount,
      karnataka: karnatakaCount,
      bengaluru: bengaluruCount
    },
    sources: {
      unstop: rawUnstop.length,
      devfolio: rawDevfolio.length,
      hackerearth: rawHackerEarth.length
    },
    durationMs
  };
}
