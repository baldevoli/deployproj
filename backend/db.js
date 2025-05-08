// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Log database configuration (without password)
console.log('Database Configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
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
    process.exit(1);
  }
}

// Export query function and pool
module.exports = {
  query: (...args) => pool.query(...args),
  pool,
  testConnection
};
