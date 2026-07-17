import { useState } from 'react'

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other']

export default function ExpenseForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])

  function handleSubmit(e) {
    e.preventDefault()
    const value = parseFloat(amount)
    // Basic validation: need a title and a positive amount.
    if (!title.trim() || Number.isNaN(value) || value <= 0) return

    onAdd({ title: title.trim(), amount: value, category })
    setTitle('')
    setAmount('')
    setCategory(CATEGORIES[0])
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        placeholder="What did you spend on?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="row">
        <input
          className="input amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button className="btn primary" type="submit">
        Add Expense
      </button>
    </form>
  )
}
