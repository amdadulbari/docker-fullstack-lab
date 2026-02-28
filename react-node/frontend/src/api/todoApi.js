/*
 * todoApi.js — Axios API client
 *
 * All API calls are centralized here so components don't deal with URLs,
 * HTTP methods, or response shapes.  If the backend URL ever changes, only
 * this file needs updating.
 *
 * VITE_API_URL is set at build time from the environment (prefix VITE_ is
 * required for Vite to expose variables to the browser bundle).
 * Falls back to '/api/v1' so the Vite dev-server proxy handles routing.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  // Attach Content-Type automatically for POST/PUT bodies.
  headers: {
    'Content-Type': 'application/json',
  },
})

// ---------------------------------------------------------------------------
// Named exports — one function per REST operation.
// Each function returns the raw Axios promise; callers await it and access
// the `.data` property for the response body.
// ---------------------------------------------------------------------------

/** Fetch all todos ordered by created_at DESC. */
export const fetchTodos = () => api.get('/todos')

/** Create a new todo. data: { title: string } */
export const createTodo = (data) => api.post('/todos', data)

/** Fetch a single todo by id. */
export const fetchTodo = (id) => api.get(`/todos/${id}`)

/** Update a todo. data: { title?: string, completed?: boolean } */
export const updateTodo = (id, data) => api.put(`/todos/${id}`, data)

/** Delete a todo by id. */
export const deleteTodo = (id) => api.delete(`/todos/${id}`)
