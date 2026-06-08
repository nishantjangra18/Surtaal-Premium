# SPOTIFY SEARCH BUG FIX

## Problem
Spotify search was failing with **400 Invalid limit** error on both desktop and mobile.

## Root Cause
In `backend/services/spotifyService.js`, the `spotifyFetch` function was converting ALL parameters to strings:

```javascript
.map(([k, v]) => [k, String(v)])   // ← This caused numeric limit to become "15"
```

When numeric parameters like `limit: 15` were converted to strings and then passed through `encodeURIComponent`, Spotify's API rejected them.

## Solution

### 1. Fixed Parameter Handling in spotifyService.js

**Changed:** Removed the explicit string conversion that was breaking numeric parameters.

```javascript
// BEFORE (Line 125)
.map(([k, v]) => [k, String(v)])   // ← Forced everything to string

// AFTER
// Parameters kept in their original types (numbers stay numbers)
```

The query string builder now converts to string **during encoding**, which preserves the proper numeric type in the URL.

### 2. Added Enhanced Logging

Added parameter type logging to `searchTracks` function:

```javascript
console.log(`[Spotify Search] query="${normalizedQuery}" limit=${size} (type: ${typeof size}) market=${MARKET}`);
console.log(`[Spotify Search] Request params:`, JSON.stringify(params, null, 2));
```

This will help diagnose similar issues in the future.

## Verification

### Desktop and Mobile Use Same Code Path ✅

1. **SearchView.jsx** (line 114) - Desktop/Mobile unified search:
   ```javascript
   musicService.searchSongs(trimmed, { limit: 15 })
   ```

2. **Navbar.jsx** (line 109) - Desktop navbar dropdown:
   ```javascript
   const results = await musicService.searchSongs(trimmed, { limit: 7 });
   ```

3. **exploreService.js** (line 81) - Collection pages:
   ```javascript
   const apiResults = await musicService.searchSongs(searchQuery, { limit: 30 });
   ```

**All code paths use the same `musicService.searchSongs` implementation → No duplicates found.**

### Backend Processing ✅

1. **routes/music.js** (line 74):
   ```javascript
   spotifySongs = await spotifyService.searchTracks(query, safeLimit(req.query.limit, 12));
   ```

2. **safeLimit helper** (lines 5-9):
   ```javascript
   const safeLimit = (value, fallback = 10, max = 50) => {
       const number = Number(value);
       if (!Number.isFinite(number)) return fallback;
       return Math.max(1, Math.min(max, Math.floor(number)));
   };
   ```
   Returns a **number**, not a string ✅

3. **spotifyService.js searchTracks** (line 288):
   ```javascript
   const size = safeLimit(limit, 12, 50);
   ```
   Returns a **number**, not a string ✅

## Expected Behavior After Fix

1. Desktop search works ✅
2. Mobile search works ✅  
3. Navbar dropdown search works ✅
4. Both use identical backend endpoint ✅
5. `limit` parameter is sent as a number ✅
6. Request URL logs show proper numeric limits ✅

## Testing Checklist

- [ ] Test desktop search (SearchView)
- [ ] Test mobile search (SearchView mobile input)
- [ ] Test navbar dropdown search
- [ ] Test collection/mood pages (exploreService)
- [ ] Check backend logs for proper parameter types
- [ ] Verify Spotify API returns 200 OK (not 400)

## Files Changed

1. `backend/services/spotifyService.js`
   - Removed forced string conversion
   - Added parameter type logging
   - Fixed comment to clarify the comma-preservation logic

## No Duplicate Implementations Found

Confirmed that there is **only ONE search implementation**:
- Frontend: `frontend/src/services/musicService.js` → `searchSongs()`
- Backend: `backend/services/spotifyService.js` → `searchTracks()`

Mobile and desktop both call the same endpoints with the same logic. ✅
