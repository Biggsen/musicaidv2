-- Comprehensive fix for artists RLS policy
-- Drop ALL existing policies on artists table
DROP POLICY IF EXISTS "Users can create artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated users can create artists" ON public.artists;

-- Verify RLS is enabled
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Create a simple INSERT policy that allows authenticated users
-- Using TO authenticated role ensures only logged-in users can insert
CREATE POLICY "Allow authenticated users to insert artists"
  ON public.artists
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify the policy was created
-- You can run this separately to check: SELECT * FROM pg_policies WHERE tablename = 'artists';


