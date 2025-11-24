# File Management Specification

## Overview

This document defines the file management system for the MusicAid application, focusing on audio files and images. The system uses cloud object storage for cost-effective, scalable file storage and management.

## File Storage Architecture

### Cloud Object Storage

- **Primary Storage**: S3-compatible object storage for all file uploads (AWS S3, Google Cloud Storage, Azure Blob Storage, MinIO, Backblaze B2, etc.)
- **CDN Integration**: Content Delivery Network for global distribution and caching
- **Cost Efficiency**: Pay-as-you-go pricing model with tiered storage options
- **Security**: Signed URLs for secure access and time-limited downloads
- **Redundancy**: Multi-zone replication for data durability

### File Organization Structure

```
/audio/
  /{artist_id}/
    /{track_id}/
      /masters/
      /stems/
      /demos/
      /raw/
      /archive/
/images/
  /albums/
    /{album_id}/
      /artwork/
      /thumbnails/
  /artists/
    /{artist_id}/
      /photos/
      /logos/
  /avatars/
    /{user_id}/
/temp/
  /{upload_session_id}/
```

### Storage Tiers

- **Hot Storage**: Frequently accessed files (recent uploads, active projects)
- **Cool Storage**: Infrequently accessed files (older projects, archived content)
- **Archive Storage**: Long-term storage for completed projects (lowest cost)

## File Types and Limits

### Audio Files

**Supported Formats**:

- **MP3**: Up to 320kbps CBR/VBR
- **WAV**: Up to 192kHz/32-bit (48kHz/24-bit recommended)
- **FLAC**: Lossless compression
- **M4A/AAC**: Up to 320kbps
- **OGG**: Vorbis and Opus codecs
- **AIFF**: Apple's audio format

**File Size Limits**:

- **Maximum Size**: 500MB per file (configurable)
- **Recommended Size**: Under 100MB for optimal performance
- **Batch Upload**: Up to 2GB total per batch
- **Total Storage**: Configurable per plan/user

**Quality Guidelines**:

- **Demo/Reference**: MP3 128-192kbps or AAC equivalent
- **Working Files**: WAV 44.1kHz/16-bit minimum
- **Master Files**: WAV 48kHz/24-bit or higher
- **Archive Files**: FLAC for lossless compression

### Image Files

**Supported Formats**:

- **JPEG**: Optimized for photographs and complex images
- **PNG**: Optimized for graphics with transparency
- **WebP**: Modern format with superior compression
- **AVIF**: Next-generation format (where supported)
- **SVG**: Vector graphics (with sanitization)

**File Size Limits**:

- **Maximum Size**: 25MB per file
- **Recommended Size**: Under 5MB
- **Dimensions**: Up to 8192x8192 pixels
- **Thumbnail Generation**: Automatic for images > 1MB

**Use Cases**:

- **Album Artwork**: 1400x1400px minimum, square aspect ratio
- **Artist Photos**: Various aspect ratios, minimum 800px width
- **User Avatars**: 400x400px recommended, square aspect ratio
- **Thumbnails**: Auto-generated in multiple sizes (150px, 300px, 600px)

## File Upload System

### Upload Architecture

**Upload Methods**:

- **Direct Upload**: Client uploads directly to object storage using signed URLs
- **Chunked Upload**: Large files uploaded in chunks for reliability
- **Resume Upload**: Interrupted uploads can be resumed
- **Background Processing**: Post-upload processing for optimization

### Upload Flow

1. **Client Request**: Request upload permission with file metadata
2. **Server Validation**: Validate file type, size, and user permissions
3. **Signed URL Generation**: Generate time-limited upload URL
4. **Direct Upload**: Client uploads directly to object storage
5. **Upload Completion**: Notify server of successful upload
6. **Database Record**: Create file record with metadata
7. **Post-Processing**: Process file (if needed) for optimization
8. **Notification**: Update client with final file information

### Upload API Endpoints

#### POST /api/upload/initialize

Initialize file upload and get signed URL.

**Request**:

```json
{
  "file_name": "final_mix_v2.wav",
  "file_size": 45678900,
  "content_type": "audio/wav",
  "entity_type": "track",
  "entity_id": "track_123",
  "category": "master",
  "description": "Final mix version 2"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "upload_id": "upload_456",
    "upload_url": "https://storage.example.com/...",
    "upload_fields": {
      "key": "audio/artist_123/track_123/masters/final_mix_v2.wav",
      "policy": "...",
      "signature": "..."
    },
    "expires_at": "2024-01-01T01:00:00Z"
  }
}
```

#### POST /api/upload/complete

Complete file upload and create database record.

**Request**:

