<template>
  <form class="note-form" @submit.prevent="submit">
    <div class="form-row">
      <!-- Title input -->
      <input
        v-model="title"
        type="text"
        class="form-input"
        placeholder="Note title…"
        maxlength="200"
        required
        aria-label="Note title"
      />

      <!-- Color picker -->
      <select
        v-model="color"
        class="form-select"
        aria-label="Note color"
      >
        <option value="yellow">Yellow</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="pink">Pink</option>
        <option value="white">White</option>
      </select>

      <!-- Submit -->
      <button type="submit" class="form-btn" :disabled="!title.trim()">
        + Add Note
      </button>
    </div>

    <!-- Optional content textarea -->
    <textarea
      v-model="content"
      class="form-textarea"
      placeholder="Note content (optional)…"
      rows="2"
      aria-label="Note content"
    ></textarea>
  </form>
</template>

<script setup>
import { ref } from 'vue'

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------
const emit = defineEmits(['note-added'])

// ---------------------------------------------------------------------------
// Local form state
// ---------------------------------------------------------------------------
const title   = ref('')
const content = ref('')
const color   = ref('yellow')

// ---------------------------------------------------------------------------
// Submit handler
// ---------------------------------------------------------------------------
const submit = () => {
  if (!title.value.trim()) return

  emit('note-added', {
    title:   title.value.trim(),
    content: content.value.trim(),
    color:   color.value,
  })

  // Reset form
  title.value   = ''
  content.value = ''
  color.value   = 'yellow'
}
</script>

<style scoped>
.note-form {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.form-input {
  flex: 1 1 200px;
  padding: 0.6rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #1a1a2e;
}

.form-select {
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.form-select:focus {
  border-color: #1a1a2e;
}

.form-btn {
  padding: 0.6rem 1.2rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  white-space: nowrap;
}

.form-btn:hover:not(:disabled) {
  background: #e94560;
}

.form-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.form-textarea {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: #1a1a2e;
}
</style>
