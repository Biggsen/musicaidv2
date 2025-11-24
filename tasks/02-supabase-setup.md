# Task 02: Supabase Integration & Database Setup

## Objective

Set up Supabase project and integrate it with Nuxt 3 for database and authentication. Note: File storage (audio/images) uses S3-compatible storage and is handled separately (see file-management.md spec).

## Tasks

### 1. Supabase Project Setup

- [x] Create new Supabase project (manual - user needs to create at supabase.com)
- [x] Get project URL and anon key (documented in .env.example)
- [x] Configure environment variables in `.env` (.env.example created)
- [x] Install Supabase client library

### 2. Database Schema (Core Tables)

- [x] Create `users` table (extends Supabase auth.users)
- [x] Create `artists` table
- [x] Create `tracks` table
- [x] Set up basic foreign key relationships
- [x] Configure Row Level Security (RLS) policies

### 3. Authentication Setup

- [x] Configure Nuxt Supabase module
- [x] Create authentication composables
- [x] Set up login/register pages
- [x] Implement auth middleware for protected routes

### 4. Basic API Integration

- [x] Create Supabase client composable
- [x] Set up basic CRUD operations for artists/tracks
- [x] Test database connectivity (ready for testing after Supabase project setup)

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
