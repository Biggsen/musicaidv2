-- Add albums table
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  release_date TIMESTAMPTZ,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for tracks.album_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tracks_album_id_fkey'
  ) THEN
    ALTER TABLE public.tracks
      ADD CONSTRAINT tracks_album_id_fkey
      FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON public.albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_albums_slug ON public.albums(slug);
CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON public.tracks(album_id);

-- RLS is disabled for now - will be enabled later when RLS is implemented

-- Trigger for updated_at
CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

