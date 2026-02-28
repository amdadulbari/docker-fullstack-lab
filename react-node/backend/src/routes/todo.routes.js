/**
 * todo.routes.js — Express router for the /api/v1/todos resource.
 *
 * Route map:
 *   GET    /todos        → listTodos   — return all todos (newest first)
 *   POST   /todos        → createTodo  — create a new todo
 *   GET    /todos/:id    → getTodo     — return a single todo by primary key
 *   PUT    /todos/:id    → updateTodo  — update title and/or completed flag
 *   DELETE /todos/:id    → deleteTodo  — remove a todo
 *
 * This router is mounted at /api/v1 in app.js, so the full paths are:
 *   GET    /api/v1/todos
 *   POST   /api/v1/todos
 *   GET    /api/v1/todos/:id
 *   PUT    /api/v1/todos/:id
 *   DELETE /api/v1/todos/:id
 */

const { Router } = require('express')
const {
  listTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todo.controller')

const router = Router()

router.get('/',     listTodos)
router.post('/',    createTodo)
router.get('/:id',  getTodo)
router.put('/:id',  updateTodo)
router.delete('/:id', deleteTodo)

module.exports = router
