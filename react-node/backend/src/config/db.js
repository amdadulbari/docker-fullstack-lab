/**
 * db.js — PostgreSQL connection pool configuration
 *
 * WHY A POOL INSTEAD OF A SINGLE CLIENT?
 * ---------------------------------------
 * A single `pg.Client` opens exactly one TCP connection to PostgreSQL.
 * That means every concurrent request that arrives while one query is
 * running must wait in line.  Under any real load that becomes a bottleneck.
 *
 * `pg.Pool` maintains a reusable set of pre-opened connections
 * (default: up to 10).  Each call to pool.query() borrows a connection,
 * runs the query, then immediately returns it to the pool for the next
 * caller.  Benefits:
 *   - Parallel queries execute concurrently across multiple connections.
 *   - Connections are established once and reused, avoiding the per-request
 *     TCP + TLS + authentication overhead.
 *   - Idle connections are automatically closed after idleTimeoutMillis.
 *   - The pool integrates pg's built-in error-recovery (reconnects on
 *     connection loss).
 */

const { Pool } = require('pg')

// Pool reads DB_* variables from process.env (populated by dotenv in server.js).
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  user:     process.env.DB_USER     || 'todouser',
  password: process.env.DB_PASSWORD || 'todopassword',
  database: process.env.DB_NAME     || 'tododb',
  // Keep idle connections alive for 30 seconds before closing them.
  idleTimeoutMillis: 30_000,
  // Fail fast if a new connection cannot be established within 2 seconds.
  connectionTimeoutMillis: 2_000,
})

// Surface connection errors that occur outside of a query (e.g. idle socket drops).
pool.on('error', (err) => {
  console.error('[db] Unexpected pool client error:', err.message)
})

/**
 * initDb — creates the todos table if it does not already exist.
 * Called once at application startup (see server.js) so the app is
 * self-bootstrapping: no separate migration step is needed for dev/demo use.
 *
 * In a production project you would replace this with a proper migration tool
 * such as Flyway, Liquibase, or node-pg-migrate.
 */
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id         SERIAL       PRIMARY KEY,
      title      VARCHAR(255) NOT NULL,
      completed  BOOLEAN      DEFAULT FALSE,
      created_at TIMESTAMP    DEFAULT NOW(),
      updated_at TIMESTAMP    DEFAULT NOW()
    )
  `)
  console.log('[db] todos table ready')
}

module.exports = { pool, initDb }
