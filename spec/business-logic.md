# Business Logic Specification

## Overview

This document defines the core business logic, workflows, and rules for the MusicAid application. It outlines how the various entities interact and the business processes that govern the music production workflow management system.

## Core Business Concepts

### Music Production Workflow

The application manages the complete lifecycle of music production from initial concept to final release:

1. **Artist Setup** → Create artist profile and invite collaborators
2. **Template Creation** → Define reusable workflow templates
3. **Track Creation** → Start new tracks using templates
4. **Production Process** → Progress through workflow steps
5. **Recording Management** → Track instrument recordings and sessions
6. **Audio Management** → Upload and organize audio files
7. **Album Assembly** → Group tracks into albums
8. **Release Preparation** → Finalize tracks for distribution

### Workflow Management System

The system uses a flexible workflow engine based on:

- **Templates**: Reusable workflow definitions
- **Track Statuses**: Current state of a track in the workflow
- **Steps**: Individual tasks within a status
- **Notes**: Comments and feedback at each stage

## Entity Relationships and Rules

### Artist Management

#### Artist Creation Rules

```typescript
interface ArtistCreationRules {
  // Name requirements
  nameMinLength: 1
  nameMaxLength: 100
  nameUniqueness: false // Multiple artists can have same name

  // Slug generation
  slugGeneration: 'auto' // Auto-generated from name
  slugUniqueness: true // Slugs must be unique

  // Default template
  defaultTemplate: 'optional' // Can assign default template
}
```

#### User-Artist Association Rules

```typescript
interface UserArtistRules {
  // Ownership
  minimumOwners: 1 // At least one owner required
  maximumOwners: 'unlimited'

  // Collaboration
  maximumCollaborators: 50 // Reasonable limit for performance

  // Role changes
  lastOwnerProtection: true // Cannot remove last owner
  selfRoleChange: false // Cannot change own role
}
```

### Track Management

#### Track Creation Rules

```typescript
interface TrackCreationRules {
  // Required fields
  nameRequired: true
  artistRequired: true

  // Optional fields
  templateOptional: true // Can create without template
  albumOptional: true // Can be unassigned initially

  // Auto-generation
  keyGeneration: 'auto' // Auto-generated from name
  initialStatus: 'template_default' | 'first_available'

  // Limits
  nameMaxLength: 200
  tempoRange: [40, 300] // BPM
  durationMaxMinutes: 60 // Reasonable limit
}
```

#### Track Status Progression

```typescript
interface StatusProgressionRules {
  // Linear vs Non-linear
  linearProgression: 'template_defined' // Based on template setting

  // Status changes
  allowBackwardMovement: true // Can move to previous status
  requireStepCompletion: false // Can skip steps if needed

  // Validation
  validateStepRequirements: true // Check if prerequisites met
  notifyStatusChange: true // Notify collaborators
}
```

### Template System

#### Template Structure Rules

```typescript
interface TemplateRules {
  // Template composition
  minimumStatuses: 1 // At least one status required
  maximumStatuses: 20 // Reasonable limit

  // Status ordering
  statusOrder: 'defined' // Order matters for linear workflows

  // Step requirements
  stepsPerStatus: 'unlimited'
  stepTypes: ['normal', 'text', 'list', 'record']

  // Publishing
  publishedImmutable: true // Published templates cannot be modified
  versionControl: false // V1 - no versioning yet
}
```

#### Template Application Rules

```typescript
interface TemplateApplicationRules {
  // Assignment
  artistTemplateScope: true // Templates belong to artists
  globalTemplateScope: false // No global templates in V1

  // Inheritance
  trackInheritsTemplate: true // Tracks inherit artist's default template
  templateOverride: true // Can override template per track

  // Updates
  liveTemplateUpdates: false // Changes don't affect existing tracks
  templateMigration: false // No automatic migration in V1
}
```

## Workflow Engine Logic

### Status Transition Logic

```typescript
class WorkflowEngine {
  async moveTrackToStatus(
    trackId: string,
    targetStatusId: string,
    userId: string
  ): Promise<StatusTransitionResult> {
    // 1. Validate permissions
    await this.validateUserPermission(trackId, userId, 'UPDATE_TRACK')

    // 2. Get current track state
    const track = await this.getTrackWithWorkflow(trackId)

    // 3. Validate transition
    const isValidTransition = await this.validateStatusTransition(
      track.currentStatusId,
      targetStatusId,
      track.templateId
    )

    if (!isValidTransition) {
      throw new WorkflowError('Invalid status transition')
    }

    // 4. Execute transition
    const result = await this.executeStatusTransition(track, targetStatusId, userId)

    // 5. Trigger side effects
    await this.triggerStatusChangeEffects(track, targetStatusId, userId)

    return result
  }

  private async validateStatusTransition(
    currentStatusId: string,
    targetStatusId: string,
    templateId: string
  ): Promise<boolean> {
    const template = await this.getTemplate(templateId)

    // Check if target status exists in template
    const targetStatus = template.statuses.find(s => s.id === targetStatusId)
    if (!targetStatus) return false

    // For linear templates, validate order
    if (!template.nonLinear) {
      const currentIndex = template.statuses.findIndex(s => s.id === currentStatusId)
      const targetIndex = template.statuses.findIndex(s => s.id === targetStatusId)

      // Allow forward movement and backward movement
      return targetIndex >= currentIndex - 1
    }

    return true // Non-linear allows any transition
  }
}
```

