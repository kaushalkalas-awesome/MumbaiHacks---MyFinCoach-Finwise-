const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    fipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FIP',
        required: true,
        index: true
    },
    fiType: {
        type: String,
        enum: ['DEPOSIT', 'TERM_DEPOSIT', 'RECURRING_DEPOSIT', 'SIP', 'CP', 'GOVT_SECURITIES',
            'EQUITIES', 'BONDS', 'DEBENTURES', 'MUTUAL_FUNDS', 'ETF', 'IDR', 'CIS', 'AIF',
            'INSURANCE_POLICIES', 'NPS', 'INVIT', 'REIT', 'GSTR1_3B', 'OTHER'],
        required: true
    },
    maskedAccNumber: {
        type: String,
        required: true
    },
    linkRefNumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

// Index for efficient queries
accountSchema.index({ customerId: 1, fipId: 1 });

module.exports = mongoose.model('Account', accountSchema);
