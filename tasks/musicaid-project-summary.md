<!-- PROJECT-MANIFEST:START -->
```json
{
  "schemaVersion": 1,
  "projectId": "musicaid-v2",
  "name": "MusicAid v2",
  "repo": "Biggsen/musicaidv2",
  "visibility": "staging",
  "status": "active",
  "domain": "music",
  "type": "webapp",
  "lastUpdated": "2026-01-12",
  "links": {
    "prod": null,
    "staging": "https://musicaidv2.netlify.app/"
  },
  "tags": ["webapp", "typescript", "nuxt", "vue", "supabase", "music-production"]
}
```
<!-- PROJECT-MANIFEST:END -->

# MusicAid v2 - Project Summary

## Project Overview

**MusicAid v2** is a comprehensive music production and recording management system built with modern web technologies. It helps artists, producers, and studios track and manage various aspects of music creation and recording workflows.

### Key Features

- Multi-user collaboration on artist projects with role-based access control
- Complete track management with metadata, workflow status tracking, and album associations
- Custom workflow templates with status management and step tracking
- Audio file management with Cloudflare R2 storage integration
- Notes system for track-specific comments and completion tracking
- Album management for organizing tracks

---

## Tech Stack

- **Frontend/Backend**: Nuxt 3 (full-stack Vue framework with SSR)
- **Database & Auth**: Supabase (PostgreSQL, authentication, real-time capabilities)
- **File Storage**: Cloudflare R2 (S3-compatible object storage)
- **Deployment**: Netlify (single deployment platform)
- **UI Framework**: Nuxt UI v4 (TailwindCSS-based component library)
- **Language**: TypeScript (strict mode enabled)

---

## Current Focus

Currently focused on security implementation. RLS (Row Level Security) policies need to be properly implemented and enabled before production use. This involves resolving policy recursion issues, testing all CRUD operations, and enabling RLS on all tables.

---

## Features (Done)

- [x] User authentication (login, registration, session management)
- [x] Multi-user collaboration on artist projects with role-based access control
- [x] Artist management (full CRUD operations)
- [x] Track management with metadata (name, tempo, key, duration, description, time signature)
- [x] Track status tracking through workflow stages
- [x] Track-album associations
- [x] Custom workflow templates
- [x] Status management (production stages)
- [x] Step tracking within statuses with visual progress indicators
- [x] Notes system (track-specific notes and comments with completion tracking)
- [x] Audio file upload to Cloudflare R2
- [x] Audio file display and playback
- [x] Audio metadata tracking
- [x] Album management (create, organize tracks, manage metadata)

### Detailed Completed Features

#### User Management
- User authentication with login, registration, and session management
- Multi-user collaboration on artist projects
- Role-based access control (owners vs collaborators)

#### Artist Management
- Create, edit, and view artist profiles
- Multi-user collaboration on artists
- Artist-specific workflow templates

#### Track Management
- Full CRUD operations for tracks
- Track metadata (name, tempo, key, duration, description, time signature)
- Track status tracking through workflow stages
- Track-album associations

#### Workflow System
- Custom workflow templates
- Status management (production stages)
- Step tracking within statuses
- Visual progress indicators

#### Audio File Management
- Audio file upload to Cloudflare R2
- Audio file display and playback
- Audio metadata tracking
- Full CRUD operations for audio files

#### Project Setup & Deployment
- Nuxt 3 project with TypeScript
- Development environment configured
- Database schema implemented with 15 migrations
- Supabase integration with authentication
- Netlify deployment configured and working
- Production deployment operational

---

## Outstanding Tasks

### High Priority

- [ ] Task 07: Row Level Security (RLS) Implementation (6-8 hours)
  - Analyze current RLS policies in migrations
  - Identify specific issues that caused RLS to be disabled
  - Document problematic policy patterns (infinite recursion, circular dependencies)
  - Resolve infinite recursion in `user_artists` table policies
  - Fix circular dependency issues between tables
  - Implement proper RLS policies for all tables (Users, Artists, Tracks, User_Artists)
  - Enable RLS on all tables
  - Test all CRUD operations with RLS enabled
  - Create comprehensive migration file to enable RLS
  - Apply migration to production database

