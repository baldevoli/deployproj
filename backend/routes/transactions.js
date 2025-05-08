const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionsController');

// Add debug logging for this router
router.use((req, res, next) => {
  console.log('Transactions route accessed:', req.method, req.path);
  next();
});

router.get('/', controller.getAll);
router.get('/most-taken', controller.getMostTaken);
router.get('/unique-students', controller.getUniqueStudentCounts);
router.get('/:user_id', controller.getByUser);
router.post('/', controller.create);

module.exports = router;
