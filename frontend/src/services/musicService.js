import { allSongs } from '../data';

// With the Vite dev proxy configured, /api requests are forwarded to localhost:5000
// automatically — no need for a hardcoded base URL during development.
// For production builds, set VITE_API_URL to your deployed backend URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
let hasLoggedSampleSong = false;

// ─── Normalizers ──────────────────────────────────────────────────────────────

const text = (...values) => values
    .map(value => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '')
    .find(Boolean) || '';

const artistNames = (artists = []) => Array.isArray(artists)
    ? artists.map(artist => artist?.name || artist).filter(Boolean).join(', ')
    : '';

const normalizeArtist = (artist = {}) => ({
    id: artist.id || '',
    name: artist.name || 'Various Artists',
    genres: artist.genres || [],
    popularity: Number(artist.popularity || 0),
    image: artist.image || artist.images?.[0]?.url || '',
    spotifyUrl: artist.spotifyUrl || artist.external_urls?.spotify || '',
});

export const normalizeSong = (song = {}) => {
    const artists = Array.isArray(song.artists) ? song.artists.map(normalizeArtist) : [];
    const artist = text(song.artist, song.singer, artistNames(artists), 'Various Artists');
    const genres = song.genres || artists.flatMap(item => item.genres || []);
    const spotifyId = text(song.spotifyId, song.id, song.title);

    const normalized = {
        id: spotifyId,
        spotifyId,
        source: song.source || 'spotify',
        title: text(song.title, song.name, 'Untitled Song'),
        singer: artist,
        artist,
        artists,
        album: text(song.album, 'Single'),
        cover: text(song.cover, song.image, '/Covers/dhun.jpg'),
        image: text(song.image, song.cover, '/Covers/dhun.jpg'),
        src: text(song.previewUrl, song.src),
        previewUrl: text(song.previewUrl, song.src),
        duration: Number(song.duration || 0),
        popularity: Number(song.popularity || 0),
        genre: text(song.genre, genres[0], 'Indian Music'),
        genres,
        spotifyUrl: song.spotifyUrl || '',
        uri: song.uri || '',
        lyrics: song.lyrics || null,
        raw: song.raw || song,
    };

    if (!hasLoggedSampleSong && normalized.id) {
        hasLoggedSampleSong = true;
        console.log('[SurTaal] Sample track after normalization:', {
            title: normalized.title,
            artist: normalized.singer,
            album: normalized.album,
            cover: normalized.cover,
            previewUrl: normalized.previewUrl || 'null — will resolve on play',
            spotifyId: normalized.spotifyId,
        });
    }

    return normalized;
};

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const request = async (path) => {
    const fullUrl = `${API_BASE_URL}${path}`;
    console.log(`[SurTaal HTTP] GET ${fullUrl}`);

    let response;
    try {
        response = await fetch(fullUrl);
    } catch (networkErr) {
        console.error(`[SurTaal HTTP] Network error — is the backend running at ${API_BASE_URL}?`, networkErr.message);
        throw new Error(`Cannot reach backend at ${API_BASE_URL}. Is the server running?`);
    }

    console.log(`[SurTaal HTTP] Response status: ${response.status}`);

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        console.error(`[SurTaal HTTP] Error body:`, body);
        throw new Error(body.message || `Request failed: ${response.status}`);
    }

    const data = await response.json();

    // Guard: ensure we always return an array for search endpoints
    if (path.includes('/search') && !Array.isArray(data)) {
        console.error(`[SurTaal HTTP] Search endpoint returned non-array:`, data);
        return [];
    }

    return data;
};

const safeLimit = (value, fallback = 12, max = 50) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(1, Math.min(max, Math.floor(number)));
};

// ─── Client-side score for re-ranking ────────────────────────────────────────

const score = (song, query) => {
    const q      = query.toLowerCase();
    const title  = song.title.toLowerCase();
    const artist = song.artist.toLowerCase();
    if (title === q)                           return 1000 + song.popularity;
    if (title.startsWith(q))                   return 800  + song.popularity;
    if (artist === q || artist.startsWith(q))  return 650  + song.popularity;
    if (title.includes(q))                     return 500  + song.popularity;
    return song.popularity;
};

// ─── musicService ─────────────────────────────────────────────────────────────

