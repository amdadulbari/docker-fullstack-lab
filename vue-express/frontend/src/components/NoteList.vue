<template>
  <section class="note-list-section">

    <!-- Empty state -->
    <div v-if="!notes || notes.length === 0" class="empty-state">
      <span class="empty-icon">🗒️</span>
      <p class="empty-text">No notes yet. Add your first one above!</p>
    </div>

    <!-- Grid of note cards -->
    <div v-else class="notes-grid">
      <NoteCard
        v-for="note in notes"
        :key="note._id"
        :note="note"
        @delete="$emit('note-deleted', $event)"
      />
    </div>

  </section>
</template>

<script setup>
import NoteCard from './NoteCard.vue'

// ---------------------------------------------------------------------------
// Props & Emits
// ---------------------------------------------------------------------------
defineProps({
  notes: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['note-deleted'])
</script>

<style scoped>
.note-list-section {
  width: 100%;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 1rem;
  color: #aaa;
  gap: 0.75rem;
}

.empty-icon {
  font-size: 3rem;
}

.empty-text {
  font-size: 1.05rem;
  margin: 0;
}

/* Notes grid — responsive masonry-style layout */
.notes-grid {
  columns: 1;
  column-gap: 1.25rem;
}

@media (min-width: 480px) {
  .notes-grid { columns: 2; }
}

@media (min-width: 720px) {
  .notes-grid { columns: 3; }
}

@media (min-width: 960px) {
  .notes-grid { columns: 4; }
}
</style>
