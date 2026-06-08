# Playlist Persistence Diagnosis

## Step 1: Check if Backend is Running

Open backend terminal and look for:
```
✅ MongoDB Connected Successfully
🚀 Server is running on http://localhost:5000
```

If you don't see this, start backend:
```bash
cd backend
npm start
```

## Step 2: Open Browser Console

1. Go to your app in browser
2. Press **F12** (Developer Tools)
3. Click **Console** tab
4. **Keep it open** for all remaining steps

## Step 3: Check What You See on Page Load

After refreshing the page, look for these logs:

### ✅ Good - You should see:
```
[SurTaal] Initial mount - token exists: true, saved user: true
[SurTaal] Checking auth after mount - user: YourUsername, token: true
[SurTaal] User authenticated on mount, hydrating from backend...
[SurTaal] Starting library hydration...
[SurTaal] Loaded playlists: Array(X)
[SurTaal] Library hydrated for user: YourUsername
```

### ❌ Bad scenarios:

#### Scenario A: Token is false
```
[SurTaal] Initial mount - token exists: false
```
**Problem:** You're not logged in  
**Solution:** Login again

#### Scenario B: User is null
```
[SurTaal] Checking auth after mount - user: null, token: true
```
**Problem:** User object not loading from localStorage  
**Solution:** See below

#### Scenario C: No logs at all
**Problem:** Code changes not applied  
**Solution:** Hard refresh (Ctrl+Shift+R)

#### Scenario D: Error in console
```
[SurTaal userLibraryService] Request failed: ...
```
**Problem:** Backend not responding or error  
**Copy the full error and check backend logs**

## Step 4: Create a Playlist

1. Click "Create Playlist"
2. Enter name "Test 123"
3. Click Create

### In BROWSER Console, you should see:
```
[SurTaal] Creating playlist: {name: "Test 123", ...}
[SurTaal] Saving playlist to backend...
[SurTaal] Playlist saved, backend response: {_id: "...", name: "Test 123", ...}
```

### In BACKEND Terminal, you should see:
```
[Backend] POST /playlists - User ID: 123abc... Name: Test 123
[Backend] Playlist created with _id: 456def...
```

### What do you actually see?

#### If you see NOTHING in backend terminal:
- Frontend is not sending the request
- Check Network tab (F12 → Network)
- Look for POST request to `/api/songs/playlists`
- If not there: Frontend issue
- If there with red status: Backend issue

#### If backend shows the log but frontend shows error:
- Copy the exact error from browser console
- Copy the exact error from backend terminal

## Step 5: Check if Saved in Database

### In BACKEND Terminal, run this:
```bash
cd backend
node
```

Then paste this:
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/surtaal')
  .then(async () => {
    const users = await User.find({});
    users.forEach(u => {
      console.log('User:', u.username, '- Playlists:', u.playlists.length);
      u.playlists.forEach(p => console.log('  -', p.name, '(id:', p._id + ')'));
    });
    process.exit(0);
  });
```

**Expected output:**
```
User: yourname - Playlists: 1
  - Test 123 (id: 507f1f77bcf86cd799439011)
```

**If you see 0 playlists:** Not saved to database - backend issue  
**If you see playlists:** Database is fine - frontend loading issue

## Step 6: Refresh Page

Press F5 to refresh.

### In BROWSER Console:
```
[SurTaal] Initial mount - token exists: true, saved user: true
[SurTaal] Checking auth after mount - user: yourname, token: true
[SurTaal] User authenticated on mount, hydrating from backend...
[SurTaal] Starting library hydration...
[SurTaal] Loaded playlists: Array(1)
  0: {_id: "507f...", name: "Test 123", songs: Array(0), ...}
[SurTaal] Normalized playlists: Array(1)
  0: {id: "507f...", name: "Test 123", songs: Array(0), ...}
[SurTaal] Library hydrated for user: yourname
```

### In BACKEND Terminal:
```
[Backend] GET /playlists - User ID: 123abc...
[Backend] Returning playlists: 1 playlists
```

### What do you ACTUALLY see?

---

## PASTE YOUR ACTUAL OUTPUT HERE:

### Browser Console on Page Load:
```
[Paste here]
```

### Browser Console when Creating Playlist:
```
[Paste here]
```

### Backend Terminal when Creating Playlist:
```
[Paste here]
```

### Backend Terminal on Page Refresh:
```
[Paste here]
```

### Browser Network Tab (check /api/songs/playlists):
- Request sent? YES / NO
- Status code: [Paste code]
- Response: [Paste response]

---

## Quick Test in Browser Console

Paste this in browser console RIGHT NOW:
```javascript
console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
console.log('User:', localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : 'MISSING');

// Test API call
fetch('/api/songs/playlists', {
  headers: { 'x-auth-token': localStorage.getItem('token') }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

**What does this show?**
