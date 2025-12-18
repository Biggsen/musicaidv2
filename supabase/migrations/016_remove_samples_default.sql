-- Remove default value from samples column
-- This prevents new tracks from automatically getting 'Soundation' as the default
-- Existing tracks with 'Soundation' will remain unchanged
ALTER TABLE public.tracks ALTER COLUMN samples DROP DEFAULT;