```json
{
  "upload_id": "upload_456",
  "file_key": "audio/artist_123/track_123/masters/final_mix_v2.wav",
  "file_size": 45678900,
  "etag": "d41d8cd98f00b204e9800998ecf8427e"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "audio_789",
    "name": "Final Mix v2",
    "file_url": "https://cdn.example.com/audio/...",
    "download_url": "https://api.example.com/api/files/audio_789/download",
    "metadata": {
      "size": 45678900,
      "duration": 187.5,
      "format": "wav",
      "bitrate": 1536,
      "sample_rate": 48000,
      "channels": 2
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/upload/multipart/initialize

Initialize multipart upload for large files.

**Request**:

```json
{
  "file_name": "large_session.wav",
  "file_size": 524288000,
  "content_type": "audio/wav",
  "entity_type": "track",
  "entity_id": "track_123",
  "part_size": 10485760
}
```

### File Processing

#### Audio Processing

```typescript
interface AudioMetadata {
  duration: number // seconds
  bitrate: number // kbps
  sample_rate: number // Hz
  channels: number // 1 = mono, 2 = stereo
  format: string // 'mp3', 'wav', 'flac'
  size: number // bytes
  codec?: string // specific codec information
  bit_depth?: number // for uncompressed formats
}
```

**Processing Pipeline**:

1. **Metadata Extraction**: Extract audio properties using audio processing libraries
2. **Waveform Generation**: Generate visual waveform data for UI display
3. **Thumbnail Creation**: Generate spectrogram images for audio visualization
4. **Format Conversion**: Optional conversion to standardized formats
5. **Compression**: Create compressed versions for streaming/previews
6. **Validation**: Verify file integrity and format compliance

#### Image Processing

```typescript
interface ImageMetadata {
  width: number
  height: number
  format: string // 'jpeg', 'png', 'webp'
  size: number // bytes
  aspect_ratio: number
  color_space?: string
  dpi?: number
  has_transparency?: boolean
}
```

**Processing Pipeline**:

1. **Metadata Extraction**: Extract image properties and EXIF data
2. **Thumbnail Generation**: Create multiple sizes (150px, 300px, 600px, 1200px)
3. **Format Optimization**: Convert to modern formats (WebP, AVIF) where supported
4. **Compression**: Optimize file size while maintaining quality
5. **Watermarking**: Optional watermarking for copyright protection
6. **Validation**: Verify image integrity and scan for malicious content

## Database Schema

### File Storage Models

```typescript
interface AudioFile {
  id: string
  name: string
  slug: string
  track_id: string

  // Storage information
  file_key: string // Object storage key
  file_url: string // CDN URL
  download_url: string // Signed download URL

  // File metadata
  size: number // bytes
  format: string // 'mp3', 'wav', 'flac'
  duration?: number // seconds
  bitrate?: number // kbps
  sample_rate?: number // Hz
  channels?: number // 1 = mono, 2 = stereo
  bit_depth?: number // for uncompressed formats

  // Organization
  category: 'master' | 'stem' | 'demo' | 'raw' | 'archive'
  description?: string

  // Processing status
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_error?: string

  // Audit fields
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by?: string
}

interface ImageFile {
  id: string
  name: string
  entity_type: 'album' | 'artist' | 'user'
  entity_id: string

  // Storage information
  file_key: string
  file_url: string
  thumbnail_urls: {
    small: string
    medium: string
    large: string
  }

  // File metadata
  size: number
  format: string
  width: number
  height: number
  aspect_ratio: number

  // Processing status
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_error?: string

  // Audit fields
  created_at: Date
  updated_at: Date
  created_by: string
}

interface FileUpload {
  id: string
  upload_key: string
  file_name: string
  file_size: number
  content_type: string

  // Upload status
  status: 'initialized' | 'uploading' | 'completed' | 'failed' | 'expired'
  upload_url?: string
  expires_at: Date

  // Progress tracking
  bytes_uploaded: number
  chunks_completed?: number
  total_chunks?: number

  // Error information
  error_message?: string
  error_code?: string

  // Associated entity
  entity_type: string
  entity_id: string