export const musicService = {

    /**
     * Search Spotify catalog.
     *
     * Key fixes vs original:
     * - strict = false  → no word-by-word filter that was silently dropping results
     * - Array.isArray guard → prevents crash when backend returns {} on 403
     * - Detailed logs at every step
     */
    async searchSongs(query, { limit = 12 } = {}) {
        const q = query?.trim();

        console.log('Search Query:', q);

        if (!q || q.length < 2) {
            console.log('[SurTaal Search] Query too short, skipping');
            return [];
        }

        const size = safeLimit(limit, 12);

        // 1. Search client-side mock songs (from allSongs)
        const queryLower = q.toLowerCase();
        const localMatches = (allSongs || []).filter(song => {
            const title = (song.title || '').toLowerCase();
            const singer = (song.singer || song.artist || '').toLowerCase();
            const albumName = (song.album || '').toLowerCase();
            return title.includes(queryLower) || singer.includes(queryLower) || albumName.includes(queryLower);
        }).map(song => {
            const normalized = normalizeSong(song);
            normalized.source = 'local';
            return normalized;
        });

        // 2. Search backend local MongoDB database
        let dbMatches = [];
        try {
            console.log(`[SurTaal Search] Fetching local database songs from: ${API_BASE_URL}/api/music/search?query=${encodeURIComponent(q)}&limit=${size}`);
            const payload = await request(`/api/music/search?query=${encodeURIComponent(q)}&limit=${size}`);
            if (Array.isArray(payload)) {
                dbMatches = payload.map(normalizeSong).map(s => {
                    s.source = 'local';
                    return s;
                });
            }
        } catch (dbErr) {
            console.error('[SurTaal Search] Backend search failed:', dbErr.message);
        }

        // 3. Combine and Deduplicate (by clean title + singer)
        const combined = [...localMatches, ...dbMatches];
        const seen = new Set();
        const uniqueResults = [];

        for (const song of combined) {
            const key = `${song.title.toLowerCase()}||${song.singer.toLowerCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(song);
            }
        }

        // 4. Sort by score & slice to size
        const results = uniqueResults
            .filter(song => song.id)
            .sort((a, b) => score(b, q) - score(a, q))
            .slice(0, size);

        console.log('Tracks Found:', results.length);
        return results;
    },

    /**
     * Get a single track by Spotify ID.
     */
    async getSongDetails(songId) {
        if (!songId) throw new Error('Spotify track ID is required');
        console.log(`[SurTaal] getSongDetails: ${songId}`);
        return normalizeSong(await request(`/api/music/tracks/${encodeURIComponent(songId)}`));
    },

    /**
     * Resolve a playable preview URL.
     *  1. Return existing previewUrl if present.
     *  2. Call /api/music/tracks/:id/preview (embed resolver) if null.
     */
    async resolvePreviewUrl(song) {
        const normalized = normalizeSong(song);
        const trackId    = normalized.spotifyId || normalized.id;

        console.log(`[SurTaal Playback] Track: "${normalized.title}"`);
        console.log(`[SurTaal Playback] Preview URL (cached): ${normalized.previewUrl || 'null'}`);
        console.log(`[SurTaal Playback] Spotify Token: Present (client_credentials on backend)`);
        console.log(`[SurTaal Playback] Playback Method: preview_url / embed_resolver`);

        if (normalized.previewUrl) return normalized.previewUrl;

        if (!trackId) {
            console.warn('[SurTaal Playback] No track ID — cannot resolve preview');
            return null;
        }

        try {
            console.log(`[SurTaal Playback] Calling embed resolver for: ${trackId}`);
            const data = await request(`/api/music/tracks/${encodeURIComponent(trackId)}/preview`);
            console.log(`[SurTaal Playback] Resolver result:`, data.previewUrl ? data.previewUrl.slice(0, 60) + '...' : 'null');
            return data.previewUrl || null;
        } catch (err) {
            console.warn(`[SurTaal Playback] Preview resolver failed: ${err.message}`);
            return null;
        }
    },

    /**
     * Get a fully playable song (with resolved previewUrl/src).
     */
    async getPlayableSong(song) {
        const normalized = normalizeSong(song);

        if (normalized.previewUrl) {
            console.log(`[SurTaal Playback] "${normalized.title}" has preview_url — playing directly`);
            return normalized;
        }

        const previewUrl = await this.resolvePreviewUrl(normalized);
        if (previewUrl) return { ...normalized, src: previewUrl, previewUrl };

        console.warn(`[SurTaal Playback] "${normalized.title}" — no preview available`);
        return normalized;
    },

    /**
     * Get recommendation sections.
     */
    async getRecommendations(profile = {}) {
        const params = new URLSearchParams();
        ['topArtist', 'favoriteGenre', 'mostPlayed'].forEach(key => {
            if (profile[key]) params.set(key, profile[key]);
        });
        const payload = await request(`/api/music/recommendations?${params.toString()}`);
        return {
            relatedArtists: (payload.relatedArtists || []).map(normalizeArtist),
            sections: (payload.sections || []).map(section => ({
                ...section,
                songs: (section.songs || []).map(normalizeSong),
            })),
        };
    },

    async getArtistTopTracks(artistId) {
        if (!artistId) return [];
        const payload = await request(`/api/music/artists/${artistId}/top-tracks`);
        return Array.isArray(payload) ? payload.map(normalizeSong) : [];
    },

    async getArtistAlbums(artistId) {
        if (!artistId) return [];
        return await request(`/api/music/artists/${artistId}/albums`);
    },

    async getRelatedArtists(artistId) {
        if (!artistId) return [];
        const payload = await request(`/api/music/artists/${artistId}/related-artists`);
        return Array.isArray(payload) ? payload.map(normalizeArtist) : [];
    },

    async getArtistByName(name) {
        const query = name?.trim();
        if (!query) return null;
        const payload = await request(`/api/music/artists?query=${encodeURIComponent(query)}&limit=1`);
        return Array.isArray(payload) && payload.length > 0 ? payload[0] : null;
    },
};
