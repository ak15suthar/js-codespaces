const { Pool } = require('pg');

// PostgreSQL connection pool
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB}`,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pgPool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Main database connection function
const connectDB = async () => {
  try {
    const client = await pgPool.connect();
    console.log('PostgreSQL Connected Successfully');
    client.release();
    return { type: 'postgresql', connection: pgPool };
  } catch (error) {
    console.error('PostgreSQL Connection Error:', error.message);
    process.exit(1);
  }
};

// Query helper for PostgreSQL
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pgPool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Query error', error);
    throw error;
  }
};

// Transaction helper
const getClient = () => pgPool.connect();

module.exports = { 
  connectDB, 
  pgPool, 
  query, 
  getClient
};