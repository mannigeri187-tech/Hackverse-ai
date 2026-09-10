import Razorpay from 'razorpay';
import { authenticateServerRequest, getSupabaseServerClient } from '../_shared/supabase.js';

// PRO plan amount in paise (₹499 = 49900 paise)
const PRO_AMOUNT_PAISE = 49900;
const CURRENCY = 'INR';

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
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('SERVER ERROR: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.');
    return res.status(500).json({ error: 'Payment configuration error.' });
  }

  // ── Guard: prevent duplicate active subscriptions ─────────────────────────
  try {
    const supabase = getSupabaseServerClient();
    const { data: activeSubs, error: subsError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing']);

    if (subsError) {
      console.error('Error verifying existing subscriptions:', subsError);
      return res.status(500).json({ error: 'Failed to verify existing subscription status.' });
    }

    if (activeSubs && activeSubs.length > 0) {
      return res.status(409).json({ error: 'You already have an active subscription.' });
    }
  } catch (dbErr) {
    console.error('Database check error:', dbErr.message);
    return res.status(500).json({ error: 'Failed to verify subscription status.' });
  }

  // ── Create Razorpay order ─────────────────────────────────────────────────
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const receipt = `hackverse_pro_${user.id.replace(/-/g, '').slice(0, 20)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount:   PRO_AMOUNT_PAISE,
      currency: CURRENCY,
      receipt,
      notes: {
        user_id:  user.id,
        plan:     'pro',
        product:  'HackVerse Pro'
      }
    });

    // Return ONLY the safe fields needed by the frontend
    return res.status(200).json({
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency
    });

  } catch (err) {
    // Log internally, never expose Razorpay internals to client
    console.error('Razorpay order creation error:', err.message);
    return res.status(500).json({ error: 'Failed to create payment order.' });
  }
}
