/**
 * App.jsx — Root application component.
 *
 * State:
 *   todos   — array of todo objects fetched from the backend.
 *   loading — boolean; true while the initial fetch is in flight.
 *   error   — string | null; holds an error message when any API call fails.
 *
 * Data flow (unidirectional):
 *   App owns all state and passes read-only data down to child components.
 *   Children call handler functions passed as props to request state changes.
 *   App updates state after confirming the API call succeeded.
 */

import { useState, useEffect } from 'react'
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from './api/todoApi'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import './App.css'

export default function App() {
  const [todos,   setTodos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // -------------------------------------------------------------------------
  // Load todos on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    loadTodos()
  }, [])

  async function loadTodos() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchTodos()
      setTodos(res.data.todos)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------------------
  // Create
  // -------------------------------------------------------------------------
  async function handleCreate(title) {
    try {
      setError(null)
      const res = await createTodo({ title })
      // Prepend so the newest item appears at the top without re-fetching.
      setTodos((prev) => [res.data, ...prev])
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create todo')
    }
  }

  // -------------------------------------------------------------------------
  // Toggle completed
  // -------------------------------------------------------------------------
  async function handleUpdate(id, data) {
    try {
      setError(null)
      const res = await updateTodo(id, data)
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? res.data : todo))
      )
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update todo')
    }
  }

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------
  async function handleDelete(id) {
    try {
      setError(null)
      await deleteTodo(id)
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete todo')
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Todo App</h1>
        <p className="app-subtitle">React + Express + PostgreSQL</p>
      </header>

      <main className="app-main">
        <TodoForm onAdd={handleCreate} />

        {error && (
          <div className="error-banner" role="alert">
            <strong>Error:</strong> {error}
            <button className="error-dismiss" onClick={() => setError(null)}>
              &times;
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner" aria-label="Loading todos">
            <div className="spinner" />
            <span>Loading todos...</span>
          </div>
        ) : (
          <TodoList
            todos={todos}
            onToggle={(id, completed) => handleUpdate(id, { completed })}
            onDelete={handleDelete}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>{todos.length} {todos.length === 1 ? 'todo' : 'todos'} total</p>
      </footer>
    </div>
  )
}
