# Frontend Components Specification

## Overview

This document defines all frontend components, pages, and layouts for the MusicAid application. The frontend should be built using modern component-based architecture with responsive design and accessibility features.

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

- **Headings**: Clean, modern sans-serif font family
- **Body**: Readable sans-serif font family
- **Code**: Monospace font family
- **Font Sizes**: Responsive scale (14px base, scaling to 12px on mobile)

### Spacing System

- **Base Unit**: 4px or 8px system
- **Consistent Padding**: Use multiples of base unit
- **Responsive Margins**: Adjust based on screen size

### Component Architecture

- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Reusable Components**: Consistent props interface across similar components
- **State Management**: Clear separation between local and global state
- **Accessibility**: WCAG 2.1 AA compliance with proper ARIA attributes

## Layout Components

### RootLayout

Main application shell that wraps all pages.

**Features**:

- Global navigation header
- User authentication status display
- Theme provider (light/dark mode support)
- Toast notification system
- Global loading states
- Error boundary handling

**Props Interface**:

```typescript
interface RootLayoutProps {
  children: ComponentChildren
  user?: User
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}
```

### AuthLayout

Specialized layout for authentication pages (login, register, password reset).

**Features**:

- Centered form layout with responsive design
- Background pattern or branding
- Logo/brand display
- No main navigation (clean, focused interface)
- Form validation feedback display

**Props Interface**:

```typescript
interface AuthLayoutProps {
  children: ComponentChildren
  title: string
  subtitle?: string
  showLogo?: boolean
}
```

### DashboardLayout

Main layout for authenticated user interface.

**Features**:

- Collapsible sidebar navigation
- Breadcrumb navigation system
- User profile dropdown menu
- Quick actions toolbar
- Artist context switcher
- Responsive mobile navigation

**Props Interface**:

```typescript
interface DashboardLayoutProps {
  children: ComponentChildren
  currentUser: User
  currentArtist?: Artist
  sidebarCollapsed: boolean
  onSidebarToggle: () => void
}
```

## Navigation Components

### Header

Global application header component.

**Features**:

- Logo/brand with link to dashboard
- Main navigation menu items
- User profile dropdown with logout
- Global search functionality
- Theme toggle switch
- Notification bell with count

**Props Interface**:

```typescript
interface HeaderProps {
  user?: User
  currentArtist?: Artist
  notificationCount: number
  onSearch: (query: string) => void
  onProfileClick: () => void
  onLogout: () => void
}
```

### Sidebar

Dashboard sidebar navigation component.

**Features**:

- Collapsible/expandable design
- Navigation menu with active states
- Artist selector dropdown
- Quick action buttons
- Progress indicators for active projects

**Props Interface**:

```typescript
interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  currentArtist?: Artist
  userArtists: Artist[]
  onArtistChange: (artistId: string) => void
  activeRoute: string
}
```

### Breadcrumb

Navigation breadcrumb component for deep navigation.

**Props Interface**:

```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[]
  maxItems?: number
  showHome?: boolean
}

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}
```

## Page Components

### HomePage

Landing page for unauthenticated visitors.

**Features**:

- Hero section with value proposition
- Feature highlights with screenshots
- Call-to-action buttons (signup/login)
- Testimonials or social proof
- Footer with links and contact info

### LoginPage

User authentication page.

**Features**:

- Email/password login form
- Remember me checkbox
- Forgot password link
- Register account link
- OAuth login buttons (if supported)
- Form validation with error display

**Form Fields**:

- Email (required, email validation)
- Password (required, minimum length)
- Remember me (checkbox)

### RegisterPage

New user registration page.

**Features**:

- Registration form with validation
- Terms of service acceptance
- Email verification notice
- Login link for existing users
- Progressive enhancement for password strength

**Form Fields**:

- Full name (required, 2-100 characters)
- Email (required, unique, email validation)
- Password (required, complexity validation)
- Confirm password (required, must match)
- Terms acceptance (required checkbox)

### DashboardPage

Main dashboard overview for authenticated users.

**Features**:

- Statistics cards (tracks, albums, completed items)
- Recent activity feed
- Quick action buttons
- Progress charts and visualizations
- Upcoming deadlines or reminders

**Data Requirements**:

- Current user statistics
- Recent tracks across all artists
- Activity feed data
- Chart data for progress visualization

### ArtistsPage

Artist listing and management interface.

**Features**:

- Artist grid/list view toggle
- Search and filtering capabilities
- Create new artist button
- Artist cards with statistics
- Bulk operations (if applicable)

**Artist Card Components**:

- Artist name and avatar/logo
- Track count and completion stats
- Last activity timestamp
- Quick action buttons (view, edit)

### ArtistDetailPage

Individual artist management interface.

**Features**:

- Artist information and settings
- User collaboration management
- Track listing with status indicators
- Album listing and organization
- Template management interface
- Activity timeline

**Sections**:

- Artist header with edit capabilities
- Collaborator management panel
- Recent tracks table
- Albums grid/list
- Templates section
- Settings and danger zone

### TracksPage

Track listing and management interface.

