import { musicService } from './musicService';

// Module-level cache to survive component mounts/unmounts
export const exploreCache = new Map();

// Spotify search query builders per collection type
const buildSearchQuery = (type, key, queryText) => {
    // If caller passed an explicit queryText, prefer that
    if (queryText && queryText !== key) return queryText;

    switch (type) {
        case 'mood':
            return {
                'Relax': 'relax chill Hindi lofi songs',
                'Workout': 'workout gym energy Hindi Punjabi',
                'Party': 'party dance Bollywood Punjabi hits',
                'Heartbreak': 'heartbreak sad Hindi songs',
                'Road Trip': 'road trip drive Hindi Punjabi chill',
                'Focus': 'focus study concentration Hindi instrumental',
                'Monsoon': 'monsoon rain romantic Hindi songs',
                'Romance': 'romantic love Hindi Bollywood songs',
            }[key] || `${key} Hindi songs`;

        case 'language':
            return {
                'Hindi': 'Hindi songs hits Bollywood latest',
                'Punjabi': 'Punjabi songs hits latest',
                'Haryanvi': 'Haryanvi songs hits latest',
                'English': 'English pop hits trending',
                'Tamil': 'Tamil songs hits latest',
                'Telugu': 'Telugu songs hits latest',
                'Bhojpuri': 'Bhojpuri songs hits latest',
            }[key] || `${key} songs hits`;

        case 'artist':
            return key;

        case 'album':
            return `${key} movie soundtrack Bollywood`;

        case 'playlist':
            return {
                'Late Night Drive': 'late night drive Hindi chill lofi Punjabi',
                'Monsoon Vibes': 'monsoon rain Bollywood romantic acoustic',
                'Gym Beast Mode': 'workout gym energy Punjabi Haryanvi pump',
                'Sad Nights': 'sad heartbreak Bollywood Hindi night',
                'College Memories': 'college nostalgia Hindi Bollywood 2010s 2020s',
                'Desi Party': 'desi party Punjabi Bollywood dance hits',
            }[key] || `${key} Hindi songs`;

        case 'trending-collection':
            return queryText || `${key} trending India hits`;

        default:
            return key;
    }
};

/**
 * Resolves songs for Explore sections (Trending, Moods, Languages, Bollywood Soundtracks, Picks, Artists).
 * Uses ONLY Spotify API via musicService. No local data fallback.
 * Displays explicit SOURCE logs in the browser console.
 */
export const resolveExploreCollection = async (type, key, queryText) => {
    const cacheKey = `${type}:${key}`;

    // 1. Check Cache
    if (exploreCache.has(cacheKey)) {
        const cached = exploreCache.get(cacheKey);
        console.log(`[Explore Audit] Cache hit for type: ${type}, key: "${key}". Tracks: ${cached.length}. SOURCE: Cache`);
        return cached;
    }

    const searchQuery = buildSearchQuery(type, key, queryText);
    console.log(`[Explore Audit] Spotify request sent for type: ${type}, key: "${key}", query: "${searchQuery}"`);

    let songs = [];

    // 2. Query Spotify API
    try {
        const apiResults = await musicService.searchSongs(searchQuery, { limit: 30 });
        if (apiResults && apiResults.length > 0) {
            console.log(`[Explore Audit] Spotify response received for type: ${type}, key: "${key}". Track count: ${apiResults.length}. SOURCE: Spotify API`);
            songs = apiResults;
        } else {
            console.warn(`[Explore Audit] Spotify API returned 0 results for: "${searchQuery}". SOURCE: Spotify API (empty)`);
        }
    } catch (err) {
        console.warn(`[Explore Audit] Spotify API failed for: "${searchQuery}". Error: ${err.message}. SOURCE: Spotify API (error)`);
    }

    // 3. No local fallback — if Spotify fails, return empty
    if (songs.length === 0) {
        console.log(`[Explore Audit] No results available for type: ${type}, key: "${key}". Returning empty. SOURCE: No Data`);
        exploreCache.set(cacheKey, []);
        return [];
    }

    // 4. Deduplicate items by ID
    const finalSongs = [];
    const seenIds = new Set();
    songs.forEach(s => {
        const id = s.id || s.spotifyId;
        if (id && !seenIds.has(id)) {
            seenIds.add(id);
            finalSongs.push(s);
        }
    });

    console.log(`[Explore Audit] Section: "${key}" | SOURCE: Spotify API | Final tracks: ${finalSongs.length}`);
    exploreCache.set(cacheKey, finalSongs);
    return finalSongs;
};

/**
 * Fetch a single Spotify cover image for a given query.
 * Used to resolve artwork for Explore cards (Trending, Picks) on mount.
 */
export const resolveSpotifyCover = async (query) => {
    const cacheKey = `cover:${query}`;
    if (exploreCache.has(cacheKey)) {
        return exploreCache.get(cacheKey);
    }

    try {
        const results = await musicService.searchSongs(query, { limit: 1 });
        if (results && results.length > 0 && results[0].cover) {
            const cover = results[0].cover;
            console.log(`[Explore Audit] Cover resolved for "${query}": ${cover.slice(0, 60)}... SOURCE: Spotify API`);
            exploreCache.set(cacheKey, cover);
            return cover;
        }
    } catch (err) {
        console.warn(`[Explore Audit] Cover fetch failed for "${query}": ${err.message}`);
    }

    exploreCache.set(cacheKey, null);
    return null;
};
