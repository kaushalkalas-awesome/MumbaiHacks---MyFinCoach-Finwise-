const authMiddleware = (req, res, next) => {
    const clientId = req.headers['x-client-id'];
    const clientSecret = req.headers['x-client-secret'];

    if (!clientId || !clientSecret) {
        return res.status(401).json({
            errorCode: 'MISSING_CREDENTIALS',
            errorMsg: 'Missing x-client-id or x-client-secret headers',
            timestamp: new Date().toISOString(),
            txnid: req.headers['x-request-id'] || 'N/A',
            ver: '1.0'
        });
    }

    if (clientId !== process.env.CLIENT_ID || clientSecret !== process.env.CLIENT_SECRET) {
        return res.status(401).json({
            errorCode: 'INVALID_CREDENTIALS',
            errorMsg: 'Invalid client credentials',
            timestamp: new Date().toISOString(),
            txnid: req.headers['x-request-id'] || 'N/A',
            ver: '1.0'
        });
    }

    next();
};

module.exports = authMiddleware;
