# Idea: Review Step with Timestamped Notes

## Status: Idea / Concept

This feature adds a new workflow step type 'REVIEW' that allows users to create timestamped notes while listening to audio tracks during the review process.

## Objective

Enable a structured review workflow where users can:
- Initiate a review session for a track
- Listen to audio while creating notes at specific timestamps
- Collect all review notes together
- Jump back to specific timestamps to listen to exact points in the song

## Use Case

During track review, users currently make notes like:

```
00:48
lead is nice. recording that live would be cool. 
persist with a hihat/perc pattern here for gradual build up towards the main beat.
even a soft pad or keyboard stabs with the rhythm guitar?

01:12
quiet, choppy part to prepare for the main beat. I like it. Bass finally stutters instead of droning. guitar could be muffled and scratchy, real raw.

01:24
this fails. prolongs the arrival of main beat too long and has little character. I do like the solitary guitar note at the very end. The bass in this section is weak and muddy.
```

With this feature:
- Review is a workflow step type
- When a track is at a REVIEW step, a Review panel appears
- User can "Start Review" which creates a review session
- While listening, user can click "Add Note at Current Time"
- Notes are automatically timestamped and grouped in the review
- User can click any timestamp to jump to that exact point in the audio

## Features

### 1. Review Step Type

- [ ] Add 'REVIEW' as a new step type in the workflow system
- [ ] Update database schema to allow REVIEW step type
- [ ] Display Review panel when track's current step is type REVIEW

### 2. Review Session Management

- [ ] Create reviews table to store review sessions
- [ ] Link reviews to tracks and steps
- [ ] Allow multiple reviews per track/step
- [ ] Track which audio file is being reviewed

### 3. Timestamped Notes

- [ ] Add `timestamp_seconds` field to notes table
- [ ] Add `review_id` foreign key to link notes to reviews
- [ ] Create notes with current audio playback timestamp
- [ ] Display timestamps in readable format (MM:SS)

### 4. Review Panel UI

- [ ] Create ReviewPanel component
- [ ] Show "Start Review" button when no active review
- [ ] Display audio player with timestamp display
- [ ] Add "Add Note at Current Time" button
- [ ] Show list of all notes in review with clickable timestamps
- [ ] Implement jump-to-timestamp functionality

### 5. Audio Playback Integration

- [ ] Track current playback time
- [ ] Capture timestamp when adding note
- [ ] Seek audio player to timestamp when clicking note
- [ ] Display current time in MM:SS format

## Technical Implementation

### Database Schema

**Migration: `015_add_review_step_type_and_reviews.sql`**

```sql
-- Update step type constraint to include REVIEW
ALTER TABLE public.steps DROP CONSTRAINT IF EXISTS steps_type_check;
ALTER TABLE public.steps ADD CONSTRAINT steps_type_check 
  CHECK (type IN ('NORMAL', 'TEXT', 'LIST', 'RECORD', 'REVIEW'));

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.steps(id) ON DELETE SET NULL,
  audio_file_id UUID REFERENCES public.audios(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add review fields to notes
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS timestamp_seconds DECIMAL(10,2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_track_id ON public.reviews(track_id);
CREATE INDEX IF NOT EXISTS idx_reviews_step_id ON public.reviews(step_id);
CREATE INDEX IF NOT EXISTS idx_notes_review_id ON public.notes(review_id);
CREATE INDEX IF NOT EXISTS idx_notes_timestamp ON public.notes(timestamp_seconds);
```

### Type Definitions

**Update `types/index.ts` and `composables/useWorkflow.ts`:**

```typescript
// Update Step type to include REVIEW
type: 'NORMAL' | 'TEXT' | 'LIST' | 'RECORD' | 'REVIEW'

// Add Review types
export interface Review {
  id: string
  track_id: string
  step_id: string | null
  audio_file_id: string | null
  title: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface ReviewInsert {
  track_id: string
  step_id?: string | null
  audio_file_id?: string | null
  title?: string | null
  created_by?: string | null
}

// Update Note interface
export interface Note {
  // ... existing fields
  review_id?: string | null
  timestamp_seconds?: number | null
}
```

### New Composables

**Create `composables/useReviews.ts`:**

Functions needed:
- `getReviews(trackId: string, stepId?: string)` - Get all reviews for a track/step
- `createReview(review: ReviewInsert)` - Create a new review
- `updateReview(id: string, updates: ReviewUpdate)` - Update review
- `deleteReview(id: string)` - Delete review
- `getReviewNotes(reviewId: string)` - Get all notes for a review
- `createReviewNote(reviewId: string, timestamp: number, note: string)` - Create timestamped note

### Components

**Create `components/ReviewPanel.vue`:**

- Detect when current step type is REVIEW
- Show review interface with:
  - Audio file selector (if multiple files)
  - Audio player with current time display
  - "Add Note at Current Time" button
  - List of review notes sorted by timestamp
  - Click timestamp to seek to that point
  - Edit/delete notes functionality

### Integration Points

**Update `pages/tracks/[id]/index.vue`:**

- Check if current step type is 'REVIEW'
- Show ReviewPanel component when in REVIEW step
- Hide or show alongside normal workflow UI as appropriate

**Update `pages/steps/index.vue`:**

- Add 'REVIEW' to step type options dropdown

## User Flow

1. Track is assigned to a REVIEW step in workflow
2. User navigates to track detail page
3. ReviewPanel appears (or is visible when REVIEW step is active)
4. User clicks "Start Review"
   - Optionally selects which audio file to review
   - Creates a new review record
5. Audio player appears
6. User starts playback
7. At any point, user clicks "Add Note at Current Time"
   - Current timestamp is captured
   - Note modal/editor appears
   - User enters note text
   - Note is saved with timestamp and linked to review
8. User can continue listening and adding more notes
9. All notes appear in a list, sorted by timestamp
10. User can click any timestamp to jump to that point in audio
11. User can edit/delete notes
12. Review persists - can return to it later

## Benefits

- Structured way to capture feedback during audio review
- Notes are tied to exact moments in the track
- Easy to navigate back to specific points
- Multiple reviews can be created (e.g., different reviewers, different versions)
- Integrates naturally with existing workflow system

## Considerations

- Should reviews be tied to specific audio file versions?
- Should there be a way to "complete" a review (mark it as finished)?
- Can multiple users collaborate on the same review?
- Should reviews be exportable (e.g., as a document with timestamps)?
- Should there be review templates or structured feedback forms?

## Related Features

- Could be enhanced with audio waveform visualization
- Could integrate with audio analysis features
- Could support video review if video tracks are added later
- Could generate review summaries/reports

