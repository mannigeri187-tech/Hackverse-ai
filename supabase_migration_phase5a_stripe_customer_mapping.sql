-- ==============================================================================
-- PHASE 5A: STRIPE CUSTOMER MAPPING
-- Purpose: Dedicated mapping between HackVerse profiles and Stripe Customers.
-- Security: Completely backend-controlled. No client access.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- CRITICAL SECURITY REQUIREMENT:
-- NO SELECT, NO INSERT, NO UPDATE, NO DELETE policies are created.
-- This ensures the authenticated client cannot spoof, read, or alter the mapping.
-- All interactions with this table MUST occur via trusted backend Service Role operations.

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_stripe_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stripe_customers_updated_at ON public.stripe_customers;
CREATE TRIGGER trigger_update_stripe_customers_updated_at
    BEFORE UPDATE ON public.stripe_customers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_stripe_customers_updated_at();

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
