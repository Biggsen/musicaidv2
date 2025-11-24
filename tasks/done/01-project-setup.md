# Task 01: Project Setup & Foundation

## Objective

Set up the basic Nuxt 3 project structure with TypeScript and essential tooling.

## Tasks

### 1. Initialize Nuxt 3 Project

- [x] Create new Nuxt 3 project with TypeScript
- [x] Install essential dependencies (Pinia, TailwindCSS via @nuxt/ui)
- [x] Configure `nuxt.config.ts` for full-stack setup
- [x] Set up TypeScript configuration
- [x] Configure color mode (light mode preference)

### 2. Project Structure

- [x] Create folder structure:
  - `/components` - Vue components
  - `/pages` - Frontend routes
  - `/server/api` - Backend API routes
  - `/types` - TypeScript type definitions
  - `/composables` - Vue composables
  - `/stores` - Pinia stores
  - `/middleware` - Route middleware
  - `/layouts` - Layout components

### 3. Development Environment

- [x] Configure ESLint
- [x] Configure Prettier (`.prettierrc` file created)
- [x] Add Prettier scripts to `package.json` (`format`, `format:check`)
- [x] Set up Git repository
- [x] Create `.env.example` file with Supabase configuration
- [x] Add basic `.gitignore`

### 4. Basic Layout

- [x] Create default layout component
- [x] Set up basic navigation structure (Home, About, Test)
- [x] Add responsive design foundation
- [x] Implement user authentication UI (login/logout buttons)
- [x] Add mobile menu support

### 5. UI Library Integration

- [x] Install and configure @nuxt/ui v3
- [x] Refactor all pages to use @nuxt/ui components:
  - [x] UButton for all buttons
  - [x] UInput for form inputs
  - [x] USelect for dropdowns
  - [x] UCard for containers
  - [x] UAlert for messages
- [x] Ensure consistent styling across all pages
- [x] Add explicit labels to all form inputs
- [x] Stack form inputs vertically

## Acceptance Criteria

- Nuxt 3 project runs locally on `npm run dev`
- TypeScript compilation works without errors
- Basic homepage renders
- Development tools (linting, formatting) are configured
- All pages use @nuxt/ui components consistently
- Forms have visible labels and stacked inputs
- Color mode is set to light mode

## Completed Features

- **UI Components**: All pages refactored to use @nuxt/ui components
- **Form Styling**: Login, register, and test-crud pages have proper labels and stacked inputs
- **Navigation**: Test page added to main navigation
- **Code Quality**: Prettier configured and code formatted
- **Environment**: `.env.example` file created for Supabase configuration

## Estimated Time

2-4 hours

## Dependencies

None - this is the foundation task
