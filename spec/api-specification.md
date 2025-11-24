# API Specification

## Overview

This document defines all REST API endpoints for the MusicAid application. The API follows RESTful conventions and can be implemented using any suitable backend framework or serverless architecture.

## Base URL

- **Development**: `http://localhost:3000/api` (or appropriate local port)
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints (except public ones) require authentication via session cookies, JWT tokens, or API keys depending on the chosen authentication strategy.

### Authentication Methods

#### Session-Based Authentication

```http
Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Lax
```

#### Token-Based Authentication

```http
Authorization: Bearer <jwt_token>
```

#### API Key Authentication

```http
X-API-Key: <api_key>
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... },
    "field_errors": {
      "field_name": ["Error message for field"]
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "req_123456"
  }
}
```

## Status Codes

- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (duplicate, etc.)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login

Authenticate a user and create session.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": false
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
    "session": {
      "token": "jwt_token",
      "expires_at": "2024-02-01T00:00:00Z"
    }
  }
}
```

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Validation Rules:**

- Name: Required, 1-100 characters
- Email: Required, valid email format, unique
- Password: Required, minimum 8 characters, complexity rules
- Password confirmation: Must match password

#### POST /api/auth/logout

End user session.

**Response:**

```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### POST /api/auth/forgot-password

Request password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password

Reset user password with token.

**Request Body:**

```json
{
  "token": "reset_token",
  "password": "new_password123",
  "password_confirmation": "new_password123"
}
```

### User Endpoints

#### GET /api/users/profile

Get current user profile and associated artists.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "artists": [
      {
        "id": "artist_id",
        "name": "Artist Name",
        "slug": "artist-slug",
        "role": "owner"
      }
    ]
  }
}
```

#### PUT /api/users/profile

Update current user profile.

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### PUT /api/users/password

Change user password.

**Request Body:**

```json
{
  "current_password": "current123",
  "new_password": "new_password123",
  "password_confirmation": "new_password123"
}
```

### Artist Endpoints

#### GET /api/artists

Get all artists accessible to the current user.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term for artist name
- `sort`: Sort field (name, created_at, updated_at)
- `order`: Sort order (asc, desc)

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
        "stats": {
          "tracks_count": 15,
          "albums_count": 3,
          "completed_tracks": 8
        },
        "role": "owner",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "has_prev": false,
      "has_next": true
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
  "template_id": "template_id" // optional
}
```

**Validation Rules:**

- Name: Required, 1-100 characters, unique slug generation
- Template ID: Optional, must exist and be accessible

