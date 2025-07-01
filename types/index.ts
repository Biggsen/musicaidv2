// Basic types for MusicAid application

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  title: string
  description?: string
  ownerId: string
  collaborators: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Track {
  id: string
  projectId: string
  name: string
  audioUrl?: string
  duration?: number
  order: number
  createdAt: Date
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