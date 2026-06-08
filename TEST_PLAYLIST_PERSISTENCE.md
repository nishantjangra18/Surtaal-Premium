# Test Playlist Persistence - Step by Step

## Prerequisites
Before testing, ensure:
1. ✅ Backend server is running
2. ✅ MongoDB is connected
3. ✅ Frontend dev server is running
4. ✅ You are logged into the app

## Quick Start Commands

### Terminal 1 - Backend:
```bash
cd backend
npm start
```
**Expected output:**
```
🔌 Attempting to connect to MongoDB...
✅ MongoDB Connected Successfully
🚀 Server is running on http://localhost:5000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Test Procedure

### Step 1: Open Browser Console
1. Open the app: `http://localhost:5173`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Clear console (optional)

### Step 2: Login
1. Login with your account
2. **Check console** - you should see:
```
[SurTaal] Starting library hydration...
[SurTaal] Loaded playlists: Array(X)
[SurTaal] Normalized playlists: Array(X)
[SurTaal] Library hydrated for user: yourname
```

If you see this ✅ - persistence is working!

### Step 3: Create a Playlist
1. Click "Create Playlist" button
2. Enter name: "Test Playlist 1"
3. Enter description: "Testing persistence"
4. Click "Create Playlist"

**Check console:**
```
[SurTaal] Creating playlist: {name: "Test Playlist 1", description: "Testing persistence", ...}
[SurTaal] Saving playlist to backend...
[SurTaal] Playlist saved, backend response: {_id: "...", name: "Test Playlist 1", ...}
```

**Check UI:**
- ✅ Toast: "✓ Playlist Created"
- ✅ Playlist appears in sidebar
- ✅ Playlist appears in library

### Step 4: Test Persistence (CRITICAL)
1. **Refresh the page** (`F5` or `Ctrl+R`)
2. Wait for page to reload
3. **Check console** for hydration logs
4. **Check sidebar/library** - playlist should still be there

**If playlist is still there** ✅ - **PERSISTENCE WORKING!**  
**If playlist disappeared** ❌ - See troubleshooting below

### Step 5: Test Rename
1. Click on your playlist
2. Click "Edit Details" or similar
3. Change name to "Test Playlist Renamed"
4. Click "Save"

**Check console:**
```
[SurTaal] Updating playlist: 507f1f77bcf86cd799439011 {name: "Test Playlist Renamed"}
[SurTaal] Playlist update saved successfully
```

5. **Refresh the page**
6. Playlist name should still be "Test Playlist Renamed"

### Step 6: Test Cover Change
1. Click on playlist
2. Click "Change Cover" or similar
3. Select a new cover
4. **Check console** for update logs
5. **Refresh the page**
6. Cover should persist

### Step 7: Test Add Song
1. Play any song
2. Click three dots menu
3. Click "Add to Playlist"
4. Select "Test Playlist Renamed"

**Check console:**
```
[SurTaal] Adding song to playlist: 507f1f77bcf86cd799439011 Song Title
[SurTaal] Song added successfully
```

5. **Refresh the page**
6. Open playlist
7. Song should still be there

### Step 8: Test Delete
1. Right-click playlist (or open context menu)
2. Click "Delete Playlist"
3. Confirm deletion

**Check console:**
```
[SurTaal] Deleting playlist: 507f1f77bcf86cd799439011
[SurTaal] Playlist deleted successfully
```

4. **Refresh the page**
5. Playlist should NOT reappear

## Success Criteria

All of these should work:
- ✅ Create playlist → refresh → still there
- ✅ Rename playlist → refresh → new name persists
- ✅ Change cover → refresh → cover persists
- ✅ Add song → refresh → song still in playlist
- ✅ Delete playlist → refresh → stays deleted
- ✅ No "Changes Failed" errors
- ✅ Console logs show successful operations

## Troubleshooting

### Problem: Playlists disappear after refresh

#### Check 1: Is backend connected?
**Backend console should show:**
```
✅ MongoDB Connected Successfully
```

**If you see connection errors:**
```bash
# Test MongoDB connection directly
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/surtaal').then(() => console.log('✅ Connected')).catch(err => console.error('❌ Failed:', err.message));"
```

#### Check 2: Are requests reaching backend?
**In browser:**
1. Open Network tab (F12 → Network)
2. Filter by "XHR" or "Fetch"
3. Create a playlist
4. Look for request: `POST /api/songs/playlists`

**Expected:**
- Status: `201 Created`
- Response body: `{_id: "...", name: "...", ...}`

