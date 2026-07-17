import { useEffect, useRef, useState } from 'react'
import TimerDisplay from './components/TimerDisplay.jsx'
import Controls from './components/Controls.jsx'
import ModeTabs from './components/ModeTabs.jsx'

// Length of each mode in seconds. A real Pomodoro is 25 min focus / 5 min break;
// the values are kept short-ish here so the timer is easy to demo in class.
const MODES = {
  focus: { label: 'Focus', seconds: 25 * 60 },
  short: { label: 'Short Break', seconds: 5 * 60 },
  long: { label: 'Long Break', seconds: 15 * 60 },
}

export default function App() {
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.seconds)
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(0)

  // Keep the interval id in a ref so re-renders don't lose track of it.
  const intervalRef = useRef(null)

  // Start / stop the one-second ticker whenever isRunning changes.
  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Timer finished: stop, count the session, and reset for the mode.
          clearInterval(intervalRef.current)
          setIsRunning(false)
          setCompleted((c) => c + 1)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  // Switching mode resets the clock and pauses.
  function switchMode(nextMode) {
    setMode(nextMode)
    setSecondsLeft(MODES[nextMode].seconds)
    setIsRunning(false)
  }

  function reset() {
    setSecondsLeft(MODES[mode].seconds)
    setIsRunning(false)
  }

  return (
    <main className="card">
      <h1>🍅 Pomodoro Timer</h1>
      <p className="subtitle">Single-stage dev build · Vite HMR live-reload</p>

      <ModeTabs modes={MODES} activeMode={mode} onSelect={switchMode} />

      <TimerDisplay secondsLeft={secondsLeft} total={MODES[mode].seconds} />

      <Controls
        isRunning={isRunning}
        onToggle={() => setIsRunning((r) => !r)}
        onReset={reset}
      />

      <p className="footer">
        Completed sessions: <strong>{completed}</strong>
      </p>
    </main>
  )
}
