-- Add notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note TEXT NOT NULL,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  step_id UUID,
  track_status_id UUID,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add audios table
CREATE TABLE IF NOT EXISTS public.audios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  dropbox_url TEXT,
  mixdown_date TIMESTAMPTZ,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notes_track_id ON public.notes(track_id);
CREATE INDEX IF NOT EXISTS idx_audios_track_id ON public.audios(track_id);
CREATE INDEX IF NOT EXISTS idx_audios_slug ON public.audios(slug);

-- RLS is disabled for now - will be enabled later when RLS is implemented

-- Triggers for updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audios_updated_at
  BEFORE UPDATE ON public.audios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

