/**
 * Validate date range
 */
const validateDateRange = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return { valid: false, error: 'Invalid date format' };
    }

    if (from >= to) {
        return { valid: false, error: 'From date must be before to date' };
    }

    return { valid: true };
};

/**
 * Check if date range is within allowed range
 */
const isDateRangeWithinConsent = (requestFrom, requestTo, consentFrom, consentTo) => {
    const reqFrom = new Date(requestFrom);
    const reqTo = new Date(requestTo);
    const consFrom = new Date(consentFrom);
    const consTo = new Date(consentTo);

    return reqFrom >= consFrom && reqTo <= consTo;
};

/**
 * Validate consent status for operations
 */
const validateConsentStatus = (consent, allowedStatuses) => {
    if (!allowedStatuses.includes(consent.status)) {
        return {
            valid: false,
            error: `Consent status must be one of: ${allowedStatuses.join(', ')}. Current status: ${consent.status}`
        };
    }

    // Check expiration
    if (consent.expiresAt < new Date()) {
        return {
            valid: false,
            error: 'Consent has expired'
        };
    }

    return { valid: true };
};

/**
 * Validate request body fields
 */
const validateRequiredFields = (body, requiredFields) => {
    const missing = [];

    for (const field of requiredFields) {
        if (field.includes('.')) {
            // Nested field
            const parts = field.split('.');
            let value = body;
            for (const part of parts) {
                value = value?.[part];
            }
            if (value === undefined || value === null) {
                missing.push(field);
            }
        } else {
            if (body[field] === undefined || body[field] === null) {
                missing.push(field);
            }
        }
    }

    if (missing.length > 0) {
        return {
            valid: false,
            error: `Missing required fields: ${missing.join(', ')}`
        };
    }

    return { valid: true };
};

module.exports = {
    validateDateRange,
    isDateRangeWithinConsent,
    validateConsentStatus,
    validateRequiredFields
};