  // Audit fields
  created_at: Date
  updated_at: Date
  created_by: string
}
```

## File Access and Security

### Access Control

**Permission-Based Access**:

- Files inherit permissions from parent entities (track, album, artist)
- Users can only access files for artists they collaborate with
- Role-based permissions for different file operations

**File Operations**:

- **Read**: View file metadata and generate download URLs
- **Upload**: Add new files to entities user has access to
- **Delete**: Remove files (usually restricted to owners)
- **Update**: Modify file metadata and descriptions

### Signed URLs

**Download URLs**:

- Time-limited signed URLs for secure downloads
- Configurable expiration (1 hour default, up to 7 days)
- IP-based restrictions (optional)
- Single-use URLs for sensitive content

**Upload URLs**:

- Pre-signed URLs for direct-to-storage uploads
- Short expiration (15 minutes default)
- Size and content-type restrictions
- Callback URL for completion notification

### Security Measures

**File Validation**:

- Content-type verification
- File signature validation
- Malware scanning for uploaded files
- Size and format restrictions

**Access Logging**:

- Log all file access and modifications
- Track download patterns and unusual activity
- Audit trail for file deletions
- Integration with security monitoring systems

## Performance Optimization

### Caching Strategy

**CDN Caching**:

- Static files cached at edge locations globally
- Cache headers for optimal browser caching
- Automatic cache invalidation on file updates
- Separate cache policies for different file types

**Application Caching**:

- File metadata cached in application layer
- Signed URL caching with automatic refresh
- Thumbnail URLs cached for quick access
- Search index caching for file discovery

### Optimization Techniques

**Lazy Loading**:

- Load audio/image files only when needed
- Progressive loading for large files
- Thumbnail previews before full resolution
- Streaming for audio playback

**Compression**:

- Automatic compression for supported formats
- Multiple quality levels for different use cases
- Modern format support (WebP, AVIF, Opus)
- Lossless compression for archival storage

## File Management API

### File Operations

#### GET /api/files/audio/{id}

Get audio file metadata and download URL.

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "audio_123",
    "name": "Final Mix",
    "track": {
      "id": "track_456",
      "name": "Song Title"
    },
    "metadata": {
      "size": 45678900,
      "duration": 187.5,
      "format": "wav",
      "bitrate": 1536,
      "sample_rate": 48000,
      "channels": 2
    },
    "download_url": "https://storage.example.com/...",
    "waveform_url": "https://cdn.example.com/waveforms/...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/files/audio/{id}

Delete audio file and remove from storage.

#### PUT /api/files/audio/{id}

Update audio file metadata.

**Request**:

```json
{
  "name": "Updated Mix Name",
  "description": "Updated description",
  "category": "master"
}
```

#### GET /api/files/images/{id}

Get image file metadata and URLs.

#### POST /api/files/batch-delete

Delete multiple files in a single operation.

**Request**:

```json
{
  "file_ids": ["audio_123", "audio_456", "image_789"],
  "confirm": true
}
```

### File Search and Discovery

#### GET /api/files/search

Search for files across all accessible entities.

**Query Parameters**:

- `q`: Search query (file names, descriptions)
- `type`: File type filter ('audio', 'image')
- `format`: File format filter ('mp3', 'wav', 'jpeg', etc.)
- `entity_type`: Entity type filter ('track', 'album', 'artist')
- `entity_id`: Specific entity ID
- `date_from`: Files created after date
- `date_to`: Files created before date
- `size_min`: Minimum file size
- `size_max`: Maximum file size
- `page`: Page number
- `limit`: Results per page

## Storage Management

### Cleanup and Maintenance

**Automated Cleanup**:

- Remove expired upload sessions
- Clean up temporary files
- Archive old files to cheaper storage tiers
- Remove orphaned files without database records

**Storage Monitoring**:

- Track storage usage per user/artist
- Monitor upload/download patterns
- Alert on unusual storage consumption
- Generate storage usage reports

### Backup and Recovery

**Backup Strategy**:

- Cross-region replication for critical files
- Regular backup verification
- Point-in-time recovery capabilities
- Automated backup testing

**Disaster Recovery**:

- Multi-region storage setup
- Recovery time objectives (RTO) planning
- Data integrity verification
- Failover procedures documentation

## Implementation Guidelines

### Framework Considerations

**Backend Implementation**:

- Use cloud SDK for object storage operations
- Implement async processing for file operations
- Use job queues for background processing
- Implement retry logic for failed operations

**Frontend Implementation**:

- Use direct-to-storage uploads to reduce server load
- Implement progress indicators for uploads
- Support drag-and-drop file uploads
- Provide file preview capabilities

### Error Handling

**Upload Errors**:

- Network interruption recovery
- File size limit exceeded
- Invalid file format
- Permission denied

**Processing Errors**:

- Corrupted file handling
- Unsupported format errors
- Processing timeout
- Insufficient storage space

### Testing Strategy

**Unit Tests**:

- File validation functions
- Metadata extraction
- Permission checking
- URL generation

**Integration Tests**:

- File upload workflows
- Processing pipelines
- Storage operations
- API endpoints

**Performance Tests**:

- Large file uploads
- Concurrent upload handling
- CDN performance
- Database query optimization

This specification provides a comprehensive, technology-agnostic approach to file management that can be implemented using any cloud storage provider and backend framework while ensuring security, performance, and scalability.
