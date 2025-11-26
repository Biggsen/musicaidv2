-- Add track_steps junction table to track completed steps
-- This allows tracking which steps have been completed for each track

CREATE TABLE IF NOT EXISTS public.track_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(track_id, step_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_track_steps_track_id ON public.track_steps(track_id);
CREATE INDEX IF NOT EXISTS idx_track_steps_step_id ON public.track_steps(step_id);
CREATE INDEX IF NOT EXISTS idx_track_steps_completed_at ON public.track_steps(completed_at);

-- RLS is disabled for now - will be enabled later when RLS is implemented
ALTER TABLE public.track_steps DISABLE ROW LEVEL SECURITY;

