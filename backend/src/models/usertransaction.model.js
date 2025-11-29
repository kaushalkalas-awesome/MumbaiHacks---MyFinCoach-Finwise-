const mongoose = require('mongoose');

const userTransactionSchema = new mongoose.Schema({
    appUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppUser',
        required: true,
        index: true
    },
    fiDataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FIData',
        required: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    category: {
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
        ],
        default: 'OTHER'
    },
    customCategory: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringPattern: {
        frequency: {
            type: String,
            enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']
        },
        nextDate: Date
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
userTransactionSchema.index({ appUserId: 1, createdAt: -1 });
userTransactionSchema.index({ appUserId: 1, category: 1 });
userTransactionSchema.index({ fiDataId: 1 });
userTransactionSchema.index({ accountId: 1 });

// Virtual to get transaction details from FIData
userTransactionSchema.virtual('transactionDetails', {
    ref: 'FIData',
    localField: 'fiDataId',
    foreignField: '_id',
    justOne: true
});

// Ensure virtuals are included in JSON
userTransactionSchema.set('toJSON', { virtuals: true });
userTransactionSchema.set('toObject', { virtuals: true });

const UserTransaction = mongoose.model('UserTransaction', userTransactionSchema);

module.exports = UserTransaction;
