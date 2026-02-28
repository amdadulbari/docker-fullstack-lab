<template>
  <div class="app">
    <!-- ------------------------------------------------------------------ -->
    <!-- Header -->
    <!-- ------------------------------------------------------------------ -->
    <header class="app-header">
      <div class="header-inner">
        <span class="header-icon">📝</span>
        <h1 class="header-title">Notes</h1>
        <span class="note-count" v-if="notes.length > 0">{{ notes.length }}</span>
      </div>
    </header>

    <!-- ------------------------------------------------------------------ -->
    <!-- Main content -->
    <!-- ------------------------------------------------------------------ -->
    <main class="app-main">

      <!-- New note form -->
      <NoteForm @note-added="handleCreate" />

      <!-- Error banner -->
      <div v-if="error" class="error-banner" role="alert">
        <span>{{ error }}</span>
        <button class="error-dismiss" @click="error = null" aria-label="Dismiss">✕</button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading notes…</p>
      </div>

      <!-- Notes list -->
      <NoteList
        v-else
        :notes="notes"
        @note-deleted="handleDelete"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchNotes, createNote, deleteNote } from './api/noteApi.js'
import NoteForm from './components/NoteForm.vue'
import NoteList from './components/NoteList.vue'

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------
const notes   = ref([])
const loading = ref(false)
const error   = ref(null)

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
const loadNotes = async () => {
  loading.value = true
  error.value   = null
  try {
    const res     = await fetchNotes()
    notes.value   = res.data.notes
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load notes. Is the backend running?'
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------
const handleCreate = async (noteData) => {
  error.value = null
  try {
    await createNote(noteData)
    await loadNotes()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create note.'
  }
}

const handleDelete = async (id) => {
  error.value = null
  try {
    await deleteNote(id)
    await loadNotes()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete note.'
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(loadNotes)
</script>

<style scoped>
/* ── App shell ─────────────────────────────────────────────────────────── */
.app {
  min-height: 100vh;
  background: #f5f0e8;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ── Header ────────────────────────────────────────────────────────────── */
.app-header {
  background: #1a1a2e;
  color: #ffffff;
  padding: 0 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.6rem;
  line-height: 1;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
}

.note-count {
  background: #e94560;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 8px;
  margin-left: 0.25rem;
}

/* ── Main ──────────────────────────────────────────────────────────────── */
.app-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* ── Error banner ──────────────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.error-dismiss {
  background: none;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 0.25rem;
  line-height: 1;
}

/* ── Loading ───────────────────────────────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
  color: #888;
  gap: 1rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #ddd;
  border-top-color: #1a1a2e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
