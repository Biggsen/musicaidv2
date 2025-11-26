-- Add workflow tables: track_statuses, steps, templates
-- This migration creates the workflow system tables and their relationships

-- Track Statuses table
CREATE TABLE IF NOT EXISTS public.track_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  non_linear BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Steps table
CREATE TABLE IF NOT EXISTS public.steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  type TEXT DEFAULT 'NORMAL' CHECK (type IN ('NORMAL', 'TEXT', 'LIST', 'RECORD')),
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: Template <-> TrackStatus (many-to-many)
CREATE TABLE IF NOT EXISTS public.template_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  track_status_id UUID NOT NULL REFERENCES public.track_statuses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, track_status_id)
);

-- Junction table: Step <-> TrackStatus (many-to-many)
CREATE TABLE IF NOT EXISTS public.step_track_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  track_status_id UUID NOT NULL REFERENCES public.track_statuses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(step_id, track_status_id)
);

-- Add foreign key constraints to tracks table
-- Note: These columns already exist from migration 001, but we need to add the foreign keys
DO $$
BEGIN
  -- Add foreign key for template_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tracks_template_id_fkey'
  ) THEN
    ALTER TABLE public.tracks
      ADD CONSTRAINT tracks_template_id_fkey
      FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key for track_status_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tracks_track_status_id_fkey'
  ) THEN
    ALTER TABLE public.tracks
      ADD CONSTRAINT tracks_track_status_id_fkey
      FOREIGN KEY (track_status_id) REFERENCES public.track_statuses(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key for step_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tracks_step_id_fkey'
  ) THEN
    ALTER TABLE public.tracks
      ADD CONSTRAINT tracks_step_id_fkey
      FOREIGN KEY (step_id) REFERENCES public.steps(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint to artists table for template_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'artists_template_id_fkey'
  ) THEN
    ALTER TABLE public.artists
      ADD CONSTRAINT artists_template_id_fkey
      FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_track_statuses_key ON public.track_statuses(key);
CREATE INDEX IF NOT EXISTS idx_track_statuses_artist_id ON public.track_statuses(artist_id);
CREATE INDEX IF NOT EXISTS idx_steps_key ON public.steps(key);
CREATE INDEX IF NOT EXISTS idx_steps_artist_id ON public.steps(artist_id);
CREATE INDEX IF NOT EXISTS idx_templates_artist_id ON public.templates(artist_id);
CREATE INDEX IF NOT EXISTS idx_template_statuses_template_id ON public.template_statuses(template_id);
CREATE INDEX IF NOT EXISTS idx_template_statuses_track_status_id ON public.template_statuses(track_status_id);
CREATE INDEX IF NOT EXISTS idx_step_track_statuses_step_id ON public.step_track_statuses(step_id);
CREATE INDEX IF NOT EXISTS idx_step_track_statuses_track_status_id ON public.step_track_statuses(track_status_id);
CREATE INDEX IF NOT EXISTS idx_tracks_template_id ON public.tracks(template_id);
CREATE INDEX IF NOT EXISTS idx_tracks_track_status_id ON public.tracks(track_status_id);
CREATE INDEX IF NOT EXISTS idx_tracks_step_id ON public.tracks(step_id);

-- RLS is disabled for now - will be enabled later when RLS is implemented

-- Triggers for updated_at
CREATE TRIGGER update_track_statuses_updated_at
  BEFORE UPDATE ON public.track_statuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_steps_updated_at
  BEFORE UPDATE ON public.steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


