# API Specification

## Overview

This document defines all REST API endpoints for the MusicAid application. The API follows RESTful conventions and is implemented using Next.js App Router API routes.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints (except public ones) require authentication via NextAuth.js session cookies or JWT tokens.

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signin
Sign in a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    },
    "token": "jwt_token"
  }
}
```

#### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/signout
Sign out the current user.

### User Endpoints

#### GET /api/users/me
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "artists": [
      {
        "id": "artist_id",
        "name": "Artist Name",
        "slug": "artist-slug"
      }
    ]
  }
}
```

#### PUT /api/users/me
Update current user profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### Artist Endpoints

#### GET /api/artists
Get all artists accessible to the current user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "artists": [
      {
        "id": "artist_id",
        "name": "Artist Name",
        "slug": "artist-slug",
        "template": {
          "id": "template_id",
          "name": "Template Name"
        },
        "tracksCount": 15,
        "albumsCount": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### POST /api/artists
Create a new artist.

**Request Body:**
```json
{
  "name": "New Artist",
  "templateId": "template_id" // optional
}
```

#### GET /api/artists/[id]
Get a specific artist by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "artist_id",
    "name": "Artist Name",
    "slug": "artist-slug",
    "template": {
      "id": "template_id",
      "name": "Template Name"
    },
    "users": [
      {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      }
    ],
    "tracks": [
      {
        "id": "track_id",
        "name": "Track Name",
        "trackStatus": {
          "name": "In Progress"
        }
      }
    ]
  }
}
```

#### PUT /api/artists/[id]
Update an artist.

**Request Body:**
```json
{
  "name": "Updated Artist Name",
  "templateId": "new_template_id"
}
```

#### DELETE /api/artists/[id]
Delete an artist and all associated data.

### Track Endpoints

#### GET /api/tracks
Get all tracks accessible to the current user.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `artistId`: Filter by artist
- `albumId`: Filter by album
- `statusId`: Filter by track status
- `search`: Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "tracks": [
      {
        "id": "track_id",
        "name": "Track Name",
        "key": "track-key",
        "artist": {
          "id": "artist_id",
          "name": "Artist Name"
        },
        "album": {
          "id": "album_id",
          "name": "Album Name"
        },
        "trackStatus": {
          "id": "status_id",
          "name": "In Progress"
        },
        "tempo": 120,
        "minutes": 3,
        "seconds": 45,
        "liveReady": false
      }
    ],
    "pagination": { ... }
  }
}
```

#### POST /api/tracks
Create a new track.

**Request Body:**
```json
{
  "name": "New Track",
  "artistId": "artist_id",
  "templateId": "template_id", // optional
  "albumId": "album_id", // optional
  "tempo": 120,
  "minutes": 3,
  "seconds": 45,
  "location": "Ableton Live"
}
```

#### GET /api/tracks/[id]
Get a specific track with all related data.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "track_id",
    "name": "Track Name",
    "key": "track-key",
    "artist": { ... },
    "album": { ... },
    "trackStatus": { ... },
    "step": { ... },
    "audios": [
      {
        "id": "audio_id",
        "name": "Audio Name",
        "fileUrl": "https://...",
        "mixdownDate": "2024-01-01T00:00:00Z"
      }
    ],
    "notes": [
      {
        "id": "note_id",
        "note": "Note content",
        "done": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "records": [ ... ],
    "sessions": [ ... ]
  }
}
```

#### PUT /api/tracks/[id]
Update a track.

**Request Body:**
```json
{
  "name": "Updated Track Name",
  "trackStatusId": "new_status_id",
  "stepId": "new_step_id",
  "tempo": 130,
  "liveReady": true
}
```

#### DELETE /api/tracks/[id]
Delete a track and all associated data.

### Album Endpoints

#### GET /api/albums
Get all albums.

**Query Parameters:**
- `artistId`: Filter by artist
- `page`, `limit`, `search`

#### POST /api/albums
Create a new album.

**Request Body:**
```json
{
  "name": "New Album",
  "artistId": "artist_id",
  "releaseDate": "2024-12-01T00:00:00Z"
}
```

#### GET /api/albums/[id]
Get album with tracks.

#### PUT /api/albums/[id]
Update album.

#### DELETE /api/albums/[id]
Delete album.

### Audio Endpoints

#### GET /api/audios
Get audio files.

**Query Parameters:**
- `trackId`: Filter by track

#### POST /api/audios
Create audio file record (after upload).

**Request Body:**
```json
{
  "name": "Audio Name",
  "trackId": "track_id",
  "fileUrl": "https://...",
  "description": "Audio description"
}
```

#### GET /api/audios/[id]
Get specific audio file.

#### PUT /api/audios/[id]
Update audio metadata.

#### DELETE /api/audios/[id]
Delete audio file and file storage.

### File Upload Endpoints

#### POST /api/upload/audio
Upload audio file to file storage.

**Request:**
- Content-Type: `multipart/form-data`
- File field: `audio`
- Additional fields: `trackId`, `name`, `description`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "audio_id",
    "name": "Audio Name",
    "fileUrl": "https://...",
    "downloadUrl": "https://..."
  }
}
```

