import { useEffect, useMemo, useState } from 'react'
import ExpenseForm from './components/ExpenseForm.jsx'
import ExpenseList from './components/ExpenseList.jsx'
import Summary from './components/Summary.jsx'

const STORAGE_KEY = 'expense-tracker.items'

// A couple of seed rows so the app is not empty on first load.
const SEED = [
  { id: 1, title: 'Groceries', amount: 42.5, category: 'Food' },
  { id: 2, title: 'Bus pass', amount: 30, category: 'Transport' },
]

// Load persisted expenses from localStorage, falling back to the seed data.
function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : SEED
  } catch {
    return SEED
  }
}

export default function App() {
  const [expenses, setExpenses] = useState(loadInitial)

  // Persist to localStorage whenever the list changes. This is why the app
  // needs no backend — the browser stores the data.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  }, [expenses])

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  )

  function addExpense(expense) {
    setExpenses((prev) => [
      { ...expense, id: prev.length ? Math.max(...prev.map((e) => e.id)) + 1 : 1 },
      ...prev,
    ])
  }

  function removeExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <main className="card">
      <header>
        <h1>💸 Expense Tracker</h1>
        <p className="subtitle">Multi-stage production build · served by nginx</p>
      </header>

      <Summary total={total} count={expenses.length} />
      <ExpenseForm onAdd={addExpense} />
      <ExpenseList expenses={expenses} onRemove={removeExpense} />
    </main>
  )
}
