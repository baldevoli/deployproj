const db = require('../db');

// Get all transactions
exports.getAll = (req, res) => {
  const query = `
    SELECT t.*, i.product_name, i.type, CONCAT(u.first_name, ' ', u.last_name) AS username
    FROM transactions t
    JOIN items i ON t.product_id = i.product_id
    JOIN users u ON t.user_id = u.user_id
    ORDER BY t.taken_at DESC
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
    res.json(rows);
  });
};

// Get transactions for a specific user
exports.getByUser = (req, res) => {
  const query = `
    SELECT t.*, i.product_name, i.type
    FROM transactions t
    JOIN items i ON t.product_id = i.product_id
    WHERE t.user_id = ?
    ORDER BY t.taken_at DESC
  `;

  db.query(query, [req.params.user_id], (err, rows) => {
    if (err) {
      console.error('Error fetching user transactions:', err);
      return res.status(500).json({ error: 'Failed to fetch user transactions' });
    }
    res.json(rows);
  });
};

// Create a new transaction
exports.create = (req, res) => {
  const { user_id, product_id, quantity_taken } = req.body;

  if (!user_id || !product_id || !quantity_taken) {
    return res.status(400).json({
      error: 'All fields are required: user_id, product_id, quantity_taken'
    });
  }

  // Step 1: Look up the user from the database
  const userQuery = 'SELECT status FROM users WHERE user_id = ?';

  db.query(userQuery, [user_id], (err, results) => {
    if (err || results.length === 0) {
      console.error('User lookup failed:', err);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];

    // Step 2: Normalize and validate user status
    if (!user.status) {
      return res.status(400).json({ error: 'User status is missing' });
    }

    const user_status = user.status.toLowerCase(); // 'Graduate' → 'graduate'

    // Step 3: Insert the transaction
    const insertQuery = `
      INSERT INTO transactions (user_id, product_id, quantity_taken, user_status)
      VALUES (?, ?, ?, ?)
    `;

    console.log('Inserting transaction:', {
      user_id, product_id, quantity_taken, user_status
    });

    db.query(insertQuery, [user_id, product_id, quantity_taken, user_status], (err, result) => {
      if (err) {
        console.error('Failed to create transaction:', err);
        return res.status(500).json({
          error: 'Failed to create transaction',
          details: err.message || err.sqlMessage || JSON.stringify(err)
        });
      }

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction_id: result.insertId
      });
    });
  });
};

// Get most taken items
exports.getMostTaken = (req, res) => {
  const query = `
    WITH TransactionCounts AS (
      SELECT 
        i.product_id,
        i.product_name,
        i.type,
        COUNT(*) as total_transactions,
        RANK() OVER (ORDER BY COUNT(*) DESC) as ranking
      FROM transactions t
      JOIN items i ON t.product_id = i.product_id
      GROUP BY i.product_id, i.product_name, i.type
    )
    SELECT *
    FROM TransactionCounts
    WHERE ranking <= 10
    ORDER BY ranking ASC, product_name ASC
  `;

  console.log('Fetching most taken items...');
  db.query(query, (err, rows) => {
    if (err) {
      console.error('Error fetching most taken items:', err);
      return res.status(500).json({ error: 'Failed to fetch most taken items' });
    }
    console.log('Most taken items result:', rows);
    res.json(rows);
  });
};

// Get unique student counts by status
exports.getUniqueStudentCounts = (req, res) => {
  const query = `
    SELECT 
      user_status,
      COUNT(DISTINCT user_id) as count
    FROM transactions
    GROUP BY user_status
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error('Error fetching student counts:', err);
      return res.status(500).json({ error: 'Failed to fetch student counts' });
    }

    const counts = {
      undergraduate_count: 0,
      graduate_count: 0
    };

    if (Array.isArray(rows)) {
      rows.forEach(row => {
        if (row.user_status && row.count) {
          if (row.user_status.toLowerCase() === 'undergraduate') {
            counts.undergraduate_count = parseInt(row.count);
          } else if (row.user_status.toLowerCase() === 'graduate') {
            counts.graduate_count = parseInt(row.count);
          }
        }
      });
    }

    res.json(counts);
  });
};
