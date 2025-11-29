const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { createSession, getSessionById } = require('../services/session.service');
const { formatSessionResponse } = require('../utils/response.utils');

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new data fetch session
 *     description: Creates a session to fetch financial data for an approved consent. The session starts in PENDING status.
 *     tags:
 *       - Sessions
 *     security:
 *       - ClientAuth: []
 *         ClientSecret: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SessionRequest'
 *           example:
 *             consentId: "550e8400-e29b-41d4-a716-446655440000"
 *             DataRange:
 *               from: "2024-01-01T00:00:00Z"
 *               to: "2024-12-31T23:59:59Z"
 *             format: json
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 *       400:
 *         description: Bad request - Invalid consent status or date range
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
 *         description: Consent not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { session, consent } = await createSession(req.body);
        const response = formatSessionResponse(session, consent);

        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /sessions/{requestId}:
 *   get:
 *     summary: Get session details and FI data
 *     description: Retrieves session status and FI data payload. On first call, generates the payload and transitions to COMPLETED status.
 *     tags:
 *       - Sessions
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
 *         description: Session ID (UUID)
 *         example: abc12345-6789-def0-1234-56789abcdef0
 *     responses:
 *       200:
 *         description: Session data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 *             example:
 *               id: abc12345-6789-def0-1234-56789abcdef0
 *               consentId: 550e8400-e29b-41d4-a716-446655440000
 *               status: COMPLETED
 *               DataRange:
 *                 from: "2024-01-01T00:00:00.000Z"
 *                 to: "2024-12-31T23:59:59.000Z"
 *               format: json
 *               Payload:
 *                 - fipID: HDFC_BANK
 *                   data:
 *                     - linkRefNumber: abc123-def456
 *                       maskedAccNumber: XXXX1234
 *                       decryptedFI:
 *                         fiType: DEPOSIT
 *                         data:
 *                           - transactionDate: "2024-11-15T10:30:00.000Z"
 *                             amount: 5000
 *                             type: CREDIT
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:requestId', authMiddleware, async (req, res, next) => {
    try {
        const { session, consent } = await getSessionById(req.params.requestId);
        const response = formatSessionResponse(session, consent);

        res.json(response);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
