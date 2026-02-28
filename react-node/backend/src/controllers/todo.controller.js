/**
 * todo.controller.js — Business logic for the /api/v1/todos resource.
 *
 * All functions follow the same pattern:
 *   1. Extract validated input from req.body / req.params.
 *   2. Run a parameterized SQL query via pool.query().
 *   3. Shape the result and send it.
 *   4. Forward any unexpected error to Express's global error handler via next(err).
 *
 * PARAMETERIZED QUERIES ($1, $2, ...)
 * ------------------------------------
 * PostgreSQL's parameterized queries send the SQL text and the parameter
 * values in separate protocol messages.  The database driver never does
 * string interpolation, so user-supplied values cannot alter the SQL
 * structure — this completely prevents SQL injection attacks.
 */

const { pool } = require('../config/db')

// ---------------------------------------------------------------------------
// LIST  GET /todos
// ---------------------------------------------------------------------------
const listTodos = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    )
    res.json({
      count: result.rowCount,
      todos: result.rows,
    })
  } catch (err) {
    next(err)
  }
}

// ---------------------------------------------------------------------------
// CREATE  POST /todos
// ---------------------------------------------------------------------------
const createTodo = async (req, res, next) => {
  try {
    const { title } = req.body

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required and must be a non-empty string' })
    }

    const result = await pool.query(
      `INSERT INTO todos (title)
       VALUES ($1)
       RETURNING *`,
      [title.trim()]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

// ---------------------------------------------------------------------------
// GET ONE  GET /todos/:id
// ---------------------------------------------------------------------------
const getTodo = async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Todo with id ${id} not found` })
    }

    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

// ---------------------------------------------------------------------------
// UPDATE  PUT /todos/:id
// ---------------------------------------------------------------------------
const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, completed } = req.body

    // Build the SET clause dynamically based on which fields were provided.
    // We always update updated_at so clients can detect the change.
    const fields  = []
    const values  = []
    let   paramIdx = 1

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'title must be a non-empty string' })
      }
      fields.push(`title = $${paramIdx++}`)
      values.push(title.trim())
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'completed must be a boolean' })
      }
      fields.push(`completed = $${paramIdx++}`)
      values.push(completed)
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Provide at least one field to update: title or completed' })
    }

    fields.push(`updated_at = NOW()`)
    values.push(id) // last placeholder is the WHERE clause

    const result = await pool.query(
      `UPDATE todos
          SET ${fields.join(', ')}
        WHERE id = $${paramIdx}
        RETURNING *`,
      values
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Todo with id ${id} not found` })
    }

    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

// ---------------------------------------------------------------------------
// DELETE  DELETE /todos/:id
// ---------------------------------------------------------------------------
const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params

    await pool.query('DELETE FROM todos WHERE id = $1', [id])

    // Idempotent: return success even if the row did not exist.
    res.json({ message: 'Todo deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
}
