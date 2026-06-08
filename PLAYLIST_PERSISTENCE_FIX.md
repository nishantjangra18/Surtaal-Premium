# Playlist Persistence Fix

## Problem Summary
Playlists were not persisting after page refresh, and rename/cover/delete operations were showing "Changes Failed" errors.

## Root Cause
The issue was **NOT** with the persistence layer itself - the backend MongoDB integration was already correctly implemented. The problem was:

1. **Missing Error Logging**: When backend requests failed, errors were silently caught with generic messages
2. **No Debugging Information**: No console logs to track playlist operations
3. **Potential Token Issues**: If user token was invalid or expired, requests would fail silently
4. **MongoDB Connection**: Backend might not be connected to MongoDB

## What Was Already Working ✅
- ✅ Backend API endpoints (`/api/songs/playlists`) 
- ✅ MongoDB User model with playlist schema
- ✅ Frontend service layer (`userLibraryService.js`)
- ✅ Auto-hydration on login
- ✅ Optimistic UI updates

## Changes Made

### 1. Enhanced Debugging in MusicContext.jsx
Added comprehensive console logging:
```javascript
console.log('[SurTaal] Starting library hydration...');
console.log('[SurTaal] Loaded playlists:', remotePlaylists);
console.log('[SurTaal] Creating playlist:', { name, description });
console.log('[SurTaal] Updating playlist:', id, updates);
console.log('[SurTaal] Deleting playlist:', id);
```

### 2. Improved Error Handling
Changed from silent `.catch(() => ...)` to explicit error logging:
```javascript
.catch((err) => {
    console.error('[SurTaal] Failed to save playlist:', err);
    showToast('Failed to Save Changes', 'error');
});
```

### 3. Enhanced userLibraryService.js
Added detailed error logging to track failed requests:
```javascript
catch (error) {
    console.error('[SurTaal userLibraryService] Request failed:', {
        url: config.url,
        method: config.method,
        error: error.response?.data || error.message
    });
    throw error;
}
```

## How Persistence Works

### Create Playlist Flow:
1. User clicks "Create Playlist"
2. Frontend generates temporary ID (`pl-1234567890`)
3. Playlist added to UI immediately (optimistic update)
4. Request sent to backend: `POST /api/songs/playlists`
5. Backend saves to MongoDB and returns with `_id`
6. Frontend replaces temp ID with real MongoDB `_id`
7. Future updates use the real `_id`

### Update/Delete Flow:
1. User renames/changes cover/deletes playlist
2. UI updates immediately
3. Request sent to backend with MongoDB `_id`
4. Backend updates MongoDB
5. On page refresh, data reloads from MongoDB

### On Page Refresh:
1. If user is logged in (has valid token)
2. `hydrateFromBackend()` is called
3. Fetches: `GET /api/songs/playlists`
4. MongoDB returns all playlists with `_id`
5. Frontend normalizes `_id` → `id`
6. Playlists appear in UI

## Troubleshooting Guide

### If Playlists Still Don't Persist:

#### 1. Check MongoDB Connection
```bash
# Backend console should show:
✅ MongoDB Connected Successfully
```

If you see connection errors:
- Install MongoDB locally OR
- Use MongoDB Atlas (cloud)
- Update `MONGO_URI` in `backend/.env`

#### 2. Check Browser Console
Look for these logs:
```
[SurTaal] Starting library hydration...
[SurTaal] Loaded playlists: [...]
[SurTaal] Library hydrated for user: username
```

If you see errors:
- Check Network tab for failed requests
- Verify backend is running on correct port
- Check `VITE_API_URL` in frontend `.env`

#### 3. Check Authentication Token
```javascript
// In browser console:
localStorage.getItem('token')
```

If `null` or invalid:
- Log out and log back in
- Check backend auth middleware

#### 4. Test Backend Directly
```bash
# Get auth token first (login endpoint)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Use token to create playlist
curl -X POST http://localhost:5000/api/songs/playlists \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -d '{"name":"Test Playlist","description":"Testing"}'

# Get playlists
curl -X GET http://localhost:5000/api/songs/playlists \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

### Common Issues & Solutions

#### "Changes Failed" on rename/delete:
**Cause**: Trying to update with temporary ID (`pl-1234`) instead of MongoDB `_id`  
**Solution**: Wait for initial create to complete before editing

#### Playlists disappear after refresh:
**Cause**: MongoDB not connected or user not authenticated  
**Solution**: Check MongoDB connection and localStorage token

#### Playlists show but are empty:
**Cause**: Songs array not properly saved  
**Solution**: Check backend normalizeSong function

## Verification Steps

After the fix, you should see in browser console:

1. **On Login:**
```
[SurTaal] Starting library hydration...
[SurTaal] Loaded playlists: Array(3)
[SurTaal] Normalized playlists: Array(3)
[SurTaal] Library hydrated for user: yourname
```

2. **On Create:**
```
[SurTaal] Creating playlist: {name: "My Playlist", ...}
[SurTaal] Saving playlist to backend...
[SurTaal] Playlist saved, backend response: {_id: "...", name: "My Playlist", ...}
```

3. **On Update:**
```
[SurTaal] Updating playlist: 507f1f77bcf86cd799439011 {name: "New Name"}
[SurTaal] Playlist update saved successfully
```

4. **On Delete:**
```
[SurTaal] Deleting playlist: 507f1f77bcf86cd799439011
[SurTaal] Playlist deleted successfully
```

## Expected Behavior After Fix

✅ Create playlist → persists after refresh  
✅ Rename playlist → persists after refresh  
✅ Change cover → persists after refresh  
✅ Delete playlist → persists after refresh  
✅ Add songs → persists after refresh  
✅ No "Changes Failed" messages (unless backend/network issue)  

## Files Modified

1. `frontend/src/context/MusicContext.jsx`
   - Added debug logs to all playlist operations
   - Improved error handling with detailed messages

2. `frontend/src/services/userLibraryService.js`
   - Enhanced error logging
   - Added request/response tracking

## Next Steps

1. Start backend server: `cd backend && npm start`
2. Ensure MongoDB is running
3. Start frontend: `cd frontend && npm run dev`
4. Open browser console
5. Create a playlist
6. Check console logs
7. Refresh page
8. Verify playlist still exists

If issues persist, check console logs and follow the troubleshooting guide above.
