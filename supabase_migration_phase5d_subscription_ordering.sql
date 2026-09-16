-- ==============================================================================
-- PHASE 5D: SUBSCRIPTION EVENT ORDERING
-- Purpose: Protect database from out-of-order Stripe webhook events.
-- Mechanism: Adds a stripe_event_created column tracking the Stripe timestamp.
--            A BEFORE UPDATE trigger drops any updates where the incoming event
--            is older than the currently stored event.
-- ==============================================================================

-- 1. Add ordering column
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_event_created INTEGER DEFAULT 0;

-- 2. Create trigger function to silently ignore older events
CREATE OR REPLACE FUNCTION public.protect_out_of_order_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
    -- If the incoming stripe_event_created is strictly older than what is
    -- already in the database, reject the overwrite by returning the OLD row.
    -- This makes the UPDATE a no-op, preserving the newer state seamlessly.
    IF NEW.stripe_event_created < OLD.stripe_event_created THEN
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger
DROP TRIGGER IF EXISTS trigger_prevent_stale_subscription_updates ON public.subscriptions;
CREATE TRIGGER trigger_prevent_stale_subscription_updates
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_out_of_order_subscriptions();

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
