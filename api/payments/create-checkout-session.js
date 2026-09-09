import { authenticateServerRequest, getSupabaseServerClient } from '../_shared/supabase.js';
import Stripe from 'stripe';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://hackverse-ai.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  // 1. Authenticate user strictly from server token
  const { user, error: authError } = await authenticateServerRequest(req);
  if (authError || !user || !user.id) {
    return res.status(401).json({ error: 'Unauthorized user session.' });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  const frontendUrl = process.env.FRONTEND_URL || 'https://hackverse-ai.vercel.app';

  if (!stripeSecret || !priceId) {
    console.error('SERVER ERROR: Missing required Stripe environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2023-10-16', // Modern safe API version
  });
  
  const supabase = getSupabaseServerClient();
  const userId = user.id;
  const userEmail = user.email || ''; 

  try {
    // 2. Resolve Stripe Customer Mapping
    let stripeCustomerId = null;
    
    // Look up existing mapping securely
    const { data: existingMapping, error: mappingError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (mappingError && mappingError.code !== 'PGRST116') {
      console.error('Database error looking up Stripe mapping:', mappingError);
      return res.status(500).json({ error: 'Failed to retrieve customer mapping.' });
    }

    if (existingMapping?.stripe_customer_id) {
      stripeCustomerId = existingMapping.stripe_customer_id;
    } else {
      // Create new Stripe Customer and map it
      const customerParams = { metadata: { user_id: userId } };
      if (userEmail) customerParams.email = userEmail;
      
      const idempotencyKey = `customer_create_${userId}`;
      const newCustomer = await stripe.customers.create(customerParams, { idempotencyKey });
      stripeCustomerId = newCustomer.id;

      const { error: insertError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
        });

      if (insertError) {
        // Race condition: another request created it. Safely fetch the winner.
        if (insertError.code === '23505') {
          const { data: concurrentMapping } = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single();
          
          if (concurrentMapping?.stripe_customer_id) {
            stripeCustomerId = concurrentMapping.stripe_customer_id;
          } else {
            console.error('Race condition conflict resolution failed.');
            return res.status(500).json({ error: 'Database conflict resolution failed.' });
          }
        } else {
          console.error('Database error inserting Stripe mapping:', insertError);
          return res.status(500).json({ error: 'Failed to persist customer mapping.' });
        }
      }
    }

    // 3. Prevent inappropriate duplicate subscriptions (e.g. already active)
    const { data: activeSubs, error: subsError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing']);
      
    if (subsError) {
      console.error('Error verifying existing subscriptions:', subsError);
      return res.status(500).json({ error: 'Failed to verify existing subscription status.' });
    }

    if (activeSubs && activeSubs.length > 0) {
      return res.status(409).json({ error: 'You already have an active subscription.' });
    }

    // 4. Create Stripe Checkout Session securely
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing`,
      metadata: {
        user_id: userId,
      }
    });

    // 5. Return safe URL
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout error:', error.message);
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}

