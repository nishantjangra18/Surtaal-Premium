const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: 'Music Lover'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', WaitlistSchema);
