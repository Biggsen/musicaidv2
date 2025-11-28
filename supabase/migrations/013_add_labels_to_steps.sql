-- Add tags column to steps table
-- Tags will be stored as an array of text strings for organizing steps

ALTER TABLE public.steps
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for better query performance when filtering by tags
CREATE INDEX IF NOT EXISTS idx_steps_tags ON public.steps USING GIN(tags);

