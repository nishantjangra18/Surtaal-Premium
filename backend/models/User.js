const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    id: String,
    spotifyId: String,
    source: String,
    title: String,
    singer: String,
    artist: String,
    artists: [mongoose.Schema.Types.Mixed],
    album: String,
    cover: String,
    image: String,
    src: String,
    previewUrl: String,
    duration: Number,
    popularity: Number,
    genre: String,
    genres: [String],
    spotifyUrl: String,
    uri: String,
    playedAt: Date,
    playCount: { type: Number, default: 1 },
    raw: mongoose.Schema.Types.Mixed
}, { _id: false });

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    cover: { type: String, default: '' },
    songs: [SongSchema]
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    likedSongs: [SongSchema],
    recentlyPlayed: [SongSchema],
    listeningHistory: [SongSchema],
    favoriteArtists: [{ name: String, count: { type: Number, default: 0 } }],
    favoriteGenres: [{ name: String, count: { type: Number, default: 0 } }],
    playlists: [PlaylistSchema],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isBanned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

