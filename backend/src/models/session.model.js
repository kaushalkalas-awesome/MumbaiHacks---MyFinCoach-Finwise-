const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    consentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consent',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'PARTIAL'],
        default: 'PENDING',
        index: true
    },
    format: {
        type: String,
        enum: ['json', 'xml'],
        default: 'json'
    },
    dataRange: {
        from: {
            type: Date,
            required: true
        },
        to: {
            type: Date,
            required: true
        }
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient queries
sessionSchema.index({ consentId: 1, createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
