const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cover: {
        type: String,
        default: ''
    },
    artist: {
        type: String,
        trim: true,
        default: 'Various Artists'
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    releaseDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Album', AlbumSchema);
