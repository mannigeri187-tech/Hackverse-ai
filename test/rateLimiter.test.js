import { applyRateLimit, resetRateLimit, getRateLimitConfig, getClientIp } from '../api/shared/rateLimiter.js';
import assert from 'assert';

async function runTests() {
  console.log('🧪 Starting Rate Limiter Comprehensive Test Suite...');

  // Mock Request and Response factories
  function createMockReq(ip = '192.168.1.100', headers = {}) {
    return {
      headers: {
        'x-forwarded-for': ip,
        ...headers
      },
      socket: { remoteAddress: ip }
    };
  }

  function createMockRes() {
    const headers = {};
    let statusCode = 200;
    let jsonBody = null;
    let ended = false;

    return {
      headers,
      setHeader(name, val) {
        headers[name.toLowerCase()] = val;
      },
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonBody = data;
        ended = true;
        return this;
      },
      end() {
        ended = true;
      },
      getStatusCode() { return statusCode; },
      getJson() { return jsonBody; },
      getHeaders() { return headers; },
      headersSent: false
    };
  }

  // TEST 1: Config loading with defaults
  console.log('\n[Test 1] Config loading');
  const config = getRateLimitConfig();
  assert.strictEqual(typeof config.AUTH_LIMIT, 'number');
  assert.strictEqual(typeof config.AI_LIMIT, 'number');
  assert.strictEqual(typeof config.PUBLIC_LIMIT, 'number');
  console.log('✅ Config loaded correctly:', config);

  // TEST 2: Client IP extraction
  console.log('\n[Test 2] Client IP extraction across multiple headers');
  const req1 = createMockReq('203.0.113.195, 70.41.3.18');
  assert.strictEqual(getClientIp(req1), '203.0.113.195');
  const req2 = { headers: { 'x-real-ip': '198.51.100.4' } };
  assert.strictEqual(getClientIp(req2), '198.51.100.4');
  const req3 = { headers: { 'cf-connecting-ip': '104.28.14.99' } };
  assert.strictEqual(getClientIp(req3), '104.28.14.99');
  console.log('✅ Client IP extracted accurately across proxy & CDN headers');

  // TEST 3: Public Rate Limiting (Single IP limit enforcement)
  console.log('\n[Test 3] Public Tier rate limit & 429 response');
  const testIpPublic = '10.0.0.1';
  let allowedCount = 0;
  let rejectedCount = 0;

  for (let i = 0; i < 35; i++) {
    const req = createMockReq(testIpPublic);
    const res = createMockRes();
    const allowed = await applyRateLimit(req, res, { type: 'PUBLIC', customLimit: 10, customWindow: 60 });
    if (allowed) {
      allowedCount++;
    } else {
      rejectedCount++;
      assert.strictEqual(res.getStatusCode(), 429);
      assert.strictEqual(res.getJson().error, 'Too many requests. Please try again later.');
      assert.ok(res.getHeaders()['retry-after'] > 0);
      assert.ok(res.getHeaders()['x-ratelimit-limit'] === 10);
    }
  }

  assert.strictEqual(allowedCount, 10);
  assert.strictEqual(rejectedCount, 25);
  console.log(`✅ Public rate limit enforced: ${allowedCount} allowed, ${rejectedCount} rejected with HTTP 429 and Retry-After`);

  // TEST 4: User Isolation (User A vs User B)
  console.log('\n[Test 4] User Isolation - different users on same shared IP');
  const sharedIp = '10.0.0.2';
  const user1 = 'user_uuid_11111';
  const user2 = 'user_uuid_22222';

  // User 1 hits AI limit (customLimit: 3)
  for (let i = 0; i < 3; i++) {
    const req = createMockReq(sharedIp);
    const res = createMockRes();
    const allowed = await applyRateLimit(req, res, { type: 'AI', identifier: user1, customLimit: 3, customWindow: 60 });
    assert.strictEqual(allowed, true);
  }

  // 4th request from User 1 should be blocked
  const resU1Blocked = createMockRes();
  const allowedU1Blocked = await applyRateLimit(createMockReq(sharedIp), resU1Blocked, { type: 'AI', identifier: user1, customLimit: 3, customWindow: 60 });
  assert.strictEqual(allowedU1Blocked, false);
  assert.strictEqual(resU1Blocked.getStatusCode(), 429);

  // But User 2 on the same IP must still be ALLOWED
  const resU2 = createMockRes();
  const allowedU2 = await applyRateLimit(createMockReq(sharedIp), resU2, { type: 'AI', identifier: user2, customLimit: 3, customWindow: 60 });
  assert.strictEqual(allowedU2, true);
  console.log('✅ User isolation verified: User 1 was rate limited while User 2 remained unrestricted');

  // TEST 5: IP Isolation (Different IPs do not combine)
  console.log('\n[Test 5] IP Isolation - IP A vs IP B');
  const ipA = '172.16.0.1';
  const ipB = '172.16.0.2';

  for (let i = 0; i < 5; i++) {
    const req = createMockReq(ipA);
    const res = createMockRes();
    assert.strictEqual(await applyRateLimit(req, res, { type: 'PUBLIC', customLimit: 5, customWindow: 60 }), true);
  }
  // 6th from IP A blocked
  assert.strictEqual(await applyRateLimit(createMockReq(ipA), createMockRes(), { type: 'PUBLIC', customLimit: 5, customWindow: 60 }), false);

  // IP B should be clean
  assert.strictEqual(await applyRateLimit(createMockReq(ipB), createMockRes(), { type: 'PUBLIC', customLimit: 5, customWindow: 60 }), true);
  console.log('✅ Different IPs isolated independently');

  // TEST 6: Strict Auth Rate Limiting, Progressive Backoff & Reset
  console.log('\n[Test 6] Strict Auth Rate Limiting & Progressive Backoff');
  const authIp = '10.0.0.3';
  const authEmail = 'student@example.com';

  // 5 attempts allowed for Auth
  for (let i = 0; i < 5; i++) {
    const req = createMockReq(authIp);
    const res = createMockRes();
    const allowed = await applyRateLimit(req, res, { type: 'AUTH', identifier: authEmail, customLimit: 5, customWindow: 60 });
    assert.strictEqual(allowed, true);
  }

  // 1st violation -> 30s penalty
  const resAuth1 = createMockRes();
  assert.strictEqual(await applyRateLimit(createMockReq(authIp), resAuth1, { type: 'AUTH', identifier: authEmail, customLimit: 5, customWindow: 60 }), false);
  assert.strictEqual(resAuth1.getStatusCode(), 429);
  assert.strictEqual(resAuth1.getJson().error, 'Too many requests. Please try again later.');
  assert.ok(resAuth1.getHeaders()['retry-after'] >= 25);

  // 2nd repeated violation -> 60s progressive penalty
  const resAuth2 = createMockRes();
  assert.strictEqual(await applyRateLimit(createMockReq(authIp), resAuth2, { type: 'AUTH', identifier: authEmail, customLimit: 5, customWindow: 60 }), false);
  assert.ok(resAuth2.getHeaders()['retry-after'] >= 50);

  // Successful login clears identifier penalty
  await resetRateLimit('auth', authEmail);
  const resAfterReset = createMockRes();
  const allowedAfterReset = await applyRateLimit(createMockReq('10.0.0.4'), resAfterReset, { type: 'AUTH', identifier: authEmail, customLimit: 5, customWindow: 60 });
  assert.strictEqual(allowedAfterReset, true);
  console.log('✅ Auth dual IP + Email tracking, progressive backoff, and reset verified');

  console.log('\n🎉 ALL 6 COMPREHENSIVE RATE LIMITER TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
