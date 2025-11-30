-- Rename location column to samples in tracks table
ALTER TABLE public.tracks 
  RENAME COLUMN location TO samples;


