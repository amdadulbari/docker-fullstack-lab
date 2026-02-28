/**
 * TodoItem.jsx — Renders a single todo with toggle and delete controls.
 *
 * PROPS IN REACT
 * --------------
 * Props (short for "properties") are the mechanism by which a parent component
 * passes data and callbacks to a child component.  They flow in one direction:
 * parent → child.  A child never modifies its props directly; instead, it calls
 * a callback prop (e.g. onToggle, onDelete) to ask the parent to update state.
 *
 * Here the `todo` prop carries the data, while `onToggle` and `onDelete` carry
 * event handlers that live in App.jsx.  This keeps the source of truth
 * centralised in the parent and makes TodoItem a pure, reusable leaf component.
 *
 * Props shape:
 *   todo     — { id, title, completed, created_at, updated_at }
 *   onToggle(id: number, newCompleted: boolean) — called on checkbox change
 *   onDelete(id: number)                        — called on delete button click
 */

export default function TodoItem({ todo, onToggle, onDelete }) {
  const { id, title, completed } = todo

  return (
    <li className="todo-item" aria-label={`Todo: ${title}`}>
      {/* Checkbox — toggles the completed state by calling the parent handler */}
      <input
        className="todo-item__checkbox"
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id, !completed)}
        aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
      />

      {/* Title — strike-through when completed via CSS class */}
      <span
        className={`todo-item__title${completed ? ' todo-item__title--completed' : ''}`}
      >
        {title}
      </span>

      {/* Delete button */}
      <button
        className="todo-item__delete"
        onClick={() => onDelete(id)}
        aria-label={`Delete todo: ${title}`}
        title="Delete"
      >
        &times;
      </button>
    </li>
  )
}
