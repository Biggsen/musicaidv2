# Authentication & Authorization Specification

## Overview

This document defines the authentication and authorization system for the MusicAid application. The system uses NextAuth.js for authentication management and implements role-based access control for multi-user collaboration.

## Authentication Strategy

### NextAuth.js Configuration
The application uses NextAuth.js v5 (Auth.js) for authentication management.

**Provider Configuration**:
- **Credentials Provider**: Email/password authentication
- **Future Extensions**: Google OAuth, GitHub OAuth (optional)

### Session Management
- **Session Strategy**: JWT tokens for stateless authentication
- **Session Duration**: 30 days with automatic refresh
- **Secure Cookies**: HttpOnly, Secure, SameSite=Lax

## User Model

### User Schema
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed with bcrypt
  artists: Artist[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Password Requirements
- **Minimum Length**: 8 characters
- **Requirements**: At least one uppercase, one lowercase, one number
- **Hashing**: bcrypt with salt rounds of 12
- **Password Reset**: Time-limited tokens via email

## Authentication Flow

### Registration Process
1. User submits registration form
2. Validate email uniqueness
3. Hash password with bcrypt
4. Create user record in database
5. Send welcome email (optional)
6. Auto-login user after registration

### Login Process
1. User submits email/password
2. Validate credentials against database
3. Generate JWT session token
4. Set secure session cookie
5. Redirect to dashboard

### Logout Process
1. Clear session cookie
2. Invalidate JWT token
3. Redirect to login page

### Password Reset Process
1. User requests password reset
2. Generate secure reset token
3. Send reset email with token
4. User clicks link and sets new password
5. Invalidate reset token

## Authorization Model

### Access Control Strategy
The application implements **Resource-Based Access Control** where users can access resources (artists, tracks, albums) they are explicitly associated with.

### User-Artist Relationship
```typescript
// Many-to-many relationship
interface UserArtist {
  userId: string;
  artistId: string;
  role: 'owner' | 'collaborator';
  permissions: Permission[];
  createdAt: Date;
}
```

### Permission System
```typescript
enum Permission {
  // Artist permissions
  READ_ARTIST = 'read:artist',
  UPDATE_ARTIST = 'update:artist',
  DELETE_ARTIST = 'delete:artist',
  MANAGE_ARTIST_USERS = 'manage:artist:users',
  
  // Track permissions
  CREATE_TRACK = 'create:track',
  READ_TRACK = 'read:track',
  UPDATE_TRACK = 'update:track',
  DELETE_TRACK = 'delete:track',
  
  // Album permissions
  CREATE_ALBUM = 'create:album',
  READ_ALBUM = 'read:album',
  UPDATE_ALBUM = 'update:album',
  DELETE_ALBUM = 'delete:album',
  
  // Template permissions
  CREATE_TEMPLATE = 'create:template',
  READ_TEMPLATE = 'read:template',
  UPDATE_TEMPLATE = 'update:template',
  DELETE_TEMPLATE = 'delete:template',
  PUBLISH_TEMPLATE = 'publish:template',
  
  // Audio permissions
  UPLOAD_AUDIO = 'upload:audio',
  DELETE_AUDIO = 'delete:audio',
  
  // Note permissions
  CREATE_NOTE = 'create:note',
  UPDATE_NOTE = 'update:note',
  DELETE_NOTE = 'delete:note',
}
```

### Role Definitions
```typescript
const ROLE_PERMISSIONS = {
  owner: [
    // Full access to all resources
    Permission.READ_ARTIST,
    Permission.UPDATE_ARTIST,
    Permission.DELETE_ARTIST,
    Permission.MANAGE_ARTIST_USERS,
    Permission.CREATE_TRACK,
    Permission.READ_TRACK,
    Permission.UPDATE_TRACK,
    Permission.DELETE_TRACK,
    Permission.CREATE_ALBUM,
    Permission.READ_ALBUM,
    Permission.UPDATE_ALBUM,
    Permission.DELETE_ALBUM,
    Permission.CREATE_TEMPLATE,
    Permission.READ_TEMPLATE,
    Permission.UPDATE_TEMPLATE,
    Permission.DELETE_TEMPLATE,
    Permission.PUBLISH_TEMPLATE,
    Permission.UPLOAD_AUDIO,
    Permission.DELETE_AUDIO,
    Permission.CREATE_NOTE,
    Permission.UPDATE_NOTE,
    Permission.DELETE_NOTE,
  ],
  collaborator: [
    // Limited access for collaboration
    Permission.READ_ARTIST,
    Permission.CREATE_TRACK,
    Permission.READ_TRACK,
    Permission.UPDATE_TRACK,
    Permission.READ_ALBUM,
    Permission.READ_TEMPLATE,
    Permission.UPLOAD_AUDIO,
    Permission.CREATE_NOTE,
    Permission.UPDATE_NOTE,
  ],
};
```

## API Authentication

### Middleware Configuration
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has access to the requested resource
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/api/artists/:path*',
    '/api/tracks/:path*',
    '/api/albums/:path*',
    '/dashboard/:path*',
  ],
};
```

### API Route Protection
```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session.user;
}

