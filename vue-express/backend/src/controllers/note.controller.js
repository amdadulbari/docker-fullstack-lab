import Note from '../models/note.model.js'

/**
 * Helper — normalise a CastError (invalid MongoDB ObjectId) into a 400 response.
 * All other errors are re-thrown to the global error handler.
 */
const handleError = (err, res) => {
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid note ID format' })
  }
  // Unknown error — let the global handler deal with it
  throw err
}

// GET /api/v1/notes
export const listNotes = async (req, res, next) => {
  try {
    const notes = await Note.find()
      .sort({ pinned: -1, createdAt: -1 }) // pinned first, then newest
    res.json({ count: notes.length, notes })
  } catch (err) {
    next(err)
  }
}

// POST /api/v1/notes
export const createNote = async (req, res, next) => {
  try {
    const { title, content, color, pinned } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }

    const note = await Note.create({ title, content, color, pinned })
    res.status(201).json(note)
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/notes/:id
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json(note)
  } catch (err) {
    try {
      handleError(err, res)
    } catch (unhandled) {
      next(unhandled)
    }
  }
}

// PUT /api/v1/notes/:id
export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json(note)
  } catch (err) {
    try {
      handleError(err, res)
    } catch (unhandled) {
      next(unhandled)
    }
  }
}

// DELETE /api/v1/notes/:id
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id)

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json({ message: 'Note deleted' })
  } catch (err) {
    try {
      handleError(err, res)
    } catch (unhandled) {
      next(unhandled)
    }
  }
}
