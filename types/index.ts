// Basic types for MusicAid application

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  created_at: string
  updated_at: string
}

// Artist types (matching database schema)
export interface Artist {
  id: string
  name: string
  slug: string
  template_id: string | null
  created_at: string
  updated_at: string
}

export interface ArtistInsert {
  name: string
  slug?: string
  template_id?: string | null
}

export interface ArtistUpdate {
  name?: string
  slug?: string
  template_id?: string | null
}

// Track types (matching database schema)
export interface Track {
  id: string
  name: string
  key: string
  artist_id: string
  template_id: string | null
  track_status_id: string | null
  step_id: string | null
  tempo: number | null
  minutes: number | null
  seconds: number | null
  location: string
  album_id: string | null
  album_order: number | null
  date_created: string | null
  isrc_code: string | null
  live_ready: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface TrackInsert {
  name: string
  key?: string
  artist_id: string
  template_id?: string | null
  track_status_id?: string | null
  step_id?: string | null
  tempo?: number | null
  minutes?: number | null
  seconds?: number | null
  location?: string
  album_id?: string | null
  album_order?: number | null
  date_created?: string | null
  isrc_code?: string | null
  live_ready?: boolean
  created_by?: string | null
}

export interface TrackUpdate {
  name?: string
  key?: string
  artist_id?: string
  template_id?: string | null
  track_status_id?: string | null
  step_id?: string | null
  tempo?: number | null
  minutes?: number | null
  seconds?: number | null
  location?: string
  album_id?: string | null
  album_order?: number | null
  date_created?: string | null
  isrc_code?: string | null
  live_ready?: boolean
  updated_by?: string | null
}

// Audio file types
export interface AudioFile {
  id: string
  name: string
  slug: string
  file_url: string | null
  dropbox_url: string | null
  track_id: string
  mixdown_date: string | null
  description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface AudioFileInsert {
  name: string
  slug: string
  file_url?: string | null
  dropbox_url?: string | null
  track_id: string
  mixdown_date?: string | null
  description?: string | null
  created_by?: string | null
}

export interface AudioFileUpdate {
  name?: string
  slug?: string
  file_url?: string | null
  dropbox_url?: string | null
  mixdown_date?: string | null
  description?: string | null
  updated_by?: string | null
}

// Note types
export interface Note {
  id: string
  note: string
  track_id: string
  step_id: string | null
  track_status_id: string | null
  done: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface NoteInsert {
  note: string
  track_id: string
  step_id?: string | null
  track_status_id?: string | null
  done?: boolean
  created_by?: string | null
}

export interface NoteUpdate {
  note?: string
  step_id?: string | null
  track_status_id?: string | null
  done?: boolean
  updated_by?: string | null
}

// Workflow types
export interface TrackStatus {
  id: string
  name: string
  key: string
  title: string | null
  description: string | null
  artist_id: string | null
  non_linear: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export interface Step {
  id: string
  name: string
  key: string
  title: string | null
  description: string | null
  type: 'NORMAL' | 'TEXT' | 'LIST' | 'RECORD'
  artist_id: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  description: string | null
  artist_id: string | null
  published: boolean
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// Navigation types
export interface NavItem {
  label: string
  to: string
  icon?: string
  external?: boolean
}

// View/Display types
export interface ArtistWithStats extends Artist {
  track_count?: number
  collaborator_count?: number
}

export interface TrackWithArtist extends Track {
  artist?: Artist
}
