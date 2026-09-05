export function normalizeUrl(rawUrl, baseUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let trimmed = rawUrl.trim();
  if (trimmed === '') return null;

  // Fix known malformed patterns like https://unstop.com/https://...
  const doubleProtocolMatch = trimmed.match(/^https?:\/\/[^/]+\/(https?:\/\/.+)$/i);
  if (doubleProtocolMatch) {
    trimmed = doubleProtocolMatch[1];
  }

  // Handle protocol-relative URLs
  if (trimmed.startsWith('//')) {
    trimmed = 'https:' + trimmed;
  }

  try {
    // If it's already an absolute URL, this will succeed
    const parsed = new URL(trimmed);
    return parsed.href;
  } catch (e) {
    // It's a relative URL, resolve it against baseUrl
    try {
      if (!baseUrl) return trimmed; // Can't resolve without base
      const parsedBase = new URL(baseUrl);
      const parsed = new URL(trimmed, parsedBase.href);
      return parsed.href;
    } catch (err) {
      return null;
    }
  }
}

export function normalizeRegistrationUrl(rawUrl, source) {
  let baseUrl = 'https://unstop.com';
  if (source === 'devfolio') baseUrl = 'https://devfolio.co';
  if (source === 'hackerearth') baseUrl = 'https://www.hackerearth.com';

  return normalizeUrl(rawUrl, baseUrl);
}

export function normalizeImageUrl(rawUrl, source) {
  let baseUrl = 'https://unstop.com';
  if (source === 'devfolio') baseUrl = 'https://devfolio.co';
  if (source === 'hackerearth') baseUrl = 'https://www.hackerearth.com';

  return normalizeUrl(rawUrl, baseUrl);
}