### Step Completion Logic

```typescript
interface StepCompletionRules {
  // Completion tracking
  automaticCompletion: false // Manual completion required
  partialCompletion: true // Can complete individual steps

  // Requirements
  requiredSteps: 'template_defined' // Based on step configuration
  optionalSteps: 'template_defined'

  // Validation
  validateStepData: true // Validate step-specific requirements
  allowSkipping: true // Can skip non-required steps
}

class StepManager {
  async completeStep(trackId: string, stepId: string, userId: string, data?: any): Promise<void> {
    // 1. Validate step exists for track
    const trackStep = await this.getTrackStep(trackId, stepId)

    // 2. Validate step requirements
    if (trackStep.type === 'record') {
      await this.validateRecordingRequirements(trackId, stepId)
    }

    // 3. Mark step as complete
    await this.markStepComplete(trackId, stepId, userId, data)

    // 4. Check if status can auto-advance
    await this.checkStatusAutoAdvancement(trackId)
  }
}
```

## Recording Management Logic

### Recording Session Rules

```typescript
interface RecordingSessionRules {
  // Session lifecycle
  sessionStates: ['planned', 'active', 'completed', 'cancelled']

  // Recording requirements
  trackRequired: true
  instrumentRequired: true

  // Status tracking
  recordingStatus: ['not_started', 'in_progress', 'recorded', 'edited']
  editingStatus: ['not_started', 'in_progress', 'completed']

  // Validation
  uniqueTrackInstrument: false // Multiple recordings per track/instrument allowed
  sessionOverlap: true // Multiple sessions can be active
}
```

### Audio File Management Rules

```typescript
interface AudioFileRules {
  // File organization
  categorization: ['master', 'stem', 'demo', 'raw']
  trackAssociation: 'required' // Must be associated with track

  // Version control
  multipleVersions: true // Multiple files per category allowed
  versionNaming: 'timestamp' // Use timestamp for version differentiation

  // Lifecycle
  deletionRules: 'soft_delete' // Mark as deleted, don't remove immediately
  retentionPeriod: 90 // Days before permanent deletion
}
```

## Album Management Logic

### Album Creation Rules

```typescript
interface AlbumRules {
  // Basic requirements
  nameRequired: true
  artistRequired: true

  // Track management
  minimumTracks: 0 // Can create empty album
  maximumTracks: 100 // Reasonable limit
  trackOrdering: 'manual' // Manual track ordering

  // Release management
  releaseDateOptional: true
  releaseStatusTracking: false // V1 - no release status
}
```

### Track-Album Association

```typescript
interface TrackAlbumRules {
  // Assignment
  singleAlbumPerTrack: true // Track can only be in one album
  albumReassignment: true // Can move tracks between albums

  // Ordering
  albumOrderRequired: true // Must specify order when adding to album
  automaticOrdering: true // Auto-assign order if not specified
  orderGaps: true // Allow gaps in ordering (1, 3, 5, etc.)
}
```

## Note and Comment System

### Note Management Rules

```typescript
interface NoteRules {
  // Association
  trackRequired: true
  stepOptional: true // Can be associated with specific step
  statusOptional: true // Can be associated with status

  // Content
  contentRequired: true
  contentMaxLength: 10000 // Reasonable limit for notes

  // Status
  completionTracking: true // Notes can be marked as done
  editability: 'author_only' // Only author can edit

  // Visibility
  visibility: 'track_collaborators' // Visible to all track collaborators
}
```

## Permission and Access Control Logic

### Resource Access Rules

```typescript
interface AccessControlRules {
  // Artist-based access
  artistAccess: 'explicit' // Must be explicitly granted access
  inheritedAccess: true // Track/album access inherited from artist

  // Permission inheritance
  ownerPermissions: 'all' // Owners have all permissions
  collaboratorPermissions: 'limited' // Collaborators have subset

  // Resource creation
  createInArtist: 'collaborator_allowed' // Collaborators can create tracks
  deleteRestriction: 'owner_only' // Only owners can delete
}
```

## Business Rule Validation

### Data Validation Rules

