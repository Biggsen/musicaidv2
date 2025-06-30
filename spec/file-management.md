# File Management Specification

## Overview

This document defines the file management system for the MusicAid application, focusing on audio files and images. The system uses S3-compatible storage for cost-effective file storage and management.

## File Storage Architecture

### S3-Compatible Storage
- **Primary Storage**: S3-compatible storage for all file uploads (AWS S3, MinIO, Backblaze B2, etc.)
- **CDN Integration**: CloudFront or similar for global distribution
- **Cost Efficiency**: Pay-as-you-go pricing model
- **Security**: Signed URLs for secure access

### File Organization Structure
```
/audio/
  /{artistId}/
    /{trackId}/
      /masters/
      /stems/
      /demos/
      /raw/
/images/
  /albums/
    /{albumId}/
  /artists/
    /{artistId}/
  /avatars/
    /{userId}/
```

## File Types and Limits

### Audio Files
**Supported Formats**:
- MP3 (up to 320kbps)
- WAV (up to 96kHz/24-bit)
- FLAC (lossless compression)
- M4A/AAC (up to 320kbps)

**File Size Limits**:
- **Maximum Size**: 100MB per file
- **Recommended Size**: Under 50MB for optimal performance
- **Total Storage**: Starts with 1GB free tier

**Quality Guidelines**:
- **Demo/Reference**: MP3 128-192kbps
- **Working Files**: WAV 44.1kHz/16-bit
- **Master Files**: WAV 48kHz/24-bit or higher

### Image Files
**Supported Formats**:
- JPEG (optimized for photos)
- PNG (optimized for graphics with transparency)
- WebP (modern format for web)

**File Size Limits**:
- **Maximum Size**: 10MB per file
- **Recommended Size**: Under 2MB
- **Dimensions**: Up to 4096x4096 pixels

**Use Cases**:
- Album artwork (1400x1400px recommended)
- Artist photos
- User avatars (400x400px recommended)

## File Upload System

### Upload Flow
1. **Client-side validation** of file type and size
2. **Generate signed upload URL** from S3-compatible storage
3. **Direct upload** to file storage
4. **Create database record** with file metadata
5. **Process file** (if needed) for optimization
6. **Update UI** with upload status

### Upload API Endpoints

#### POST /api/upload/audio
Upload audio file for a track.

**Request**:
```typescript
interface AudioUploadRequest {
  trackId: string;
  name: string;
  description?: string;
  category: 'master' | 'stem' | 'demo' | 'raw';
  file: File;
}
```

**Response**:
```typescript
interface AudioUploadResponse {
  success: true;
  data: {
    id: string;
    name: string;
    fileUrl: string;
    downloadUrl: string;
    size: number;
    duration?: number; // in seconds
    format: string;
    category: string;
  };
}
```

#### POST /api/upload/image
Upload image file (album artwork, artist photos).

**Request**:
```typescript
interface ImageUploadRequest {
  entityType: 'album' | 'artist' | 'user';
  entityId: string;
  file: File;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

**Response**:
```typescript
interface ImageUploadResponse {
  success: true;
  data: {
    id: string;
    fileUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    size: number;
  };
}
```

### File Processing

#### Audio Processing
```typescript
interface AudioMetadata {
  duration: number; // seconds
  bitrate: number; // kbps
  sampleRate: number; // Hz
  channels: number; // 1 = mono, 2 = stereo
  format: string; // 'mp3', 'wav', 'flac'
  size: number; // bytes
}
```

**Processing Steps**:
1. Extract metadata using Web Audio API or server-side tools
2. Generate waveform visualization data
3. Create compressed preview version (if needed)
4. Store metadata in database

#### Image Processing
```typescript
interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
}
```

**Processing Steps**:
1. Extract image metadata
2. Generate thumbnails (multiple sizes)
3. Optimize for web (compression, format conversion)
4. Store metadata in database

## Database Schema

### Audio Files
```prisma
model Audio {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  fileUrl     String    // S3-compatible storage URL
  downloadUrl String?   // Signed download URL
  track       Track     @relation(fields: [trackId], references: [id])
  trackId     String
  
  // File metadata
  size        Int       // bytes
  format      String    // 'mp3', 'wav', 'flac'
  duration    Float?    // seconds
  bitrate     Int?      // kbps
  sampleRate  Int?      // Hz
  channels    Int?      // 1 = mono, 2 = stereo
  category    AudioCategory @default(DEMO)
  
  // Processing status
  status      ProcessingStatus @default(PENDING)
  waveformData String?  // JSON array of waveform points
  
  // Metadata
  description String?
  mixdownDate DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdBy   String?
  updatedBy   String?

  @@map("audios")
}

