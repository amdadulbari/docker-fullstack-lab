/**
 * TodoForm.jsx — Controlled form component for creating new todos.
 *
 * CONTROLLED COMPONENTS
 * ---------------------
 * In React, a "controlled component" is a form element whose value is driven
 * entirely by React state rather than by the DOM.  This means:
 *   1. The input value is always `title` (the state variable).
 *   2. Every keystroke triggers onChange → setTitle → re-render.
 *   3. React is the single source of truth for the input's current value.
 *
 * Contrast with an "uncontrolled component" where you would read the value
 * imperatively via a ref (ref.current.value) only when needed.  Controlled
 * components are preferred for forms because they enable real-time validation,
 * conditional disabling of the submit button, and easy clearing after submit.
 */

import { useState } from 'react'

/**
 * Props:
 *   onAdd(title: string) — called when the form is submitted with a non-empty title.
 */
export default function TodoForm({ onAdd }) {
  // `title` is the single piece of local state — it mirrors the input's value.
  const [title, setTitle] = useState('')

  function handleSubmit(e) {
    e.preventDefault() // prevent full-page reload

    const trimmed = title.trim()
    if (!trimmed) return // guard: never submit blank titles

    onAdd(trimmed)   // delegate creation logic to the parent (App)
    setTitle('')     // clear the input after a successful submit
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <input
        className="todo-form__input"
        type="text"
        placeholder="What needs to be done?"
        value={title}           // controlled: React owns the value
        onChange={(e) => setTitle(e.target.value)}
        maxLength={255}
        aria-label="New todo title"
        autoFocus
      />
      <button
        className="btn btn--primary"
        type="submit"
        disabled={title.trim() === ''}
        aria-label="Add todo"
      >
        Add Todo
      </button>
    </form>
  )
}
