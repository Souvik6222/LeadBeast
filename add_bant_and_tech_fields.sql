-- Migration: Add BANT, Tech Stack, Socials, Ratings, Reviews

-- 1. Modify `leads` table to add BANT score and source rating
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS bant_score NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1),
ADD COLUMN IF NOT EXISTS review_count INTEGER;

-- 2. Modify `lead_enrichment` table to add tech_stack and social_links
ALTER TABLE public.lead_enrichment
ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;
