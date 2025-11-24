# Task 02: Supabase Integration & Database Setup

## Objective
Set up Supabase project and integrate it with Nuxt 3 for database and authentication. Note: File storage (audio/images) uses S3-compatible storage and is handled separately (see file-management.md spec).

## Tasks

### 1. Supabase Project Setup
- [ ] Create new Supabase project
- [ ] Get project URL and anon key
- [ ] Configure environment variables in `.env`
- [ ] Install Supabase client library

### 2. Database Schema (Core Tables)
- [ ] Create `users` table (extends Supabase auth.users)
- [ ] Create `artists` table
- [ ] Create `tracks` table
- [ ] Set up basic foreign key relationships
- [ ] Configure Row Level Security (RLS) policies

### 3. Authentication Setup
- [ ] Configure Nuxt Supabase module
- [ ] Create authentication composables
- [ ] Set up login/register pages
- [ ] Implement auth middleware for protected routes

### 4. Basic API Integration
- [ ] Create Supabase client composable
- [ ] Set up basic CRUD operations for artists/tracks
- [ ] Test database connectivity

## Acceptance Criteria
- Supabase connection works from Nuxt app
- User can register and login
- Basic database operations work
- Environment variables are properly configured

## Notes
- **Storage**: File storage (audio files, images) uses S3-compatible object storage (AWS S3, Backblaze B2, etc.) and is configured separately. Supabase is only used for database and authentication.
- **File Upload**: File upload functionality will be implemented in a later task with S3 integration.

## Estimated Time
4-6 hours

## Dependencies
- Task 01: Project Setup & Foundation 