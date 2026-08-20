/**
 * Database Connection Pool
 *
 * WHY A POOL?
 * Opening a new database connection for every request takes ~50ms and
 * consumes server memory. A pool pre-opens N connections and reuses them.
 * This is the standard pattern for all production database connections.
 *
 * WHY NOT EXPORT A SINGLE CONNECTION?
 * A single connection can only execute one query at a time. Under load,
 * all requests would queue behind each other. A pool enables true concurrency.
 */
const { Pool } = require('pg');
const config = require('./index');

// Create the connection pool
// pg reads the DATABASE_URL connection string automatically
const pool = new Pool({
  connectionString: config.database.url,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Throw if can't connect within 2 seconds
  // SSL configuration (required for production deployments like Railway/AWS)
  ssl: config.server.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection on startup
// This fails loudly if DATABASE_URL is wrong — better to fail now than on first request
pool.on('connect', () => {
  console.log('✅ Database: New connection established from pool');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  // Don't exit the process — the pool will attempt to recover
});

/**
 * Execute a query using a pooled connection
 *
 * Usage:
 *   const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 *   result.rows = array of matching row objects
 *
 * WHY $1 placeholders and not string interpolation?
 *   NEVER do: `SELECT * FROM users WHERE email = '${email}'`
 *   This is SQL injection — an attacker can send:
 *   email = "'; DROP TABLE users; --"
 *   And destroy your database.
 *
 *   Parameterized queries ($1, $2, ...) are escaped by pg automatically.
 *   This is the ONLY safe way to include user data in SQL queries.
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    // Log slow queries (>100ms) for performance monitoring
    if (duration > 100) {
      console.warn(`⚠️  Slow query detected (${duration}ms):`, text.substring(0, 100));
    }
    return result;
  } catch (error) {
    console.error('Database query error:', {
      query: text.substring(0, 100),
      error: error.message,
    });
    throw error; // Re-throw so the service layer can handle it
  }
};

/**
 * Execute multiple queries in a transaction
 *
 * A transaction ensures that either ALL queries succeed or NONE do.
 * Use this for operations that modify multiple tables (e.g., creating a user
 * AND their default watchlist — if the watchlist creation fails, the user
 * creation must be rolled back too).
 *
 * Usage:
 *   const result = await transaction(async (client) => {
 *     const user = await client.query('INSERT INTO users ...', [...]);
 *     await client.query('INSERT INTO watchlists ...', [user.rows[0].id]);
 *     return user.rows[0];
 *   });
 */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error; // Re-throw after rollback
  } finally {
    // CRITICAL: Always release the client back to the pool
    // Forgetting this leaks connections and eventually deadlocks the server
    client.release();
  }
};

module.exports = { query, transaction, pool };
