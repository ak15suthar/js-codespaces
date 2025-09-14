const express = require('express');
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

// CORS configuration following go-js pattern
const corsOptions = {
  origin: process.env.CODESPACES === 'true' ? true : [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ],
  credentials: process.env.CODESPACES === 'true' ? false : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: process.env.CODESPACES === 'true' ? 3600 : 300
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

// Global OPTIONS handler for preflight requests (following go-js pattern)
app.options('*', (req, res) => {
  res.status(204).send();
});

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
      if (process.env.CODESPACES === 'true') {
        console.log(`Codespaces detected - API available at: https://${process.env.CODESPACE_NAME}-${PORT}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`);
      }
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
