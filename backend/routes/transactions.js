const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionsController');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Add debug logging for this router
router.use((req, res, next) => {
  console.log('Transactions route accessed:', req.method, req.path);
  next();
});

// Get all transactions (admin only)
router.get('/', authorizeAdmin, controller.getAll);

// Get transactions for a specific user
router.get('/user/:user_id', controller.getByUser);

// Create a new transaction
router.post('/', controller.create);

// Get most taken items (admin only)
router.get('/most-taken', authorizeAdmin, controller.getMostTaken);

// Get unique student counts (admin only)
router.get('/unique-students', authorizeAdmin, controller.getUniqueStudentCounts);

module.exports = router;
