const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const MARKET = process.env.SPOTIFY_MARKET || 'IN';

let cachedToken = null;
let tokenExpiresAt = 0;
const responseCache = new Map();
const artistCache = new Map();
const previewCache = new Map();
const CACHE_TTL = 1000 * 60 * 20;
const ARTIST_CACHE_TTL = 1000 * 60 * 60;
const PREVIEW_CACHE_TTL = 1000 * 60 * 30;
const LOG_BODY_LIMIT = Number(process.env.SPOTIFY_LOG_BODY_LIMIT || 1600);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const safeLimit = (value, fallback = 10, max = 50) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(1, Math.min(max, Math.floor(number)));
};

const cacheKey = (path, params = {}) => {
    const sorted = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    return `${path}?${sorted}`;
};

const getCached = (cache, key) => {
    const item = cache.get(key);
    if (!item || item.expiresAt < Date.now()) {
        cache.delete(key);
        return null;
    }
    return item.value;
};

const setCached = (cache, key, value, ttl = CACHE_TTL) => {
    cache.set(key, { value, expiresAt: Date.now() + ttl });
    return value;
};

const compactBody = (body) => {
    const value = typeof body === 'string' ? body : JSON.stringify(body);
    return value.length > LOG_BODY_LIMIT ? `${value.slice(0, LOG_BODY_LIMIT)}... [truncated]` : value;
};

const logSpotifyRequest = ({ method = 'GET', endpoint, status, body, cached = false }) => {
    console.log(`[Spotify API] ${method} ${endpoint} -> ${status}${cached ? ' (cache)' : ''}`);
    if (body !== undefined) console.log(`[Spotify API body] ${compactBody(body)}`);
};

// ─── Auth: Client Credentials ────────────────────────────────────────────────

const requireCredentials = () => {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        const error = new Error('Spotify credentials are missing. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to backend/.env.');
        error.status = 500;
        throw error;
    }
};

const getAccessToken = async () => {
    requireCredentials();
    if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
        console.log('[Spotify Token] Using cached token');
        return cachedToken;
    }

    console.log('[Spotify Token] Requesting new client_credentials token...');
    const credentials = Buffer
        .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
        .toString('base64');

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const rawBody = await response.text();
    logSpotifyRequest({
        method: 'POST',
        endpoint: '/api/token grant_type=client_credentials',
        status: response.status,
        body: rawBody,
    });

    if (!response.ok) {
        const error = new Error(`Spotify auth failed: ${rawBody}`);
        error.status = response.status;
        throw error;
    }

    const data = JSON.parse(rawBody);
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (Number(data.expires_in || 3600) * 1000);
    console.log(`[Spotify Token] New token acquired, expires in ${data.expires_in}s`);
    return cachedToken;
};

