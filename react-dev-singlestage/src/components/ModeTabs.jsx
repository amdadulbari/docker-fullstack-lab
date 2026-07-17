export default function ModeTabs({ modes, activeMode, onSelect }) {
  return (
    <div className="tabs">
      {Object.entries(modes).map(([key, { label }]) => (
        <button
          key={key}
          className={`tab ${key === activeMode ? 'active' : ''}`}
          onClick={() => onSelect(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
