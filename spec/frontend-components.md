# Frontend Components Specification

## Overview

This document defines all frontend components, pages, and layouts for the MusicAid application. The frontend is built using Next.js 14 with App Router, React 18, TypeScript, Tailwind CSS, and Shadcn/ui components.

## Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: White (#FFFFFF) / Dark (#0F172A)
- **Text**: Gray (#374151) / Light Gray (#F9FAFB)

### Typography
- **Headings**: Inter font family
- **Body**: Inter font family
- **Code**: JetBrains Mono

### Spacing
- Based on Tailwind's 4px unit system
- Consistent padding and margin throughout

## Layout Components

### RootLayout
Main application layout with navigation and authentication.

**Location**: `app/layout.tsx`

**Features**:
- Global navigation header
- User authentication status
- Theme provider (light/dark mode)
- Toast notifications
- Loading states

```tsx
interface RootLayoutProps {
  children: React.ReactNode;
}
```

### AuthLayout
Layout for authentication pages (login, register).

**Location**: `app/(auth)/layout.tsx`

**Features**:
- Centered form layout
- Background pattern
- Logo display
- No navigation header

### DashboardLayout
Layout for authenticated user pages.

**Location**: `app/(dashboard)/layout.tsx`

**Features**:
- Sidebar navigation
- Breadcrumb navigation
- User profile dropdown
- Quick actions menu

## Navigation Components

### Header
Global application header.

**Features**:
- Logo/brand
- Main navigation menu
- User profile dropdown
- Search bar
- Theme toggle
- Notifications

```tsx
interface HeaderProps {
  user?: User;
}
```

### Sidebar
Dashboard sidebar navigation.

**Features**:
- Collapsible sidebar
- Navigation menu items
- Active state indicators
- Artist selector
- Quick actions

```tsx
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  currentArtist?: Artist;
}
```

### Breadcrumb
Navigation breadcrumb component.

```tsx
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}
```

## Page Components

### HomePage
Landing page for unauthenticated users.

**Location**: `app/page.tsx`

**Features**:
- Hero section
- Feature highlights
- Call-to-action buttons
- Footer

### LoginPage
User login page.

**Location**: `app/(auth)/login/page.tsx`

**Features**:
- Login form
- Email/password fields
- Remember me checkbox
- Forgot password link
- Register link

### RegisterPage
User registration page.

**Location**: `app/(auth)/register/page.tsx`

**Features**:
- Registration form
- Name, email, password fields
- Terms acceptance
- Login link

### DashboardPage
Main dashboard overview.

**Location**: `app/(dashboard)/page.tsx`

**Features**:
- Statistics cards
- Recent tracks
- Quick actions
- Activity feed
- Charts and graphs

### ArtistsPage
Artists listing and management.

**Location**: `app/(dashboard)/artists/page.tsx`

**Features**:
- Artists grid/list view
- Search and filtering
- Create new artist button
- Artist cards with stats

### ArtistDetailPage
Individual artist management.

**Location**: `app/(dashboard)/artists/[id]/page.tsx`

**Features**:
- Artist information
- Tracks listing
- Albums listing
- Templates management
- User collaboration

### TracksPage
Tracks listing and management.

**Location**: `app/(dashboard)/tracks/page.tsx`

**Features**:
- Tracks table/grid view
- Advanced filtering
- Bulk actions
- Status indicators
- Create track button

### TrackDetailPage
Individual track management.

**Location**: `app/(dashboard)/tracks/[id]/page.tsx`

**Features**:
- Track information form
- Audio files management
- Notes and comments
- Recording records
- Status workflow
- Session management

### AlbumsPage
Albums listing and management.

**Location**: `app/(dashboard)/albums/page.tsx`

**Features**:
- Albums grid view
- Album artwork
- Track count indicators
- Release date info

### AlbumDetailPage
Individual album management.

**Location**: `app/(dashboard)/albums/[id]/page.tsx`

**Features**:
- Album information
- Track ordering
- Artwork upload
- Release management

### TemplatesPage
Template management.

**Location**: `app/(dashboard)/templates/page.tsx`

**Features**:
- Templates listing
- Create template
- Template preview
- Publishing controls

### TemplateDetailPage
Template editor.

**Location**: `app/(dashboard)/templates/[id]/page.tsx`

**Features**:
- Template builder
- Status workflow designer
- Step management
- Preview mode

## Form Components

### ArtistForm
Create/edit artist form.

```tsx
interface ArtistFormProps {
  artist?: Artist;
  onSubmit: (data: ArtistFormData) => void;
  isLoading?: boolean;
}

interface ArtistFormData {
  name: string;
  templateId?: string;
}
```

### TrackForm
Create/edit track form.

```tsx
interface TrackFormProps {
  track?: Track;
  artistId?: string;
  onSubmit: (data: TrackFormData) => void;
  isLoading?: boolean;
}

interface TrackFormData {
  name: string;
  artistId: string;
  albumId?: string;
  tempo?: number;
  minutes?: number;
  seconds?: number;
  location: string;
  isrcCode?: string;
  liveReady: boolean;
}
```

### AlbumForm
Create/edit album form.

```tsx
interface AlbumFormProps {
  album?: Album;
  artistId?: string;
  onSubmit: (data: AlbumFormData) => void;
  isLoading?: boolean;
}

interface AlbumFormData {
  name: string;
  artistId: string;
  releaseDate?: Date;
  image?: File;
}
```

### NoteForm
Create/edit note form.

```tsx
interface NoteFormProps {
  note?: Note;
  trackId: string;
  onSubmit: (data: NoteFormData) => void;
  onCancel: () => void;
}

interface NoteFormData {
  note: string;
  stepId?: string;
  trackStatusId?: string;
}
```

## Data Display Components

### ArtistCard
Artist display card.

```tsx
interface ArtistCardProps {
  artist: Artist;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}
```

### TrackCard
Track display card.

```tsx
interface TrackCardProps {
  track: Track;
  onEdit?: () => void;
  onDelete?: () => void;
  showStatus?: boolean;
}
```

### AlbumCard
Album display card.

```tsx
interface AlbumCardProps {
  album: Album;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

### TrackTable
Tracks data table.

```tsx
interface TrackTableProps {
  tracks: Track[];
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: TrackFilters) => void;
  onSelect?: (trackIds: string[]) => void;
}
```

### StatusBadge
Track status indicator.

```tsx
interface StatusBadgeProps {
  status: TrackStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

### ProgressBar
Workflow progress indicator.

```tsx
interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}
```

## Media Components

### AudioPlayer
Audio file player.

```tsx
interface AudioPlayerProps {
  src: string;
  title?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}
```

### AudioUpload
Audio file upload component.

```tsx
interface AudioUploadProps {
  trackId: string;
  onUpload: (audio: Audio) => void;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}
```

### ImageUpload
Image upload component.

```tsx
interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  aspectRatio?: number;
  maxSize?: number;
}
```

## Workflow Components

### WorkflowBuilder
Template workflow builder.

```tsx
interface WorkflowBuilderProps {
  template: Template;
  onSave: (template: Template) => void;
}
```

### StatusSelector
Track status selection.

```tsx
interface StatusSelectorProps {
  currentStatus?: TrackStatus;
  availableStatuses: TrackStatus[];
  onSelect: (status: TrackStatus) => void;
}
```

### StepList
Workflow steps display.

```tsx
interface StepListProps {
  steps: Step[];
  currentStep?: Step;
  onStepClick?: (step: Step) => void;
}
```

## Utility Components

### LoadingSpinner
Loading indicator.

```tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}
```

### EmptyState
Empty state placeholder.

```tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}
```

### ConfirmDialog
Confirmation dialog.

```tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'destructive';
}
```

### SearchInput
Search input with debouncing.

```tsx
interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}
```

### FilterPanel
Advanced filtering panel.

```tsx
interface FilterPanelProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset: () => void;
}
```

## Modal Components

### CreateArtistModal
Modal for creating new artist.

### CreateTrackModal
Modal for creating new track.

### CreateAlbumModal
Modal for creating new album.

### EditProfileModal
User profile editing modal.

### FilePreviewModal
File preview modal for audio/images.

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Considerations
- Collapsible navigation
- Touch-friendly buttons
- Simplified layouts
- Swipe gestures for cards

## Accessibility

### ARIA Labels
- All interactive elements have proper ARIA labels
- Form fields have associated labels
- Navigation has proper landmarks

### Keyboard Navigation
- All functionality accessible via keyboard
- Proper tab order
- Focus indicators

### Screen Reader Support
- Semantic HTML structure
- Alternative text for images
- Status announcements

## Performance Optimization

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy components

### Image Optimization
- Next.js Image component
- Responsive images
- WebP format support

### Caching
- API response caching
- Image caching
- Static asset caching

## Testing Strategy

### Unit Tests
- Component rendering tests
- User interaction tests
- Form validation tests

### Integration Tests
- API integration tests
- User flow tests
- Authentication tests

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Mobile testing

## Implementation Notes

1. **Consistent Styling**: Use Tailwind CSS classes consistently
2. **Component Reusability**: Create reusable components for common patterns
3. **Type Safety**: Full TypeScript coverage for all components
4. **Error Boundaries**: Implement error boundaries for robust error handling
5. **Loading States**: Provide loading states for all async operations
6. **Optimistic Updates**: Implement optimistic UI updates where appropriate 