/*
 * noteApi.js — Axios API client
 * Centralizes all API calls so Vue components don't contain fetch logic.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
})

export const fetchNotes  = ()         => api.get('/notes')
export const createNote  = (data)     => api.post('/notes', data)
export const updateNote  = (id, data) => api.put(`/notes/${id}`, data)
export const deleteNote  = (id)       => api.delete(`/notes/${id}`)
