const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all unique item types
router.get('/', async (req, res) => {
  try {
    const [types] = await db.promise().query('SELECT DISTINCT type FROM items WHERE type IS NOT NULL ORDER BY type');
    res.json(types.map(t => t.type));
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

module.exports = router; 