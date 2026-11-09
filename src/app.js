const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
});

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        service: 'Visa User & Request Service',
        message: 'Service is running'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'visa-user-request-service',
        status: 'healthy'
    });
});

module.exports = app;