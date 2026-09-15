import { supabase } from '../db';
import { getRazorpayClient } from './razorpayClient';

interface SubscriptionRecord {
  id: string;
  user_id: string;
  razorpay_subscription_id: string;
  razorpay_plan_id: string;
  status: string;
  tier: string;
  created_at?: string;
  updated_at?: string;
}

const BLOCKING_STATUSES = [
  'created',
  'authenticated',
  'active',
  'pending',
  'halted',
  'completed',
];

export async function createSubscription(userId: string) {
  if (!userId) {
    throw { status: 400, message: 'User ID missing' } as any;
  }
  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) {
    throw { status: 500, message: 'RAZORPAY_PLAN_ID not configured' } as any;
  }

  // 1. Check existing subscriptions for this user
  const { data: existing, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId);
  if (fetchErr) {
    throw { status: 500, message: 'Database error while fetching subscriptions', details: fetchErr.message } as any;
  }
  if (existing && existing.length > 0) {
    const blocking = existing.find((s: any) => BLOCKING_STATUSES.includes(s.status));
    if (blocking) {
      return { existing: true, subscription: blocking, razorpayKeyId: process.env.RAZORPAY_KEY_ID };
    }
  }

  // 2. Create Razorpay subscription
  const razorpay = getRazorpayClient();
  let razorpaySub: any;
  try {
    razorpaySub = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12,
      notify_customer: true,
    });
  } catch (e: any) {
    const msg = e?.message || 'Razorpay API error';
    throw { status: 502, message: msg } as any;
  }

  // 3. Insert into Supabase
  const { data: inserted, error: insertErr } = await supabase.from('subscriptions').insert([
    {
      user_id: userId,
      razorpay_subscription_id: razorpaySub.id,
      razorpay_plan_id: planId,
      status: razorpaySub.status || 'created',
      tier: 'premium',
    },
  ]).select();

  if (insertErr) {
    throw { status: 500, message: 'Database error while inserting subscription', details: insertErr.message } as any;
  }

  const subRecord = Array.isArray(inserted) ? inserted[0] : inserted;
  return { existing: false, subscription: subRecord, razorpayKeyId: process.env.RAZORPAY_KEY_ID };
}
