-- ==============================================================================
-- PHASE 5: SUBSCRIPTIONS DATABASE SCHEMA
-- Purpose: Minimum production-ready schema for Stripe subscription lifecycle.
-- Note: This does NOT replace profiles.subscription_tier or feature_limits.
--       It is safely designed to support backend webhook state updates only.
-- ==============================================================================

-- 1. Create the subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    
    -- Stripe specific identifiers
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    
    -- Plan details mapped from Stripe
    status TEXT NOT NULL CHECK (
        status IN (
            'active',
            'trialing',
            'past_due',
            'canceled',
            'unpaid',
            'incomplete',
            'incomplete_expired'
        )
    ),
    price_id TEXT NOT NULL,
    
    -- Billing period timestamps (UTC)
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Policy: Users can only READ their own subscription records
-- Client applications MUST NOT be allowed to INSERT, UPDATE, or DELETE.
-- All modifications must occur via secure backend webhooks using Service Role.
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions" 
    ON public.subscriptions 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 4. Indexes for performance and lookup safety
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Prevent multiple active/trialing subscriptions for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_trialing_user 
    ON public.subscriptions(user_id) 
    WHERE status IN ('active', 'trialing');

-- 5. Trigger for updated_at timestamp (re-using standard convention if function exists, else manual trigger)
-- Creating a dedicated trigger function for subscriptions updated_at
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
