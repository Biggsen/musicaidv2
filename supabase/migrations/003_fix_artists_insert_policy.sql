-- Fix artists INSERT policy to require authentication
DROP POLICY IF EXISTS "Users can create artists" ON public.artists;

-- Create a new policy that requires the user to be authenticated
-- This ensures auth.uid() is not null
CREATE POLICY "Authenticated users can create artists"
  ON public.artists FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

