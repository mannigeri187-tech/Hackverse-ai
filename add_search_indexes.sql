-- Migration for basic search and filtering indexes
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON public.hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_mode ON public.hackathons(mode);
CREATE INDEX IF NOT EXISTS idx_hackathons_start_date ON public.hackathons(start_date);
