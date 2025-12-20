-- Add time_signature columns to tracks table
ALTER TABLE public.tracks
ADD COLUMN time_signature_numerator INTEGER,
ADD COLUMN time_signature_denominator INTEGER,
ADD COLUMN time_signature_varied BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.tracks.time_signature_numerator IS 'Time signature numerator (beats per measure, e.g., 3, 4, 6). Null if varied.';
COMMENT ON COLUMN public.tracks.time_signature_denominator IS 'Time signature denominator (note value, e.g., 2, 4, 8). Null if varied.';
COMMENT ON COLUMN public.tracks.time_signature_varied IS 'True if track has multiple/varied time signatures';

