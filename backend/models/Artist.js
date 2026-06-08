const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    image: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    socials: {
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        spotify: { type: String, default: '' }
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Artist', ArtistSchema);