enum AudioCategory {
  MASTER
  STEM
  DEMO
  RAW
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

### Image Files
```prisma
model Image {
  id          String    @id @default(cuid())
  fileUrl     String    // Original image URL
  thumbnailUrl String?  // Thumbnail URL
  
  // Relationships (polymorphic)
  entityType  String    // 'album', 'artist', 'user'
  entityId    String    // ID of the related entity
  
  // File metadata
  filename    String
  size        Int       // bytes
  width       Int       // pixels
  height      Int       // pixels
  format      String    // 'jpeg', 'png', 'webp'
  aspectRatio Float
  
  // Processing status
  status      ProcessingStatus @default(PENDING)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("images")
  @@index([entityType, entityId])
}
```

## File Access and Security

### Access Control
- **Authentication Required**: All file access requires valid session
- **Permission-Based**: Users can only access files for artists they have access to
- **Signed URLs**: Time-limited URLs for secure access
- **Rate Limiting**: Upload and download rate limits

### URL Generation
```typescript
// lib/fileAccess.ts
export async function generateSignedUrl(
  fileId: string,
  userId: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  // 1. Verify user has access to the file
  const file = await verifyFileAccess(fileId, userId);
  
  // 2. Generate signed URL from S3-compatible storage
  const signedUrl = await generateSignedUrl(file.fileUrl, expiresIn);
  
  return signedUrl;
}

export async function verifyFileAccess(
  fileId: string,
  userId: string
): Promise<Audio | Image> {
  // Check if user has access to the artist/track associated with the file
  const file = await db.audio.findUnique({
    where: { id: fileId },
    include: {
      track: {
        include: {
          artist: {
            include: {
              users: true
            }
          }
        }
      }
    }
  });
  
  if (!file) {
    throw new Error('File not found');
  }
  
  const hasAccess = file.track.artist.users.some(u => u.id === userId);
  if (!hasAccess) {
    throw new Error('Access denied');
  }
  
  return file;
}
```

## Frontend Components

### AudioUpload Component
```tsx
interface AudioUploadProps {
  trackId: string;
  category: AudioCategory;
  onUpload: (audio: Audio) => void;
  onError: (error: string) => void;
  maxSize?: number; // MB
  acceptedFormats?: string[];
}

export const AudioUpload: React.FC<AudioUploadProps> = ({
  trackId,
  category,
  onUpload,
  onError,
  maxSize = 100,
  acceptedFormats = ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/m4a']
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleFileSelect = async (file: File) => {
    // Validate file
    if (!acceptedFormats.includes(file.type)) {
      onError('Unsupported file format');
      return;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      onError(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }
    
    // Upload file
    setUploading(true);
    try {
      const result = await uploadAudioFile(file, trackId, category, setProgress);
      onUpload(result);
    } catch (error) {
      onError(error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      {uploading ? (
        <div className="text-center">
          <div className="mb-2">Uploading...</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            <div className="text-gray-600 mb-2">
              Click to upload or drag and drop
            </div>
            <div className="text-sm text-gray-500">
              {acceptedFormats.map(f => f.split('/')[1]).join(', ')} up to {maxSize}MB
            </div>
          </label>
        </div>
      )}
    </div>
  );
};
```

### AudioPlayer Component
```tsx
interface AudioPlayerProps {
  audio: Audio;
  autoPlay?: boolean;
  showWaveform?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audio,
  autoPlay = false,
  showWaveform = true,
  onPlay,
  onPause,
  onEnded
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Audio player implementation
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium">{audio.name}</h3>
          <div className="text-sm text-gray-500">
            {audio.format.toUpperCase()} • {formatFileSize(audio.size)} • {formatDuration(duration)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={isPlaying ? pause : play}
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <a
            href={audio.downloadUrl}
            download={audio.name}
            className="text-gray-600 hover:text-gray-800"
          >
            <DownloadIcon />
          </a>
        </div>
      </div>
      
      {showWaveform && audio.waveformData && (
        <Waveform
          data={JSON.parse(audio.waveformData)}
          currentTime={currentTime}
          duration={duration}
          onSeek={seekTo}
        />
      )}
      
      <audio
        ref={audioRef}
        src={audio.fileUrl}
        onPlay={() => { setIsPlaying(true); onPlay?.(); }}
        onPause={() => { setIsPlaying(false); onPause?.(); }}
        onEnded={() => { setIsPlaying(false); onEnded?.(); }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  );
};
```

### ImageUpload Component
```tsx
interface ImageUploadProps {
  entityType: 'album' | 'artist' | 'user';
  entityId: string;
  currentImage?: string;
  aspectRatio?: number; // width/height ratio
  onUpload: (imageUrl: string) => void;
  onError: (error: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  entityType,
  entityId,
  currentImage,
  aspectRatio,
  onUpload,
  onError
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  
  const handleFileSelect = async (file: File) => {
    // Validate and upload image
    // Implementation similar to AudioUpload
  };
  
  return (
    <div className="space-y-4">
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
            style={{ aspectRatio }}
          />
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="block w-full text-center py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
      >
        {uploading ? 'Uploading...' : 'Choose Image'}
      </label>
    </div>
  );
};
```

## File Management API

### File Listing
```typescript
// GET /api/files/audio?trackId={trackId}
export async function getTrackAudio(trackId: string, userId: string) {
  // Verify access and return audio files
  const files = await db.audio.findMany({
    where: {
      trackId,
      track: {
        artist: {
          users: {
            some: { id: userId }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return files;
}
```

### File Deletion
```typescript
// DELETE /api/files/audio/{id}
export async function deleteAudioFile(fileId: string, userId: string) {
  // 1. Verify access
  const file = await verifyFileAccess(fileId, userId);
  
  // 2. Delete from file storage
  await deleteFile(file.fileUrl);
  
  // 3. Delete from database
  await db.audio.delete({
    where: { id: fileId }
  });
}
```

## Error Handling

### Upload Errors
- **File too large**: Exceed size limits
- **Unsupported format**: Invalid file type
- **Upload failed**: Network or storage errors
- **Processing failed**: Metadata extraction errors

### Access Errors
- **File not found**: Invalid file ID
- **Access denied**: Insufficient permissions
- **Expired URL**: Signed URL has expired

## Performance Optimization

### Caching Strategy
- **CDN Caching**: CloudFront or similar CDN for global distribution
- **Browser Caching**: Appropriate cache headers
- **Metadata Caching**: Cache file metadata in database

### Lazy Loading
- **Progressive Loading**: Load files as needed
- **Thumbnail Generation**: Small previews for quick loading
- **Streaming**: Stream large audio files

## Monitoring and Analytics

### File Usage Tracking
- Upload/download statistics
- Storage usage monitoring
- Performance metrics
- Error rate tracking

### Cost Optimization
- Regular cleanup of unused files
- Compression optimization
- Usage-based storage management
- Cost alerts and limits

## Implementation Checklist

### Phase 1: Basic File Upload
- [ ] Set up S3-compatible storage
- [ ] Implement audio upload endpoint
- [ ] Create file database schema
- [ ] Build upload UI components

### Phase 2: File Processing
- [ ] Add metadata extraction
- [ ] Implement image processing
- [ ] Create thumbnail generation
- [ ] Add waveform generation

### Phase 3: Access Control
- [ ] Implement permission checking
- [ ] Add signed URL generation
- [ ] Create file access API
- [ ] Add download tracking

### Phase 4: Optimization
- [ ] Add file compression
- [ ] Implement caching
- [ ] Add monitoring
- [ ] Optimize performance 