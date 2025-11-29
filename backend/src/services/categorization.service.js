/**
 * Auto-categorize transaction based on merchant name and description
 */
function categorizeTransaction(transactionData) {
    const { merchant, description, type, amount } = transactionData;
    const text = `${merchant || ''} ${description || ''}`.toLowerCase();

    // Income detection
    if (type === 'CREDIT') {
        if (text.includes('salary') || text.includes('payroll') || text.includes('wages')) {
            return 'INCOME';
        }
        if (text.includes('refund') || text.includes('cashback')) {
            return 'INCOME';
        }
        if (text.includes('interest') || text.includes('dividend')) {
            return 'INVESTMENT';
        }
    }

    // Food & Dining
    if (text.match(/(swiggy|zomato|uber\s*eats|domino|pizza|restaurant|cafe|food|dining|starbucks|mcdonald)/)) {
        return 'FOOD';
    }

    // Transport
    if (text.match(/(uber|ola|rapido|metro|petrol|diesel|fuel|parking|toll)/)) {
        return 'TRANSPORT';
    }

    // Shopping
    if (text.match(/(amazon|flipkart|myntra|ajio|shopping|mall|store|retail)/)) {
        return 'SHOPPING';
    }

    // Bills & Utilities
    if (text.match(/(electricity|water|gas|internet|broadband|mobile|recharge|bill|utility)/)) {
        return 'BILLS';
    }

    // Entertainment
    if (text.match(/(netflix|prime|hotstar|spotify|movie|cinema|theatre|entertainment|game)/)) {
        return 'ENTERTAINMENT';
    }

    // Healthcare
    if (text.match(/(hospital|clinic|doctor|pharmacy|medicine|health|medical)/)) {
        return 'HEALTHCARE';
    }

    // Savings & Investment
    if (text.match(/(mutual\s*fund|sip|fixed\s*deposit|fd|rd|investment|stock)/)) {
        return 'INVESTMENT';
    }

    // Transfers
    if (text.match(/(transfer|upi|neft|imps|rtgs)/)) {
        return 'TRANSFER';
    }

    return 'OTHER';
}

/**
 * Detect if transaction is recurring
 */
function detectRecurringPattern(transactions) {
    // Group by merchant and amount
    const groups = {};

    transactions.forEach(txn => {
        const key = `${txn.merchant}_${txn.amount}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(txn);
    });

    // Check for recurring patterns
    const recurring = [];

    Object.entries(groups).forEach(([key, txns]) => {
        if (txns.length >= 2) {
            // Calculate average days between transactions
            const dates = txns.map(t => new Date(t.transactionDate)).sort((a, b) => a - b);
            const intervals = [];

            for (let i = 1; i < dates.length; i++) {
                const days = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
                intervals.push(days);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

            // Determine frequency
            let frequency = null;
            if (avgInterval >= 25 && avgInterval <= 35) {
                frequency = 'MONTHLY';
            } else if (avgInterval >= 6 && avgInterval <= 8) {
                frequency = 'WEEKLY';
            } else if (avgInterval >= 360 && avgInterval <= 370) {
                frequency = 'YEARLY';
            }

            if (frequency) {
                recurring.push({
                    merchant: txns[0].merchant,
                    amount: txns[0].amount,
                    frequency,
                    lastDate: dates[dates.length - 1],
                    count: txns.length
                });
            }
        }
    });

    return recurring;
}

/**
 * Get category display name
 */
function getCategoryDisplayName(category) {
    const names = {
        'FOOD': 'Food & Dining',
        'TRANSPORT': 'Transportation',
        'SHOPPING': 'Shopping',
        'BILLS': 'Bills & Utilities',
        'ENTERTAINMENT': 'Entertainment',
        'HEALTHCARE': 'Healthcare',
        'INCOME': 'Income',
        'TRANSFER': 'Transfers',
        'SAVINGS': 'Savings',
        'INVESTMENT': 'Investments',
        'OTHER': 'Other'
    };

    return names[category] || category;
}

module.exports = {
    categorizeTransaction,
    detectRecurringPattern,
    getCategoryDisplayName
};