**Features**:

- Data table with sorting and filtering
- Status column with visual indicators
- Bulk actions toolbar
- Advanced search functionality
- Export capabilities

**Table Columns**:

- Track name (with link to detail)
- Artist name
- Album (if assigned)
- Current status
- Last updated
- Action buttons

**Filtering Options**:

- Artist selection
- Status selection
- Album selection
- Date ranges
- Search by name

### TrackDetailPage

Individual track management interface.

**Features**:

- Track metadata editing
- Workflow status progression
- Audio file management
- Notes and comments system
- Recording session tracking
- Collaboration history

**Sections**:

- Track header with basic info
- Workflow progress visualization
- Audio files section
- Notes and comments
- Recording history
- Metadata panel

### AlbumsPage

Album listing and management interface.

**Features**:

- Album grid view with artwork
- Create new album functionality
- Search and filtering
- Release status indicators
- Track count display

### AlbumDetailPage

Individual album management interface.

**Features**:

- Album artwork and metadata
- Track listing with drag-and-drop reordering
- Release planning tools
- Artwork upload interface
- Distribution preparation

### TemplatesPage

Workflow template management interface.

**Features**:

- Template library with preview
- Create/edit template functionality
- Template sharing and collaboration
- Usage statistics
- Template categorization

## Form Components

### FormInput

Reusable input component with validation.

**Props Interface**:

```typescript
interface FormInputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'tel'
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  autoComplete?: string
}
```

### FormSelect

Dropdown selection component.

**Props Interface**:

```typescript
interface FormSelectProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
```

### FormTextArea

Multi-line text input component.

**Props Interface**:

```typescript
interface FormTextAreaProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  rows?: number
  maxLength?: number
  disabled?: boolean
}
```

## Data Display Components

### DataTable

Reusable table component with sorting, filtering, and pagination.

**Features**:

- Column sorting (ascending/descending)
- Row selection (single/multiple)
- Pagination controls
- Loading states
- Empty state display
- Responsive design (horizontal scroll on mobile)

**Props Interface**:

```typescript
interface DataTableProps {
  columns: TableColumn[]
  data: TableRow[]
  loading?: boolean
  pagination?: PaginationConfig
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  onRowSelect?: (selectedRows: string[]) => void
  emptyMessage?: string
}
```

### StatusBadge

Visual indicator for track/album status.

**Features**:

- Color-coded status display
- Icon support
- Tooltip with additional info
- Consistent sizing and styling

**Props Interface**:

```typescript
interface StatusBadgeProps {
  status: string
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  icon?: string
  tooltip?: string
  size?: 'small' | 'medium' | 'large'
}
```

### ProgressBar

Visual progress indicator for workflows.

**Props Interface**:

```typescript
interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  variant?: 'default' | 'success' | 'warning' | 'error'
  animated?: boolean
}
```

## Media Components

### AudioPlayer

Audio playback component for track previews.

**Features**:

- Play/pause controls
- Seek bar with time display
- Volume control
- Waveform visualization (optional)
- Keyboard shortcuts

**Props Interface**:

```typescript
interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  autoPlay?: boolean
  controls?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}
```

### ImageUpload

Drag-and-drop image upload component.

**Features**:

- Drag-and-drop interface
- File type validation
- Image preview
- Progress indicator
- Error handling

**Props Interface**:

```typescript
interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>
  maxSize?: number
  acceptedTypes?: string[]
  preview?: boolean
  error?: string
  loading?: boolean
}
```

## Utility Components

### LoadingSpinner

Reusable loading indicator.

**Props Interface**:

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  message?: string
}
```

### EmptyState

Component for displaying empty data states.

**Props Interface**:

```typescript
interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

### ConfirmationModal

Modal dialog for confirming destructive actions.

**Props Interface**:

```typescript
interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}
```

## Responsive Design Requirements

### Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Mobile Considerations

- Touch-friendly button sizes (minimum 44px)
- Collapsible navigation
- Simplified layouts
- Thumb-friendly interface elements

### Accessibility Requirements

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliance (4.5:1 ratio)
- **Focus Indicators**: Clear visual focus states
- **Alt Text**: Descriptive alternative text for images
- **Form Labels**: Proper labeling and error associations

## State Management

### Global State

- Current user authentication state
- Selected artist context
- Theme preferences
- Notification queue

### Component State

- Form input values and validation
- Modal open/closed states
- Loading states
- Local UI preferences

### Data Fetching

- Loading states for async operations
- Error handling and retry mechanisms
- Optimistic updates where appropriate
- Cache invalidation strategies

## Performance Considerations

### Code Splitting

- Route-based code splitting
- Component lazy loading
- Third-party library optimization

### Image Optimization

- Responsive images with multiple sizes
- Modern format support (WebP, AVIF)
- Lazy loading for below-fold images

### Bundle Optimization

- Tree shaking for unused code
- Minimization and compression
- CDN delivery for static assets

This specification provides a framework-agnostic foundation that can be implemented using React, Vue, Angular, Svelte, or any other modern frontend framework while maintaining consistency and user experience quality.
