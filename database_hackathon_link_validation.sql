-- Migration to track registration link health & validation metadata
ALTER TABLE public.hackathons 
ADD COLUMN IF NOT EXISTS registration_url_status text DEFAULT 'valid',
ADD COLUMN IF NOT EXISTS last_registration_check timestamp with time zone,
ADD COLUMN IF NOT EXISTS registration_final_url text;

-- Index for filtering out broken registration links or querying valid events
CREATE INDEX IF NOT EXISTS idx_hackathons_reg_status ON public.hackathons(registration_url_status);
