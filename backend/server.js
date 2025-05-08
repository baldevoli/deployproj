const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Parse JSON bodies
app.use(express.json());

// Configure CORS to accept requests from frontend during development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Role'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Add debug logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'OPTIONS') {
    console.log('Received OPTIONS request - responding with CORS headers');
  }
  next();
});

// Add response header logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`Response status for ${req.method} ${req.url}: ${res.statusCode}`);
    return originalSend.call(this, body);
  };
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

// Health check endpoint
app.get('/', (req, res) => {
  res.send('🎉 API is up and running');
});

// Add a debug endpoint to test API connectivity
app.get('/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.json({ message: 'API is working properly' });
});

// Add a specific items test endpoint
app.get('/test-items', (req, res) => {
  console.log('Testing items endpoint');
  const db = require('./db');
  db.query('SELECT * FROM items LIMIT 5', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    console.log('Items returned:', rows.length);
    res.json(rows);
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

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});