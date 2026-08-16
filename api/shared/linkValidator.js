import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Standard Link Status Types
 */
export const LINK_STATUS = {
  VALID: 'VALID',
  VALID_REDIRECT: 'VALID_REDIRECT',
  VALID_LOGIN_REQUIRED: 'VALID_LOGIN_REQUIRED',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  BROKEN: 'BROKEN',
  TIMEOUT: 'TIMEOUT',
  UNREACHABLE: 'UNREACHABLE',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Validates a registration URL by making an HTTP request, following redirects,
 * and checking content for registration intent and closed states.
 * 
 * @param {string} rawUrl - Target URL to validate
 * @param {number} maxRedirects - Maximum allowed redirect hops (default 5)
 * @param {number} timeoutMs - Timeout in ms (default 8000ms)
 * @returns {Promise<{ isValid: boolean, status: string, finalUrl: string, httpCode: number, error?: string }>}
 */
export async function validateRegistrationUrl(rawUrl, maxRedirects = 5, timeoutMs = 8000) {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { isValid: false, status: LINK_STATUS.UNKNOWN, finalUrl: null, httpCode: 0 };
  }

  let currentUrl = rawUrl.trim();
  if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
    currentUrl = `https://${currentUrl}`;
  }

  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    try {
      const parsed = new URL(currentUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const response = await new Promise((resolve) => {
        const req = client.request(
          currentUrl,
          {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 HackVerseBot/2.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: timeoutMs
          },
          (res) => {
            let sampleBody = '';
            res.on('data', (chunk) => {
              if (sampleBody.length < 2000) sampleBody += chunk.toString();
            });
            res.on('end', () => {
              resolve({
                statusCode: res.statusCode || 0,
                location: res.headers.location,
                sampleBody
              });
            });
          }
        );

        req.on('error', (err) => {
          resolve({ error: err.message, statusCode: 0 });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ error: 'Timeout', statusCode: 0 });
        });

        req.end();
      });

      if (response.error) {
        const isTimeout = response.error.toLowerCase().includes('timeout');
        return {
          isValid: false,
          status: isTimeout ? LINK_STATUS.TIMEOUT : LINK_STATUS.UNREACHABLE,
          finalUrl: currentUrl,
          httpCode: response.statusCode || 0,
          error: response.error
        };
      }

      const code = response.statusCode;

      // 1. Follow Redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(code) && response.location) {
        redirectsCount++;
        const nextUrl = new URL(response.location, currentUrl).href;
        currentUrl = nextUrl;
        continue;
      }

      // 2. Successful Destination (200 - 299)
      if (code >= 200 && code < 300) {
        const bodyLower = (response.sampleBody || '').toLowerCase();
        const urlLower = currentUrl.toLowerCase();

        // A. Obvious Dead / Not Found pages masked as 200
        if (
          bodyLower.includes('page not found') ||
          bodyLower.includes('404 not found') ||
          bodyLower.includes('event does not exist') ||
          bodyLower.includes('challenge not found') ||
          bodyLower.includes('hackathon not found')
        ) {
          return {
            isValid: false,
            status: LINK_STATUS.BROKEN,
            finalUrl: currentUrl,
            httpCode: 404
          };
        }

        // B. Closed / Expired indicators
        if (
          bodyLower.includes('applications closed') ||
          bodyLower.includes('registration closed') ||
          bodyLower.includes('submissions are closed') ||
          bodyLower.includes('deadline passed') ||
          bodyLower.includes('event ended') ||
          bodyLower.includes('no longer accepting applications') ||
          bodyLower.includes('registrations closed')
        ) {
          return {
            isValid: true,
            status: LINK_STATUS.REGISTRATION_CLOSED,
            finalUrl: currentUrl,
            httpCode: code
          };
        }

        // C. Check Login-Required Destinations
        if (
          urlLower.includes('/login') ||
          urlLower.includes('/signin') ||
          urlLower.includes('/auth') ||
          bodyLower.includes('sign in to apply') ||
          bodyLower.includes('login to register') ||
          bodyLower.includes('sign in to continue')
        ) {
          return {
            isValid: true,
            status: LINK_STATUS.VALID_LOGIN_REQUIRED,
            finalUrl: currentUrl,
            httpCode: code
          };
        }

        // D. Valid Destination
        return {
          isValid: true,
          status: redirectsCount > 0 ? LINK_STATUS.VALID_REDIRECT : LINK_STATUS.VALID,
          finalUrl: currentUrl,
          httpCode: code
        };
      }

      // 3. Client & Server Failures (404, 410, 500, 502, 503)
      if (code === 404 || code === 410) {
        return {
          isValid: false,
          status: LINK_STATUS.BROKEN,
          finalUrl: currentUrl,
          httpCode: code
        };
      }

      if (code >= 500) {
        return {
          isValid: false,
          status: LINK_STATUS.UNREACHABLE,
          finalUrl: currentUrl,
          httpCode: code
        };
      }

      // 4. Cloudflare / WAF Protected Endpoints (403, 406, 429) from verified domains
      if ([403, 406, 429].includes(code)) {
        return {
          isValid: true,
          status: LINK_STATUS.VALID,
          finalUrl: currentUrl,
          httpCode: code
        };
      }

      return {
        isValid: false,
        status: LINK_STATUS.UNKNOWN,
        finalUrl: currentUrl,
        httpCode: code
      };
    } catch (err) {
      return {
        isValid: false,
        status: LINK_STATUS.UNREACHABLE,
        finalUrl: currentUrl,
        httpCode: 0,
        error: err.message
      };
    }
  }

  return {
    isValid: false,
    status: LINK_STATUS.BROKEN,
    finalUrl: currentUrl,
    httpCode: 310,
    error: 'Too many redirects'
  };
}

/**
 * Validates URLs in batches with controlled concurrency
 */
export async function validateUrlsInBatches(items, concurrency = 10) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkPromises = chunk.map(async (item) => {
      const validation = await validateRegistrationUrl(item.registration_url);
      return {
        ...item,
        validation
      };
    });

    const chunkResults = await Promise.allSettled(chunkPromises);
    chunkResults.forEach((res) => {
      if (res.status === 'fulfilled') {
        results.push(res.value);
      }
    });
  }
  return results;
}
