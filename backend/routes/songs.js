const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

const songKey = (song) => song?.spotifyId || song?.id || song?.src || song?.title;

const normalizeSong = (song = {}) => ({
    id: song.id || song.spotifyId || song.src || song.title,
    spotifyId: song.spotifyId || (song.source === 'spotify' ? song.id : undefined),
    source: song.source || 'spotify',
    title: song.title || song.name || 'Unknown Song',
    singer: song.singer || song.artist || 'Various Artists',
    artist: song.artist || song.singer || 'Various Artists',
    artists: song.artists || [],
    album: song.album || 'Single',
    cover: song.cover || song.image || '',
    image: song.image || song.cover || '',
    src: song.src || song.previewUrl || song.media_url || '',
    previewUrl: song.previewUrl || song.src || '',
    duration: Number(song.duration || 0),
    popularity: Number(song.popularity || 0),
    genre: song.genre || 'Indian Music',
    genres: song.genres || (song.genre ? [song.genre] : []),
    spotifyUrl: song.spotifyUrl || '',
    uri: song.uri || '',
    playedAt: song.playedAt ? new Date(song.playedAt) : new Date(),
    playCount: Number(song.playCount || 1),
    lyrics: song.lyrics || undefined,
    raw: song.raw || undefined
});

const incrementCounter = (items = [], name) => {
    if (!name) return items;
    const index = items.findIndex(item => item.name === name);
    if (index > -1) {
        items[index].count = (items[index].count || 0) + 1;
        return items;
    }
    return [...items, { name, count: 1 }];
};

/**
 * Split a comma-separated artist string into individual names.
 * "Pritam, KK, Sayeed Quadri" → ["Pritam", "KK", "Sayeed Quadri"]
 * Skips generic placeholders like "Various Artists".
 */
const splitArtists = (artistStr = '') => {
    if (!artistStr || artistStr === 'Various Artists') return [];
    return artistStr
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0 && a !== 'Various Artists');
};

const getUser = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return null;
    }
    return user;
};

