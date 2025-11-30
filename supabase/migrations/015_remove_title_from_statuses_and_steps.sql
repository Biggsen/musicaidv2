-- Remove title column from track_statuses and steps tables
-- The title field is no longer used in the application

ALTER TABLE public.track_statuses DROP COLUMN IF EXISTS title;
ALTER TABLE public.steps DROP COLUMN IF EXISTS title;



