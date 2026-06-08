const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: String,
        required: true,
        trim: true
    },
    album: {
        type: String,
        trim: true,
        default: 'Single'
    },
    genre: {
        type: String,
        trim: true,
        default: 'Indian Music'
    },
    language: {
        type: String,
        trim: true,
        default: 'Hindi'
    },
    duration: {
        type: Number,
        default: 0
    },
    cover: {
        type: String,
        default: ''
    },
    src: {
        type: String,
        default: ''
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    playCount: {
        type: Number,
        default: 0
    },
    lyrics: [
        {
            time: { type: Number, required: true },
            text: { type: String, required: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Song', SongSchema);
