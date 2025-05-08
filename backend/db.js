// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Log database configuration (without password)
console.log('Database Configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

// Create a connection pool with default values
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'deployproj',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    // Don't exit the process, just log the error
    console.error('Database connection failed, but continuing...');
  }
}

// Export query function and pool
module.exports = {
  query: async (sql, params) => {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  pool,
  testConnection
};
