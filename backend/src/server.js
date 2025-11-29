require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/database');
const errorMiddleware = require('./middleware/error.middleware');

// Import routes
const fipRoutes = require('./routes/fip.routes');
const consentRoutes = require('./routes/consent.routes');
const sessionRoutes = require('./routes/session.routes');
const mockAARoutes = require('./routes/mockaa.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AA FIU Sandbox API Documentation',
    customfavIcon: '/favicon.ico'
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'AA FIU Sandbox',
        version: '1.0.0'
    });
});

// API Routes
app.use('/v2/fips', fipRoutes);
app.use('/consents', consentRoutes);
app.use('/sessions', sessionRoutes);
app.use('/mock-aa', mockAARoutes);

// New App User Routes
const appUserRoutes = require('./routes/appuser.routes');
const userTransactionRoutes = require('./routes/usertransaction.routes');

app.use('/api/users', appUserRoutes);
app.use('/api/user-transactions', userTransactionRoutes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        errorCode: 'NOT_FOUND',
        errorMsg: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
        txnid: req.headers['x-request-id'] || 'N/A',
        ver: '1.0'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 AA FIU Sandbox running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`🔐 Mock AA UI: http://localhost:${PORT}/mock-aa/consents/{consentId}`);
});

module.exports = app;
