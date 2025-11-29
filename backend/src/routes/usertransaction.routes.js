const express = require('express');
const router = express.Router();
const {
    syncTransactionsFromSession,
    getUserTransactions,
    getTransactionStats,
    updateTransactionCategory
} = require('../services/transaction-sync.service');
const { getAppUserByFirebaseUid } = require('../services/appuser.service');

// Extract Firebase UID middleware
const extractFirebaseUid = (req, res, next) => {
    const firebaseUid = req.headers['x-firebase-uid'];

    if (!firebaseUid) {
        return res.status(401).json({
            errorCode: 'MISSING_AUTH',
            errorMsg: 'Firebase UID required in x-firebase-uid header',
            timestamp: new Date().toISOString()
        });
    }

    req.firebaseUid = firebaseUid;
    next();
};

/**
 * @swagger
 * /api/user-transactions:
 *   get:
 *     summary: Get user transactions
 *     tags:
 *       - User Transactions
 */
router.get('/', extractFirebaseUid, async (req, res, next) => {
    try {
        const appUser = await getAppUserByFirebaseUid(req.firebaseUid);

        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            category: req.query.category,
            search: req.query.search,
            limit: parseInt(req.query.limit) || 100,
            skip: parseInt(req.query.skip) || 0
        };

        const transactions = await getUserTransactions(appUser._id, filters);

        res.json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/user-transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags:
 *       - User Transactions
 */
router.get('/stats', extractFirebaseUid, async (req, res, next) => {
    try {
        const appUser = await getAppUserByFirebaseUid(req.firebaseUid);

        const dateRange = req.query.startDate && req.query.endDate ? {
            from: req.query.startDate,
            to: req.query.endDate
        } : null;

        const stats = await getTransactionStats(appUser._id, dateRange);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/user-transactions/sync:
 *   post:
 *     summary: Sync transactions from session
 *     tags:
 *       - User Transactions
 */
router.post('/sync', extractFirebaseUid, async (req, res, next) => {
    try {
        const appUser = await getAppUserByFirebaseUid(req.firebaseUid);
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                errorCode: 'MISSING_SESSION_ID',
                errorMsg: 'Session ID is required',
                timestamp: new Date().toISOString()
            });
        }

        const result = await syncTransactionsFromSession(appUser._id, sessionId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/user-transactions/{id}/category:
 *   put:
 *     summary: Update transaction category
 *     tags:
 *       - User Transactions
 */
router.put('/:id/category', extractFirebaseUid, async (req, res, next) => {
    try {
        const appUser = await getAppUserByFirebaseUid(req.firebaseUid);
        const { category, customCategory } = req.body;

        const transaction = await updateTransactionCategory(
            req.params.id,
            appUser._id,
            category,
            customCategory
        );

        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
