# MusicAid Rebuild Specification

## Overview

MusicAid is a comprehensive music production and recording management system that helps artists, producers, and studios track and manage various aspects of music creation and recording workflows.

This specification outlines the complete rebuild of the existing Keystone.js application using modern technologies on cloud platforms.

## Project Goals

- **Modernize Technology Stack**: Move from Keystone.js to Next.js 14 with App Router
- **Cost-Effective Hosting**: Utilize platform free tiers and scale economically
- **Improved Performance**: Leverage edge computing and modern web technologies
- **Better Developer Experience**: TypeScript, modern tooling, and maintainable architecture
- **Enhanced User Experience**: Modern UI/UX with responsive design

## Architecture Overview

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: S3-compatible storage for audio files and images
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Deployment**: Cloud platform (AWS, Digital Ocean, Railway, etc.)

## Specification Documents

1. [Database Schema](./database-schema.md) - Complete data model and relationships
2. [API Specification](./api-specification.md) - All API endpoints and their specifications
3. [Frontend Components](./frontend-components.md) - UI components and page layouts
4. [Authentication & Authorization](./auth-specification.md) - User management and security
5. [File Management](./file-management.md) - Audio and image file handling
6. [Business Logic](./business-logic.md) - Core application workflows and rules
7. [Migration Plan](./migration-plan.md) - Step-by-step rebuild and data migration
8. [Deployment Guide](./deployment-guide.md) - Platform setup and configuration

## Key Features

### Core Entities
- **Artists**: Manage artist profiles and associated users
- **Tracks**: Individual songs with metadata, status tracking, and workflow management
- **Albums**: Collection of tracks with release information
- **Templates**: Reusable workflow templates for different types of projects
- **Steps**: Individual workflow steps within templates
- **Track Statuses**: Current state of tracks in the production workflow

### Recording Management
- **Sessions**: Recording session tracking and management
- **Records**: Individual instrument recordings per track
- **Instruments**: Catalog of available instruments
- **Audio Files**: Storage and management of audio assets

### Workflow Management
- **Notes**: Track-specific notes and comments
- **Status Tracking**: Visual progress tracking through production stages
- **Template System**: Customizable workflows for different project types

### User Management
- **Multi-user Support**: Multiple users can collaborate on artist projects
- **Role-based Access**: Different permission levels for different users
- **Session Management**: Secure authentication and authorization

## Technology Justification

### Next.js 14 with App Router
- Server-side rendering for better SEO and performance
- Built-in API routes eliminate need for separate backend
- React Server Components for optimal performance
- TypeScript support out of the box

### Cloud Platform
- Cost-effective hosting options available
- CI/CD integration for automatic deployments
- Global CDN for performance
- Scalable database and file storage solutions

### Prisma ORM
- Type-safe database queries
- Excellent migration system
- Great developer experience with auto-completion
- Works seamlessly with TypeScript

### Tailwind CSS + Shadcn/ui
- Utility-first CSS framework for rapid development
- Consistent design system
- Accessible components out of the box
- Easy customization and theming

## Success Criteria

1. **Functional Parity**: All existing features working in new system
2. **Performance**: Faster load times and better user experience
3. **Cost Efficiency**: Optimized hosting costs with modern architecture
4. **Maintainability**: Clean, well-documented, and testable code
5. **Scalability**: Architecture that can grow with user needs

## Next Steps

1. Review all specification documents
2. Set up development environment
3. Initialize hosting platform and database
4. Begin implementation following the migration plan
5. Test and iterate based on feedback

For detailed implementation instructions, refer to the individual specification documents listed above. 