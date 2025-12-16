## Buglist

1. **Avoid `dark:` utility classes**
   - We should not use any `dark:` classes anywhere in the app.
   - Rely on Nuxt UI components and their built-in styling/theming for dark mode support instead.

2. **Audio upload failing on staging with "1 Internal Error"** ✅ FIXED
   - **Status**: Fixed - Implemented presigned URL solution
   - **Root Cause**: Netlify functions have a 6MB request body size limit (free tier). Files over 6MB are rejected by Netlify's edge layer before reaching the function handler.
   - **Solution Implemented**:
     - Implemented presigned URL flow: `/api/uploads/init` → direct R2 upload → `/api/uploads/complete`
     - Files now upload directly to R2, bypassing Netlify's 6MB limit
     - Updated `AudioUpload.vue`, `batch-upload.vue`, and `test-upload.vue` to use new flow
     - Removed 6MB validation checks (no longer needed)
   - **Benefits**: Supports files of any size, faster uploads, no Netlify function timeouts


