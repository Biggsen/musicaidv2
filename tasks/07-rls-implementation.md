# Task 07: Row Level Security (RLS) Implementation

## Objective

Implement and enable Row Level Security (RLS) policies for all database tables to ensure proper data access control and security.

## Background

RLS policies have been defined in the initial migration (`001_initial_schema.sql`) and subsequent fix migrations (002-005), but RLS is currently disabled due to implementation issues that prevented proper functionality. This task will resolve those issues and enable RLS.

## Tasks

### 1. Analyze Current RLS Policies

- [ ] Review existing RLS policies in migrations
- [ ] Identify specific issues that caused RLS to be disabled
- [ ] Document problematic policy patterns (e.g., infinite recursion, circular dependencies)
- [ ] Test current policies in a development environment

### 2. Fix RLS Policy Issues

- [ ] Resolve infinite recursion in `user_artists` table policies
- [ ] Fix circular dependency issues between tables
- [ ] Ensure policies work correctly for authenticated users
- [ ] Verify policies handle edge cases (new users, orphaned records, etc.)

### 3. Implement Proper RLS Policies

- [ ] **Users table**
  - [ ] SELECT policy: Users can view their own profile
  - [ ] UPDATE policy: Users can update their own profile
  - [ ] Verify INSERT is handled by trigger (no policy needed)

- [ ] **Artists table**
  - [ ] SELECT policy: Users can view artists they collaborate with
  - [ ] INSERT policy: Authenticated users can create artists
  - [ ] UPDATE policy: Owners can update artists
  - [ ] DELETE policy: Owners can delete artists (if needed)

- [ ] **Tracks table**
  - [ ] SELECT policy: Users can view tracks for artists they collaborate with
  - [ ] INSERT policy: Collaborators can create tracks
  - [ ] UPDATE policy: Collaborators can update tracks
  - [ ] DELETE policy: Collaborators can delete tracks (if needed)

- [ ] **User_Artists table**
  - [ ] SELECT policy: Users can view their artist relationships
  - [ ] INSERT policy: Users can insert their own relationships (when creating artists)
  - [ ] UPDATE policy: Owners can update artist relationships
  - [ ] DELETE policy: Owners can delete artist relationships

### 4. Enable RLS

- [ ] Enable RLS on `users` table
- [ ] Enable RLS on `artists` table
- [ ] Enable RLS on `tracks` table
- [ ] Enable RLS on `user_artists` table

### 5. Testing & Validation

- [ ] Test user registration and profile creation with RLS enabled
- [ ] Test artist creation and user-artist relationship creation
- [ ] Test track creation for artists
- [ ] Test data access restrictions (users can't see other users' data)
- [ ] Test role-based access (owners vs collaborators)
- [ ] Verify all CRUD operations work correctly with RLS enabled
- [ ] Test edge cases (orphaned records, deleted users, etc.)

### 6. Migration

- [ ] Create comprehensive migration file to enable RLS and apply all policies
- [ ] Test migration on development database
- [ ] Document any breaking changes or required application updates
- [ ] Apply migration to production database

## Acceptance Criteria

- All RLS policies are properly defined and functional
- RLS is enabled on all public tables
- Users can only access data they have permission to see
- Role-based access control works correctly (owners vs collaborators)
- All existing CRUD operations continue to work with RLS enabled
- No infinite recursion or circular dependency issues
- Comprehensive test coverage for RLS policies

## Known Issues to Address

Based on previous migration attempts:

1. **Infinite Recursion**: The `user_artists` table policies had recursion issues when checking ownership
2. **Circular Dependencies**: Policies referencing `user_artists` while `user_artists` policies reference other tables
3. **Authentication Context**: Ensuring `auth.uid()` is properly available in all policy contexts
4. **Initial Data Access**: New users need to be able to create their first artist and relationship

## Technical Notes

- Use `SECURITY DEFINER` functions where appropriate to bypass RLS for system operations
- Consider using `TO authenticated` role specification in policies
- Ensure trigger functions (like `handle_new_user`) work correctly with RLS enabled
- Test with both authenticated and unauthenticated contexts

## Estimated Time

6-8 hours

## Dependencies

- Task 02: Supabase Integration & Database Setup (must be complete)
- Task 04: Core Features (should be complete to ensure RLS doesn't break existing functionality)

## References

- Supabase RLS Documentation: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS Documentation: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Existing migrations:
  - `supabase/migrations/001_initial_schema.sql` - Initial RLS policies
  - `supabase/migrations/002_fix_user_artists_rls.sql` - User-artists fixes
  - `supabase/migrations/003_fix_artists_insert_policy.sql` - Artists INSERT fixes
  - `supabase/migrations/004_verify_and_fix_artists_policy.sql` - Artists policy verification
  - `supabase/migrations/005_fix_artists_rls_comprehensive.sql` - Comprehensive artists fixes

