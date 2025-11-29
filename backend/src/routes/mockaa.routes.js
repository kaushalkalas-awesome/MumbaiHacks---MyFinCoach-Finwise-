const express = require('express');
const router = express.Router();
const { getConsentById, approveConsent, rejectConsent } = require('../services/consent.service');
const Account = require('../models/account.model');

/**
 * GET /mock-aa/consents/:consentId
 * Render consent approval UI
 */
router.get('/consents/:consentId', async (req, res, next) => {
    try {
        const consent = await getConsentById(req.params.consentId);

        if (consent.status !== 'PENDING') {
            return res.render('consent-status', {
                consent,
                message: `This consent is already ${consent.status.toLowerCase()}`
            });
        }

        // Get all accounts for this customer
        const accounts = await Account.find({ customerId: consent.customerId })
            .populate('fipId')
            .sort({ 'fipId.name': 1 });

        // Filter accounts by consent's fiTypes
        const filteredAccounts = accounts.filter(account =>
            consent.detail.fiTypes.includes(account.fiType)
        );

        res.render('consent-approval', {
            consent,
            accounts: filteredAccounts
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /mock-aa/consents/:consentId/approve
 * Approve consent and link selected accounts
 */
router.post('/consents/:consentId/approve', async (req, res, next) => {
    try {
        const { accountIds } = req.body;

        if (!accountIds || accountIds.length === 0) {
            return res.status(400).send('Please select at least one account');
        }

        const consent = await approveConsent(req.params.consentId, accountIds);

        // Redirect to the FIU's redirect URL
        res.redirect(consent.redirectUrl);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /mock-aa/consents/:consentId/reject
 * Reject consent
 */
router.post('/consents/:consentId/reject', async (req, res, next) => {
    try {
        const consent = await rejectConsent(req.params.consentId);

        // Redirect to the FIU's redirect URL
        res.redirect(consent.redirectUrl);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
