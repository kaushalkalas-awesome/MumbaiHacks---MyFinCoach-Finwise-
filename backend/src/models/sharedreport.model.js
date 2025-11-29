const mongoose = require('mongoose');

const sharedReportSchema = new mongoose.Schema({
    appUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppUser',
        required: true,
        index: true
    },
    recipientEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    recipientName: {
        type: String,
        trim: true
    },
    dateRange: {
        from: {
            type: Date,
            required: true
        },
        to: {
            type: Date,
            required: true
        }
    },
    categories: [{
        type: String,
        enum: [
            'FOOD',
            'TRANSPORT',
            'SHOPPING',
            'BILLS',
            'ENTERTAINMENT',
            'HEALTHCARE',
            'INCOME',
            'TRANSFER',
            'SAVINGS',
            'INVESTMENT',
            'OTHER'
        ]
    }],
    summary: {
        totalAmount: {
            type: Number,
            required: true
        },
        transactionCount: {
            type: Number,
            required: true
        },
        categoryBreakdown: [{
            category: String,
            amount: Number,
            count: Number
        }]
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['SENT', 'FAILED', 'PENDING'],
        default: 'PENDING'
    },
    errorMessage: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
sharedReportSchema.index({ appUserId: 1, sentAt: -1 });
sharedReportSchema.index({ recipientEmail: 1 });
sharedReportSchema.index({ status: 1 });

const SharedReport = mongoose.model('SharedReport', sharedReportSchema);

module.exports = SharedReport;
