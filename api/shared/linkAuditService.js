import { supabase } from './supabase.js';
import { validateUrlsInBatches, LINK_STATUS } from './linkValidator.js';
import { clearSearchCache } from './redis.js';

/**
 * Validates and repairs registration URLs of existing database records
 */
export async function runDatabaseLinkValidation() {
  const startTime = Date.now();
  console.log('🔍 Starting HackVerse AI Hackathon Link Validation Audit...');

  const { data: hackathons, error } = await supabase
    .from('hackathons')
    .select('id, title, registration_url, status, location');

  if (error || !hackathons) {
    throw error || new Error('Failed to query hackathons table');
  }

  console.log(`📋 Auditing ${hackathons.length} hackathon registration links...`);

  let validCount = 0;
  let validRedirectCount = 0;
  let loginRequiredCount = 0;
  let brokenCount = 0;
  let closedCount = 0;
  let timeoutCount = 0;
  let unreachableCount = 0;
  let nulledCount = 0;
  let repairedCount = 0;

  // Validate in batches of 10 concurrently
  const validatedItems = await validateUrlsInBatches(hackathons, 10);

  for (const item of validatedItems) {
    const { validation } = item;

    if (!item.registration_url) {
      nulledCount++;
      continue;
    }

    const currentLinkStatus = validation.status;

    if (currentLinkStatus === LINK_STATUS.VALID) {
      validCount++;
    } else if (currentLinkStatus === LINK_STATUS.VALID_REDIRECT) {
      validRedirectCount++;
      repairedCount++;
      // Update with final destination URL
      await supabase
        .from('hackathons')
        .update({ registration_url: validation.finalUrl })
        .eq('id', item.id);

    } else if (currentLinkStatus === LINK_STATUS.VALID_LOGIN_REQUIRED) {
      loginRequiredCount++;
    } else if (currentLinkStatus === LINK_STATUS.REGISTRATION_CLOSED) {
      closedCount++;
      await supabase
        .from('hackathons')
        .update({ status: 'completed' })
        .eq('id', item.id);

    } else if (currentLinkStatus === LINK_STATUS.BROKEN) {
      brokenCount++;
      nulledCount++;
      // Set to null when permanently broken
      await supabase
        .from('hackathons')
        .update({ registration_url: null })
        .eq('id', item.id);

    } else if (currentLinkStatus === LINK_STATUS.TIMEOUT) {
      timeoutCount++;
    } else if (currentLinkStatus === LINK_STATUS.UNREACHABLE) {
      unreachableCount++;
    }
  }

  // Invalidate caches
  await clearSearchCache();

  const durationMs = Date.now() - startTime;
  console.log(`✅ Link Audit Complete in ${durationMs}ms: Checked=${hackathons.length}, Valid=${validCount}, Redirects=${validRedirectCount}, LoginReq=${loginRequiredCount}, Broken=${brokenCount}, Closed=${closedCount}, Repaired=${repairedCount}, Nulled=${nulledCount}`);

  return {
    success: true,
    totalChecked: hackathons.length,
    validCount,
    validRedirectCount,
    loginRequiredCount,
    brokenCount,
    closedCount,
    timeoutCount,
    unreachableCount,
    repairedCount,
    nulledCount,
    durationMs
  };
}
