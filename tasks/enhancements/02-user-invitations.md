# Enhancement: User Invitation & Collaboration System

## Status: Future Enhancement

This enhancement adds the ability to invite other users to collaborate on artists. Currently, the system supports solo work, and the `user_artists` table is in place for future use.

## Objective

Implement a user invitation system that allows artist owners to invite collaborators via email, with an acceptance flow and role management.

## Features

### 1. User Invitation System

- [ ] Create invitation table/mechanism
- [ ] Implement invitation token generation
- [ ] Add invitation expiration handling
- [ ] Create invitation acceptance flow
- [ ] Add email sending for invitations (or shareable links)

### 2. Collaboration Management UI

- [ ] Add "Invite Collaborator" button on artist page
- [ ] Create collaborator list/management panel
- [ ] Show current collaborators with roles
- [ ] Add ability to remove collaborators (owners only)
- [ ] Display pending invitations

### 3. Additional Collaboration Features

- [ ] Add collaboration activity feed
- [ ] Implement @mentions in notes
- [ ] Create shared workspace views (beyond existing artist/track views)

## Use Cases

**When this would be useful:**
- Working with a band or production team
- Need to give access to specific artists/projects
- Want to track who made what changes
- Coordinating with multiple people on tracks

**Current workflow (sufficient for solo work):**
- Single user creates artists and tracks
- All work is done by one person
- No need to share access or manage permissions

## Technical Implementation

### Database Schema

The `user_artists` table already exists with:
- `user_id` - References auth.users
- `artist_id` - References artists
- `role` - 'owner' | 'collaborator'
- RLS policies already in place for owner management

### Invitation Options

**Option 1: Invitation Table**
```sql
CREATE TABLE artist_invitations (
  id UUID PRIMARY KEY,
  artist_id UUID REFERENCES artists(id),
  inviter_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'collaborator',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Option 2: Pending State in user_artists**
- Add `invited_by`, `invited_at`, `accepted_at` columns
- Use token in separate table or as metadata

### Email vs Link-Based

- **Email invitations**: Send email with acceptance link
- **Shareable links**: Generate link that can be shared (simpler, no email setup needed)

## Estimated Time

4-6 hours

## Dependencies

- Task 01: Project Setup & Foundation ✅
- Task 02: Supabase Integration & Database Setup ✅
- Task 04: Core Music Production Features ✅

## Notes

- The `user_artists` table and RLS policies are already in place
- Currently sufficient for solo work
- Can be implemented when collaboration becomes needed
- May want to start with simple shareable links before full email system

