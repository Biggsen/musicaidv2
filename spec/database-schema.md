# Database Schema Specification

## Overview

This document defines the complete database schema for the MusicAid application, including all models, relationships, and constraints. The schema is designed for PostgreSQL using Prisma ORM.

## Schema Design Principles

- **Referential Integrity**: All relationships properly defined with foreign keys
- **Data Consistency**: Appropriate constraints and validations
- **Performance**: Optimized indexes for common queries
- **Scalability**: Schema designed to handle growth
- **Audit Trail**: Created/updated timestamps where needed

## Complete Prisma Schema

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  artists   Artist[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Artist {
  id            String        @id @default(cuid())
  name          String
  slug          String        @unique
  template      Template?     @relation(fields: [templateId], references: [id])
  templateId    String?
  users         User[]
  tracks        Track[]
  albums        Album[]
  steps         Step[]
  trackStatuses TrackStatus[]
  templates     Template[]    @relation("ArtistTemplates")
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("artists")
}

model Track {
  id            String       @id @default(cuid())
  name          String
  key           String       @unique
  artist        Artist       @relation(fields: [artistId], references: [id])
  artistId      String
  template      Template?    @relation(fields: [templateId], references: [id])
  templateId    String?
  trackStatus   TrackStatus? @relation(fields: [trackStatusId], references: [id])
  trackStatusId String?
  step          Step?        @relation(fields: [stepId], references: [id])
  stepId        String?
  tempo         Int?
  minutes       Int?
  seconds       Int?
  location      String       @default("Soundation")
  album         Album?       @relation(fields: [albumId], references: [id])
  albumId       String?
  albumOrder    Int?
  dateCreated   DateTime?
  isrcCode      String?
  liveReady     Boolean      @default(false)
  audios        Audio[]
  notes         Note[]
  records       Record[]
  sessions      Session[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  createdBy     String?
  updatedBy     String?

  @@map("tracks")
}

model Album {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  releaseDate DateTime?
  artist      Artist    @relation(fields: [artistId], references: [id])
  artistId    String
  image       String? // URL to file storage
  tracks      Track[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("albums")
}

model Audio {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  dropboxUrl  String? // Legacy field, will migrate to fileUrl
  fileUrl     String? // S3-compatible storage URL
  mixdownDate DateTime?
  description String?
  track       Track     @relation(fields: [trackId], references: [id])
  trackId     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdBy   String?
  updatedBy   String?

  @@map("audios")
}

model Instrument {
  id          String   @id @default(cuid())
  name        String
  key         String   @unique
  description String?
  records     Record[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("instruments")
}

model Note {
  id            String       @id @default(cuid())
  note          String
  track         Track        @relation(fields: [trackId], references: [id])
  trackId       String
  step          Step?        @relation(fields: [stepId], references: [id])
  stepId        String?
  trackStatus   TrackStatus? @relation(fields: [trackStatusId], references: [id])
  trackStatusId String?
  done          Boolean      @default(false)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  createdBy     String?
  updatedBy     String?

  @@map("notes")
}

model Record {
  id            String       @id @default(cuid())
  track         Track        @relation(fields: [trackId], references: [id])
  trackId       String
  instrument    Instrument   @relation(fields: [instrumentId], references: [id])
  instrumentId  String
  trackStatus   TrackStatus? @relation(fields: [trackStatusId], references: [id])
  trackStatusId String?
  recorded      Boolean      @default(false)
  edited        Boolean      @default(false)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@map("records")
}

model Session {
  id            String       @id @default(cuid())
  track         Track        @relation(fields: [trackId], references: [id])
  trackId       String
  trackStatus   TrackStatus? @relation(fields: [trackStatusId], references: [id])
  trackStatusId String?
  done          Boolean      @default(false)
  editing       Boolean      @default(false)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  createdBy     String?
  updatedBy     String?

  @@map("sessions")
}

model Step {
  id          String      @id @default(cuid())
  name        String
  key         String      @unique
  title       String?
  description String?
  type        StepType    @default(NORMAL)
  artist      Artist?     @relation(fields: [artistId], references: [id])
  artistId    String?
  published   Boolean     @default(false)
  notes       Note[]
  tracks      Track[]
  trackStatuses TrackStatus[] @relation("StepTrackStatuses")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("steps")
}

model Template {
  id          String        @id @default(cuid())
  name        String
  description String?
  statuses    TrackStatus[] @relation("TemplateStatuses")
  artist      Artist?       @relation("ArtistTemplates", fields: [artistId], references: [id])
  artistId    String?
  published   Boolean       @default(false)
  tracks      Track[]
  artists     Artist[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@map("templates")
}

model TrackStatus {
  id          String     @id @default(cuid())
  name        String
  key         String     @unique
  title       String?
  description String?
  steps       Step[]     @relation("StepTrackStatuses")
  artist      Artist?    @relation(fields: [artistId], references: [id])
  artistId    String?
  nonLinear   Boolean    @default(false)
  published   Boolean    @default(false)
  templates   Template[] @relation("TemplateStatuses")
  tracks      Track[]
  notes       Note[]
  records     Record[]
  sessions    Session[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("track_statuses")
}

enum StepType {
  NORMAL
  TEXT
  LIST
  RECORD
}
```

## Model Descriptions

### User

- **Purpose**: System users who can access and manage artist data
- **Key Features**: Authentication, multi-artist access
- **Relationships**: Many-to-many with Artists

### Artist

- **Purpose**: Musical artists or bands being managed
- **Key Features**: Slug for URLs, default templates, multi-user collaboration
- **Relationships**: Has many tracks, albums, templates, and users

### Track

- **Purpose**: Individual songs with comprehensive metadata
- **Key Features**: Workflow tracking, timing info, location tracking, audit trail
- **Relationships**: Belongs to artist and album, has many audio files, notes, records

### Album

- **Purpose**: Collection of tracks for release
- **Key Features**: Release date tracking, album artwork
- **Relationships**: Belongs to artist, has many tracks

### Audio

- **Purpose**: Audio file storage and metadata
- **Key Features**: Support for both legacy Dropbox URLs and new S3-compatible storage
- **Relationships**: Belongs to track

### Instrument

- **Purpose**: Catalog of available instruments for recording
- **Key Features**: Simple name and description
- **Relationships**: Has many records

### Note

- **Purpose**: Comments and notes attached to tracks at various workflow stages
- **Key Features**: Can be marked as done, attached to specific steps or statuses
- **Relationships**: Belongs to track, optionally to step or track status

### Record

- **Purpose**: Individual instrument recordings for tracks
- **Key Features**: Recording and editing status tracking
- **Relationships**: Belongs to track and instrument, optionally to track status

### Session

- **Purpose**: Recording session management
- **Key Features**: Session completion and editing status
- **Relationships**: Belongs to track, optionally to track status

### Step

- **Purpose**: Individual workflow steps within templates
- **Key Features**: Different step types (normal, text, list, record), artist-specific
- **Relationships**: Belongs to artist, used in track statuses

### Template

- **Purpose**: Reusable workflow templates for different project types
- **Key Features**: Contains multiple track statuses, artist-specific or global
- **Relationships**: Belongs to artist, contains track statuses, used by tracks

### TrackStatus

- **Purpose**: Workflow states that tracks can be in
- **Key Features**: Linear or non-linear workflow support, contains multiple steps
- **Relationships**: Contains steps, used by tracks, templates, notes, records, sessions

## Key Relationships

1. **Artist ↔ User**: Many-to-many (collaboration)
2. **Artist → Track**: One-to-many (artist has multiple tracks)
3. **Track → Audio**: One-to-many (track has multiple audio files)
4. **Track → Album**: Many-to-one (multiple tracks per album)
5. **Template → TrackStatus**: Many-to-many (templates contain statuses)
6. **TrackStatus → Step**: Many-to-many (statuses contain steps)

## Indexes and Performance

The schema includes several performance optimizations:

- **Unique constraints** on slugs and keys for fast lookups
- **Foreign key indexes** automatically created by Prisma
- **Composite indexes** may be added based on query patterns

## Migration Considerations

- **Legacy Support**: Audio model supports both `dropboxUrl` (legacy) and `fileUrl` (new)
- **Data Migration**: Existing data will need to be transformed and imported
- **Incremental Migration**: Schema designed to support gradual migration

## Environment Variables Required

```env
DATABASE_URL="postgresql://..."
```

## Next Steps

1. Initialize Prisma in the project
2. Run initial migration to create tables
3. Set up seed data for development
4. Create database access patterns and queries
5. Implement data validation and business rules