**If you see:**
- `401 Unauthorized` → Token issue (logout/login)
- `500 Internal Server Error` → Backend error (check backend console)
- `404 Not Found` → Route not registered
- Request not appearing → Frontend not sending request

#### Check 3: Is token valid?
**In browser console:**
```javascript
localStorage.getItem('token')
```

Should return a long string (JWT token).

**If `null`:**
1. Logout
2. Login again
3. Check again

#### Check 4: Backend logs
**When you create playlist, backend console should show:**
```
POST /api/songs/playlists 201
```

**If you see errors:**
- Check backend error message
- Check MongoDB connection
- Check User model

### Problem: "Changes Failed" errors

#### Cause 1: Wrong playlist ID
Console will show:
```
[SurTaal userLibraryService] Request failed: {
  url: "/api/songs/playlists/pl-1234567890",
  error: "Playlist not found"
}
```

**Solution:** Wait for create to complete before editing

#### Cause 2: Backend not running
Console will show:
```
[SurTaal userLibraryService] Request failed: {
  error: "Network Error"
}
```

**Solution:** Start backend server

#### Cause 3: Token expired
Console will show:
```
[SurTaal userLibraryService] Request failed: {
  error: {message: "Token is not valid"}
}
```

**Solution:** Logout and login again

### Problem: Console logs not appearing

**If you don't see any `[SurTaal]` logs:**

1. **Clear cache:**
   - `Ctrl+Shift+R` (hard refresh)
   - Or: DevTools → Network → Disable cache checkbox

2. **Check if changes were applied:**
   ```bash
   # In frontend folder
   cd frontend
   # Restart dev server
   npm run dev
   ```

3. **Verify file was saved:**
   - Open `frontend/src/context/MusicContext.jsx`
   - Search for `console.log('[SurTaal]`
   - Should appear multiple times

## Manual Backend Test

If frontend still not working, test backend directly:

### 1. Get Auth Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your@email.com\",\"password\":\"yourpassword\"}"
```

Copy the `token` from response.

### 2. Create Playlist
```bash
curl -X POST http://localhost:5000/api/songs/playlists \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Backend Test\",\"description\":\"Testing\"}"
```

Should return playlist with `_id`.

### 3. Get Playlists
```bash
curl -X GET http://localhost:5000/api/songs/playlists \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

Should return array including "Backend Test".

### 4. Update Playlist
```bash
curl -X PATCH http://localhost:5000/api/songs/playlists/PLAYLIST_ID_HERE \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Backend Test Updated\"}"
```

### 5. Delete Playlist
```bash
curl -X DELETE http://localhost:5000/api/songs/playlists/PLAYLIST_ID_HERE \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

**If all curl commands work** → Backend is fine, issue is in frontend  
**If curl commands fail** → Backend/MongoDB issue

## Expected Console Output (Full Example)

Here's what a complete successful flow looks like:

```
# Page Load / Login
[SurTaal] Starting library hydration...
[SurTaal] Loaded playlists: []
[SurTaal] Normalized playlists: []
[SurTaal] Library hydrated for user: testuser

# Create Playlist
[SurTaal] Creating playlist: {name: "My Playlist", description: "Test", cover: "", songsCount: 0}
[SurTaal] Saving playlist to backend...
[SurTaal] Playlist saved, backend response: {_id: "65abc123def...", name: "My Playlist", ...}

# Add Song
[SurTaal] Adding song to playlist: 65abc123def... Shape of You
[SurTaal] Song added successfully

# Update Playlist
[SurTaal] Updating playlist: 65abc123def... {name: "My Awesome Playlist"}
[SurTaal] Playlist update saved successfully

# Page Refresh
[SurTaal] Starting library hydration...
[SurTaal] Loaded playlists: Array(1)
  0: {_id: "65abc123def...", name: "My Awesome Playlist", songs: Array(1), ...}
[SurTaal] Normalized playlists: Array(1)
  0: {id: "65abc123def...", name: "My Awesome Playlist", songs: Array(1), ...}
[SurTaal] Library hydrated for user: testuser

# Delete Playlist
[SurTaal] Deleting playlist: 65abc123def...
[SurTaal] Playlist deleted successfully
```

## Need More Help?

If persistence is still not working after following this guide:

1. **Copy all console logs** (right-click in console → Save as...)
2. **Copy backend console output**
3. **Copy Network tab** (right-click failed request → Copy → Copy as cURL)
4. **Check `PLAYLIST_PERSISTENCE_FIX.md`** for technical details

The logs will show exactly where the flow is breaking.