router.get('/liked', auth, async (req, res) => {
    try {
        const user = await getUser(req, res);
        if (!user) return;
        res.json(user.likedSongs || []);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.post('/like', auth, async (req, res) => {
    try {
        const { song } = req.body;
        if (!song) return res.status(400).json({ message: 'Song data is required' });

        const user = await getUser(req, res);
        if (!user) return;

        const normalized = normalizeSong(song);
        const key = songKey(normalized);
        const index = user.likedSongs.findIndex(item => songKey(item) === key);

        if (index > -1) {
            user.likedSongs.splice(index, 1);
            await user.save();
            return res.json({ action: 'removed', likedSongs: user.likedSongs });
        }

        user.likedSongs.unshift(normalized);
        await user.save();
        res.json({ action: 'added', likedSongs: user.likedSongs });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.get('/playlists', auth, async (req, res) => {
    try {
        console.log('[Backend] GET /playlists - User ID:', req.user.id);
        const user = await getUser(req, res);
        if (!user) return;
        console.log('[Backend] Returning playlists:', user.playlists.length, 'playlists');
        res.json(user.playlists || []);
    } catch (err) {
        console.error('[Backend] Error fetching playlists:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.post('/playlists', auth, async (req, res) => {
    try {
        const { name, description = '', cover = '', songs = [] } = req.body;
        console.log('[Backend] POST /playlists - User ID:', req.user.id, 'Name:', name);
        if (!name?.trim()) return res.status(400).json({ message: 'Playlist name is required' });

        const user = await getUser(req, res);
        if (!user) return;

        user.playlists.unshift({
            name: name.trim(),
            description,
            cover,
            songs: songs.map(normalizeSong)
        });
        await user.save();
        console.log('[Backend] Playlist created with _id:', user.playlists[0]._id);
        res.status(201).json(user.playlists[0]);
    } catch (err) {
        console.error('[Backend] Error creating playlist:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.patch('/playlists/:playlistId', auth, async (req, res) => {
    try {
        const user = await getUser(req, res);
        if (!user) return;

        const playlist = user.playlists.id(req.params.playlistId);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        ['name', 'description', 'cover'].forEach(field => {
            if (req.body[field] !== undefined) playlist[field] = req.body[field];
        });
        await user.save();
        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.delete('/playlists/:playlistId', auth, async (req, res) => {
    try {
        const user = await getUser(req, res);
        if (!user) return;

        user.playlists.pull(req.params.playlistId);
        await user.save();
        res.json({ success: true, playlists: user.playlists });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.post('/playlists/:playlistId/songs', auth, async (req, res) => {
    try {
        const { song } = req.body;
        if (!song) return res.status(400).json({ message: 'Song data is required' });

        const user = await getUser(req, res);
        if (!user) return;

        const playlist = user.playlists.id(req.params.playlistId);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        const normalized = normalizeSong(song);
        if (!playlist.songs.some(item => songKey(item) === songKey(normalized))) {
            playlist.songs.push(normalized);
            if (!playlist.cover && normalized.cover) playlist.cover = normalized.cover;
            await user.save();
        }

        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.delete('/playlists/:playlistId/songs/:songId', auth, async (req, res) => {
    try {
        const user = await getUser(req, res);
        if (!user) return;

        const playlist = user.playlists.id(req.params.playlistId);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        playlist.songs = playlist.songs.filter(song => songKey(song) !== req.params.songId);
        await user.save();
        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.get('/history', auth, async (req, res) => {
    try {
        const user = await getUser(req, res);
        if (!user) return;
        res.json({
            recentlyPlayed: user.recentlyPlayed || [],
            listeningHistory: user.listeningHistory || []
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

// ── Computed per-user stats ───────────────────────────────────────────────────
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await getUser(req, res);
        if (!user) return;

        const history = user.listeningHistory || [];
        const now = new Date();
        const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek  = new Date(startOfDay); startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total listening time (seconds)
        const totalSeconds = history.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);

        // Today's listening time
        const todaySeconds = history
            .filter(s => s.playedAt && new Date(s.playedAt) >= startOfDay)
            .reduce((sum, s) => sum + (Number(s.duration) || 0), 0);

        // Songs this week / this month
        const thisWeek  = history.filter(s => s.playedAt && new Date(s.playedAt) >= startOfWeek).length;
        const thisMonth = history.filter(s => s.playedAt && new Date(s.playedAt) >= startOfMonth).length;

        // Most played song
        const songCounts = {};
        history.forEach(s => { if (s.title) songCounts[s.title] = (songCounts[s.title] || 0) + 1; });
        const mostPlayedSong = Object.entries(songCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        // Top artist and genre from pre-computed arrays
        const topArtist = user.favoriteArtists?.[0]?.name || null;
        const topGenre  = user.favoriteGenres?.[0]?.name  || null;

        // Build top-5 artists with cover images sourced from listening history
        // History entries store cover art per song — find the best image for each artist
        const artistImageMap = {};
        history.forEach(s => {
            const artistNames = splitArtists(s.artist || s.singer);
            const cover = s.cover || s.image || '';
            if (!cover) return;
            artistNames.forEach(name => {
                if (!artistImageMap[name]) artistImageMap[name] = cover;
            });
        });

        const favoriteArtistsWithImages = (user.favoriteArtists || [])
            .slice(0, 5)
            .map(a => ({
                name:  a.name,
                count: a.count,
                image: artistImageMap[a.name] || null,
            }));

        // Listening streak — count consecutive days with at least 1 play
        const playDays = new Set(
            history
                .filter(s => s.playedAt)
                .map(s => new Date(s.playedAt).toDateString())
        );
        let streak = 0;
        const check = new Date(startOfDay);
        while (playDays.has(check.toDateString())) {
            streak++;
            check.setDate(check.getDate() - 1);
        }

        res.json({
            totalSongsPlayed: history.length,
            totalListeningSeconds: totalSeconds,
            todayListeningSeconds: todaySeconds,
            songsThisWeek: thisWeek,
            songsThisMonth: thisMonth,
            mostPlayedSong,
            topArtist,
            topGenre,
            listeningStreakDays: streak,
            favoriteArtists: favoriteArtistsWithImages,
            favoriteGenres:  user.favoriteGenres?.slice(0, 5)  || [],
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

router.post('/history', auth, async (req, res) => {
    try {
        const { song } = req.body;
        if (!song) return res.status(400).json({ message: 'Song data is required' });

        const user = await getUser(req, res);
        if (!user) return;

        const normalized = normalizeSong(song);
        const key = songKey(normalized);
        user.recentlyPlayed = [normalized, ...(user.recentlyPlayed || []).filter(item => songKey(item) !== key)].slice(0, 30);
        user.listeningHistory = [normalized, ...(user.listeningHistory || [])].slice(0, 300);

        // Split comma-separated artist string into individual artists before counting
        // e.g. "Pritam, KK, Sayeed Quadri" → ["Pritam", "KK", "Sayeed Quadri"]
        const individualArtists = splitArtists(normalized.artist || normalized.singer);
        if (individualArtists.length === 0 && normalized.artist) {
            // fallback: use as-is if splitting gave nothing
            individualArtists.push(normalized.artist);
        }
        individualArtists.forEach(artistName => {
            user.favoriteArtists = incrementCounter(user.favoriteArtists || [], artistName);
        });
        user.favoriteArtists = (user.favoriteArtists || []).sort((a, b) => b.count - a.count).slice(0, 25);

        const genres = normalized.genres?.length ? normalized.genres : [normalized.genre];
        genres.filter(Boolean).forEach(genre => {
            user.favoriteGenres = incrementCounter(user.favoriteGenres || [], genre);
        });
        user.favoriteGenres = (user.favoriteGenres || []).sort((a, b) => b.count - a.count).slice(0, 25);
        await user.save();
        res.json({
            recentlyPlayed: user.recentlyPlayed,
            listeningHistory: user.listeningHistory,
            favoriteArtists: user.favoriteArtists,
            favoriteGenres: user.favoriteGenres
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

module.exports = router;
