/*
 * Database connection — src/lib/db.js
 * ─────────────────────────────────────
 * Uses the pg Pool to manage connections efficiently.
 *
 * Why Pool instead of Client?
 * Pool maintains multiple connections and reuses them across requests.
 * This is critical for performance — creating a new DB connection for
 * every request is slow (takes ~100ms per connection).
 *
 * In Next.js, this module is imported by API routes and Server Components.
 * The Pool is created once and reused across all requests.
 */

import { Pool } from 'pg';

// Global pool singleton — prevents creating multiple pools in development
// (Next.js hot-reload creates new module instances, which would leak connections)
let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      host:     process.env.DB_HOST     || 'db',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 10,                    // max 10 connections in pool
      idleTimeoutMillis: 30000,   // close idle connections after 30s
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * Convenience helper: execute a query and return rows.
 * Usage: const rows = await query('SELECT * FROM posts WHERE id = $1', [id])
 */
export async function query(text, params) {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result;
}

/**
 * Initialize database: create tables if they don't exist.
 * Called once during app startup (in layout.jsx server component).
 */
export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS posts (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      content     TEXT         NOT NULL,
      author      VARCHAR(100) DEFAULT 'Anonymous',
      published   BOOLEAN      DEFAULT false,
      created_at  TIMESTAMP    DEFAULT NOW(),
      updated_at  TIMESTAMP    DEFAULT NOW()
    )
  `);
}
