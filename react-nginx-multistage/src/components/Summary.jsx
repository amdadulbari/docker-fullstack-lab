export default function Summary({ total, count }) {
  return (
    <div className="summary">
      <div>
        <span className="summary-label">Total spent</span>
        <span className="summary-total">${total.toFixed(2)}</span>
      </div>
      <span className="summary-count">
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  )
}
