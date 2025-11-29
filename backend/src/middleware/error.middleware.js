const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'INTERNAL_ERROR';
    const errorMsg = err.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        errorCode,
        errorMsg,
        timestamp: new Date().toISOString(),
        txnid: req.headers['x-request-id'] || err.txnid || 'N/A',
        ver: '1.0'
    });
};

module.exports = errorMiddleware;
