/**
 * Create a standardized error response
 */
const createErrorResponse = (errorCode, errorMsg, statusCode = 400, txnid = 'N/A') => {
    const error = new Error(errorMsg);
    error.statusCode = statusCode;
    error.errorCode = errorCode;
    error.txnid = txnid;
    return error;
};

/**
 * Format FIP response
 */
const formatFIPResponse = (fips) => {
    return {
        data: fips.map(fip => ({
            id: fip.fipId,
            name: fip.name,
            institutionType: fip.institutionType,
            status: fip.status,
            fiTypes: fip.fiTypes
        }))
    };
};

/**
 * Format Consent response
 */
const formatConsentResponse = (consent, baseUrl) => {
    const response = {
        id: consent.consentId,
        status: consent.status,
        Detail: {
            consentStart: consent.createdAt.toISOString(),
            consentExpiry: consent.expiresAt.toISOString(),
            Customer: {
                id: consent.customerId.customerId || consent.customerId.toString()
            },
            FIDataRange: {
                from: consent.detail.fiDataRange.from.toISOString(),
                to: consent.detail.fiDataRange.to.toISOString()
            },
            consentMode: consent.consentMode,
            fetchType: consent.fetchType,
            Frequency: {
                unit: consent.detail.frequency.unit,
                value: consent.detail.frequency.value
            },
            DataLife: {
                unit: consent.detail.dataLife.unit,
                value: consent.detail.dataLife.value
            },
            DataFilter: consent.detail.fiTypes.map(type => ({ type })),
            Purpose: {
                code: consent.detail.purpose,
                text: consent.detail.purpose
            }
        }
    };

    // Add URL for PENDING status
    if (consent.status === 'PENDING') {
        response.url = `${baseUrl}/mock-aa/consents/${consent.consentId}`;
    }

    // Add redirect URL
    if (consent.redirectUrl) {
        response.redirectUrl = consent.redirectUrl;
    }

    // Add accounts if linked
    if (consent.accounts && consent.accounts.length > 0) {
        response.Detail.Accounts = consent.accounts.map(account => ({
            linkRefNumber: account.linkRefNumber,
            maskedAccNumber: account.maskedAccNumber,
            fiType: account.fiType,
            fipId: account.fipId.fipId || account.fipId.toString()
        }));
    }

    // Add usage if exists
    if (consent.usage && consent.usage.count > 0) {
        response.Usage = {
            count: consent.usage.count,
            lastUsed: consent.usage.lastUsed ? consent.usage.lastUsed.toISOString() : null
        };
    }

    // Add context if exists
    if (consent.context && consent.context.length > 0) {
        response.context = consent.context;
    }

    return response;
};

/**
 * Format Session response
 */
const formatSessionResponse = (session, consent) => {
    const response = {
        id: session.sessionId,
        consentId: consent.consentId,
        status: session.status,
        DataRange: {
            from: session.dataRange.from.toISOString(),
            to: session.dataRange.to.toISOString()
        },
        format: session.format
    };

    // Add payload if completed
    if (session.status === 'COMPLETED' && session.payload) {
        response.Payload = session.payload;
    } else {
        response.Payload = [];
    }

    return response;
};

module.exports = {
    createErrorResponse,
    formatFIPResponse,
    formatConsentResponse,
    formatSessionResponse
};
