import { createHmac } from 'crypto';
import { authenticateServerRequest, getSupabaseServerClient } from '../_shared/supabase.js';
import { PLANS } from '../_shared/usageConfig.js';

export default async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────────────────────────
  const origin = process.env.FRONTEND_URL || 'https://hackverse-ai.vercel.app';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers',
    'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  // ── Authentication ────────────────────────────────────────────────────────
  const { user, error: authError } = await authenticateServerRequest(req);
  if (authError || !user || !user.id) {
    return res.status(401).json({ error: 'Unauthorized user session.' });
  }

  // ── Env validation ────────────────────────────────────────────────────────
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('SERVER ERROR: Missing RAZORPAY_KEY_SECRET.');
    return res.status(500).json({ error: 'Payment configuration error.' });
  }

  // ── Validate required fields from client ──────────────────────────────────
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required payment verification fields.' });
  }

  // ── Signature verification (HMAC-SHA256) ──────────────────────────────────
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.error(`Signature mismatch for order ${razorpay_order_id}. Possible tamper attempt.`);
    return res.status(400).json({ error: 'Payment signature verification failed.' });
  }

  // ── Signature valid — activate PRO via backend service role ──────────────
  try {
    const supabase = getSupabaseServerClient();
    const now = new Date();
    // Pro subscription period: 30 days from now
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Upsert subscription record keyed on razorpay_order_id (acting as subscription ID)
    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id:              user.id,
        stripe_customer_id:   `rzp_customer_${user.id}`,   // placeholder mapping field
        stripe_subscription_id: razorpay_order_id,          // reusing column for order ID until schema migration
        status:               'active',
        price_id:             `razorpay_pro_${process.env.RAZORPAY_KEY_ID || 'live'}`,
        current_period_start: now.toISOString(),
        current_period_end:   periodEnd.toISOString(),
        cancel_at_period_end: false,
        stripe_event_created: Math.floor(now.getTime() / 1000)
      }, {
        onConflict: 'stripe_subscription_id'
      });

    if (upsertError) {
      console.error('Subscription upsert error:', upsertError.message);
      return res.status(500).json({ error: 'Failed to record subscription.' });
    }

    // Update profile.subscription_tier to PRO
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ subscription_tier: PLANS.PRO })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError.message);
      return res.status(500).json({ error: 'Failed to activate Pro plan.' });
    }

    console.log(`Pro activated for user ${user.id} via order ${razorpay_order_id}`);
    return res.status(200).json({ success: true, plan: PLANS.PRO });

  } catch (err) {
    console.error('Verification handler error:', err.message);
    return res.status(500).json({ error: 'Internal error during payment verification.' });
  }
}
