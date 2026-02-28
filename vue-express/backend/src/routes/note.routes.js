import { Router } from 'express'
import {
  listNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote,
} from '../controllers/note.controller.js'

const router = Router()

// Collection routes
router.route('/notes')
  .get(listNotes)   // GET  /api/v1/notes
  .post(createNote) // POST /api/v1/notes

// Document routes
router.route('/notes/:id')
  .get(getNote)       // GET    /api/v1/notes/:id
  .put(updateNote)    // PUT    /api/v1/notes/:id
  .delete(deleteNote) // DELETE /api/v1/notes/:id

export default router