#### POST /api/upload/image
Upload image file (album artwork).

### Template Endpoints

#### GET /api/templates
Get all templates.

**Query Parameters:**
- `artistId`: Filter by artist
- `published`: Filter by published status

#### POST /api/templates
Create new template.

#### GET /api/templates/[id]
Get template with statuses and steps.

#### PUT /api/templates/[id]
Update template.

#### DELETE /api/templates/[id]
Delete template.

### Track Status Endpoints

#### GET /api/track-statuses
Get all track statuses.

#### POST /api/track-statuses
Create new track status.

#### GET /api/track-statuses/[id]
Get track status with steps.

#### PUT /api/track-statuses/[id]
Update track status.

#### DELETE /api/track-statuses/[id]
Delete track status.

### Step Endpoints

#### GET /api/steps
Get all steps.

#### POST /api/steps
Create new step.

#### GET /api/steps/[id]
Get specific step.

#### PUT /api/steps/[id]
Update step.

#### DELETE /api/steps/[id]
Delete step.

### Note Endpoints

#### GET /api/notes
Get notes.

**Query Parameters:**
- `trackId`: Filter by track
- `done`: Filter by completion status

#### POST /api/notes
Create new note.

**Request Body:**
```json
{
  "note": "Note content",
  "trackId": "track_id",
  "stepId": "step_id", // optional
  "trackStatusId": "status_id" // optional
}
```

#### PUT /api/notes/[id]
Update note.

#### DELETE /api/notes/[id]
Delete note.

### Recording Endpoints

#### GET /api/records
Get recording records.

#### POST /api/records
Create new record.

#### PUT /api/records/[id]
Update record status.

#### DELETE /api/records/[id]
Delete record.

### Session Endpoints

#### GET /api/sessions
Get recording sessions.

#### POST /api/sessions
Create new session.

#### PUT /api/sessions/[id]
Update session.

#### DELETE /api/sessions/[id]
Delete session.

### Instrument Endpoints

#### GET /api/instruments
Get all instruments.

#### POST /api/instruments
Create new instrument.

#### PUT /api/instruments/[id]
Update instrument.

#### DELETE /api/instruments/[id]
Delete instrument.

## Error Codes

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `DUPLICATE_ERROR`: Resource already exists
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- **General endpoints**: 100 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user
- **Authentication endpoints**: 5 requests per minute per IP

## File Upload Limits

- **Audio files**: 100MB maximum
- **Image files**: 10MB maximum
- **Supported audio formats**: MP3, WAV, FLAC, M4A
- **Supported image formats**: JPEG, PNG, WebP

## Webhook Endpoints (Optional)

#### POST /api/webhooks/file-upload
Handle file upload completion.

#### POST /api/webhooks/audio-processing
Handle audio processing completion.

## Implementation Notes

1. **Validation**: Use Zod schemas for request validation
2. **Error Handling**: Consistent error response format
3. **Logging**: Log all API requests and errors
4. **Caching**: Implement caching for frequently accessed data
5. **Pagination**: Use cursor-based pagination for large datasets
6. **Search**: Implement full-text search where appropriate 