export async function requireArtistAccess(artistId: string, permission: Permission) {
  const user = await requireAuth();
  
  const hasAccess = await checkUserArtistPermission(
    user.id,
    artistId,
    permission
  );
  
  if (!hasAccess) {
    throw new Error('Forbidden');
  }
  
  return user;
}
```

### Permission Checking Functions
```typescript
// lib/permissions.ts
export async function checkUserArtistPermission(
  userId: string,
  artistId: string,
  permission: Permission
): Promise<boolean> {
  const userArtist = await db.userArtist.findFirst({
    where: {
      userId,
      artistId,
    },
  });
  
  if (!userArtist) {
    return false;
  }
  
  const rolePermissions = ROLE_PERMISSIONS[userArtist.role];
  return rolePermissions.includes(permission);
}

export async function getUserArtistIds(userId: string): Promise<string[]> {
  const userArtists = await db.userArtist.findMany({
    where: { userId },
    select: { artistId: true },
  });
  
  return userArtists.map(ua => ua.artistId);
}
```

## Frontend Authentication

### Auth Context Provider
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Implementation using NextAuth.js
};
```

### Route Protection
```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  artistId?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  artistId,
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    redirect('/login');
  }
  
  if (requiredPermission && artistId) {
    // Check specific permission
    const hasPermission = checkPermission(user, artistId, requiredPermission);
    if (!hasPermission) {
      return <UnauthorizedError />;
    }
  }
  
  return <>{children}</>;
};
```

### Permission Hooks
```typescript
// hooks/usePermissions.ts
export function usePermissions(artistId?: string) {
  const { user } = useAuth();
  
  const checkPermission = useCallback(
    (permission: Permission) => {
      if (!user || !artistId) return false;
      return checkUserPermission(user, artistId, permission);
    },
    [user, artistId]
  );
  
  const canRead = checkPermission(Permission.READ_ARTIST);
  const canUpdate = checkPermission(Permission.UPDATE_ARTIST);
  const canDelete = checkPermission(Permission.DELETE_ARTIST);
  const canManageUsers = checkPermission(Permission.MANAGE_ARTIST_USERS);
  
  return {
    canRead,
    canUpdate,
    canDelete,
    canManageUsers,
    checkPermission,
  };
}
```

## Security Measures

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Strong password requirements
- **Reset Tokens**: Cryptographically secure, time-limited
- **Rate Limiting**: Login attempt limiting

### Session Security
- **JWT Tokens**: Signed with secret key
- **Cookie Security**: HttpOnly, Secure, SameSite
- **Token Expiration**: 30-day expiration with refresh
- **CSRF Protection**: Built-in NextAuth.js protection

### API Security
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Per-endpoint rate limits
- **CORS Configuration**: Restricted origins
- **Error Handling**: No sensitive data in error responses

### Database Security
- **Connection Encryption**: SSL/TLS connections
- **Query Parameterization**: Prisma ORM prevents SQL injection
- **Access Control**: Database-level user permissions
- **Audit Logging**: Track sensitive operations

## User Management

### User Invitation System
```typescript
interface UserInvitation {
  id: string;
  email: string;
  artistId: string;
  role: 'owner' | 'collaborator';
  token: string;
  expiresAt: Date;
  invitedBy: string;
  createdAt: Date;
}
```

### Invitation Flow
1. Artist owner sends invitation
2. Generate secure invitation token
3. Send invitation email
4. Recipient clicks link and registers/logs in
5. Automatically associate user with artist
6. Invalidate invitation token

### User Management API
```typescript
// POST /api/artists/[id]/users/invite
interface InviteUserRequest {
  email: string;
  role: 'collaborator';
}

// DELETE /api/artists/[id]/users/[userId]
// Remove user from artist

// PUT /api/artists/[id]/users/[userId]
interface UpdateUserRoleRequest {
  role: 'owner' | 'collaborator';
}
```

## Error Handling

### Authentication Errors
- **401 Unauthorized**: Invalid credentials or expired session
- **403 Forbidden**: Insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded

### Error Response Format
```typescript
interface AuthError {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'RATE_LIMITED';
  message: string;
  details?: {
    requiredPermission?: Permission;
    resource?: string;
  };
}
```

## Environment Variables

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://...

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Implementation Checklist

### Phase 1: Basic Authentication
- [ ] Set up NextAuth.js configuration
- [ ] Implement user registration/login
- [ ] Create user model and database schema
- [ ] Add password hashing and validation
- [ ] Implement logout functionality

### Phase 2: Authorization System
- [ ] Define permission system
- [ ] Implement user-artist relationships
- [ ] Create permission checking functions
- [ ] Add API route protection
- [ ] Implement frontend route guards

### Phase 3: User Management
- [ ] Create user invitation system
- [ ] Implement role management
- [ ] Add user removal functionality
- [ ] Create user management UI

### Phase 4: Security Hardening
- [ ] Add rate limiting
- [ ] Implement password reset
- [ ] Add audit logging
- [ ] Security testing and review

## Testing Strategy

### Unit Tests
- Password hashing/validation
- Permission checking functions
- JWT token generation/validation

### Integration Tests
- Authentication flow
- Authorization middleware
- API route protection

### E2E Tests
- User registration/login
- Multi-user collaboration
- Permission enforcement 