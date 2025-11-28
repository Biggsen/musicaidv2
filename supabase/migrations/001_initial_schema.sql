-- MusicAid Database Schema
-- Core tables: users, artists, tracks

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
-- This table stores additional user profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artists table
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  template_id UUID,
  track_status_id UUID,
  step_id UUID,
  tempo INTEGER,
  minutes INTEGER,
  seconds INTEGER,
  samples TEXT DEFAULT 'Soundation',
  album_id UUID,
  album_order INTEGER,
  date_created TIMESTAMPTZ,
  isrc_code TEXT,
  live_ready BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- User-Artist relationship table (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'collaborator' CHECK (role IN ('owner', 'collaborator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artist_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artists_slug ON public.artists(slug);
CREATE INDEX IF NOT EXISTS idx_tracks_key ON public.tracks(key);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON public.tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_user_artists_user_id ON public.user_artists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_artists_artist_id ON public.user_artists(artist_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_artists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for artists table
CREATE POLICY "Users can view artists they collaborate with"
  ON public.artists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_artists
      WHERE user_artists.artist_id = artists.id
      AND user_artists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create artists"
  ON public.artists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can update artists"
  ON public.artists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_artists
      WHERE user_artists.artist_id = artists.id
      AND user_artists.user_id = auth.uid()
      AND user_artists.role = 'owner'
    )
  );

-- RLS Policies for tracks table
CREATE POLICY "Users can view tracks for artists they collaborate with"
  ON public.tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_artists
      WHERE user_artists.artist_id = tracks.artist_id
      AND user_artists.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can create tracks"
  ON public.tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_artists
      WHERE user_artists.artist_id = tracks.artist_id
      AND user_artists.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can update tracks"
  ON public.tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_artists
      WHERE user_artists.artist_id = tracks.artist_id
      AND user_artists.user_id = auth.uid()
    )
  );

-- RLS Policies for user_artists table
CREATE POLICY "Users can view their artist relationships"
  ON public.user_artists FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert themselves (for when creating artists)
CREATE POLICY "Users can insert their own relationships"
  ON public.user_artists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can update/delete artist relationships
CREATE POLICY "Owners can update artist relationships"
  ON public.user_artists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_artists ua
      WHERE ua.artist_id = user_artists.artist_id
      AND ua.user_id = auth.uid()
      AND ua.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete artist relationships"
  ON public.user_artists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_artists ua
      WHERE ua.artist_id = user_artists.artist_id
      AND ua.user_id = auth.uid()
      AND ua.role = 'owner'
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

