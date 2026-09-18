const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Prevent unhandled errors on idle clients
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client for Neon Database', err.stack);
  } else {
    console.log('Connected to Neon Database successfully!');
    if (release) release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
