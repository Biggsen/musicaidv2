-- Add description column to tracks table

ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS description TEXT;

