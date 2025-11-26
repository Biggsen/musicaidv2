# Enhancement: Custom Workflows & Template Creation from Tracks

## Status: Future Enhancement

This enhancement adds the ability to create custom statuses and steps on tracks on-the-fly, and save those custom workflows as reusable templates.

## Objective

Enable dynamic workflow customization at the track level, allowing users to add custom statuses and steps as needed, then save successful workflows as templates for future use.

## Features

### 1. Custom Statuses & Steps on Tracks

- [ ] Add "Add Custom Status" button on track detail page
- [ ] Add "Add Step to Status" button on track detail page
- [ ] Create track-specific statuses and steps (flagged as `track_specific: true`)
- [ ] Allow tracks to use template statuses + custom statuses together
- [ ] Display custom vs template statuses visually (different styling/badges)
- [ ] Allow editing/removing custom statuses and steps

**Use Cases:**
- Working on a track and realize you need an extra status (e.g., "Vocal Editing")
- Add it on the fly without leaving the track page
- Discover workflow needs while working, not in advance
- Iterate and refine workflows based on real production experience

### 2. Save Workflow as Template

- [ ] Add "Save as Template" button on track detail page
- [ ] Create new template from track's current workflow (template + custom statuses/steps)
- [ ] Option to name the new template
- [ ] Convert track-specific statuses/steps to regular template statuses/steps
- [ ] Option to keep or remove the custom statuses from the track after saving

**Use Cases:**
- You've customized a workflow for a track and it works well
- Save it as a template for similar tracks in the future
- Templates evolve from real usage patterns, not just planning
- Build a library of proven workflows

### 3. Template Sharing Between Artists

- [ ] Add "Share Template" functionality
- [ ] Copy template to another artist
- [ ] Make templates discoverable/shared
- [ ] Template marketplace or sharing system

**Use Cases:**
- Share a workflow template with collaborators
- Use templates from other artists
- Build a community library of workflows

## Technical Implementation

### Track-Specific Statuses/Steps

**Option 1: Track-Specific Flag**
```sql
ALTER TABLE track_statuses ADD COLUMN track_id UUID REFERENCES tracks(id);
ALTER TABLE steps ADD COLUMN track_id UUID REFERENCES tracks(id);
```

**Option 2: Junction Table**
```sql
CREATE TABLE track_custom_statuses (
  track_id UUID REFERENCES tracks(id),
  track_status_id UUID REFERENCES track_statuses(id),
  UNIQUE(track_id, track_status_id)
);
```

### Workflow Display Logic

- Show template statuses (from template)
- Show custom statuses (track-specific)
- Merge them in order for display
- Visual distinction (badge, color, icon)

### Save as Template Flow

1. Collect all statuses track is using (template + custom)
2. Collect all steps for those statuses
3. Create new template
4. Create statuses in template (copy custom ones, reference template ones)
5. Create steps in template
6. Link everything together
7. Optionally: Remove track-specific flags, assign new template to track

## Estimated Time

8-12 hours

## Dependencies

- Task 01: Project Setup & Foundation ✅
- Task 02: Supabase Integration & Database Setup ✅
- Task 04: Core Music Production Features ✅
- Workflow templates system (already implemented)

## Notes

- This is a powerful feature that makes workflows more flexible
- Templates can evolve from real production experience
- Allows discovering workflow needs while working, not just planning
- More complex than basic template management
- Can start with fixed templates and add this flexibility later

