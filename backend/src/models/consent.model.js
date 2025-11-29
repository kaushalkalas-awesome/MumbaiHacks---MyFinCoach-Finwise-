const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
    consentId: {
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
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'REJECTED', 'REVOKED', 'EXPIRED', 'FAILED'],
        default: 'PENDING',
        index: true
    },
    redirectUrl: {
        type: String,
        required: true
    },
    fetchType: {
        type: String,
        enum: ['ONETIME', 'PERIODIC'],
        default: 'ONETIME'
    },
    consentMode: {
        type: String,
        enum: ['STORE', 'VIEW', 'QUERY', 'STREAM'],
        default: 'VIEW'
    },
    detail: {
        purpose: {
            type: String,
            required: true
        },
        fiDataRange: {
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date,
                required: true
            }
        },
        dataLife: {
            unit: {
                type: String,
                enum: ['MONTH', 'YEAR', 'DAY', 'INF'],
                required: true
            },
            value: {
                type: Number,
                required: true
            }
        },
        frequency: {
            unit: {
                type: String,
                enum: ['HOURLY', 'DAILY', 'MONTHLY', 'YEARLY'],
                required: true
            },
            value: {
                type: Number,
                required: true
            }
        },
        fiTypes: [{
            type: String,
            enum: ['DEPOSIT', 'TERM_DEPOSIT', 'RECURRING_DEPOSIT', 'SIP', 'CP', 'GOVT_SECURITIES',
                'EQUITIES', 'BONDS', 'DEBENTURES', 'MUTUAL_FUNDS', 'ETF', 'IDR', 'CIS', 'AIF',
                'INSURANCE_POLICIES', 'NPS', 'INVIT', 'REIT', 'GSTR1_3B', 'OTHER']
        }]
    },
    accounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    usage: {
        count: {
            type: Number,
            default: 0
        },
        lastUsed: {
            type: Date,
            default: null
        }
    },
    expiresAt: {
        type: Date,
        required: true
    },
    context: [{
        key: String,
        value: String
    }]
}, {
    timestamps: true
});

// Index for efficient status queries
consentSchema.index({ status: 1, createdAt: -1 });

// Virtual to check if consent is expired
consentSchema.virtual('isExpired').get(function () {
    return this.expiresAt < new Date();
});

module.exports = mongoose.model('Consent', consentSchema);
