-- Fix infinite recursion in user_artists RLS policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Owners can manage artist relationships" ON public.user_artists;

-- Create separate policies for INSERT, UPDATE, and DELETE
-- Allow users to insert themselves (for when creating artists)
CREATE POLICY "Users can insert their own relationships"
  ON public.user_artists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can update artist relationships
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

-- Owners can delete artist relationships
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

