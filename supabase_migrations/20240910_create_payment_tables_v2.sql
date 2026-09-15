-- supabase_migrations/20240910_create_payment_tables_v2.sql
-- Migration to create payment related tables and race‑condition protection

-- Table: public.subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT UNIQUE,
  razorpay_plan_id TEXT,
  status TEXT NOT NULL,
  tier TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Partial unique index to prevent multiple active/pending subscriptions per user
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_blocking_idx
ON public.subscriptions (user_id)
WHERE status IN (
  'created',
  'authenticated',
  'active',
  'pending',
  'halted',
  'completed'
);

-- Table: public.payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  razorpay_payment_id TEXT UNIQUE,
  amount BIGINT,
  currency TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- Table: public.webhook_events
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  received_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Index for webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON public.webhook_events(event_type);