### Medium Priority

_No medium priority tasks at this time._

### Low Priority / Future

- [ ] Task 06: Polish & Optimization (6-10 hours)
  - UI/UX enhancements (loading skeletons, animations, keyboard shortcuts, onboarding)
  - Performance optimizations (virtual scrolling, service worker, caching)
  - Developer experience improvements (error logging, debugging tools, documentation)
  - User experience features (bulk operations, advanced search, export functionality)
  - Analytics & monitoring (error tracking, performance monitoring, usage statistics)

---

## Enhancements

### High Priority Enhancements

- Real-time Collaboration: Real-time updates and live collaboration features (currently deferred because manual refresh is sufficient for the workflow)

### Medium Priority Enhancements

- Mobile-responsive improvements
- Accessibility (a11y) enhancements
- Advanced search and filtering
- Bulk operations (select multiple tracks)

### Low Priority Enhancements

- Export functionality for data
- User analytics (privacy-focused)
- Usage statistics dashboard
- Performance optimization improvements

---

## Known Issues

### Active Bugs

_No active bugs at this time._

### Resolved Bugs

- [x] Avoid `dark:` utility classes (Fixed January 2026)
  - **Status**: Fixed
  - **Description**: Removed all `dark:` utility classes from the app
  - **Solution**: Replaced with Nuxt UI components and their built-in styling/theming for dark mode support

- [x] Audio upload failing on staging with "1 Internal Error" (Fixed January 2026)
  - **Status**: Fixed and verified working
  - **Root Cause**: Netlify functions have a 6MB request body size limit (free tier)
  - **Solution**: Implemented presigned URL flow for direct R2 uploads, bypassing Netlify's 6MB limit
  - **Benefits**: Supports files of any size, faster uploads, no Netlify function timeouts

### RLS Implementation Issues

The following issues need to be addressed when implementing RLS:

1. **Infinite Recursion**: The `user_artists` table policies had recursion issues when checking ownership
2. **Circular Dependencies**: Policies referencing `user_artists` while `user_artists` policies reference other tables
3. **Authentication Context**: Ensuring `auth.uid()` is properly available in all policy contexts
4. **Initial Data Access**: New users need to be able to create their first artist and relationship

---

## Project Status

**Overall Status**: Active Development  
**Completion**: ~85%  
**Last Major Update**: January 2026

### Metrics

- **Database Migrations**: 17 completed
- **Core Features**: 6 major feature areas implemented
- **Open Tasks**: 2 (1 high priority, 1 low priority)
- **Active Bugs**: 0
- **Resolved Bugs**: 2 (dark classes and audio upload issues fixed)
- **Deployment Status**: ✅ Deployed to Netlify
- **Security Status**: ⚠️ RLS needs to be enabled

### Current Phase

Post-Core Development - Core features are complete. Security implementation (RLS) is the primary remaining task before production readiness.

---

## Next Steps

### Immediate (Next 1-2 weeks)

1. Implement and enable RLS (Task 07) - Critical for production security

### Short-term (Next 1-3 months)

1. Test RLS implementation thoroughly
2. Address any issues discovered during RLS testing
3. Begin polish and optimization work (Task 06) as time permits

### Long-term (3+ months)

1. Consider real-time collaboration features when workflow needs grow
2. Implement advanced features from enhancements list
3. Performance optimization and monitoring setup

---

## Notes

### Architecture Decisions

- **Nuxt 3**: Full-stack Vue framework with built-in API routes
- **Supabase**: Handles complex backend concerns (database, auth, real-time, storage)
- **TypeScript**: Type safety throughout the application
- **Netlify**: Simple deployment with great developer experience
- **Nuxt UI**: Utility-first styling with built-in component library
- **Cloudflare R2**: Cost-effective S3-compatible storage for audio files

### Project Structure

