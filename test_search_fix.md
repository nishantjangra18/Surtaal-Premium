# Test Script for Spotify Search Fix

## Manual Testing Steps

### 1. Start the Backend Server
```bash
cd backend
npm start
```

Expected output should show:
```
[Spotify Token] Requesting new client_credentials token...
Server running on port 5000
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Desktop Search

1. Open the app in a browser (desktop mode)
2. Click on the search bar in the navbar
3. Type a search query (e.g., "Arijit Singh")
4. Check browser console for logs:
   ```
   [Spotify Search] query="Arijit Singh" limit=7 (type: number) market=IN
   [Spotify Search] Request params: { "q": "Arijit Singh", "type": "track", "market": "IN", "limit": 7 }
   [Spotify API] FETCH URL: https://api.spotify.com/v1/search?q=Arijit%20Singh&type=track&market=IN&limit=7
   ```
5. Verify search results appear without errors

### 4. Test SearchView (Full Page Search)

1. Navigate to the Search page
2. Type a search query in the search bar
3. Check browser console for:
   ```
   [Spotify Search] query="..." limit=15 (type: number) market=IN
   ```
4. Verify 15 results load correctly

### 5. Test Mobile Search

1. Open browser dev tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device (iPhone, Android)
4. Navigate to Search page
5. Type in the mobile search input at the top
6. Check console logs show same pattern as desktop
7. Verify results load correctly

### 6. Test Collection Pages

1. Click on any mood (e.g., "Relax")
2. Check console for:
   ```
   [Spotify Search] query="relax chill Hindi lofi" limit=30 (type: number) market=IN
   ```
3. Verify songs load

## Expected Results ✅

### Console Logs Should Show:

1. **Parameter Type is Number:**
   ```
   limit=15 (type: number)
   ```

2. **Request URL has numeric limit:**
   ```
   https://api.spotify.com/v1/search?q=...&limit=15
   ```
   NOT: `&limit=%2215%22` or `&limit="15"`

3. **Status 200 OK:**
   ```
   [Spotify API] GET /search?... -> 200
   ```

4. **NO 400 Errors:**
   - No "Invalid limit" errors
   - No "Bad Request" responses

### What NOT to See ❌

- `400 Invalid limit`
- `[Spotify API] -> 400`
- Limit showing as string in logs: `limit="15"` 
- Encoded quotes in URL: `%22`

## Backend Verification

Check backend terminal for logs:

```
[Music Route] Search: "test query"
[Spotify Search] query="test query" limit=15 (type: number) market=IN
[Spotify Search] Request params: {
  "q": "test query",
  "type": "track",
  "market": "IN",
  "limit": 15
}
[Spotify API] FETCH URL: https://api.spotify.com/v1/search?q=test%20query&type=track&market=IN&limit=15
[Spotify API] GET /search?q=test query&type=track&market=IN&limit=15 -> 200
[Spotify Search] Returned 15 tracks. Preview URLs present: X/15
```

## Troubleshooting

### If you still see 400 errors:

1. Clear backend node_modules cache:
   ```bash
   cd backend
   rm -rf node_modules
   npm install
   ```

2. Check .env file has Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_id
   SPOTIFY_CLIENT_SECRET=your_secret
   SPOTIFY_MARKET=IN
   ```

3. Verify Spotify credentials are valid:
   - Go to https://developer.spotify.com/dashboard
   - Check app status
   - Regenerate credentials if needed

4. Check if limit is actually a number in the logs:
   - Look for `(type: number)` in the console
   - If it says `(type: string)`, the fix didn't apply

### If mobile search doesn't work:

1. Check that mobile is using the same endpoint:
   ```javascript
   // Should be in SearchView.jsx line 114
   musicService.searchSongs(trimmed, { limit: 15 })
   ```

2. Verify no duplicate search service:
   ```bash
   # Search for other search implementations
   grep -r "fetch.*search" frontend/src --include="*.js" --include="*.jsx"
   ```

## Success Criteria

- ✅ Desktop search works
- ✅ Mobile search works  
- ✅ Navbar dropdown works
- ✅ Collection pages work
- ✅ All show `limit=X (type: number)` in logs
- ✅ All return 200 OK status
- ✅ No 400 "Invalid limit" errors
