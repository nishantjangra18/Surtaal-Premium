const express = require('express');
const router = express.Router();
const spotifyService = require('../services/spotifyService');
const Song = require('../models/Song');

const safeLimit = (value, fallback = 10, max = 50) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(1, Math.min(max, Math.floor(number)));
};

const handleError = (res, error, fallback = []) => {
    if (error.status === 429) {
        console.warn(`[Music Route] Spotify rate limit exceeded. Retry after: ${error.retryAfter || 'unknown'}s`);
        return res.status(429).json({
            message: 'Spotify rate limit exceeded. Please wait a moment and try again.',
            retryAfter: error.retryAfter || null,
        });
    }

    if (error.status === 403) {
        console.warn('[Music Route] Spotify returned 403 Forbidden. Returning empty result.');
        return res.status(200).json(fallback);
    }

    console.error(`[Music Route] Spotify request failed (${error.status || 500}): ${error.message}`);
    res.status(error.status || 500).json({ message: error.message || 'Spotify request failed' });
};

// ── Search songs ──────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query?.trim();
        if (!query || query.length < 2) return res.json([]);
        console.log(`[Music Route] Search: "${query}"`);

        // Search local DB Songs
        let normalizedLocal = [];
        try {
            const localSongs = await Song.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { artist: { $regex: query, $options: 'i' } },
                    { album: { $regex: query, $options: 'i' } }
                ]
            }).limit(6);

            normalizedLocal = localSongs.map(s => ({
                id: s._id.toString(),
                spotifyId: '',
                source: 'local',
                title: s.title,
                singer: s.artist,
                artist: s.artist,
                artists: [{ name: s.artist }],
                album: s.album,
                cover: s.cover || '/Covers/dhun.jpg',
                image: s.cover || '/Covers/dhun.jpg',
                src: s.src,
                previewUrl: s.src,
                duration: Number(s.duration || 0),
                popularity: 85,
                genre: s.genre,
                releaseDate: s.releaseDate,
                lyrics: s.lyrics
            }));
        } catch (localErr) {
            console.error('[Music Route] Local search failed:', localErr.message);
        }

        // Search Spotify Tracks
        let spotifySongs = [];
        try {
            const limit = parseInt(req.query.limit || "20", 10);
            spotifySongs = await spotifyService.searchTracks(query, limit);
        } catch (spotifyErr) {
            console.error('[Music Route] Spotify search failed:', spotifyErr.message);
        }

        res.json([...normalizedLocal, ...spotifySongs]);
    } catch (error) {
        handleError(res, error, []);
    }
});

// ── Get single track ──────────────────────────────────────────────────────────
router.get('/tracks/:id', async (req, res) => {
    try {
        console.log(`[Music Route] getTrack: ${req.params.id}`);
        const song = await spotifyService.getTrack(req.params.id);
        res.json(song);
    } catch (error) {
        handleError(res, error);
    }
});

// ── Resolve preview URL (handles null preview_url via embed fallback) ─────────
//
// This is the critical endpoint. The Spotify client_credentials API returns
// preview_url: null for many tracks. This endpoint resolves the actual audio
// URL via the Spotify embed page, which always has one if the track is playable.
//
router.get('/tracks/:id/preview', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Music Route] Resolving preview for track: ${id}`);

        const previewUrl = await spotifyService.getPreviewUrl(id);

        if (!previewUrl) {
            console.warn(`[Music Route] No preview available for track: ${id}`);
            return res.status(404).json({ previewUrl: null, message: 'Preview not available for this track.' });
        }

        console.log(`[Music Route] Preview resolved: ${previewUrl.slice(0, 60)}...`);
        res.json({ previewUrl });
    } catch (error) {
        handleError(res, error, { previewUrl: null });
    }
});

// ── Artists search ────────────────────────────────────────────────────────────
router.get('/artists', async (req, res) => {
    try {
        const query = req.query.query?.trim();
        if (!query || query.length < 2) return res.json([]);
        const limit = parseInt(req.query.limit || "20", 10);
        let artists = [];
        try {
            artists = await spotifyService.searchArtists(query, limit);
        } catch (spotifyErr) {
            console.error('[Music Route] Spotify artist search failed:', spotifyErr.message);
        }
        res.json(artists);
    } catch (error) {
        handleError(res, error, []);
    }
});

// ── Recommendations ───────────────────────────────────────────────────────────
router.get('/recommendations', async (req, res) => {
    try {
        const recommendations = await spotifyService.getRecommendations({
            topArtist: req.query.topArtist,
            favoriteGenre: req.query.favoriteGenre,
            mostPlayed: req.query.mostPlayed,
        });
        res.json(recommendations);
    } catch (error) {
        handleError(res, error, { sections: [], relatedArtists: [] });
    }
});

// ── Artist details ───────────────────────────────────────────────────────────
router.get('/artists/:id/top-tracks', async (req, res) => {
    try {
        const tracks = await spotifyService.getArtistTopTracks(req.params.id);
        res.json(tracks);
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/artists/:id/albums', async (req, res) => {
    try {
        const albums = await spotifyService.getArtistAlbums(req.params.id);
        res.json(albums);
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/artists/:id/related-artists', async (req, res) => {
    try {
        const artists = await spotifyService.getRelatedArtists(req.params.id);
        res.json(artists);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
