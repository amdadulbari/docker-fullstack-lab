<template>
  <article
    class="note-card"
    :style="{ backgroundColor: cardColor }"
    :class="{ 'note-card--pinned': note.pinned }"
  >
    <!-- Pin badge -->
    <span v-if="note.pinned" class="pin-badge" aria-label="Pinned">📌</span>

    <!-- Card body -->
    <div class="card-body">
      <h3 class="card-title">{{ note.title }}</h3>
      <p v-if="note.content" class="card-content">{{ note.content }}</p>
    </div>

    <!-- Card footer -->
    <footer class="card-footer">
      <time class="card-date" :datetime="note.createdAt">
        {{ formattedDate }}
      </time>
      <button
        class="delete-btn"
        @click="$emit('delete', note._id)"
        :aria-label="`Delete note: ${note.title}`"
        title="Delete note"
      >
        🗑
      </button>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'

// ---------------------------------------------------------------------------
// Props & Emits
// ---------------------------------------------------------------------------
const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
})

defineEmits(['delete'])

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

/** Map note.color to an actual CSS background color. */
const cardColor = computed(() => {
  const palette = {
    yellow: '#fff9c4',
    blue:   '#bbdefb',
    green:  '#c8e6c9',
    pink:   '#f8bbd9',
    white:  '#ffffff',
  }
  return palette[props.note.color] ?? palette.yellow
})

/** Human-readable creation date. */
const formattedDate = computed(() => {
  if (!props.note.createdAt) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  }).format(new Date(props.note.createdAt))
})
</script>

<style scoped>
.note-card {
  break-inside: avoid;          /* prevent column break inside the card */
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.25rem;
  box-shadow: 2px 3px 8px rgba(0, 0, 0, 0.12);
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.note-card:hover {
  transform: translateY(-3px) rotate(-0.5deg);
  box-shadow: 4px 6px 16px rgba(0, 0, 0, 0.18);
}

.note-card--pinned {
  outline: 2px dashed rgba(0, 0, 0, 0.25);
}

/* Pin badge */
.pin-badge {
  position: absolute;
  top: -6px;
  right: 10px;
  font-size: 1rem;
}

/* Body */
.card-body {
  flex: 1;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.4rem;
  line-height: 1.3;
  word-break: break-word;
}

.card-content {
  font-size: 0.85rem;
  color: #444;
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.card-date {
  font-size: 0.72rem;
  color: #777;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s;
  line-height: 1;
}

.delete-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
</style>
