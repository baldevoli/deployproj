const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');

// Log that the users routes are being loaded
console.log('Loading user routes...');

// Basic CRUD routes
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

// Authentication routes
router.post('/signup', controller.create);
router.post('/login', controller.login);

// Print all routes for debugging
console.log('User routes configured:', 
  router.stack
    .filter(r => r.route)
    .map(r => `${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`)
);

module.exports = router;