```typescript
class BusinessRuleValidator {
  async validateTrackCreation(data: TrackCreationData): Promise<ValidationResult> {
    const errors: ValidationError[] = []

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Track name is required' })
    }

    if (data.name && data.name.length > 200) {
      errors.push({ field: 'name', message: 'Track name too long' })
    }

    // Tempo validation
    if (data.tempo && (data.tempo < 40 || data.tempo > 300)) {
      errors.push({ field: 'tempo', message: 'Tempo must be between 40 and 300 BPM' })
    }

    // Duration validation
    if (data.minutes && data.minutes > 60) {
      errors.push({ field: 'minutes', message: 'Duration cannot exceed 60 minutes' })
    }

    // Artist access validation
    const hasArtistAccess = await this.validateArtistAccess(data.artistId, data.userId)

    if (!hasArtistAccess) {
      errors.push({ field: 'artistId', message: 'No access to specified artist' })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
```

## Notification and Event System

### Event Types

```typescript
enum BusinessEvent {
  // Track events
  TRACK_CREATED = 'track.created',
  TRACK_STATUS_CHANGED = 'track.status_changed',
  TRACK_COMPLETED = 'track.completed',

  // Recording events
  RECORDING_STARTED = 'recording.started',
  RECORDING_COMPLETED = 'recording.completed',

  // Collaboration events
  USER_INVITED = 'user.invited',
  USER_JOINED = 'user.joined',

  // File events
  AUDIO_UPLOADED = 'audio.uploaded',
  AUDIO_PROCESSED = 'audio.processed',
}
```

### Event Handling Logic

```typescript
class EventManager {
  async handleTrackStatusChange(event: TrackStatusChangeEvent): Promise<void> {
    const { trackId, oldStatusId, newStatusId, userId } = event

    // 1. Log the change
    await this.logStatusChange(trackId, oldStatusId, newStatusId, userId)

    // 2. Notify collaborators
    await this.notifyCollaborators(trackId, 'status_change', {
      oldStatus: oldStatusId,
      newStatus: newStatusId,
      changedBy: userId,
    })

    // 3. Check for completion
    if (await this.isTrackCompleted(trackId)) {
      await this.handleTrackCompletion(trackId)
    }

    // 4. Update analytics
    await this.updateWorkflowAnalytics(trackId, newStatusId)
  }
}
```

## Data Consistency Rules

### Referential Integrity

```typescript
interface ConsistencyRules {
  // Cascade deletion
  artistDeletion: 'cascade_tracks_albums' // Delete related data
  trackDeletion: 'cascade_notes_audio' // Delete associated files

  // Orphan prevention
  preventOrphanTracks: true // Tracks must have artist
  preventOrphanNotes: true // Notes must have track

  // Status consistency
  validateStatusExists: true // Status must exist in template
  validateStepExists: true // Step must exist in status
}
```

### Transaction Management

```typescript
class TransactionManager {
  async createTrackWithDefaults(data: TrackCreationData): Promise<Track> {
    return await this.db.transaction(async tx => {
      // 1. Create track
      const track = await tx.track.create({ data })

      // 2. Apply template defaults
      if (data.templateId) {
        await this.applyTemplateDefaults(tx, track.id, data.templateId)
      }

      // 3. Create initial notes if specified
      if (data.initialNotes) {
        await this.createInitialNotes(tx, track.id, data.initialNotes)
      }

      // 4. Set initial status
      await this.setInitialStatus(tx, track.id, data.templateId)

      return track
    })
  }
}
```

## Performance and Scalability Rules

### Query Optimization Rules

```typescript
interface QueryRules {
  // Pagination
  defaultPageSize: 20
  maxPageSize: 100

  // Eager loading
  defaultIncludes: ['artist', 'trackStatus'] // Always include these
  optionalIncludes: ['notes', 'audios'] // Include when needed

  // Caching
  cacheStaticData: true // Cache templates, statuses, steps
  cacheUserData: false // Don't cache user-specific data
}
```

## Error Handling and Recovery

### Business Logic Errors

```typescript
class BusinessLogicError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message)
  }
}

// Error types
enum BusinessErrorCode {
  INVALID_WORKFLOW_TRANSITION = 'INVALID_WORKFLOW_TRANSITION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
}
```

## Implementation Guidelines

### Service Layer Architecture

```typescript
// Service classes handle business logic
class TrackService {
  constructor(
    private db: DatabaseClient,
    private validator: BusinessRuleValidator,
    private eventManager: EventManager,
    private permissionManager: PermissionManager
  ) {}

  async createTrack(data: TrackCreationData, userId: string): Promise<Track> {
    // 1. Validate permissions
    await this.permissionManager.requireArtistAccess(data.artistId, userId)

    // 2. Validate business rules
    const validation = await this.validator.validateTrackCreation(data)
    if (!validation.isValid) {
      throw new BusinessLogicError('VALIDATION_FAILED', 'Invalid track data', validation.errors)
    }

    // 3. Execute business logic
    const track = await this.executeTrackCreation(data, userId)

    // 4. Emit events
    await this.eventManager.emit('TRACK_CREATED', { trackId: track.id, userId })

    return track
  }
}
```

This business logic specification provides the foundation for implementing the core functionality of the MusicAid application while maintaining data consistency, enforcing business rules, and providing a scalable architecture.
