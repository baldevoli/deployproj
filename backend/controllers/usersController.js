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

exports.getAll = (req, res) => {
  db.query('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getOne = (req, res) => {
  db.query('SELECT * FROM users WHERE user_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows[0]);
  });
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

exports.create = (req, res) => {
  console.log('Create user called with data:', req.body);
  
  // Validate required fields
  const requiredFields = ['first_name', 'last_name', 'email', 'password', 'status'];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      console.log(`Missing required field: ${field}`);
      return res.status(400).json({ error: `${field.replace('_', ' ')} is required` });
    }
  }

  try {
    // Copy the request body
    const userData = {...req.body};
    console.log('User data after copy:', userData);
    
    // Generate custom user ID from first and last name
    userData.user_id = generateUserId(userData.first_name, userData.last_name);
    console.log('Final user data with ID:', userData);
    
    // Insert user with the generated ID
    db.query('INSERT INTO users SET ?', userData, (err, result) => {
      if (err) {
        console.error('Database error during user creation:', err);
        
        // Handle specific MySQL errors
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.sqlMessage.includes('email')) {
            console.log('Duplicate email error');
            return res.status(409).json({ error: 'Email already registered' });
          } else {
            console.log('Duplicate user ID error');
            // Try a different ID
            userData.user_id = generateUserId(userData.first_name, userData.last_name) + Math.floor(Math.random() * 10);
            console.log('Generated alternative ID:', userData.user_id);
            
            // Try again with new ID
            db.query('INSERT INTO users SET ?', userData, (err2, result2) => {
              if (err2) {
                console.error('Second attempt failed:', err2);
                return res.status(500).json({ 
                  error: 'Database error during registration',
                  details: err2.message
                });
              }
              console.log('Second attempt successful:', result2);
              return res.status(201).json({ 
                message: 'User registered',
                user_id: userData.user_id
              });
            });
            return;
          }
        }
        
        return res.status(500).json({ 
          error: 'Database error during registration',
          details: err.message,
          code: err.code
        });
      }
      
      console.log('User successfully created:', result);
      res.status(201).json({ 
        message: 'User registered',
        user_id: userData.user_id
      });
    });
  } catch (error) {
    console.error('Exception during user creation:', error);
    res.status(500).json({ 
      error: 'Server error during user creation',
      details: error.message,
      stack: error.stack
    });
  }
};

exports.update = (req, res) => {
  db.query('UPDATE users SET ? WHERE user_id = ?', [req.body, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated' });
  });
};

exports.remove = (req, res) => {
  db.query('DELETE FROM users WHERE user_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
  });
};
