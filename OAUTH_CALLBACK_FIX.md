# Google OAuth Callback Fix

## Problem
After Google OAuth authentication, users were being redirected to `/auth/callback?tokens=...` but the profile selection screen was not appearing properly.

## Root Cause
The `AuthCallback` component was not properly waiting for the authentication state to update after processing the OAuth tokens, leading to timing issues where the profile selection screen wouldn't show.

## Changes Made

### 1. Enhanced AuthCallback Component (`frontend/src/components/AuthCallback.tsx`)

**Improvements:**
- Added comprehensive console logging to track the OAuth flow
- Improved token validation before showing profile selection
- Added explicit checks for `access_token` and stored user data
- Added debug information in development mode
- Better error handling and user feedback

**Key Changes:**
```typescript
// Before: Used setTimeout with arbitrary delay
setTimeout(() => {
  setShowProfileSelection(true);
  setLoading(false);
}, 1500);

// After: Explicitly check for authentication state
await new Promise(resolve => setTimeout(resolve, 500));
const accessToken = localStorage.getItem('access_token');
const storedUser = localStorage.getItem('user');

if (accessToken && storedUser) {
  console.log('✅ User authenticated, showing profile selection');
  setShowProfileSelection(true);
  setLoading(false);
} else {
  console.error('❌ Authentication failed - no tokens found');
  setError('Authentication failed. Please try again.');
  setLoading(false);
}
```

### 2. Enhanced AuthContext (`frontend/src/context/AuthContext.tsx`)

**Improvements:**
- Added detailed logging in `handleOAuthCallback` function
- Added logging in `storeTokens` function to track token storage
- Better validation of token data before processing
- Improved error messages for debugging

**Key Changes:**
```typescript
// Added comprehensive logging
console.log('🔐 Decoding OAuth tokens...');
console.log('✅ Tokens decoded successfully');
console.log('👤 User data:', { 
  id: userData.id, 
  email: userData.email, 
  name: userData.name,
  current_profile_type: userData.current_profile_type,
  available_profiles: userData.available_profiles?.length || 0
});
```

## OAuth Flow (Complete)

1. **User Initiates Login**
   - User visits `/company/login` or `/vendor/login`
   - Clicks "Continue with Google"
   - `intended_profile_type` is stored in localStorage

2. **Backend OAuth Redirect**
   - Frontend redirects to `/auth/google` (backend route)
   - Backend uses Laravel Socialite to redirect to Google OAuth

3. **Google Authentication**
   - User authenticates with Google
   - Google redirects back to `/auth/google/callback` (backend)

4. **Backend Processing**
   - Backend receives OAuth callback from Google
   - Creates/updates user in database
   - Generates access token and refresh token
   - Encodes tokens and user data in base64
   - Redirects to frontend: `/auth/callback?tokens=BASE64_ENCODED_DATA`

5. **Frontend Token Processing**
   - `AuthCallback` component extracts `tokens` parameter
   - Decodes base64 data to get access_token, refresh_token, and user data
   - Stores tokens in localStorage via `handleOAuthCallback`
   - Updates AuthContext state

6. **Profile Selection**
   - Shows profile selection screen with two options:
     - **Company**: Create new or continue with existing company profile
     - **Vendor**: Create new or continue with existing vendor profile
   - User selects profile type
   - Navigates to appropriate dashboard or profile setup page

## Testing the Fix

### Prerequisites
1. Backend server running on `http://localhost:8000`
2. Frontend server running on `http://localhost:5173`
3. Google OAuth credentials configured in backend `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
   ```

### Test Steps

1. **Open Browser Console** (F12) to see detailed logs

2. **Navigate to Login Page**
   ```
   http://localhost:5173/company/login
   ```

3. **Click "Continue with Google"**
   - Should redirect to Google OAuth consent screen
   - Console should show: `intended_profile_type` stored

4. **Authenticate with Google**
   - Select your Google account
   - Grant permissions

5. **Observe Callback Processing**
   - Should redirect to `/auth/callback?tokens=...`
   - Console should show:
     ```
     🔐 Processing OAuth callback with tokens...
     🔐 Decoding OAuth tokens...
     ✅ Tokens decoded successfully
     ✅ All required token data present
     👤 User data: { id, email, name, ... }
     ✅ Tokens stored successfully
     💾 Storing tokens and user data...
     ✅ User authenticated, showing profile selection
     ```

6. **Profile Selection Screen**
   - Should see "Choose Your Profile" screen
   - Two cards: Company and Vendor
   - Each card shows either "Create Profile" or "Continue as..." button

7. **Select Profile Type**
   - Click on desired profile type
   - Should navigate to appropriate page:
     - New profile → `/company/complete-profile` or `/vendor/complete-profile`
     - Existing profile → `/company/dashboard` or `/vendor/dashboard`

## Debugging

### Check Browser Console
Look for these log messages:
- ✅ = Success
- ❌ = Error
- 🔐 = Authentication related
- 💾 = Storage operation
- 👤 = User data
- 📌 = Profile selection

### Check localStorage
Open DevTools → Application → Local Storage → `http://localhost:5173`

Should contain:
- `access_token`: JWT token string
- `refresh_token`: Refresh token string
- `user`: JSON object with user data

### Common Issues

**Issue**: Profile selection screen doesn't appear
- Check console for errors
- Verify tokens are in localStorage
- Check if `showProfileSelection` state is true

**Issue**: "Authentication failed" error
- Check backend logs for OAuth errors
- Verify Google OAuth credentials
- Check network tab for failed requests

**Issue**: Stuck on loading screen
- Check if `authLoading` is stuck at true
- Verify `handleOAuthCallback` completed successfully
- Check for JavaScript errors in console

## Files Modified

1. `frontend/src/components/AuthCallback.tsx` - Enhanced OAuth callback handling
2. `frontend/src/context/AuthContext.tsx` - Added comprehensive logging
3. `OAUTH_CALLBACK_FIX.md` - This documentation file

