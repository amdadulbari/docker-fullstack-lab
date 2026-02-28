/*
 * Posts Data Access — src/lib/posts.js
 * ──────────────────────────────────────
 * All database queries for posts live here.
 * API routes and Server Components import these functions.
 * This separation keeps SQL out of route handlers and components.
 */

import { query } from './db';

/** Fetch all posts, newest first */
export async function getAllPosts() {
  const result = await query(
    'SELECT * FROM posts ORDER BY created_at DESC'
  );
  return result.rows;
}

/** Fetch a single post by ID */
export async function getPostById(id) {
  const result = await query(
    'SELECT * FROM posts WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/** Create a new post */
export async function createPost({ title, content, author, published }) {
  const result = await query(
    `INSERT INTO posts (title, content, author, published)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, content, author || 'Anonymous', published ?? false]
  );
  return result.rows[0];
}

/** Update an existing post */
export async function updatePost(id, { title, content, author, published }) {
  const result = await query(
    `UPDATE posts
     SET title = COALESCE($1, title),
         content = COALESCE($2, content),
         author = COALESCE($3, author),
         published = COALESCE($4, published),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [title, content, author, published, id]
  );
  return result.rows[0] || null;
}

/** Delete a post by ID */
export async function deletePost(id) {
  const result = await query(
    'DELETE FROM posts WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}
