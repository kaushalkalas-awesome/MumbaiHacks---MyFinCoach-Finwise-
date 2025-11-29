const UserTransaction = require('../models/usertransaction.model');
const FIData = require('../models/fidata.model');
const Session = require('../models/session.model');
const Consent = require('../models/consent.model');
const { categorizeTransaction } = require('./categorization.service');

/**
 * Sync transactions from a session
 */
async function syncTransactionsFromSession(appUserId, sessionId) {
    // Get session with populated data
    const session = await Session.findOne({ sessionId })
        .populate('consentId');

    if (!session) {
        const error = new Error('Session not found');
        error.code = 'SESSION_NOT_FOUND';
        throw error;
    }

    if (session.status !== 'COMPLETED') {
        const error = new Error('Session not completed');
        error.code = 'SESSION_NOT_COMPLETED';
        throw error;
    }

    const consent = session.consentId;

    // Get all accounts linked to this consent
    const accountIds = consent.accounts;

    // Find all FI data for these accounts within the session date range
    const fiDataRecords = await FIData.find({
        accountId: { $in: accountIds },
        transactionDate: {
            $gte: session.dataRange.from,
            $lte: session.dataRange.to
        }
    }).populate('accountId');

    const syncedTransactions = [];

    for (const fiData of fiDataRecords) {
        // Check if transaction already synced
        const existing = await UserTransaction.findOne({
            appUserId,
            fiDataId: fiData._id
        });

        if (existing) {
            continue; // Skip already synced
        }

        // Auto-categorize
        const category = categorizeTransaction({
            merchant: fiData.payload.merchant || '',
            description: fiData.payload.description || '',
            type: fiData.type,
            amount: fiData.amount
        });

        // Create user transaction
        const userTxn = new UserTransaction({
            appUserId,
            fiDataId: fiData._id,
            accountId: fiData.accountId,
            category
        });

        await userTxn.save();
        syncedTransactions.push(userTxn);
    }

    return {
        syncedCount: syncedTransactions.length,
        transactions: syncedTransactions
    };
}

/**
 * Get user transactions with filters
 */
async function getUserTransactions(appUserId, filters = {}) {
    const query = { appUserId };

    // Date range filter
    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
            query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            query.createdAt.$lte = new Date(filters.endDate);
        }
    }

    // Category filter
    if (filters.category) {
        query.category = filters.category;
    }

    // Search filter
    if (filters.search) {
        // We'll need to populate and filter - do this after query
    }

    const transactions = await UserTransaction.find(query)
        .populate({
            path: 'fiDataId',
            select: 'transactionDate amount type payload'
        })
        .populate({
            path: 'accountId',
            select: 'maskedAccNumber fiType fipId'
        })
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100)
        .skip(filters.skip || 0);

    return transactions;
}

/**
 * Get transaction statistics
 */
async function getTransactionStats(appUserId, dateRange) {
    const matchStage = { appUserId };

    if (dateRange) {
        matchStage.createdAt = {
            $gte: new Date(dateRange.from),
            $lte: new Date(dateRange.to)
        };
    }

    // Get all transactions for the user
    const transactions = await UserTransaction.find(matchStage)
        .populate('fiDataId');

    // Calculate statistics
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    transactions.forEach(txn => {
        const fiData = txn.fiDataId;
        if (!fiData) return;

        const amount = Math.abs(fiData.amount || 0);

        if (fiData.type === 'CREDIT') {
            totalIncome += amount;
        } else {
            totalExpense += amount;
        }

        // Category totals
        if (!categoryTotals[txn.category]) {
            categoryTotals[txn.category] = {
                category: txn.category,
                amount: 0,
                count: 0
            };
        }

        if (fiData.type === 'DEBIT') {
            categoryTotals[txn.category].amount += amount;
            categoryTotals[txn.category].count += 1;
        }
    });

    return {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        transactionCount: transactions.length,
        categoryBreakdown: Object.values(categoryTotals).sort((a, b) => b.amount - a.amount)
    };
}

/**
 * Update transaction category
 */
async function updateTransactionCategory(transactionId, appUserId, category, customCategory) {
    const transaction = await UserTransaction.findOne({
        _id: transactionId,
        appUserId
    });

    if (!transaction) {
        const error = new Error('Transaction not found');
        error.code = 'TRANSACTION_NOT_FOUND';
        throw error;
    }

    transaction.category = category;
    if (customCategory) {
        transaction.customCategory = customCategory;
    }

    await transaction.save();
    return transaction;
}

module.exports = {
    syncTransactionsFromSession,
    getUserTransactions,
    getTransactionStats,
    updateTransactionCategory
};
