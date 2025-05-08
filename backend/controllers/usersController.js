/**
 * Users Controller
 * 
 * Handles CRUD operations for user data in the inventory system.
 * This controller interfaces with the database to manage user information.
 */
const db = require('../db');

// Helper function to generate user ID
const generateUserId = (firstName, lastName) => {
  console.log('Generating ID for:', firstName, lastName);
  
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  // Generate 5 random numbers
  const randomNumbers = Math.floor(10000 + Math.random() * 90000);
  
  const userId = `${firstInitial}${lastInitial}${randomNumbers}`;
  console.log('Generated ID:', userId);
  return userId;
};

/**
 * Get all users
 * 
 * Retrieves a list of all users from the database.
 * No filtering or pagination is applied.
 */
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    console.log(`Retrieved ${rows.length} users`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

/**
 * Get a single user by ID
 * 
 * Retrieves detailed information for a specific user.
 * Returns 404 if the user doesn't exist.
 */
exports.getOne = async (req, res) => {
  const userId = req.params.id;
  console.log(`Fetching user with ID: ${userId}`);
  
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// User login authentication
exports.login = (req, res) => {
  console.log('Login attempt:', req.body);
  
  // Validate required fields
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const { email, password } = req.body;
  
  // Query the database for the user
  db.query(
    'SELECT * FROM users WHERE email = ? AND password = ?', 
    [email, password], 
    (err, rows) => {
      if (err) {
        console.error('Database error during login:', err);
        return res.status(500).json({ error: 'Database error during authentication' });
      }
      
      // Check if user exists with matching credentials
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // User found, return user data
      const user = rows[0];
      console.log('User authenticated:', user.user_id);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Authentication successful',
        user: userWithoutPassword
      });
    }
  );
};

/**
 * Create a new user
 * 
 * Adds a new user to the database with the provided information.
 * Requires at minimum a name and email.
 * Returns the newly created user's ID and data upon success.
 */
exports.create = async (req, res) => {
  console.log('Creating new user with data:', req.body);
  
  // Validate required fields
  const { name, email } = req.body;
  
  if (!name || !name.trim()) {
    console.error('Validation error: Missing name');
    return res.status(400).json({ error: 'Name is required' });
  }
  
  if (!email || !email.trim()) {
    console.error('Validation error: Missing email');
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Create data object for insertion
  const userData = {
    name: name.trim(),
    email: email.trim(),
    role: req.body.role || 'user',
    status: req.body.status || 'active'
  };
  
  console.log('Processed user data for insertion:', userData);
  
  try {
    const [result] = await db.query('INSERT INTO users SET ?', userData);
    
    console.log('User created successfully with ID:', result.insertId);
    res.status(201).json({ 
      message: 'User created successfully', 
      id: result.insertId,
      user: userData
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err });
  }
};

/**
 * Update an existing user
 * 
 * Updates user information based on the provided data.
 * Returns 404 if the user doesn't exist.
 */
exports.update = async (req, res) => {
  const userId = req.params.id;
  console.log(`Updating user with ID: ${userId}, data:`, req.body);
  
  // Validate required fields
  const { name, email } = req.body;
  
  if (!name || !name.trim()) {
    console.error('Validation error: Missing name');
    return res.status(400).json({ error: 'Name is required' });
  }
  
  if (!email || !email.trim()) {
    console.error('Validation error: Missing email');
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Create data object for update
  const userData = {
    name: name.trim(),
    email: email.trim(),
    role: req.body.role || 'user',
    status: req.body.status || 'active'
  };
  
  console.log('Processed user data for update:', userData);
  
  try {
    const [result] = await db.query('UPDATE users SET ? WHERE user_id = ?', [userData, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User updated successfully');
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err });
  }
};

/**
 * Delete a user
 * 
 * Removes a user from the database.
 * Returns 404 if the user doesn't exist.
 */
exports.remove = async (req, res) => {
  const userId = req.params.id;
  console.log(`Deleting user with ID: ${userId}`);
  
  try {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User deleted successfully');
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};
