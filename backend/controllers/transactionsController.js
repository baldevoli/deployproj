const db = require('../db');

// Get all transactions
exports.getAll = async (req, res) => {
  const query = `
    SELECT t.*, i.product_name, i.type, CONCAT(u.first_name, ' ', u.last_name) AS username
    FROM transactions t
    JOIN items i ON t.product_id = i.product_id
    JOIN users u ON t.user_id = u.user_id
    ORDER BY t.taken_at DESC
  `;

  try {
    const rows = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Get transactions for a specific user
exports.getByUser = async (req, res) => {
  const query = `
    SELECT t.*, i.product_name, i.type
    FROM transactions t
    JOIN items i ON t.product_id = i.product_id
    WHERE t.user_id = ?
    ORDER BY t.taken_at DESC
  `;

  try {
    const rows = await db.query(query, [req.params.user_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user transactions:', err);
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
};

// Create a new transaction
exports.create = async (req, res) => {
  const { user_id, product_id, quantity_taken } = req.body;

  if (!user_id || !product_id || !quantity_taken) {
    return res.status(400).json({
      error: 'All fields are required: user_id, product_id, quantity_taken'
    });
  }

  try {
    // Step 1: Look up the user from the database
    const userResults = await db.query('SELECT status FROM users WHERE user_id = ?', [user_id]);
    
    if (userResults.length === 0) {
      console.error('User lookup failed: User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResults[0];

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

    const result = await db.query(insertQuery, [user_id, product_id, quantity_taken, user_status]);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction_id: result.insertId
    });
  } catch (err) {
    console.error('Failed to create transaction:', err);
    res.status(500).json({
      error: 'Failed to create transaction',
      details: err.message || err.sqlMessage || JSON.stringify(err)
    });
  }
};

// Get most taken items
exports.getMostTaken = async (req, res) => {
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
  try {
    const rows = await db.query(query);
    console.log('Most taken items result:', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching most taken items:', err);
    res.status(500).json({ error: 'Failed to fetch most taken items' });
  }
};

// Get unique student counts by status
exports.getUniqueStudentCounts = async (req, res) => {
  const query = `
    SELECT 
      user_status,
      COUNT(DISTINCT user_id) as count
    FROM transactions
    GROUP BY user_status
  `;

  try {
    const rows = await db.query(query);

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
  } catch (err) {
    console.error('Error fetching student counts:', err);
    res.status(500).json({ error: 'Failed to fetch student counts' });
  }
};
