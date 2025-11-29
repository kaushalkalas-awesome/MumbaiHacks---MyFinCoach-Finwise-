const { v4: uuidv4 } = require('uuid');
const Session = require('../models/session.model');
const Consent = require('../models/consent.model');
const FIData = require('../models/fidata.model');
const Account = require('../models/account.model');
const FIP = require('../models/fip.model');
const { createErrorResponse } = require('../utils/response.utils');
const { validateDateRange, isDateRangeWithinConsent, validateConsentStatus } = require('../utils/validation.utils');
const { updateConsentUsage } = require('./consent.service');

/**
 * Create a new data fetch session
 */
const createSession = async (sessionData) => {
    try {
        // Validate required fields
        if (!sessionData.consentId || !sessionData.DataRange) {
            throw createErrorResponse('INVALID_REQUEST', 'Missing required fields: consentId or DataRange', 400);
        }

        // Validate date range
        const dateValidation = validateDateRange(
            sessionData.DataRange.from,
            sessionData.DataRange.to
        );
        if (!dateValidation.valid) {
            throw createErrorResponse('INVALID_DATE_RANGE', dateValidation.error, 400);
        }

        // Find consent
        const consent = await Consent.findOne({ consentId: sessionData.consentId });
        if (!consent) {
            throw createErrorResponse('CONSENT_NOT_FOUND', 'Consent not found', 404);
        }

        // Validate consent status
        const statusValidation = validateConsentStatus(consent, ['ACTIVE']);
        if (!statusValidation.valid) {
            throw createErrorResponse('INVALID_CONSENT_STATUS', statusValidation.error, 400);
        }

        // Validate date range is within consent's allowed range
        if (!isDateRangeWithinConsent(
            sessionData.DataRange.from,
            sessionData.DataRange.to,
            consent.detail.fiDataRange.from,
            consent.detail.fiDataRange.to
        )) {
            throw createErrorResponse(
                'DATE_RANGE_OUT_OF_BOUNDS',
                'Requested date range is outside consent\'s allowed range',
                400
            );
        }

        // Create session
        const session = new Session({
            sessionId: uuidv4(),
            consentId: consent._id,
            status: 'PENDING',
            format: sessionData.format || 'json',
            dataRange: {
                from: new Date(sessionData.DataRange.from),
                to: new Date(sessionData.DataRange.to)
            }
        });

        await session.save();

        return { session, consent };
    } catch (error) {
        throw error;
    }
};

/**
 * Get session by ID and generate payload if needed
 */
const getSessionById = async (sessionId) => {
    try {
        const session = await Session.findOne({ sessionId }).populate('consentId');

        if (!session) {
            throw createErrorResponse('SESSION_NOT_FOUND', 'Session not found', 404);
        }

        const consent = session.consentId;

        // If session is PENDING, generate the payload
        if (session.status === 'PENDING') {
            const payload = await generateFIDataPayload(consent, session.dataRange);

            session.payload = payload;
            session.status = 'COMPLETED';
            await session.save();

            // Update consent usage
            await updateConsentUsage(consent.consentId);
        }

        return { session, consent };
    } catch (error) {
        throw error;
    }
};

/**
 * Generate FI data payload for a session
 */
const generateFIDataPayload = async (consent, dataRange) => {
    try {
        // Populate accounts with FIP details
        await consent.populate({
            path: 'accounts',
            populate: { path: 'fipId' }
        });

        if (!consent.accounts || consent.accounts.length === 0) {
            return [];
        }

        // Group accounts by FIP
        const fipGroups = {};

        for (const account of consent.accounts) {
            const fipId = account.fipId.fipId;

            if (!fipGroups[fipId]) {
                fipGroups[fipId] = {
                    fipID: fipId,
                    data: []
                };
            }

            // Fetch FI data for this account within date range
            const fiDataRecords = await FIData.find({
                accountId: account._id,
                transactionDate: {
                    $gte: dataRange.from,
                    $lte: dataRange.to
                }
            }).sort({ transactionDate: -1 });

            // Format account data
            const accountData = {
                linkRefNumber: account.linkRefNumber,
                maskedAccNumber: account.maskedAccNumber,
                decryptedFI: {
                    fiType: account.fiType,
                    data: fiDataRecords.map(record => ({
                        ...record.payload,
                        transactionDate: record.transactionDate.toISOString(),
                        amount: record.amount,
                        type: record.type
                    }))
                }
            };

            fipGroups[fipId].data.push(accountData);
        }

        // Convert to array
        return Object.values(fipGroups);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createSession,
    getSessionById,
    generateFIDataPayload
};
