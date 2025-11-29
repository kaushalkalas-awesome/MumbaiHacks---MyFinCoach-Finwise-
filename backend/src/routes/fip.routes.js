const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getAllFIPs } = require('../services/fip.service');
const { formatFIPResponse } = require('../utils/response.utils');

/**
 * @swagger
 * /v2/fips:
 *   get:
 *     summary: List all Financial Information Providers (FIPs)
 *     description: Retrieves a list of all active FIPs registered in the system
 *     tags:
 *       - FIPs
 *     security:
 *       - ClientAuth: []
 *         ClientSecret: []
 *     responses:
 *       200:
 *         description: Successfully retrieved FIPs list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FIPResponse'
 *             example:
 *               data:
 *                 - id: HDFC_BANK
 *                   name: HDFC Bank
 *                   institutionType: BANK
 *                   status: ACTIVE
 *                   fiTypes: [DEPOSIT, TERM_DEPOSIT]
 *       401:
 *         description: Unauthorized - Invalid or missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const fips = await getAllFIPs();
        const response = formatFIPResponse(fips);
        res.json(response);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
