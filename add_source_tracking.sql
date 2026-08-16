-- Migration to add source tracking to hackathons table
ALTER TABLE public.hackathons 
ADD COLUMN source text,
ADD COLUMN external_id text;

-- Create a unique constraint to guarantee no duplicate records are ever created
ALTER TABLE public.hackathons 
ADD CONSTRAINT unique_source_external_id UNIQUE (source, external_id);
