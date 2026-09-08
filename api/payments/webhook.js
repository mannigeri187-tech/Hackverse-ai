import Stripe from 'stripe';
import { getSupabaseServerClient } from '../_shared/supabase.js';
import { PLANS } from '../_shared/usageConfig.js';

// Disable Vercel's default body parser to preserve the raw request body
// This is STRICTLY REQUIRED for Stripe webhook signature verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

const getRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!stripeSecret || !webhookSecret || !proPriceId) {
    console.error('SERVER ERROR: Missing Stripe webhook/price configuration.');
    return res.status(500).json({ error: 'Webhook configuration error' });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2023-10-16', // Modern safe API version
  });

  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event;
  try {
    // 1. Read the exact raw HTTP request body
    const rawBody = await getRawBody(req);
    
    // 2. Use Stripe's official SDK to securely verify the signature
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    // Return generic error without exposing the internal crypto/exception details
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  // 3. Log minimal safe metadata for diagnostics
  console.log(`Verified webhook event received: ${event.id} [${event.type}]`);

  // ==============================================================================
  // PHASE 3C.2 & 3C.3 SUBSCRIPTION SYNCHRONIZATION AND PRO ENTITLEMENT
  // ==============================================================================
  const supportedEvents = [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  ];

  if (supportedEvents.includes(event.type)) {
    const subscription = event.data.object;
    const stripeCustomerId = subscription.customer;
    const stripeSubscriptionId = subscription.id;
    const status = subscription.status;
    
    // Extract primary recurring price ID from the first item safely
    const priceId = subscription.items?.data?.[0]?.price?.id;
    
    // Stripe timestamps are seconds since epoch; convert to ISO strings for Postgres
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    const supabase = getSupabaseServerClient();

    try {
      // Step A: Resolve HackVerse user from authoritative Stripe Customer mapping
      const { data: mapping, error: mappingError } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

      if (mappingError || !mapping?.user_id) {
        console.log(`Webhook Event ${event.id}: Unknown Stripe customer ${stripeCustomerId}. Ignoring safely.`);
        // Acknowledge with 200 so Stripe does not endlessly retry an unmappable event.
        return res.status(200).json({ received: true, ignored: 'unmapped_customer' });
      }

      const userId = mapping.user_id;

      // Step B: Synchronize public.subscriptions securely (idempotent upsert)
      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          status: status,
          price_id: priceId,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
          stripe_event_created: event.created
        }, {
          onConflict: 'stripe_subscription_id'
        });

      if (upsertError) {
        console.error(`Webhook Event ${event.id}: Database upsert error for sub ${stripeSubscriptionId}:`, upsertError.message);
        // Return 500 to allow Stripe to retry if it's a transient database failure or race condition conflict
        return res.status(500).json({ error: 'Database synchronization failed' });
      }

      // Step C: Entitlement Recalculation (Phase 3C.3)
      // Fetch all synchronized subscriptions for this user to evaluate safely.
      const { data: userSubs, error: subsError } = await supabase
        .from('subscriptions')
        .select('status, price_id, current_period_end')
        .eq('user_id', userId);
        
      if (subsError) {
        console.error(`Webhook Event ${event.id}: Failed to fetch user subscriptions for entitlement:`, subsError.message);
        return res.status(500).json({ error: 'Failed to evaluate entitlement' });
      }

      const now = new Date();
      let hasQualifyingPro = false;
      
      for (const sub of (userSubs || [])) {
        if (sub.price_id !== proPriceId) continue; // Must match server-configured Pro price ID
        
        const periodEnd = new Date(sub.current_period_end);
        
        if (sub.status === 'active' || sub.status === 'trialing') {
          hasQualifyingPro = true;
          break;
        } else if ((sub.status === 'past_due' || sub.status === 'canceled') && periodEnd > now) {
          // Temporarily retain Pro access until the period actually expires
          hasQualifyingPro = true;
          break;
        }
        // 'unpaid', 'incomplete', 'incomplete_expired', or expired periods fall through
      }
      
      const newTier = hasQualifyingPro ? PLANS.PRO : PLANS.FREE;
      
      // Apply strictly to profiles.subscription_tier using backend service role
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ subscription_tier: newTier })
        .eq('user_id', userId);
        
      if (profileUpdateError) {
        console.error(`Webhook Event ${event.id}: Profile update failed for user ${userId}:`, profileUpdateError.message);
        return res.status(500).json({ error: 'Failed to update user entitlement' });
      }

    } catch (dbError) {
      console.error(`Webhook Event ${event.id}: Internal synchronization error:`, dbError.message);
      return res.status(500).json({ error: 'Internal synchronization error' });
    }
  }

  // 4. Safely acknowledge the verified event
  return res.status(200).json({ received: true });
}

