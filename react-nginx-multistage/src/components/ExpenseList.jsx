export default function ExpenseList({ expenses, onRemove }) {
  if (expenses.length === 0) {
    return <p className="empty">No expenses yet. Add your first one above.</p>
  }

  return (
    <ul className="list">
      {expenses.map((e) => (
        <li key={e.id} className="item">
          <div>
            <span className="item-title">{e.title}</span>
            <span className="tag">{e.category}</span>
          </div>
          <div className="item-right">
            <span className="item-amount">${e.amount.toFixed(2)}</span>
            <button
              className="remove"
              onClick={() => onRemove(e.id)}
              aria-label={`Remove ${e.title}`}
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
