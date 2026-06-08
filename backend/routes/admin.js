const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const User = require('../models/User');
const Song = require('../models/Song');
const Album = require('../models/Album');
const Artist = require('../models/Artist');
const AdminPlaylist = require('../models/AdminPlaylist');
const UserRequest = require('../models/UserRequest');
const Waitlist = require('../models/Waitlist');

// ── Multer Storage Configuration ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'audio' || file.mimetype.startsWith('audio/')) {
            cb(null, path.join(__dirname, '../uploads/audio'));
        } else {
            cb(null, path.join(__dirname, '../uploads/images'));
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit for audio files
});

// ── Public Waitlist Endpoint (No auth needed) ─────────────────────────────────
router.post('/waitlist/signup', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const existing = await Waitlist.findOne({ email });
        if (existing) {
            return res.status(200).json({ message: 'Already registered on waitlist', data: existing });
        }

        const entry = new Waitlist({ email, name: name || 'Music Lover' });
        await entry.save();
        res.status(201).json({ message: 'Added to waitlist successfully', data: entry });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── User Requests Submit Endpoint (Auth required, but open to standard users) ─
router.post('/requests/submit', auth, async (req, res) => {
    try {
        const { type, title, details } = req.body;
        if (!type || !title) {
            return res.status(400).json({ message: 'Type and Title are required.' });
        }
        
        const request = new UserRequest({
            type,
            title,
            details: details || '',
            requestedBy: req.user.id,
            username: req.body.username || 'Anonymous'
        });

        await request.save();
        res.status(201).json({ message: 'Request submitted successfully', data: request });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS (PROTECTED)
// ─────────────────────────────────────────────────────────────────────────────

router.use(auth);
router.use(admin);

// ── Dashboard Overview Stats ─────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
    try {
        const totalSongs = await Song.countDocuments();
        const totalAlbums = await Album.countDocuments();
        const totalArtists = await Artist.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const waitlistCount = await Waitlist.countDocuments();

        // Calculate streams count (listeningHistory count)
        const allUsers = await User.find({}, 'listeningHistory');
        let streamsToday = 0;
        let activeUsers = 0;
        
        const todayStr = new Date().toDateString();
        allUsers.forEach(u => {
            let userStreamedToday = false;
            const history = u.listeningHistory || [];
            history.forEach(s => {
                if (s.playedAt && new Date(s.playedAt).toDateString() === todayStr) {
                    streamsToday += 1;
                    userStreamedToday = true;
                }
            });
            if (userStreamedToday || history.length > 0) {
                activeUsers += 1;
            }
        });

        const recentUploads = await Song.find().sort({ createdAt: -1 }).limit(5);

        // Mock chart stats to show gold analytics
        const dailyPlays = [
            { day: 'Mon', plays: 120 + totalSongs * 10 },
            { day: 'Tue', plays: 145 + totalSongs * 12 },
            { day: 'Wed', plays: 190 + totalSongs * 15 },
            { day: 'Thu', plays: 165 + totalSongs * 11 },
            { day: 'Fri', plays: 230 + totalSongs * 18 },
            { day: 'Sat', plays: 310 + totalSongs * 22 },
            { day: 'Sun', plays: 280 + totalSongs * 20 }
        ];

        // Fetch top songs based on playCount
        const dbTopSongs = await Song.find().sort({ playCount: -1 }).limit(3);
        const topSongs = dbTopSongs.map(s => ({ title: s.title, plays: s.playCount }));
        if (topSongs.length === 0) {
            topSongs.push({ title: 'No Songs Uploaded Yet', plays: 0 });
        }

        // Aggregate artists
        const topArtistsList = await Song.aggregate([
            { $group: { _id: "$artist", count: { $sum: "$playCount" } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);
        const topArtists = topArtistsList.map(a => ({ name: a._id, plays: a.count }));
        if (topArtists.length === 0) {
            topArtists.push({ name: 'No Artists Uploaded Yet', plays: 0 });
        }

        res.json({
            kpis: {
                totalSongs,
                totalAlbums,
                totalArtists,
                totalUsers,
                waitlistCount,
                streamsToday: streamsToday || 12,
                activeUsers: activeUsers || totalUsers || 3
            },
            recentUploads,
            charts: {
                dailyPlays,
                topArtists,
                topSongs
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Songs CRUD ────────────────────────────────────────────────────────────────
router.get('/songs', async (req, res) => {
    try {
        const songs = await Song.find().sort({ createdAt: -1 });
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/songs', upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, artist, album, genre, language, duration, releaseDate, lyrics } = req.body;
        
        let coverPath = req.body.coverUrl || '';
        let audioPath = req.body.audioUrl || '';

        if (req.files) {
            if (req.files['cover'] && req.files['cover'][0]) {
                coverPath = `/uploads/images/${req.files['cover'][0].filename}`;
            }
            if (req.files['audio'] && req.files['audio'][0]) {
                audioPath = `/uploads/audio/${req.files['audio'][0].filename}`;
            }
        }

        const newSong = new Song({
            title,
            artist,
            album: album || 'Single',
            genre: genre || 'Indian Music',
            language: language || 'Hindi',
            duration: Number(duration || 0),
            cover: coverPath,
            src: audioPath,
            releaseDate: releaseDate ? new Date(releaseDate) : undefined,
            lyrics: lyrics ? (typeof lyrics === 'string' ? JSON.parse(lyrics) : lyrics) : undefined
        });

        await newSong.save();
        
        // Also update or create Artist reference if matching local artist exists
        const matchedArtist = await Artist.findOne({ name: artist });
        if (matchedArtist) {
            matchedArtist.songs.push(newSong._id);
            await matchedArtist.save();
        }

        res.status(201).json(newSong);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/songs/:id', upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, artist, album, genre, language, duration, releaseDate, lyrics } = req.body;
        const song = await Song.findById(req.params.id);
        if (!song) return res.status(404).json({ message: 'Song not found' });

        song.title = title || song.title;
        song.artist = artist || song.artist;
        song.album = album || song.album;
        song.genre = genre || song.genre;
        song.language = language || song.language;
        song.duration = duration !== undefined ? Number(duration) : song.duration;
        if (releaseDate) song.releaseDate = new Date(releaseDate);
        if (lyrics !== undefined) {
            song.lyrics = typeof lyrics === 'string' ? JSON.parse(lyrics) : lyrics;
        }

        if (req.files) {
            if (req.files['cover'] && req.files['cover'][0]) {
                song.cover = `/uploads/images/${req.files['cover'][0].filename}`;
            }
            if (req.files['audio'] && req.files['audio'][0]) {
                song.src = `/uploads/audio/${req.files['audio'][0].filename}`;
            }
        }

        await song.save();
        res.json(song);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/songs/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) return res.status(404).json({ message: 'Song not found' });

        // Remove from filesystem if uploaded locally
        if (song.src && song.src.startsWith('/uploads/')) {
            const audioPath = path.join(__dirname, '..', song.src);
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        }
        if (song.cover && song.cover.startsWith('/uploads/')) {
            const coverPath = path.join(__dirname, '..', song.cover);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }

        await Song.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Song deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Albums CRUD ──────────────────────────────────────────────────────────────
router.get('/albums', async (req, res) => {
    try {
        const albums = await Album.find().populate('songs').sort({ createdAt: -1 });
        res.json(albums);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/albums', upload.single('cover'), async (req, res) => {
    try {
        const { name, artist, songs, releaseDate } = req.body;
        let coverPath = req.body.coverUrl || '';

        if (req.file) {
            coverPath = `/uploads/images/${req.file.filename}`;
        }

        // Parse list of songs ids
        let songIds = [];
        if (songs) {
            songIds = typeof songs === 'string' ? JSON.parse(songs) : songs;
        }

        const newAlbum = new Album({
            name,
            artist: artist || 'Various Artists',
            cover: coverPath,
            songs: songIds,
            releaseDate: releaseDate ? new Date(releaseDate) : undefined
        });

        await newAlbum.save();
        res.status(201).json(newAlbum);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/albums/:id', upload.single('cover'), async (req, res) => {
    try {
        const { name, artist, songs, releaseDate } = req.body;
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ message: 'Album not found' });

        album.name = name || album.name;
        album.artist = artist || album.artist;
        if (releaseDate) album.releaseDate = new Date(releaseDate);

        if (req.file) {
            album.cover = `/uploads/images/${req.file.filename}`;
        }

        if (songs) {
            album.songs = typeof songs === 'string' ? JSON.parse(songs) : songs;
        }

        await album.save();
        res.json(album);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/albums/:id', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ message: 'Album not found' });

        if (album.cover && album.cover.startsWith('/uploads/')) {
            const coverPath = path.join(__dirname, '..', album.cover);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }

        await Album.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Album deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Artists CRUD ─────────────────────────────────────────────────────────────
router.get('/artists', async (req, res) => {
    try {
        const artists = await Artist.find().populate('songs').sort({ createdAt: -1 });
        res.json(artists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/artists', upload.single('image'), async (req, res) => {
    try {
        const { name, bio, instagram, twitter, spotify, songs } = req.body;
        let imagePath = req.body.imageUrl || '';

        if (req.file) {
            imagePath = `/uploads/images/${req.file.filename}`;
        }

        let songIds = [];
        if (songs) {
            songIds = typeof songs === 'string' ? JSON.parse(songs) : songs;
        }

        const newArtist = new Artist({
            name,
            bio: bio || '',
            image: imagePath,
            socials: {
                instagram: instagram || '',
                twitter: twitter || '',
                spotify: spotify || ''
            },
            songs: songIds
        });

        await newArtist.save();
        res.status(201).json(newArtist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/artists/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, bio, instagram, twitter, spotify, songs } = req.body;
        const artist = await Artist.findById(req.params.id);
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        artist.name = name || artist.name;
        artist.bio = bio !== undefined ? bio : artist.bio;
        artist.socials = {
            instagram: instagram !== undefined ? instagram : artist.socials.instagram,
            twitter: twitter !== undefined ? twitter : artist.socials.twitter,
            spotify: spotify !== undefined ? spotify : artist.socials.spotify
        };

        if (req.file) {
            artist.image = `/uploads/images/${req.file.filename}`;
        }

        if (songs) {
            artist.songs = typeof songs === 'string' ? JSON.parse(songs) : songs;
        }

        await artist.save();
        res.json(artist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/artists/:id', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) return res.status(404).json({ message: 'Artist not found' });

        if (artist.image && artist.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', artist.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await Artist.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Artist deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Playlists CRUD ────────────────────────────────────────────────────────────
router.get('/playlists', async (req, res) => {
    try {
        const playlists = await AdminPlaylist.find().populate('songs').sort({ createdAt: -1 });
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/playlists', upload.single('cover'), async (req, res) => {
    try {
        const { name, description, songs, isFeatured } = req.body;
        let coverPath = req.body.coverUrl || '';

        if (req.file) {
            coverPath = `/uploads/images/${req.file.filename}`;
        }

        let songIds = [];
        if (songs) {
            songIds = typeof songs === 'string' ? JSON.parse(songs) : songs;
        }

        const newPlaylist = new AdminPlaylist({
            name,
            description: description || '',
            cover: coverPath,
            songs: songIds,
            isFeatured: isFeatured === 'true' || isFeatured === true
        });

        await newPlaylist.save();
        res.status(201).json(newPlaylist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/playlists/:id', upload.single('cover'), async (req, res) => {
    try {
        const { name, description, songs, isFeatured } = req.body;
        const playlist = await AdminPlaylist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        playlist.name = name || playlist.name;
        playlist.description = description !== undefined ? description : playlist.description;
        playlist.isFeatured = isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : playlist.isFeatured;

        if (req.file) {
            playlist.cover = `/uploads/images/${req.file.filename}`;
        }

        if (songs) {
            playlist.songs = typeof songs === 'string' ? JSON.parse(songs) : songs;
        }

        await playlist.save();
        res.json(playlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/playlists/:id', async (req, res) => {
    try {
        const playlist = await AdminPlaylist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

        if (playlist.cover && playlist.cover.startsWith('/uploads/')) {
            const coverPath = path.join(__dirname, '..', playlist.cover);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }

        await AdminPlaylist.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Playlist deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── User Requests CRUD ────────────────────────────────────────────────────────
router.get('/requests', async (req, res) => {
    try {
        const requests = await UserRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/requests/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const request = await UserRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status || request.status;
        await request.save();
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Waitlist CRUD ────────────────────────────────────────────────────────────
router.get('/waitlist', async (req, res) => {
    try {
        const waitlist = await Waitlist.find().sort({ createdAt: -1 });
        res.json(waitlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Users Management CRUD ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:id/ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.isBanned = true;
        await user.save();
        res.json({ success: true, message: 'User banned successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:id/unban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.isBanned = false;
        await user.save();
        res.json({ success: true, message: 'User unbanned successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/users/:id/details', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
