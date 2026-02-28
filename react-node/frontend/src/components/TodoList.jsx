/**
 * TodoList.jsx — Renders the list of todo items.
 *
 * This component is "presentational" — it holds no state of its own and
 * simply maps the `todos` prop to a series of TodoItem components.
 * All interaction handlers come from the parent (App) via props.
 */

import TodoItem from './TodoItem'

/**
 * Props:
 *   todos    — array of todo objects from the backend.
 *   onToggle(id, completed) — called when a checkbox is toggled.
 *   onDelete(id)            — called when the delete button is clicked.
 */
export default function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="todo-list__empty" role="status">
        No todos yet — add one above!
      </div>
    )
  }

  return (
    <ul className="todo-list" role="list" aria-label="Todo list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
