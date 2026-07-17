export default function Controls({ isRunning, onToggle, onReset }) {
  return (
    <div className="controls">
      <button className="btn primary" onClick={onToggle}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button className="btn" onClick={onReset}>
        Reset
      </button>
    </div>
  )
}
