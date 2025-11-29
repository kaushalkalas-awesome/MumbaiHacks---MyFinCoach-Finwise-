const { v4: uuidv4 } = require('uuid');
const Consent = require('../models/consent.model');
const Customer = require('../models/customer.model');
const Account = require('../models/account.model');
const { createErrorResponse } = require('../utils/response.utils');
const { validateDateRange, validateRequiredFields } = require('../utils/validation.utils');

/**
 * Create a new consent request
 */
const createConsent = async (consentData, baseUrl) => {
    try {
        // Validate required fields
        const requiredFields = [
            'Detail.Customer.id',
            'Detail.Purpose.code',
            'Detail.FIDataRange.from',
            'Detail.FIDataRange.to',
            'Detail.DataLife.unit',
            'Detail.DataLife.value',
            'Detail.Frequency.unit',
            'Detail.Frequency.value',
            'Detail.DataFilter',
            'redirectUrl'
        ];

        const validation = validateRequiredFields(consentData, requiredFields);
        if (!validation.valid) {
            throw createErrorResponse('INVALID_REQUEST', validation.error, 400);
        }

        // Validate date range
        const dateValidation = validateDateRange(
            consentData.Detail.FIDataRange.from,
            consentData.Detail.FIDataRange.to
        );
        if (!dateValidation.valid) {
            throw createErrorResponse('INVALID_DATE_RANGE', dateValidation.error, 400);
        }

        // Find customer
        const customer = await Customer.findOne({ customerId: consentData.Detail.Customer.id });
        if (!customer) {
            throw createErrorResponse('CUSTOMER_NOT_FOUND', 'Customer not found', 404);
        }

        // Calculate expiry date (default: 1 year from now)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // Create consent
        const consent = new Consent({
            consentId: uuidv4(),
            customerId: customer._id,
            status: 'PENDING',
            redirectUrl: consentData.redirectUrl,
            fetchType: consentData.Detail.fetchType || 'ONETIME',
            consentMode: consentData.consentMode || 'VIEW',
            detail: {
                purpose: consentData.Detail.Purpose.code,
                fiDataRange: {
                    from: new Date(consentData.Detail.FIDataRange.from),
                    to: new Date(consentData.Detail.FIDataRange.to)
                },
                dataLife: {
                    unit: consentData.Detail.DataLife.unit,
                    value: consentData.Detail.DataLife.value
                },
                frequency: {
                    unit: consentData.Detail.Frequency.unit,
                    value: consentData.Detail.Frequency.value
                },
                fiTypes: consentData.Detail.DataFilter.map(filter => filter.type)
            },
            expiresAt,
            context: consentData.context || []
        });

        await consent.save();

        // Populate customer for response
        await consent.populate('customerId');

        return consent;
    } catch (error) {
        throw error;
    }
};

/**
 * Get consent by ID
 */
const getConsentById = async (consentId) => {
    try {
        const consent = await Consent.findOne({ consentId })
            .populate('customerId')
            .populate({
                path: 'accounts',
                populate: { path: 'fipId' }
            });

        if (!consent) {
            throw createErrorResponse('CONSENT_NOT_FOUND', 'Consent not found', 404);
        }

        return consent;
    } catch (error) {
        throw error;
    }
};

/**
 * Approve consent and link accounts
 */
const approveConsent = async (consentId, accountIds) => {
    try {
        const consent = await Consent.findOne({ consentId });

        if (!consent) {
            throw createErrorResponse('CONSENT_NOT_FOUND', 'Consent not found', 404);
        }

        if (consent.status !== 'PENDING') {
            throw createErrorResponse('INVALID_STATUS', 'Consent is not in PENDING status', 400);
        }

        // Verify accounts belong to the customer
        const accounts = await Account.find({
            _id: { $in: accountIds },
            customerId: consent.customerId
        });

        if (accounts.length !== accountIds.length) {
            throw createErrorResponse('INVALID_ACCOUNTS', 'Some accounts do not belong to the customer', 400);
        }

        // Update consent
        consent.status = 'ACTIVE';
        consent.accounts = accountIds;
        await consent.save();

        return consent;
    } catch (error) {
        throw error;
    }
};

/**
 * Reject consent
 */
const rejectConsent = async (consentId) => {
    try {
        const consent = await Consent.findOne({ consentId });

        if (!consent) {
            throw createErrorResponse('CONSENT_NOT_FOUND', 'Consent not found', 404);
        }

        if (consent.status !== 'PENDING') {
            throw createErrorResponse('INVALID_STATUS', 'Consent is not in PENDING status', 400);
        }

        consent.status = 'REJECTED';
        await consent.save();

        return consent;
    } catch (error) {
        throw error;
    }
};

/**
 * Update consent usage
 */
const updateConsentUsage = async (consentId) => {
    try {
        const consent = await Consent.findOne({ consentId });

        if (!consent) {
            throw createErrorResponse('CONSENT_NOT_FOUND', 'Consent not found', 404);
        }

        consent.usage.count += 1;
        consent.usage.lastUsed = new Date();
        await consent.save();

        return consent;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createConsent,
    getConsentById,
    approveConsent,
    rejectConsent,
    updateConsentUsage
};
