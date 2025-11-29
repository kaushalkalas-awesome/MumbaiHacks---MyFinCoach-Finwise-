const mongoose = require('mongoose');

const fiDataSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
        index: true
    },
    transactionDate: {
        type: Date,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true
});

// Compound index for efficient date range queries
fiDataSchema.index({ accountId: 1, transactionDate: -1 });

module.exports = mongoose.model('FIData', fiDataSchema);
