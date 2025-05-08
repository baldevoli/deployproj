const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://deployproj.vercel.app',
  'https://deployproj-git-master-baldevoli.vercel.app',
  'https://deployproj-copy-production.up.railway.app'
];

// CORS middleware with dynamic origin check
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Role']
}));

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).send('🎉 API is up and running');
});

// Import routes
const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');
const vendorRoutes = require('./routes/vendors');
const transactionRoutes = require('./routes/transactions');

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  try {
    await testConnection();
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
