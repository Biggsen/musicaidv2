## Buglist

1. **Avoid `dark:` utility classes**
   - We should not use any `dark:` classes anywhere in the app.
   - Rely on Nuxt UI components and their built-in styling/theming for dark mode support instead.

2. **Audio upload failing on staging with "1 Internal Error"**
   - **Status**: Regression - previously working
   - **Environment**: Staging only (works fine locally)
   - **Error**: Browser shows "1 Internal Error. ID: 01KBFK00Z9X79AD5CW431BY5BM" in Network tab
   - **Symptoms**: 
     - Upload endpoint `/api/upload/audio` returns generic internal error
     - Function logs show successful execution (no errors in Netlify logs)
     - Environment variables confirmed set and correct
     - File size: 6.11MB (within limits)
   - **Possible causes**:
     - Response serialization issue (response object may contain non-serializable data)
     - Netlify edge layer intercepting response before it reaches client
     - Error occurring after function completes but during response transmission
     - R2 upload succeeding but response failing to serialize properly
   - **Next steps**:
     - Check Network tab for actual HTTP status code and response body
     - Add detailed logging around R2 upload operation
     - Test with minimal response object to isolate serialization issue
     - Verify R2 upload is actually completing successfully


