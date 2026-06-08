const mongoose = require('mongoose');

const UserRequestSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Song', 'Artist', 'Album', 'Feature'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    details: {
        type: String,
        default: '',
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('UserRequest', UserRequestSchema);
