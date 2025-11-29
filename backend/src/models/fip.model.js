const mongoose = require('mongoose');

const fipSchema = new mongoose.Schema({
    fipId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    institutionType: {
        type: String,
        enum: ['BANK', 'NBFC', 'MUTUAL_FUND', 'INSURANCE', 'PENSION_FUND', 'OTHER'],
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    fiTypes: [{
        type: String,
        enum: ['DEPOSIT', 'TERM_DEPOSIT', 'RECURRING_DEPOSIT', 'SIP', 'CP', 'GOVT_SECURITIES',
            'EQUITIES', 'BONDS', 'DEBENTURES', 'MUTUAL_FUNDS', 'ETF', 'IDR', 'CIS', 'AIF',
            'INSURANCE_POLICIES', 'NPS', 'INVIT', 'REIT', 'GSTR1_3B', 'OTHER']
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('FIP', fipSchema);
