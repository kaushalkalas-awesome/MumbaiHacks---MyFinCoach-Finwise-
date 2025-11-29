const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { createConsent, getConsentById } = require('../services/consent.service');
const { formatConsentResponse } = require('../utils/response.utils');

/**
 * @swagger
 * /consents:
 *   post:
 *     summary: Create a new consent request
 *     description: Creates a new consent request in PENDING status. Returns a URL for the user to approve/reject via Mock AA UI.
 *     tags:
 *       - Consents
 *     security:
 *       - ClientAuth: []
 *         ClientSecret: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsentRequest'
 *           example:
 *             Detail:
 *               Customer:
 *                 id: CUST001
 *               Purpose:
 *                 code: WEALTH_MANAGEMENT
 *               FIDataRange:
 *                 from: "2023-01-01T00:00:00Z"
 *                 to: "2024-12-31T23:59:59Z"
 *               DataLife:
 *                 unit: MONTH
 *                 value: 6
 *               Frequency:
 *                 unit: MONTHLY
 *                 value: 1
 *               DataFilter:
 *                 - type: DEPOSIT
 *                 - type: MUTUAL_FUNDS
 *             redirectUrl: "https://your-fiu-app.com/callback"
 *             consentMode: VIEW
 *             fetchType: ONETIME
 *     responses:
 *       201:
 *         description: Consent request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsentResponse'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const consent = await createConsent(req.body, baseUrl);
        const response = formatConsentResponse(consent, baseUrl);

        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /consents/{requestId}:
 *   get:
 *     summary: Get consent details by ID
 *     description: Retrieves the current status and details of a consent request
 *     tags:
 *       - Consents
 *     security:
 *       - ClientAuth: []
 *         ClientSecret: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Consent ID (UUID)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Consent details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsentResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Consent not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:requestId', authMiddleware, async (req, res, next) => {
    try {
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const consent = await getConsentById(req.params.requestId);
        const response = formatConsentResponse(consent, baseUrl);

        res.json(response);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