#### GET /api/artists/{id}

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
    "collaborators": [
      {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "role": "owner"
      }
    ],
    "recent_tracks": [
      {
        "id": "track_id",
        "name": "Track Name",
        "status": "mixing",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "stats": {
      "tracks_count": 15,
      "albums_count": 3,
      "completed_tracks": 8
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/artists/{id}

Update an artist.

**Request Body:**

```json
{
  "name": "Updated Artist Name",
  "template_id": "new_template_id"
}
```

#### DELETE /api/artists/{id}

Delete an artist (requires owner role).

**Response:**

```json
{
  "success": true,
  "message": "Artist deleted successfully"
}
```

### Track Endpoints

#### GET /api/tracks

Get tracks with filtering and pagination.

**Query Parameters:**

- `artist_id`: Filter by artist ID
- `album_id`: Filter by album ID
- `status`: Filter by track status
- `template_id`: Filter by template ID
- `search`: Search in track names
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (name, created_at, updated_at, status)
- `order`: Sort order (asc, desc)

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
        "status": {
          "id": "status_id",
          "name": "Mixing"
        },
        "step": {
          "id": "step_id",
          "name": "Final Mix"
        },
        "metadata": {
          "tempo": 120,
          "duration": {
            "minutes": 3,
            "seconds": 45
          },
          "key_signature": "C Major",
          "location": "Studio A"
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    },
    "filters": {
      "available_statuses": [
        { "id": "status1", "name": "Writing" },
        { "id": "status2", "name": "Recording" }
      ],
      "available_artists": [{ "id": "artist1", "name": "Artist One" }]
    }
  }
}
```

#### POST /api/tracks

Create a new track.

**Request Body:**

```json
{
  "name": "New Track",
  "artist_id": "artist_id",
  "template_id": "template_id", // optional
  "album_id": "album_id", // optional
  "metadata": {
    "tempo": 120,
    "key_signature": "C Major",
    "location": "Studio A"
  }
}
```

#### GET /api/tracks/{id}

Get a specific track with full details.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "track_id",
    "name": "Track Name",
    "key": "track-key",
    "artist": {
      "id": "artist_id",
      "name": "Artist Name"
    },
    "template": {
      "id": "template_id",
      "name": "Template Name"
    },
    "current_status": {
      "id": "status_id",
      "name": "Mixing",
      "order": 3
    },
    "current_step": {
      "id": "step_id",
      "name": "Final Mix"
    },
    "workflow": {
      "statuses": [
        {
          "id": "status1",
          "name": "Writing",
          "order": 1,
          "completed": true
        },
        {
          "id": "status2",
          "name": "Recording",
          "order": 2,
          "completed": true
        },
        {
          "id": "status3",
          "name": "Mixing",
          "order": 3,
          "completed": false,
          "current": true
        }
      ]
    },
    "metadata": {
      "tempo": 120,
      "duration": {
        "minutes": 3,
        "seconds": 45
      },
      "key_signature": "C Major",
      "location": "Studio A",
      "isrc_code": "USRC17607839",
      "live_ready": false
    },
    "audio_files": [
      {
        "id": "audio_id",
        "name": "Final Mix v1",
        "url": "https://cdn.example.com/audio/track_id/final_mix_v1.wav",
        "category": "master",
        "duration": 225,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "notes": [
      {
        "id": "note_id",
        "content": "Need to adjust the vocal levels",
        "author": "User Name",
        "status": "Mixing",
        "completed": false,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### PUT /api/tracks/{id}

Update a track.

**Request Body:**

```json
{
  "name": "Updated Track Name",
  "album_id": "new_album_id",
  "metadata": {
    "tempo": 125,
    "key_signature": "D Major"
  }
}
```

#### DELETE /api/tracks/{id}

Delete a track.

#### PUT /api/tracks/{id}/status

Move track to a different status.

**Request Body:**

```json
{
  "status_id": "new_status_id",
  "step_id": "new_step_id" // optional
}
```

### Album Endpoints

#### GET /api/albums

Get albums with filtering and pagination.

**Query Parameters:**

- `artist_id`: Filter by artist ID
- `search`: Search in album names
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

#### POST /api/albums

Create a new album.

**Request Body:**

```json
{
  "name": "New Album",
  "artist_id": "artist_id",
  "release_date": "2024-06-01", // optional
  "track_ids": ["track1", "track2"] // optional
}
```

#### GET /api/albums/{id}

Get album details with tracks.

#### PUT /api/albums/{id}

Update album information.

#### DELETE /api/albums/{id}

Delete an album.

#### PUT /api/albums/{id}/tracks

Update track order in album.

**Request Body:**

```json
{
  "track_orders": [
    { "track_id": "track1", "order": 1 },
    { "track_id": "track2", "order": 2 }
  ]
}
```

### Template Endpoints

#### GET /api/templates

Get available templates for current user.

#### POST /api/templates

Create a new template.

#### GET /api/templates/{id}

Get template with all statuses and steps.

#### PUT /api/templates/{id}

Update template (only if not published).

#### DELETE /api/templates/{id}

Delete template (only if not published and no tracks using it).

#### POST /api/templates/{id}/publish

Publish a template (makes it immutable).

### File Upload Endpoints

#### POST /api/upload/audio

Upload audio file for a track.

**Request**: Multipart form data

- `track_id`: string
- `name`: string
- `description`: string (optional)
- `category`: string (master, stem, demo, raw)
- `file`: file

#### POST /api/upload/image

Upload image file (album artwork, artist photos).

**Request**: Multipart form data

- `entity_type`: string (album, artist, user)
- `entity_id`: string
- `file`: file

### Notes Endpoints

#### GET /api/notes

Get notes with filtering.

**Query Parameters:**

- `track_id`: Filter by track ID
- `status_id`: Filter by status ID
- `step_id`: Filter by step ID
- `completed`: Filter by completion status

#### POST /api/notes

Create a new note.

#### PUT /api/notes/{id}

Update a note.

#### DELETE /api/notes/{id}

Delete a note.

## Error Handling

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_REQUIRED`: User must be authenticated
- `AUTHORIZATION_DENIED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `RESOURCE_CONFLICT`: Resource already exists or conflict
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

### Error Response Examples

**Validation Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "field_errors": {
      "email": ["Email is required", "Email must be valid"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

**Authorization Error:**

```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_DENIED",
    "message": "You do not have permission to access this resource",
    "details": {
      "required_permission": "update:artist",
      "user_role": "collaborator"
    }
  }
}
```

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **General API endpoints**: 100 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user
- **Search endpoints**: 30 requests per minute per user

Rate limit headers included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Versioning

API versioning strategy options:

1. **URL versioning**: `/api/v1/artists`
2. **Header versioning**: `Accept: application/vnd.musicaid.v1+json`
3. **Query parameter**: `/api/artists?version=1`

Current version: `v1`

## Testing

All endpoints should include:

- Unit tests for business logic
- Integration tests for database operations
- API endpoint tests for request/response validation
- Authentication and authorization tests
- Performance tests for high-load scenarios