// ─── Spotify API fetch ────────────────────────────────────────────────────────
//
// CRITICAL FIX: url.searchParams.set() encodes commas as %2C, which breaks
// Spotify's include_groups parameter (expects raw commas: "album,single").
//
// Fix: Build the query string manually, encoding values properly but preserving
// raw commas in string values. Numeric values are kept as numbers for proper
// encoding.
//
const spotifyFetch = async (path, params = {}) => {
    const cleanParams = Object.fromEntries(
        Object.entries(params)
            .filter(([, value]) =>
                value !== undefined &&
                value !== null &&
                value !== '' &&
                !(typeof value === 'number' && !Number.isFinite(value))
            )
    );

    const key = cacheKey(path, cleanParams);
    const cached = getCached(responseCache, key);
    if (cached) {
        logSpotifyRequest({ endpoint: key, status: 200, body: cached, cached: true });
        return cached;
    }

    const token = await getAccessToken();

    // Build query string - use URLSearchParams for proper encoding, then fix comma issue
    const url = new URL(`${SPOTIFY_API_URL}${path}`);
    Object.entries(cleanParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    
    // Fix: URLSearchParams encodes commas as %2C, but Spotify's include_groups needs raw commas
    let finalUrl = url.toString().replace(/%2C/g, ',');

    if (path === '/search') {
        console.log("Spotify Search URL:", finalUrl);
    }

    console.log(`[Spotify API] FETCH URL: ${finalUrl}`);
    console.log(`[Spotify API] Request details:`, {
        url: finalUrl,
        params: cleanParams,
        paramTypes: Object.fromEntries(Object.entries(cleanParams).map(([k, v]) => [k, typeof v]))
    });
    
    const queryString = finalUrl.includes('?') ? finalUrl.substring(finalUrl.indexOf('?')) : '';

    const response = await fetch(finalUrl, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const rawBody = await response.text();
    logSpotifyRequest({ endpoint: `${path}${queryString}`, status: response.status, body: rawBody });

    if (!response.ok) {
        const retryAfter = response.headers.get('retry-after');
        let message = rawBody;
        try {
            message = JSON.parse(rawBody)?.error?.message || rawBody;
        } catch {}
        const error = new Error(message);
        error.status = response.status;
        error.retryAfter = retryAfter ? Number(retryAfter) : null;
        throw error;
    }

    const data = rawBody ? JSON.parse(rawBody) : {};
    return setCached(responseCache, key, data);
};

// ─── Preview URL resolver via Spotify embed ───────────────────────────────────

const resolvePreviewUrl = async (trackId) => {
    if (!trackId) return null;

    const cached = getCached(previewCache, trackId);
    if (cached !== null) return cached;

    try {
        console.log(`[Preview Resolver] Fetching embed page for track: ${trackId}`);
        const res = await fetch(`https://open.spotify.com/embed/track/${trackId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html',
            },
        });

        if (!res.ok) {
            console.warn(`[Preview Resolver] Embed fetch failed: ${res.status}`);
            setCached(previewCache, trackId, null, PREVIEW_CACHE_TTL);
            return null;
        }

        const html = await res.text();

        const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (!match) {
            console.warn(`[Preview Resolver] __NEXT_DATA__ not found for track: ${trackId}`);
            setCached(previewCache, trackId, null, PREVIEW_CACHE_TTL);
            return null;
        }

        const pageData = JSON.parse(match[1]);
        const previewUrl =
            pageData?.props?.pageProps?.state?.data?.entity?.audioPreview?.url ||
            null;

        console.log(`[Preview Resolver] Track: ${trackId} | Preview URL: ${previewUrl ? previewUrl.slice(0, 60) + '...' : 'null'}`);
        setCached(previewCache, trackId, previewUrl, PREVIEW_CACHE_TTL);
        return previewUrl;
    } catch (err) {
        console.warn(`[Preview Resolver] Error for ${trackId}: ${err.message}`);
        setCached(previewCache, trackId, null, PREVIEW_CACHE_TTL);
        return null;
    }
};

// ─── Track normalizer ─────────────────────────────────────────────────────────

const bestImage = (images = []) => {
    if (!Array.isArray(images) || images.length === 0) return '';
    return [...images].sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || images[0]?.url || '';
};

const normalizeArtist = (artist = {}) => ({
    id: artist.id || '',
    name: artist.name || 'Various Artists',
    genres: artist.genres || [],
    popularity: artist.popularity || 0,
    image: bestImage(artist.images),
    spotifyUrl: artist.external_urls?.spotify || '',
});

const normalizeTrack = (track = {}, artistDetails = []) => {
    const artists = Array.isArray(track.artists) ? track.artists : [];
    const enrichedArtists = artists.map(artist => {
        const details = artistDetails.find(item => item.id === artist.id);
        return details ? normalizeArtist(details) : normalizeArtist(artist);
    });
    const genres = [...new Set(enrichedArtists.flatMap(artist => artist.genres || []))];
    const image = bestImage(track.album?.images);

    const previewUrl = track.preview_url || '';

    console.log(`[Track Normalize] "${track.name}" | preview_url: ${previewUrl || 'null'} | id: ${track.id}`);

    return {
        id: track.id || '',
        spotifyId: track.id || '',
        source: 'spotify',
        title: track.name || 'Untitled Song',
        singer: enrichedArtists.map(artist => artist.name).filter(Boolean).join(', ') || 'Various Artists',
        artist: enrichedArtists.map(artist => artist.name).filter(Boolean).join(', ') || 'Various Artists',
        artists: enrichedArtists,
        album: track.album?.name || 'Single',
        cover: image || '/Covers/dhun.jpg',
        image: image || '/Covers/dhun.jpg',
        src: previewUrl,
        previewUrl,
        duration: Math.round((track.duration_ms || 0) / 1000),
        popularity: track.popularity || 0,
        genre: genres[0] || 'Indian Music',
        genres,
        spotifyUrl: track.external_urls?.spotify || '',
        uri: track.uri || '',
        raw: track,
    };
};

const enrichTracks = async (tracks = []) => {
    const artistDetails = [];
    return tracks.map(track => normalizeTrack(track, artistDetails));
};

// ─── Memoize helper ───────────────────────────────────────────────────────────

const memoized = async (key, factory, ttl = CACHE_TTL) => {
    const cached = getCached(responseCache, key);
    if (cached) return cached;
    return setCached(responseCache, key, await factory(), ttl);
};

// ─── Public API ───────────────────────────────────────────────────────────────

const searchTracks = async (query, limit = 10) => {
    const normalizedQuery = query.trim();
    const safeLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      50
    );
    console.log("Limit:", safeLimit);
    const key = `searchTracks:${MARKET}:${normalizedQuery}:${safeLimit}`;
    console.log(`[Spotify Search] query="${normalizedQuery}" limit=${safeLimit} (type: ${typeof safeLimit}) market=${MARKET}`);
    return memoized(key, async () => {
        const params = {
            q: normalizedQuery,
            type: 'track',
            market: MARKET,
            limit: safeLimit,
        };
        console.log(`[Spotify Search] Request params:`, JSON.stringify(params, null, 2));
        const data = await spotifyFetch('/search', params);
        const tracks = await enrichTracks(data.tracks?.items || []);
        console.log(`[Spotify Search] Returned ${tracks.length} tracks. Preview URLs present: ${tracks.filter(t => t.previewUrl).length}/${tracks.length}`);
        return tracks;
    });
};

const getTrack = async (id) => {
    return memoized(`track:${MARKET}:${id}`, async () => {
        console.log(`[Spotify getTrack] id=${id}`);
        const track = await spotifyFetch(`/tracks/${id}`, { market: MARKET });
        const [normalized] = await enrichTracks([track]);
        console.log(`[Spotify getTrack] "${normalized.title}" | preview_url: ${normalized.previewUrl || 'null'}`);
        return normalized;
    }, ARTIST_CACHE_TTL);
};

const getPreviewUrl = async (trackId) => {
    if (!trackId) return null;

    const trackCacheKey = `track:${MARKET}:${trackId}`;
    const cachedTrack = getCached(responseCache, trackCacheKey);
    if (cachedTrack?.previewUrl) {
        console.log(`[Playback] Track "${cachedTrack.title}" | Method: cached preview_url`);
        return cachedTrack.previewUrl;
    }

    try {
        const track = await spotifyFetch(`/tracks/${trackId}`, { market: MARKET });
        if (track.preview_url) {
            console.log(`[Playback] Track "${track.name}" | Method: direct preview_url | URL: ${track.preview_url.slice(0, 60)}...`);
            return track.preview_url;
        }
        console.log(`[Playback] Track "${track.name}" | preview_url is null from API, trying embed resolver...`);
    } catch (err) {
        console.warn(`[Playback] getTrack for ${trackId} failed: ${err.message}`);
    }

    const embedPreview = await resolvePreviewUrl(trackId);
    if (embedPreview) {
        console.log(`[Playback] Track ${trackId} | Method: embed_resolver | URL: ${embedPreview.slice(0, 60)}...`);
    } else {
        console.warn(`[Playback] Track ${trackId} | No preview available from any source`);
    }
    return embedPreview;
};

const searchArtists = async (query, limit = 10) => {
    const normalizedQuery = query.trim();
    const safeLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      50
    );
    console.log("Limit:", safeLimit);
    return memoized(`searchArtists:${MARKET}:${normalizedQuery}:${safeLimit}`, async () => {
        const data = await spotifyFetch('/search', {
            q: normalizedQuery,
            type: 'artist',
            market: MARKET,
            limit: safeLimit,
        });
        return (data.artists?.items || []).map(normalizeArtist);
    });
};

const sectionSeeds = [
    { key: 'trendingIndia',     title: 'Trending in India',    query: 'trending India Hindi Bollywood 2024 2025' },
    { key: 'punjabiHits',       title: 'Punjabi Hits',         query: 'Punjabi hits latest' },
    { key: 'bollywoodRomance',  title: 'Bollywood Romance',    query: 'Bollywood romantic Hindi love songs' },
    { key: 'desiHipHop',        title: 'Desi Hip Hop',         query: 'Desi Hip Hop Punjabi rap India' },
    { key: 'lateNightDrive',    title: 'Late Night Drive',     query: 'late night drive Hindi chill lofi' },
    { key: 'haryanvi',          title: 'Haryanvi Bangers',     query: 'Haryanvi songs hits' },
];

const getRecommendations = async ({ topArtist = '', favoriteGenre = '', mostPlayed = '' } = {}) => {
    const artist = topArtist || 'Arijit Singh';

    const madeForYouQuery = topArtist && favoriteGenre
        ? `${topArtist} ${favoriteGenre} Hindi`
        : topArtist
            ? `${topArtist} Hindi Bollywood`
            : favoriteGenre
                ? `${favoriteGenre} India Hindi`
                : 'Bollywood Hindi romantic hits';

    const cacheId = `recommendations:${MARKET}:${artist}:${favoriteGenre}:${mostPlayed}`;
    return memoized(cacheId, async () => {
        const personalSections = topArtist ? [
            { key: 'because',     title: `Because You Like ${artist}`,  query: `${artist} similar Hindi` },
            { key: 'madeForYou',  title: 'Made For You',                query: madeForYouQuery },
        ] : [
            { key: 'madeForYou',  title: 'Made For You',                query: 'Bollywood Hindi hits popular' },
        ];

        const sections = [
            ...personalSections,
            ...sectionSeeds,
        ];

        const resolved = [];
        for (const section of sections) {
            try {
                resolved.push({ ...section, songs: await searchTracks(section.query, 10) });
            } catch (error) {
                if ([403, 429].includes(error.status)) {
                    console.warn(`Spotify skipped section "${section.title}" (${error.status}).`);
                    resolved.push({ ...section, songs: [] });
                } else {
                    throw error;
                }
            }
        }

        let relatedArtists = [];
        try {
            const artistQuery = topArtist
                ? `${artist} Bollywood Punjabi Hindi`
                : 'Arijit Singh Bollywood Hindi artists';
            relatedArtists = await searchArtists(artistQuery, 8);
        } catch (error) {
            if (![403, 429].includes(error.status)) throw error;
        }

        return { sections: resolved, relatedArtists };
    }, 1000 * 60 * 30);
};

const getArtistTopTracks = async (artistId) => {
    const key = `artistTopTracks:${MARKET}:${artistId}`;
    return memoized(key, async () => {
        console.log(`[Spotify getArtistTopTracks] artistId=${artistId}`);
        const data = await spotifyFetch(`/artists/${artistId}/top-tracks`, { market: MARKET });
        return enrichTracks(data.tracks || []);
    }, ARTIST_CACHE_TTL);
};

const getArtistAlbums = async (artistId) => {
    const key = `artistAlbums:${MARKET}:${artistId}`;
    return memoized(key, async () => {
        console.log(`[Spotify getArtistAlbums] artistId=${artistId}`);
        const data = await spotifyFetch(`/artists/${artistId}/albums`, {
            market: MARKET,
            include_groups: 'album,single',
            limit: 20
        });
        return (data.items || []).map(album => ({
            id: album.id,
            name: album.name,
            cover: bestImage(album.images),
            releaseDate: album.release_date,
            totalTracks: album.total_tracks,
            type: album.album_type,
        }));
    }, ARTIST_CACHE_TTL);
};

const getRelatedArtists = async (artistId) => {
    const key = `artistRelatedArtists:${MARKET}:${artistId}`;
    return memoized(key, async () => {
        console.log(`[Spotify getRelatedArtists] artistId=${artistId}`);
        const data = await spotifyFetch(`/artists/${artistId}/related-artists`);
        return (data.artists || []).slice(0, 8).map(normalizeArtist);
    }, ARTIST_CACHE_TTL);
};

module.exports = {
    searchTracks,
    getTrack,
    getPreviewUrl,
    searchArtists,
    getRecommendations,
    getArtistTopTracks,
    getArtistAlbums,
    getRelatedArtists,
};