```
musicaidv2/
├── components/          # Vue components
│   ├── ArtistSelector.vue
│   ├── AudioUpload.vue
│   ├── Logo.vue
│   └── WorkflowStatus.vue
├── composables/         # Vue composables
│   ├── useAlbums.ts
│   ├── useApi.ts
│   ├── useArtists.ts
│   ├── useAudio.ts
│   ├── useAuth.ts
│   ├── useNotes.ts
│   ├── useSlug.ts
│   ├── useSupabase.ts
│   ├── useTracks.ts
│   └── useWorkflow.ts
├── pages/               # File-based routing
│   ├── artists/         # Artist management pages
│   ├── tracks/          # Track management pages
│   ├── templates/       # Workflow template pages
│   ├── albums/          # Album management pages
│   ├── statuses/        # Status management pages
│   └── auth/            # Authentication pages
├── server/api/          # Serverless API routes
│   ├── upload/         # File upload endpoints
│   └── r2/              # R2 storage endpoints
├── supabase/migrations/ # Database migrations (17 completed)
└── spec/                # Project specifications
```

### Key Pages Implemented

- `/` - Homepage with hero and features
- `/login` - User authentication
- `/register` - New user registration
- `/artists` - Artist listing/dashboard
- `/artists/[id]` - Artist detail page with tracks
- `/artists/[id]/edit` - Artist edit page
- `/tracks` - Track listing with filters
- `/tracks/[id]` - Track detail page
- `/tracks/[id]/edit` - Track edit page
- `/tracks/batch-upload` - Batch track upload
- `/albums` - Album listing
- `/albums/[id]` - Album detail page
- `/albums/[id]/edit` - Album edit page
- `/templates` - Workflow template listing
- `/templates/[id]` - Template detail page with status and step management
- `/statuses` - Status listing
- `/statuses/[id]` - Status detail page
- `/steps` - Step listing

### Key Components

- `ArtistSelector.vue` - Reusable artist selection component
- `AudioUpload.vue` - Audio file upload with drag & drop (R2 integrated)
- `WorkflowStatus.vue` - Workflow status and step tracking component
- `Logo.vue` - Application logo component

### Key Composables

- `useAlbums.ts` - Album CRUD operations
- `useArtists.ts` - Artist CRUD operations
- `useAudio.ts` - Audio file CRUD operations (with R2 integration)
- `useAuth.ts` - Authentication logic
- `useNotes.ts` - Notes CRUD operations
- `useTracks.ts` - Track CRUD operations
- `useWorkflow.ts` - Workflow system CRUD operations
- `useSupabase.ts` - Supabase client utilities

### Database Migrations

17 migrations have been completed:
- `001_initial_schema.sql` - Initial database schema
- `002_fix_user_artists_rls.sql` - User-artists RLS fixes
- `003_fix_artists_insert_policy.sql` - Artists INSERT policy fixes
- `004_verify_and_fix_artists_policy.sql` - Artists policy verification
- `005_fix_artists_rls_comprehensive.sql` - Comprehensive artists RLS fixes
- `006_add_notes_and_audio_tables.sql` - Notes and audio tables
- `007_add_workflow_tables.sql` - Workflow system tables
- `008_seed_workflow_data.sql` - Initial workflow data
- `009_add_track_steps_table.sql` - Track steps tracking
- `010_add_albums_table.sql` - Albums table
- `011_add_audio_metadata_and_version.sql` - Audio metadata enhancements
- `012_rename_location_to_samples.sql` - Schema refactoring
- `013_add_labels_to_steps.sql` - Step labels
- `014_add_description_to_tracks.sql` - Track descriptions
- `015_remove_title_from_statuses_and_steps.sql` - Schema cleanup
- `016_remove_samples_default.sql` - Remove default value from samples column
- `017_add_time_signature_to_tracks.sql` - Add time signature fields to tracks

### Cost Estimate

Starting at **$0-20/month**:
- Netlify: Free tier (sufficient for initial deployment)
- Supabase: Free tier (up to 500MB database, 1GB file storage)
- Cloudflare R2: Pay-as-you-go (very affordable for audio storage)

---