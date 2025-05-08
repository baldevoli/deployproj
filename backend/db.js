const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1095',
  database: process.env.DB_NAME || 'retriever_essential',
});

db.connect((err) => {
  if (err) console.error(' MySQL connection error:', err);
  else console.log('Connected to MySQL');
});

module.exports = db;
