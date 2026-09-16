-- ==============================================================================
-- PHASE 5C: SUBSCRIPTION TIER PROTECTION
-- Purpose: Prevent authenticated clients from spoofing their own subscription_tier.
-- Mechanism: A BEFORE UPDATE trigger that silently reverts client mutations to 
--            subscription_tier, while allowing the service_role to update it.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.protect_subscription_tier()
RETURNS TRIGGER AS $$
DECLARE
    active_role text;
BEGIN
    -- Retrieve the active role. Supabase REST API sets this to 'authenticated' or 'anon' for clients,
    -- and 'service_role' for backend requests using the service role key.
    active_role := current_setting('role', true);
    
    -- If a normal client attempts to modify the row, enforce the server-controlled value
    IF active_role IN ('authenticated', 'anon') THEN
        -- Revert the subscription_tier to its existing state.
        -- We use a silent revert rather than RAISE EXCEPTION so that legitimate profile updates 
        -- (e.g. updating 'name' or 'bio') don't crash if the frontend inadvertently includes 
        -- the existing tier in the payload.
        IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
            NEW.subscription_tier = OLD.subscription_tier;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS enforce_subscription_tier_protection ON public.profiles;
CREATE TRIGGER enforce_subscription_tier_protection
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_subscription_tier();

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
