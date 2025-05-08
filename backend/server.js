const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Parse JSON bodies
app.use(express.json());

// Configure CORS for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Role'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API routes
console.log('Registering API routes...');

// Define user routes directly for testing
const userController = require('./controllers/usersController');
app.post('/api/users/login', userController.login);
app.post('/api/users/signup', userController.create);

// Load other routes from route files
app.use('/api/items', require('./routes/items'));
app.use('/api/users', require('./routes/users'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/types', require('./routes/types'));

console.log('Routes registered successfully');

// Health check endpoint with database verification
app.get('/', (req, res) => {
  console.log('Health check hit /');
  const pool = require('./db');
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection error during health check:', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    connection.release();
    res.status(200).send('🎉 API is up and running');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Test database connection before starting server
const pool = require('./db');
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit if database connection fails
  }
  console.log('Successfully connected to the database');
  connection.release();
  
  // Start server only after successful database connection
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});