-- PHASE 3: ADMIN CONFIGURATION SYSTEM

-- 1. Add is_admin to profiles if it doesn't exist
DO \\$\
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='is_admin'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
    END IF;
END
\\$\;

-- 2. Create feature_limits table
CREATE TABLE IF NOT EXISTS public.feature_limits (
    feature TEXT PRIMARY KEY,
    free_limit INT NOT NULL,
    pro_limit INT NOT NULL,
    premium_limit INT NOT NULL,
    type TEXT NOT NULL,
    window TEXT,
    table_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on feature_limits
ALTER TABLE public.feature_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access this table directly
-- No public policies! Frontend MUST go through /api/admin/limits

-- Insert initial values based on Phase 2 Audit
INSERT INTO public.feature_limits (feature, free_limit, pro_limit, premium_limit, type, window, table_name)
VALUES
    ('ai_generation', 10, 100, 1000, 'quota', '1 d', null),
    ('api_request', 30, 100, 300, 'rate', '1 m', null),
    ('resume_generation', 5, 50, 500, 'quota', '1 d', null),
    ('resume_download', 5, 50, 500, 'quota', '1 d', null),
    ('certificate_upload', 10, 50, 500, 'quota', '1 d', null),
    ('max_resumes', 2, 10, 100, 'resource', null, 'resumes'),
    ('max_projects', 3, 20, 100, 'resource', null, 'workspaces'),
    ('max_certificates', 5, 50, 100, 'resource', null, 'certificates'),
    ('max_skills', 15, 50, 100, 'resource', null, 'user_skills')
ON CONFLICT (feature) DO NOTHING;

