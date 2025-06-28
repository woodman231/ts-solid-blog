# Token Timing Issues Fix

## Problem

Users experiencing `NotBeforeError: jwt not active` when:

- Navigating away from the page and coming back
- Logging out and back in
- After periods of inactivity

This is caused by clock skew between client, server, and Azure AD B2C, or tokens being issued with future validity times.

## Solutions Implemented

### 1. Server-side Clock Tolerance

- Added 5-minute clock tolerance to JWT verification
- Enhanced logging to detect timing issues
- Better error handling for `NotBeforeError`

### 2. Client-side Token Management

- Added token freshness validation before use
- Automatic token refresh when timing issues detected
- Retry logic for socket connections with token issues

### 3. Socket Connection Resilience

- Retry mechanism for token acquisition (3 attempts)
- Automatic retry on connection errors related to token timing
- Delayed initialization to ensure auth state stability

### 4. Cache Management

- Utility functions to clear problematic tokens
- Detection of tokens issued in the future
- Automatic cache clearing when timing issues occur

### 5. Enhanced Logging

- Detailed token timing analysis on server
- Client-side timing checks and warnings
- Better error context for debugging

## Files Modified

1. `/apps/server/src/services/authService.ts`
   - Added `clockTolerance: 300` to JWT verification
   - Enhanced logging with timing information
   - Better error handling for `NotBeforeError`

2. `/apps/client/src/auth/msal.ts`
   - Added token timing validation
   - Force refresh for future-dated tokens
   - Cache clearing utilities

3. `/apps/client/src/lib/socket.ts`
   - Retry logic for token acquisition
   - Timing issue detection and handling
   - Automatic reconnection on timing errors

4. `/apps/client/src/components/layouts/MainLayout.tsx`
   - Delayed socket initialization
   - Error handling with retry logic

## Testing

After implementing these changes, the application should handle:

- Clock skew between systems
- Navigation timing issues
- Token cache problems
- Connection timing errors

The system will now be more resilient to timing-related authentication issues.
