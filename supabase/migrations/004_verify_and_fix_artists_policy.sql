-- Verify and fix artists INSERT policy
-- First, drop any existing INSERT policies on artists
DROP POLICY IF EXISTS "Users can create artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated users can create artists" ON public.artists;

-- Create a policy that allows any authenticated user to insert artists
-- This checks that auth.uid() is not null, ensuring the user is authenticated
CREATE POLICY "Authenticated users can create artists"
  ON public.artists FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

