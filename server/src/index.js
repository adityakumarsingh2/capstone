require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const tryonRoutes = require('./routes/tryon');

const app = express();

// Connect to MongoDB
connectDB();

// Allowed frontend origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://fitkartt.vercel.app'
];

// CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests without an Origin header (e.g. server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        // Normalize origin to avoid trailing slash mismatches
        const normalizedOrigin = origin.replace(/\/+$/, '');

        if (allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        console.error(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS before routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('dev'));

// Serve uploaded files
const uploadPath = process.env.UPLOAD_PATH || 'uploads';

app.use(
    '/uploads',
    express.static(path.join(__dirname, '..', uploadPath))
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tryon', tryonRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'FitKart API is running',
        timestamp: new Date().toISOString()
    });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`FitKart server running on port ${PORT}`);
    console.log(`Allowed frontend origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;