const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const pizzaRoutes = require('./routes/pizzaRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const webhookRoutes = require('./routes/webhookRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const logger = require('./middleware/logger.js');

dotenv.config();

const app = express();

// CORS configuration for Codespaces and local development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
    
    // In Codespaces, also allow the dynamic URLs
    if (process.env.IS_CODESPACES === 'true' && process.env.CODESPACE_NAME) {
      const codespacePattern = new RegExp(`^https://${process.env.CODESPACE_NAME}-.+\\.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'preview.app.github.dev'}$`);
      if (codespacePattern.test(origin)) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

// Import the new database configuration
const { connectDB } = require('./config/database');

// Connect to database and start server
connectDB()
  .then((dbInfo) => {
    console.log(`Connected to ${dbInfo.type} database`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (process.env.IS_CODESPACES === 'true') {
        console.log(`Codespaces detected - API available at: https://${process.env.CODESPACE_NAME}-${PORT}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`);
      }
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
